---
title: 서브쿼리
slug: subquery
category: database
summary: 서브쿼리의 종류(단일 행/다중 행/다중 컬럼), 위치별·동작 방식별 분류, 뷰 정리
tags: [database, sql, subquery, scalar-subquery, view, correlated-subquery]
sort_order: null
created: 2025-01-17
updated: 2026-05-10
---

## 1. 서브쿼리

하나의 쿼리 안에 포함된 또 하나의 쿼리. 메인 쿼리가 서브쿼리를 포함하는 종속 관계.

- 알려지지 않은 기준을 이용한 검색에 유용 (예: 연봉 상위 5%인 여자)
- 메인 쿼리 실행 이전에 한 번만 실행
- `SELECT` 문은 **서브쿼리 → 메인 쿼리** 순으로 실행
- 한 문장에서 여러 번 사용 가능 (서브쿼리의 서브쿼리도 가능)

```sql
SELECT * FROM employee
WHERE 급여 >
  (SELECT 급여 FROM employee WHERE 이름 = 'elice');
-- elice의 급여를 알지 못해도, 서브쿼리로 가져온 뒤 비교 가능
```

### 1.1 사용 시 주의사항

1. 서브쿼리는 **괄호와 함께** 사용
2. 서브쿼리 안에서 `ORDER BY` 사용 불가
3. 서브쿼리는 **연산자의 오른쪽**에 사용
4. 서브쿼리는 오로지 `SELECT`문으로만 작성 가능

```sql
SELECT * FROM employee
WHERE 급여 >                                                    -- 메인 쿼리
  (SELECT 급여 FROM employee WHERE 이름 = 'elice');             -- 서브 쿼리
```

## 2. 반환에 따른 분류

### 2.1 단일 행 서브쿼리

결과가 한 행만 나오는 서브쿼리. 1개의 값만 반환해 메인 쿼리로 전달.

```sql
SELECT * FROM employee
WHERE 급여 >                                       -- 단일 행 연산자
  (SELECT 급여 FROM employee WHERE 사원번호 = 1);
-- 사원번호는 PK이므로 한 행만 반환 = 단일 행
```

**단일 행 연산자**: `=`, `<>`, `>`, `>=`, `<`, `<=`

### 2.2 다중 행 서브쿼리

서브쿼리가 결과를 2개 이상 반환해 메인 쿼리로 전달.

```sql
SELECT * FROM employee
WHERE 급여 IN (                                                -- 다중 행 연산자
  SELECT MAX(급여) FROM employee GROUP BY 부서번호
);
-- MAX는 부서별로 여러 행을 반환할 수 있음 = 다중 행
```

**다중 행 연산자**

| 연산자 | 동작 |
|---|---|
| `IN` | 서브쿼리 결과 중 하나라도 만족하면 반환 |
| `EXISTS` | 서브쿼리 결과 값의 존재 여부 확인 |
| `ANY` | 하나라도 만족하면 반환. 비교 연산 가능 |
| `ALL` | 모두 만족하면 반환. 비교 연산 가능 |

### 2.3 다중 컬럼 서브쿼리

서브쿼리 결과가 여러 컬럼을 반환하며, 메인 쿼리의 조건과 동시에 비교.

- 예: 각 부서에서 가장 높은 급여를 받는 직원의 이름과 급여 출력

## 3. 위치에 따른 분류

`WHERE` 절 서브쿼리가 가장 일반적. 그 외에 **스칼라 서브쿼리**가 있음.

### 3.1 스칼라 서브쿼리

`SELECT` 절에서 사용. **한 행만** 반환하며, JOIN과 비슷한 결과를 만들어 냄. JOIN보다 계산이 빠른 경우가 있어 사용함.

```sql
SELECT students.name, (
  SELECT math                              -- 서브쿼리가 SELECT 안에 들어옴
  FROM middle_test AS m
  WHERE m.student_id = students.student_id
) AS middle_avg                            -- 별칭
FROM students;
```

## 4. 동작 방식에 따른 분류

서브쿼리에 메인 쿼리의 컬럼이 포함되는지에 따라 분류.

### 4.1 연관 서브쿼리 (Correlated Subquery)

메인 쿼리의 컬럼이 서브쿼리에 포함됨. 메인 쿼리의 컬럼은 서브쿼리에 특정 조건으로 사용됨.

```sql
SELECT * FROM employee A
WHERE 급여 >
  (SELECT AVG(급여) FROM employee B WHERE B.사원번호 = A.사원번호);
-- 서브쿼리의 값이 메인 쿼리의 컬럼에서 와야 함
```

### 4.2 비연관 서브쿼리

메인 쿼리 컬럼이 서브쿼리에 포함되지 않음. 주로 메인 쿼리에 특정 값을 제공할 때 사용.

```sql
SELECT * FROM employee A
WHERE 아이디 =
  (SELECT 아이디 FROM employee B WHERE name = '이름');
-- 서브쿼리 자체만으로 동작 가능
```

## 5. 뷰 (View)

다른 테이블에서 파생된 테이블. **물리적으로 데이터가 저장되는 것이 아니라 논리적으로만 존재**. 뷰를 사용한 질의 시 DBMS가 뷰 정의에 따라 질의를 재작성해 수행.

### 5.1 장점

| 장점 | 설명 |
|---|---|
| **독립성** | 테이블 구조가 변경되어도 뷰를 사용하는 응용 프로그램은 변경 불필요 |
| **편리성** | 자주 사용되는 복잡한 쿼리를 미리 뷰로 정의해 두면 추후 쿼리가 간단 |
| **보안성** | 사용자 권한에 따라 열람 가능한 데이터 차등 제공. 기본 테이블 노출 없이 접근 제어 가능 |

### 5.2 예시

```sql
CREATE VIEW EMPLOYEE_DEV AS (
  SELECT employee_id, salary FROM EMPLOYEE
  WHERE department_name = '개발'
);
```
