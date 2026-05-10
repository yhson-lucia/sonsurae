---
title: JDBC Template
slug: jdbc-template
category: jdbc
summary: 스프링의 JdbcTemplate 사용법, BeanPropertyRowMapper, SimpleJdbcInsert 활용
tags: [jdbc, spring, jdbc-template, repository, sql]
sort_order: null
created: 2025-01-17
updated: 2026-05-10
---

## 1. JdbcTemplate 설정

- `JdbcTemplate`은 `spring-jdbc` 라이브러리에 포함되어 있어 복잡한 설정 없이 바로 사용 가능
- `build.gradle`에 `org.springframework.boot:spring-boot-starter-jdbc`를 추가하면 `JdbcTemplate`이 들어 있는 `spring-jdbc`가 라이브러리에 포함됨
- **템플릿 콜백 패턴**으로 JDBC 직접 사용 시 발생하는 반복 작업을 대신 처리해 줌
- 개발자는 SQL 작성, 파라미터 정의, 응답 매핑만 수행

대신 처리해 주는 반복 작업

- 커넥션 획득
- Statement 준비 및 실행
- 결과 반복 루프
- 커넥션 / Statement / ResultSet 종료
- 트랜잭션을 위한 커넥션 동기화
- 예외 발생 시 스프링 예외 변환기 실행

```java
package hello.itemservice.repository.jdbctemplate;

import hello.itemservice.domain.Item;
import hello.itemservice.repository.ItemRepository;
import hello.itemservice.repository.ItemSearchCond;
import hello.itemservice.repository.ItemUpdateDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;

import javax.sql.DataSource;
import java.sql.PreparedStatement;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Slf4j
@Repository
public class JdbcTemplateItemRepositoryV1 implements ItemRepository {

    private final JdbcTemplate template;

    // JdbcTemplate은 DataSource를 의존관계 주입으로 받고, 생성자 내부에서 JdbcTemplate을 생성
    public JdbcTemplateItemRepositoryV1(DataSource dataSource) {
        this.template = new JdbcTemplate(dataSource);
    }

    @Override
    public Item save(Item item) {
        String sql = "insert into item (item_name, price, quantity) values (?, ?, ?)";

        // PK인 id는 DB가 직접 증가시키는 identity(auto increment) 방식.
        // INSERT 후 DB가 생성한 PK 값을 KeyHolder로 조회
        KeyHolder keyHolder = new GeneratedKeyHolder();

        template.update(connection -> {
            // template.update()는 INSERT/UPDATE/DELETE 등 데이터 변경 시 사용. 반환값은 영향받은 row 수
            PreparedStatement ps = connection.prepareStatement(sql, new String[]{"id"});
            ps.setString(1, item.getItemName());
            ps.setInt(2, item.getPrice());
            ps.setInt(3, item.getQuantity());
            return ps;
        }, keyHolder);

        long key = keyHolder.getKey().longValue();
        item.setId(key);
        return item;
    }

    @Override
    public void update(Long itemId, ItemUpdateDto updateParam) {
        String sql = "update item set item_name=?, price=?, quantity=? where id=?";

        // ?에 바인딩할 파라미터를 순서대로 전달. 반환값은 영향받은 row 수 (여기서는 최대 1)
        template.update(sql,
                updateParam.getItemName(),
                updateParam.getPrice(),
                updateParam.getQuantity(),
                itemId);
    }

    @Override
    public Optional<Item> findById(Long id) {
        String sql = "select id, item_name, price, quantity from item where id = ?";

        try {
            // queryForObject: 결과 row가 1개일 때 사용
            // 결과 0개: EmptyResultDataAccessException
            // 결과 2개 이상: IncorrectResultSizeDataAccessException
            Item item = template.queryForObject(sql, itemRowMapper(), id);
            return Optional.of(item);
        } catch (EmptyResultDataAccessException e) {
            // findById 인터페이스가 Optional을 반환하므로, 결과 없음을 Optional.empty로 변환
            return Optional.empty();
        }
    }

    @Override
    public List<Item> findAll(ItemSearchCond cond) {
        String itemName = cond.getItemName();
        Integer maxPrice = cond.getMaxPrice();

        String sql = "select id, item_name, price, quantity from item";
        // 동적 쿼리
        if (StringUtils.hasText(itemName) || maxPrice != null) {
            sql += " where";
        }

        boolean andFlag = false;
        List<Object> param = new ArrayList<>();
        if (StringUtils.hasText(itemName)) {
            sql += " item_name like concat('%',?,'%')";
            param.add(itemName);
            andFlag = true;
        }
        if (maxPrice != null) {
            if (andFlag) {
                sql += " and";
            }
            sql += " price <= ?";
            param.add(maxPrice);
        }

        log.info("sql={}", sql);
        // query: 결과가 0개 이상일 때 사용. 결과가 없으면 빈 컬렉션 반환
        return template.query(sql, itemRowMapper(), param.toArray());
    }

    private RowMapper<Item> itemRowMapper() {
        // ResultSet을 객체로 변환. JdbcTemplate이 루프를 돌리고 개발자는 각 row 매핑만 작성
        return (rs, rowNum) -> {
            Item item = new Item();
            item.setId(rs.getLong("id"));
            item.setItemName(rs.getString("item_name"));
            item.setPrice(rs.getInt("price"));
            item.setQuantity(rs.getInt("quantity"));
            return item;
        };
    }
}
```

## 2. BeanPropertyRowMapper

`ResultSet`의 결과를 받아서 JavaBean 규약에 맞춰 데이터를 변환함.

```java
private RowMapper<Item> itemRowMapper() {
    return BeanPropertyRowMapper.newInstance(Item.class);  // camelCase 변환 지원
}
```

위와 같이 사용하면, 다음 코드를 자동으로 수행함.

```java
Item item = new Item();
item.setId(rs.getLong("id"));
item.setPrice(rs.getInt("price"));
```

DB에서 조회한 컬럼명을 기반으로 `setId()`, `setPrice()` 같은 JavaBean property 메서드를 호출함.

- **별칭**: `item_name`은 `setItem_name()`이라는 메서드가 없으므로 SQL에서 `select item_name as itemName`으로 별칭을 줘야 함
- **snake_case → camelCase**: 자동으로 해결되므로 그대로 두어도 문제없음

## 3. SimpleJdbcInsert

`JdbcTemplate`은 INSERT SQL을 직접 작성하지 않아도 되도록 `SimpleJdbcInsert`라는 편리한 기능을 제공함.

```java
package hello.itemservice.repository.jdbctemplate;

import hello.itemservice.domain.Item;
import hello.itemservice.repository.ItemRepository;
import hello.itemservice.repository.ItemSearchCond;
import hello.itemservice.repository.ItemUpdateDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.BeanPropertySqlParameterSource;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.core.namedparam.SqlParameterSource;
import org.springframework.jdbc.core.simple.SimpleJdbcInsert;
import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;

import javax.sql.DataSource;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Repository
public class JdbcTemplateItemRepositoryV3 implements ItemRepository {

    private final NamedParameterJdbcTemplate template;
    private final SimpleJdbcInsert jdbcInsert;

    public JdbcTemplateItemRepositoryV3(DataSource dataSource) {
        this.template = new NamedParameterJdbcTemplate(dataSource);

        // SimpleJdbcInsert는 내부에서 생성. DataSource는 의존관계 주입
        this.jdbcInsert = new SimpleJdbcInsert(dataSource)
                .withTableName("item")                                      // 저장할 테이블 명
                .usingGeneratedKeyColumns("id")                             // PK 컬럼명
                .usingColumns("item_name", "price", "quantity");            // INSERT 대상 컬럼 (생략 가능)
    }

    @Override
    public Item save(Item item) {
        SqlParameterSource param = new BeanPropertySqlParameterSource(item);
        Number key = jdbcInsert.executeAndReturnKey(param);
        item.setId(key.longValue());
        return item;   // save 부분이 매우 간결해짐
    }

    @Override
    public void update(Long itemId, ItemUpdateDto updateParam) {
        String sql = "update item " +
                "set item_name=:itemName, price=:price, quantity=:quantity " +
                "where id=:id";

        SqlParameterSource param = new MapSqlParameterSource()
                .addValue("itemName", updateParam.getItemName())
                .addValue("price", updateParam.getPrice())
                .addValue("quantity", updateParam.getQuantity())
                .addValue("id", itemId);

        template.update(sql, param);
    }

    @Override
    public Optional<Item> findById(Long id) {
        String sql = "select id, item_name, price, quantity from item where id = :id";
        try {
            Map<String, Object> param = Map.of("id", id);
            Item item = template.queryForObject(sql, param, itemRowMapper());
            return Optional.of(item);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    @Override
    public List<Item> findAll(ItemSearchCond cond) {
        Integer maxPrice = cond.getMaxPrice();
        String itemName = cond.getItemName();

        SqlParameterSource param = new BeanPropertySqlParameterSource(cond);

        String sql = "select id, item_name, price, quantity from item";
        // 동적 쿼리
        if (StringUtils.hasText(itemName) || maxPrice != null) {
            sql += " where";
        }

        boolean andFlag = false;
        if (StringUtils.hasText(itemName)) {
            sql += " item_name like concat('%',:itemName,'%')";
            andFlag = true;
        }
        if (maxPrice != null) {
            if (andFlag) {
                sql += " and";
            }
            sql += " price <= :maxPrice";
        }

        log.info("sql={}", sql);
        return template.query(sql, param, itemRowMapper());
    }

    private RowMapper<Item> itemRowMapper() {
        return BeanPropertyRowMapper.newInstance(Item.class);
    }
}
```
