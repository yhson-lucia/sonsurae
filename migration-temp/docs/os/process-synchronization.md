---
title: Process Synchronization
slug: process-synchronization
category: os
summary: Race condition과 critical section, 상호 배제·진행·유한 대기 조건, Semaphore와 busy-wait/block-wakeup
tags: [os, synchronization, race-condition, critical-section, semaphore, mutex]
sort_order: null
created: 2025-01-17
updated: 2026-05-10
---

## 1. 데이터의 접근

![데이터 접근 구조](images/process-synchronization-01.webp)

### 1.1 Race Condition

데이터를 여러 곳에서 읽어 연산하는 경우 발생하는 문제.

![Race Condition 예시](images/process-synchronization-02.webp)

- 보통 CPU가 여러 개일 때 발생. CPU 1개일 때도 발생할 수 있음
- **OS에서의 race condition 예**
  - process A가 시스템 콜로 OS 안의 데이터를 변경
  - CPU 할당 시간이 끝나 process B로 전환
  - B도 시스템 콜로 OS 코드 실행
  - A가 건드린 데이터를 B의 요청으로 변경
  - CPU가 다시 A로 → A는 이전에 읽은 데이터값을 그대로 사용해 저장
  - 결과: A가 읽은 데이터값과 B가 저장한 값이 충돌
- **해결책**: 커널 모드 수행 중에는 CPU를 빼앗지 않음. 사용자 모드로 돌아갈 때 preempt

## 2. Process Synchronization 문제

- 공유 데이터(shared data)의 동시 접근(concurrent access)은 데이터 불일치(inconsistency)를 유발
- 일관성 유지를 위해 협력 프로세스 간 **실행 순서(orderly execution)** 를 정해주는 메커니즘 필요

### 2.1 Race Condition

- 여러 프로세스가 동시에 공유 데이터를 접근하는 상황
- 데이터의 최종 결과는 마지막에 그 데이터를 다룬 프로세스에 따라 달라짐
- Race condition을 막으려면 concurrent process는 **동기화(Synchronize)** 되어야 함

### 2.2 Critical Section

n개의 프로세스가 공유 데이터를 동시에 사용하기를 원하는 경우, 각 프로세스의 code segment에는 공유 데이터를 접근하는 코드인 **critical section**이 존재.

**문제**: 하나의 프로세스가 critical section에 있을 때, 다른 모든 프로세스는 critical section에 들어갈 수 없어야 함.

### 2.3 프로그램적 해결의 3조건

| 조건 | 설명 |
|---|---|
| **Mutual Exclusion** (상호 배제) | 프로세스 Pi가 critical section 수행 중이면 다른 모든 프로세스는 critical section에 들어가면 안 됨 |
| **Progress** (진행) | 아무도 critical section에 있지 않은 상태에서 들어가려는 프로세스가 있으면 들어가게 해야 함 |
| **Bounded Waiting** (유한 대기) | 프로세스가 critical section 진입을 요청한 후 그 요청이 허용될 때까지 다른 프로세스가 들어가는 횟수에 한계가 있어야 함 |

## 3. Synchronization Hardware

- 하드웨어적으로 **Test & Modify를 atomic하게** 수행할 수 있도록 지원하면 위 문제를 간단히 해결
- 값을 읽는 것과 setting하는 것을 쪼개지 않고 동시에 할 수 있으면 문제없음

### 3.1 Semaphore

추상 자료형. 어떻게 구현되는지보다 **object와 operation으로 구성**된다는 점이 중요.

| 요소 | 설명 |
|---|---|
| **Integer variable** | S |
| **`P(S)`** | 자원을 획득. Lock 획득 |
| **`V(S)`** | 자원을 반납. Lock 반납 |

- S(자원 카운팅 변수)에 따라 획득 가능 여부 결정
- 원자적 수행은 하드웨어로 보장
- **단점**: busy-wait 문제에 비효율적 (while 루프를 계속 돌기 때문)

### 3.2 Block / Wake-up

- **Sleep lock**: lock이 걸려 있으면 sleep시킴. PCB를 연결하고 sleep (자료구조 내에서)

### 3.3 Busy-wait vs Block/Wake-up

- Block/Wake-up도 일종의 overhead
- Critical section의 길이가 **긴 경우**: Block/Wake-up이 적당
- Critical section의 길이가 **짧은 경우**: 오버헤드가 더 커질 수 있어 **busy-wait이 좋을 수도** 있음
