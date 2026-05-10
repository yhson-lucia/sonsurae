---
title: 데이터베이스 기초
slug: database-basics
category: database
summary: 데이터베이스 개념과 필요성, RDB와 NoSQL 비교, 관계형 DB 만들기, DDL 기초
tags: [database, rdb, nosql, sql, ddl, basics]
sort_order: null
created: 2025-01-17
updated: 2026-05-10
---

## 1. 데이터베이스란

### 1.1 데이터와 정보

- **데이터**: 현실 세계에서 수집된 단순한 사실과 값들 (예: 학습 내역, 과목)
- **정보**: 데이터를 특정 목적에 의해 해석·가공한 형태

### 1.2 데이터베이스 정의

한 조직 안에서 여러 사용자와 응용 프로그램이 다음 4가지 특성으로 사용하는 데이터.

- **공동 (Shared)**: 여러 응용 프로그램이 함께 공유
- **통합 (Integrated)**: 데이터 중복을 없애 하나의 DB로 관리
- **저장 (Stored)**: 프로그램이 저장 가능한 매체에 저장
- **운영 (Operational)**: 조직의 운영에 사용

### 1.3 데이터베이스의 필요성 — 파일 처리 시스템의 한계

1. **데이터 종속**: 데이터 구조가 바뀌면 응용 프로그램 구조도 바뀌어야 함
2. **데이터 중복**: 응용 프로그램별로 데이터를 생성할 수 있어 중복 발생. 한쪽 데이터 변경이 반영되지 않을 수 있음
3. **무결성 유지 불가**

이런 문제로 데이터가 안정적으로 보관되지 않고 저장 공간도 낭비됨.

### 1.4 데이터베이스의 특징

- **실시간 접근성**: 사용자가 원할 때 언제든 접근 가능
- **지속적인 변화**: 삽입·삭제·갱신을 통해 최신 데이터 유지
- **동시 공유**: 여러 사용자가 동시에 이용 가능
- **내용에 대한 참조**: 물리적 위치가 아닌 값을 가지고 검색

## 2. 데이터베이스의 종류

### 2.1 RDB (Relational Database)

- 관계형 모델을 기반으로 SQL을 이용해 데이터 관리
- 첫 관계형 DB 이전에는 네트워크식·계층형 DB가 있었음
- 데이터를 행과 열의 **테이블**로 표현
- 테이블을 **관계**라는 이름으로 연결해 중복을 방지하고 무결성 보장
- 정의된 테이블(스키마)에 맞게 데이터가 삽입되어 안정성 보장
- 데이터 구조가 일관적인 경우에 주로 사용 (예: 금융 회사의 고객 정보)
- **RDBMS** (Relational Database Management System)
  - MySQL, PostgreSQL, MariaDB, Oracle, Microsoft SQL Server 등
  - 공통적으로 SQL 문법을 쓰므로 큰 차이는 없지만, MySQL(단순 CRUD)·PostgreSQL(복잡한 SQL) 등 특성 차이 존재

### 2.2 NoSQL (Not only SQL)

- 데이터 간 관계를 정의하지 않는, RDB보다 유연한 모델
- 저장할 수 있는 데이터 유형 제한 없음
- 새로운 유형의 데이터 추가가 용이
- 데이터 구조가 자주 변경되는 경우(예: 날씨 데이터)에 적합
- 대용량 데이터를 빠르게 처리
- 종류: MongoDB, Redis, Cassandra 등

### 2.3 RDB vs NoSQL

| 구분 | RDB | NoSQL |
|---|---|---|
| 데이터 표현 | 행과 열의 테이블 | 고정적이지 않음 |
| 모델 | 관계 모델 | 다양함 (문서·키-값·컬럼·그래프) |
| 적합 상황 | 무결성·안정성이 중요 | 대용량·구조 비일관적인 빅데이터 |
| 예시 | MySQL, PostgreSQL, MariaDB | MongoDB, Redis, Apache Cassandra |

## 3. 관계형 데이터베이스 만들기

![관계형 DB 테이블 구조](images/database-basics-01.webp)

| 용어 | 설명 |
|---|---|
| 테이블 | 행과 열로 구성 |
| 속성 (Attribute) | 데이터 특성을 나타내는 가장 작은 논리 단위 |
| 튜플 (Tuple) | 속성이 모여 구성된 각 행 |
| 도메인 (Domain) | 속성이 가질 수 있는 값의 집합 |

### 3.1 관계 (Relationship)

![테이블 간 관계 예시](images/database-basics-02.webp)

- 두 테이블 간 관계가 없으면 주문번호를 ID·이름·주소와 함께 관리해야 해서, 동일 정보가 중복 저장됨
- 관계가 있으면 하나의 속성으로 테이블을 연결해 효율적으로 데이터 관리 가능
- 위 예시는 ID라는 공통 값으로 연결됨

### 3.2 SQL 작성 규칙

- SQL 문법은 **대문자**로 작성 권장
- 테이블명·속성명은 **소문자** 권장
- 이름은 의미가 잘 드러나도록
- 여러 단어 혼합 시 `_`로 구분
- `--`로 주석
- 명령어 끝에는 세미콜론(`;`)

```sql
CREATE TABLE customer(
  id VARCHAR(10),
  name VARCHAR(10),
  address VARCHAR(30)
);

SHOW TABLES;            -- DB의 테이블 목록 확인
DESC customer;          -- 테이블 구조 확인

-- 데이터 삽입
INSERT INTO customer(id, name, address)
VALUES ('kmax6', '김민준', '서울시 관악구');

INSERT INTO customer(id, address, name)
VALUES ('kmax6', '서울시 관악구', '김민준');
-- 속성의 순서는 중요하지 않음

INSERT INTO customer
VALUES ('freeman123', '박서준', '서울시 관악구 신림동');
-- 모든 속성을 순서대로 입력하면 속성 목록 생략 가능

-- 데이터 출력
SELECT id, name, address FROM customer;
SELECT address, name FROM customer;
SELECT * FROM customer;     -- *로 모든 속성
```

## 4. 데이터베이스 정의어 (DDL)

**SQL** (Structured Query Language) — 관계형 DB를 활용하기 위한 표준 언어. 3가지 종류.

| 종류 | 약어 | 용도 |
|---|---|---|
| 데이터 정의어 | DDL (Data Definition Language) | 테이블 같은 데이터 구조 정의 |
| 데이터 조작어 | DML (Data Manipulation Language) | 데이터 조회 및 검색 |
| 데이터 제어어 | DCL (Data Control Language) | 데이터베이스 접근 권한 관리 |

### 4.1 테이블 정의

```sql
CREATE TABLE customer(
  id VARCHAR(10) NOT NULL,
  name VARCHAR(10) NOT NULL,
  address VARCHAR(30) NULL
);
```

- 형식: `CREATE TABLE 테이블명(속성1 데이터타입 제약조건1, ...)`
- 제약 조건
  - `NOT NULL`: NULL 값 비허용
  - `NULL`: NULL 허용 (기본값)
- 꼭 들어가야 할 데이터는 `NOT NULL`로 명시

### 4.2 데이터 타입

| 자료형 | 설명 |
|---|---|
| `VARCHAR(n)` | n bytes 가변 길이 문자열. 1byte = 1글자 (영문 기준) |
| `INT` | 정수형 4 bytes. 작으면 `TINYINT`, 크면 `BIGINT` |
| `FLOAT` | 4 bytes 부동 소수점. 근사치 |
| `DECIMAL` | 고정 소수점. 정확한 위치 |
| `DOUBLE` | 더 큰 소수 표현 |
| `DATETIME` | `YYYY-MM-DD HH:MM:SS`. 날짜만은 `DATE`, 시간만은 `TIME` |

> 나머지는 사용하는 DB의 자료형 문서를 참고.

### 4.3 테이블 수정

```sql
-- 컬럼 추가
ALTER TABLE customer ADD COLUMN birthday DATE NULL;

-- 컬럼 수정
ALTER TABLE customer MODIFY COLUMN id VARCHAR(15) NULL;

-- 컬럼 이름 변경
ALTER TABLE customer CHANGE COLUMN name korean_name VARCHAR(10) NOT NULL;

-- 컬럼 삭제
ALTER TABLE customer DROP COLUMN address;

-- 테이블 이름 변경
ALTER TABLE customer RENAME member;
```

형식: `ALTER TABLE + 테이블명 + 명령어 + 컬럼명 + 데이터타입 + 제약조건`

### 4.4 테이블 삭제

```sql
DROP TABLE member;
```
