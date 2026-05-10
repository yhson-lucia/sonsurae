---
description: 새 재사용 컴포넌트 생성
argument-hint: <컴포넌트명> [위치: ui|layout|product]
---

# 🧩 새 컴포넌트 생성

다음 컴포넌트를 생성합니다: **$ARGUMENTS**

## 위치 결정 가이드

| 위치 | 용도 | 예시 |
|------|------|------|
| `src/components/ui/` | 재사용 가능한 작은 부품 | Button, Input, Card |
| `src/components/layout/` | 페이지 레이아웃 | Header, Footer, Nav |
| `src/components/product/` | 도메인 특화 | ProductCard, ProductGallery |

## 작업 순서

### 1. 기존 컴포넌트 검토
**Explore agent**로 비슷한 컴포넌트 검색
- 중복 방지
- 재사용 가능한 기존 부품 발견

### 2. 컴포넌트 구현
**ui-designer agent** 호출:
- PascalCase 파일명 (예: `ProductCard.tsx`)
- 기본 Server Component
- Props 타입 명시 (TypeScript)
- Tailwind CSS 스타일링
- 접근성 고려

### 3. 타입 정의
필요 시 `src/types/`에 타입 추가

### 4. 사용 예시 제공
컴포넌트 import/사용 방법 코드 예시

### 5. 검증
**code-reviewer agent**: 
- Props 타입 적절성
- 재사용성
- 접근성
- 성능 (불필요한 re-render)

### 5-1. 테스트 작성 (⚠️ 필수)
**test-writer agent** 호출:
- 인터랙션 컴포넌트 (Form, Button 등) → 통합 테스트 의무
- 순수 표시 컴포넌트 (텍스트만) → 면제 가능
- props 검증, 사용자 이벤트, 상태 변경 등
- `npm test` 통과 확인

### 6. 문서 동기화 (⚠️ 필수)
**docs-writer agent** 호출:
- `docs/system/components.md`에 새 컴포넌트 항목 추가
  - 카탈로그 표 행 추가 (컴포넌트명/타입/위치/사용처/책임)
  - 도메인별 섹션에 상세 설명
- 사용 페이지의 `docs/system/pages.md` 의존성 갱신
- 새 타입 정의 시 `docs/system/data-flow.md` 타입 섹션도 갱신

## 출력
- 생성된 파일 경로
- Props 인터페이스
- 사용 예시 코드
- 디자인 변경 가이드

## 주의사항
- 클라이언트 인터랙션 필요 시에만 `'use client'`
- 너무 큰 컴포넌트는 분리 권장
- 도메인 종속 컴포넌트는 ui/에 두지 말 것
