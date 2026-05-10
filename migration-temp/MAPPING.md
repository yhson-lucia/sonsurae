# 마이그레이션 매핑표 (검수용)

> 원본: `/Users/hwang-yejun/Desktop/WB/my-website/docs/`
> 대상: `Sonsurae/migration-temp/docs/`
> 파일 수: md 104개 / 이미지 140개

## 변환 원칙
- **카테고리 슬러그**: 영문 단어 직역 + kebab-case (예: `데이터베이스` → `database`)
- **파일 슬러그**: 의미 기반 영문 매핑 + kebab-case. 번호 prefix(`01.`, `02.`)는 `sort_order` 컬럼으로 분리하고 슬러그에서 제거
- **이미지 슬러그**: 원본 파일명의 한글 prefix를 영문 슬러그로 치환. 타임스탬프는 유지 (충돌 방지 + 추적성)
  - 예: `프로세스 관리-20250117212222192.webp` → `process-management-20250117212222192.webp`
- **`index.md`**: 카테고리 description으로 흡수 → posts 테이블에 별도 글로 만들지 않음 (총 9개 제외)
- **`intro.md`**: 사이트 소개 → 글로 변환하지 않음 (홈 페이지 카피로 흡수)

---

## 1. 카테고리 매핑

| 원본 경로 | 슬러그 | 비고 |
|---|---|---|
| `AI/` | `ai` | |
| `AI/딥러닝/` | `ai/deep-learning` | |
| `AI/머신러닝/` | `ai/machine-learning` | |
| `AI/실습/` | `ai/practice` | |
| `AWS/` | `aws` | |
| `AWS/Lambda/` | `aws/lambda` | |
| `AWS/S3/` | `aws/s3` | |
| `FE/` | `fe` | "frontend"보다 짧고 원본 그대로 |
| `FE/HTML,CSS,JS/` | `fe/html-css-js` | 콤마 → 하이픈 |
| `FE/React/` | `fe/react` | |
| `JDBC/` | `jdbc` | |
| `JPA/` | `jpa` | |
| `Java/` | `java` | |
| `Spring/` | `spring` | |
| `Spring/Spring MVC/` | `spring/spring-mvc` | |
| `Spring/Spring Security/` | `spring/spring-security` | |
| `네트워크/` | `network` | |
| `데이터베이스/` | `database` | |
| `도커/` | `docker` | |
| `운영체제/` | `os` | |

---

## 2. 파일 슬러그 매핑

> `sort_order`는 원본 파일명의 번호 prefix(`01.`, `02.`)에서 추출. 번호 없는 파일은 알파벳 순서대로 부여 가능 (마이그레이션 스크립트에서 자동).

### AI / 딥러닝 (`ai/deep-learning`)
| 원본 | 슬러그 | sort_order | 제목(추정) |
|---|---|---|---|
| `01.퍼셉트론.md` | `perceptron` | 1 | 퍼셉트론 |
| `02.신경망.md` | `neural-network` | 2 | 신경망 |
| `03.신경망 학습.md` | `neural-network-training` | 3 | 신경망 학습 |
| `04.오차역전파법.md` | `backpropagation` | 4 | 오차역전파법 |
| `05.Logistic Regression의 Cost.md` | `logistic-regression-cost` | 5 | Logistic Regression의 Cost |
| `06.Softmax Regression.md` | `softmax-regression` | 6 | Softmax Regression |
| `07.learning rate,overfitting,regularization.md` | `learning-rate-overfitting-regularization` | 7 | Learning rate, Overfitting, Regularization |
| `08.Neural Networks.md` | `neural-networks-multilayer` | 8 | Neural Networks (※ 02와 슬러그 충돌 방지 위해 suffix) |
| `09.ReLU.md` | `relu` | 9 | ReLU |
| `10.Weight 초기화.md` | `weight-initialization` | 10 | Weight 초기화 |
| `11.overfitting.md` | `overfitting` | 11 | Overfitting (※ 07과 별개) |
| `12.ConvNet.md` | `convnet` | 12 | ConvNet |

### AI / 머신러닝 (`ai/machine-learning`)
| 원본 | 슬러그 | sort_order |
|---|---|---|
| `02.Rule based Machine Learning Overview.md` | `rule-based-ml-overview` | 2 |
| `03.Decision Tree.md` | `decision-tree` | 3 |
| `04.Entropy.md` | `entropy` | 4 |
| `05.Information Gain.md` | `information-gain` | 5 |
| `06.Random Forest.md` | `random-forest` | 6 |
| `07.Ada Boost.md` | `ada-boost` | 7 |
| `08.Gradient Boost.md` | `gradient-boost` | 8 |
| `09.Gradient Boost Classification.md` | `gradient-boost-classification` | 9 |
| `10. XG Boost.md` | `xg-boost` | 10 |

### AI / 실습 (`ai/practice`)
| 원본 | 슬러그 | sort_order |
|---|---|---|
| `00.프레임워크.md` | `framework-intro` | 0 |
| `01.Linear_regression.md` | `linear-regression-practice` | 1 |
| `02.multi-variable linear regression.md` | `multi-variable-linear-regression-practice` | 2 |
| `03.logistic_regression.md` | `logistic-regression-practice` | 3 |
| `04.softmax_regression.md` | `softmax-regression-practice` | 4 |
| `05.xor_gate.md` | `xor-gate-practice` | 5 |
| `06.Decision_Tree.md` | `decision-tree-practice` | 6 |

### AWS / Lambda (`aws/lambda`)
| 원본 | 슬러그 |
|---|---|
| `AWS Lambda.md` | `aws-lambda` |

### AWS / S3 (`aws/s3`)
| 원본 | 슬러그 | sort_order |
|---|---|---|
| `01.S3.md` | `s3-overview` | 1 |
| `02.S3 Batch Operation.md` | `s3-batch-operation` | 2 |

### FE / HTML,CSS,JS (`fe/html-css-js`)
| 원본 | 슬러그 |
|---|---|
| `HTML.md` | `html` |
| `CSS.md` | `css` |
| `미디어쿼리.md` | `media-query` |
| `웹사이트 레이아웃에 영향을 미치는 요소.md` | `website-layout-factors` |
| `움직이는 웹사이트 제작.md` | `animated-website` |
| `DOM과 이벤트.md` | `dom-and-event` |
| `자바스크립트 기초.md` | `javascript-basics` |
| `자바스크립트 기초 문법 및 활용.md` | `javascript-basic-syntax` |
| `자바스크립트 실행.md` | `javascript-execution` |
| `자바스크립트 제어 흐름.md` | `javascript-control-flow` |
| `실행 컨텍스트.md` | `execution-context` |

### FE / React (`fe/react`)
| 원본 | 슬러그 |
|---|---|
| `React.md` | `react` |

### JDBC (`jdbc`)
| 원본 | 슬러그 |
|---|---|
| `JDBCConnection.md` | `jdbc-connection` |
| `JDBC Template.md` | `jdbc-template` |
| `커넥션 풀.md` | `connection-pool` |
| `트랜잭션.md` | `transaction` |

### JPA (`jpa`)
| 원본 | 슬러그 | sort_order |
|---|---|---|
| `01.JPA.md` | `jpa-intro` | 1 |
| `02.연관관계.md` | `association` | 2 |
| `03.값 타입.md` | `value-type` | 3 |
| `04.연관관계 관리.md` | `association-management` | 4 |
| `05.프록시.md` | `proxy` | 5 |

### Java (`java`)
| 원본 | 슬러그 |
|---|---|
| `자바.md` | `java-overview` |
| `객체 지향 프로그래밍.md` | `object-oriented-programming` |
| `예외 처리.md` | `exception-handling` |
| `컬렉션 프레임워크.md` | `collection-framework` |

### Spring (`spring`)
| 원본 | 슬러그 |
|---|---|
| `SpringFramework.md` | `spring-framework` |
| `Spring Boot.md` | `spring-boot` |
| `WebSocket.md` | `websocket` |
| `검증.md` | `validation` |

### Spring / Spring MVC (`spring/spring-mvc`)
| 원본 | 슬러그 |
|---|---|
| `MVC.md` | `mvc` |
| `요청 매핑.md` | `request-mapping` |

### Spring / Spring Security (`spring/spring-security`)
| 원본 | 슬러그 |
|---|---|
| `Spring Security.md` | `spring-security` |
| `JWT.md` | `jwt` |

### 네트워크 (`network`)
| 원본 | 슬러그 |
|---|---|
| `컴퓨터 네트워크 기본.md` | `computer-network-basics` |
| `애플리케이션 계층.md` | `application-layer` |
| `전송 계층.md` | `transport-layer` |
| `네트워크 계층.md` | `network-layer` |
| `링크 계층.md` | `link-layer` |
| `HTTP.md` | `http` |
| `Multimedia networking.md` | `multimedia-networking` |

### 데이터베이스 (`database`)
| 원본 | 슬러그 |
|---|---|
| `데이터베이스 기초.md` | `database-basics` |
| `데이터베이스 구성.md` | `database-structure` |
| `데이터베이스 구현.md` | `database-implementation` |
| `데이터 모델링.md` | `data-modeling` |
| `SQL 기본.md` | `sql-basics` |
| `JOIN.md` | `join` |
| `SUBQUERY.md` | `subquery` |
| `SQL로 다수의 테이블 제어.md` | `sql-multi-table` |
| `그룹 함수 & 윈도우 함수.md` | `group-window-functions` |
| `집합연산자와 계층형 질의.md` | `set-operators-hierarchical` |

### 도커 (`docker`)
| 원본 | 슬러그 |
|---|---|
| `Docker.md` | `docker-intro` |
| `Docker 실습.md` | `docker-practice` |
| `운영환경.md` | `production-environment` |

### 운영체제 (`os`)
| 원본 | 슬러그 |
|---|---|
| `운영체제 개요.md` | `os-overview` |
| `컴퓨터 시스템의 구조.md` | `computer-system-structure` |
| `프로세스 관리.md` | `process-management` |
| `CPU scheduling.md` | `cpu-scheduling` |
| `Process Synchronization.md` | `process-synchronization` |
| `메모리 관리.md` | `memory-management` |
| `Virtual Memory.md` | `virtual-memory` |
| `File System.md` | `file-system` |
| `Multithreading.md` | `multithreading` |

---

## 3. 이미지 변환 규칙

원본 파일명에서 한글/공백 prefix를 새 슬러그로 치환:

| 원본 패턴 | 변환 결과 |
|---|---|
| `images/Docker-20250119163823672.webp` | `images/docker-intro-20250119163823672.webp` |
| `images/프로세스 관리-20250117212222192.webp` | `images/process-management-20250117212222192.webp` |
| `images/HTTP-20250117202717877.webp` | `images/http-20250117202717877.webp` |
| `images/Pasted image 20250117202308.png` | `images/pasted-20250117202308.png` |
| `images/스크린샷 2026-01-13 오후 10.00.56.png` | `images/screenshot-20260113-220056.png` |

규칙:
- prefix: 위 파일 매핑표 슬러그와 동일
- timestamp: 원본 유지 (DB 충돌 방지)
- "Pasted image" / "스크린샷" 같은 시스템 자동 생성 이름은 `pasted-` / `screenshot-` 으로 통일

---

## 4. 제외 파일 (변환하지 않음)

| 파일 | 처리 |
|---|---|
| `intro.md` | 사이트 홈 카피로 흡수 |
| `*/index.md` (9개) | 카테고리 description으로 흡수 — `categories.description` 컬럼에 저장 |

---

## 검수 포인트

다음 항목 확인 후 OK 주시면 변환 스크립트 실행합니다:

1. **카테고리명**: `os` vs `operating-system`, `fe` vs `frontend` — 짧게 갔는데 괜찮나요?
2. **번호 prefix 처리**: `01.` 등은 슬러그에서 제거하고 `sort_order` 컬럼으로 분리. OK?
3. **슬러그 충돌**: `08.Neural Networks.md`(딥러닝)는 `02.신경망.md`(neural-network)와 의미 중복. → `neural-networks-multilayer`로 분리. OK?
4. **`index.md` 흡수**: 카테고리 description으로 흡수. OK? (글로 별도 등록하려면 알려주세요)
5. **이미지 prefix**: 글 슬러그와 동일하게 변환. OK?
6. **누락 의심**: `Spring Boot.md`처럼 공백 포함 파일명 → `spring-boot`로 직역. 다른 의도 있으면 수정.

수정/변경 사항 있으면 어느 줄인지만 알려주세요.
