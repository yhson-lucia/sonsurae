---
title: 링크 계층
slug: link-layer
category: network
summary: MAC(TDMA/FDMA/CSMA), LAN과 Ethernet, ARP, Switch, Wireless(802.11)와 Cellular network 정리
tags: [network, link-layer, mac, ethernet, arp, switch, wifi, cellular]
sort_order: null
created: 2025-01-17
updated: 2026-05-10
---

## 1. Link Layer

- 네트워크 계층의 패킷이 server로 갈 때는 게이트웨이 라우터를 거쳐야 함
- 즉 네트워크에 연결된 모든 client는 게이트웨이 라우터로 전자기파를 보내며, broadcast 특성상 **collision** 발생 → 이를 해결하기 위한 계층
- Client → Gateway router로 어떻게 충돌 없이 전달할 것인가?
- Gateway router는 1:1이 아니라 채널 형태로 여러 사용자에게 퍼져 있음 (broadcast medium): 유선 이더넷, Wi-Fi, LTE 등

### 1.1 MAC (Medium Access Control)

매체 접근 시 충돌을 조절하기 위한 방식.

요구사항: R bps 속도의 broadcast channel에서

- 1개 노드 전송 시 R 속도로 전송 가능
- M개 노드 전송 시 각각 평균 R/M 속도로 전송 가능

### 1.2 TDMA (Time Division Multiple Access)

시간을 쪼개 여러 사람이 접근.

![TDMA 동작](images/link-layer-01.webp)

- **단점**: 자원 낭비가 심함

### 1.3 FDMA (Frequency Division Multiple Access)

도메인을 frequency로 나눠 각각의 주파수를 할당. 해당 주파수로만 전송.

![FDMA 동작](images/link-layer-02.webp)

- **단점**: TDMA와 마찬가지로 자원 낭비 심함

### 1.4 Random Access

내가 보내고자 하는 데이터가 있을 때 보냄. 동시에 보내면 충돌이 발생하므로 처리 방식이 필요.

#### CSMA (Carrier Sense Multiple Access)

- carrier를 sensing. sensing 후 frame 전송이 없다면 client의 frame 전송
- **단점**: sensing 순간과 frame 전송까지 propagation delay가 생겨 충돌 발생

#### CSMA/CD (Collision Detection)

- delay에 의해 동시에 전송해 collision이 일어난 경우, 이를 감지하고 멈춤
- **Binary (exponential) backoff**: `{0, 1, ..., 2^m - 1}` 중 하나를 랜덤하게 골라 그 시간만큼 대기 (m: 연속 충돌 횟수)
- 충돌이 연속 발생하면 client가 많다는 뜻이므로 대기 시간 범위를 점진적으로 확장
- backoff는 사용자가 많을수록 delay 증가

#### Taking Turns

- **Polling**: master node가 존재해 전송을 맞춤
- **Token passing**: control 토큰을 가진 node만 전송 가능
- **단점**: master node나 control token에 문제가 생기면 전체 시스템이 망가짐

## 2. LAN

| 용어 | 설명 |
|---|---|
| **Subnet** | 같은 network prefix를 가지고 router를 거치지 않고 접근 가능한 host 집합 |
| **LAN** (Local Area Network) | Subnet에서 host끼리 연결된 network |
| **Ethernet** | 처음 LAN technology에서 제안된 MAC Protocol 모델 |

### 2.1 Ethernet 형태

- **Bus**: 모든 node가 같은 collision domain에 존재
- **Star**: 중앙에 switch가 존재. Ethernet protocol로 제어

![Ethernet Frame Structure](images/link-layer-03.webp)

- Ethernet의 MAC protocol: **CSMA/CD** — carrier sensing 후 보낼 수 있을 때 전송, collision 시 random 시간 대기 후 재전송
- 유선 환경에서는 collision만 없다면 99% 이상 gateway router로 도달
- **Minimum frame size: 64 byte** — delay에 의해 collision detection이 안 되는 경우를 막기 위해 의도적으로 size를 늘림

### 2.2 MAC Address

- frame을 주고받기 위한 주소
- Host name·IP address는 변경 가능하지만, MAC address는 LAN 기기 자체의 물리 주소이므로 변경 불가
- **48 bit** 중 앞 16 bit는 제조 번호
- 이 주소가 frame header에 담겨 전송

### 2.3 ARP (Address Resolution Protocol)

- IP 주소와 MAC address를 매칭시키는 table
- **흐름**
  - Gateway router의 MAC address를 모르는 상태에서 시작
  - Gateway router의 IP를 담아 broadcast → 해당 IP를 가진 router가 자신의 MAC address 응답
  - ARP table에 캐시로 저장

### 2.4 전체 흐름

- DHCP로 Gateway router의 IP를 알게 됨
- DNS로 목적지 IP를 알게 됨 → 패킷에 출발/도착 IP를 담음 → frame으로 감쌈
- frame에는 출발 MAC address와 Gateway MAC address가 들어감
- Gateway router는 forwarding table로 IP를 확인 후 보낼 곳 결정. 다시 frame 형태로 보내야 하므로 출발은 Gateway MAC, 도착은 다음 hop(R1) MAC
- Gateway router는 자신의 ARP table 보유
- **IP는 바뀌지 않고 MAC address만 계속 변함**

![호스트 → Router → 다음 Router 흐름](images/link-layer-04.webp)

## 3. Switch

bus 형태에서 현대적으로 변형한 모델.

![Switch와 Collision Domain](images/link-layer-05.webp)

- switch를 통해 각 signal이 퍼지지 않도록 collision domain 분리
- switch는 일종의 port만 가지고 host와 연결. **MAC address가 없고 단순 연결 목적**
- 동시에 여러 host로 보내는 것이 가능
- Switch 내부에 **Switch table** 존재. MAC address 등이 저장되어 보낼 방향 결정
- Network Layer 관점에서는 switch가 존재하지 않음. client와 router만 고려
- **Switch Table**: Self-learning으로 만들어짐. 목적지가 table에 있으면 해당 interface로 전달, 없으면 Flood로 보냄

## 4. Wireless and Mobile Networks

| 용어 | 설명 |
|---|---|
| **Wireless** | 선이 없이 네트워크에 접속하지만 네트워크 변경은 없는 경우 |
| **Mobility** | 네트워크의 변경이 일어나는 경우 |

![Wireless vs Mobility](images/link-layer-06.webp)

- 무선 인터넷이란 가장 처음 연결된 **첫 hop만 무선**인 경우
- 이 한 hop을 어떻게 다룰 것인가가 무선 인터넷의 핵심

### 4.1 무선 인터넷의 특징

- **Signal strength가 약함**. 거리에 따라 차이 발생
- 거리가 먼 host끼리는 signal이 전송되지 않음 → CSMA/CD로 Random access 불가
- **Collision detection 불가**: host가 signal을 보내는 순간 자신이 보내는 signal이 매우 커서 주변 signal을 받기 어려움 (noise 처리됨)

## 5. IEEE 802.11 Wireless LAN

**Wi-Fi** (Wireless Fidelity)

![Wi-Fi 네트워크 구조](images/link-layer-07.webp)

- **Access Point (AP)** 가 존재. switch나 router와 연결됨
- AP는 비콘으로 주기적으로 signal을 broadcast. host는 그중 선택해 연결
- Wi-Fi는 AP와 무선 통신. 가장 큰 문제는 **CSMA/CD를 사용할 수 없다는 점** (Collision은 발생하지만 감지 불가)
- Link layer에서 ACK이 없으면, Collision 시 계속 재전송하고 Collision이 없으면 잘 전송된 것으로 판단

### 5.1 CSMA/CA (Collision Avoidance)

- Carrier sensing 후 **DIFS만큼 signal이 없다면** DATA 전송
- Receiver는 DATA를 받으면 ACK 전송
- CSMA/CD와 달리 충돌 감지 불가 → DATA를 끝까지 전송. 충돌 시 모든 DATA가 유실되어 피해가 더 큼

![CSMA/CA 동작](images/link-layer-08.webp)

### 5.2 RTS-CTS Exchange

CSMA/CA의 문제를 보완하기 위한 방식. 실제 데이터를 보내기 전에 작은 데이터를 보내 충돌 여부 확인.

![RTS-CTS Exchange](images/link-layer-09.webp)

- RTS라는 작은 frame을 broadcast. A의 주변 + AP가 받음. RTS에는 A가 얼마나 데이터를 보낼지 정보가 담김
- AP는 A의 RTS에 대해 CTS 전송 → A는 데이터 전송 시작
- CTS와 B의 RTS가 맞물려 collision이 일어나면 noise가 됨. A는 데이터를 전송하지만 B의 주변은 다시 RTS 전송 → 또 다시 collision
- ACK를 받지 못해 A는 재전송
- 즉, CTS를 받았는데도 다시 경쟁이 일어남
- 사람이 많을수록 bandwidth를 제대로 사용하지 못함

### 5.3 Frame Address (4개 MAC Address)

![Wi-Fi 4 MAC Address 구조](images/link-layer-10.webp)

- Host의 MAC, AP의 MAC, Router의 MAC, 4번째는 특수한 경우 사용

![Wi-Fi 데이터 흐름](images/link-layer-11.webp)

- AP는 특별: 한쪽은 wireless 연결 MAC을 가지고, router 연결 쪽은 Switch처럼 동작해 MAC 없음
- Router로 보낼 때는 Router MAC + Source MAC
- Switch는 패킷에서 IP로 MAC을 확인할 능력이 없음 (Link Layer 장비) → Host에서 보낼 때 Router MAC까지 함께 보냄

| Address | 용도 |
|---|---|
| Address 1 | AP의 MAC. AP가 비콘 메시지를 뿌리므로 알 수 있음 |
| Address 2 | 자기 자신 |
| Address 3 | Router의 MAC |

#### 연결 순서

1. Host가 RTS-CTS로 AP에 연결 요청. AP의 MAC을 알게 됨. 해당 AP MAC을 frame에 넣어 전송
2. Packet에 IP를 모르므로 DHCP로 IP·Subnet Mask·Gateway Router IP·Local Name Server IP 획득
3. broadcast로 받아온 IP에 ARP query를 broadcast로 보내 Router의 MAC 조회
4. Source IP는 DHCP로 알므로 응답은 Unicast로 돌아옴
5. ARP request를 굳이 안 해도 DHCP로 자동으로 Router의 MAC을 알 수 있음

## 6. Cellular Network

- 모바일 네트워크는 Wi-Fi와 비슷하게 접근하지만 차이가 있음. **첫 hop만 wireless**, 나머지는 유선
- 초창기에는 채널 할당 방식 (2G)
- **CDMA** (Code Division Multiple Access): 코드를 줘서 그 코드의 주파수 대역을 증폭시켜 전달 (수학적 연산). 각 유저에게 전달 (3G)

![CDMA 동작](images/link-layer-12.webp)

- 2G/3G/4G는 전달 방식이 아니라 **속도**에 따른 분류
- 사용자를 커버하기 위한 기지국이 전국에 퍼져 있고, 이를 관리하는 **MSC** (Mobile Switching Center) 존재. 마지막엔 **Gateway**로 network에 접속
- 사용자 IP는 최상위 관리 장소(Gateway MSC, GGSN)에서 관리. 네트워크 내부 private IP 할당
- 내부 프로토콜은 자체적으로 사용
- **서울 → 부산 이동 시에도 유튜브가 끊기지 않는 이유**: 어디로 이동하든 기지국만 바뀌고 네트워크는 바뀌지 않음. 네트워크가 유지되므로 TCP connection도 유지
