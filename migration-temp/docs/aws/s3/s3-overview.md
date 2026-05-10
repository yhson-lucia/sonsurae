---
title: S3
slug: s3-overview
category: aws/s3
summary: AWS S3 객체 스토리지의 Bucket 개념, 암호화, 접근 제어, 파일 공유, 리전 복제 정리
tags: [aws, s3, storage, bucket, encryption, presigned-url]
sort_order: 1
created: 2025-01-31
updated: 2026-05-10
---

## 1. AWS S3 (Simple Storage Service)

- AWS에서 제공하는 **객체 스토리지** 서비스
- 파일 설치는 불가능하고, 순수하게 파일 저장 용도로 사용

## 2. Bucket

S3는 **Bucket** 개념을 사용해 데이터를 구성. 파일 시스템의 디렉토리와 유사하지만 차이가 있음.

| 특징 | 설명 |
|---|---|
| 이름 유일성 | 글로벌하게 유일한 이름 필요 |
| 웹 호스팅 | 도메인과 버킷명이 동일해야 함 |
| 리전 | 특정 리전에 생성됨 |

## 3. 데이터 암호화

S3는 두 가지 시점에서 암호화를 지원함.

- **전송 중 암호화 (in transit)**: SSL/TLS(HTTPS) 사용
- **저장 시 암호화 (at rest)**
  - **SSE-S3**: S3가 관리하는 키로 암호화
  - **SSE-KMS**: AWS KMS 서비스로 암호화
  - **SSE-C**: 클라이언트가 제공한 키로 암호화

## 4. 접근 제어

S3는 여러 수준의 접근 제어를 제공함.

- **Bucket Policy**
  - 버킷 단위 적용
  - JSON 형식으로 작성
  - 상세한 권한 제어 가능
- **ACL (Access Control List)**
  - 파일 단위 적용
  - 개별 객체 단위의 접근 제어
- **Access Log**: 모든 접근 기록을 저장 가능
- **MFA를 활용한 삭제 방지** 기능 제공

## 5. 파일 공유 방식

S3 파일을 공유하는 방법은 3가지.

### 5.1 모든 파일을 public으로 설정

- 장점: 별도 관리 불필요
- 단점: 누구나 파일 다운로드 가능

### 5.2 IAM 자격증명 공유 (Access Key Pair)

- 장점: 지정한 사람만 공유 가능
- 단점
  - 자격증명 유출/변경 시 모든 공유자에게 다시 부여해야 함
  - 자격증명 관리가 어려움

### 5.3 PreSigned URL

- 관리자가 권한을 담은 URL을 생성해 전달
- 생성자의 권한으로 파일에 접근 가능한 **임시 URL**
- 장점
  - 지정한 사람만 공유 가능
  - 만료 기간 설정 가능
  - HTTP를 통한 간편한 접근
  - 세밀한 권한 제어 가능

응답 예시 (핵심 필드만)

```http
HTTP/1.1 200
Content-Type: application/json

{
  "preSignedUrl": "https://...",
  "fileUrl": "...test.png",
  "metadata": {},
  "resizedUrl": []
}
```

## 6. Cross Region Replication

- S3 데이터를 다른 Region으로 복제
- 제약
  - **다른 Region**으로만 복제 가능 (예: 서울 → 미국). 동일 Region 복제 불가
  - 원본·대상 모두 **버전 관리 활성화** 필요
  - 복제 기능 활성화 **이전의 데이터는 복제되지 않음**
  - **버전 삭제, 파일 삭제는 복제되지 않음**
