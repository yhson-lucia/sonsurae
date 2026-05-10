---
title: S3 Batch Operation
slug: s3-batch-operation
category: aws/s3
summary: S3 Batch Operations의 인벤토리 보고서, Manifest, Batch Action, IAM, S3 Control Client 정리
tags: [aws, s3, batch, automation, manifest]
sort_order: 2
created: 2025-01-31
updated: 2026-05-10
---

## 1. 개요

- S3는 수백만~수십억 개의 객체를 일상적으로 저장하면서 확장성, 내구성, 낮은 비용, 보안, 다양한 스토리지 옵션을 제공
- 이러한 대규모 객체를 관리하기 위한 기능이 **S3 Batch Operations**

## 2. 인벤토리 보고서

- S3 버킷 내의 모든 객체 목록과 메타데이터를 포함하는 보고서
- 일별/주별 주기로 인벤토리 실행 시 생성
- 모든 객체를 포함하거나, 설정에 따라 일부 정보만 보여주도록 구성 가능
- 출력 포맷: CSV, ORC, Parquet

### 2.1 메타데이터 필드

| 구분 | 필드 |
|---|---|
| 필수 | Bucket name, Object key, Size, Last modified date |
| 선택 | ETag, Storage class, Encryption status, Replication status, Object lock retention, Object version ID, Object ACL status, Multipart upload flag |

### 2.2 설정

```yaml
인벤토리 설정:
  대상 버킷: [소스 버킷 이름]
  보고서 저장 위치: [대상 버킷 경로]
  빈도: [매일 / 매주]
  포맷: [CSV / ORC / Parquet]
  상태: [활성화 / 비활성화]
  필드 선택:
    - [위의 메타데이터 필드들 중 선택]
  옵션:
    - 버전 관리된 객체 포함
    - 접두사 필터링
```

### 2.3 출력 예시

```csv
bucket,key,size,last_modified_date,storage_class
example-bucket,photos/2024/01/image1.jpg,1048576,2024-01-31T10:00:00Z,STANDARD
example-bucket,documents/report.pdf,2097152,2024-01-30T15:30:00Z,STANDARD_IA
```

이 보고서를 코드에서 활용하는 예시.

```kotlin
class S3InventoryProcessor {
    fun readInventoryReport(reportPath: String): List<S3Object> {
        return when (val format = getReportFormat(reportPath)) {
            Format.CSV -> processCsvReport(reportPath)
            Format.ORC -> processOrcReport(reportPath)
            Format.PARQUET -> processParquetReport(reportPath)
            else -> throw IllegalArgumentException("지원되지 않는 형식: $format")
        }
    }
}
```

## 3. Manifest

- 배치 작업에서 처리할 객체를 식별하는 목록 파일 (인벤토리 보고서 또는 직접 작성한 CSV/JSON)
- CSV 또는 JSON 형식으로 작성. **반드시 S3에 저장되어야 함**

### 3.1 형식 예시

CSV

```csv
Bucket,Key
example-bucket,photos/photo1.jpg
example-bucket,documents/doc1.pdf
```

JSON

```json
{
  "Bucket": "example-bucket",
  "Key": "photos/photo1.jpg"
}
```

### 3.2 생성 방법

**S3 인벤토리 사용**

```yaml
S3 Inventory 설정:
  Output format: CSV
  Fields:
    - Bucket
    - Key
    - Size
    - LastModifiedDate
  Destination: s3://inventory-bucket/
```

**직접 생성**

```kotlin
fun createManifest(filesToProcess: List<S3Object>): String {
    return buildString {
        appendLine("Bucket,Key")
        filesToProcess.forEach { file ->
            appendLine("${file.bucket},${file.key}")
        }
    }
}
```

### 3.3 사용 시 고려 사항

- 파일 크기 제한 확인
- 객체 수 제한 확인
- 에러 처리를 위한 보고서 설정
- Manifest 파일의 버전 관리
- 보안을 위한 암호화 설정

## 4. Batch Action과 Task

S3 Batch Operations 작업을 생성하는 방법은 4가지.

| 방법 | 특징 | 적합 상황 |
|---|---|---|
| **S3 콘솔** | 웹 인터페이스로 직접 생성. 가장 직관적 | 작은 규모/테스트 |
| **AWS CLI** | 명령줄로 생성. 스크립트 자동화 가능 | 반복 작업 |
| **AWS SDK for Java** | 코드로 프로그래밍 방식 생성. 앱에 통합 가능 | 복잡한 로직 |
| **REST API** | HTTP 요청으로 직접 호출 (`CreateJob`) | 언어 비종속 |

### 4.1 동작 흐름

`Batch Action` → `Manifest의 객체` → `개별 Task 생성` 순으로 처리됨.

예: DELETE 배치 액션 선택, 매니페스트에 3개 객체가 있는 경우

```
매니페스트:
  - object1.jpg
  - object2.jpg
  - object3.jpg

생성되는 태스크:
  ✓ Task1: DELETE object1.jpg
  ✓ Task2: DELETE object2.jpg
  ✓ Task3: DELETE object3.jpg
```

### 4.2 Task 처리

```kotlin
class BatchTask(
    val taskId: String,                              // 태스크 고유 식별자
    val objectKey: String,                           // 대상 객체
    val action: BatchAction,                         // 수행할 작업
    val status: TaskStatus = TaskStatus.PENDING,     // 기본값 PENDING
    val result: TaskResult? = null                   // nullable, 기본값 null
)

enum class TaskStatus {
    PENDING,        // 대기 중
    IN_PROGRESS,    // 실행 중
    COMPLETED,      // 완료
    FAILED          // 실패
}
```

전체 흐름: `Batch Action 생성 → Manifest 읽기 → 객체별 Task 생성 → Task 병렬 실행 → 결과 집계 및 보고`

### 4.3 Task 모니터링

```json
{
  "jobId": "job123",
  "tasksCompleted": 50,
  "tasksFailed": 2,
  "tasksSucceeded": 48,
  "taskProgress": {
    "numberOfTasksInProgress": 10,
    "numberOfTasksRemaining": 40
  }
}
```

각 Task는 **독립적**으로 실행됨. 하나의 Task 실패가 다른 Task에 영향을 주지 않으므로 대규모 작업의 안정성과 신뢰성을 보장함.

## 5. S3에서의 IAM (Identity and Access Management)

- AWS 서비스에서 사용자에게 임시로 권한을 부여하는 자격 증명
- S3 파일 업로드/접근에서도 사용 가능하지만, 일반적인 파일 공유는 주로 PreSigned URL 사용
- S3 Batch 작업에서는 IAM이 작업 실행 권한을 부여

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:PutObject"
      ],
      "Resource": [
        "arn:aws:s3:::source-bucket/*",
        "arn:aws:s3:::destination-bucket/*"
      ]
    }
  ]
}
```

## 6. S3 Control Client

### 6.1 S3Client (일반)

- 일반적인 S3 작업 수행
  - 객체 업로드/다운로드
  - 버킷 생성/삭제
  - 객체 메타데이터 관리
- 개별 객체나 버킷 단위 작업

### 6.2 S3ControlClient (대규모/제어)

- 대규모 S3 작업 관리
  - **Batch Operations** 생성/관리
  - 다수의 객체에 대한 일괄 작업
  - 액세스 포인트 관리
- 계정 수준의 S3 설정
- 대규모 데이터 처리 작업

### 6.3 사용 예시

```kotlin
// 일반 S3 작업
val s3Client = S3Client.builder().build()
s3Client.putObject()  // 단일 객체 업로드

// 배치 작업
val s3ControlClient = S3ControlClient.builder().build()
s3ControlClient.createJob()  // 배치 작업 생성
```
