---
title: SQL로 다수의 테이블 제어
slug: sql-multi-table
category: database
summary: GROUP BY와 HAVING, INNER JOIN, LEFT/RIGHT JOIN으로 두 테이블 조회
tags: [database, sql, group-by, having, join, inner-join]
sort_order: null
created: 2025-01-17
updated: 2026-05-10
---

## 1. 데이터 그룹 짓기 (GROUP BY)

```sql
SELECT user_id, COUNT(*)        -- 검색할 컬럼의 count
FROM rental                      -- 테이블
GROUP BY user_id;                -- 그룹의 기준 컬럼
```

- `LIMIT`, `ORDER BY`, `GROUP BY`는 문법상 항상 **맨 마지막**에 옴
- SQL 기본의 `SUM`, `AVG`, `MAX`, `MIN`을 함께 활용

```sql
SELECT user_id, SUM(컬럼)
FROM rental
GROUP BY user_id;
```

```sql
SELECT user_id, AVG(컬럼)
FROM rental
GROUP BY user_id;
```

## 2. 그룹에 조건 적용 (HAVING)

조건을 붙여 그룹화하려면 `HAVING` 사용.

```sql
SELECT user_id, COUNT(*)
FROM rental
GROUP BY user_id
HAVING COUNT(user_id) > 1;       -- user_id를 count할 때 2개 이상인 데이터만
```

## 3. 두 테이블에서 조회

관계형 DB에서 컬럼이 같이 공유되는 경우 두 테이블을 엮어 조회 가능. 이때 사용하는 명령이 **JOIN**.

### 3.1 INNER JOIN

```sql
SELECT *                          -- 모두 조회
FROM rental
INNER JOIN user;                  -- 연결할 테이블
```

### 3.2 ON으로 조건 적용

```sql
SELECT *
FROM rental
INNER JOIN user
ON user.id = rental.user_id;
-- user.id (user 테이블의 id)와 rental.user_id (rental 테이블의 user_id)가
-- 같은 것만 연결
```

### 3.3 LEFT JOIN

두 테이블 연결 시, 한쪽 테이블에 데이터가 없는 정보도 NULL로 함께 출력.

```sql
SELECT *
FROM user
LEFT JOIN rental                  -- NULL을 포함해 데이터 출력
ON user.id = rental.user_id;
-- 중심 테이블은 user (FROM에 명시). user의 모든 id가 출력되고,
-- rental에 매칭이 없으면 NULL
```

### 3.4 RIGHT JOIN

중심 테이블을 `FROM`에 두고, **연결할 테이블의 NULL을 포함해 출력**하고 싶을 때.

```sql
SELECT *
FROM user
RIGHT JOIN rental
ON user.id = rental.user_id;
-- rental의 모든 데이터가 출력되고, 매칭이 없는 user는 NULL
```

![JOIN 종류별 결과 비교](images/sql-multi-table-01.webp)
