---
title: Spring MVC
slug: mvc
category: spring/spring-mvc
summary: 서블릿, MVC 패턴의 등장, Spring MVC의 DispatcherServlet 구조와 ViewResolver, 주요 애노테이션
tags: [spring, mvc, servlet, dispatcher, view-resolver, annotation]
sort_order: null
created: 2025-01-17
updated: 2026-05-10
---

## 1. 서블릿 (Servlet)

- **서블릿**: 자바 기반 웹 애플리케이션을 개발할 때, 클라이언트 요청을 처리하고 **동적으로 응답을 생성**하는 서버 측 컴포넌트
- HTTP 요청/응답 처리에 사용되며, 웹 서버와 클라이언트(웹 브라우저) 간 통신을 담당
- **`HttpServletRequest`**: HTTP 요청 메시지를 파싱해 편리하게 제공
- **`HttpServletResponse`**: HTTP 응답 메시지 생성을 도와주는 객체

### 1.1 서블릿과 JSP의 차이

서블릿과 JSP(Java Server Pages)는 모두 자바 기반 웹 애플리케이션 개발에 사용되지만, 목적과 사용 방식에 차이가 있음.

- **서블릿**: 자바 코드로 구성된 서버 측 로직 처리 클래스
  - 클라이언트 요청을 받고, 비즈니스 로직을 처리한 뒤 결과를 응답
- **JSP**: HTML과 자바 코드를 결합한 템플릿 엔진. 동적 웹 페이지 생성에 사용
- 일반적으로 서블릿은 비즈니스 로직, JSP는 뷰를 처리

## 2. MVC 구조와 흐름

**MVC (Model-View-Controller)**: 비즈니스 로직은 컨트롤러에서 수행, 화면 표시는 뷰(View), 데이터는 모델(Model)에 저장하는 구조. 비즈니스 로직과 뷰 로직을 분리해 유지보수에 적합한 코드 설계가 가능.

### 2.1 비즈니스 로직과 뷰 로직 분리 과정

#### 중복 코드 문제

뷰로 이동하는 코드가 여러 컨트롤러에서 반복되며 공통 처리가 어려움.

- `RequestDispatcher`를 이용한 코드 중복: `HttpServletRequest`/`Response`의 데이터를 `Dispatcher`로 접근해 원하는 데이터를 꺼내고 전달해야 함. 가져오는 데이터만 다를 뿐 흐름은 모든 과정에서 동일하므로 같은 코드가 중복됨
- **해결책**: 중복 코드를 공통 처리 부분으로 묶고, **Front Controller**로 분리

#### Front Controller 단계별 최적화

**1단계** — `HttpServletRequest`/`Response`를 직접 받아 원하는 JSP에 넘겨주도록 설계

```java
public void process(HttpServletRequest request, HttpServletResponse response)
        throws ServletException, IOException {

    String username = request.getParameter("username");
    int age = Integer.parseInt(request.getParameter("age"));

    Member member = new Member(username, age);
    memberRepository.save(member);
    request.setAttribute("member", member);

    String viewPath = "/WEB-INF/views/save-result.jsp";
    RequestDispatcher dispatcher = request.getRequestDispatcher(viewPath);
    dispatcher.forward(request, response);
}
```

여전히 다음과 같은 viewPath 처리 코드가 모든 컨트롤러에서 반복됨.

```java
String viewPath = "/WEB-INF/views/new-form.jsp";
RequestDispatcher dispatcher = request.getRequestDispatcher(viewPath);
dispatcher.forward(request, response);
```

**2단계** — View 객체를 공통으로 만들어 중복 코드를 분리. viewPath를 반환하도록 설계

```java
public void render(HttpServletRequest request, HttpServletResponse response)
        throws ServletException, IOException {
    RequestDispatcher dispatcher = request.getRequestDispatcher(viewPath);
    dispatcher.forward(request, response);
}
```

렌더링되는 부분을 객체로 만들어 최적화.

**3단계** — 서블릿 종속성과 뷰 이름 중복 제거

- `HttpServletRequest`/`Response` 전체를 받지 않고, 필요한 데이터만 별도 객체로 만들어 반환하면 서블릿 기술에 종속되지 않게 설계 가능
- viewPath의 물리적 위치는 보통 같은 디렉토리이므로, **논리 이름만 반환**하도록 최적화 가능

**4단계** — 핸들러 어댑터 추가. 원하는 컨트롤러를 선택적으로 사용할 수 있도록 구현하면, 원하는 컨트롤러를 원하는 시점에 사용 가능

이로써 비즈니스 로직과 뷰 로직 분리, 유지보수에 적합한 코드 설계 달성.

## 3. Spring MVC 구조

![Spring MVC DispatcherServlet 흐름](images/mvc-01.webp)

스프링 MVC는 **`DispatcherServlet`** 을 중심으로 동작하며, HTTP 요청 처리 → 응답 생성의 흐름을 체계적으로 관리함.

1. **`DispatcherServlet`** 이 서블릿으로 등록되어 모든 HTTP 요청을 처리
2. `service()` 메서드 호출 후 `DispatcherServlet.doDispatch()` 로 요청 처리
3. **Handler 조회** 후 **`HandlerAdapter`** 가 Handler를 실행
4. **`ModelAndView`** 객체 반환 및 View 렌더링
5. **`ViewResolver`** 로 논리 뷰 이름을 물리적 경로로 변환해 최종 뷰 반환

## 4. Handler Mapping

스프링 MVC에서 컨트롤러가 호출되려면 2가지 조건이 필요함.

1. **HandlerMapping**에서 해당 컨트롤러를 찾을 수 있어야 함
2. 찾은 핸들러를 실행할 수 있는 **HandlerAdapter**가 있어야 함

- `HandlerMapping`은 애노테이션 기반 컨트롤러인 `@RequestMapping`에서 사용 (99%). 스프링 빈의 이름으로도 찾을 수 있음
- `HandlerAdapter` 또한 `@RequestMapping`에서 사용·조회됨

## 5. ViewResolver

- 핸들러 어댑터를 통해 **논리 뷰 이름**(예: `post`)을 획득
- `ViewResolver`가 호출됨
- `post`라는 뷰 이름으로 등록된 `ViewResolver`를 **순서대로** 호출 (우선순위 존재)
  - **`BeanNameViewResolver`**: `post`라는 이름의 스프링 빈으로 등록된 뷰를 찾음
  - **`InternalResourceViewResolver`**: JSP처럼 `forward`로 처리할 수 있는 경우 사용
  - **`ThymeleafViewResolver`**: Thymeleaf 뷰 템플릿용. 라이브러리만 추가하면 스프링 부트가 자동 등록함
- `view.render()`가 호출되며 렌더링됨

## 6. 스프링 MVC 애노테이션

| 애노테이션 | 설명 |
|---|---|
| `@RequestMapping` | `RequestMappingHandlerMapping`/`RequestMappingHandlerAdapter`를 지원. 매핑 정보를 등록하고, 해당 URL이 호출되면 메서드가 실행됨 |
| `@Controller` | 자동으로 스프링 빈으로 등록 (내부에 `@Component`가 있어 컴포넌트 스캔 대상) |
| `@RequestParam` | HTTP 요청 파라미터를 애노테이션 기반으로 받음. `@RequestParam("username")` ≈ `request.getParameter("username")` |
| `@GetMapping`, `@PostMapping` | HTTP 메서드까지 함께 구분 |
| `@RestController` | `@Controller`는 String 반환 시 뷰 이름으로 인식되지만, `@RestController`는 HTTP 메시지 바디에 바로 입력 |
| `@PathVariable` | URL 경로를 템플릿화해서 매칭되는 부분을 조회. 변수명과 파라미터명이 같으면 생략 가능 |
| `@ModelAttribute` | 요청 파라미터를 받아 객체를 생성하고 값을 바인딩하는 과정을 자동화. 객체 생성 → 요청 파라미터 이름으로 객체의 프로퍼티를 찾고, 있으면 setter 호출로 바인딩 |
