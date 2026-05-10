---
title: 메모리 관리
slug: memory-management
category: os
summary: Logical/Physical Address, Address Binding, MMU, Loading/Linking/Swapping, 연속 할당, Paging, Segmentation, Paged Segmentation
tags: [os, memory, paging, segmentation, mmu, address-binding, swapping]
sort_order: null
created: 2025-01-17
updated: 2026-05-10
---

## 1. Logical vs Physical Address

![Logical vs Physical Address](images/memory-management-01.webp)

- 디스크의 실행 파일이 메모리에 올라가기 전에 가상 메모리(가상 주소) 공간을 거침. 메모리에는 OS와 다른 프로세스가 있기 때문

| 종류 | 설명 |
|---|---|
| **Logical address** (Virtual address) | 프로세스마다 독립적으로 가지는 주소 공간. 0번지부터 시작. **CPU가 보는 주소** |
| **Physical address** | 메모리에 실제 올라가는 위치 |

- 프로그래머는 숫자 주소가 아닌 함수 이름·타입 등 **Symbolic Address**를 사용

## 2. Address Binding

Symbolic address → Logical address(컴파일) → Physical address(실행 시 변환). 이 과정이 **Address Binding**.

![Address Binding 시점](images/memory-management-02.webp)

| 시점 | 설명 |
|---|---|
| **Compile time binding** | 물리적 메모리 주소가 컴파일 시 알려짐. 시작 위치 변경 시 재컴파일 필요. 절대 코드(absolute code) 생성. 멀티태스킹에 비효율적 |
| **Load time binding** | 논리 주소 → 물리 주소 변환을 실행 시점에 수행. 컴파일러가 재배치 가능 코드(relocatable code)를 생성한 경우 가능 |
| **Run time binding** | 프로그램 실행 도중에 물리 주소가 변할 수 있음. 시작 후에도 메모리 위치 이동 가능. CPU가 주소 참조마다 binding 점검 (address mapping table). 하드웨어 지원 필요 |

> **CPU는 항상 logical address를 본다.** 코드 안의 논리 주소를 바꾸려면 컴파일 다시 해야 함. CPU는 매 순간 주소 변환을 수행해야 함.

### 2.1 MMU (Memory-Management Unit)

Logical address를 physical address로 변환.

| 레지스터 | 설명 |
|---|---|
| **Relocation register** | 메모리의 시작 위치. 논리 → 물리 주소 변환 |
| **Limit register** | 논리 주소의 범위. 초과 시 악의적 접근으로 보고 trap 발생 |

![MMU 동작](images/memory-management-03.webp)

## 3. Loading / Linking / Swapping

### 3.1 Dynamic Loading

- 프로세스 전체를 메모리에 미리 다 올리지 않고, **해당 루틴이 불릴 때 메모리에 load**
- 프로그램 코드는 모든 경우에 다 사용되지는 않음 (예외 처리 등)
- Memory utilization 향상
- 가끔 사용되는 많은 양의 코드에 유용
- OS의 특별한 지원 없이 프로그램 자체에서 구현 가능

### 3.2 Overlays

- 메모리에 프로세스의 부분 중 실제 필요한 정보만 올림
- 프로세스 크기가 메모리보다 클 때 유용
- OS의 지원 없이 사용자가 직접 구현
- 작은 메모리를 사용하던 초창기 시스템에서 수작업으로 프로그래머가 구현

### 3.3 Swapping

- 프로세스를 일시적으로 메모리에서 **backing store**(swap area, 디스크)로 쫓아내는 것
- **Backing store**: 보통 디스크. 많은 사용자의 프로세스 이미지를 담을 만큼 빠르고 큰 저장 공간
- **Swap in / Swap out**
  - 일반적으로 중기 스케줄러가 swap out 대상을 선정. priority가 낮은 프로세스를 swap out → suspended 상태
  - Compile/Load time binding은 원래 메모리 위치로 swap in 해야 함
  - Execution time binding은 빈 메모리 영역 아무 곳에나 올릴 수 있음 → 보통 swapping에는 **Run time binding** 필요
  - swap time은 대부분 transfer time (양에 비례)
- 보통 통째로 쫓겨남. 부분적으로 페이징하는 기법도 존재

### 3.4 Dynamic Linking (Shared Library)

- Linking을 실행 시간(execution time)까지 미루는 기법
- **Static linking**: 라이브러리가 프로그램 실행 파일 코드에 포함됨
- **Dynamic linking**: 라이브러리 호출 부분에 stub이라는 작은 코드를 둠
  - 라이브러리가 메모리에 있으면 그 루틴 주소로 가고, 없으면 디스크에서 읽어옴
  - OS 지원 필요
- **장점**: 공유 개념이라 확장성이 높음

## 4. Allocation of Physical Memory

메모리는 일반적으로 두 영역으로 나뉨.

- **OS 상주 영역**: interrupt vector와 함께 낮은 주소 영역
- **사용자 프로세스 영역**: 높은 주소 영역

### 4.1 Contiguous Allocation (연속 할당)

프로그램이 쪼개지지 않고 통째로 올라가는 방식. 주소 변환이 비교적 간단 (limit + relocation register).

#### 고정 분할 (Fixed Partition)

- 물리 메모리를 미리 몇 개의 partition으로 나눔
- 각 partition에 프로그램 하나씩
- **Internal fragmentation** (내부 조각): 분할 크기가 고정되어 남는 공간
- **External fragmentation** (외부 조각): 분할이 작아 활용 불가

#### 가변 분할 (Variable Partition)

- 운영체제·메모리 영역을 미리 나누지 않음
- 실행 후 종료된 자리에 다른 프로그램이 들어갈 수 있지만, 연속 할당이라 큰 프로그램은 들어갈 자리가 없음 → 외부 조각
- 내부 조각은 발생하지 않음

> 두 방식 모두 **현대에는 사용되지 않음**.

#### Hole

- 가용 메모리 공간
- 다양한 크기의 hole이 메모리 여러 곳에 흩어져 있음
- 프로세스 도착 시 수용 가능한 hole에 할당
- OS는 (1) 할당 공간 (2) 가용 공간(hole) 정보 유지

#### Dynamic Storage-Allocation Problem

가변 분할 방식에서 size n인 요청을 만족하는 가장 적절한 hole을 찾는 문제.

| 방법 | 설명 | 특성 |
|---|---|---|
| **First-fit** | size n 이상 중 가장 처음 발견되는 hole에 할당 | 속도 효율 |
| **Best-fit** | size n 이상 중 가장 작은 hole에 할당 | 정렬 안 되면 모든 hole 탐색. 작은 hole 다수 생성. 공간 효율 |
| **Worst-fit** | 가장 큰 hole에 할당 | |

#### Compaction

- 사용 중 메모리를 한 군데로 몰고 hole들을 다른 한 곳으로 몰아 큰 block 만듦
- 비용이 매우 큼
- **Run time binding**에서만 가능

### 4.2 Noncontiguous Allocation (불연속 할당)

하나의 프로세스가 메모리 여러 영역에 분산되어 올라갈 수 있음.

#### Paging

- Process의 virtual memory를 동일한 사이즈의 **page** 단위로 나눔
- Virtual memory의 내용이 page 단위로 noncontiguous하게 저장
- 일부는 backing storage(swap area)에, 일부는 physical memory에

**Basic Method**

- physical memory를 동일 크기의 **frame**으로 나눔
- logical memory도 동일 크기의 page로 나눔
- 모든 가용 frame을 관리
- **Page table**로 logical → physical 변환
- External fragmentation은 발생하지 않음
- Internal fragmentation은 발생할 수 있음 (마지막 자투리)

![Page Table 변환 예시](images/memory-management-04.webp)

- 보통 주소는 32 bit. `2^32 = 4 GB`. 4 KB로 나누면 100만 개 이상의 page가 나옴 → 같은 수의 page table entry 필요
- Page table은 **main memory에 상주**
- 기존 register 2개 → **PTBR** (Page-table base register), **PTLR** (Page-table length register)
- 모든 메모리 접근에 2번의 access 필요 (page table + 실제 data)
- 속도 향상을 위해 **TLB** (Translation Look-aside Buffer)라는 고속 lookup hardware cache 사용 (일종의 캐시 메모리)

![TLB 동작](images/memory-management-05.webp)

- TLB는 일부만 가지고 있어 index 접근 불가. **논리 page 번호 + frame number**를 함께 가짐
- 순차 검색은 overhead가 크므로 **병렬 검색** (parallel search) — **associative register**로 하드웨어 구현

#### Two-Level Page Table

- Paging의 단점: process마다 table이 100만 개씩 → 4 byte × 100만 = **4 MB**가 필요. 큰 공간 낭비
- 2단계로 구성: 바깥쪽 page table + 안쪽 page table

![Two-Level Page Table](images/memory-management-06.webp)

- 주소 변환을 위해 메모리 2번 접근, 실제 데이터 접근 1번 → 시간 손해. 하지만 공간 이득
- **공간 이득 이유**: 프로세스의 Code/Data는 백만 entry를 다 사용하지 않음. 안 쓰는 부분은 바깥 table에서 null로 처리되어 안쪽 table을 만들 필요가 없음
- 안쪽 table 하나는 4 KB. entry 4 byte → 1k개

**주소 변환 과정** — `p1`, `p2`, `d` 3부분으로 나뉨

| 부분 | 의미 | bit 수 |
|---|---|---|
| `d` | page offset (page 안에서의 위치) | 12 bit (4 KB = 2^12) |
| `p1` | 바깥 table index | 10 bit |
| `p2` | 안쪽 table index | 10 bit |

#### Page Table 각 entry의 bit

| Bit | 설명 |
|---|---|
| **Protection bit** | page 접근 권한 (read/write 등) |
| **Valid-Invalid bit** | 해당 frame에 유효한 내용이 있는지 |

#### Inverted Page Table Architecture

- 원래 page table은 논리 → 물리 변환. 공간 낭비가 너무 큼
- **물리적 frame당 page table entry**를 둠 (반대 방향)
- 장점: System wide하게 table이 하나만 있으면 됨
- 단점: 논리 → 물리 변환에는 도움이 안 됨. 모든 table 검색 필요. 프로세스마다 page가 다르므로 **process id**도 함께 저장해야 함

#### Shared Page Table

- 동일 프로그램이 여러 개 열린 경우 Code 부분이 동일 → 메모리에 하나만 올리고 공유 (read only)
- Shared memory와는 다름 (read/write 모두 가능)
- 두 번째 조건: 동일한 logical address에 있어야 함 (기계어 위치가 바뀌면 안 됨)

> 주소 변환은 전적으로 **하드웨어의 역할**. OS가 하는 일은 아님. 예외로 I/O 접근은 반드시 OS를 통해 함.

## 5. Segmentation

- 프로그램을 **의미 단위**의 여러 segment로 구성 (Code, Stack, Data 등)
- 균일한 크기 보장 X
- Code 안에서 함수 단위로 더 쪼갤 수도 있음
- **Segment table** 존재. Paging Table과 비슷하나 차이가 있음

### 5.1 Logical Address 구성

`<segment-number, offset>`

![Segmentation 동작](images/memory-management-07.webp)

- segment 시작 위치를 물리 주소에서 가져오고, offset 정보 사용
- Paging과 달리 **segment 길이 정보**가 필요. table에 저장
- segment 길이보다 큰 offset이면 잘못된 접근으로 trap 발동
- 레지스터 2개 (Paging과 비슷)

| 레지스터 | 설명 |
|---|---|
| **STBR** (Segment-table base register) | 물리 메모리에서 segment table 위치 |
| **STLR** (Segment-table length register) | 프로그램이 사용하는 segment 수 |

### 5.2 장단점

- **단점**: segment 크기가 제각각이라 외부 조각 문제 발생 (first fit / best fit). External fragmentation 발생
- **장점**: 의미 단위 작업(protection, sharing 등 — 읽기 권한)에 유리
- **현실적 문제**: segment table은 entry가 적음. 공간 낭비는 paging이 훨씬 심함

## 6. Paged Segmentation

- segment를 paging
- segment-table entry가 segment의 base address가 아니라, segment를 구성하는 **page table의 base address**를 가짐

![Paged Segmentation](images/memory-management-08.webp)

- 즉, segment table + segment마다 page table이 존재
