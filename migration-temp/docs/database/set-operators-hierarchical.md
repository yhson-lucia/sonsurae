---
title: 집합연산자와 계층형 질의
slug: set-operators-hierarchical
category: database
summary: STANDARD SQL 연산 종류, UNION/INTERSECT/EXCEPT 집합 연산자, Oracle/MariaDB의 계층형 질의
tags: [database, sql, set-operator, union, hierarchical-query, recursive-cte]
sort_order: null
created: 2025-01-17
updated: 2026-05-10
---

## 1. STANDARD SQL

관계형 DB에서 원하는 정보를 유도하기 위한 기본 연산 집합.

### 1.1 일반 집합 연산

| 연산 | SQL |
|---|---|
| 합집합 | `UNION` |
| 교집합 | `INTERSECT` |
| 차집합 | `EXCEPT` |
| 카디션 곱 | `CROSS JOIN` |

### 1.2 순수 관계 연산

| 연산 | SQL |
|---|---|
| 셀렉션 | `WHERE` 절 |
| 프로젝션 | `SELECT` 절 |
| 조인 | 다양한 `JOIN` |
| 디비전 | 사용 X |

## 2. 집합 연산자

두 개 이상의 테이블에서 조인 없이 연관된 데이터를 조회하는 방법. SELECT한 컬럼 수와 데이터 타입이 테이블 간 호환되어야 함.

### 2.1 UNION

두 테이블을 하나로 합치는 연산. **중복 데이터는 제거**됨. 이를 위해 합칠 때 정렬 과정이 발생함 (`ORDER BY`와는 다름. 최종 정렬은 직접 `ORDER BY` 필요).

```sql
SELECT name, number FROM request_past
UNION
SELECT name, number FROM request_new
ORDER BY name ASC;
```

### 2.2 UNION ALL

UNION과 같지만 **중복을 허용**.

```sql
SELECT name, number FROM request_past
UNION ALL
SELECT name, number FROM request_new
ORDER BY name ASC;
```

### 2.3 INTERSECT

두 테이블의 겹치는 부분을 추출. 중복은 제거됨. 관계형 대수의 교집합에 해당.

- Oracle/MariaDB는 지원, **MySQL은 미지원**이라 JOIN을 활용해야 함

```sql
SELECT name, email FROM student
INTERSECT
SELECT name, email FROM lecture_special;
```

### 2.4 EXCEPT (Oracle: MINUS)

두 테이블에서 겹치는 부분을 앞 테이블에서 제외해 추출. 중복은 제거됨. 관계형 대수의 차집합에 해당.

- Oracle (`MINUS`)/MariaDB는 지원, **MySQL은 미지원**

```sql
SELECT book_name FROM book_store_a WHERE stock > 0
EXCEPT
SELECT book_name FROM book_store_b WHERE stock > 0;
```

## 3. 계층형 질의

테이블에 계층형 데이터가 존재할 때 데이터를 조회하기 위한 기능.

- **대표 DB**: Oracle, SQL Server
- **계층형 데이터**: 동일 테이블에 계층적으로 상위·하위 데이터가 포함됨 (트리 구조)

### 3.1 Oracle 계층형 질의

```sql
SELECT LEVEL, 사원번호, 관리자번호
FROM 직원
START WITH 관리자번호 IS NULL
CONNECT BY PRIOR 사원번호 = 관리자번호;
```

- 사원번호(상위)에서 관리자번호(하위)로 내려가는 구조. 최상위 레벨이 1로 시작

```sql
SELECT LEVEL, LPAD(' ', 4 * (LEVEL - 1)) || 사원번호, 관리자번호
FROM 직원
START WITH 관리자번호 IS NULL
CONNECT BY PRIOR 사원번호 = 관리자번호;
```

- `LPAD(' ', n)`: 왼쪽에 n자리 공백 추가
- 루트는 `LEVEL = 1`이므로 `4 * (LEVEL - 1) = 0`

### 3.2 CONNECT BY 키워드

| 키워드 | 의미 |
|---|---|
| `LEVEL` | 검색 항목의 깊이. 루트(최상위)의 레벨이 1 |
| `CONNECT_BY_ROOT` | 현재 전개 데이터의 루트(최상위) 데이터인지 표시 |
| `CONNECT_BY_ISLEAF` | 현재 전개 데이터가 리프(최하위)인지 표시 (0 또는 1) |
| `SYS_CONNECT_BY_PATH(A, B)` | 루트부터 현재까지 전개한 경로 표시 (A: 컬럼명, B: 구분자). 예: `1000:1001:1002` |

### 3.3 MariaDB / SQL Server 계층형 질의 (재귀 CTE)

```sql
WITH RECURSIVE CTE(member_id, manager_id, lvl) AS (
  -- 첫 번째 순환: manager_id가 NULL인 ROOT 찾기, lvl = 0
  -- (Oracle의 START WITH와 같은 역할)
  SELECT member_id, manager_id, 0 AS lvl
  FROM member
  WHERE manager_id IS NULL

  UNION ALL

  -- 다음 순환: CTE에 자기 자신을 JOIN해 한 단계씩 내려감
  -- (Oracle의 CONNECT BY와 같은 역할)
  SELECT a.member_id, a.manager_id, b.lvl + 1
  FROM member a
  JOIN CTE AS b ON a.manager_id = b.member_id
)
SELECT member_id, manager_id, lvl
FROM CTE
ORDER BY member_id, lvl;
```

| 키워드 | 의미 |
|---|---|
| `WITH RECURSIVE` | 재귀 호출 명령 |
| `CTE` (Common Table Expression) | 임시 결과 집합. 쿼리 안에서 이름으로 참조 가능 |
| 첫 번째 순환 | 시작점(루트) 찾기 |
| 두 번째 순환 | 자기 자신을 JOIN해 다음 레벨로 내려감 |
