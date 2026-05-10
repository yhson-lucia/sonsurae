---
title: Spring Framework
slug: spring-framework
category: spring
summary: 스프링 프레임워크의 핵심 개념. IoC, DI, 컨테이너, BeanDefinition, 싱글톤, 컴포넌트 스캔, Lombok 정리
tags: [spring, ioc, di, bean, container, singleton, lombok]
sort_order: null
created: 2025-01-17
updated: 2026-05-10
---

## 1. 스프링 프레임워크

자바 언어 기반의 프레임워크. 객체 지향의 강점을 살리는 구조.

- **핵심 기술**: 스프링 DI 컨테이너, AOP, 이벤트 등
- **웹 기술**: 스프링 MVC, 스프링 WebFlux
- **데이터 접근 기술**: 트랜잭션, JDBC, ORM 지원, XML 지원
- **기술 통합**: 캐시, 이메일, 원격 접근, 스케줄링
- **테스트**: 스프링 기반 테스트 지원
- **언어 지원**: Kotlin, Groovy

## 2. 스프링 부트

스프링을 편하게 사용할 수 있도록 지원함.

- 단독 실행 가능한 스프링 애플리케이션을 쉽게 생성
- Tomcat 같은 웹 서버를 내장해 별도 설치 불필요
- 손쉬운 빌드 구성을 위한 starter 종속성 제공
- 스프링과 3rd-party 라이브러리 자동 구성
- 메트릭, 상태 확인, 외부 구성 같은 프로덕션 준비 기능 제공
- 관례에 의한 간결한 설정

## 3. IoC (Inversion of Control)

**제어의 역전**.

- 구현 객체는 자신의 로직 실행만 담당하고, 프로그램의 제어 흐름은 외부에서 동작함
- 구현 객체는 인터페이스를 호출할 뿐, 어떤 구현체가 호출되는지는 모름
- 그 구현체를 선택·호출할 권한이 외부에 있는 구조

![IoC 설계 예시](images/spring-framework-01.webp)

```java
import hello.core.discount.DiscountPolicy;
import hello.core.discount.RateDiscountPolicy;
import hello.core.member.MemberRepository;
import hello.core.member.MemberService;
import hello.core.member.MemberServiceImpl;
import hello.core.member.MemoryMemberRepository;
import hello.core.order.OrderService;
import hello.core.order.OrderServiceImpl;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AppConfig {

    @Bean
    public MemberService memberService() {
        return new MemberServiceImpl(memberRepository());
    }

    @Bean
    public OrderService orderService() {
        return new OrderServiceImpl(memberRepository(), discountPolicy());
    }

    @Bean
    public MemberRepository memberRepository() {
        return new MemoryMemberRepository();
    }

    @Bean
    public DiscountPolicy discountPolicy() {
        return new RateDiscountPolicy();
    }
}
```

- Service나 Repository는 인터페이스로 구성하고, 실제 구현체는 인터페이스를 상속받아 구현
- **구현 객체는 자신의 로직만 담당**: 인터페이스를 호출하므로 어떤 구현체가 들어가는지 알 수 없음
- **제어 흐름은 외부에서 동작**: `AppConfig`가 각 인터페이스에 어떤 구현체를 넣을지 결정함

## 4. DI (Dependency Injection)

**의존관계 주입**.

- 애플리케이션 실행 시점에 외부에서 실제 구현 객체를 생성하고, 클라이언트에 전달해 의존관계를 연결하는 것
- 정적인 클래스 의존 관계와 동적인 객체 의존 관계로 나눠 생각해야 함

**정적인 클래스 의존 관계**: import 코드로 확인 가능. 애플리케이션이 실행되지 않아도 알 수 있음

```java
import hello.core.discount.DiscountPolicy;
import hello.core.discount.RateDiscountPolicy;
import hello.core.member.MemberRepository;
```

**동적인 클래스 의존 관계**: 실행 시점에 실제 생성된 인스턴스의 참조가 연결된 관계

```java
@Configuration
public class AppConfig {
    @Bean
    public MemberService memberService() {
        return new MemberServiceImpl(memberRepository());
    }
}
```

- 위 예시에서 `memberService`의 구현체는 `MemberServiceImpl`. 인스턴스 참조가 전달되어 의존관계가 연결됨

**DI 컨테이너**: 객체를 생성·관리하면서 의존관계를 연결해 주는 것. **IoC 컨테이너**라고도 함.

### 4.1 의존관계 주입 방법

#### 생성자 주입

- 생성자 호출 시점에 1번만 호출됨이 보장됨. **불변·필수 의존관계**에 사용

```java
public class Client {
    private final Service service;

    public Client(Service service) {       // 생성자로 의존성 주입
        this.service = service;
    }

    public void performAction() {
        service.execute();
    }
}
```

#### 수정자 주입 (setter 주입)

- **선택·변경 가능성**이 있는 의존관계에 사용

```java
public class Client {
    private Service service;

    public Client() {}

    public void setService(Service service) {
        this.service = service;
    }

    public void performAction() {
        service.execute();
    }
}
```

#### 필드 주입

- 필드에 바로 주입. 외부에서 변경 불가능해 테스트하기 어려움

```java
@Component
public class Client {

    @Autowired   // Bean으로 등록된 Component를 자동 주입
    private Service service;

    public void performAction() {
        service.execute();
    }
}

@Component
public class EmailService implements Service {
    @Override
    public void execute() {}
}
```

#### 일반 메서드 주입

```java
@Component
public class Client {
    private Service service;

    @Autowired
    public void injectService(Service service) {
        this.service = service;
    }
}
```

- 한 번에 여러 필드를 주입받을 수 있음

**옵션 처리**: 주입할 스프링 빈이 없어도 동작해야 할 때, `@Autowired`만 사용하면 `required` 기본값이 `true`라 자동 주입 대상이 없으면 오류가 발생함. `required = false`로 설정하거나 `Optional<>`을 사용하면 됨. `Optional<>`은 자동 주입 대상이 없으면 `Optional.empty`가 들어옴.

## 5. 스프링 컨테이너

`AppConfig`를 사용했던 방식을 `ApplicationContext` 인터페이스로 가져와 생성한 인스턴스를 **스프링 컨테이너**라고 함.

![스프링 컨테이너](images/spring-framework-02.webp)

- 컨테이너 구성 정보를 `AppConfig.class`로 지정하면 클래스의 구성 정보가 컨테이너에 등록됨

![스프링 빈 등록](images/spring-framework-03.webp)

- `@Bean`이 달린 객체는 스프링 컨테이너의 **빈 저장소**에 자동 저장됨. 빈 이름은 따로 지정하지 않으면 메서드명으로 지정됨

![스프링 의존관계 자동 주입](images/spring-framework-04.webp)

- 스프링 컨테이너는 의존관계를 확인 후 자동으로 주입함

### 5.1 주요 인터페이스/애노테이션

- **`BeanFactory`**: 스프링 컨테이너의 최상위 인터페이스. 스프링 빈을 관리하고 조회
- **`ApplicationContext`**: 보통 스프링 컨테이너라 부름. `BeanFactory`의 모든 기능을 상속하고 부가 기능 제공
  - 환경 변수 처리, 애플리케이션 이벤트, 메시지 소스 활용한 국제화 등
  - XML 기반 또는 애노테이션 기반 자바 클래스로 만들 수 있음
  - XML 설정은 컴파일 없이 빈 설정을 변경할 수 있음
- **`@Configuration`**: 이 어노테이션이 붙은 클래스를 스프링 컨테이너의 구성 정보로 사용
- **`@Bean`**: `@Configuration` 클래스의 메서드 중 `@Bean`이 붙은 메서드를 모두 호출해 반환된 객체를 컨테이너에 등록
  - 빈 이름은 메서드명을 사용
  - `applicationContext.getBean()`으로 조회 가능

### 5.2 스프링 컨테이너 생성 과정

1. **컨테이너 생성**: 구성 정보 지정 (`@Configuration`)
2. **스프링 빈 등록**: 설정 클래스 정보를 사용해 빈을 등록
3. **빈 의존관계 설정**

## 6. 스프링 빈 설정 메타 정보

스프링은 다양한 설정 형식을 지원함. Java code, XML, Groovy 등 여러 형식의 설정 정보를 받기 위해 인터페이스로 추상화되어 있음. 이를 가능하게 하는 것이 **`BeanDefinition`**.

- **`BeanDefinition`**: 빈 설정 메타 정보. 하나의 Bean당 하나의 메타 정보가 생성됨
- 스프링 컨테이너는 형식별로 `ApplicationContext`가 존재. 각 형식에 따라 설정 정보를 읽어 `BeanDefinition`을 생성

`BeanDefinition` 정보

| 필드 | 설명 |
|---|---|
| `beanClassName` | 생성할 빈의 클래스 명 |
| `factoryBeanName` | 팩토리 역할의 빈을 사용할 경우 그 이름 |
| `factoryMethodName` | 빈을 생성할 팩토리 메서드 |
| `scope` | 싱글톤, 프로토타입 등 |
| `lazyInit` | 컨테이너 생성 시점이 아닌 사용 시점까지 빈 생성을 지연할지 여부 |
| `initMethodName` | 빈 생성 후 호출되는 초기화 메서드 |
| `destroyMethodName` | 빈 소멸 직전 호출되는 메서드 |
| `Constructor arguments`, `Properties` | 의존관계 주입에 사용 |

## 7. 싱글톤 컨테이너

**싱글톤 패턴**: 클래스의 인스턴스가 딱 1개만 생성되도록 보장하는 디자인 패턴.

- AppConfig 객체처럼 호출할 때마다 모든 객체를 새로 생성·소멸하면 자원 낭비가 큼
- 자원을 하나의 인스턴스로 공유·관리하기 위한 패턴
- 사용하려면 static 영역에 인스턴스를 미리 생성하고, `private` 생성자로 외부에서 `new` 생성을 막아야 함

```java
public class SingletonService {

    // 1. static 영역에 객체를 1개만 생성
    private static final SingletonService instance = new SingletonService();

    // 2. public 메서드를 통해서만 인스턴스 조회
    public static SingletonService getInstance() {
        return instance;
    }

    // 3. private 생성자로 외부에서 new 사용 금지
    private SingletonService() {}
}
```

문제점

- 클라이언트가 구체 클래스에 의존하게 되어 **DIP 위반**. 이로 인해 OCP도 위반될 가능성 높음
  - 싱글톤으로 만들기 위해 구현체를 static 메서드로 호출해야 하므로 IoC가 깨짐
- private 생성자로 자식 클래스를 만들기 어려움

**싱글톤 컨테이너**: 싱글톤 패턴의 문제를 해결하면서 객체 인스턴스를 싱글톤으로 관리하는 스프링 컨테이너.

- 등록된 인스턴스가 있으면 그 인스턴스를 반환
- 없으면 컨테이너에 등록 후 반환

## 8. 컴포넌트 스캔

- **`@ComponentScan`**: `@Component` 애노테이션이 붙은 클래스를 스캔해 스프링 빈으로 등록
- **`@Autowired`**: `@Component`로 등록한 빈은 의존관계 설정도 자동으로 처리해야 함. `@Autowired`는 컨테이너가 자동으로 빈을 찾아 주입
  - 기본적으로 **타입이 같은 빈**을 찾아 주입
  - 생성자에 파라미터가 많아도 모두 자동 주입
  - 주입 대상이 없으면 오류 발생
  - 생성자가 1개만 있으면 `@Autowired` 생략 가능
  - 조회된 빈이 2개 이상일 때 → `NoUniqueBeanDefinitionException`
    - **필드명 매칭**: 타입 매칭 실패 시 필드/파라미터 이름으로 추가 매칭
    - **`@Qualifier`**: 추가 구분자로 빈 지정. 빈 이름을 변경하는 것은 아님
    - **`@Primary`**: 우선순위 지정. `@Qualifier`와 함께 있을 경우 `@Qualifier`가 우선
- **탐색 시작 위치 지정**: 자바 클래스를 모두 스캔하면 시간이 오래 걸림. 시작 위치를 지정해 필요한 곳부터 탐색

```java
@ComponentScan(basePackages = "hello.world")
```

`basePackages`는 탐색 시작 위치. 이 패키지를 포함해 모든 하위 패키지를 탐색함.

**컴포넌트 스캔 기본 대상** (모두 `@Component`를 메타 애노테이션으로 포함)

| 애노테이션 | 용도 |
|---|---|
| `@Controller` | MVC 컨트롤러 |
| `@Service` | 비즈니스 로직 (특별한 처리 X. 비즈니스 계층 인식용) |
| `@Repository` | 데이터 접근 계층. 데이터 계층 예외를 스프링 예외로 변환 |
| `@Configuration` | 스프링 설정 정보 |

## 9. Lombok

생성자, getter, setter, `toString()` 등 자주 사용하는 코드를 자동 생성해 코드의 간결함과 유지보수성을 높이는 라이브러리.

| 애노테이션 | 기능 |
|---|---|
| `@RequiredArgsConstructor` | `final` 필드를 모아 생성자 자동 생성 |
| `@NoArgsConstructor` | 기본 생성자 자동 생성 |
| `@AllArgsConstructor` | 모든 필드의 생성자 자동 생성 |

---

Reference: <https://www.inflearn.com/course/스프링-핵심-원리-기본편>
