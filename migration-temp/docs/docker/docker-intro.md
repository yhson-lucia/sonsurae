---
title: Docker
slug: docker-intro
category: docker
summary: 컨테이너 기반 가상화의 등장 배경, Docker 흐름, 컨테이너 격리, 이미지/Dockerfile, Volume, Compose 정리
tags: [docker, container, virtualization, image, dockerfile, compose]
sort_order: null
created: 2025-01-19
updated: 2026-05-10
---

## 1. 소프트웨어 운영 플랫폼의 변화

- **초기 (Bare Metal)**: 깡통 시스템 위에 직접 OS와 애플리케이션을 설치
  - 한 대의 서버를 하나의 용도로만 사용. 남는 공간 방치. 안정적이지만 비효율적
- 시대적으로 하드웨어 가격은 하락하고 성능은 높아짐. 운영 시스템은 대용량화
- **Hypervisor 기반 가상화 (VM)**: 소프트웨어 기술로 가상 컴퓨터(VM)를 만들고 그 위에 애플리케이션을 올림
  - 논리적으로 공간을 분할해 VM이라는 독립 가상 환경의 서버 사용 가능
  - **Hypervisor**: 호스트 시스템에서 다수의 게스트 OS를 구동할 수 있게 하는 소프트웨어. 하드웨어를 가상화하면서 각 VM을 모니터링하는 중간 관리자
- 더 발전해 애플리케이션이 요구에 따라 **scale up / scale in** 가능해야 함
- VM은 확장이 힘들어 한계가 있었음 → **컨테이너 플랫폼** 등장
- OS 위에 컨테이너 엔진을 올리고 애플리케이션을 올리는 방식
- 컨테이너 기반 애플리케이션은 실제보다 적은 용량으로 운영되어 확장성·배포가 쉬움
- **Docker**는 이런 컨테이너를 세팅하는 엔진. 개발자가 만든 애플리케이션이 운영 환경에서도 똑같이 실행됨

## 2. Docker

- 컨테이너를 사용해 응용 프로그램을 더 쉽게 만들고 배포·실행하도록 설계된 도구
- 컨테이너 기반의 오픈소스 가상화 플랫폼
- **사용 이유**: 프로그램 배포 과정을 매우 단순화. 컨테이너 기반은 실제 앱보다 적은 용량으로 운영되어 확장성·배포가 쉬움
- AWS, Azure 등 어디서나 실행 가능

## 3. 컨테이너

- 코드와 모든 종속성을 패키지화해, 한 컴퓨팅 환경에서 다른 환경으로 빠르고 안정적으로 실행되도록 하는 **소프트웨어의 표준 단위**
- **컨테이너 이미지**: 코드, 런타임, 시스템 도구·라이브러리, 설정 등 응용 프로그램 실행에 필요한 모든 것을 포함하는 가볍고 독립적인 실행 가능한 패키지
  - 런타임에 컨테이너가 됨. Docker 컨테이너의 경우 Docker 엔진에서 실행될 때 이미지가 컨테이너로 변함
  - Linux/Windows 기반 모두에서 사용 가능. 인프라와 무관하게 항상 동일하게 실행
  - 소프트웨어를 환경으로부터 격리시키고, 개발/스테이징 차이에도 균일하게 작동하도록 보장
- 즉, **Docker 컨테이너 = Docker 이미지의 인스턴스**

## 4. Docker 동작 흐름

1. Docker CLI(Docker Client)에 명령을 입력
2. Docker 서버(Docker Daemon)가 명령을 받아 이미지 생성·컨테이너 실행 등 모든 작업을 수행

예: 터미널에서 `docker run hello-world` 입력 시

1. 클라이언트가 서버로 요청 전송
2. 서버가 `hello-world` 이미지가 로컬에 캐시되어 있는지 확인
3. 없으면 `Unable to find image ~` 문구 표시
4. **Docker Hub**에서 이미지를 가져와 로컬 캐시에 저장
5. 이미지를 사용해 컨테이너 생성
6. 컨테이너가 이미지의 설정/조건에 따라 프로그램 실행

### 4.1 Docker vs Hypervisor 기반 VM

![Docker와 VM 구조 비교](images/docker-intro-01.webp)

| 구분 | Docker 컨테이너 | VM |
|---|---|---|
| 격리 수준 | 호스트 OS 커널 공유, 샌드박스 | 게스트 OS 부팅, 독립 |
| 오버헤드 | 적음 (하이퍼바이저·게스트 OS 불필요) | 큼 |
| 실행 방식 | 호스트 OS 위에 이미지 배포 | 자원 할당 → 게스트 OS 부팅 → 앱 실행 |
| 크기 | 약 5~100MB | 매우 큼 |
| 속도 | 빠름 | 느림 |

- 컨테이너에서 실행되는 프로세스는 호스트 시스템(권한 충분 시)에서도 보임
- 예: Docker로 MongoDB 컨테이너를 시작하면, 호스트 쉘에서 `ps -e | grep mongo`로 프로세스 확인 가능
- VM은 시작 시 새 커널을 부팅하고 운영체제 프로세스 세트를 시작하는 큰 작업이 필요. OS까지 가상화하므로 매우 느림

## 5. 컨테이너 격리

컨테이너와 호스트의 다른 프로세스 사이에 벽을 만드는 **Linux 커널 기능**.

- **C group (control group)**
  - CPU, 메모리, 네트워크 대역폭, HD I/O 등 프로세스 그룹의 시스템 리소스 사용량을 관리
  - 어떤 애플리케이션의 사용량이 너무 많으면 C group에 넣어 CPU·메모리 사용 제한 가능
- **Namespaces**
  - 하나의 시스템에서 프로세스를 격리시키는 가상화 기술
  - 별개의 독립 공간을 사용하는 것처럼 격리 환경을 제공하는 경량 프로세스 가상화

![Docker가 Linux 커널 기능을 활용하는 구조](images/docker-intro-02.webp)

- Docker Client/Server는 내부적으로 Linux 환경에서 동작한다고 보면 됨

## 6. Docker 이미지로 컨테이너 만들기

이미지는 응용 프로그램 실행에 필요한 모든 것을 포함.

- 시작 시 실행될 명령어 (`run ~`)
- 파일 스냅샷 (디렉토리/파일을 복사한 것)

### 6.1 실행 흐름

1. Docker 클라이언트에서 `docker run <이미지>` 입력
2. 이미지의 **파일 스냅샷**을 컨테이너 하드 디스크에 옮김
3. 이미지의 **명령어**(컨테이너 실행 시 사용)로 파일 실행
   - 명령어가 실행되면서 커널을 통해 프로그램 실행

### 6.2 이미지 내부 파일 시스템 구조

- `docker run <이미지> ls`: 현재 디렉토리의 파일 리스트 표출
  - 예: `docker run alpine ls`
  - `hello-world` 이미지로는 `ls` 사용 불가 (`executable file not found`). 이 이미지는 몇 줄 문구만 보여주는 용도라 `ls` 실행 파일이 없음

### 6.3 컨테이너 나열

- `docker run <이미지> ping localhost`: 계속 ping을 보내며 실행 중임을 표시
- `docker ps`: 실행 중인 Docker 컨테이너 리스트 (`ps` = process status)

| 컬럼 | 설명 |
|---|---|
| `CONTAINER ID` | 고유 ID 해시값 (일부만 표출) |
| `IMAGE` | 컨테이너 생성에 사용된 이미지 |
| `COMMAND` | 시작 시 실행될 명령. 대부분 이미지에 내장되어 별도 설정 불필요 |
| `CREATED` | 컨테이너 생성 시간 |
| `STATUS` | 상태. 실행 중: `Up`, 종료: `Exited`, 일시정지: `Pause` |
| `PORTS` | 컨테이너의 개방 포트와 호스트 연결 포트. 미설정 시 미출력 |
| `NAMES` | 고유 이름. `--name` 옵션 미지정 시 형용사+명사 임의 조합. `docker rename`으로 변경 가능 |

- `docker ps --format 'table {{.Names}}\t{{.Image}}'`: 원하는 항목만 표출
- `docker ps -a`: 모든 컨테이너 나열

## 7. Docker 컨테이너 생명주기와 명령어

![Docker 컨테이너 생명주기](images/docker-intro-03.webp)

`docker run <이미지>`는 두 단계로 분리 가능.

- `docker create <이미지>`: 컨테이너 생성
- `docker start <컨테이너 ID/이름>`: 시작
  - `-a` (attach): Docker 실행 시 output을 화면에 표출

### 7.1 중지 / 삭제

- `docker stop <컨테이너 ID/이름>`: **Gracefully** 중지. 작업을 완료하고 중지 (`SIGTERM` → `SIGKILL` → 중지)
- `docker kill <컨테이너 ID/이름>`: 기다리지 않고 즉시 중지
- `docker rm <컨테이너 ID/이름>`: 컨테이너 삭제 (실행 중이면 먼저 중지 필요)
- `docker rm $(docker ps -a -q)`: 모든 컨테이너 삭제
- `docker rmi <이미지 ID>`: 이미지 삭제
- `docker system prune`: 컨테이너·이미지·네트워크를 한 번에 삭제 (실행 중인 것은 영향 없음)

### 7.2 실행 중 컨테이너에 명령 전달

- `docker exec <컨테이너 ID> <명령>`

예: Redis 컨테이너

- `docker run redis`: Redis 서버 작동
- `docker exec -it <컨테이너 ID> redis-cli`: Redis 클라이언트 실행
  - 컨테이너 안에서 Redis 서버를 돌리고 있으므로, 클라이언트도 컨테이너 안에서 실행해야 함 (외부 접근 불가)
  - `-it`: interactive terminal. 명령어를 계속 입력 가능. 없으면 실행 후 바로 종료됨

쉘 환경 진입

- `docker exec -it <컨테이너 ID> <쉘>` (`sh`, `bash`, `zsh`, `powershell`)
- 이미지에 따라 가능 여부가 다름
- 쉘에서 빠져나오기: `Ctrl + D`

## 8. Docker 이미지 만들기

Docker Hub에 다른 사람이 만든 이미지를 사용할 수도 있고, 직접 만들어 올릴 수도 있음.

### 8.1 이미지 생성 순서

`Dockerfile 작성` → `Docker 클라이언트` → `Docker 서버` → `이미지 생성`

- **Dockerfile**: 이미지를 만들기 위한 설정 파일. 컨테이너가 어떻게 동작해야 하는지 정의
- **Docker 클라이언트**: Dockerfile 내용을 받아 서버로 전달
- **Docker 서버**: 실제 작업을 수행

### 8.2 Dockerfile

이미지 생성에 필요한 것 3가지

1. 베이스 이미지 명시 (파일 스냅샷)
2. 추가로 필요한 파일을 다운받는 명령어 (파일 스냅샷)
3. 컨테이너 시작 시 실행될 명령어

**베이스 이미지**: 도커 이미지는 여러 레이어로 구성. 베이스 이미지는 그 기반이 되는 부분. OS라고 생각하면 됨.

```dockerfile
# 베이스 이미지 명시
FROM baseImage

# 추가로 필요한 파일 다운로드
RUN command

# 컨테이너 시작 시 실행될 명령어
CMD ["executable"]
```

| 키워드 | 설명 |
|---|---|
| `FROM` | 이미지 기반 레이어. `<이미지>:<태그>` 형식. 태그 생략 시 최신 버전. 예: `ubuntu:14.04` |
| `RUN` | 이미지 생성 전에 수행할 쉘 명령 |
| `CMD` | 컨테이너 시작 시 실행할 실행 파일 또는 쉘 스크립트. **Dockerfile 내 1회만** 사용 가능 |

### 8.3 build

- `docker build ./` 또는 `docker build .`: 현재 디렉토리에서 Dockerfile을 찾아 빌드
- 빌드 과정
  1. 베이스 이미지(예: alpine) 가져옴
  2. 임시 컨테이너 생성 (파일 스냅샷 추가, 시작 명령 추가)
  3. 임시 컨테이너로 새 이미지 생성
  4. 임시 컨테이너 기반으로 새로운 컨테이너 생성
  5. 임시 컨테이너 제거
- **이미지에 이름 설정**: `-t [Docker 아이디]/[저장소,프로젝트 이름]:[버전]`
  - `-t`는 tag

## 9. WORKDIR

이미지 안에서 앱 소스코드를 보관할 디렉토리를 따로 만들어 사용. 이 디렉토리가 앱의 **working directory**가 됨.

**왜 따로 둬야 하는가?**

- Node 이미지의 root 디렉토리(`/`)에는 `home`, `bin`, `dev` 등 여러 파일이 존재
- 여기에 COPY한 소스코드를 두면
  1. **이름 충돌**: 원래 파일과 이름이 같으면 덮어쓰여짐
  2. **정리 안 됨**: 소스코드가 root 디렉토리 파일과 섞임
- → Dockerfile에 `WORKDIR`를 반드시 설정해야 함

## 10. 이미지 소스 변경 (캐시 활용)

![종속성 캐시 활용 빌드](images/docker-intro-04.webp)

- 소스코드만 변경되었을 뿐인데 매번 build → run을 반복하면 매우 비효율적
- 종속성 부분(`package.json`)만 따로 COPY → install → 그 다음에 src 파일을 COPY 하면, 종속성이 바뀌지 않은 경우 캐시를 사용해 빠르게 빌드 가능
- src 파일 변경은 `npm install`에 영향을 주지 않으므로 종속성을 다시 다운받지 않음

## 11. Docker Volume

![Docker Volume 명령어](images/docker-intro-05.webp)

- Docker 컨테이너에서 파일을 COPY하지 않고, **로컬 파일을 참조(Mapping)** 하는 방식
- `node_modules`는 참조하지 않아야 함 (host에 없음)
- `-v $(pwd):<컨테이너 디렉토리>`
  - `$(pwd)`: print working directory. 현재 작업 디렉토리
  - 현재 로컬 디렉토리와 컨테이너 디렉토리를 매핑
- 이미지를 다시 빌드하지 않아도 변경된 코드가 즉시 반영됨

## 12. Docker Compose

- **다중 컨테이너 도커 애플리케이션을 정의·실행**하기 위한 도구
- 여러 컨테이너로 구성될 때 컨테이너끼리는 별도 설정 없이 접근 불가
  - 예: Node.js와 Redis 서버가 각각 컨테이너면, Node 앱이 Redis 서버에 접근 불가
- 멀티 컨테이너 환경에서 네트워크를 쉽게 연결시키기 위해 Docker Compose 사용
- Compose 파일은 **YAML 형식** 사용
- **YAML** (YAML Ain't Markup Language): 일반적으로 구성 파일·데이터 저장에 사용. XML/JSON 대비 사람이 읽기 쉬움
