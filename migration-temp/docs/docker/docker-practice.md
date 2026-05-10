---
title: Docker 실습
slug: docker-practice
category: docker
summary: Node.js 앱을 Docker로 빌드·실행하고 Redis와 함께 Docker Compose로 묶는 실습
tags: [docker, nodejs, redis, compose, practice, port-mapping]
sort_order: null
created: 2025-01-19
updated: 2026-05-10
---

## 1. Node.js 앱 생성

VS Code 기반.

- 새 폴더를 만들고 `package.json` 생성
  - 터미널에서 `npm init`
- `server.js` 파일 생성

```js
const express = require('express');

const PORT = 8080;

const app = express();

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.listen(PORT);
```

- Dockerfile 생성

```dockerfile
FROM node:10

RUN npm install

CMD ["node", "server.js"]
```

### 1.1 왜 베이스 이미지로 alpine 대신 node를 사용하나?

- alpine으로 빌드하면 `npm not found` 에러가 발생
- alpine은 가장 최소한의 경량 이미지라 npm이 들어 있지 않음 → `RUN npm install` 불가
- npm 명령을 사용하려면 npm이 포함된 베이스 이미지가 필요. `node` 이미지가 그중 하나

### 1.2 npm install이란?

- npm은 Node.js 모듈을 웹에서 받아 설치·관리해 주는 프로그램
- `npm install`은 `package.json`에 적힌 종속성을 자동으로 다운받아 설치
- 즉, 현재 Node.js 앱에 필요한 모듈들을 설치하는 역할

### 1.3 `["node", "server.js"]`가 무엇인가?

- Node 웹 서버를 실행하려면 `node + 엔트리 파일 이름`을 입력해야 함
- 이 엔트리 파일이 `server.js`

## 2. 이미지 빌드

`docker build ./` 로 빌드하면 처음에는 오류 발생.

- `package.json` 파일이 없다는 에러
- 이미지 빌드 시 임시 컨테이너가 만들어지고 거기에 파일 스냅샷이 들어가는데, `package.json`이 컨테이너 밖에만 있고 안에는 없는 상태
- 베이스 이미지에는 이런 파일이 없으므로, 컨테이너 안으로 복사해 줘야 함

```dockerfile
COPY package.json ./
```

- 전체 파일을 복사하려면

```dockerfile
COPY ./ ./
```

## 3. 생성한 이미지로 앱 실행

- 이미지 빌드 후 ID 또는 `-t`로 설정한 이름으로 `docker run` 실행

```bash
docker build -t smile/nodejs ./
docker run smile/nodejs
```

- 하지만 localhost로 접속해도 연결되지 않음
- 이유: 로컬 네트워크와 컨테이너 내부 네트워크를 별도로 연결해 주어야 함
- 해결: `-p` 옵션으로 포트 매핑

```bash
docker run -p 49160:8080 <이미지 이름>
```

![Port Mapping 동작](images/docker-practice-01.webp)

- 컨테이너 내부 포트는 8080. 외부에서 8080으로 보낸다고 컨테이너의 8080으로 갈 수 있는 게 아님
- localhost의 49160 → 컨테이너의 8080으로 매핑
- `-p`는 port

## 4. Redis로 Compose 기능 확인

### 4.1 Redis란

**Redis** (Remote Dictionary Server): 메모리 기반 키-값 구조 데이터 관리 시스템. 모든 데이터를 메모리에 저장하고 빠르게 조회할 수 있는 비관계형 DB(NoSQL).

**사용 이유**: 메모리 저장이라 MySQL 같은 디스크 기반 DB보다 훨씬 빠름. 메모리 기반이지만 영속적 보관도 가능해 서버 재부팅 후에도 데이터 유지 가능.

### 4.2 Node.js에서 Redis 사용

1. `redis-server` 작동
2. `redis` 모듈 다운
3. Redis가 제공하는 `createClient()` 함수로 클라이언트 생성: `redis.createClient(...)`
4. Redis 서버와 Node.js 앱이 다른 곳에서 작동한다면 `host`, `port` 인자 명시 필요
5. Redis 서버가 `redis-server.com`이면 `"https://redis-server.com"` 같이 host 옵션 지정
6. **Docker Compose 사용 시**: `host` 옵션을 `docker-compose.yml`에 명시한 컨테이너 이름으로 지정

![docker-compose.yml 구조](images/docker-practice-02.webp)

### 4.3 docker-compose.yml 구조

- 2개의 컨테이너를 `services`로 감싼 구조
- `version`: docker-compose 버전 명시
- `services`: 컨테이너 정의
  - `redis-server`: 컨테이너 이름
  - `image`: 사용할 이미지
  - `node-app`: 두 번째 컨테이너 이름
  - `build`: Dockerfile 경로 (현재 경로면 `.`)
  - `ports`: 포트 매핑

![Docker Compose 명령어 흐름](images/docker-practice-03.webp)

### 4.4 Compose 명령어

| 명령어 | 동작 |
|---|---|
| `docker compose up --build` | build와 동시에 compose |
| `docker compose up` | 이미지가 없으면 build, 있으면 그대로 compose. yml이 있는 디렉토리에서 실행 |
| `docker compose down` | Compose로 작동시킨 컨테이너들을 한 번에 중단 |
| `docker compose up -d` | detach 모드. 백그라운드에서 실행. output 표출 안 함 |
