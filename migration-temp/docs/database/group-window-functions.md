---
title: 그룹 함수 & 윈도우 함수
slug: group-window-functions
category: database
summary: 윈도우 함수의 OVER 구문, 순위/집계/순서/비율 함수, ROLLUP/CUBE 그룹 함수
tags: [database, sql, window-function, rank, partition-by, rollup, cube]
sort_order: null
created: 2025-01-17
updated: 2026-05-10
---

## 1. 윈도우 함수

순위·집계 등 **행과 행 사이의 관계를 정의**하는 함수. `OVER` 구문 필수.

```sql
SELECT WINDOW_FUNCTION(ARGUMENTS)
       OVER ([PARTITION BY 컬럼] [ORDER BY 절] [WINDOWING 절])
FROM 테이블;
```

| 요소 | 설명 |
|---|---|
| `ARGUMENTS` | 윈도우 함수에 따라 필요한 인수. 없으면 생략 |
| `PARTITION BY` | 전체 집합을 소그룹으로 나누는 기준 (예: `department_id`별) |
| `ORDER BY` | 소그룹 내 정렬 기준 |
| `WINDOWING` | 행에 대한 범위 기준 |
| `ROWS` | 물리적 단위로 행 집합 지정 |
| `UNBOUNDED PRECEDING` | 윈도우 시작 위치 = 첫 번째 행 |
| `UNBOUNDED FOLLOWING` | 윈도우 마지막 위치 = 마지막 행 |
| `CURRENT ROW` | 윈도우 시작 위치 = 현재 행 |

## 2. 순위 함수

```sql
RANK() OVER ([PARTITION BY 컬럼] [WINDOWING 절])
```

| 함수 | 동작 |
|---|---|
| `RANK` | 동일 값에는 동일 순위 부여. 다음 순위는 건너뜀 (1, 2, 2, 4) |
| `DENSE_RANK` | 동일 값에는 동일 순위 부여하지만 한 건으로 취급 (1, 2, 2, 3) |
| `ROW_NUMBER` | 동일 값이라도 고유 순위 부여 (1, 2, 3, 4) |

## 3. 일반 집계 함수 (윈도우 형태)

`SUM`, `AVG`, `MAX`, `MIN`을 `GROUP BY` 없이 사용 가능.

```sql
SELECT ID, NAME, SALARY,
       AVG(SALARY) OVER (PARTITION BY DEPARTMENT_ID) AS DEPARTMENT_AVG
FROM EMPLOYEE;
```

- `DEPARTMENT_ID`가 같은 것끼리의 평균을 구함

## 4. 그룹 내 행 순서 함수

| 함수 | 동작 |
|---|---|
| `FIRST_VALUE` | 가장 먼저 나온 값 |
| `LAST_VALUE` | 가장 나중에 나온 값 |
| `LAG(컬럼, n)` | 이전 n번째 행의 값 |
| `LEAD(컬럼, n)` | 이후 n번째 행의 값 |

```sql
SELECT ID, DEPARTMENT_ID, NAME, SALARY,
       FIRST_VALUE(SALARY) OVER (
         PARTITION BY DEPARTMENT_ID ORDER BY SALARY
         ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
       ) AS DEPARTMENT_MIN_SALARY
FROM EMPLOYEE
ORDER BY ID;
```

```sql
SELECT ID, NAME, SALARY,
       LAG(NAME, 1) OVER (ORDER BY ID) AS PREV_EMPLOYEE_NAME
FROM EMPLOYEE;
```

## 5. 그룹 내 비율 함수

| 함수 | 동작 |
|---|---|
| `RATIO_TO_REPORT` | 파티션 내 전체 SUM에 대한 비율 |
| `PERCENT_RANK` | 파티션 내 순위를 백분율로 |
| `CUME_DIST` | 파티션 내 현재 행보다 작거나 같은 건들의 누적 백분율 |
| `NTILE(N)` | 파티션 내 행들을 N등분한 결과. 등분이 맞지 않으면 순차로 들어감 |

```sql
SELECT id, name, salary,
       SUM(salary) OVER () AS TOTAL_SALARY,
       RATIO_TO_REPORT(salary) OVER () AS RATIO_TO_REPORT
FROM EMPLOYEE;
-- 직원 전체 급여의 합 중 각 행이 차지하는 비율
```

```sql
SELECT id, math, physics, chemistry,
       math + physics + chemistry AS SCORE_SUM,
       PERCENT_RANK() OVER (ORDER BY SCORE_SUM DESC) AS PERCENT_RANK
FROM STUDENT;
```

```sql
SELECT id, math, physics, chemistry,
       math + physics + chemistry AS SCORE_SUM,
       CUME_DIST() OVER (ORDER BY SCORE_SUM DESC) AS CUME_DIST
FROM STUDENT;
```

```sql
SELECT id, math, physics, chemistry,
       math + physics + chemistry AS SCORE_SUM,
       NTILE(3) OVER (ORDER BY SCORE_SUM DESC) AS NTILE
FROM STUDENT
ORDER BY id ASC;
```

## 6. 그룹 함수

전체 데이터에 대한 통계뿐 아니라 일부에 대한 소계·중계도 필요. UNION으로 묶을 수도 있지만, Oracle DB에서는 다음 함수들을 제공함.

```sql
SELECT kind, category, SUM(sell_count)
FROM BOOK_HISTORY
GROUP BY kind, category
ORDER BY SUM(sell_count);
```

| 함수 | 동작 |
|---|---|
| `ROLLUP` | 그룹화 컬럼에 대한 부분 통계 제공. 컬럼 2개 이상이면 첫 번째 컬럼 기준으로 부분 통계 |
| `CUBE` | `ROLLUP` 결과 포함 + 그룹화 컬럼의 결합 가능한 모든 경우의 수에 대해 다차원 집계 생성. 순서 무관 |

```sql
SELECT kind, category, SUM(sell_count)
FROM BOOK_HISTORY
GROUP BY kind, category WITH ROLLUP;
```
