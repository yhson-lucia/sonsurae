---
title: 커넥션 풀
slug: connection-pool
category: jdbc
summary: 커넥션 풀의 등장 배경, HikariCP, DataSource 인터페이스 추상화
tags: [jdbc, connection-pool, hikaricp, datasource, performance]
sort_order: null
created: 2025-01-17
updated: 2026-05-10
---

## 1. 커넥션 풀

### 1.1 배경

데이터베이스 커넥션을 획득할 때마다 DB 드라이버 조회, 연결, 커넥션 생성 과정이 반복됨. TCP/IP 연결을 위한 네트워크 동작도 매번 발생함. 커넥션을 계속 새로 생성하는 시간이 응답 속도에 영향을 주기 때문에 **커넥션 풀** 개념이 등장함.

### 1.2 커넥션 풀의 동작

- 커넥션을 **미리 생성해 두고 재사용**하는 방식
- 애플리케이션 시작 시점에 필요한 만큼의 커넥션을 미리 확보해 풀에 보관. TCP/IP 연결도 미리 맺어 둠
- 호출 측이 사용하면 즉시 SQL을 DB로 전달 가능
- 로직 종료 시 커넥션을 풀로 **반환**. 반환된 커넥션은 연결을 유지한 채 다음 호출까지 풀에 대기
- 종류는 여러 가지 있지만 대부분 **HikariCP** 사용
- 서버당 최대 커넥션 수를 제한할 수 있어 **DB 보호** 효과도 있음

## 2. DataSource

### 2.1 배경

커넥션을 `DriverManager`로 획득하거나, 다양한 종류의 커넥션 풀로 획득하는 방식이 존재함. 이 경우 커넥션 방식을 바꾸면 애플리케이션 코드도 모두 함께 변경해야 하는 문제가 생김. 이를 인터페이스로 추상화한 것이 **`DataSource`**.

### 2.2 DataSource

커넥션을 획득하는 방법을 추상화한 인터페이스. `DataSource`를 호출하면 구현 방식과 무관하게 커넥션을 획득할 수 있음.

```java
void dataSourceDriverManager() throws SQLException {
    DriverManagerDataSource dataSource =
            new DriverManagerDataSource(URL, USERNAME, PASSWORD);
    useDataSource(dataSource);
}

private void useDataSource(DataSource dataSource) throws SQLException {
    // DataSource로부터 커넥션 획득
    // 커넥션 풀을 사용해도 동일한 인터페이스로 호출됨
    Connection con1 = dataSource.getConnection();
    Connection con2 = dataSource.getConnection();
    log.info("connection={}, class={}", con1, con1.getClass());
    log.info("connection={}, class={}", con2, con2.getClass());
}
```
