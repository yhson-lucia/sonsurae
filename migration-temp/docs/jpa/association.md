---
title: 연관관계
slug: association
category: jpa
summary: JPA 적용 애노테이션, 단방향/양방향, 연관관계의 주인, 다대일/일대다/일대일, 상속관계 매핑, MappedSuperclass
tags: [jpa, association, mapping, entity, inheritance, mapped-superclass]
sort_order: 2
created: 2025-01-17
updated: 2026-05-10
---

## 1. JPA 적용

| 애노테이션 | 설명 |
|---|---|
| `@Entity` | JPA가 사용하는 객체임을 나타냄 |
| `@Id` | 테이블의 PK와 매핑 |
| `@GeneratedValue(strategy = GenerationType.X)` | PK 생성 전략 |
| `@Column` | 객체 필드를 테이블 컬럼과 매핑 |

### 1.1 PK 생성 전략 (`GenerationType`)

| 전략 | 설명 |
|---|---|
| `IDENTITY` | DB에 위임. MySQL 등에서 사용. SQL 실행 후 ID 값을 알 수 있음. `em.persist` 시점에 즉시 INSERT 실행 |
| `SEQUENCE` | DB 시퀀스 오브젝트 사용. `@SequenceGenerator` 필요 |
| `TABLE` | 키 생성용 테이블 사용. `@TableGenerator` 필요 |
| `AUTO` | 방언에 따라 자동 지정 |

### 1.2 `@Column` 속성

- `name = "item_name"`: 매핑할 컬럼 이름 지정
- `length = 10`: DDL 생성 시 컬럼 길이 (varchar(10))
- `item_name`은 `itemName`과 자동 변환되므로 생략 가능

> JPA는 `public` 또는 `protected` **기본 생성자가 필수**.

### 1.3 JPA Repository 예시

```java
@Slf4j
@Repository  // 컴포넌트 스캔 대상. 예외 변환 AOP 적용 대상
@Transactional  // 모든 JPA 데이터 변경은 트랜잭션 안에서 이루어져야 함 (조회는 없어도 가능)
// 보통 트랜잭션은 서비스 계층에서 거는 것이 일반적 (비즈니스 로직 시작점)
public class JpaItemRepositoryV1 implements ItemRepository {

    private final EntityManager em;
    // EntityManager는 내부에 데이터 소스를 가지고 있어 DB에 접근 가능

    public JpaItemRepositoryV1(EntityManager em) {
        this.em = em;
    }

    @Override
    public Item save(Item item) {
        em.persist(item);   // EntityManager의 persist() 사용
        return item;
    }

    @Override
    public void update(Long itemId, ItemUpdateDto updateParam) {
        Item findItem = em.find(Item.class, itemId);
        findItem.setItemName(updateParam.getItemName());
        findItem.setPrice(updateParam.getPrice());
        findItem.setQuantity(updateParam.getQuantity());
        // update 메서드를 직접 호출하지 않아도, 트랜잭션 커밋 시점에
        // 영속성 컨텍스트가 변경된 엔티티를 자동으로 UPDATE 처리 (변경 감지)
    }

    @Override
    public Optional<Item> findById(Long id) {
        Item item = em.find(Item.class, id);
        return Optional.ofNullable(item);
    }

    @Override
    public List<Item> findAll(ItemSearchCond cond) {
        String jpql = "select i from Item i";
        Integer maxPrice = cond.getMaxPrice();
        String itemName = cond.getItemName();
        if (StringUtils.hasText(itemName) || maxPrice != null) {
            jpql += " where";
        }

        boolean andFlag = false;
        if (StringUtils.hasText(itemName)) {
            jpql += " i.itemName like concat('%',:itemName,'%')";
            andFlag = true;
        }
        if (maxPrice != null) {
            if (andFlag) {
                jpql += " and";
            }
            jpql += " i.price <= :maxPrice";
        }

        log.info("jpql={}", jpql);

        TypedQuery<Item> query = em.createQuery(jpql, Item.class);
        if (StringUtils.hasText(itemName)) {
            query.setParameter("itemName", itemName);
        }
        if (maxPrice != null) {
            query.setParameter("maxPrice", maxPrice);
        }
        return query.getResultList();
    }
}
```

## 2. 연관관계

자바는 객체 지향적으로 **참조**를 사용해 연관 객체를 찾고, DB 테이블은 **외래 키**로 조인해 연관 테이블을 찾음. 이 방식 차이 때문에 객체를 테이블에 맞춰 데이터 중심으로만 모델링하면 협력 관계를 만들 수 없음.

- 예: 객체의 ID 값을 다른 객체에서 참조해도, 조인처럼 활용해 객체를 다룰 수는 없음
- 이 차이 때문에 DB 테이블 연관관계와 자바 객체 연관관계를 매핑하는 모델링이 필요

### 2.1 단방향 vs 양방향

- **테이블**: 외래 키 하나로 양쪽 조인 가능. 방향 개념이 없음
- **객체**: 참조용 필드가 있는 쪽으로만 참조 가능
  - 한쪽만 참조 → **단방향**
  - 양쪽이 서로 참조 → **양방향**
  - 엔티티에 다른 객체를 참조하는 필드가 있는데, 그게 한쪽에만 있으면 단방향

**왜 단방향/양방향을 구분하는가?** 상황에 따라 효율적인 방식이 다르기 때문.

- 단방향 단점: 다른 객체에서 해당 필드에 접근 불가
- 양방향 단점: 한쪽 필드에만 접근해도 모든 객체에 접근하므로 불필요한 엔티티가 호출됨

### 2.2 연관관계의 주인

- 테이블은 외래 키 하나로 두 테이블이 연관관계를 맺음
- 객체 양방향 관계는 A → B, B → A처럼 양쪽 참조
- 둘 중 **외래 키를 관리할 곳을 지정**해야 함
  - 객체는 외래/기본키 구분 없이 그냥 참조하기 때문
- **연관관계의 주인**: 외래 키를 관리하는 참조
- **주인의 반대편**: 외래 키에 영향을 주지 않고 단순 조회만 가능

### 2.3 다대일 단방향

- 다대일에서 외래 키는 항상 **다(N) 쪽**에 있어야 함
- 반대로 참조하는 로직이 많을 경우, `@OneToMany`로 조회 가능 (주인은 여전히 `@ManyToOne`)

### 2.4 일대다 단방향

- Team이 `members` 객체를 가질 때 (`Team` → `Member` 일대다 단방향)
- DB 입장에서 외래 키는 결국 `Member`에 있으므로, Team을 persist하면 Member도 update해야 함 → UPDATE 쿼리가 추가로 발생
- 객체와 테이블의 차이로 반대편 테이블 외래 키를 관리하는 특이한 구조
- `@JoinColumn`을 꼭 사용해야 함. 안 쓰면 조인 테이블 방식이 적용되어 중간 테이블이 생기고 성능이 저하됨
- **결론**: 다대일 양방향 매핑이 일대다 단방향보다 나음
- 일대다 양방향이 필요하면 `@ManyToOne` + `@JoinColumn(name = "team_id", insertable = false, updatable = false)`로 **읽기 전용 필드**를 만들어 양방향처럼 활용

### 2.5 일대일 관계

- 일대일은 그 반대도 일대일
- 주 테이블 또는 대상 테이블 중 외래 키 위치 선택 가능
  - 주 테이블에 외래 키
  - 대상 테이블에 외래 키
- 외래 키에 DB UNIQUE 제약 조건 추가
- **대상 테이블에 외래 키가 있는 단방향**은 JPA가 지원하지 않음. 양방향 매핑으로 해결

## 3. 연관관계 매핑

애노테이션 방식으로 연관관계를 매핑할 수 있음.

| 카테고리 | 애노테이션 |
|---|---|
| 객체-테이블 매핑 | `@Entity`, `@Table` |
| 필드-컬럼 매핑 | `@Column` |
| 기본키 매핑 | `@Id` |
| 연관관계 매핑 | `@ManyToOne`, `@JoinColumn` |
| 날짜 타입 매핑 | `@Temporal` |
| enum 타입 매핑 | `@Enumerated` |
| BLOB/CLOB 매핑 | `@Lob` |
| 매핑 무시 | `@Transient` |

### 3.1 `@Table` 속성

- `name`: 매핑할 테이블 이름
- `catalog`: DB catalog 매핑
- `schema`: DB schema 매핑
- `uniqueConstraints` (DDL): DDL 생성 시 유니크 제약 조건 생성

### 3.2 `@Column` 추가 속성

- `name`: 매핑할 테이블 컬럼 이름
- `insertable`, `updatable`: 등록·변경 가능 여부
- `nullable` (DDL): null 허용 여부. `false` 시 DDL에 NOT NULL 제약 추가

## 4. 상속관계 매핑

관계형 DB는 상속관계가 없지만, **슈퍼타입-서브타입 관계**라는 모델링 기법이 객체 상속과 유사함. 상속관계 매핑은 객체 상속과 DB 슈퍼타입-서브타입 관계를 매핑하는 것.

### 4.1 슈퍼타입-서브타입 매핑 3가지 방법

| 전략 | 동작 | 장점 | 단점 |
|---|---|---|---|
| **JOIN** (각각 테이블) | 슈퍼/서브 모두 별도 테이블. JOIN으로 조회 | 정규화, 외래 키 무결성 활용, 저장공간 효율 | 조인 다수 사용 → 성능 저하, 쿼리 복잡, INSERT 2번 호출 |
| **단일 테이블** | 모든 내용을 한 테이블에. 데이터 타입을 마지막에 추가 | 조인 불필요로 조회 성능 빠름, 쿼리 단순 | 자식 엔티티 컬럼이 모두 NULL 허용. 테이블이 커질 수 있음 |
| **구현 클래스마다 테이블** | 서브타입 테이블만 따로 생성 (Item table 없앰) | 서브 타입 명확 구분, NOT NULL 사용 가능 | 자식 테이블 함께 조회 시 UNION 사용 → 느림. 통합 쿼리 어려움 (DB 설계자/ORM 전문가 모두 비추천) |

### 4.2 JPA 매핑 코드

| 전략 | 애노테이션 |
|---|---|
| JOIN | `@Inheritance(strategy = InheritanceType.JOINED)` |
| 단일 테이블 | `@Inheritance(strategy = InheritanceType.SINGLE_TABLE)` |
| 클래스별 테이블 | `@Inheritance(strategy = InheritanceType.TABLE_PER_CLASS)` |

### 4.3 식별 컬럼

- `@DiscriminatorColumn(name = "...")`: DTYPE 컬럼이 생기고 entity 명이 들어감. `name`으로 컬럼명 변경 가능
- `@DiscriminatorValue("A")`: DTYPE에 들어가는 값(엔티티 식별값)을 `A`로 변경

## 5. `@MappedSuperclass`

공통 매핑 정보가 필요할 때 사용 (예: id, name, 작성일, 수정일).

- 객체에 반복되는 공통 속성을 상속으로 통합
- 사용법
  - `BaseEntity`를 만들고 모든 엔티티에서 `extends BaseEntity`
  - `BaseEntity`에 `@MappedSuperclass` 애노테이션 부여 (`@Entity`는 X)
- 특징
  - 상속관계 매핑이 아님
  - 엔티티가 아니므로 테이블과 매핑되지 않음
  - 자식 클래스에 매핑 정보만 제공
  - 조회·검색 불가 (`em.find(BaseEntity)` 불가)
  - 직접 생성해 사용할 일이 없으므로 **추상 클래스로 권장**
