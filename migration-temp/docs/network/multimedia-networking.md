---
title: Multimedia Networking
slug: multimedia-networking
category: network
summary: 오디오/비디오 sampling, network jitter와 버퍼링, DASH(유튜브)와 CDN
tags: [network, multimedia, sampling, dash, cdn, streaming]
sort_order: null
created: 2025-01-17
updated: 2026-05-10
---

## 1. Multimedia Audio

- **Sampling**: 아날로그 멀티미디어 오디오를 디지털 값으로 변환해 전송
- Audio signal을 주기적으로 값을 판단함 (연속적으로는 어려움)

![Audio Sampling 개념](images/multimedia-networking-01.webp)

- 각 값을 저장해 기록
- **Coding Rate가 빠를수록** 더 많은 비트, 더 촘촘한 sampling이므로 음질이 좋아짐

## 2. Multimedia Video

- 이미지의 연속. 픽셀로 색의 값을 저장
- 이웃 부분의 색은 비슷하므로 중복된 정보를 줄여 압축
- Audio와 마찬가지로 **Coding rate가 클수록** 화질이 좋아짐
- Sender → Receiver 전송 속도가 영상을 압축해 보내는 속도보다 빨라야 함

예: 영화 한 편을 볼 때 → 프레임 순서대로 클라이언트에 전송 → 네트워크 → 클라이언트

![Network Jitter 개념](images/multimedia-networking-02.webp)

- 네트워크 상황에 따라 프레임 딜레이가 생기고, 이 딜레이는 일정하지 않음 → **Network Jitter**
- 이 문제를 해결하기 위해 **버퍼링** 존재. TCP send buffer / TCP receive buffer가 있고, 이 버퍼에서 꺼내 로딩

### 2.1 UDP vs TCP

전송 시 어느 것을 사용할까?

| 프로토콜 | 장점 | 단점 |
|---|---|---|
| **UDP** | 빠름 | 네트워크 상황 미고려 |
| **TCP** | 네트워크 상황 고려 | 자체 전송 속도 느림 |

- **유튜브는 TCP 사용**

## 3. DASH

유튜브에서 사용하는 방식.

- **DASH** (Dynamic Adaptive Streaming over HTTP)
- **Chunk** 단위로 존재. Chunk 번호와 각 화질 버전의 데이터들이 있음
- 네트워크 상태에 문제가 생기면 **화질을 줄인 버전**의 데이터를 보내 버퍼링 최소화

### 3.1 CDN

유튜브 사용자는 1억 명 이상. 동시에 요청이 들어오면 어떻게 처리할 것인가?

- **CDN** (Content Distribution Network) 기법 사용
- 컨텐츠의 복사본이 전 세계에 퍼져 있어 **가장 가까운 곳**에서 요청을 받고 보냄
- 같은 URL로 요청을 보냈는데 어떻게 가까운 곳에서 가져오는가?
  - host의 IP를 **DNS**에서 알려줌
  - DNS query는 UDP로 전송. 패킷의 요청 IP address를 확인 후 **가장 가까운 저장소의 IP**를 응답
