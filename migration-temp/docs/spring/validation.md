---
title: 검증 (Validation)
slug: validation
category: spring
summary: 스프링 컨트롤러의 클라이언트/서버 검증과 BindingResult 정리
tags: [spring, validation, binding-result, model-attribute]
sort_order: null
created: 2025-01-17
updated: 2026-05-10
---

## 1. Validation

컨트롤러의 중요한 역할 중 하나가 **HTTP 요청이 정상인지 검증**하는 것.

검증의 종류

- **클라이언트 검증**: JavaScript로 수행하는 검증
  - 단점: 서버로 가는 데이터를 조작해서 우회할 수 있어 보안에 취약
- **서버 검증**: HTTP 요청을 받아 컨트롤러나 서버에서 검증
  - 단점: 즉각적인 사용성 부족, 피드백이 느림 (서버에 계속 요청을 보내야 함)
- 둘을 적절히 섞어 사용해야 함
- API 방식이라면 API 스펙을 잘 정의해 검증 오류를 응답에 명확히 담아 전달해야 함

## 2. BindingResult

스프링이 제공하는 **검증 오류를 보관하는 객체**.

- `@ModelAttribute`에 바인딩 시 `BindingResult`가 있으면, 오류가 발생해도 그대로 컨트롤러가 호출됨
  - 예: 오류 발생 시 오류 정보(`FieldError`)를 `BindingResult`에 담아 컨트롤러 정상 호출
- `BindingResult`에 검증 오류를 적용하는 방법
  1. `@ModelAttribute` 객체에 타입 오류 등 바인딩 실패 시, 스프링이 `FieldError`를 생성해 `BindingResult`에 넣어 줌
  2. 개발자가 직접 넣음
  3. `Validator`를 사용
- `BindingResult`는 **순서가 매우 중요**. `@ModelAttribute` 바로 뒤에 와야 함
