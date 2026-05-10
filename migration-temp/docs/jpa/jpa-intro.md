---
title: JPA
slug: jpa-intro
category: jpa
summary: JPA의 개념과 장점, 영속성 컨텍스트와 엔티티 생명주기, 1차 캐시·쓰기 지연·변경 감지·flush 정리
tags: [jpa, orm, persistence-context, entity-lifecycle, cache, flush]
sort_order: 1
created: 2025-01-17
updated: 2026-05-10
---

## 1. JPA란

- **JPA (Java Persistence API)**: ORM 기반 데이터 접근 기술. SQL을 개발자 대신 작성·처리해 줌
- **ORM (Object-Relational Mapping)**: 객체는 객체대로, 관계형 DB는 DB대로 설계하고 ORM 프레임워크가 중간에서 매핑. 대중적인 언어 대부분에 ORM 기술이 존재

### 1.1 JPA의 장점

- **SQL 중심 → 객체 중심 개발**
- **생산성**
  - CRUD 생산성이 뛰어남
- **유지보수**
  - 필드 변경 시 모든 SQL을 수정할 필요 없이, JPA가 SQL을 처리하므로 필드만 추가하면 됨
- **패러다임 불일치 해결**
  - 상속, 연관관계, 객체 그래프 탐색 등 DB와 맞지 않는 부분을 JPA가 해결
- **성능**
  - **1차 캐시와 동일성 보장**
    - 같은 트랜잭션 안에서 같은 엔티티 반환 → 약간의 조회 성능 향상
    - DB Isolation Level이 Read Committed여도 애플리케이션에서 Repeatable Read 보장 (SQL을 한 번만 실행)
  - **트랜잭션을 지원하는 쓰기 지연**
    - 트랜잭션 커밋 시까지 INSERT SQL을 모음
    - JDBC BATCH 기능으로 한 번에 SQL 전송
  - **지연 로딩 (Lazy Loading)**
    - 객체가 실제 사용될 때 로딩
    - 즉시 로딩(Eager)은 JOIN SQL로 연관 객체를 모두 조회
- 데이터 접근 추상화와 벤더 독립성
- 표준

## 2. 영속성 관리

- **영속성 컨텍스트**: 엔티티를 영구 저장하는 환경
- **엔티티 매니저**를 통해 접근

```java
EntityManager.persist(entity);
```

- 요청이 일어나면 `EntityManager`가 생성되고, 이 매니저로만 데이터에 접근 가능
- 각 `EntityManager`는 정해진 영속성 컨텍스트를 참조하여 데이터를 다룸
- Spring 같은 프레임워크 환경에서는 **여러 `EntityManager`가 하나의 영속성 컨텍스트를 공유**

### 2.1 엔티티의 생명주기

| 상태 | 설명 | 예 |
|---|---|---|
| **비영속 (new/transient)** | 영속성 컨텍스트와 무관한 새로운 상태 | `Member member = new Member();` |
| **영속 (managed)** | 영속성 컨텍스트가 관리하는 상태 | `em.persist(member);` |
| **준영속 (detached)** | 영속성 컨텍스트에 저장됐다가 분리된 상태. 관리 대상이 아니므로 dirty check 없음. 식별자(id)는 존재 | `em.detach(member);` |
| **삭제 (removed)** | 삭제된 상태 | `em.remove(member);` |

![엔티티 생명주기](images/jpa-intro-01.webp)

## 3. 영속성 컨텍스트의 특징

- **1차 캐시**
  - 엔티티를 `persist`하면 영속 컨텍스트의 **1차 캐시**에 들어감
  - 컨텍스트 안의 엔티티는 1차 캐시에서 조회됨
  - 1차 캐시에 없으면 DB에 SQL을 날려 가져온 뒤, 1차 캐시에 저장하고 반환

  ![1차 캐시 동작](images/jpa-intro-02.webp)

- **동일성 보장**: 1차 캐시에서 조회하므로 반복 가능한 읽기가 애플리케이션 차원에서 가능
- **트랜잭션을 지원하는 쓰기 지연**
  - 트랜잭션 시작 후, `persist`로 1차 캐시에 저장
  - INSERT SQL은 영속 컨텍스트의 **쓰기 지연 SQL 저장소**에 모임
  - 커밋 시점에 `flush`로 SQL을 한 번에 DB로 전송
- **변경 감지 (dirty checking)**
  - 1차 캐시에는 **스냅샷**이 존재
  - `flush` 시 스냅샷과 비교해 변경된 부분이 있으면 자동으로 UPDATE SQL을 DB에 전송

## 4. flush

**flush**: 영속성 컨텍스트의 변경 내용을 DB에 반영. 다음 동작이 포함됨.

- 변경 감지
- 수정된 엔티티를 쓰기 지연 SQL 저장소에 등록
- 쓰기 지연 SQL 저장소의 쿼리를 DB로 전송

### 4.1 flush 발생 시점

- `em.flush()` 직접 호출
- 트랜잭션 커밋 (자동)
- JPQL 쿼리 실행 (자동)

> flush를 했다고 해서 영속성 컨텍스트가 비워지지 않음. 단순히 변경 내용을 DB에 동기화하는 것. **트랜잭션 작업 단위**가 중요함.

## 5. 준영속 상태

- 영속 상태의 엔티티가 영속성 컨텍스트에서 **분리(detached)** 되는 것
- 영속성 컨텍스트의 기능을 사용할 수 없음

| 메서드 | 동작 |
|---|---|
| `em.detach(entity)` | 특정 엔티티만 준영속 상태로 전환 |
| `em.clear()` | 영속성 컨텍스트를 완전히 초기화 |
| `em.close()` | 영속성 컨텍스트 종료 |
