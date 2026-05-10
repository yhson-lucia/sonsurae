---
title: 연관관계 관리
slug: association-management
category: jpa
summary: 즉시 로딩과 지연 로딩, 영속성 전이(CASCADE), 고아 객체 제거, 생명주기 관리
tags: [jpa, lazy-loading, eager-loading, cascade, orphan-removal, lifecycle]
sort_order: 4
created: 2025-01-17
updated: 2026-05-10
---

## 1. 즉시 로딩과 지연 로딩

연관관계가 걸려 있다고 해서 모든 데이터를 매번 가져오면 성능이 떨어짐. **필요한 데이터만 가져오는 것**이 지연 로딩.

### 1.1 지연 로딩 (LAZY)

- 프록시로 조회

```java
@ManyToOne(fetch = FetchType.LAZY)
```

- 해당 엔티티 데이터만 가져오고, 매핑된 정보를 실제로 사용할 때 쿼리가 나가서 초기화됨

### 1.2 즉시 로딩 (EAGER)

- 조회할 때 모든 연관 데이터를 한 번에 가져옴
- 프록시가 아닌 실제 객체가 반환됨

```java
@ManyToOne(fetch = FetchType.EAGER)
```

- JPA 구현체는 가능한 경우 JOIN을 사용해 SQL 한 번으로 함께 조회

### 1.3 즉시 로딩의 문제

- 실무에서 **즉시 로딩은 사용하면 안 됨**
- 예상치 못한 SQL이 발생하고, JPQL에서 **N+1 문제**를 일으킴
- `@ManyToOne`, `@OneToOne`은 기본이 즉시 로딩이므로 **반드시 LAZY로 설정** 필요

## 2. 영속성 전이 (CASCADE)

특정 엔티티를 영속 상태로 만들 때 연관된 엔티티도 함께 영속 상태로 만들고 싶을 때 사용. (예: 부모 엔티티 저장 시 자식 엔티티도 함께 저장)

```java
@OneToMany(mappedBy = "parent", cascade = CascadeType.ALL)
```

- **연관관계 매핑과는 무관함**
- 엔티티를 영속화할 때 연관 엔티티도 함께 영속화하는 편의 기능

### 2.1 CASCADE 종류

| 옵션 | 동작 |
|---|---|
| `ALL` | 모두 적용 |
| `PERSIST` | 영속화 |
| `REMOVE` | 삭제 |
| `MERGE` | 병합 |
| `REFRESH` | 새로 고침 |
| `DETACH` | 준영속화 |

## 3. 고아 객체 (Orphan Removal)

- **고아 객체 제거**: 부모 엔티티와 연관관계가 끊어진 자식 엔티티를 자동으로 삭제

```java
@OneToMany(mappedBy = "parent", orphanRemoval = true)
```

```java
Parent parent1 = em.find(Parent.class, id);
parent1.getChildren().remove(0);  // 자식을 컬렉션에서 제거
```

- 참조가 제거된 엔티티는 **다른 곳에서 참조하지 않는 고아 객체**로 보고 삭제
- 참조하는 곳이 하나일 때만 사용해야 함
- 특정 엔티티가 **개인 소유**일 때 사용
- `@OneToOne`, `@OneToMany`에서만 사용 가능

## 4. 영속성 전이 + 고아 객체로 생명주기 관리

`CascadeType.ALL` + `orphanRemoval = true` 조합.

- 보통 엔티티는 스스로 생명주기를 관리 (`em.persist()`로 영속화, `em.remove()`로 제거)
- 두 옵션을 함께 활성화하면 **부모 엔티티를 통해 자식의 생명 주기 관리** 가능
- **DDD (도메인 주도 설계)** 의 **Aggregate Root** 개념을 구현할 때 유용
