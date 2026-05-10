---
title: 데이터베이스 구성
slug: database-structure
category: database
summary: 제약 조건, 키(기본/외래/후보/대체/슈퍼키), 무결성 제약 조건, 데이터 모델링과 ER 다이어그램
tags: [database, constraint, key, primary-key, foreign-key, integrity, erd]
sort_order: null
created: 2025-01-17
updated: 2026-05-10
---

## 1. 제약 조건

테이블에 잘못된 데이터가 입력되는 것을 방지하기 위한 규칙. 제약 조건으로 **무결성** (정확성·일관성)을 지킬 수 있음.

| 제약 조건 | 설명 |
|---|---|
| `NOT NULL` | NULL 값 비허용. 미입력 시 에러. 기본값은 NULL 허용 |
| `UNIQUE` | 중복 값 비허용. NULL은 비교 불가이므로 여러 NULL은 허용됨 |
| `DEFAULT` | 기본값 설정. 값 미지정 시 DEFAULT 적용 |
| `CHECK` | 값 범위 제한 (예: `age > 19`) |
| `CONSTRAINT` | 제약 조건의 이름 정의 |

### 1.1 CONSTRAINT

```sql
CONSTRAINT 제약조건이름 제약조건[UNIQUE | CHECK | ...] (적용할 속성)
```

- `NOT NULL`과 `DEFAULT`는 CONSTRAINT로 정의 불가
- 테이블도 표시해 주면 헷갈리지 않음
- 생성된 제약 조건 확인

```sql
SELECT * FROM information_schema.table_constraints;
```

### 1.2 제약 조건 추가

```sql
ALTER TABLE 테이블명 ADD CONSTRAINT 제약조건이름 제약조건(속성);

-- 예
ALTER TABLE kickboard ADD CONSTRAINT member_id_unique UNIQUE(member_id);
```

### 1.3 DEFAULT 제약 조건 수정

```sql
ALTER TABLE 테이블명 ALTER 속성 SET DEFAULT 기본값;

-- 예
ALTER TABLE kickboard ALTER price SET DEFAULT 1000;
```

### 1.4 제약 조건 삭제

```sql
ALTER TABLE 테이블명 DROP CONSTRAINT 제약조건이름;

-- DEFAULT 제약 조건 삭제
ALTER TABLE 테이블명 ALTER 속성 DROP DEFAULT;

-- 예
ALTER TABLE kickboard DROP CONSTRAINT rental_time_check;
```

## 2. 키 (Key)

조건에 만족하는 튜플을 찾거나 정렬할 때 기준이 되는 속성.

### 2.1 기본키 (Primary Key)

서로 다른 튜플을 유일하게 식별하는 기준 속성.

- 중복 값 불가
- NULL 값 불가
- 테이블당 1개만 설정

### 2.2 외래키 (Foreign Key)

다른 테이블의 기본키를 참조하는 속성. 테이블 간 관계를 정의.

- 참조되는 테이블의 기본키에 없는 값은 지정 불가

```sql
CREATE TABLE customer(
  id      VARCHAR(10) PRIMARY KEY,
  name    VARCHAR(10),
  address VARCHAR(30)
);

CREATE TABLE order_history(
  customer_id VARCHAR(10),
  order_id    VARCHAR(14),
  FOREIGN KEY (customer_id) REFERENCES customer(id),
  -- 두 키를 묶어 복합 PK로 정의할 때는 CONSTRAINT 사용
  CONSTRAINT order_history_pk PRIMARY KEY (customer_id, order_id)
);
```

- **기본키 설정**: `PRIMARY KEY`
- **외래키 설정**: `FOREIGN KEY(참조 속성) REFERENCES 참조 테이블(참조 속성)`

### 2.3 후보키 / 대체키 / 슈퍼키

| 키 | 정의 |
|---|---|
| **후보키** | 기본키가 될 수 있는 키. 유일성(튜플을 유일하게 식별) + 최소성(최소 속성으로 유일성 만족) (기본키 ⊂ 후보키) |
| **대체키** | 후보키 중 기본키가 아닌 키 (대체키 ⊂ 후보키) |
| **슈퍼키** | 유일성은 만족하지만 최소성은 만족하지 않는 키. 여러 속성으로 PK를 만들 수 있는 경우 |

### 2.4 무결성 제약 조건

| 제약 조건 | 정의 |
|---|---|
| **개체 무결성** | 기본키는 NULL 값과 중복 값을 가질 수 없음 (`NOT NULL` + `UNIQUE`) |
| **참조 무결성** | 외래키는 NULL이거나 참조되는 릴레이션의 기본키 값과 동일 |
| **도메인 무결성** | 특정 속성값은 그 속성이 정의된 도메인에 속해야 함 |
| **NULL 무결성** | 특정 속성값은 NULL을 가질 수 없음 (반드시 받아야 하는 데이터) |
| **고유 무결성** | 각 튜플의 속성값들은 서로 달라야 함 |
| **키 무결성** | 테이블에 최소 한 개 이상의 키 존재 |

## 3. 데이터 모델링

현실 세계의 데이터를 데이터베이스화하는 과정. 단순화·추상화하여 표현한 모델.

| 용어 | 설명 |
|---|---|
| **개체 (Entity)** | 데이터로 표현하려는 현실 세계의 개념·정보 단위 (예: 킥보드, 회원 — 명사) |
| **속성 (Attribute)** | 개체에 대한 정보 (예: 킥보드의 브랜드·이용 가격, 회원의 아이디·이름) |
| **관계 (Relationship)** | 개체 간의 연관성 (예: 고객은 킥보드를 대여한다 — 동사) |

### 3.1 모델링 과정

`개념적 설계` → `논리적 설계` → `물리적 설계`

| 단계 | 설명 |
|---|---|
| 개념적 설계 | 현실 세계를 추상적 개념으로 표현 |
| 논리적 설계 | DBMS가 처리할 수 있는 데이터 구조(스키마) 설계 |
| 물리적 설계 | DBMS에 테이블을 저장할 구조 설계 |

## 4. ER 다이어그램 (Peter Chen)

**ERD** (Entity-Relationship Diagram, 개체-관계 다이어그램): 현실 세계의 데이터를 개체와 관계 형태의 다이어그램으로 표현.

표기법: Peter Chen, IE 등.

![ERD 표기 예시](images/database-structure-01.webp)

![ERD 관계 표현](images/database-structure-02.webp)

### 4.1 관계 추가

| 관계 | 예시 | 설명 |
|---|---|---|
| **1:1** | 남자 - 결혼 - 여자 | 관계를 테이블로 만들 때 한쪽 외래키를 PK로 설정 가능 |
| **1:N** | 선생님 - 담당 - 학생 | 학생 측에 선생님을 외래키로 두는 게 효율적 (반대로 하면 선생님 자료가 중복) |
| **N:M** | 학생 - 수강 - 수업 | 중복이 발생하므로 **관계 테이블**을 따로 만들어야 함. 학생/수업 양쪽의 PK를 외래키로 가진 새 테이블 생성 |

## 5. ER 다이어그램 (IE)

**IE** (Information Engineering)

- 키, 데이터 타입, 제약 조건까지 표기
- 관계를 세부적으로 나타냄

![IE 표기법](images/database-structure-03.webp)

**까마귀발 (crow's foot)** 표기법이라고도 부름.

![까마귀발 표기법](images/database-structure-04.webp)
