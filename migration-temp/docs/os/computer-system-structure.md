---
title: 컴퓨터 시스템의 구조
slug: computer-system-structure
category: os
summary: 컴퓨터 시스템 구성, mode bit/timer/registers, system call, interrupt(하드웨어/Trap), Device Controller, 동기/비동기 I/O, DMA
tags: [os, system-call, interrupt, dma, kernel, mode-bit]
sort_order: null
created: 2025-01-17
updated: 2026-05-10
---

## 1. 운영체제 (OS)

- 컴퓨터 하드웨어 바로 위에 설치되어 사용자·소프트웨어와 하드웨어를 연결하는 소프트웨어 계층
- **협의의 운영체제 (커널)**: 운영체제의 핵심 부분. 메모리에 상주
- **광의의 운영체제**: 커널 + 각종 주변 시스템 유틸리티

### 1.1 운영체제의 분류

| 기준 | 종류 |
|---|---|
| **동시 작업 가능 여부** | 단일 작업 (single tasking), 다중 작업 (multi tasking) |
| **사용자 수** | 단일 사용자 (MS-DOS, MS Windows), 다중 사용자 (UNIX, NT Server) |
| **처리 방식** | 일괄처리 (batch), 시분할 (time sharing), 실시간 (Realtime OS) |

#### 처리 방식 상세

- **일괄처리**: 작업 요청을 모아서 한꺼번에 처리. 작업이 끝날 때까지 기다려야 함
- **시분할**: 컴퓨터 처리 능력을 시간 단위로 분할. 일괄처리에 비해 응답 시간이 짧음. **interactive**
- **실시간**: 정해진 시간 안에 어떤 일이 반드시 종료되어야 하는 시스템용. 예: 원자로/공장 제어, 미사일 제어, 반도체 장비, 로봇 제어

### 1.2 용어 정리

| 용어 | 의미 |
|---|---|
| **Multitasking** | 여러 프로그램을 동시에 돌림 |
| **Multiprogramming** | 메모리에 프로그램이 여러 개 올라가 있는 상황 |
| **Time sharing** | CPU 시간을 분할해 나눠 사용 |
| **Multiprocessor** | 하나의 컴퓨터에 여러 CPU가 붙어 있음 |

### 1.3 OS 예시

| OS | 특징 |
|---|---|
| **UNIX** | 코드 대부분 C로 작성. 높은 이식성, 최소 커널 구조, 확장 용이, 일부 소스 공개. 다양한 버전 (Linux 등) |
| **DOS** (Disk Operating System) | MS의 개인용 컴퓨터 OS. 단일 작업 |
| **MS Windows** | MS의 다중 작업용 GUI 기반 OS. 풍부한 지원 소프트웨어 |

## 2. 컴퓨터 시스템 구조

![컴퓨터 시스템 구조](images/computer-system-structure-01.webp)

- I/O 장치에는 작은 CPU(**controller**)가 존재. 실제 기계어 연산 수행
- CPU의 작업 공간은 **memory**. 각 I/O 장치의 작업 공간은 **local buffer**

### 2.1 Mode Bit

CPU가 OS에 의해 실행될 때는 무엇이든 해도 무방하지만, 사용자 프로그램으로 CPU를 넘기면 무한 루프, 파일 접근 등 문제가 생길 수 있음. 이를 막는 보호 장치.

- 사용자 프로그램의 잘못된 수행으로 다른 프로그램·OS에 피해가 가지 않도록 하기 위한 보호 장치
- **Mode bit**으로 하드웨어적으로 두 모드를 지원
  - `1`: 사용자 프로그램 실행
  - `0`: OS 코드 수행
- 위험한 명령어인데 mode bit이 사용자 프로그램이면 **CPU가 자동으로 OS로 넘어감**

### 2.2 주요 하드웨어 요소

| 요소 | 설명 |
|---|---|
| **Exception** | 권한이 없는 기능을 수행하려 할 때 CPU가 자동으로 OS로 넘어감 |
| **Interrupt** | CPU에 Interrupt line 존재. 매 순간 확인해 OS로 넘길지 결정 |
| **Registers** | 연산에 사용되는 input/output을 저장하는 빠르고 작은 장소 |
| **Program Counter** | 다음에 실행할 메모리 주소를 가진 레지스터 |
| **Timer** | 일정 시간 간격으로 인터럽트 발생. 프로그램에 넘길 때 시간 setting → 시간 만료 시 CPU 회수. 특정 프로그램의 CPU 독점을 방지 |

## 3. 시스템 콜 (System Call)

CPU → I/O controller (기계어 요청, **특권 명령**으로 분류). 사용자 프로그램은 직접 요청할 수 없고 OS에게 부탁해야 하는데, 이를 **시스템 콜**이라 함.

- 사용자 프로그램이 OS의 서비스를 받기 위해 **커널 함수를 호출**하는 것
- 프로그램이 I/O가 필요할 때 OS로의 점프가 필요. 다른 프로그램을 모두 건너뛰고 CPU를 OS로 넘겨야 함
- 프로그램 스스로 인터럽트를 검

## 4. 인터럽트 (Interrupt)

| 종류 | 설명 |
|---|---|
| **Interrupt** (하드웨어 인터럽트) | 하드웨어가 발생시킨 인터럽트 (I/O 출력 등) |
| **Trap** (소프트웨어 인터럽트) | Exception (권한이 없는 코드 실행), System Call (커널 함수 호출) |

- **인터럽트 벡터**: 해당 인터럽트의 처리 루틴 주소를 가짐
- **인터럽트 처리 루틴 (Interrupt Service Routine, 인터럽트 핸들러)**: 해당 인터럽트를 처리하는 커널 함수
- 현대 OS는 **인터럽트에 의해 구동**됨

## 5. Device Controller

- 각 장치를 통제하는 일종의 작은 CPU. **하드웨어**
- **Device driver**: OS 코드 중 각 장치별 처리 루틴. **소프트웨어**. CPU가 I/O에게 요청하는 코드

### 5.1 I/O Device Controller

- 해당 I/O 장치 유형을 관리하는 작은 CPU
- 제어 정보를 위해 **control register**, **status register** 보유
- **Local buffer** (일종의 data register) 보유
- I/O는 실제 device와 local buffer 사이에서 발생
- I/O가 끝나면 인터럽트로 CPU에 알림

## 6. 동기식 / 비동기식 I/O

### 6.1 동기식 I/O (Synchronous I/O)

I/O 요청 후 작업 완료 후에야 제어가 사용자 프로그램으로 넘어감.

**구현 방법**

- I/O가 끝날 때까지 CPU를 낭비. 매 시점 하나의 I/O만 가능
- I/O 완료 시까지 해당 프로그램에서 CPU를 빼앗음. I/O 처리 대기 큐에 줄 세움
- 다른 프로그램에 CPU를 넘김

### 6.2 비동기식 I/O (Asynchronous I/O)

I/O가 시작된 후 작업 완료를 기다리지 않고 제어가 즉시 사용자 프로그램으로 돌아감.

![동기식 vs 비동기식 I/O](images/computer-system-structure-02.webp)

## 7. DMA (Direct Memory Access)

- 빠른 입출력 장치를 메모리에 가까운 속도로 처리하기 위해 사용
- CPU의 중재 없이 device controller가 device buffer storage의 내용을 메모리에 **block 단위로 직접 전송**
- 바이트 단위가 아니라 block 단위로 인터럽트 발생
- 인터럽트가 너무 자주 발생하면 CPU에 비효율적. 빠른 I/O device일수록 그 문제가 심함
- 즉, **memory에 직접 접근**할 수 있는 장치
- block 크기가 채워지면 DMA가 메모리로 직접 전송 → DMA가 메모리에 복사 → 인터럽트 발생

![DMA 동작](images/computer-system-structure-03.webp)
