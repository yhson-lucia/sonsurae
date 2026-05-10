---
title: 요청 매핑
slug: request-mapping
category: spring/spring-mvc
summary: 스프링 MVC의 요청 파라미터 처리, HTTP 메시지 바디 처리, HttpMessageConverter 동작 정리
tags: [spring, mvc, request-mapping, request-body, http-message-converter, json]
sort_order: null
created: 2025-01-17
updated: 2026-05-10
---

## 0. 컨트롤러 기본 애노테이션

- **`@Controller`**: MVC에서 Model에 객체나 String을 저장하고 view로 렌더링. 반환값이 객체면 view에서 resolve 후 HttpRequest를 forward하지만, **String으로 논리 이름만 반환**하면 그 논리 이름으로 뷰를 찾음
- **`@RestController`**: 반환값으로 뷰를 찾는 대신 **HTTP message body에 바로 입력**. 결과로 OK 메시지 등을 받을 수 있음. 모든 핸들러에 `@ResponseBody`가 적용되는 효과. REST API 작성에 사용
- **`@RequestMapping(...)`**: 해당 URL 호출 시 메서드를 실행. 배열로 여러 URL 매핑 가능. HTTP 메서드별로는 `@GetMapping`, `@PostMapping`, `@PatchMapping`, `@DeleteMapping`
- **`@RequestHeader`**: 헤더 정보를 조회. `MultiValueMap` 또는 특정 HTTP 헤더로 조회 가능

## 1. HTTP 요청 파라미터

HTTP 요청 파라미터를 받는 방법은 3가지.

### 1.1 GET 쿼리 파라미터

- 예: `/url?username=hello&age=20`
- 메시지 바디 없이 URL의 쿼리 파라미터에 데이터를 포함해 전달
- 검색, 필터, 페이징 등에서 많이 사용

### 1.2 POST HTML Form

- `Content-Type: application/x-www-form-urlencoded`
- 메시지 바디에 쿼리 파라미터 형식으로 전달 (`username=hello&age=20`)
- 회원가입, 상품 주문 등에서 사용
- `HttpServletRequest`의 `request.getParameter()`를 사용하면 GET 쿼리 파라미터와 POST HTML Form 모두 **같은 형식**으로 구분 없이 조회 가능

### 1.3 HTTP message body에 데이터 직접 담아서 요청

- HTTP API에서 주로 사용. JSON, XML, TEXT 등 모든 데이터 가능
- 데이터 형식은 주로 JSON
- POST, PUT, PATCH 등에서 사용

### 1.4 관련 애노테이션

- **`@RequestParam`**: 파라미터를 관리하는 애노테이션. 파라미터 이름으로 바인딩
- **`@ResponseBody`**: 뷰 조회를 무시하고 HTTP message body에 직접 내용을 입력
- **`@ModelAttribute`**: 요청 파라미터를 받아 객체를 생성하고 값을 바인딩하는 과정을 자동화

```java
public String modelAttribute1(@ModelAttribute Data data) { ... }
```

위 코드는 `Data` 객체에 요청 파라미터 이름으로 된 프로퍼티를 찾고, setter를 호출해 값을 바인딩함. 바인딩할 프로퍼티의 타입이 다르면 `BindException`이 발생함.

`@ModelAttribute`와 `@RequestParam`은 **모두 생략 가능**. `@RequestParam`은 기본 타입에 주로 바인딩하고, `@ModelAttribute`는 그 외 타입에 바인딩하므로 함께 생략해도 충돌하지 않음.

## 2. HTTP 요청 메시지

`@RequestParam`과 `@ModelAttribute`는 **HTTP 메시지 바디**를 통해 넘어오는 파라미터에는 사용할 수 없음. 이때는 다음 방법을 사용.

- **`InputStream(Reader)`**: HTTP 요청 메시지 바디 내용을 직접 조회
- **`OutputStream`**: HTTP 응답 메시지 바디에 직접 결과를 출력
- **`HttpEntity`**: HTTP header, body 정보를 편리하게 조회/반환
  - 메시지 바디 정보를 직접 조회/반환 가능
  - 요청 파라미터 조회와는 무관
  - 헤더 정보도 처리 가능
  - view 조회는 불가
  - 파생 객체
    - **`RequestEntity`**: HttpMethod, URL 정보 추가. 요청에서 사용
    - **`ResponseEntity`**: HTTP 상태 코드 설정 가능. 응답에서 사용
- **`@RequestBody`**: HTTP 메시지 바디 정보를 편리하게 조회. 헤더는 `HttpEntity` 또는 `@RequestHeader` 사용

### 2.1 JSON 데이터 형식 조회

가장 기본적인 방식: JSON을 `ServletInputStream`으로 받은 뒤 String으로 변환. 그다음 `ObjectMapper`(Jackson 라이브러리)로 자바 객체로 변환.

```java
@PostMapping("/request-body-json-v1")
public void requestBodyJsonV1(HttpServletRequest request,
                              HttpServletResponse response) throws IOException {

    ServletInputStream inputStream = request.getInputStream();    // request를 InputStream으로 받음
    String messageBody = StreamUtils.copyToString(inputStream, StandardCharsets.UTF_8);

    log.info("messageBody={}", messageBody);
    HelloData data = objectMapper.readValue(messageBody, HelloData.class);   // 핵심: JSON → 객체 변환
    log.info("username={}, age={}", data.getUsername(), data.getAge());

    response.getWriter().write("ok");
}
```

두 번째 방식: `request`를 직접 받지 않고 `@RequestBody`로 메시지를 한 번에 받은 뒤 `ObjectMapper`로 변환.

```java
@ResponseBody
@PostMapping("/request-body-json-v2")
public String requestBodyJsonV2(@RequestBody String messageBody) throws IOException {
    HelloData data = objectMapper.readValue(messageBody, HelloData.class);
    log.info("username={}, age={}", data.getUsername(), data.getAge());
    return "ok";
}
```

두 방식 모두 JSON 문자열을 `ObjectMapper`로 변환함. 이 과정은 더 간소화 가능.

- **`@RequestBody`를 객체 형태로 받기**: String 대신 객체로 받으면, HTTP 메시지 바디 내용을 원하는 객체로 자동 변환해 줌. 이 변환은 **HTTP Message Converter**가 수행함
- **`@RequestParam`/`@ModelAttribute`는 생략 가능**하지만, **`@RequestBody`는 생략하면 안 됨** (다른 동작과 혼동되므로)

## 3. HttpMessageConverter

`@ResponseBody`의 사용 원리.

![@ResponseBody와 HttpMessageConverter 동작](images/request-mapping-01.webp)

스프링 MVC는 다음 상황에 HTTP 메시지 컨버터를 적용함.

- **HTTP 요청**: `@RequestBody`, `HttpEntity(RequestEntity)`
- **HTTP 응답**: `@ResponseBody`, `HttpEntity(ResponseEntity)`

요청·응답 모두 동일한 방식으로 적용됨.

스프링 부트를 켜면 내장 톰캣 서버와 컴포넌트 스캔에 의해 스프링 컨테이너에 빈이 등록됨. Controller는 컴포넌트 스캔 대상이라 자동 등록되고, 웹 브라우저 요청이 오면 URL에 매핑된 컨트롤러가 호출됨. 이때 `@ResponseBody` 애노테이션이 있으면, 반환값이 ViewResolver를 통해 뷰로 처리되지 않고 **`HttpMessageConverter`** 가 호출되어 문자/객체 처리 후 HTTP Body에 직접 반환됨.
