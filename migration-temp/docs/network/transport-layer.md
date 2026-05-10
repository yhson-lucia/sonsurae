---
title: 전송 계층
slug: transport-layer
category: network
summary: Pipelined protocol(Go-Back-N/Selective Repeat), TCP 구조, Flow control, 3-way handshake, congestion control(Tahoe/Reno)
tags: [network, tcp, go-back-n, selective-repeat, flow-control, congestion-control]
sort_order: null
created: 2025-01-17
updated: 2026-05-10
---

## 1. Performance

전송 계층의 효율이 중요. sender가 receiver에게 데이터를 보낼 때.

![전송 계층의 시간 구성](images/transport-layer-01.webp)

| 변수 | 의미 |
|---|---|
| `L` | packet length (bit) |
| `R` | transmission rate (bps) |
| `L/R` | Transmission에 걸리는 시간 |
| `RTT` | 보낸 직후부터 sender가 응답을 받기까지의 시간 (대기 포함) |

- 총 시간은 `RTT + L/R`
- 패킷을 한 번에 하나씩 보내면 효율이 매우 떨어짐. 한 번에 여러 개 보내면 utilization 향상
- 하지만 신뢰성이 의문 → 2가지 **pipelined protocol** 등장

## 2. Go-Back-N

- **Window size**: 한 번에 보내는 패킷 수의 기준
- window 안의 패킷 timer가 터지면 **window size만큼 모두 다시 전송**
- Receiver는 번호 순서대로 패킷이 올 때까지 기다림. 다른 번호 패킷이 오면 버림
- 모든 것은 sender가 계속 보내는 방식. Receiver는 순서대로 받기만 함

![Go-Back-N 동작](images/transport-layer-02.webp)

- 위 예에서 2번에 loss가 발생, 3번이 먼저 오므로 receiver는 3번을 버리고 ACK1만 계속 전송
- timeout이 나서 결국 pkt2부터 차례대로 다시 전송
- 중간에 loss/error가 생기면 결국 N개(window size)만큼 돌아와 다시 시작 → "Go-Back-N"
- **Window**: window 안의 패킷은 sender가 받았는지 모르는 상태이므로 재전송 가능성. buffer에 보관 필요
- **단점**: 동작은 하지만 receiver 측 개선 여지가 많음

## 3. Selective Repeat

재전송을 선택적으로 하는 방식.

- timer가 터지기 전 **잘 받은 ACK 번호**를 receiver가 보냄
- 순서가 맞지 않은 pkt이라도 error가 없으면 저장

![Selective Repeat 동작](images/transport-layer-03.webp)

- ACK2를 기다리지만 안 오면 receiver는 보내지 않음. 다음 ACK3은 잘 받았으므로 보냄. ACK2는 timeout으로 재전송됨
- ACK seq number가 매우 중요. **최소한의 Seq Number**를 정해야 함 (header bit에 들어가야 하므로)
- seq Number와 window size를 비교해 최소한의 Seq Number 결정
- **단점**: window size 안의 모든 pkt에 timer를 달아야 해 효율성이 떨어짐

## 4. TCP

- **Point-to-point**: one sender, one receiver
- Sender와 receiver 양쪽에 buffer와 window 존재 (sender window, receiver window 각각)
  - sender의 sender buffer는 byte number. sender에서 내려오는 message 순서이며, receiver의 receive buffer와 동일하게 따라감 (그곳으로 보냈기 때문)
  - 반대로 receiver가 보내는 데이터의 seq number는 receiver가 만든 send buffer에서 결정. ACK는 receive buffer에서 나감 (양방향)

### 4.1 계층별 데이터 단위

`App (message)` → `TCP (segment = header + data(message))` → `IP (packet = header + data(segment))` → `Link (Frame = header + data)`

### 4.2 TCP Header

![TCP Header 구조](images/transport-layer-04.webp)

| 필드 | 설명 |
|---|---|
| Port number | sender·receiver의 port 정보 |
| Seq number / ACK number | 전송을 위한 정보. receiver가 seq number를 받으면 다음 필요한 seq number를 ACK로 feedback |
| Internet checksum | error detection |
| Receive window | receive buffer의 빈 공간 정보. feedback |

### 4.3 Timeout 결정

유실 시 timer가 작동. **timeout value**를 정해야 함.

- **RTT**: segment가 receiver로 갔다가 돌아오는 시간 (Round Trip Time)
- timeout value를 RTT 시간으로 정하는 게 기본 접근. 하지만 RTT는 고정값이 아님 (경로마다, queueing delay마다 다름)

```
EstimatedRTT = (1 - α) * EstimatedRTT + α * SampleRTT
```

- 평균 RTT 값. 현재 네트워크 상황도 어느 정도 반영한 보정된 RTT
- 하지만 이 값도 너무 타이트하므로 여유를 둔 값을 timeout으로 사용

```
DevRTT = (1 - β) * DevRTT + β * |SampleRTT - EstimatedRTT|     (β = 0.25)
TimeoutInterval = EstimatedRTT + 4 * DevRTT
```

> 중요한 것은 timeout 설정 개념. 식 자체는 외우지 않아도 됨.

### 4.4 TCP Reliable Data Transfer

- **Pipelined segments**: window 사용
- **Cumulative ACK**: ACK num을 필요한 값으로 사용 (`ACK10`이면 다음 필요한 값이 10임을 계속 요구)
- **Single retransmission timer**: Go-Back-N과 같이 하나의 타이머. 차이점은 유실 시 **해당 segment만** 재전송
- **권고사항**: delayed ACK. 연속적으로 ACK가 오면 sender는 마지막 ACK만 요구하는 데이터를 보내면 됨
- buffer에 같은 ACK 번호를 **3번 받으면** 유실로 판단하고 sender가 ACK 번호를 보냄

## 5. TCP Flow Control

- 각각의 receive buffer와 sender buffer 존재
- sender가 보내는 데이터를 receiver buffer가 받을 때, buffer 용량을 초과해 받을 수 없음
- 빈 공간만큼만 받을 수 있으므로 sender buffer 크기를 receive buffer에 맞춰야 함
- 이 크기는 TCP header의 **receive window** 필드에 담겨 전송됨

### 5.1 극단 상황

- receive buffer가 꽉 차서 0의 크기를 sender에게 보내고, 더 보낼 데이터가 없는 경우
- sender는 의미 없는 segment를 주기적으로 보냄. ACK header에 receive buffer 크기를 받기 위해

## 6. TCP 3-way Handshake

![TCP 3-way handshake](images/transport-layer-05.webp)

1. Client가 `SYN`과 seq num을 보냄
2. Server가 `SYN`과 새 seq num, `ACK 1`(client seq + 1)을 보냄
3. Client가 받은 `ACK 1`과 `ACK num = y+1`을 보냄. 3번째부터 데이터 전송도 함께 가능

**왜 3번 handshake?** Server 입장에서 2-way로 끝나면, 자신이 보낸 segment에 대한 response가 없어 통신 상황을 정확히 파악할 수 없음.

## 7. TCP Connection 종료

![TCP 종료 과정](images/transport-layer-06.webp)

- 종료 신호 `FIN` 전송 → `ACK`와 `FIN` 전송 → `FIN`에 대한 `ACK` 전송 → `TIME_WAIT` 일정 시간 대기
- timeout value는 항상 변하는 값

## 8. TCP Congestion Control

- 중간 public network이 막힐 수 있음. 막히면 TCP는 재전송함 → 네트워크가 더 막힘 → 악화
- TCP는 **네트워크가 막히지 않게** 해야 함. 상태가 안 좋아지면 데이터 전송량을 줄임

### 8.1 네트워크 상황 인식

| 방식 | 설명 |
|---|---|
| **End-to-end congestion control** | 양 끝의 sender·receiver가 segment 상황을 보고 유추 (예: feedback이 잘 안 옴) |
| **Network-assisted congestion control** | 라우터의 큐 상황을 데이터에 담아 전송 (현실적으로 불가능) |

### 8.2 3 Main Phase

| Phase | 동작 |
|---|---|
| **Slow start** | 네트워크 상황을 모르므로 처음에는 천천히 |
| **Additive increase** | linear하게 증가 |
| **Multiplicative decrease** | 느려지는 순간 사용량을 1/2로 확 줄임 |

### 8.3 전송 속도

```
전송 속도 = CongWin (보내는 window size) / RTT  (bytes/sec)
```

- 결국 CongWin 크기에 따라 전송 속도가 결정됨. 이를 결정하는 것은 **네트워크**

### 8.4 TCP Tahoe (1980년대)

- window size를 하나씩 늘림 (slow start → linear increase)
- 패킷 유실 시 Threshold를 절반으로 변경
- 패킷 유실 탐지
  - timer를 통한 timeout
  - 3 duplicate ACK 수신
- 단점: Tahoe는 **유실 발생 상황을 구분하지 못함**. 3 duplicate ACK는 특정 패킷 한 개만 문제인 상황(네트워크는 양호), timeout은 네트워크 자체에 문제

### 8.5 TCP Reno

- **3 duplicate ACK**으로 패킷 유실 확인 시: 절반으로 줄이고 linear increase
- 현재 사용되는 방식

![TCP Reno 동작](images/transport-layer-07.webp)

## 9. TCP Fairness

- 네트워크를 독립적으로 congestion control하는데, 이를 각자 공평하게 사용하게 되는가?
- **Fair하게 됨**. 전송량을 많이 사용하는 컴퓨터는 그만큼 데이터를 많이 줄이므로, 전송 속도가 같은 값으로 수렴
