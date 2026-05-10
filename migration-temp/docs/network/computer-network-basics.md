---
title: 컴퓨터 네트워크 기본
slug: computer-network-basics
category: network
summary: Network Edge/Core, Circuit/Packet Switching, queueing/transmission/propagation delay, Client-Server 구조와 HTTP 기본
tags: [network, tcp, udp, packet-switching, delay, http]
sort_order: null
created: 2025-01-17
updated: 2026-05-10
---

## 1. Network Structure

### 1.1 Network Edge

호스트와 애플리케이션, 일반 컴퓨터를 의미.

- **Client/Server model**
  - **Client**: Network Edge에 위치. 자신이 원할 때 Server로부터 정보를 가져옴
  - **Server**: 항시 연결되어 Client의 요청을 기다림
- **Connection-oriented service**: Edge에서 Edge로 어떻게 데이터를 통신하는가? TCP/UDP 사용

| 구분 | TCP | UDP |
|---|---|---|
| 연결 | Connection-oriented | Connectionless |
| 신뢰성 | Reliable, in-order byte-stream | Unreliable |
| Flow control | O (Receiver 속도에 맞춤) | X |
| Congestion control | O (네트워크 상황에 맞춤) | X |
| 사용 예 | 웹, 파일 전송 | 음성 전화 같이 유실되어도 큰 문제 없는 경우 |

> **Protocol**: 컴퓨터 네트워크 사이에서 메시지를 주고받기 위해 정해 놓은 약속.

### 1.2 Network Core

라우터, 구성 요소를 이어주는 link, network of networks.

#### Circuit Switching

- 출발지에서 목적지까지 가는 길을 **예약**해 두고 사용자에게 배분
- 속도에 따라 할당된 수용 데이터만큼 사용 가능 (router가 1Mbps이고 user가 100kb/s면 최대 10명까지 할당 가능)

#### Packet Switching

- 사용자가 보내는 데이터를 **패킷 단위**로 받아 전송
- 데이터가 분산되어 제약 없이 사용 가능

**주요 delay 종류**

| Delay | 설명 |
|---|---|
| **Queueing delay** | router에 들어오는 속도가 나가는 속도보다 빠르면 데이터가 큐에 쌓이는 시간. 큐가 넘치면 데이터 유실 → 재전송은 TCP가 Network Edge에서 처리 (router는 단순 전송에 집중) |
| **Transmission delay** | 첫 비트가 나가기 시작한 시간부터 마지막 비트가 나간 시간까지. `L/R` (L: packet length bits, R: link bandwidth bps) |
| **Propagation delay** | link를 빠져나가는 데 걸리는 시간. `d/s` (d: 물리 link 길이, s: 매체 내 전파 속도, 약 `2×10^8 m/sec`) |

![네트워크 delay 구성](images/computer-network-basics-01.webp)

## 2. Client-Server Architecture

| 요소 | 설명 |
|---|---|
| **Server** | 고정된 IP 주소 필수 |
| **Client** | 고정된 IP 불필요 |
| **Socket** | Process-Process 통신 인터페이스. OS 내부에 만들어 두고 read/write 가능하게 함 |
| **IP** | 두 컴퓨터 연결을 위한 Socket의 indexing 주소 |
| **Port** | 같은 IP 내에서 어떤 process가 동작하는지 나타내는 주소 |

### 2.1 Transport Service

- **Data integrity**: 100% 신뢰할 수 있는 데이터를 application 계층에 전송

## 3. HTTP

**HTTP** (HyperText Transport Protocol): 텍스트를 전송하는 프로토콜.

- 종류는 **request, response** 2가지뿐. 단순한 텍스트 송수신
- TCP 사용
- **Stateless**: 요청을 받으면 응답을 보내고 종료. 상태를 저장하지 않음

### 3.1 HTTP Connection

| 종류 | 설명 |
|---|---|
| **Persistent HTTP** | 데이터 전송 후에도 TCP connection 유지 |
| **Non-persistent HTTP** | 데이터 전송 후 연결 종료. 매번 3-way handshake → request → response → 종료 |

![HTTP Persistent vs Non-persistent](images/computer-network-basics-02.webp)
