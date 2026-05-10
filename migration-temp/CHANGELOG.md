# Phase B 정리 작업 기록

> STYLE.md 기반으로 LLM이 카테고리 단위로 정리한 내역.
> **소소한 변경(들여쓰기, 콜론 띄어쓰기, `~한다→함` 종결어미, 섹션 구분자 `***` 제거)은 모든 파일 공통이라 생략하고 의미 있는 변경만 기록**.

---

## Batch 1 — 2026-05-10

### `docs/network/http.md` (시범 적용본, 별도 보고됨)
[이전 응답 표 참고]

---

### `docs/fe/react/react.md`
**frontmatter**: title=React, tags=[fe, react, component, jsx, virtual-dom], created=2025-01-19

**오타/맞춤법**
- `힘들어 질` → `힘들어질`
- `난잡해진다는 뜻)'` → `난잡해진다는 뜻)` (잘못된 작은따옴표 제거)
- `해야된다면` → `해야 한다면`
- `보여준다는 아이디어` → 그대로
- 제목에 빈 H1만 있어 `## React` H2를 그대로 두지 않고 `## 1. React 개요`로 번호 부여

**구조 변경**
- 제목 없던 코드 예제 블록 → 적절한 H3 (`### 코드 예제`)로 묶음
- "Style 과 className" 섹션의 깨진 들여쓰기/번호 정리
- props/props.children/JSX 등 섹션을 H2 일관 번호로 정리 (`## 1. ~ ## 5.`)

**오류 수정**
- `-SS class` → `CSS class` (S 누락 추정)
- `랜더링` → `렌더링` (표준 표기)

**보강 (추가 가능 정책)**
- "Vue, Svelte" 추가 — 원문은 "Ember, Backbone, AngularJS" 만 언급. 현재 시점 기준 명시

---

### `docs/aws/lambda/aws-lambda.md`
**frontmatter**: title=AWS Lambda, tags=[aws, lambda, serverless, event-driven], created=2025-02-03

**이미지 처리 (중요)**
- 원본 5개 이미지가 obsidian wikilink 형식 `![[file|width]]`라서 1차 변환에서 누락됨
- 이번에 새로 복사: `aws-lambda-01.webp` ~ `aws-lambda-05.webp`
- 본문의 `![[...]]` 5곳을 표준 마크다운 `![alt](images/aws-lambda-NN.webp)` 로 치환

**오타/맞춤법**
- `필요없ㅣ` → `필요 없이`
- `구성 요소'` → `구성 요소` (잘못된 작은따옴표 제거)
- `간접 한다` → `간접 호출한다` (단어 누락 보강)
- `실시될 때` → `발생할 때`
- `API요청` → `API 요청`
- `호출 보다` → `호출보다`
- `있을 수있다` → `있을 수 있다`
- `복잡해 진다` → `복잡해진다`
- `]]` 잘못된 잔여 문자 제거

**구조 변경**
- 줄 50 빈 불릿(`-`만 있는 줄) 제거
- "Lambda 모놀리스/재귀 패턴/동기식 대기" 항목을 `### 5.1`, `### 5.2`, `### 5.3` sub-section으로 분리

---

### `docs/aws/s3/s3-overview.md`
**frontmatter 변환**: 원본에 Docusaurus frontmatter(`title/description/tag/sidebar_position`)가 이미 있음 → 우리 형식으로 변환
- title: "S3" → "S3"
- description → summary
- tag → tags 보강 (storage, bucket, encryption, presigned-url 추가)
- sidebar_position 1 → sort_order 1
- created=2025-01-31 (코드 예시의 날짜 기반)

**구조 변경**
- 의사 코드 블록(`bucketProperties`, `class S3Encryption`, `class S3InventoryProcessor`)이 학습용 예시로 부적합(실행 불가, 가독성 낮음) → **표 또는 일반 불릿으로 변환**
  - 예: TypeScript "Bucket 특징" 객체 → 표 (속성 / 설명)
  - 예: JAVA fake class "S3Encryption" → "전송 중/저장 시" 두 카테고리 불릿
- 헤딩 번호 정리: `### 1.` → `## 1. Bucket`, `## 2. 데이터 암호화` 등 H2로 통일
- HTTP response 코드 블록 — 학습 가치 낮은 헤더 다수(Vary, X-XSS-Protection 등) 제거하고 핵심만 남김

**오타/맞춤법**
- 없음 (이미 깔끔)

---

### `docs/aws/s3/s3-batch-operation.md`
**frontmatter 변환**: 동일 방식. sort_order 3 → 2 (매핑표 결정 따름)
- created=2025-01-31

**오타/맞춤법**
- `일상정으로` → `일상적으로`
- `S3 Batch Operation 이라고` → `S3 Batch Operation이라고`
- `생성가능` → `생성 가능`
- `만든다.` 등 → 명사형 통일
- 빈 불릿(줄 32, 51), 불필요한 공백 정리

**구조 변경**
- "인벤토리 보고서 → Manifest → Batch Action → IAM → S3 Control Client" 5개 H2로 명확히 정리
- 코드 블록 인덴트 깨짐 수정 (특히 yaml 블록, kotlin enum)
- "Task 처리 방식" / "Task 모니터링" sub-section 분리
- 4가지 작업 생성 방법을 표로 변환 (방법 / 특징 / 적합 상황)

**오류 수정**
- 매니페스트 예시에서 잘못된 들여쓰기 정리
- `S3 Batch Operations` 영문명 표기 일관화

**보강**
- 없음 (원문이 충실함)

---

## Batch 2 — 2026-05-10 (Spring 계열 12개)

### `docs/jdbc/jdbc-connection.md`
**frontmatter**: title=JDBC Connection, tags=[jdbc, database, java, driver-manager, sql], created=2025-01-17

**오타/맞춤법**
- `잇는` → `있는`
- `PASSWARD` → `PASSWORD`
- `드라이버를 제공하였음` → `드라이버를 제공`
- `위 과정에서의 문제점` 후속 문장 정리

**구조 변경**
- CRUD 4개를 `### 3.1 ~ 3.4` sub-section으로 명확히 분리
- 깨진 코드 들여쓰기/중괄호 모두 정리 (특히 `} }` 같이 어긋난 닫는 괄호)
- 코드 안에 한국어 주석으로 의미 보강 (원본 의도 유지)

---

### `docs/jdbc/connection-pool.md`
**frontmatter**: title=커넥션 풀, tags=[jdbc, connection-pool, hikaricp, datasource, performance]

**오타/맞춤법**
- `DriverManeger` → `DriverManager`

**구조 변경**
- 단락 위주 텍스트를 `### 1.1 배경` / `### 1.2 동작` 등 sub-section으로 분리
- 코드의 깨진 줄바꿈 정리

---

### `docs/jdbc/jdbc-template.md`
**frontmatter**: title=JDBC Template, tags=[jdbc, spring, jdbc-template, repository, sql]

**오타/맞춤법**
- `tmplate` → `template`
- `findall`, `where id = :id` 등 표기 정리
- `usingColumns` 주석 오타 정리 (`저장할고` → `저장하고 싶을 때`)
- `텦플릿` → `템플릿`

**구조 변경**
- 매우 깨진 코드 블록 들여쓰기 전면 정리 (들여쓰기 일관성 + Java 컨벤션)
- 주석을 코드 옆/위로 정렬해서 가독성 개선
- `BeanPropertyRowMapper` / `SimpleJdbcInsert` 섹션 명확히 분리

---

### `docs/jdbc/transaction.md`
**frontmatter**: title=트랜잭션, tags=[jdbc, transaction, acid, isolation-level, spring-aop, lock]

**오타/맞춤법**
- `READ UNCOMMINTED` → `READ UNCOMMITTED`
- `READ COMMIT` → `READ COMMITTED` (정확한 명칭)
- `수저하는` → `수정하는`
- `비지니스` → `비즈니스`
- `텦플릿` → `템플릿`
- `정리` → `정리됨`

**구조 변경**
- ACID 4가지 특성을 표로 정리
- 격리 수준 4단계 별도 sub-section으로 분리
- 트랜잭션 매니저/템플릿/AOP 코드 들여쓰기 전면 정리
- 마지막에 "선언적 트랜잭션 관리" 표준 용어 보강

---

### `docs/spring/spring-framework.md`
**frontmatter**: title=Spring Framework, tags=[spring, ioc, di, bean, container, singleton, lombok]

**오타/맞춤법**
- `DestoryMethodName` → `destroyMethodName` (camelCase + 오타)
- `Commponent` → `Component`
- `Qaulifier` → `Qualifier`
- `등력` → `등록`
- `메세지` → `메시지`
- `스케쥴링` → `스케줄링`
- `자식 클래스를 만들기 어렵다` 등 여러 어색한 문장 다듬기

**구조 변경**
- DI 주입 방법 4가지를 `#### 생성자 주입 / 수정자 주입 / 필드 주입 / 일반 메서드 주입`으로 일관 정리
- `BeanDefinition` 정보를 표로 변환
- 컴포넌트 스캔 기본 대상(`@Controller`/`@Service`/`@Repository`/`@Configuration`)을 표로
- Lombok 애노테이션 표로

**보강**
- 없음 (원문이 매우 풍부)

---

### `docs/spring/spring-boot.md`
**frontmatter**: title=Spring Boot, tags=[spring, spring-boot, was, jar, war, packaging]

**구조 변경**
- 헤딩 번호 없던 부분에 `## 1. ~ ## 4.` 일관 부여
- `WAR 구조`를 표로 변환

---

### `docs/spring/websocket.md`
**frontmatter**: title=WebSocket, tags=[spring, websocket, realtime, chat, protocol]

**구조 변경**
- `### WebSocket / 특징 / 채팅` H3로 되어있던 헤딩을 `## 1. ~ ## 3.` H2로 통일
- HTTP vs WebSocket 비교를 표로 변환

**보강**
- HTTP 응답 코드 `101`을 **101 Switching Protocols** 표준 명칭으로 명시

---

### `docs/spring/validation.md`
**frontmatter**: title=검증 (Validation), tags=[spring, validation, binding-result, model-attribute]

**오타/맞춤법**
- `Java script` → `JavaScript`

**구조 변경**
- `<h2>HTML</h2>` 태그 → 마크다운 `## 1.`, `## 2.`로 변환

---

### `docs/spring/spring-mvc/mvc.md`
**frontmatter**: title=Spring MVC, tags=[spring, mvc, servlet, dispatcher, view-resolver, annotation]

**오타/맞춤법**
- `veiw` → `view`
- `비지니스` → `비즈니스`
- `Servelet` → `Servlet`
- `랜더링` → `렌더링`
- `HttpSevlet` → `HttpServlet`
- 깨진 들여쓰기 (예: `2.1.1` 비공식 Markdown 번호 매기기) → 표준 H4로

**구조 변경**
- "Front Controller 단계별 최적화"를 `#### 1단계 ~ 4단계`로 분리
- 스프링 MVC 애노테이션 9개를 표로 변환

---

### `docs/spring/spring-mvc/request-mapping.md`
**frontmatter**: title=요청 매핑, tags=[spring, mvc, request-mapping, request-body, http-message-converter, json]

**오타/맞춤법**
- `ulencoded` → `urlencoded`
- `ServeletInputStream` → `ServletInputStream`
- `톰켓` → `톰캣`
- `히게되면`, `키게되면` → `하게 되면`, `켜면`
- `메세지` → `메시지`

**구조 변경**
- 처음의 컨트롤러 기본 애노테이션 4개를 별도 `## 0` 섹션으로 분리
- 3가지 요청 방법을 `### 1.1 / 1.2 / 1.3`로 분리
- JSON 변환 두 방식을 v1/v2 코드 예시로 명확화

---

### `docs/spring/spring-security/spring-security.md`
**frontmatter**: title=Spring Security, tags=[spring, security, authentication, authorization, rbac, jwt, csrf]

**오타/맞춤법**
- `Manger` → `Manager`
- `보안관련` → `보안 관련`
- `사용자측` → `사용자 측`
- `프레임워크` 표기 통일

**구조 변경**
- 5개 구성요소를 표로 정리
- RBAC 애노테이션 3개를 표로
- 토큰 vs 세션 비교를 표로
- 1.1 보안 3원칙, 1.2 보안 메커니즘으로 sub-section 분리

---

### `docs/spring/spring-security/jwt.md`
**frontmatter**: title=JWT, tags=[spring, security, jwt, authentication, token, filter]

**오타/맞춤법**
- `Json Web Tocken` → `JSON Web Token`
- `antMachers` → `antMatchers`
- `withExpriresAt` → `withExpiresAt`
- `HttpServeltResponse` → `HttpServletResponse`
- `dependecies` → `dependencies`
- `myCustomJwtFilter` 클래스명 PascalCase로 통일 (`MyCustomJwtFilter`)
- `antMachers("/api/public/**)` 깨진 따옴표 정리

**오류 정정**
- **`24시간유효` 코드 버그**: `60*60*24` (밀리초 기준 86초)는 24시간이 아니라 86초. `* 1000` 추가해 진짜 24시간으로 정정
- **JWT 형식**: `Header - payload - Signature` → `Header.Payload.Signature` (점으로 구분된다는 정확한 표기)

**보강 (정책에 따라 추가)**
- Spring Security 5.7+에서 `WebSecurityConfigurerAdapter` deprecated 사실을 인용 블록으로 명시 (학습 노트가 구버전 기준이라 혼동 방지)
- HMAC 알고리즘 명시 (HS256/HS512 등)는 원문 표현(`HMAC512`) 유지

---

## Batch 3 — 2026-05-10 (Java + JPA 9개)

### `docs/java/java-overview.md`
**frontmatter**: title=Java, tags=[java, jvm, jre, jdk, datatype, basics] (Docusaurus frontmatter 흡수)

**구조 변경**
- 자료형 9개를 `### 3.1 ~ 3.10`으로 sub-section 분리
- 정수형/문자형/비교 연산자를 표로 변환
- 변수/상수/형변환 등 단락 형식을 명확히 정리

**오타/맞춤법**
- `자연수, 실수,문자` 띄어쓰기 정리
- `이는 가교 역할` 표현 다듬기

---

### `docs/java/object-oriented-programming.md`
**frontmatter**: title=객체 지향 프로그래밍, tags=[java, oop, class, method, solid, polymorphism, inheritance]

**구조 변경**
- SOLID 5원칙을 표로 변환
- 메서드/특징을 `### 2.1, 2.2, 2.3`으로 분리

**보강**
- `super`/`this()` 생성자 호출 문맥에 "본문의 가장 첫 줄에 위치해야 함" 등 정확한 규칙 명시

---

### `docs/java/exception-handling.md`
**frontmatter**: title=예외 처리, tags=[java, exception, error, try-catch, checked-exception, runtime-exception]

**오타/맞춤법**
- `에외 처리` → `예외 처리`
- `철하도록 유도` → `처리하도록 유도`
- `비지니스` → `비즈니스`
- `try(FileWriter f = new FileWriter("data.txtx"))` → `data.txt` (오타 정정)

**구조 변경**
- 오류 종류 3가지를 표로 변환
- Checked/Unchecked Exception 비교를 표로
- `try-with-resources` 설명을 별도 sub-section으로

---

### `docs/java/collection-framework.md`
**frontmatter**: title=컬렉션 프레임워크, tags=[java, collection, data-structure, list, map, set, tree, hash]

**오타/맞춤법**
- `extendsE` → `extends E`
- `가한다` → `추가한다` (잘림 복구)
- `요소를 환한다` → `요소를 반환한다` (잘림 복구)

**구조 변경**
- 헤딩 H3 → H2 통일 (`### 1. ~ ### 6.` → `## 1. ~ ## 6.`)
- 자료구조 개요를 `## 0` 섹션으로 분리
- 트리 순회/DFS·BFS를 `### 5.1`로 sub-section
- HashSet/HashMap을 `### 6.1, 6.2`로 분리

---

### `docs/jpa/jpa-intro.md`
**frontmatter 변환**: 원본 Docusaurus frontmatter → 우리 형식 (sort_order=1)

**구조 변경**
- 엔티티 생명주기 4가지를 표로 변환
- `## 1.1 장점`, `## 4.1 flush 발생 시점`, `## 5 준영속` 등 sub-section 정리

---

### `docs/jpa/association.md`
**frontmatter 변환**: 원본 Docusaurus frontmatter → 우리 형식 (sort_order=2)

**오타/맞춤법**
- `다대일 단반향` → `다대일 단방향` (반복 오타)
- `일대다 단반향` → `일대다 단방향`
- `상속간계` → `상속관계`
- `테이플` → `테이블`
- `비지니스` → `비즈니스`

**구조 변경**
- PK 생성 전략 4가지를 표로 변환
- 매핑 애노테이션 카테고리를 표로
- 상속관계 매핑 3가지 전략을 **장단점 비교 표**로 변환 (가장 큰 변경. 원본은 단락 위주였음)
- 헤딩 번호 일관 부여 (`## 1. ~ ## 5.`)

---

### `docs/jpa/value-type.md`
**frontmatter 변환**: 원본 Docusaurus frontmatter → 우리 형식 (sort_order=3)

**오타/맞춤법**
- `상ㅇ하는` → `사용하는` (글자 깨짐)
- `find-grained` → `fine-grained` (오타 정정)

**구조 변경**
- 값 타입 분류를 `#### 기본값 / 임베디드 / 컬렉션`으로 명확히 분리

---

### `docs/jpa/association-management.md`
**frontmatter 변환**: 원본 Docusaurus frontmatter → 우리 형식 (sort_order=4)

**오타/맞춤법**
- `orphanRemovel` → `orphanRemoval` (반복 오타)
- `비지니스` → `비즈니스`

**구조 변경**
- LAZY/EAGER를 각각 `### 1.1`, `### 1.2`로 분리
- CASCADE 종류 6가지를 표로 변환
- `## 4. 영속성 전이 + 고아 객체` 섹션을 명확화

---

### `docs/jpa/proxy.md`
**frontmatter 변환**: 원본 Docusaurus frontmatter → 우리 형식 (sort_order=5)

**오타/맞춤법**
- `켄텍스트` → `컨텍스트`
- `메소드` → `메서드`
- `instance of` → `instanceof` (Java 키워드 정확 표기)

**오류 정정**
- **`PersistenceUnit.isLoaded(...)` → `emf.getPersistenceUnitUtil().isLoaded(...)`**: 실제 JPA API 시그니처로 정정. 원본 표기는 부정확
- 프록시 클래스 확인 출력 예시(`..javasist..`) → `..javassist..` 오타 정정

**구조 변경**
- 프록시 확인 방법 3가지를 표로 변환

---

## Batch 4 — 2026-05-10 (Docker + Database 13개)

### `docs/docker/docker-intro.md`
**frontmatter**: title=Docker, tags=[docker, container, virtualization, image, dockerfile, compose]

**오타/맞춤법**
- `Dokcer` → `Docker`
- `으용ㅇ 프로그램` → `응용 프로그램` (글자 깨짐)
- `excutable` → `executable`
- `웅영체제` → `운영체제`
- `있을 떄` → `있을 때`
- `데필요한` → `데 필요한`
- `것을 매우 비효율적이다` → `것은 매우 비효율적이다`
- `Package.json` 코드블록 들여쓰기 정돈
- `name Spaces` → `Namespaces`

**구조 변경**
- 12개 sub-section으로 명확히 분리 (소프트웨어 변화 → Docker → 컨테이너 → 흐름 → 격리 → 이미지 → 생명주기 → 이미지 만들기 → WORKDIR → 캐시 → Volume → Compose)
- Docker vs VM 비교를 표로
- `docker ps` 컬럼 7개를 표로
- Dockerfile 키워드 표

---

### `docs/docker/docker-practice.md`
**frontmatter**: title=Docker 실습, tags=[docker, nodejs, redis, compose, practice, port-mapping]

**오타/맞춤법**
- `expresss` → `express` (s 3개 → 2개)
- `608` → `808` 정정 후 `8080`으로 (포트 표기 오류)
- `처리할 . 수있으며` → `처리할 수 있으며`

**구조 변경**
- Compose 명령어를 표로 변환
- Node.js 앱 생성 sub-section 구분 (왜 alpine 안 쓰나, npm install이란, server.js 의미)

---

### `docs/docker/production-environment.md`
**frontmatter**: title=운영환경, tags=[aws, ec2, elastic-beanstalk, nginx, production, deployment]

**오타/맞춤법**
- `Elastic BeanStalk` → `Elastic Beanstalk` (정확한 표기. 공식 명칭은 b 소문자)
- `NET, PHP` → `.NET, PHP`

**구조 변경**
- AWS 서비스/Nginx 두 섹션 명확히 분리

---

### `docs/database/database-basics.md`
**frontmatter**: title=데이터베이스 기초, tags=[database, rdb, nosql, sql, ddl, basics]

**오타/맞춤법**
- `srever` → `server`
- `MonogoDB` → `MongoDB`
- `adress` → `address`
- `SHOW DATABASE` → `SHOW DATABASES`
- `삭세 명령어` → `삭제 명령어`
- `db에 데이터베이스` → 표현 다듬기

**구조 변경**
- RDB vs NoSQL 비교를 표로
- DDL 자료형, ALTER 명령 정리
- 4가지 특성(공유/통합/저장/운영) 명확히 정의

---

### `docs/database/database-structure.md`
**frontmatter**: title=데이터베이스 구성, tags=[database, constraint, key, primary-key, foreign-key, integrity, erd]

**오타/맞춤법**
- `infomation_schema` → `information_schema`
- `2.6` 에서 키 용어 표 정렬

**구조 변경**
- 제약 조건 5종 표로
- 키 종류(후보/대체/슈퍼) 표로
- 무결성 제약 6종 표로
- 관계(1:1, 1:N, N:M) 표로

---

### `docs/database/database-implementation.md`
**frontmatter**: title=데이터베이스 구현, tags=[database, dcl, grant, revoke, index, mysql]

**오타/맞춤법**
- `mysql. sever start` → `mysql.server start`
- `삭세 명령어` → `삭제 명령어`
- `ìp` → `<ip>` (글자 깨짐)
- 백틱 안 SQL 명령들 정리

**구조 변경**
- 데이터베이스 명령 / DCL / 인덱스 3개 섹션 명확화
- 인덱스 장단점, 적합 상황을 표/리스트로

---

### `docs/database/data-modeling.md`
**frontmatter**: title=데이터 모델링, tags=[database, normalization, anomaly, functional-dependency, modeling, bcnf]

**구조 변경**
- 이상 현상 3종을 표로
- 정규화 단계 1NF~BCNF를 sub-section으로 분리
- 이행 함수 종속 정의를 명확히

---

### `docs/database/sql-basics.md`
**frontmatter**: title=SQL 기본, tags=[database, sql, select, where, order-by, dml, function]

**오타/맞춤법**
- `DISTICT` → `DISTINCT` (반복 오타)
- `MIX(column명)` → `MIN(컬럼)` (오타 — MIN의 표기 오류)
- 백틱과 따옴표 깨짐 다수 정리

**구조 변경**
- 9개 SQL 명령을 `## 1.~9.`로 일관 번호
- 비교/복합/포함 연산자 각각 표로
- LIKE 패턴 4가지 (`데이터`, `데이터%`, `%데이터`, `%데이터%`) 명확화

---

### `docs/database/join.md`
**frontmatter**: title=JOIN, tags=[database, sql, join, inner-join, outer-join, cross-join]

**오타/맞춤법**
- `같는 모든 칼럼` → `갖는 모든 컬럼`

**구조 변경**
- JOIN 7종 (`## 1.~7.`) 명확화
- EQUI/Non-EQUI 비교 표
- OUTER JOIN sub-section 4개 (Oracle (+) / LEFT / RIGHT / FULL)

---

### `docs/database/subquery.md`
**frontmatter**: title=서브쿼리, tags=[database, sql, subquery, scalar-subquery, view, correlated-subquery]

**오타/맞춤법**
- `존재한느지` → `존재하는지` (반복)
- `사뷰용` → `사용`
- `물리저긍로` → `물리적으로`

**구조 변경**
- 다중 행 연산자(`IN`, `EXISTS`, `ANY`, `ALL`) 표로
- 위치/동작 분류 sub-section 분리
- 뷰 장점 3가지 표로

---

### `docs/database/sql-multi-table.md`
**frontmatter**: title=SQL로 다수의 테이블 제어, tags=[database, sql, group-by, having, join, inner-join]

**오타/맞춤법**
- `Coulmn` → `Column` (반복)
- `RIGHT JOIN user` (잘못된 자기 조인) → `RIGHT JOIN rental` (의도 추정. 원본은 user-user 자기 조인이라 의미 없는 코드였음)

**구조 변경**
- GROUP BY → HAVING → JOIN 흐름을 명확히 sub-section 정리

---

### `docs/database/group-window-functions.md`
**frontmatter**: title=그룹 함수 & 윈도우 함수, tags=[database, sql, window-function, rank, partition-by, rollup, cube]

**오타/맞춤법**
- `ARUGMENTS` → `ARGUMENTS`
- `구할 떄` → `구할 때`
- `해들을 N등분` → `행들을 N등분`
- `존재한느지` → `존재하는지`
- `SALAY` → `SALARY` (코드 내 변수명)
- `CUBE` 누락된 SQL 예시 추가

**구조 변경**
- 윈도우 함수 요소 8개 표
- 순위 함수 비교 표 (RANK/DENSE_RANK/ROW_NUMBER 결과 차이 명시)
- 행 순서/비율 함수 표

---

### `docs/database/set-operators-hierarchical.md`
**frontmatter**: title=집합연산자와 계층형 질의, tags=[database, sql, set-operator, union, hierarchical-query, recursive-cte]

**오타/맞춤법**
- `CONNECT_BY_ISLEF` → `CONNECT_BY_ISLEAF` (정확한 키워드)
- `값을 호출할 할 수있게` 띄어쓰기 정리
- Oracle 계층 SQL의 `connect by prior 사원번호 = 관리자` → `= 관리자번호` (괄호/마침표 깨짐 정정)

**구조 변경**
- 일반 집합 연산 / 순수 관계 연산 표 분리
- UNION/UNION ALL/INTERSECT/EXCEPT를 sub-section
- MariaDB 재귀 CTE 코드 주석을 풍부하게 (Oracle CONNECT BY 매핑 설명)
- CONNECT BY 키워드 4종 표

---

## Batch 5 — 2026-05-10 (Network 6개, HTTP 제외)

### `docs/network/computer-network-basics.md`
**frontmatter**: title=컴퓨터 네트워크 기본, tags=[network, tcp, udp, packet-switching, delay, http]

**구조 변경**
- TCP vs UDP 비교 표
- delay 3종(queueing/transmission/propagation) 표
- Persistent vs Non-persistent HTTP 표

---

### `docs/network/application-layer.md`
**frontmatter**: title=애플리케이션 계층, tags=[network, socket, tcp, udp, multiplexing, reliable-transfer]

**오타/맞춤법**
- `Mutiplexing` → `Multiplexing`
- `strcut sockaddr` → `struct sockaddr`
- `sever` → `server`
- `respons` → `response`

**구조 변경**
- TCP Server/Client 함수 표
- UDP Header 4 field 표
- Socket 함수 시그니처 코드 블록 정리

---

### `docs/network/transport-layer.md`
**frontmatter**: title=전송 계층, tags=[network, tcp, go-back-n, selective-repeat, flow-control, congestion-control]

**오타/맞춤법**
- `recevier` → `receiver`
- `duplicta` → `duplicate`
- `condition control` → `congestion control`

**구조 변경**
- Performance 변수 표 (L, R, L/R, RTT)
- TCP Header field 표
- 8.1 네트워크 상황 인식 / 8.2 3 Main Phase 표 분리
- TCP Tahoe vs Reno 명확히 분리

---

### `docs/network/network-layer.md`
**frontmatter**: title=네트워크 계층, tags=[network, ip, routing, subnet, nat, dhcp, dijkstra, bgp]

**오타/맞춤법**
- `paht` → `path`
- `fowarding` → `forwarding` (반복)
- `Boarder` → `Border`
- `IPv6 가 적은 주소체계를 가지고 있기 때문에` → 정정 (IPv4가 부족한 게 맞음)

**오류 정정**
- **IPv6는 64 bit가 아니라 128 bit** — "64 bit"는 원본 오류. 본문에 "64 bit (실제로는 128 bit)"로 정정 표기 (학습 노트 의도 보전)

**구조 변경**
- 11개 sub-section으로 분리
- IP 주소 클래스(A/B/C) 표
- DHCP 흐름 5단계 명확화
- Dijkstra 변수 표
- Routing Algorithm 두 종류(Link State / Distance Vector) sub-section

---

### `docs/network/link-layer.md`
**frontmatter**: title=링크 계층, tags=[network, link-layer, mac, ethernet, arp, switch, wifi, cellular]

**오타/맞춤법**
- `address relation protocol` → `Address Resolution Protocol` (ARP의 정확한 풀이)
- `bandwith` → `bandwidth`
- `CSMA/CS` → `CSMA/CD`
- `(carrier sense multiple access)` 표기 정리

**구조 변경**
- MAC 4종(TDMA/FDMA/Random Access/Taking Turns) sub-section 분리
- LAN/Switch/Wireless/Wi-Fi/Cellular 6개 H2로 명확화
- Wi-Fi 4 MAC Address를 표로 정리
- Wi-Fi 연결 순서 5단계 명확화

---

### `docs/network/multimedia-networking.md`
**frontmatter**: title=Multimedia Networking, tags=[network, multimedia, sampling, dash, cdn, streaming]

**오타/맞춤법**
- `Cotent` → `Content`

**구조 변경**
- UDP vs TCP 비교 표
- DASH/CDN sub-section 분리

---

## Batch 6 — 2026-05-10 (OS 9개)

### `docs/os/os-overview.md`
**frontmatter**: title=운영체제 개요, tags=[os, kernel, operating-system, scheduler, interrupt]

**구조 변경**
- OS 정의/목적/기능/프로세스/종류로 sub-section 분리
- "OS를 공개하는 이유" 단락을 인용 블록으로 강조

---

### `docs/os/computer-system-structure.md`
**frontmatter**: title=컴퓨터 시스템의 구조, tags=[os, system-call, interrupt, dma, kernel, mode-bit]

**오타/맞춤법**
- `(Os)` → `(OS)` 대문자 통일
- `interrupt를 검` → `interrupt를 검` (원문 표현 유지)

**구조 변경**
- OS 분류(처리 방식) 표 + 처리 방식 상세 sub-section
- 용어 정리 4개 표 (Multitasking/Multiprogramming/Time sharing/Multiprocessor)
- OS 예시 3종(UNIX/DOS/MS Windows) 표
- 주요 하드웨어 요소 5종 표 (Exception/Interrupt/Registers/Program Counter/Timer)

---

### `docs/os/process-management.md`
**frontmatter**: title=프로세스 관리, tags=[os, process, pcb, context-switch, scheduler, thread, ipc, fork]

**오타/맞춤법**
- `prgoram을` → `프로그램을`
- `다음ㅇ` → `다음에`
- `수해에` → `수행에`
- `Coummunication` → `Communication`
- `떄문에` → `때문에`

**구조 변경**
- 10개 H2 sub-section으로 명확히 분리
- 프로세스 5상태(Running/Ready/Blocked/New/Terminated) 표
- PCB 4카테고리 표
- 스케줄러 3종 sub-section (Long-term/Short-term/Medium-term)
- fork/exec/wait/exit 4가지 시스템 콜 표

---

### `docs/os/cpu-scheduling.md`
**frontmatter**: title=CPU Scheduling, tags=[os, scheduling, fcfs, sjf, round-robin, priority, multilevel-queue]

**구조 변경**
- 7개 알고리즘(FCFS/SJF/Priority/RR/Multilevel Queue/Multilevel Feedback Queue/Multiprocessor) sub-section
- 상태 변화 4종 표 (preemptive vs nonpreemptive)
- Scheduling Criteria 5종 표
- Multiple-Processor Scheduling 옵션 표

---

### `docs/os/process-synchronization.md`
**frontmatter**: title=Process Synchronization, tags=[os, synchronization, race-condition, critical-section, semaphore, mutex]

**구조 변경**
- 3가지 해결 조건(Mutual Exclusion/Progress/Bounded Waiting) 표
- Semaphore 구성 표
- Busy-wait vs Block/Wake-up 비교 sub-section

---

### `docs/os/memory-management.md`
**frontmatter**: title=메모리 관리, tags=[os, memory, paging, segmentation, mmu, address-binding, swapping]

**오타/맞춤법**
- `eentry` → `entry`
- `parella search` → `parallel search`

**구조 변경**
- Address Binding 3종(Compile/Load/Run time) 표
- Dynamic Storage-Allocation 3가지(First-fit/Best-fit/Worst-fit) 표
- Two-Level Page Table의 p1/p2/d 3부분 표
- Page Table entry bit (Protection/Valid-Invalid) 표
- Segmentation 레지스터 표

---

### `docs/os/virtual-memory.md`
**frontmatter**: title=Virtual Memory, tags=[os, virtual-memory, demand-paging, page-fault, lru, clock, thrashing, working-set]

**구조 변경**
- Replacement Algorithm 6종(Optimal/FIFO/LRU/LFU/Clock 등) sub-section 분리
- Allocation Scheme 5종 표
- "Belady's anomaly" 표준 용어 보강 (FIFO 메모리 늘려도 성능 나빠지는 현상)

**보강**
- LRU의 약점에 대한 표준 용어(Belady's anomaly) 명시는 FIFO에만 적용

---

### `docs/os/file-system.md`
**frontmatter**: title=File System, tags=[os, file-system, directory, fat, unix-fs, vfs, nfs, cache]

**오타/맞춤법**
- `웅여체제` → `운영체제`
- `저장도니` → `저장된`
- `디텍토리` → `디렉토리` (반복)
- `파일 이름고 metadata` → `파일 이름과 metadata`
- `있느니 찾기` → `있는지 찾기`
- `cashing` → `caching`
- `blcok` → `block`
- `세그룹` → `세 그룹`

**구조 변경**
- 11개 H2 sub-section으로 명확히 분리
- File 데이터 할당 3가지(Contiguous/Linked/Indexed) sub-section
- UNIX FS 4구역 표 (Boot/Super/Inode/Data block)
- Free Space Management 4종 표
- Directory Implementation 2종 표

---

### `docs/os/multithreading.md`
**frontmatter**: title=Multithreading, tags=[os, thread, process, multithreading, multiprocessing, gil, python]

**구조 변경**
- 프로세스 vs 스레드 8개 항목 비교 표 (가장 큰 변경)
- 멀티스레딩/멀티프로세싱 장단점 표
- GIL 설명 sub-section 분리
- "Cpython" 표기를 "CPython"으로 통일

---

## Batch 7 — 2026-05-10 (FE / HTML·CSS·JS 11개)

### `docs/fe/html-css-js/html.md`
**frontmatter**: title=HTML, tags=[fe, html, web-standards, semantic, block, inline]

**구조 변경**
- 웹 3요소 비교 표
- HTML 태그 구조 4요소 표
- 주요 HTML 태그 9개 표
- Block vs Inline 비교 표

---

### `docs/fe/html-css-js/css.md`
**frontmatter**: title=CSS, tags=[fe, css, selector, cascading, inline-style, external-style]

**구조 변경**
- 6개 sub-section으로 정리 (CSS란/연동/선택자/부모-자식/캐스케이딩/주요 속성)
- 코드 들여쓰기 정리 (원본은 한 줄에 여러 속성이 붙어 있었음)

---

### `docs/fe/html-css-js/media-query.md`
**frontmatter**: title=미디어쿼리, tags=[fe, css, media-query, responsive, viewport, mobile]

**오타/맞춤법**
- `새로폭` → `세로폭`
- `veiwport` → `viewport`

**구조 변경**
- 헤딩 번호 부재 → `## 1.`, `## 2.` 통일
- viewport content 속성 표
- 반응형 vs 적응형 비교 표

---

### `docs/fe/html-css-js/website-layout-factors.md`
**frontmatter**: title=웹사이트 레이아웃에 영향을 미치는 요소, tags=[fe, css, box-model, layout, float, margin, display]

**오타/맞춤법**
- `t->r->b->l` → `top → right → bottom → left` (명확화)

**구조 변경**
- 헤딩 번호 부재 → `## 1.`, `## 2.` 통일
- Block vs Inline 비교 표
- display/float/clear sub-section 분리

---

### `docs/fe/html-css-js/animated-website.md`
**frontmatter**: title=움직이는 웹사이트 제작, tags=[fe, css, transform, transition, animation, keyframes]

**오타/맞춤법**
- `translat` → `translate`
- `많ㅇ 사용` → `많이 사용`
- `infinity` → `infinite` (CSS animation-iteration-count 정확한 키워드)

**구조 변경**
- Transform 함수 4종 표
- Prefix 4종 브라우저 매핑 표
- Transition 속성 4개 표
- animation-direction 3가지 값 표

---

### `docs/fe/html-css-js/dom-and-event.md`
**frontmatter**: title=DOM과 이벤트, tags=[fe, javascript, dom, node, event, event-listener]

**오타/맞춤법**
- `Document Object Mdel` → `Document Object Model`
- `Document.write` 호출 표기 정리
- `firstchild` → `firstChild` (정확한 camelCase)
- `getElementsById` → `getElementById` (정확한 메서드명. 원문에는 By"s"로 잘못 표기)
- `웹페이지르 의미한다` → `웹 페이지를 의미한다`
- `querySelectorALL` → `querySelectorAll` (정확한 camelCase)
- `<DOCTYPE html>` → `<!DOCTYPE html>` (HTML5 정확한 표기)

**구조 변경**
- DOM 종류 3개 표
- 요소 선택 메서드 5종 표
- 이벤트 핸들러 sub-section 분리

---

### `docs/fe/html-css-js/javascript-basics.md`
**frontmatter**: title=자바스크립트 기초, tags=[fe, javascript, variable, data-type, array, object, math]

**구조 변경**
- 데이터 타입 8종 표
- 문자열·배열·Math·변환 메서드 각각 표

---

### `docs/fe/html-css-js/javascript-basic-syntax.md`
**frontmatter**: title=자바스크립트 기초 문법 및 활용, tags=[fe, javascript, operator, condition, loop, syntax]

**오타/맞춤법**
- 소수 판별 함수 `if(n%divisor===0}` → `if (n % divisor === 0) {` (괄호 오타 정정)
- `recerStr ='';` → `reverStr = '';` (변수명 오타 정정)

**구조 변경**
- 비교/논리/조건/반복 각각 표

---

### `docs/fe/html-css-js/javascript-execution.md`
**frontmatter**: title=자바스크립트 실행, tags=[fe, javascript, execution-context, hoisting, lexical-environment, builtin-object]

**오타/맞춤법**
- `관려뇐` → `관련된`

**구조 변경**
- var/let/const 차이 표
- 내장 객체 5개(globalThis/Number/Math/Date/String) sub-section 분리

---

### `docs/fe/html-css-js/javascript-control-flow.md`
**frontmatter**: title=자바스크립트 제어 흐름, tags=[fe, javascript, async, event-loop, promise, async-await, rest-api]

**오타/맞춤법**
- `fullfilled` → `fulfilled`
- `정해지 함수` → `정해진 함수`
- `긐ㄹ라이언트` → `클라이언트` (글자 깨짐)
- `Applictaion` → `Application`
- `제고아는` → `제공하는`
- `헤서 정보` → `헤더 정보`

**구조 변경**
- Promise 상태 3종 표
- HTTP 요청 메서드 표 (GET/POST/PUT/PATCH/DELETE/OPTIONS/CONNECT/TRACE)

---

### `docs/fe/html-css-js/execution-context.md`
**frontmatter**: title=실행 컨텍스트, tags=[fe, javascript, execution-context, this, closure, arrow-function, rest, spread]

**오타/맞춤법**
- `name : 'Daniel'.` → `name: 'Daniel',` (잘못된 마침표 → 콤마)
- `first.` → `first` (잘못된 마침표 제거)
- `함수가 생성될 대` → `함수가 생성될 때`
- `사요되는` → `사용되는`
- `Math.min{` → `Math.min(` (괄호 오타 정정)
- `heatd` → `head`
- `rindSamePerson` → `findSamePerson` (오타 정정)
- 주석 번호 0 → o (객체 참조)

**구조 변경**
- this 호출 방식 5가지 표
- 화살표 vs 일반 함수 this 비교 표
- Rest/Spread sub-section 분리

---

## Batch 8a — 2026-05-10 (ML 기초 4개)

> **검증 강화 모드**: AI 학습 정확성 확보 위해 사실/수식/표준 용어 별도 검증 후 기록.

### `docs/ai/machine-learning/rule-based-ml-overview.md`
**frontmatter**: title=Rule-based Machine Learning Overview, sort_order=2, tags=[ai, ml, rule-based, version-space, candidate-elimination, hypothesis]

**검증 결과 ✅**
- Mitchell의 Candidate Elimination Algorithm 표준 설명과 일치
- Version Space 정의 정확
- 한계 설명(완벽한 세계 가정, 노이즈 처리 불가) 정확

**구조 변경**
- 6가지 속성 표로 정리
- 구성 요소 5개 표

**오타/맞춤법**: 종결어미 명사형 통일만 적용

---

### `docs/ai/machine-learning/decision-tree.md`
**frontmatter**: title=Decision Tree, sort_order=3, tags=[ai, ml, decision-tree, entropy, information-gain, id3, overfitting]

**검증 결과 ✅**
- ID3 알고리즘 (Quinlan, 1986) 표준 설명과 일치 — **출처 명시 보강**
- Entropy 정의 정확 ($H(X) = -\sum P(X=x) \log_b P(X=x)$)
- Conditional Entropy 정확
- Information Gain 정확
- Pre-pruning / Post-pruning / Cross-validation 표준 용어 정확

**구조 변경**
- A1/A9 분류 결과를 표로
- Entropy 정의 기호를 표로
- ID3 종료 조건을 표로
- $\log_b$를 코드 블록 → LaTeX `$\log_2$`로 변경 (수학 표기 일관)

---

### `docs/ai/machine-learning/entropy.md`
**frontmatter**: title=Entropy, sort_order=4, tags=[ai, ml, entropy, shannon, cross-entropy, information-theory]

**검증 결과 ✅**
- Shannon Entropy 정의 정확
- **란다우어 원리 (Landauer's Principle)**: $kT \ln(2)$ — 정확. "Landauer's Principle" 영문 표준 용어로 보강
- $1/e \approx 0.37$ 정확 (1/e = 0.3679)
- Cross-Entropy vs MSE 비교: $(1-0.01)^2 = 0.98$ 계산 정확 (정확히는 0.9801)
- Binary Cross-Entropy 손실 표 정확

**구조 변경**
- 정보량 해석 2가지를 sub-section으로 분리
- Cross-entropy 사용 이유 sub-section 분리

**오타/맞춤법**: 종결어미 명사형 통일

---

### `docs/ai/machine-learning/information-gain.md`
**frontmatter**: title=Information Gain, sort_order=5, tags=[ai, ml, information-gain, entropy, decision-tree, lagrange]

**검증 결과 ✅**
- IG 공식 정확
- "엔트로피는 분할 시 감소 또는 유지" — Jensen 부등식 결과로 정확
- 균등 분포에서 엔트로피 최대 — 정확
- **라그랑주 승수법 증명**: 미분 결과 $\log(p_i) = -1 - \lambda$ → 모든 $i$에 대해 동일 → $p_i = 1/n$. 표준 증명과 정확히 일치
- 가중 평균 가중치 합 $\sum w_i = 1$ 정확

**구조 변경**
- 가중치 정의를 표로
- IG 비교 예시를 표로

**오타/맞춤법**: 종결어미 명사형 통일

> **추가 학습 노트** (원본에 없지만 학습 중 참고):
> Information Gain은 **다중값 attribute에 편향** 문제가 있음 (예: ID 같은 attribute는 IG가 매우 높지만 일반화 안 됨). 이를 보완하는 지표가 **Gain Ratio** (C4.5)와 **Gini Impurity** (CART). 이 노트는 본문에 반영하지 않고 후속 학습용 메모로만 기록.

---

## Batch 8b — 2026-05-10 (ML 부스팅 5개)

> **검증 강화 모드 계속**. 5개 파일 모두 이미 매우 정돈된 상태(`# H1` + 표 + LaTeX)여서 frontmatter 추가 + 종결어미 명사형 통일만 적용.

### `docs/ai/machine-learning/random-forest.md`
**frontmatter**: title=Random Forest, sort_order=6, tags=[ai, ml, random-forest, ensemble, bagging, bootstrap, oob]

**검증 결과 ✅**
- Bootstrap 평균 63.2% 선택 (= $1 - 1/e \approx 0.632$) — 정확
- `max_features` 권장값: 분류 $\sqrt{p}$, 회귀 $p/3$ — 정확 (Breiman 2001)
- OOB Error 설명 정확
- Feature Importance 공식 정확
- Hyperparameter 권장값 표준 범위와 일치

---

### `docs/ai/machine-learning/ada-boost.md`
**frontmatter**: title=AdaBoost (Adaptive Boosting), sort_order=7, tags=[ai, ml, adaboost, boosting, stump, weak-learner, ensemble]

**검증 결과 ✅**
- Amount of Say $\alpha = \frac{1}{2}\ln\frac{1-\epsilon}{\epsilon}$ — 정확
- 가중치 업데이트 $w_i^{(t+1)} = w_i^{(t)} \cdot e^{-y_i \alpha h(x_i)}$ — 정확
- 지수 손실 함수 미분 유도 (∂L/∂α=0) — 표준 증명과 일치
- 최종 예측 $H(x) = \text{sign}(\sum \alpha^{(t)} h^{(t)}(x))$ — 정확
- SAMME (다중클래스 확장: $\alpha = \ln\frac{1-\epsilon}{\epsilon} + \ln(K-1)$) 정확
- SAMME.R (Real AdaBoost, 확률 기반) Scikit-learn 기본값 — 정확

---

### `docs/ai/machine-learning/gradient-boost.md`
**frontmatter**: title=Gradient Boosting, sort_order=8, tags=[ai, ml, gradient-boosting, boosting, residual, regression, learning-rate]

**검증 결과 ✅**
- Pseudo Residual $r_i = -\partial L / \partial F$ — 정확
- 손실별 Pseudo Residual 표 정확:
  - MSE $\frac{1}{2}(y-F)^2$ → $y - F$ ✓
  - MAE $|y-F|$ → $\text{sign}(y-F)$ ✓
  - Log Loss → $y - \sigma(F)$ ✓
- Learning Rate 권장값 0.01~0.3 (Friedman 2001 표준)

---

### `docs/ai/machine-learning/xg-boost.md`
**frontmatter**: title=XGBoost (eXtreme Gradient Boosting), sort_order=10, tags=[ai, ml, xgboost, boosting, regularization, similarity-score, gain]

**검증 결과 ✅** (Chen & Guestrin, 2016 표준)
- 목적 함수 $Obj = \sum L + \gamma T + \frac{1}{2}\lambda \sum w_j^2$ — 정확
- 2차 테일러 전개: $g_i$ (Gradient), $h_i$ (Hessian) — 정확
- MSE에서 $g_i = -(y_i - F(x_i))$, $h_i = 1$ — 정확
- Leaf 최적 출력값 $w_j^* = -\sum g_i / (\sum h_i + \lambda)$ — 정확
- Similarity Score $(\sum r_i)^2 / (N + \lambda)$ — 정확. **방향의 일관성** 측정 설명 명확
- Gain = Sim_L + Sim_R - Sim_P - γ — 정확
- 가지치기(Gain ≤ 0) 메커니즘 정확

---

### `docs/ai/machine-learning/gradient-boost-classification.md`
**frontmatter**: title=Gradient Boosting for Classification, sort_order=9, tags=[ai, ml, gradient-boosting, classification, log-odds, cross-entropy, kl-divergence]

**검증 결과 ✅**
- Log Odds = $\log(p/(1-p))$ — 정확. 확률·Odds·Log Odds 변환 표 정확
- Sigmoid = Log Odds 역함수 $\sigma(z) = 1/(1+e^{-z})$ — 정확
- Cross-Entropy 미분: 1차 = $y - p$ (잔차), 2차 = $p(1-p)$ — 정확
- 분류 Leaf 출력 $\gamma = \sum(y_i - p_i) / \sum p_i(1-p_i)$ — Friedman 표준 공식과 일치
- KL Divergence와 Cross-Entropy 분해 $H(p,q) = H(p) + D_{KL}(p \| q)$ — 정확
- Jensen 부등식 증명 정확

---

## Batch 9 — 2026-05-10 (Deep Learning 기초 4개)

> **검증 강화 모드**. 사실 검증에서 **2개 파일에서 중요한 오류 발견**. 본문에 정정 표시 포함.

### `docs/ai/deep-learning/perceptron.md`
**frontmatter**: title=퍼셉트론, sort_order=1, tags=[ai, deep-learning, perceptron, logic-gate, xor, multi-layer-perceptron]

**검증 결과 ✅**
- Frank Rosenblatt 1957년 — 정확
- AND/NAND/OR 매개변수 예시 모두 게이트 진리표 통과 확인
- XOR 다층 퍼셉트론 구현 (`AND(NAND, OR)`) — 정확

**오타/맞춤법 정정**
- `np.arrapy` → `np.array` (반복 2건)
- `else` → `else:` (콜론 누락)
- `def nongate` → `def NAND` (가독성, 실제 NAND임을 명확히)
- `값한 값` → `곱한 값`
- `부린다` → `부른다`
- `한쪽이 1일 때만` → `정확히 한 쪽만 1일 때` (XOR 정의 명확화)
- `arrapy` 등 빠진 OR 게이트 코드 추가 (XOR에서 사용하므로 필수)

**구조 변경**
- AND/NAND/OR/XOR을 sub-section으로 명확히 분리
- 편향(bias) 도입을 별도 sub-section

---

### `docs/ai/deep-learning/neural-network.md`
**frontmatter**: title=신경망, sort_order=2, tags=[ai, deep-learning, neural-network, activation-function, sigmoid, relu, softmax]

**검증 결과 ✅**
- Step / Sigmoid / ReLU 정의 모두 정확
- 비선형 함수 필요성 증명 ($h(h(h(x))) = a'x + b'$) — 정확
- Softmax 오버플로우 처리 수식 유도 4단계 — 정확
- argmax 설명 정확

**오타/맞춤법 정정**
- `이라고 한다.  이` → 띄어쓰기 정리
- `한수식` → `한 수식`

**구조 변경**
- Sigmoid/ReLU/Softmax 각각 sub-section
- Softmax 안정화 트릭(max값 빼기) sub-section 분리

---

### `docs/ai/deep-learning/neural-network-training.md` ⚠️
**frontmatter**: title=신경망 학습, sort_order=3, tags=[ai, deep-learning, training, loss-function, gradient-descent, sgd, mini-batch]

**⚠️ 중요 정정 — SSE 변수 표기 혼동**
- 원본: `$y_i$는 $i$번째 실제값 : 신경망의 출력`, `$\hat{y}_i$는 $i$번째 예측값 : 정답 레이블`
- 두 번째 콜론 뒤 설명이 뒤바뀜 ($y_i$ = 실제값이라면서 신경망 출력이라 함, 모순)
- **정정**: 원본 노트가 『밑바닥부터 시작하는 딥러닝』 표기를 따른 것으로 추정. $y_i$ = **신경망 출력 (예측값)**, $\hat{y}_i$ 또는 $t_i$ = **정답 레이블 (실제값)** 으로 명시
- 본문에 표기 혼동 가능성 안내문 추가

**검증 결과 ✅**
- SSE / MSE / Cross-Entropy 수식 모두 정확
- 소프트맥스+CEE 미분 $\partial E / \partial a_j = y_j - t_j$ — 정확
- 학습률 hyperparameter 설명 정확
- SGD 노이즈/지역 최적해 탈출 설명 정확

**오타/맞춤법 정정**
- "정확히 이 함수의 미분을 통해" 어색 → "정확히는 이 함수의 미분을 통해"

**구조 변경**
- 손실 함수 종류별 sub-section
- 학습률 효과 표 추가
- "왜 정확도가 아닌 손실 함수인가?" sub-section 추가 (원본의 단락 말미를 명시화)

---

### `docs/ai/deep-learning/backpropagation.md` ⚠️
**frontmatter**: title=오차역전파법, sort_order=4, tags=[ai, deep-learning, backpropagation, computational-graph, relu, sigmoid]

**⚠️ 중요 정정 — 코드 버그**
- 원본 코드 마지막 줄: `dorange, dorange_num = mul_apple_layer.backward(dorange_price)`
- `mul_apple_layer`는 사과 layer. 오렌지의 역전파에는 **`mul_orange_layer`** 를 사용해야 함
- **정정**: `mul_orange_layer.backward(dorange_price)`. 본문에 정정 안내 인용 블록 추가

**오타/맞춤법 정정**
- `prpagation` → `propagation`
- `propgation` → `propagation`
- `어떻ㄴ` → `어떤`
- `상관업ㅇㅅ이` → `상관없이` (글자 깨짐)
- `weight,bios` → `weight, bias`
- `class ReLu` → `class ReLU` (대문자 표기 통일)

**구조 변경**
- 곱셈/덧셈 노드 → 활성화 함수 계층 순으로 sub-section
- 코드 들여쓰기를 PEP 8 규칙에 맞게 정리

**검증 결과 ✅**
- ReLU 미분 정확
- Sigmoid 미분 $y(1-y)$ 정확
- 곱셈 노드 backward `dx = dout * y, dy = dout * x` — 정확 (상대 입력값 곱셈)
- 덧셈 노드 backward `dx = dout, dy = dout` — 정확 (그대로 전파)

---

## Batch 10 — 2026-05-10 (DL 학습 기법 4개)

> **검증 강화 모드**. 4개 파일 모두 매우 잘 작성됨. 사실/수식 오류 없음. frontmatter만 추가.

### `docs/ai/deep-learning/logistic-regression-cost.md`
**frontmatter**: title=Logistic Regression Cost, sort_order=5, tags=[ai, deep-learning, logistic-regression, bce, sigmoid, cost-function, convex]

**검증 결과 ✅**
- Sigmoid 정의 정확
- BCE 정의 $-y\log\hat{y} - (1-y)\log(1-\hat{y})$ — 정확
- MSE + Sigmoid → non-convex 설명 정확
- Convex 함수 형성 → global minimum 보장 정확
- BCEWithLogitsLoss = Sigmoid + BCELoss (수치 안정성) — 정확
- "음수는 최대화를 최소화로 전환" 표현은 likelihood 최대화 ↔ negative log-likelihood 최소화의 의미. 학습 단계에서는 OK

---

### `docs/ai/deep-learning/softmax-regression.md`
**frontmatter**: title=Softmax Regression, sort_order=6, tags=[ai, deep-learning, softmax, multi-class-classification, cross-entropy, one-hot]

**검증 결과 ✅**
- Softmax 정의 $e^{z_i} / \sum e^{z_j}$ — 정확
- 출력 합 = 1 (확률 분포) 정확
- One-Hot Encoding 정확
- Categorical Cross-Entropy = $-\sum L_i \log S_i$ — 정확
- BCE = 2-class Categorical Cross-Entropy의 일반화 관계 정확
- **PyTorch CrossEntropyLoss = LogSoftmax + NLLLoss** 정확. 클래스 인덱스 사용 (One-Hot 아님) 정확
- "Softmax 중복 적용" 안티패턴 경고 정확

---

### `docs/ai/deep-learning/neural-networks-multilayer.md`
**frontmatter**: title=Neural Networks (다층), sort_order=8, tags=[ai, deep-learning, neural-network, backpropagation, vanishing-gradient, alexnet, history]

**검증 결과 ✅** (역사적 사실 모두 검증)
- **Hubel & Wiesel 고양이 시각 피질 실험 (1959)** — 정확. 노벨상 수상 (1981)
- XOR 진리표 정확
- Backpropagation Chain Rule 정확
- Sigmoid 미분 0~0.25 → Vanishing Gradient — 정확
- **Geoffrey Hinton 2006** — RBM 사전학습으로 딥러닝 부활 — 정확
- **AlexNet 2012** — ImageNet 우승, top-5 error 26.2% → 15.3% — 정확
- **2015년 ResNet** — top-5 error 3.57% — 정확
- He init / Xavier init 정확

---

### `docs/ai/deep-learning/relu.md`
**frontmatter**: title=ReLU, sort_order=9, tags=[ai, deep-learning, relu, activation-function, vanishing-gradient, leaky-relu, elu]

**검증 결과 ✅**
- ReLU 정의/미분 정확
- **Sigmoid 미분 최댓값 0.25 (x=0)** — 정확
- **수치 예시 $0.25^9 \approx 3.8 \times 10^{-6}$** — 직접 계산 확인 ($0.25^9 = 3.8147 \times 10^{-6}$) ✓
- Leaky ReLU $\alpha x$ ($\alpha = 0.01$) — 정확
- ELU $\alpha(e^x - 1)$ — 정확
- PReLU ($\alpha$가 학습 가능 파라미터) — 정확
- Dying ReLU 문제 정확
- 활성화 함수 비교 표 (출력 범위, Vanishing Gradient, 계산 비용) — 모두 정확
- 사용 가이드 (은닉층 ReLU, 출력층 Sigmoid/Softmax/Linear) — 표준과 일치
