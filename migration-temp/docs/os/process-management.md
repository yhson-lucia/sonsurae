---
title: 프로세스 관리
slug: process-management
category: os
summary: 프로세스 메모리 구조, context와 PCB, 상태 전이, 스케줄러 3종, Thread, fork/exec/wait/exit, IPC
tags: [os, process, pcb, context-switch, scheduler, thread, ipc, fork]
sort_order: null
created: 2025-01-17
updated: 2026-05-10
---

## 1. 프로그램의 실행 (메모리 load)

- 프로그램을 실행하면 메모리에 올라가 **프로세스**가 됨
- 메모리에는 기본적으로 **Kernel**이 OS로 상주

### 1.1 Virtual Memory

프로그램이 실행되면 그 프로그램만의 가상 메모리 주소 공간이 존재. 각 프로세스는 3가지로 구성됨.

| 구성 | 설명 |
|---|---|
| **Code** | 실행 파일의 code가 올라오는 부분. CPU에서 실행할 기계어 |
| **Data** | 데이터가 보관되는 부분. 전역 변수 등 |
| **Stack** | 함수 호출/복귀 정보 보관. 지역 변수 |

- 커널도 하나의 프로그램이므로 동일하게 3가지로 구성
  - **OS 코드**: 시스템 콜, 인터럽트 처리, 자원 관리, 서비스 제공 코드
  - **OS 데이터**: 하드웨어·프로세스 관리를 위한 자료구조 (PCB 등)
  - **OS 커널의 Stack**: 각 프로세스마다 별도로 존재
- 당장 필요한 부분만 메모리에 올라가고, 나머지는 **Swap area**로 이동

### 1.2 함수 종류

| 종류 | 설명 |
|---|---|
| **사용자 정의 함수** | 자신의 프로그램에서 정의한 함수 |
| **라이브러리 함수** | 자신의 프로그램에서 정의하지 않고 갖다 쓴 함수. 실행 파일에 포함됨 |
| **커널 함수** | OS 프로그램의 함수. 호출 = 시스템 콜 |

![프로그램 실행 순서](images/process-management-01.webp)

## 2. 프로세스의 개념

- **실행 중인 프로그램**을 프로세스라 함
- **Context**: 프로세스의 상태. 함수 진행 상태, CPU 사용량, 메모리 사용량 등

### 2.1 Context의 구성

- **CPU 수행 상태를 나타내는 하드웨어 context**: program counter, 각종 register
- **프로세스 주소 공간**: code, data, stack
- **프로세스 관련 커널 자료구조**
  - **PCB** (Process Control Block): OS가 프로세스를 관리하기 위한 자료구조
  - **Kernel stack**

![프로세스 Context 구조](images/process-management-02.webp)

## 3. 프로세스의 상태

| 상태 | 설명 |
|---|---|
| **Running** | CPU를 잡고 instruction을 수행 중 |
| **Ready** | CPU를 기다리는 상태 (메모리 등 다른 조건은 모두 충족) |
| **Blocked** (wait, sleep) | CPU를 줘도 즉시 instruction을 수행할 수 없음. 자신이 요청한 event(예: I/O)가 즉시 만족되지 않아 기다리는 상태 |
| **New** | 프로세스가 생성 중 |
| **Terminated** | 수행이 끝난 상태 |

![프로세스 상태 전이도](images/process-management-03.webp)

## 4. PCB (Process Control Block)

OS가 각 프로세스를 관리하기 위해 프로세스당 유지하는 정보.

| 카테고리 | 항목 |
|---|---|
| OS가 관리상 사용 | Process state, Process ID, scheduling information, priority |
| CPU 수행 관련 하드웨어 값 | Program counter, registers |
| 메모리 관련 | Code, data, stack의 위치 정보 |
| 파일 관련 | Open file descriptors |

![PCB 구조](images/process-management-04.webp)

### 4.1 Context Switch

CPU를 한 프로세스에서 다른 프로세스로 넘기는 과정.

- 넘겨주는 프로세스의 상태를 PCB에 저장
- 새로 얻는 프로세스의 상태를 PCB에서 읽어옴

![Context Switch](images/process-management-05.webp)

> **예외**: User mode (process A) → interrupt/system call로 kernel mode → 다시 User mode (process A)는 **Context Switch가 아님**. 다른 프로세스로 이동하는 경우만 Context Switch.

> 예외 사항도 context의 일부를 PCB에 save하지만, 진짜 문맥 교환은 부담이 훨씬 큼 (cache memory flush가 일어나기 때문).

## 5. 프로세스 스케줄링을 위한 큐

| 큐 | 설명 |
|---|---|
| **Job queue** | 현재 시스템 내 모든 프로세스 집합 |
| **Ready queue** | 메모리 내 CPU를 기다리는 프로세스 집합 |
| **Device queue** | I/O device 처리를 기다리는 프로세스 집합 |

## 6. 스케줄러 (Scheduler)

### 6.1 Long-term Scheduler (Job Scheduler)

- 시작 프로세스 중 어떤 것을 ready queue로 보낼지 결정
  - new → ready 이동 시 admit
  - ready로 간다는 것은 메모리에 올라간다는 뜻. 너무 많이 올라가면 성능 저하
- 프로세스에 memory(및 자원)을 주는 문제
- **degree of Multiprogramming** 제어
- 최근 컴퓨터에는 거의 없음 (곧바로 ready로 들어감). 시분할 시스템에는 보통 장기 스케줄러가 없고 **중기 스케줄러**가 메모리 관리를 대신함

### 6.2 Short-term Scheduler (CPU Scheduler)

- 다음에 어떤 프로세스를 running시킬지 결정
- 프로세스에 CPU를 주는 문제
- **충분히 빨라야 함**

### 6.3 Medium-term Scheduler (Swapper)

- 메모리가 부족할 때 특정 프로세스를 통째로 메모리에서 디스크로 쫓아냄
- 프로세스에게서 memory를 뺏는 문제
- degree of Multiprogramming 제어

### 6.4 Suspended (Stopped) 상태

중기 스케줄러에 의해 프로세스가 메모리에서 쫓겨난 상태가 추가됨.

- 외부적인 이유로 수행이 정지된 상태
- 프로세스는 통째로 디스크에 swap out
- 예: 사용자가 break key로 일시 정지, 시스템이 메모리 부족으로 잠시 중단
- **Suspended vs Blocked**
  - Suspended: 외부에서 resume해야 Active
  - Blocked: 자신이 요청한 event 만족 시 ready

![Suspended가 추가된 상태 전이도](images/process-management-06.webp)

- **Suspended는 inactive**지만, I/O 작업 중에 Suspended가 된 경우 I/O가 끝나면 **Suspended Ready**로 돌아올 수 있음

#### Running 모드의 두 종류

- **User mode**: 프로세스가 자기 code를 수행
- **Monitor mode**: System call에 의해 커널 코드를 수행. OS가 CPU를 빼앗았다기보다 process가 커널에 함수 호출을 부탁한 것이므로 process는 모두 running으로 간주 (interrupt도 마찬가지)

## 7. Thread

- 일반 process는 메모리 주소 공간을 하나씩 만들고 PCB도 각각 만듦
- 비효율 사례: 웹 브라우저를 여러 개 띄우면 같은 code가 메모리에 여러 번 올라감 (data/stack/register만 다름)
- **Thread**: 동일 프로그램을 여러 개 띄울 때 **메모리 공간은 하나만**, 대신 여러 곳을 동시에 실행. 현재 CPU가 어느 부분을 수행 중인지만 다름

![Process vs Thread](images/process-management-07.webp)

- Thread는 **CPU 수행 부분만 따로** 가지고 Code는 하나로 수행
- **장점**: process의 Context Switch는 매우 큰 작업이지만, Thread 간 전환은 가벼움 (overhead 절감)

## 8. Process 관리

### 8.1 Process Creation

- **부모 프로세스가 자식 프로세스를 생성**
  - 직접 만들지는 못하고 OS에 시스템 콜 (`fork()`)
- **프로세스 트리 (계층 구조)** 형성
- 프로세스는 자원을 필요로 함
  - OS에서 받음 / 부모와 공유 (Thread와 다른 개념. 부모-자식은 별개 프로세스. 보통 경쟁 관계, 일부 공유 가능)

| 자원 공유 | 수행 |
|---|---|
| 모두 공유 | 부모-자식 공존 수행 |
| 일부 공유 | 자식 종료까지 부모 대기 |
| 전혀 공유 X | |

#### 주소 공간 (Address Space)

- 자식은 부모의 공간을 복사 (binary + OS data)
- 자식은 그 공간에 새 프로그램을 올림
- UNIX 예: `fork()`로 새 프로세스 생성 → 부모를 그대로 복사 (PID 제외) → 주소 공간 할당 → `exec()`으로 새 프로그램을 메모리에 올림 (덮어씀)

### 8.2 Process Termination

- 프로세스가 마지막 명령 수행 후 OS에 알림 (`exit`) → **정상 종료**
  - 자식이 부모에게 output data 전송 (via `wait`)
  - 프로세스의 자원이 OS에 반납
- 부모 프로세스가 자식을 종료시킴 (`abort`) → **강제 종료**
  - 자식이 할당 자원 한계치 초과
  - 자식 task가 더 이상 불필요
  - 부모가 종료할 때 (자식이 더 이상 수행되지 않게 함) — 단계적 종료 (맨 밑부터)

## 9. fork() / exec() / wait() / exit() 시스템 콜

| 함수 | 동작 |
|---|---|
| **`fork()`** | 새 프로세스를 복제. 자식도 부모의 문맥을 그대로 물려받아 동일한 컨텍스트부터 시작. PID는 다름 |
| **`exec()`** | 하나의 프로세스를 완전히 다른 프로세스로 덮어씀. `fork`만으로는 모든 프로세스가 동일하게 진행되므로 다른 프로세스를 실행하기 위해 사용 |
| **`wait()`** | 부모가 자식 종료 시까지 blocked(sleep). 자식이 종료되면 다시 CPU 획득 |
| **`exit()`** | 프로세스 종료. **자발적 종료**(마지막 statement 수행 후 자동 호출. 컴파일러가 main 리턴 위치에 삽입), **비자발적 종료**(자원 한계 초과, task 불필요, kill/break, 부모 종료) |

## 10. 프로세스 간 협력 (IPC)

- **독립적 프로세스**: 각자 주소 공간을 가지므로 원칙적으로 다른 프로세스에 영향 없음
- **협력 프로세스**: 협력 메커니즘으로 다른 프로세스의 수행에 영향을 미칠 수 있음

**IPC** (Inter-process Communication)

| 메커니즘 | 설명 |
|---|---|
| **Message passing** | 커널을 통해 message 전달 (process P send → process Q receive) |
| **Shared memory** | 서로 다른 프로세스 간에 일부 주소 공간을 공유 |
