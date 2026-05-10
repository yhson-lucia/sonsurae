---
title: 운영환경
slug: production-environment
category: docker
summary: AWS EC2/Elastic Beanstalk과 Nginx의 역할. 개발 서버와 운영 서버를 다르게 쓰는 이유
tags: [aws, ec2, elastic-beanstalk, nginx, production, deployment]
sort_order: null
created: 2025-01-19
updated: 2026-05-10
---

## 1. AWS 서비스

### 1.1 EC2 (Elastic Compute Cloud)

- AWS 클라우드에서 확장 가능한 컴퓨팅을 제공
- 하드웨어에 선투자 없이 빠르게 애플리케이션을 개발·배포 가능
- 원하는 만큼 가상 서버를 구축하고 보안·네트워크 구성, 스토리지 관리 가능
- 요구 사항이나 갑작스러운 트래픽 증가 등 변동에 따라 신속하게 규모 확장/축소 가능
- 쉽게 말해 **컴퓨터 한 대를 임대**하는 개념. OS와 웹 서버, DB 등을 직접 설치해서 사용
- 1대의 컴퓨터 = 1개의 EC2 인스턴스

### 1.2 EB (Elastic Beanstalk)

- Apache, Nginx 같은 친숙한 서버에서 Java, .NET, PHP, Node.js, Python, Ruby, Go, Docker로 개발된 웹 애플리케이션을 **배포·확장하기 쉬운 서비스**
- EC2 인스턴스, DB 등 많은 것을 포함한 환경을 구성. 소프트웨어 업데이트마다 자동으로 환경을 관리

![AWS Elastic Beanstalk 환경 구성](images/production-environment-01.webp)

## 2. Nginx

개발 환경과 운영 환경에서 프로그램이 실행되는 과정이 다름.

- **리액트 개발 단계**

  ![React 개발 단계](images/production-environment-02.webp)

- **리액트 운영 단계**

  ![React 운영 단계](images/production-environment-03.webp)

- 운영 단계에서는 **개발 서버가 사라짐**
- 그러면 정적 파일을 제공할 수 없는데, 이 역할을 하는 것이 **Nginx**

### 2.1 왜 개발 서버와 운영 서버를 다르게 쓰나?

- 개발 서버: 소스를 변경하면 자동으로 전체 앱을 재빌드해 변경 소스를 반영하는 등 **개발 환경에 특화된 기능**이 있음. Nginx보다 적합
- 운영 환경: 소스 변경 반영 같은 개발 기능이 불필요. **더 깔끔하고 빠른 Nginx**를 웹 서버로 사용
