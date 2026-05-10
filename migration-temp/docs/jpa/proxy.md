---
title: 프록시
slug: proxy
category: jpa
summary: JPA 프록시 객체의 동작, 특징, 초기화/확인 방법 정리
tags: [jpa, proxy, lazy-loading, hibernate, persistence-context]
sort_order: 5
created: 2025-01-17
updated: 2026-05-10
---

## 1. 프록시 기초

- **`em.getReference()`**: `em.find()`와 달리 **DB 조회를 미루는 가짜(프록시) 엔티티 객체**를 조회
- 프록시는 **실제 클래스를 상속받아** 만들어짐
- 실제 클래스와 겉모양이 같음
- 사용하는 입장에서는 진짜 객체인지 프록시인지 구분 없이 사용 가능
- 프록시 객체는 실제 객체의 참조(`target`)를 보관

![프록시 객체 구조](images/proxy-01.webp)

- 프록시 객체를 호출하면 실제 객체의 메서드를 호출하기 위해 영속성 컨텍스트에 **초기화 요청**을 보냄 (진짜 값을 가져오라고 명령)
- 한 번 초기화하면 `target`이 채워져, 다시 초기화할 일은 없음
- 영속성 컨텍스트는 DB에서 조회해 실제 엔티티를 생성하고, 프록시가 이 값을 사용

## 2. 프록시의 특징

- 프록시 객체는 **처음 사용할 때 한 번만 초기화**
- 초기화 시 프록시 객체가 **실제 엔티티로 바뀌는 것이 아님**. 프록시를 통해 실제 엔티티에 접근하는 것
- 프록시는 원본 엔티티를 **상속**받음. 따라서 타입 체크 시 `==` 가 아니라 **`instanceof`** 를 사용해야 함
- 영속성 컨텍스트에 찾는 엔티티가 이미 있으면 `em.getReference()`를 호출해도 **실제 엔티티를 반환**
- 영속성 컨텍스트의 도움을 받을 수 없는 **준영속 상태**에서 프록시를 초기화하면 문제가 발생 (Hibernate는 `org.hibernate.LazyInitializationException` 예외를 던짐)

## 3. 프록시 확인

| 목적 | 방법 |
|---|---|
| 초기화 여부 확인 | `emf.getPersistenceUnitUtil().isLoaded(entity)` |
| 프록시 클래스 확인 | `entity.getClass().getName()` 출력 → `..javassist..` 또는 `HibernateProxy...` 포함 시 프록시 |
| 강제 초기화 | `org.hibernate.Hibernate.initialize(entity);` |
