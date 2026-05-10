---
title: File System
slug: file-system
category: os
summary: 파일·디렉토리·파티션, File Protection, Mounting, Access Method, 파일 데이터 할당(Contiguous/Linked/Indexed), UNIX/FAT, Free Space, VFS/NFS, Page/Buffer Cache
tags: [os, file-system, directory, fat, unix-fs, vfs, nfs, cache]
sort_order: null
created: 2025-01-17
updated: 2026-05-10
---

## 1. File

- A named collection of related information
- 일반적으로 비휘발성 보조기억장치에 저장
- **운영체제는 다양한 저장 장치를 file이라는 동일한 논리 단위**로 보게 해줌

### 1.1 Operations

`create`, `read`, `write`, `delete`, `open`, `close`, `lseek` (reposition)

> `lseek`: 파일을 읽으면 포인터가 자동으로 다음 위치로 이동. 특정 부분부터 다시 읽기 위해 포인터를 수정.

### 1.2 File Attribute (Metadata)

파일 자체의 내용이 아니라 파일 관리를 위한 정보.

- 파일 이름·유형·저장 위치·사이즈
- 접근 권한 (read/write/execute), 시간 (생성/변경/사용), 소유자

### 1.3 File System

- OS에서 파일을 관리하는 부분
- 파일·메타데이터·디렉토리 정보 등을 관리
- 파일 저장 방법 결정
- 파일 보호

### 1.4 Directory

- 파일의 메타데이터 일부를 보관하는 특별한 파일
- 디렉토리에 속한 파일 이름과 attribute를 저장
- **Operations**: `search for a file`, `create a file`, `delete a file`, `list a directory`, `rename a file`, `traverse the file system`

### 1.5 Partition (Logical Disk)

- 하나의 (물리) 디스크 안에 여러 파티션을 두는 게 일반적
- 여러 물리 디스크를 하나의 파티션으로 구성하기도 함
- 파티션마다 file system을 깔거나 swapping 등 다른 용도로 사용 가능

### 1.6 `open()` 동작

- 파일 시스템에는 metadata가 있음. 파일을 open하면 metadata가 메모리로 올라옴
- 예: `open("a/b/c")` → 디스크의 파일 c의 metadata를 메모리로 가져옴
- **순서**
  1. root의 metadata를 메모리에 올림 → root content 위치 확인
  2. directory 파일이므로 그 metadata를 보고 a의 metadata 가져옴
  3. a의 content 위치를 알면 b의 metadata 가져옴
  4. 시스템 콜한 프로세스는 b를 가리키는 pointer를 **file descriptor**로 PCB에 저장
  5. 이 위치로 파일 read 가능

![open() 호출 시 metadata 흐름](images/file-system-01.webp)

- I/O 작업이므로 OS가 메모리에 먼저 읽고 copy를 process에 줌. 동일 위치 시스템 콜 시 저장된 것을 재사용 → **Buffer caching**
- 모든 정보를 OS가 알기 때문에 LRU 같은 알고리즘 사용 가능
- Process A의 PCB가 저장하는 Descriptor → **per-process file descriptor table**
- Open file table → **system-wide open file table**
- metadata가 메모리에 올라오면 프로세스마다 필요한 metadata가 있고 이 정보를 offset으로 저장

## 2. File Protection

각 파일에 대해 누구에게 어떤 유형의 접근(read/write/execution)을 허락할 것인가?

### 2.1 Access Control 방법

- 접근 권한자 + 가능한 연산을 정의해야 함

#### Access Control Matrix

- 행렬로 file × user 권한 정의
- **Access Control List**: 파일별로 누구에게 어떤 권한
- **Capability**: 사용자별로 자신이 접근 권한을 가진 파일·권한 표시
- 일반적으로 overhead가 너무 커서 사용하기 힘듦

#### Grouping

- 전체 user를 **owner / group / public** 3그룹으로 구분
- 각 파일에 대해 세 그룹의 접근 권한(rwx)을 3 bit씩 표시 → 9 bit

![Grouping 방식 권한 표기](images/file-system-02.webp)

#### Password

- 파일마다 password를 두는 방법 (디렉토리에도 가능)
- 모든 접근 권한에 하나의 password: all-or-nothing
- 접근 권한별 password: 관리 문제

## 3. File System의 Mounting

- 한 file system이 다른 partition의 file system에 접근해야 하는 경우 **Mounting** 연산
- 한쪽 file system의 root를 mount해 서로 연결

## 4. Access Methods

시스템이 제공하는 파일 접근 방식.

| 방식 | 설명 |
|---|---|
| **Sequential Access** | 카세트 테이프처럼 A → B → C 순서 접근. A → C 바로 못 감 |
| **Direct Access** (Random Access) | LP 레코드처럼 임의 순서로 접근 가능. 파일 관리 방식에 따라 순차 접근만 되는 경우도 있음 |

## 5. Allocation of File Data in Disk

Disk에 파일을 저장할 때 sector 단위로 저장.

### 5.1 Contiguous Allocation (연속 할당)

- 하나의 파일을 disk에 연속으로 할당
- **단점**
  - External fragmentation
  - File grow가 어려움 (생성 시 얼마나 큰 hole을 배당할지 — grow 가능 vs 낭비)
- **장점**
  - 빠른 I/O (시작 위치만 seek하면 많은 byte transfer 가능)
  - Realtime file용, 또는 이미 run 중인 process의 swapping용 (속도 효율 중요)
  - **Direct access 가능**

### 5.2 Linked Allocation

- 파일 데이터를 빈 공간에 위치
- **장점**: External fragmentation 없음
- **단점**
  - 디스크 head가 매번 이동해야 함
  - **Reliability**: 한 sector가 고장나 pointer 유실되면 많은 부분 잃음
  - pointer를 위한 공간이 block의 일부가 되어 공간 효율성 저하 (512 byte 단위 저장에 4 byte pointer)
- **변형**: **FAT** (File Allocation Table) 파일 시스템 — 포인터를 별도 위치에 보관해 reliability·공간 효율 문제 해결

### 5.3 Indexed Allocation

- block 중 **index block**을 두고 할당된 파일 정보 저장
- **장점**: External fragmentation 없음. **직접 접근 가능**
- **단점**
  - small file은 공간 낭비 (실제로 많은 파일이 small)
  - 매우 큰 파일은 한 block의 index로 표현 불가 → **multilevel index** (2단계 page table 비유) 또는 **linked scheme** 사용

## 6. UNIX 파일 시스템 구조

![UNIX File System](images/file-system-03.webp)

- 하나의 Partition 존재. 크게 4가지로 구성

| 구역 | 설명 |
|---|---|
| **Boot block** | 어떤 파일 시스템이라도 가장 먼저. 메모리에 항상 0번을 올리기 때문. 부팅에 필요한 정보 (bootstrap loader) |
| **Super block** | 파일 시스템에 관한 총체적 정보 (어디가 빈 블록인지, 어디에 파일이 사용 중인지) |
| **Inode list** | 파일 하나당 inode 하나. metadata 보유 (파일 이름은 제외) |
| **Data block** | 실제 데이터 |

### 6.1 Inode

- 실제 directory에는 모든 metadata가 있지 않음. inode가 metadata를 가짐
- **파일 이름은 directory가 직접 가지고 있고**, 파일에 대한 inode 번호를 가짐
- 파일 위치 정보는 indirect로 표현 (single, double, triple). 파일이 클수록 단계가 깊음

## 7. FAT File System

![FAT File System](images/file-system-04.webp)

- **FAT**: 위치 정보만 FAT이 가지고 나머지 metadata는 directory 파일이 가짐
- FAT 배열에 디스크가 관리하는 block 수만큼 entry 존재. 각 block은 다음 block 번호를 가리킴 (linked list 형태)
- 예: 217 → FAT의 217번째 entry → 618 → 다음 block 확인
- **직접 접근 가능**
- Linked allocation의 단점을 모두 극복

> 실제로는 매우 많은 파일 시스템이 존재.

## 8. Free-Space Management

비어 있는 block을 관리하는 방법.

| 방법 | 설명 |
|---|---|
| **Bit map / Bit vector** | 각 block별 번호. UNIX는 Super block에 첫 block부터 사용 여부를 bit로 표시 |
| **Linked Free Space List on Disk** | 비어 있는 첫 위치만 pointer로 가지고, 그 block에 다음 빈 공간 표시. 공간 낭비는 없지만 연속 가용 공간 찾기 어려움 |
| **Grouping** | linked list 변형. 첫 free block이 n개 pointer 보유. n-1 pointer는 free data block, 마지막 pointer는 또 다른 n pointer block |
| **Counting** | 프로그램이 종종 연속된 block을 할당·반납하는 성질에 착안. 빈 block 위치 + 연속 개수 정보 보유 |

## 9. Directory Implementation

| 방식 | 설명 |
|---|---|
| **Linear List** | file 이름과 metadata를 list로 구성 (크기 고정). 구현 간단. 디렉토리 내 파일 찾기 위해 linear search 필요 |
| **Hash Table** | linear list + hashing. file name을 hash로 변환해 linear list 위치로 매핑. **Collision** 발생 가능 |

### 9.1 Long File Name 지원

- 긴 이름의 파일은 길이를 한정하고 앞부분 저장
- entry를 벗어나면 맨 끝은 pointer로 저장

## 10. VFS, NFS

| 약어 | 정의 |
|---|---|
| **VFS** (Virtual File System) | 다양한 파일 시스템에 대해 동일한 시스템 콜 인터페이스(API)로 접근하게 해주는 OS layer |
| **NFS** (Network File System) | 분산 환경의 대표적 파일 공유 방법 |

![VFS와 NFS 구조](images/file-system-05.webp)

## 11. Page Cache and Buffer Cache

### 11.1 Page Cache

- Virtual memory의 paging system에서 사용하는 page frame을 caching 관점에서 표현한 용어
- **Memory-Mapped I/O**를 쓰는 경우 file의 I/O에서도 page cache 사용

### 11.2 Memory-Mapped I/O

- File의 일부를 virtual memory에 mapping
- 매핑된 영역에 대한 메모리 접근 연산은 파일의 입출력을 수행

### 11.3 Buffer Cache

- 파일 시스템을 통한 I/O 연산은 메모리의 특정 영역인 buffer cache 사용
- File 사용의 locality 활용
- LRU·LFU 등 알고리즘 사용 가능

### 11.4 Unified Buffer Cache

- 최근 OS에서는 기존 buffer cache가 page cache에 통합됨

![Unified Buffer Cache](images/file-system-06.webp)
