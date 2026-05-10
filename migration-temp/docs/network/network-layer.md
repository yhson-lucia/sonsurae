---
title: 네트워크 계층
slug: network-layer
category: network
summary: 네트워크 흐름 정리, IP/Subnet/NAT/DHCP/ICMP/IPv6, Routing algorithm(Link State, Distance Vector), Autonomous System과 BGP
tags: [network, ip, routing, subnet, nat, dhcp, dijkstra, bgp]
sort_order: null
created: 2025-01-17
updated: 2026-05-10
---

## 1. 네트워크 흐름 요약

| 분류 | 설명 |
|---|---|
| **Circuit Switching** | 출발지~목적지 경로를 예약. 속도에 따라 할당된 수용 데이터만큼 사용 |
| **Packet Switching** | 데이터를 패킷 단위로 받아 전송. 분산되어 제약 없이 사용 가능 |

- 일반적으로 **Packet 방식**으로 router에서 데이터를 전송함
- **Router**는 packet을 받아 error processing, queueing delay, transmission delay, propagation delay 등을 조절
- **HTTP**는 request/response 구조. TCP connection 재사용 여부에 따라 non-persistent/persistent로 구분. 기본은 persistent

## 2. Transport Layer 요약

- **UDP**: header 4개만 — error detection, src port, dest port, length
- **TCP**: reliable data transfer. unreliable한 환경에서도 신뢰성 보장
- **에러 종류**
  - 패킷 에러: 에러 detection 코드를 header에 포함
  - 패킷 loss: timeout 설정
- **Go-Back-N**: window size만큼 한 번에 보내고, timer 터지면 window 전체 재전송. receiver는 순서가 안 맞으면 버림
- **Selective Repeat**: 잘 받은 ACK 번호를 receiver가 보냄. 순서가 안 맞아도 error가 없으면 저장
- **TCP**는 두 특성을 모두 사용. 같은 ACK를 3번 받으면 재전송 (sender는 timeout이 안 되어 계속 보냄)

## 3. Network Layer

- **IP** (Internet Protocol): Packet을 목적지까지 배송하는 계층
- 네트워크 계층은 출발지에서 도착지까지 router가 특정 프로토콜로 이동시키는 과정

### 3.1 Router의 역할

- **Forwarding**: router 내 forwarding table을 보고 entry와 매칭되는 곳으로 패킷을 전달
- **Forwarding Table**: routing algorithm으로 만들어짐. 주소가 매우 많아 **주소 범위**로 구성됨

![Routing 흐름](images/network-layer-01.webp)

### 3.2 IP Field

![IP 패킷 필드](images/network-layer-02.webp)

- **Time to Live (TTL)**: 20부터 시작해 0이 되면 폐기. loop를 돌 수 있으므로 자원 낭비를 막기 위함
- IP Header 합치면 20 byte. TCP header도 20 byte → header만 40 byte. 기본 40 byte + body가 나감 (TCP ACK가 많아 40 byte만 차지하는 경우가 많음)

### 3.3 IP Address

- **IPv4**: 32 bit 주소체계. 이론상 `2^32` 주소
- 사람이 읽기 쉽게 8 bit씩 끊어 10진수로 표현 (`255.255.255.255` 형태)
- IP 주소는 **host 자체가 아니라 host의 Network Interface**를 지칭. 랜카드 여러 개면 IP도 여러 개 (대표적으로 router는 인터페이스마다 다른 IP)

### 3.4 IP 주소 배정

아무렇게나 배정하면 router의 forwarding table이 매우 커지고 검색이 힘들어짐.

![IP 주소 구조: network ID + host ID](images/network-layer-03.webp)

| 용어 | 설명 |
|---|---|
| Network ID / Subnet ID / Prefix | IP의 일부 비트 |
| Subnet Mask | 어디까지가 Subnet ID인지 표시 |

같은 network에 속한 host들은 같은 prefix를 가짐.

### 3.5 Class 기반 할당의 한계

| Class | Network bit |
|---|---|
| A | 8 bit |
| B | 16 bit |
| C | 24 bit (host bit 8) |

- Class A는 상대적으로 많은 host를 받지만, Class C는 적어 **낭비 심함** → 할당 문제

### 3.6 CIDR

- prefix를 자유롭게 끊을 수 있게 됨 (15 bit, 16 bit, 12 bit 등 자유롭게 가능)
- prefix를 router forwarding table에 넣어 확인
- destination IP → 매칭되는 entry 찾음 → prefix가 여러 개 매칭되면 **가장 긴 prefix(가장 구체적)** 와 매칭 (Longest Prefix Matching)

## 4. Subnet

- **같은 prefix를 가진 device의 집합**
- router를 거치지 않고 접근 가능한 host들의 집합
- router의 IP는 network interface 수에 따라 결정
  - 각 prefix가 모두 다름 (여러 subnet에 속해 있는 교집합)
  - 이를 통해 다른 network로 갈 수 있음

## 5. NAT (Network Address Translation)

- 고유한 방식으로 IP를 갖기에는 IPv4(약 40억 개)가 부족함
- 이를 해결하기 위한 방식. **NAT router의 IP로 주소를 바꿔 줌** (NAT router가 기준이 되며 port 주소도 변경됨. 이 port는 해당 prefix host의 port)
- Sender가 패킷을 보내면 NAT router 주소로 전송됨
- Port number는 TCP data에 있음 → **Layer violation** 발생
- 또한 host 내부 port number를 변경했기 때문에 다시 받을 때 host의 port number를 그대로 받을 수 없음
- **IPv4의 문제점**: 공간 부족, 보안 문제

## 6. DHCP (Dynamic Host Configuration Protocol)

통신에는 IP, mask, router, DNS가 모두 필요. 이 값들은 직접 결정하지 않고 **DHCP**로 결정.

- 고정 IP 부여가 아니라, 가지고 있는 IP pool에서 요청 시 부여 + 회수 과정
- **흐름**
  1. IP가 필요한 client가 **DHCP Discover**를 broadcast (32 bit). subnet의 모든 멤버가 받음
  2. **DHCP Server만 받아들이고 나머지는 무시** (서버가 port를 열어 두었기 때문)
  3. Server가 **DHCP Offer**로 특정 시간 동안 IP를 주겠다는 메시지를 보냄
  4. Client가 **DHCP Request**로 offer에 응답
  5. Server가 **ACK**로 확정

![DHCP 흐름](images/network-layer-04.webp)

> 보통 게이트웨이 router에 DNS, DHCP, NAT, firewall server가 함께 동작.

## 7. IP Fragmentation / Reassembly

- **MTU** (Max. Transfer Unit): Link Layer에서 한 번에 보낼 수 있는 최대 size
- size가 MTU보다 크면 분리됨 → fragmentation
- 3가지 field가 header에 존재

| Field | 설명 |
|---|---|
| Length | 총 size (전체 byte) - Header 20 byte |
| ID | 같은 fragment는 같은 값 |
| Fragflag | 뒤에 fragment가 더 있는지 (있으면 1) |
| Offset | 잘려진 부분의 point 표시. `1480 / 8` (bit 수를 줄이기 위해 나눔) |

## 8. ICMP

- **Internet Control Message Protocol**
- TTL로 drop된 패킷이 있다는 것을 알려주기 위한 프로토콜
- 포트가 닫혀 있거나 drop, 네트워크 이벤트에 대해 알려주는 유틸리티

## 9. IPv6

- IP 주소 체계를 64 bit (실제로는 128 bit) 로 늘린 주소 체계
- IPv4의 부족한 주소 공간을 보완하기 위해 등장
- IPv4 → IPv6 전환을 위해 라우터 교체가 필요한데, 그 과도기를 위한 **Tunneling**이 사용됨
- IPv6를 이해하지 못하는 router에 변환 처리

## 10. Routing Algorithm

- **Forwarding**: dest address를 Longest Prefix Matching으로 확인해 보냄
- 이 forwarding table을 채우는 것이 **Routing Algorithm**
- Network을 그래프로 개념화: node = router, link = 연결
- 결국 **최단 경로**를 찾는 과정

### 10.1 Link State Algorithm

모든 router의 상황을 알고 최단 거리를 구함.

![Link State Algorithm 예시](images/network-layer-05.webp)

- 네트워크 전체 정보를 알기 위해 모든 노드가 자기 정보를 **broadcast**
- 자기 자신의 link를 전체에 뿌리므로 "Link State"
- **Dijkstra's algorithm** 사용

| 변수 | 의미 |
|---|---|
| `D(v)` | source부터 dest까지의 현재 경로 cost (distance) |
| `c(x, y)` | node x에서 y까지의 link cost. 이웃이 아니면 무한대 |
| `p(v)` | source부터 v까지의 경로상 직전 노드 |
| `N'` | 최단 거리가 확정된 node 집합 (자기 자신은 이미 알므로 시작에 포함) |

```
1. Initialization
2. N' = {u}
3. for all nodes v:
4.   if v adjacent to u:
5.     D(v) = c(u, v)
6.   else:
7.     D(v) = infinity
8.
9. Loop:
10.   N'에 속하지 않으면서 D(w)가 최소인 w를 N'에 추가
11.   D(v)값을 w를 통해 가는 경우와 기존 u→v로 직접 가는 경우 비교 후 update
12. 모두 완성하면 Tree 구조 (연결 안 된 node는 제외)
```

- Link cost를 traffic 양으로 본다면, traffic이 낮은 방향으로 보내고 싶음 → 다른 traffic과 겹쳐질 수 있음. update마다 겹칠 수 있음 (oscillation 문제)

### 10.2 Distance Vector Algorithm

이웃 router만 알고 최단 거리를 구함.

- 직관적이지 않음. 유추로 확인

```
dx(y) = cost of least-cost path from x to y
dx(y) = min { c(x, v) + dv(y) }
```

- `x`에서 `y`까지 최소 경로는 무조건 `x`의 이웃 중 하나를 거쳐 감
- `c(x, v)`는 알므로 `dv(y)`만 알면 됨. `dv(y)`는 recursive로 구함
- `v`는 자신이 가진 모든 node의 distance를 리스트로 `x`에 전달
- 각 node는 자신이 알고 있는 모든 distance를 넘겨줌. cost가 변경되거나 새 distance가 생기면 update 전달
- 어느 순간 stabilization → 전체 node를 알게 됨

#### Link cost가 변하는 경우

- node가 확인한 distance가 바뀌면 update 후 인접 이웃에게 전파해야 함
- **문제점**: cost가 변했을 때, 최단 거리가 이 cost를 포함한 최단 거리인지 알지 못함
- **Poisoned Reverse**: cost를 계산할 때 자기 자신을 되돌아가는 값이 최단 거리인 경우, 무한대의 cost를 인접 노드에 보냄

![Poisoned Reverse 예시](images/network-layer-06.webp)

- 예: y → x 최단 경로가 4. y → z → x 경로가 6. 그런데 y → x가 4 → 60으로 변하면, y는 z를 거쳐 가고 싶어 하지만 z는 다시 y로 돌아가 cost 무한 루프
- 따라서 왔던 node로 돌아가는 경우 무한대 cost를 보내 방지

## 11. Autonomous System

하나의 라우팅 도메인에 대한 자치권을 가진 시스템.

- 고유의 **AS number** 보유. AS끼리 전용 선을 연결 (Inter-AS routing)
- 하나의 네트워크는 게이트웨이 라우터로 들어오고 나가며, 네트워크끼리 연결 가능
- 예: SKT, KT 네트워크는 각각 하나의 AS. 자체 룰을 따름
- AS 내부는 각자 routing algorithm으로 동작 → **Intra-AS Routing Algorithm**
- 각 네트워크끼리 연결된 망 → **Inter-AS Routing Algorithm**
- AS는 약 6만 개 이상 존재
- AS 운영에는 장비·인력·비용 필요. 더 큰 AS와 연결해 트래픽 사용 (비용 지불) → **customer ↔ provider** 관계
- 갑을 관계가 명확하지 않은 경우 (예: SKT - KT) → **Peer 관계** (비용 미지불)

### 11.1 BGP

- **Border Gateway Protocol**: AS 간 router들이 어떤 식으로 routing할지 결정하는 프로토콜
- 최적화가 목적이 아니라, **AS 간 정책에 따라** routing
- AS를 이동할 때 network의 prefix와 AS path를 가짐. AS는 이동 시마다 각 AS의 path number 기록. 정책상 이 path로 트래픽 결정
