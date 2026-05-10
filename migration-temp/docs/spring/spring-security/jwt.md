---
title: JWT
slug: jwt
category: spring/spring-security
summary: JWT의 구조(Header/Payload/Signature)와 작동 방식, Spring Security 기반 JWT 로그인 시스템 구축 예시
tags: [spring, security, jwt, authentication, token, filter]
sort_order: null
created: 2025-01-17
updated: 2026-05-10
---

## 1. JWT

- **JWT (JSON Web Token)**: JSON 객체를 이용해 정보를 안전하게 전달하는 토큰
- 형태: `Header.Payload.Signature` (점으로 구분된 3부분)

### 1.1 구성

| 부분 | 내용 |
|---|---|
| **Header** | 토큰 유형과 서명 알고리즘 (예: HS256) |
| **Payload** | ID, 이름, 발급 시간 등 정보 (Claims) |
| **Signature** | 무결성 보증을 위한 서명. 비밀키로 검증해야 해석 가능 |

### 1.2 작동 방식

`사용자 로그인` → `토큰 생성` → `HTTP header 또는 URL 파라미터로 전달` → `서버가 토큰에서 정보·권한 추출`

### 1.3 장점

- **보안성 강화**: 서명을 통해 무결성 검증. 중앙 서버 부하 감소
- **확장성·호환성**: stateless. 다양한 플랫폼·서비스에서 사용 가능
- **효율적 인증**: 각 요청마다 DB 요청을 줄여 효율 증가
- **자가 수용적 (self-contained)**: 토큰 자체에 모든 정보 포함. 네트워크 오버헤드 감소
- 단일 로그인(SSO) 구현 용이
- 디버깅·테스팅 용이

## 2. JWT 로그인 시스템 구축

### 2.1 인증 프로세스

1. 사용자 인증 단계 (ID, PW)
2. JWT 생성 및 발급
3. 클라이언트 측 JWT 처리 (모든 요청에 토큰 포함, 보통 HTTP 헤더)
4. 서버에서 JWT 검증 (토큰 서명 확인)
5. 권한 부여 및 리소스 접근 (사용자 역할에 따라 권한 부여)
6. 토큰 만료 및 갱신

### 2.2 의존성 설정

```gradle
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-security'
    implementation 'com.auth0:java-jwt'
}
```

### 2.3 Spring Security에서 JWT 설정

> ※ 아래 예시는 학습 당시(Spring Security 5.x) 기준. Spring Security 5.7+ 에서는 `WebSecurityConfigurerAdapter`가 deprecated되었고 `SecurityFilterChain` 빈 등록 방식이 표준임.

```java
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
            .csrf().disable()
            .authorizeRequests()
                .antMatchers("/api/public/**").permitAll()
                .anyRequest().authenticated()
            .and()
            .addFilter(new MyCustomJwtFilter(authenticationManager()));
    }
}
```

Security 설정 파일에서 커스텀 JWT 필터(`MyCustomJwtFilter`)를 등록해 모든 요청의 토큰을 검증함.

### 2.4 JWT 생성 및 파싱 로직

```java
public class JwtUtil {

    private static final String SECRET_KEY = "your_secret_key";

    public static String createToken(String username) {
        return JWT.create()
                .withSubject(username)
                .withExpiresAt(new Date(System.currentTimeMillis() + (60 * 60 * 24 * 1000)))
                // 24시간 유효 (밀리초 단위이므로 *1000 필요)
                .sign(Algorithm.HMAC512(SECRET_KEY));
    }

    public static String getUsernameFromToken(String token) {
        return JWT.require(Algorithm.HMAC512(SECRET_KEY))
                .build()
                .verify(token)
                .getSubject();
    }
}
```

- **토큰 생성**: `username`을 넣어 토큰 발급. `SECRET_KEY`로 서명 알고리즘에 접근해 보안 강화
- **토큰 파싱**: `token`을 넣어 `username`을 꺼내 옴

### 2.5 Custom 인증 필터

```java
public class MyCustomJwtFilter extends UsernamePasswordAuthenticationFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                     HttpServletResponse response,
                                     FilterChain chain) {
        String token = request.getHeader("Authorization");
        if (!tokenUtil.validate(token)) {
            throw new RuntimeException("인증이 올바르지 않습니다.");
        }
        chain.doFilter(request, response);   // 다음 필터/서블릿으로 넘김
    }
}
```

- Config에서 필터를 설정해 둠
- 요청이 올 때마다 헤더에서 토큰을 꺼내 validation 수행
