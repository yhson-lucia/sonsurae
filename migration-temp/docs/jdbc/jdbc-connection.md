---
title: JDBC Connection
slug: jdbc-connection
category: jdbc
summary: JDBC의 등장 배경, DriverManager를 통한 DB 연결, JDBC를 직접 사용한 CRUD 예시
tags: [jdbc, database, java, driver-manager, sql]
sort_order: null
created: 2025-01-17
updated: 2026-05-10
---

## 1. JDBC의 등장

애플리케이션 서버와 DB의 연결.

- 애플리케이션을 개발할 때 중요한 데이터는 대부분 데이터베이스에 보관함. DB 통신은 다음 3단계를 거침
  1. **커넥션 연결**: TCP/IP를 사용해 커넥션을 연결
  2. **SQL 전달**: 애플리케이션 서버가 DB가 이해할 수 있는 SQL을 커넥션을 통해 전달
  3. **결과 응답**: DB가 SQL을 수행하고 결과를 응답. 애플리케이션 서버는 응답을 활용
- **문제점**: 위 3단계 방식이 데이터베이스마다 다름. 수십 개의 RDB마다 커넥션·SQL 전송·결과 처리 방식이 달라, **DB를 변경하면 애플리케이션의 DB 사용 코드도 함께 변경**해야 함

JDBC(Java Database Connectivity)는 이 문제를 해결하기 위한 **표준 인터페이스**. 데이터베이스마다 Connection / Statement / ResultSet 구현체를 드라이버로 제공함.

## 2. DB 연결

JDBC로 실제 데이터베이스에 연결하려면 `Connection`을 획득함.

- `DriverManager.getConnection(URL, USERNAME, PASSWORD)`를 사용하면, 라이브러리에 등록된 DB 드라이버를 찾아 해당 드라이버가 제공하는 커넥션을 반환함

```java
Connection connection = DriverManager.getConnection(URL, USERNAME, PASSWORD);
```

- `DriverManager`는 라이브러리에 등록된 DB 드라이버를 자동으로 인식. 정보를 넘겨 커넥션을 획득할 수 있는지 확인
- 찾은 커넥션 구현체가 클라이언트로 반환됨

![JDBC DriverManager로 커넥션 획득](images/jdbc-connection-01.webp)

## 3. JDBC CRUD

JDBC를 사용해 커넥션을 획득하고, SQL을 DB로 보내고, 결과를 받아 등록·조회·수정·삭제를 수행할 수 있음.

### 3.1 등록 (INSERT)

```java
package hello.jdbc.repository;

import hello.jdbc.connection.DBConnectionUtil;
import hello.jdbc.domain.Member;
import lombok.extern.slf4j.Slf4j;

import java.sql.*;

@Slf4j
public class MemberRepositoryV0 {

    public Member save(Member member) throws SQLException {
        String sql = "insert into member(member_id, money) values(?, ?)";

        Connection con = null;
        PreparedStatement pstmt = null;  // Statement의 자식 타입. ?에 파라미터 바인딩 가능

        try {
            con = getConnection();
            pstmt = con.prepareStatement(sql);          // 전달할 SQL과 파라미터 준비
            pstmt.setString(1, member.getMemberId());   // 첫 번째 ?에 String 바인딩
            pstmt.setInt(2, member.getMoney());         // 두 번째 ?에 int 바인딩
            pstmt.executeUpdate();                       // SQL 실행. 영향받은 row 수 반환
            return member;
        } catch (SQLException e) {
            log.error("db error", e);
            throw e;
        } finally {
            close(con, pstmt, null);
            // 예외 발생 여부와 무관하게 connection은 반드시 닫아야 함
            // 닫는 순서: ResultSet → PreparedStatement → Connection
        }
    }

    private void close(Connection con, Statement stmt, ResultSet rs) {
        if (rs != null) {
            try { rs.close(); } catch (SQLException e) { log.info("error", e); }
        }
        if (stmt != null) {
            try { stmt.close(); } catch (SQLException e) { log.info("error", e); }
        }
        if (con != null) {
            try { con.close(); } catch (SQLException e) { log.info("error", e); }
        }
    }

    private Connection getConnection() {
        return DBConnectionUtil.getConnection();
    }
}
```

### 3.2 조회 (SELECT)

```java
public Member findById(String memberId) throws SQLException {
    String sql = "select * from member where member_id = ?";

    Connection con = null;
    PreparedStatement pstmt = null;
    ResultSet rs = null;

    try {
        con = getConnection();
        pstmt = con.prepareStatement(sql);
        pstmt.setString(1, memberId);
        rs = pstmt.executeQuery();   // 결과를 ResultSet으로 반환

        if (rs.next()) {
            // ResultSet은 0부터 시작. next()로 다음 행으로 이동
            Member member = new Member();
            member.setMemberId(rs.getString("member_id"));
            member.setMoney(rs.getInt("money"));
            return member;
        } else {
            throw new NoSuchElementException("member not found memberId=" + memberId);
        }
    } catch (SQLException e) {
        log.error("db error", e);
        throw e;
    } finally {
        close(con, pstmt, rs);
    }
}
```

### 3.3 수정 (UPDATE)

```java
public void update(String memberId, int money) throws SQLException {
    String sql = "update member set money=? where member_id=?";

    Connection con = null;
    PreparedStatement pstmt = null;

    try {
        con = getConnection();
        pstmt = con.prepareStatement(sql);
        pstmt.setInt(1, money);
        pstmt.setString(2, memberId);
        int resultSize = pstmt.executeUpdate();   // 영향받은 row 수 반환
        log.info("resultSize={}", resultSize);
    } catch (SQLException e) {
        log.error("db error", e);
        throw e;
    } finally {
        close(con, pstmt, null);
    }
}
```

### 3.4 삭제 (DELETE)

```java
public void delete(String memberId) throws SQLException {
    String sql = "delete from member where member_id=?";

    Connection con = null;
    PreparedStatement pstmt = null;

    try {
        con = getConnection();
        pstmt = con.prepareStatement(sql);
        pstmt.setString(1, memberId);
        pstmt.executeUpdate();   // UPDATE와 동일하게 실행
    } catch (SQLException e) {
        log.error("db error", e);
        throw e;
    } finally {
        close(con, pstmt, null);
    }
}
```
