---
title: 트랜잭션
slug: transaction
category: jdbc
summary: 트랜잭션의 ACID, 격리 수준, DB 락, 스프링의 트랜잭션 추상화·매니저·템플릿·AOP 정리
tags: [jdbc, transaction, acid, isolation-level, spring-aop, lock]
sort_order: null
created: 2025-01-17
updated: 2026-05-10
---

## 1. 트랜잭션의 이해

- **트랜잭션**: 하나의 거래를 안전하게 처리하도록 보장하는 단위
  - **commit**: 모든 작업이 성공해서 데이터를 DB에 정상 반영
  - **rollback**: 작업 중 하나라도 실패해 거래 이전으로 되돌림

### 1.1 ACID 특성

트랜잭션은 4가지 특성을 보장해야 함.

| 특성 | 설명 |
|---|---|
| **원자성 (Atomicity)** | 트랜잭션 내 작업들은 모두 성공하거나 모두 실패해야 함 |
| **일관성 (Consistency)** | 트랜잭션은 일관성 있는 DB 상태를 유지해야 함 (예: 무결성 제약조건 만족) |
| **격리성 (Isolation)** | 동시 실행되는 트랜잭션이 서로에게 영향을 미치지 않도록 격리. 동시성 성능과 직결되어 격리 수준을 선택할 수 있음 |
| **지속성 (Durability)** | 성공한 트랜잭션의 결과는 영구히 기록되어야 함. 시스템 장애 시 DB 로그를 통해 복구 |

### 1.2 트랜잭션 격리 수준

격리성을 완벽히 보장하려면 트랜잭션을 거의 순서대로 실행해야 해서 동시 처리 성능이 나빠짐. 이 때문에 격리 수준을 4단계로 정의함.

- **READ UNCOMMITTED** (커밋되지 않은 읽기)
- **READ COMMITTED** (커밋된 읽기)
- **REPEATABLE READ** (반복 가능한 읽기)
- **SERIALIZABLE** (직렬화 가능)

## 2. 데이터베이스 연결 구조와 DB 세션

DB는 웹 애플리케이션 서버나 DB 접근 툴 같은 클라이언트의 연결 요청을 받아 **커넥션**을 맺음. 이때 DB 서버 내부에 **세션**이 생성되고, 해당 커넥션을 통한 모든 요청은 이 세션을 통해 실행됨.

- 사용자가 SQL을 클라이언트로 전달하면, 연결된 커넥션의 세션이 SQL을 실행
- 세션이 트랜잭션을 시작하고 commit/rollback으로 트랜잭션을 종료. 이후 새 트랜잭션을 다시 시작할 수 있음
- 사용자가 커넥션을 닫거나 DBA가 세션을 강제 종료하면 세션이 종료됨

![DB 클라이언트-서버 세션 구조](images/transaction-01.webp)

## 3. 자동 커밋과 수동 커밋

쿼리를 날릴 때마다 자동으로 커밋하는 것을 **자동 커밋**, 수동으로 `commit`/`rollback`을 호출하는 것을 **수동 커밋**이라고 함.

자동 커밋

```sql
set autocommit true;  -- 자동 커밋 모드 설정
insert into member(member_id, money) values ('data1', 10000);  -- 자동 커밋
insert into member(member_id, money) values ('data2', 10000);  -- 자동 커밋
```

수동 커밋

```sql
set autocommit false;  -- 수동 커밋 모드 설정
insert into member(member_id, money) values ('data3', 10000);
insert into member(member_id, money) values ('data4', 10000);
commit;                 -- 수동 커밋
```

## 4. DB 락

트랜잭션을 시작해서 데이터를 수정하는 동안, 아직 커밋하지 않은 상태에서 다른 세션이 같은 데이터를 동시에 수정하면 **원자성이 깨짐**. 이를 방지하기 위해 **락(Lock)** 개념이 도입됨.

![DB 락 동작](images/transaction-02.webp)

- 세션1이 트랜잭션을 시작하고 락을 획득. 커밋/롤백으로 락을 반납하기 전까지는 세션2가 같은 데이터를 수정하지 못함
- 세션2는 락 획득 시도 → 세션1이 락을 반납하는 시점에 락을 획득하고 데이터 접근

## 5. 트랜잭션의 문제 해결

![3계층 애플리케이션 구조](images/transaction-03.webp)

역할에 따라 3계층으로 나눈 애플리케이션 구조.

- **프레젠테이션 계층**
  - UI 관련 처리, 웹 요청·응답, 사용자 요청 검증
  - 주 사용 기술: 서블릿, HTTP, 스프링 MVC
- **서비스 계층**
  - 비즈니스 로직 담당
  - 주 사용 기술: 가급적 특정 기술에 의존하지 않고 순수 자바 코드로 작성
- **데이터 접근 계층**
  - 실제 DB 접근 코드
  - 주 사용 기술: JDBC, JPA, File, Redis, Mongo

가장 중요한 부분은 **핵심 비즈니스 로직이 들어 있는 서비스 계층**. 비즈니스 로직은 변경이 적게 유지되어야 하므로 특정 기술에 종속되지 않게 순수 자바 코드로 작성해야 함. JDBC와 비즈니스 로직이 섞이면 유지보수가 어려움.

문제점

- JDBC 구현 기술이 서비스 계층에 누수됨
- **트랜잭션 동기화 문제**: 같은 트랜잭션을 유지하려면 커넥션을 파라미터로 넘겨야 함. 트랜잭션을 사용하는 기능과 사용하지 않는 기능을 분리해야 함
- **트랜잭션 적용 반복 문제**: 커넥션 호출, SQL, 파라미터 바인딩, 커넥션 종료 같은 유사 코드가 계속 반복됨

## 6. 트랜잭션 추상화

JDBC, JPA 등 구현 기술마다 트랜잭션 사용법이 다름. **트랜잭션 추상화**로 여러 기술의 인터페이스를 통일함.

![스프링 트랜잭션 추상화](images/transaction-04.webp)

이 방식으로 서비스 계층은 스프링 트랜잭션 추상화 인터페이스에만 의존하면 됨.

## 7. 리소스 동기화

트랜잭션을 유지하려면 시작부터 끝까지 같은 DB 커넥션을 사용해야 함. 같은 커넥션을 동기화하기 위해 파라미터로 넘기는 방법이 있지만 코드가 지저분해짐.

스프링은 **트랜잭션 동기화 매니저**를 제공해 **쓰레드 로컬**로 커넥션을 동기화함. 트랜잭션 매니저는 내부에서 이 동기화 매니저를 사용. 덕분에 멀티 쓰레드 환경에서도 안전하게 커넥션을 동기화할 수 있고, 파라미터로 커넥션을 전달할 필요가 없음.

![트랜잭션 동기화 매니저](images/transaction-05.webp)

```java
package hello.jdbc.service;

import hello.jdbc.domain.Member;
import hello.jdbc.repository.MemberRepositoryV3;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.DefaultTransactionDefinition;

import java.sql.SQLException;

@Slf4j
@RequiredArgsConstructor
public class MemberServiceV3_1 {

    private final PlatformTransactionManager transactionManager;  // 트랜잭션 매니저 주입
    private final MemberRepositoryV3 memberRepository;

    public void accountTransfer(String fromId, String toId, int money) throws SQLException {
        // 트랜잭션 시작. TransactionStatus는 현재 트랜잭션 상태 정보. commit/rollback에 필요
        TransactionStatus status = transactionManager.getTransaction(new DefaultTransactionDefinition());

        try {
            bizLogic(fromId, toId, money);                  // 비즈니스 로직
            transactionManager.commit(status);              // 성공 시 커밋
        } catch (Exception e) {
            transactionManager.rollback(status);            // 실패 시 롤백
            throw new IllegalStateException(e);
        }
    }

    private void bizLogic(String fromId, String toId, int money) throws SQLException {
        Member fromMember = memberRepository.findById(fromId);
        Member toMember = memberRepository.findById(toId);

        memberRepository.update(fromId, fromMember.getMoney() - money);
        validation(toMember);
        memberRepository.update(toId, toMember.getMoney() + money);
    }

    private void validation(Member toMember) {
        if (toMember.getMemberId().equals("ex")) {
            throw new IllegalStateException("이체중 예외 발생");
        }
    }
}
```

## 8. 트랜잭션 템플릿

트랜잭션 시작 → 비즈니스 로직 → 성공 시 커밋 / 실패 시 롤백 패턴이 계속 반복됨. 비즈니스 로직을 제외한 부분을 **콜백 패턴**으로 묶어 해결할 수 있음.

```java
public class TransactionTemplate {
    private PlatformTransactionManager transactionManager;

    public <T> T execute(TransactionCallback<T> action) {}        // 응답값이 있을 때
    void executeWithoutResult(Consumer<TransactionStatus> action) {}  // 응답값이 없을 때
}
```

```java
package hello.jdbc.service;

import hello.jdbc.domain.Member;
import hello.jdbc.repository.MemberRepositoryV3;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.sql.SQLException;

@Slf4j
public class MemberServiceV3_2 {

    private final TransactionTemplate txTemplate;
    private final MemberRepositoryV3 memberRepository;

    public MemberServiceV3_2(PlatformTransactionManager transactionManager,
                             MemberRepositoryV3 memberRepository) {
        // 템플릿은 매니저를 주입받아 생성
        this.txTemplate = new TransactionTemplate(transactionManager);
        this.memberRepository = memberRepository;
    }

    public void accountTransfer(String fromId, String toId, int money) throws SQLException {
        // 정상 수행 시 커밋, 언체크 예외 시 롤백, SQLException 같은 체크 예외는 람다 안에서 던질 수 없으므로
        // 언체크 예외로 변환해 던짐
        txTemplate.executeWithoutResult((status) -> {
            try {
                bizLogic(fromId, toId, money);
            } catch (SQLException e) {
                throw new IllegalStateException(e);
            }
        });
    }

    private void bizLogic(String fromId, String toId, int money) throws SQLException {
        Member fromMember = memberRepository.findById(fromId);
        Member toMember = memberRepository.findById(toId);

        memberRepository.update(fromId, fromMember.getMoney() - money);
        validation(toMember);
        memberRepository.update(toId, toMember.getMoney() + money);
    }

    private void validation(Member toMember) {
        if (toMember.getMemberId().equals("ex")) {
            throw new IllegalStateException("이체중 예외 발생");
        }
    }
}
```

## 9. 트랜잭션 AOP

템플릿을 도입해도 순수한 자바 코드만 서비스 계층에 남기긴 어려움. 스프링 AOP의 **프록시**를 도입하면 깔끔히 해결됨.

![스프링 트랜잭션 AOP 프록시](images/transaction-06.webp)

- 프록시를 사용하면 트랜잭션 처리 객체와 비즈니스 로직 처리 객체를 명확히 분리할 수 있음

```java
public class TransactionProxy {

    private MemberService target;

    public void logic() {
        // 트랜잭션 시작
        TransactionStatus status = transactionManager.getTransaction();
        try {
            target.logic();                              // 실제 대상 호출
            transactionManager.commit(status);           // 성공 시 커밋
        } catch (Exception e) {
            transactionManager.rollback(status);         // 실패 시 롤백
            throw new IllegalStateException(e);
        }
    }
}
```

원하는 곳에 `@Transactional` 애노테이션만 붙이면 스프링 트랜잭션 AOP가 이를 인식해 프록시를 적용해 줌. 이러한 방식을 **선언적 트랜잭션 관리**라고 함.
