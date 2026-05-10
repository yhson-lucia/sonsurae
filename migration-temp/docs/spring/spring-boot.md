---
title: Spring Boot
slug: spring-boot
category: spring
summary: 스프링 부트의 등장 배경, 내장 WAS, JAR/WAR 구조 정리
tags: [spring, spring-boot, was, jar, war, packaging]
sort_order: null
created: 2025-01-17
updated: 2026-05-10
---

## 1. 스프링 부트 개요

복잡한 설정 과정을 줄이기 위해 만들어짐.

- 단독으로 실행할 수 있는 스프링 애플리케이션을 쉽게 생성
- 관례에 의한 간결한 설정
- **내장 WAS**: Tomcat 같은 웹 서버를 내장해 별도의 웹 서버 설치 불필요
- **라이브러리 관리**
  - 손쉬운 빌드 구성을 위한 starter 종속성 제공
  - 스프링과 외부 라이브러리의 버전을 자동 관리
- **자동 구성**: 프로젝트 시작에 필요한 스프링과 외부 라이브러리의 빈을 자동 등록
- **외부 설정**: 환경에 따라 달라지는 외부 설정 공통화
- **프로덕션 준비**: 모니터링을 위한 메트릭, 상태 확인 기능 제공

## 2. Web Server

외장 서버 vs 내장 서버.

- 자바로 웹 애플리케이션을 개발할 때, 서버에 Tomcat 같은 **WAS(Web Application Server)** 를 설치해 사용함
- WAS에서 동작하도록 서블릿 스펙에 맞춰 코드를 작성하고, **WAR 형식**으로 빌드해서 WAR 파일을 만듦
- 만들어진 WAR 파일을 WAS에 전달·배포하는 방식이 일반적이었음

## 3. JAR

- 자바는 여러 클래스와 리소스를 묶어 **JAR(Java Archive)** 라는 압축 파일을 만들 수 있음
- JAR는 JVM 위에서 직접 실행되거나 다른 곳에서 라이브러리로 사용됨
- 직접 실행하려면 `main()` 메서드가 필요하고, `MANIFEST.MF` 파일에 실행할 메인 메서드가 있는 클래스를 지정해야 함
- 즉, **클래스와 관련 리소스를 압축한 단순한 파일**. 직접 실행할 수도, 라이브러리로 사용할 수도 있음

## 4. WAR

- **WAR (Web Application Archive)**: WAS에 배포할 때 사용하는 파일 형식
- JAR가 JVM 위에서 실행된다면, WAR는 **WAS 위에서 실행**됨
- HTML 같은 정적 리소스와 클래스 파일을 모두 포함하므로 JAR보다 구조가 복잡함. 정해진 WAR 구조를 지켜야 함

### 4.1 WAR 구조

| 경로 | 설명 |
|---|---|
| `WEB-INF/` | 자바 클래스, 라이브러리, 설정 정보가 들어가는 곳 |
| `WEB-INF/classes/` | 실행 클래스 모음 |
| `WEB-INF/lib/` | 라이브러리 모음 |
| `WEB-INF/web.xml` | 웹 서버 배치 설정 파일 (생략 가능) |
| `index.html` | 정적 리소스 |
