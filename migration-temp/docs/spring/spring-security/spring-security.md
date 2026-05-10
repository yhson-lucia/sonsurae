---
title: Spring Security
slug: spring-security
category: spring/spring-security
summary: 인증·인가 개념, Spring Security 구성요소, 필터 체인, RBAC, 토큰 기반 인증 정리
tags: [spring, security, authentication, authorization, rbac, jwt, csrf]
sort_order: null
created: 2025-01-17
updated: 2026-05-10
---

## 1. 인증과 인가

- **인증 (Authentication)**: 사용자가 주장하는 신원이 실제인지 확인하는 과정
  - 방식: 비밀번호(보안 위험 있음), 2단계 인증(추가 절차), 생체 인식(개인의 고유 정보), 토큰 기반(발급 후 인증, 세션 관리 불필요)
- **인가 (Authorization)**: 사용자가 무엇을 할 수 있는지 결정
  - 방식: **RBAC**(역할 기반 권한 부여), **ACL**(특정 사용자에게 리소스 접근 부여)

### 1.1 보안의 3대 원칙

- **기밀성 (Confidentiality)**: 권한이 있는 사용자만 데이터에 접근
- **무결성 (Integrity)**: 데이터의 정확성·완전성이 보장되어야 함
- **가용성 (Availability)**: 필요할 때 데이터와 리소스에 접근할 수 있어야 함

### 1.2 보안 메커니즘

- **암호화**: 컴퓨터 기반 알고리즘 사용
- **SSL/TLS**: 인터넷 네트워크 통신을 보호하는 보안 프로토콜
- **접근 제어**: MAC, DAC, 세션 관리

## 2. Spring Security

- 자바 기반 보안 프레임워크
- 모듈화·확장성 우수
- HTTP 요청 처리 시 보안 관련 작업 수행

### 2.1 구성 요소

| 구성 요소 | 역할 |
|---|---|
| `AuthenticationManager` | 인증 담당. 유효성 검사 |
| `SecurityContext` / `SecurityContextHolder` | 사용자 정보 저장. 인증 정보에 접근 |
| `AccessDecisionManager` | 특정 자원에 대한 접근 결정 (사용자 권한 ↔ 요청 매치) |
| `UserDetailsService` | 사용자 정보 로드 (DB 또는 외부 소스) |
| `UsernamePasswordAuthenticationFilter` / `JwtAuthenticationFilter` | 인증 메커니즘 필터 |

### 2.2 인증 메커니즘

- **사용자 이름 + 비밀번호** → `AuthenticationManager`(검증) → `Authentication` 객체 반환
- **OAuth**: OAuth 관련 필터를 처리
- **JWT**: JWT 관련 필터를 처리. 다양한 인증 옵션 제공

### 2.3 보안 필터 체인

- 필터는 HTTP 요청·응답을 가로채 보안 작업 수행. 인증 메커니즘은 동일
- 흐름: HTTP 요청 → `UsernamePasswordAuthenticationFilter` → `ExceptionTranslationFilter` → `FilterSecurityInterceptor`(권한 부여 처리)
- 각 필터는 독립적으로 동작

### 2.4 역할 기반 접근 제어 (RBAC)

다양한 애노테이션으로 적용할 수 있음.

| 애노테이션 | 동작 |
|---|---|
| `@PreAuthorize("hasRole('Admin')")` | 메서드 실행 전 권한 검사. 특정 권한 보유자만 호출 가능 |
| `@PostAuthorize("returnObject.owner == principal.username")` | 메서드 실행 후 반환 결과에 따라 접근 제어 |
| `@Secured("ROLE_USER")` | 특정 역할의 사용자만 실행 가능 |

URL 기반 접근 제어: 특정 URL 패턴별로 호출을 허용·거부.

![URL 기반 접근 제어](images/spring-security-01.webp)

### 2.5 보안 컨텍스트와 인증 객체

- Spring Security가 인증 정보를 저장하는 메커니즘
- `SecurityContextHolder`를 통해 애플리케이션 어느 곳에서나 접근 가능
- 인증 객체는 사용자 식별 정보 등을 포함. 생성해서 보안 컨텍스트에 저장

### 2.6 사용자 정의 보안 설정

`SecurityConfig`로 사용자 상황에 맞는 보안 설정을 지정.

### 2.7 쿠키와 세션의 문제점

- 웹 사용성을 향상시키지만 보안 취약점이 많음
- 데이터 노출 위험, 세션 탈취 위험
- 세션 고정/만료 관리 → 세션 ID, HTTPS, 데이터 암호화, 재생성 필요
- **XSS 공격, CSRF 공격** 가능성
- 보안 설정 부재 시 위험
- 실제 사례
  - SNS 세션 탈취
  - 온라인 뱅킹 CSRF (가짜 PC website를 통한 접근)
  - 이커머스 데이터 유출 (취약한 보안으로 개인 정보 대량 유출)
- **XSS**: 공격자가 website에 가짜 script를 삽입해 실행
- **CSRF**: 사용자가 인증된 상태에서 악의적인 요청을 보내게 만듦 (계좌 이체, 비밀번호 변경 등)

이러한 문제 때문에 보안 강화 대안이 등장함.

- **토큰 기반 인증**: JWT 토큰 발행. 보안성·확장성 우수
- **OAuth**: 사용자 인증·권한 부여 개방형 표준. 외부 서비스와의 안전한 인증·데이터 접근. SNS 로그인에 사용
- **OpenID Connect**
- **웹 스토리지**: 쿠키의 대체 수단. 서버에 저장되지 않고 클라이언트 측에 저장
- **IndexedDB**

## 3. 토큰 기반 인증 시스템

- 사용자 인증을 위한 핵심 시스템
- 흐름: 로그인 → 사용자 검증 → 고유 토큰 생성·전달 → 일정 시간 동안 토큰으로 권한 유지
- 대부분 JWT 사용
- 서버는 토큰의 유효성만 검증하면 되므로 **세션 상태를 유지할 필요 없음**

### 3.1 장점

- 세션 정보를 클라이언트에서 관리해 서버 부담 감소, 공격 범위 축소 → 보안성 강화
- 상태를 유지하지 않으므로 시스템의 확장성·유연성 증가
- 세밀한 접근 제어 및 권한 부여 가능
- **단일 로그인(SSO) 구현 용이**: 다양한 애플리케이션·서비스 간 인증 정보 공유. 사용자는 한 번의 로그인으로 사용 가능

### 3.2 토큰 vs 세션

| 구분 | 토큰 | 세션 |
|---|---|---|
| 인증 정보 위치 | 클라이언트 (토큰) | 서버 (세션 저장소) |
| 인증 방식 | 토큰을 받아 이후 요청에 포함 | 세션 ID로 인증 |
| 보안 관리 포인트 | 토큰 관리·유출 방지 | 서버 직접 관리. 보안 강화 |
| 확장성 | 우수 (stateless) | 제한적 |

![토큰 vs 세션 상태 비교](images/spring-security-02.webp)

### 3.3 토큰 보안 고려사항

- 토큰의 안전한 생성
- 전송 보안 (HTTPS 등)
- 저장 방법 (쿠키 등에 저장 시 적절한 보안 적용)
- 유효 기간 관리
- 접근 제어 및 권한 관리
- 토큰 갱신 및 폐기

### 3.4 실제 적용 흐름

1. 토큰 발급 및 관리 (JWT)
2. 클라이언트 측 토큰 저장 (로컬 스토리지 등)
3. 토큰을 사용한 요청 인증 (HTTP header에 포함)
4. 토큰 갱신 및 만료 관리
