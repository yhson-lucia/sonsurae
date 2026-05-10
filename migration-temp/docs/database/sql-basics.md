---
title: SQL 기본
slug: sql-basics
category: database
summary: SELECT/FROM/WHERE 기본 검색, 비교/복합/포함/범위 조건, ORDER BY, INSERT/UPDATE/DELETE, COUNT/SUM/AVG/MAX/MIN/LIMIT
tags: [database, sql, select, where, order-by, dml, function]
sort_order: null
created: 2025-01-17
updated: 2026-05-10
---

## 1. SQL 시작

- **데이터베이스**: 여러 사람이 공유해 사용할 목적으로 통합·관리되는 데이터의 모음
- DB는 종류에 따라 사용 방법이 조금씩 다르지만, 검색·분석에 사용되는 기본 사용 방법은 종류와 무관하게 동일
- **SQL** (Structured Query Language): DB에 접근하고 조작하기 위한 표준 언어

## 2. 테이블에서 데이터 검색

| 명령어 | 설명 |
|---|---|
| `DESC 테이블명` | 테이블 구조 확인 |
| `SELECT 컬럼1, 컬럼2` | 검색 명령. 컬럼 중심 |
| `FROM 테이블명` | 어느 테이블로부터 가져올지 |
| `WHERE 조건` | 조건 적용 |
| `SELECT * FROM 테이블 WHERE 조건` | 모든 컬럼 조회. 데이터가 클 때(예: 5GB)는 오래 걸림 → 사용 지양 |
| `DISTINCT 컬럼` | 컬럼의 중복 제거. 2개 이상 컬럼일 경우 한 컬럼에 중복이 있어도 다른 컬럼 값이 다르면 다르게 취급 |

```sql
SELECT DISTINCT 컬럼1, 컬럼2 FROM 테이블;
```

## 3. 조건 검색 (WHERE)

- `WHERE`: 검색하고자 하는 데이터의 조건을 설정
- `SELECT`는 컬럼명을 검색, `WHERE`는 레코드(데이터)를 검색

```sql
SELECT * FROM book WHERE title = '돈키호테';
```

### 3.1 비교 연산자

`>`, `<` 부등호 / `=` 등호 / `!=` 부정 등.

```sql
SELECT * FROM score WHERE korean >= 90;
```

### 3.2 복합 조건 연산자

| 연산자 | 의미 |
|---|---|
| `AND`, `&&` | 양 조건 모두 만족 |
| `OR`, `\|\|` | 둘 중 하나 만족 |
| `NOT`, `!` | 조건이 아닌 값 |

```sql
SELECT * FROM score WHERE korean >= 90 OR math > 80;
```

### 3.3 BETWEEN / IN / NOT IN

| 연산자 | 의미 | 예 |
|---|---|---|
| `BETWEEN` | 사이 값 (양 끝 포함) | `A BETWEEN 10 AND 20` (10·20 포함) |
| `IN` | 한 조건에 포함된 값. `()` 필요 | `A IN (B)` |
| `NOT IN` | 포함되지 않은 값 | `A NOT IN (B)` |

`BETWEEN`은 나이·날짜 등에 자주 사용.

## 4. LIKE — 데이터 일부분 검색

`LIKE`: 특정 문자가 포함된 문자열을 찾을 때. 데이터를 기준으로 찾으므로 `WHERE` 조건문에 들어감.

```sql
SELECT * FROM 테이블 WHERE 컬럼 LIKE '데이터';

-- % (와일드카드)로 일부만 들어가는 데이터도 검색 가능
SELECT * FROM 테이블 WHERE 컬럼 LIKE '데이터%';   -- 데이터로 시작
SELECT * FROM 테이블 WHERE 컬럼 LIKE '%데이터';   -- 데이터로 끝
SELECT * FROM 테이블 WHERE 컬럼 LIKE '%데이터%';  -- 포함
```

## 5. 데이터 정렬 (ORDER BY)

- `ORDER BY`: 검색 결과를 정렬하여 출력
- 정렬은 조건이 아니므로 `WHERE`와 별개

```sql
SELECT * FROM 테이블
ORDER BY math DESC;   -- 내림차순 (높은 순)
SELECT * FROM 테이블
ORDER BY math ASC;    -- 오름차순 (낮은 순)
```

## 6. 데이터 삽입 (INSERT INTO)

이미 존재하는 데이터에 새 데이터를 추가.

```sql
INSERT INTO 테이블(컬럼1, 컬럼2, ...) VALUES (값1, 값2, ...);
```

## 7. 데이터 수정 (UPDATE)

- `UPDATE`: 이미 저장된 값을 수정
- 일부 데이터만 수정 가능

```sql
UPDATE 테이블 SET 컬럼 = '변경할 값' WHERE 조건;
```

## 8. 데이터 삭제 (DELETE)

- `DELETE`: 데이터 삭제
- `WHERE` 조건이 없으면 **모든 데이터가 삭제됨**. 주의 필요

```sql
DELETE FROM 테이블 WHERE 조건;
```

## 9. SQL 함수

3가지 함수 종류

1. 데이터 값을 계산하거나 조작 — **행 함수**
2. 행의 그룹을 계산·요약 — **그룹 함수**
3. 열의 데이터 타입을 변환

### 9.1 COUNT

검색 결과 데이터 개수 반환. NULL 데이터는 제외.

```sql
SELECT COUNT(컬럼) FROM 테이블;
SELECT COUNT(*) FROM 테이블;     -- 전체 데이터 수
```

### 9.2 LIMIT

출력 데이터 개수 제한. 데이터가 너무 많아 용량이 커지는 것을 방지하기 위해 LIMIT 1000 정도로 샘플 조회.

```sql
SELECT * FROM 테이블 LIMIT 5;        -- 위에서 5개
SELECT * FROM 테이블 LIMIT 1, 5;     -- 두 번째부터 5개
```

### 9.3 SUM / AVG

```sql
SELECT SUM(컬럼) FROM 테이블;            -- 총합
SELECT AVG(컬럼) FROM 테이블;            -- 평균
SELECT AVG(c1), AVG(c2), AVG(c3) FROM 테이블;   -- 여러 평균
```

### 9.4 MAX / MIN

테이블의 최댓값/최솟값 반환. 숫자형뿐 아니라 문자형도 가능 (가나다 순).

```sql
SELECT MAX(컬럼) FROM 테이블;
SELECT MIN(컬럼) FROM 테이블;
```
