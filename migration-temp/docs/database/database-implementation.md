---
title: 데이터베이스 구현
slug: database-implementation
category: database
summary: 데이터베이스 생성, DCL(GRANT/REVOKE/COMMIT/ROLLBACK), 인덱스 정리
tags: [database, dcl, grant, revoke, index, mysql]
sort_order: null
created: 2025-01-17
updated: 2026-05-10
---

## 1. 데이터베이스 생성

테이블을 만들기 전에 데이터베이스를 먼저 생성해야 함. macOS의 경우 터미널을 사용.

| 명령어 | 설명 |
|---|---|
| `mysql.server start` | MySQL 서버 시작 |
| `mysql -u <유저명>` | 지정한 유저로 로그인. `root`는 관리자 계정. `-p` 추가 시 비밀번호 입력 |
| `CREATE DATABASE test_db;` | DB 생성. `;`으로 쿼리 종료 |
| `SHOW DATABASES;` | 모든 DB 표시 |
| `DROP DATABASE <DB명>;` | DB 삭제 |
| `USE <DB명>;` | DB 사용 |
| `INSERT INTO <table>(...) VALUES(...);` | 테이블에 데이터 삽입 |
| `SELECT * FROM <table>;` | 테이블의 모든 데이터 출력 |

## 2. DCL (Data Control Language)

데이터베이스 접근 권한을 관리하는 데이터 제어 언어.

| 명령어 | 동작 |
|---|---|
| `GRANT` | 권한 부여 |
| `REVOKE` | 권한 회수 |
| `COMMIT` | 트랜잭션 작업 반영 |
| `ROLLBACK` | 트랜잭션 작업 취소 (이전 상태로 복원) |

> **트랜잭션**: 데이터베이스를 조작하는 작업의 단위. DCL에서 트랜잭션을 제어하는 명령을 따로 **TCL** (Transaction Control Language)로 분류하기도 함.

### 2.1 사용자 생성

```sql
CREATE USER yj@localhost IDENTIFIED BY '1234';
```

- `@` 뒤는 접속 허용 위치. `localhost`(이 컴퓨터), `%`(외부 접속 허용), `<ip>`(특정 IP만 허용)
- `IDENTIFIED BY`: 비밀번호 설정

### 2.2 권한 부여

```sql
-- 모든 권한 부여
GRANT ALL PRIVILEGES ON 데이터베이스이름.* TO 사용자@localhost;

-- SELECT 권한만 부여
GRANT SELECT ON 데이터베이스이름.* TO 사용자@localhost;

-- 권한 설정 적용
FLUSH PRIVILEGES;

-- 부여한 권한 확인
SHOW GRANTS FOR yj@localhost;
```

### 2.3 권한 회수

```sql
-- 모든 권한 회수
REVOKE ALL ON 데이터베이스이름.* FROM 사용자;

-- SELECT 권한만 회수
REVOKE SELECT ON 데이터베이스이름.* FROM 사용자;
```

## 3. 인덱스

데이터베이스 테이블의 **검색 속도를 향상**시키기 위한 자료구조.

- 데이터 검색 시 테이블 전체를 하나씩 접근해 확인하지만, 인덱스가 있으면 색인(책의 페이지 체크와 같은 역할)을 통해 원하는 데이터를 빠르게 찾을 수 있음
- 모든 데이터 조회(`SELECT *`)에는 인덱스가 불필요

### 3.1 장단점

| 장점 | 단점 |
|---|---|
| 테이블 조회 속도·성능 향상 | 인덱스 관리를 위한 추가 작업 |
| | 인덱스 저장을 위한 추가 공간 |
| | 경우에 따라 검색 성능 저하 |

### 3.2 인덱스 사용이 적합한 경우

- 규모가 큰 테이블
- 데이터 삽입·수정·삭제가 적은 컬럼
- `WHERE` 조건절, `ORDER BY` 정렬, `JOIN`을 자주 하는 컬럼
- 데이터 중복도가 낮은 컬럼

### 3.3 인덱스 명령어

```sql
-- 인덱스 생성
CREATE INDEX 인덱스이름 ON 테이블이름(컬럼이름);

-- 인덱스 삭제
ALTER TABLE 테이블이름 DROP INDEX 인덱스이름;
```
