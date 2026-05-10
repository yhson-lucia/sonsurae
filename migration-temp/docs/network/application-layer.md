---
title: 애플리케이션 계층
slug: application-layer
category: network
summary: Socket API와 함수, TCP/UDP의 Multiplexing/Demultiplexing, reliable transfer를 위한 error/loss 처리
tags: [network, socket, tcp, udp, multiplexing, reliable-transfer]
sort_order: null
created: 2025-01-17
updated: 2026-05-10
---

## 1. Socket

Process 간 통신을 위한 API.

### 1.1 Socket Type

- OS가 구현해 놓은 기능만 사용 가능. OS에는 애플리케이션 밑의 계층이 구현되어 있음
- Transport layer가 제공하는 기능은 **TCP/UDP** 두 가지뿐
- 둘 중 하나를 선택해 사용 (예: TCP를 쓰려면 TCP Socket 생성)

### 1.2 Socket Function

#### TCP Server

| 함수 | 동작 |
|---|---|
| `socket()` | 파라미터를 받아 socket 생성 |
| `bind()` | Socket을 특정 port에 bind |
| `listen()` | server 용도로 사용 |
| `accept()` | client로부터 데이터를 받을 준비. 받을 때까지 **blocking** |

#### TCP Client

| 함수 | 동작 |
|---|---|
| `socket()` | socket 생성 |
| `connect()` | 원하는 process에 연결 요청. server와 3-way handshake. socket 간 연결되면 통신 시작 |
| `write()` → `read()` | 데이터 송수신 |

![TCP Socket 동작](images/application-layer-01.webp)

### 1.3 함수 시그니처

```c
int socket(int domain, int type, int protocol);
// 2번째 type 파라미터로 UDP/TCP 결정
// return: 생성한 socket의 id(index)

int bind(int sockfd, struct sockaddr *myaddr, int addrlen);
// socket을 local IP address와 port에 bind

int listen(int sockfd, int backlog);
// 생성한 socket을 listen 용도로 사용
// 동시 요청은 backlog 스택에 담아 순서대로 처리

int accept(int sockfd, struct sockaddr *cliaddr, int *addrlen);
// 새 connection을 받음. 두 번째 파라미터에 client의 port와 IP 저장

int close(int sockfd);
// 데이터 교환 종료 후 close. 안 하면 다른 process가 접근 불가
```

- Client process는 특정 port를 사용할 이유가 없으므로 `bind()` 불필요

## 2. TCP / UDP

### 2.1 Multiplexing / Demultiplexing

- **Multiplexing**: App 계층의 여러 socket에서 나오는 segment를 Transport 계층에서 받음
- **Segment**: data + header. App 계층 data에 header를 추가한 것
- **Demultiplexing**: Transport 계층이 받은 segment를 다시 App 계층의 알맞은 socket에 전달

| 프로토콜 | demultiplexing 기준 |
|---|---|
| UDP | dest IP + dest port → 동일한 socket으로 |
| TCP | dest IP + dest port + src IP + src port |

### 2.2 UDP Segment Header

32 bit, 4개 field.

| Field | 설명 |
|---|---|
| Source port | |
| Dest port | multiplexing/demultiplexing에 필요 |
| Length | UDP segment의 길이 |
| Checksum | 전송 중 오류 검사 |

## 3. Reliable Data Transfer

### 3.1 Unreliable channel의 문제

1. **Message error**: 패킷 에러
2. **Message loss**: 패킷 유실

### 3.2 Packet error 처리 (유실은 없는 경우)

- **Error detection mechanism**: header에 에러 검출 데이터 포함
- **Feedback**: 잘 받았는지/재요청해야 하는지 확인
- **Retransmission**: feedback 결과에 따라 재전송
  - 문제: ACK 자체에 error가 생기면 client가 재요청 → 동일 packet 정보가 중복 전달됨. sender는 새 메시지인지 duplicate인지 구분 불가
- **Sequence number**: 위 문제 해결책. header 정보를 최소화해야 하므로 0/1 (1 bit)로도 가능

### 3.3 Packet loss 처리

- **Timer**: sender는 패킷 보낼 때마다 타이머 작동. 일정 시간 지나면 재전송
- 같은 seq number가 다시 와도 receiver는 이전 패킷을 버리므로 문제없음

![ARQ 동작 1](images/application-layer-02.webp)

![ARQ 동작 2](images/application-layer-03.webp)

- TCP header에는 error/loss 등에 대한 feedback 필드가 정의되어 있음
