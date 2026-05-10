---
title: Virtual Memory
slug: virtual-memory
category: os
summary: Demand Paging과 Page Fault 처리, Replacement 알고리즘(Optimal/FIFO/LRU/LFU/Clock), Frame Allocation, Thrashing과 Working Set
tags: [os, virtual-memory, demand-paging, page-fault, lru, clock, thrashing, working-set]
sort_order: null
created: 2025-01-17
updated: 2026-05-10
---

## 1. Demand Paging

실제로 필요할 때 page를 메모리에 올리는 것. 요청이 왔을 때 메모리에 올림.

- I/O 양 감소
- Memory 사용량 감소
- 빠른 응답 시간 (한정된 메모리 공간을 효율적으로 사용)
- 더 많은 사용자 수용 (multiprogram 환경)
- 각 페이지마다 **valid/invalid bit**
  - 당장 필요한 부분은 메모리에 올라가고, 필요 없는 부분은 backing store에 있음
  - **Invalid의 의미**: 사용되지 않는 주소 영역 또는 페이지가 물리 메모리에 없는 경우
  - Invalid 페이지에 접근하면 address translation 시 **page fault**가 발생 → OS로 CPU가 넘어감 (일종의 인터럽트)

### 1.1 Page Fault 처리

- Invalid page 접근 시 MMU가 trap 발생 (page fault trap)
- Kernel mode 진입 → page fault handler 호출
- 처리 순서

1. **Invalid reference?** (예: bad address, protection violation) → abort process
2. **Get an empty page frame** (없으면 뺏어옴 → replace)
3. 해당 페이지를 disk에서 memory로 읽어옴
   - disk I/O 종료까지 이 프로세스는 CPU preempt 당함 (block)
   - Disk read 완료 시 page table entry 기록, valid/invalid bit = "valid"
   - ready queue에 process 삽입 → dispatch
4. 이 프로세스가 CPU를 잡고 다시 running
5. 중단되었던 instruction 재개

> 대부분의 경우 page fault는 발생하지 않음 (98% 정도). 하지만 한 번 발생하면 overhead가 크기 때문에 시간이 오래 걸림.

### 1.2 Free Frame이 없는 경우 — Page Replacement

- 어떤 frame을 쫓아낼지 알고리즘 필요. 잘못 쫓아내면 overhead가 큰 작업을 다시 수행
- **곧바로 사용되지 않을 page를 쫓아내는 것이 좋음**
- 동일한 페이지가 여러 번 메모리에서 쫓겨났다가 다시 들어올 수 있음

## 2. Replacement Algorithm

목표: **page-fault rate 최소화**.

### 2.1 Optimal Algorithm (MIN, OPT)

- page fault를 가장 적게 하는 알고리즘
- **가장 먼 미래에 참조되는 page를 쫓아냄**
- Offline algorithm: 미래를 모두 안다고 가정. 실제 시스템 사용 불가
- 다른 알고리즘 성능 평가의 **upper bound** 제공

### 2.2 FIFO (First In First Out)

- 먼저 들어온 것을 먼저 내쫓음
- 메모리를 늘리면 오히려 성능이 나빠지는 경우가 있음 (**Belady's anomaly**)

### 2.3 LRU (Least Recently Used)

- 가장 오래 전에 참조된 것을 지움
- 실제로 가장 많이 사용

### 2.4 LFU (Least Frequently Used)

- 참조 횟수(reference count)가 가장 적은 페이지를 지움
- 최저 참조 횟수 페이지가 여럿이면 임의 선정 또는 가장 오래 전 참조 페이지를 지움
- **장점**: page의 인기도를 LRU보다 정확히 반영
- **단점**: 참조 시점의 최근성 미반영. 구현 복잡

![LRU vs LFU 비교](images/virtual-memory-01.webp)

### 2.5 Cache 기법

- 한정된 빠른 공간(Cache)에 요청된 데이터를 저장해 두었다가 후속 요청 시 캐시에서 직접 서비스
- Paging 외에 cache memory, buffer caching, web caching 등 다양한 분야에서 사용

#### Cache 운영의 시간 제약

- 교체 알고리즘 결정 시간이 너무 오래 걸리면 실제 시스템 사용 불가
- Buffer caching / Web caching: O(1) ~ O(log n) 정도 허용
- **Paging system은 LRU·LFU 사용 불가!**
  - page fault 시에만 OS가 관여. 페이지가 이미 메모리에 있으면 참조 시각을 OS가 알 수 없음 (CPU 제어권은 프로세스에 있음)
  - O(1)인 LRU의 list 조작조차 불가능

### 2.6 Clock Algorithm

- 메모리 안의 각 page에 1 bit 존재
- `0`: 최근 사용 안 됨, `1`: 최근 사용
- LRU를 근사하는 알고리즘 (가장 오래된 페이지는 아니지만 최근 사용 안 한 페이지)
- 하드웨어가 주소 변환 시 1로 바꿈
- OS가 메모리를 쫓아낼 때 1이면 0으로 바꾸고, 0이면 쫓아냄 (circular linked list)

![Clock Algorithm 동작](images/virtual-memory-02.webp)

- 1의 의미: 한 바퀴 도는 동안 적어도 1번은 사용됨
- **다른 명칭**: Second Chance Algorithm, NUR (Not Used Recently), NRU (Not Recently Used)
- **Reference bit + Modified bit** 함께 사용
  - **Reference bit (access bit)**: 최근 참조된 페이지
  - **Modified bit (dirty bit)**: 최근 변경된 페이지 (I/O 동반). 쫓아낼 때 disk에 써준 뒤 쫓아내야 함

## 3. Page Frame의 Allocation

위 알고리즘은 프로세스를 고려하지 않음. 어떤 프로세스든 동일한 알고리즘. 대신 **process에 미리 page frame을 할당**하는 방식.

### 3.1 Allocation의 필요성

- 메모리 참조 명령어 수행 시 명령어·데이터 등 여러 페이지 동시 참조
  - 명령어 수행을 위한 최소 frame 수가 있음
- Loop를 구성하는 page들은 한꺼번에 allocate되는 것이 유리
  - 최소 allocation이 없으면 매 loop마다 page fault

### 3.2 Allocation Scheme

| 방식 | 설명 |
|---|---|
| **Equal allocation** | 모든 프로세스에 동일하게 할당 |
| **Proportional allocation** | 프로세스 크기에 비례하여 할당 |
| **Priority allocation** | 프로세스 priority에 따라 다르게 할당 |
| **Global replacement** | 할당 없이 LRU 같은 알고리즘 사용. 메모리 많이 쓰는 프로그램에 많이 할당됨. 단점: 특정 프로그램이 메모리 독식 가능 |
| **Local replacement** | 각 process에 할당하고 그 frame 내에서만 replacement |

## 4. Thrashing

![Thrashing Diagram](images/virtual-memory-03.webp)

- 프로그램이 1개면 I/O 작업 중에 CPU가 놀아 이용률 낮음
- 프로그램이 2개 이상이면 CPU 이용률이 좀 더 높아짐
- **어느 순간 CPU 이용률이 뚝 떨어짐** → **Thrashing**
- 프로그램이 너무 많이 올라가 최소한의 메모리만 할당되어 누구에게 CPU를 줘도 page fault만 계속 발생
- OS는 CPU 이용률이 낮아서 더 많은 프로세스를 할당해 악화시킴

### 4.1 Working-Set Model

- **Locality of Reference**: 프로세스는 특정 시간 동안 일정 장소만 집중적으로 참조
- 집중적으로 참조되는 page 집합 = **Locality Set**
- **Working Set**: 프로세스가 일정 시간 동안 원활하게 수행되기 위해 한꺼번에 메모리에 올라와 있어야 하는 page 집합
- Working Set 모델: process의 working set 전체가 메모리에 있어야 수행. 아니면 모든 frame을 반납하고 swap out (suspend)

#### Working Set Algorithm

- **Working set window**로 알아냄
- 예: 현 시점에서 과거 10개의 reference를 봄
- working set window의 page reference 표에서 5개·2개 등 필요한 페이지 수 결정
- 메모리에 공간 있으면 할당, 그렇지 않으면 모두 swap out

### 4.2 Page-Fault Frequency (PFF) Scheme

- page fault rate의 상한값과 하한값을 둠
- Page fault rate이 **상한값 초과** → frame 더 할당 (메모리 부족 의미)
- Page fault rate이 **하한값 이하** → 할당 frame 수 줄임
- 빈 frame이 없으면 일부 프로세스를 swap out

## 5. Page Size

Page size를 줄이면?

- page table이 그만큼 늘어남
- 물리 메모리 사용 효율 증가 (불필요 낭비 감소)
- page fault가 자주 발생 (사이즈가 작아지므로)
