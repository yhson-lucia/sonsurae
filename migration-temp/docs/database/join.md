---
title: JOIN
slug: join
category: database
summary: EQUI/Non-EQUI JOIN, INNER/OUTER/CROSS/SELF JOIN, USING/NATURAL JOIN 정리
tags: [database, sql, join, inner-join, outer-join, cross-join]
sort_order: null
created: 2025-01-17
updated: 2026-05-10
---

## 1. JOIN 개요

두 개 이상의 테이블을 연결·결합해 데이터를 출력하는 것 (집합 연산자의 `INTERSECT`와는 다른 개념).

연산자에 따라 JOIN을 분류할 수 있음.

| 종류 | 설명 |
|---|---|
| **EQUI JOIN** (등가 교집합) | 두 테이블 간 **정확히 일치**하는 경우. 등가 연산자(`=`) 사용. 대부분 PK-FK 관계 기반 |
| **Non-EQUI JOIN** (비등가 교집합) | **정확히 일치하지 않는** 경우. `>`, `>=`, `<`, `<=`, `BETWEEN` 사용 |

```sql
SELECT e.ename, e.salary, s.grade
FROM emp e, salary_table s
WHERE e.salary BETWEEN s.min_salary AND s.max_salary;
```

## 2. INNER JOIN

내부 JOIN. JOIN 조건에서 **동일한 값이 있는 행만 반환**. JOIN의 기본값으로 `INNER`는 생략 가능.

```sql
SELECT * FROM table1 [INNER] JOIN table2
ON table1.컬럼 = table2.컬럼;
```

- JOIN 조건은 `ON`으로 지정

## 3. USING

같은 이름을 가진 컬럼들 중 원하는 컬럼에 대해서만 선택적으로 등가 조인 가능 (SQL Server에서는 미지원).

`ON`으로 동일한 컬럼명을 두 번 작성하지 않고 `USING`으로 간단히 작성.

```sql
SELECT * FROM table1 [INNER] JOIN table2 USING (컬럼);
```

## 4. NATURAL JOIN

두 테이블 간 **동일한 이름**을 갖는 모든 컬럼에 대해 등가 조인을 실행.

- `ON`이나 `USING`은 사용 불가. 조건 자체를 생략
- 동일 이름 컬럼이 예상치 못하게 사용될 수 있어 실무에서는 잘 쓰지 않음

```sql
SELECT * FROM table1 NATURAL JOIN table2;
```

## 5. CROSS JOIN

JOIN 조건이 없는 경우 생길 수 있는 모든 데이터 조합을 조회. 공유 컬럼이 없어 두 테이블에서 가능한 모든 조합을 반환.

```sql
SELECT * FROM PERSON [CROSS] JOIN PUBLIC_TRANSPORT;
```

- `CROSS`도 `INNER`처럼 생략 가능. JOIN 뒤에 `ON`이 오지 않아 구별됨

## 6. OUTER JOIN

두 테이블 간 교집합을 조회하고, **한쪽 테이블에 있는 데이터도 포함**시켜 조회. 빈 곳은 NULL로 출력.

### 6.1 Oracle 문법 `(+)`

`WHERE` 조건절에서 한쪽에만 있는 데이터를 포함시킬 테이블의 **반대쪽**에 `(+)`를 위치.

```sql
SELECT * FROM USER, CLASS
WHERE USER.CLASS_ID = CLASS.CLASS_ID(+);
```

위 경우 USER 테이블 값은 모두 출력, CLASS 테이블의 비어 있는 값은 NULL로 출력.

### 6.2 LEFT JOIN

```sql
SELECT * FROM USER LEFT [OUTER] JOIN CLASS
ON USER.CLASS_ID = CLASS.CLASS_ID;
```

위와 동일한 결과.

### 6.3 RIGHT JOIN

```sql
SELECT * FROM USER RIGHT [OUTER] JOIN CLASS
ON USER.CLASS_ID = CLASS.CLASS_ID;
```

CLASS 값이 모두 조회됨.

### 6.4 FULL OUTER JOIN

```sql
SELECT * FROM USER FULL OUTER JOIN CLASS
ON USER.CLASS_ID = CLASS.CLASS_ID;
```

합집합처럼 모든 데이터가 JOIN되어 출력.

LEFT OUTER + RIGHT OUTER를 `UNION`하면 FULL OUTER와 동일한 결과.

```sql
SELECT * FROM USER LEFT OUTER JOIN CLASS ON USER.CLASS_ID = CLASS.CLASS_ID
UNION
SELECT * FROM USER RIGHT OUTER JOIN CLASS ON USER.CLASS_ID = CLASS.CLASS_ID;
```

## 7. SELF JOIN

동일한 테이블끼리의 조인.

- 테이블·컬럼 이름이 모두 같으므로 식별을 위해 **별칭 필수**

```sql
SELECT ALPHA.컬럼, BETA.컬럼
FROM 테이블 ALPHA, 테이블 BETA
WHERE ALPHA.컬럼2 = BETA.컬럼1;
```

- 예: 계층형 질의에서 차상위 계층을 표시할 때 활용
