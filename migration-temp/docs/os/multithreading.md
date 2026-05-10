---
title: Multithreading
slug: multithreading
category: os
summary: 프로세스와 스레드 차이, 멀티스레딩/멀티프로세싱 비교, Python의 GIL
tags: [os, thread, process, multithreading, multiprocessing, gil, python]
sort_order: null
created: 2025-01-17
updated: 2026-05-10
---

## 1. 프로세스 vs 스레드

| 항목 | 프로세스 (Process) | 스레드 (Thread) |
|---|---|---|
| 정의 | OS에서 할당받는 자원 단위 (실행 중인 프로그램) | 프로세스 내 실행 흐름 단위 |
| 자원 | CPU 동작 시간 + 독립 주소 공간 | 프로세스 자원 사용 |
| 메모리 영역 | Code, Data, Stack, Heap **모두 독립** | Stack만 별도 할당. Code, Data, Heap **공유** |
| 변수 공유 | X | O (메모리 공유) |
| 영향 관계 | 독립적 | 한 스레드의 결과가 다른 스레드에 영향 |
| 통신 비용 | 높음 (파이프, 파일, 소켓 등 IPC. Context Switching 비용) | 낮음 |
| 동기화 | 일반적으로 불필요 | 매우 주의 필요 (디버깅 어려움) |
| 보유 | 최소 1개의 메인 스레드 | — |

## 2. 멀티스레딩 (Multi-threading)

- 한 개의 단일 애플리케이션
- 시스템 자원 소모 감소(효율성), 처리량 증가 (Cost 감소)

| 장점 | 단점 |
|---|---|
| 통신 부담 감소 | 디버깅 어려움 |
| | 동기화 문제 (교착 상태) |
| | 자원 공유 문제 |
| | 잘못 구현 시 프로그램 성능 저하 |

## 3. 멀티프로세싱 (Multi-processing)

- 한 개의 단일 애플리케이션을 여러 프로세스로 구성해 작업 처리

| 장점 | 단점 |
|---|---|
| 한 프로세스의 문제가 확산되지 않음 (해당 프로세스 kill) | 캐시 체인지 |
| | Cost 매우 높음 (오버헤드) |
| | 복잡한 통신 방식 사용 |

## 4. GIL (Global Interpreter Lock)

Python의 thread 처리에서 핵심이 되는 메커니즘.

- **실행 원리**: CPython이 Python(bytecode)을 실행할 때 여러 Thread를 사용하더라도 **단일 스레드만 Python object에 접근하도록 제한하는 Mutex**
- 이유: CPython의 메모리 관리가 thread-safe하지 않기 때문
- 단일 스레드만으로도 충분히 빠름
- **프로세스 사용 가능** (Numpy, Scipy 등은 GIL 외부 영역에서 효율적으로 동작)
- 병렬 처리는 `multiprocessing`, `asyncio` 같은 다양한 선택지 존재
- thread 동시성 완벽 처리를 원하면 **Jython, IronPython, Stackless Python** 등 사용

> 참고: 『고성능 파이썬』 (책)
