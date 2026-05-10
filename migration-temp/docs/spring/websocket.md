---
title: WebSocket
slug: websocket
category: spring
summary: WebSocket의 동작, 특징, HTTP와의 차이점, 실시간 채팅 구현 시 고려 사항
tags: [spring, websocket, realtime, chat, protocol]
sort_order: null
created: 2025-01-17
updated: 2026-05-10
---

## 1. WebSocket

- 서버-클라이언트 간 단방향 통신의 단점을 해결하기 위한 기술
- WS 프로토콜 기반으로 클라이언트와 서버 사이에 **지속적인 양방향 연결 스트림**을 만듦
- 실시간 통신이 필요한 채팅, 주식 차트 등에서 많이 사용

### 1.1 WebSocket Connection 과정

1. Connection을 맺기 위해 **HTTP 요청**을 서버로 보냄. 이때 HTTP 요청 헤더에 WebSocket 프로토콜로 업그레이드하기 위한 `Upgrade` 헤더와 `Connection` 헤더를 포함
2. 서버가 **101 Switching Protocols** 응답을 보내면 프로토콜 전환을 승인했다는 의미
3. 여기까지가 **Handshake**
4. 데이터 전송 시작. TCP 연결이므로 안정성 보장
5. 클라이언트/서버 어느 쪽에서든 데이터 전송 후 Connection 종료 가능
6. 한쪽이 연결 종료를 보내면 다른 쪽이 응답으로 Closed 처리
7. 연결 종료 후 수신되는 데이터는 모두 폐기됨

![WebSocket Handshake와 데이터 전송 흐름](images/websocket-01.webp)

## 2. WebSocket 특징

- 지속적인 양방향 연결 스트림 제공
- OSI 모델 7계층에 위치 (HTTP와 동일)
- HTTP 포트 80, 443에서 동작하도록 설계
- HTTP보다 낮은 오버헤드와 빠른 속도 제공
  - 처음 Handshake 시에만 HTTP 프로토콜이라 데이터양이 많지만, 이후에는 메시지만 전송

### 2.1 HTTP와 WebSocket의 차이

![HTTP vs WebSocket 비교](images/websocket-02.webp)

| 구분 | HTTP | WebSocket |
|---|---|---|
| 연결 | 비연결성 (요청마다 새로 연결) | 연결 유지 (양방향) |
| 통신 방식 | 단방향 (요청-응답) | 양방향 데이터 전송 |
| 포트 | 80, 443 | 80, 443 (HTTP와 공유) |

## 3. WebSocket으로 실시간 채팅 만들기

![WebSocket 채팅 구조](images/websocket-03.webp)

- **구현 방식**: Spring이 제공하는 WebSocket 라이브러리를 사용. HTTP 프로토콜로 connection이 이루어지면 WebSocket 프로토콜인 `ws`로 업그레이드되어 연결을 유지
- 유지된 connection으로 JSON 형식의 데이터 전송 가능. 전송하려면 연결된 WebSession들에게 보낼 수 있고, 이는 Handler를 통해 접근
- Handler에 접근하려면 Config 클래스에서 `WebSocketConfigurer`를 상속받아 해당 프로토콜의 접속 주소와 관련된 Handler를 주입. Handler는 상태별 메서드를 override해 데이터 전송을 처리
- **세션 관리 한계**: 연결이 하나의 Handler에서 관리되므로, 세션별로 저장해 원하는 세션에만 전송하려면 별도의 자료구조가 필요함
  - `Set`으로 세션을 저장하는 방식으로 시작 가능
  - 하지만 채팅방마다 `Set`을 따로 구현해야 하고, 세션 정리 알고리즘도 필요해 단점이 많음
  - 이런 한계 때문에 일반적으로 **STOMP 프로토콜**을 사용하게 됨
