---
title: CPU Scheduling
slug: cpu-scheduling
category: os
summary: CPU Scheduler/Dispatcher, FCFS/SJF/Priority/RR/Multilevel Queue/Multilevel Feedback Queue, Multiprocessor 스케줄링
tags: [os, scheduling, fcfs, sjf, round-robin, priority, multilevel-queue]
sort_order: null
created: 2025-01-17
updated: 2026-05-10
---

## 1. CPU Scheduling의 필요성

- 대다수 process는 CPU를 오래 쓰기보다 **I/O를 기다리는 시간이 더 김** → **I/O bound job** (사람과의 interaction이 많은 경우)
- 반대로 **CPU bound job**은 CPU를 오래 사용 (계산 위주)
- **CPU burst**: Process에서 CPU를 한 번에 사용하는 시간
- 여러 종류의 job이 섞여 있으므로, 누구에게 얼마나 시간을 배분할지 결정해야 함 → **CPU와 I/O 자원을 골고루 효율적으로 사용**하기 위한 스케줄링 필요

![CPU/I/O bound job 분포](images/cpu-scheduling-01.webp)

## 2. CPU Scheduler & Dispatcher

| 구성 | 역할 |
|---|---|
| **CPU Scheduler** | Ready 상태 프로세스 중에서 CPU를 줄 프로세스를 선택 |
| **Dispatcher** | CPU 제어권을 선택된 프로세스에 넘김. 이 과정 = **Context Switch** |

### 2.1 CPU Scheduling이 필요한 상태 변화

| 상태 변화 | 예시 | 종류 |
|---|---|---|
| Running → Blocked | I/O 요청 시스템 콜 | nonpreemptive |
| Running → Ready | 할당 시간 만료 (timer interrupt) | preemptive |
| Blocked → Ready | I/O 완료 후 인터럽트 | preemptive |
| Terminate | | nonpreemptive |

- **Nonpreemptive**: 강제로 빼앗지 않음
- **Preemptive**: 강제로 빼앗음

### 2.2 Scheduling Criteria

| 기준 | 의미 |
|---|---|
| **CPU utilization** | 이용률. 높을수록 좋음 |
| **Throughput** | 처리량. 많을수록 좋음 |
| **Turnaround time** | 소요 시간. 짧을수록 좋음 |
| **Waiting time** | CPU를 쓰러 온 다음 기다린 총 시간 (Ready queue에서 대기) |
| **Response time** | 들어와서 최초로 CPU를 얻기까지 걸린 시간 |

## 3. CPU Scheduling Algorithms

### 3.1 FCFS (First-Come First-Serve)

- **Nonpreemptive**
- 도착한 순서대로 CPU 사용

![FCFS 정상 케이스](images/cpu-scheduling-02.webp)

- P2, P3가 먼저 도착한 경우

![FCFS Convoy Effect](images/cpu-scheduling-03.webp)

- waiting time이 크게 차이남
- **Convoy Effect**: 시간이 긴 process가 먼저 도착해 waiting time이 길어지는 효과

### 3.2 SJF (Shortest-Job-First)

- 각 프로세스의 다음 CPU burst time을 가지고 스케줄링
- CPU burst time이 가장 짧은 프로세스를 먼저 스케줄
- 두 가지 버전
  - **Nonpreemptive**: 일단 CPU를 잡으면 burst가 완료될 때까지 선점 안 됨
  - **Preemptive (SRTF, Shortest Remaining Time First)**: 현재 burst time보다 짧은 burst time의 새 프로세스가 도착하면 CPU 빼앗김
- **Optimal**: minimum average waiting time을 보장
- **치명적 약점**
  - **Starvation**: Long job은 영원히 CPU를 못 얻을 수 있음
  - CPU 사용 시간을 큐 입력 시점에 알 수 없음 → 과거 CPU burst를 활용해 추정 (**exponential averaging**)

### 3.3 Priority Scheduling

- Priority number를 process에 부여
- Highest priority를 가진 프로세스에 CPU 할당
- preemptive / nonpreemptive 모두 가능
- SJF는 일종의 priority scheduling
- **문제점**: Starvation
- **해결책**: **Aging** — 시간에 따라 priority를 높임

### 3.4 Round Robin (RR)

- timer로 인터럽트 → 다음 프로세스로 전환
- 각 프로세스는 동일한 크기의 할당 시간 (10~100 ms)
- 할당 시간이 지나면 프로세스는 선점되고 ready queue 맨 뒤로
- n개 프로세스, 할당 시간 q일 때 각 프로세스는 최대 q time unit 단위로 CPU의 1/n 사용
- **장점**: average turnaround time은 길지만 **response time이 짧음**
- 동질의 job(homogeneous job)에는 별로 좋지 않음 (긴 job, 짧은 job 대우가 같으므로)
- 현재 가장 많이 사용되는 방식

### 3.5 Multilevel Queue

- Ready Queue를 여러 개로 분할
  - **Foreground** (interactive)
  - **Background** (batch — no human interaction)
- 각 큐는 독립적인 스케줄링 알고리즘
  - foreground: RR
  - background: FCFS
- 큐 자체에 대한 스케줄링도 필요
  - **Fixed priority scheduling**
  - **Time slice**

### 3.6 Multilevel Feedback Queue

- Multilevel Queue와 같지만 **큐 간 이동 가능**
- 각 큐마다 알고리즘을 둘 수 있음
- 상위 큐로 상승시키는 기준과 하위 큐로 강등시키는 기준이 있음
- aging과 같은 방식으로 starvation 해결 가능

### 3.7 Multiple-Processor Scheduling

CPU가 여러 개면 스케줄링이 복잡해짐.

| 상황 | 설명 |
|---|---|
| **Homogeneous processor** | Queue에 한 줄로 세워서 각 프로세서가 알아서 꺼내가게 가능 |
| **제약 조건 있는 경우** | 특정 프로세서에서 수행되어야 하는 프로세스가 있어 복잡 |
| **Load sharing** | 일부 프로세서에 job이 몰리지 않게 부하 공유. 별개의 큐 vs 공동 큐 방식 |
| **Symmetric Multiprocessing (SMP)** | 각 프로세서가 알아서 스케줄링 결정 |
| **Asymmetric multiprocessing** | 하나의 프로세서가 시스템 데이터를 책임지고 나머지는 따름 |

## 4. Thread Scheduling

| 종류 | 설명 |
|---|---|
| **Local Scheduling** | User Level Thread. 사용자 수준 thread library가 어떤 thread를 스케줄할지 결정 |
| **Global Scheduling** | Kernel Level Thread. 일반 프로세스처럼 커널의 단기 스케줄러가 결정 |
