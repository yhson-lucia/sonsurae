---
description: 새 페이지 생성 (라우트 + 메타데이터 + SEO)
argument-hint: <페이지 경로> [예: products, about, contact]
---

# 📄 새 페이지 생성

다음 페이지를 Next.js App Router로 생성합니다: **$ARGUMENTS**

## 작업 순서

### 1. 기존 구조 확인
**Explore agent**로 `src/app/` 구조 파악
- 기존 페이지 패턴 분석
- 공통 레이아웃 사용 여부 확인

### 2. UI 구현
**ui-designer agent** 호출:
- `src/app/$ARGUMENTS/page.tsx` 생성
- Server Component 기본
- Tailwind CSS 사용
- 접근성 고려 (시맨틱 HTML)

### 3. SEO 메타데이터
**seo-optimizer agent** 호출:
- `metadata` export 추가 (title, description)
- Open Graph 태그
- 구조화 데이터 (필요 시 JSON-LD)
- 페이지 유형에 맞는 schema.org 타입

### 4. 검증 (병렬)
- **code-reviewer**: 코드 품질
- **security-auditor**: 데이터 노출 검증

### 5. sitemap.xml 갱신 검토
필요 시 `src/app/sitemap.ts`에 새 페이지 추가

### 5-1. 테스트 작성 (⚠️ 필수)
**test-writer agent** 호출:
- Server Action 있다면 → 입력 검증 + DB 흐름 테스트
- 정적 페이지면 → 컴포넌트 렌더링 테스트 (선택)
- `npm test` 통과 확인

### 6. 문서 동기화 (⚠️ 필수)
**docs-writer agent** 호출:
- `docs/system/pages.md`에 새 페이지 항목 추가 (URL/타입/h1/메타/의존)
- 의존 컴포넌트 신규일 시 `docs/system/components.md`도 갱신
- Header NAV_ITEMS 갱신 시 → 메뉴 구조 반영
- 메뉴 추가 시 → Footer 링크 일관성 확인

## 출력
- 생성된 파일 경로
- 접속 URL: `http://localhost:3000/$ARGUMENTS`
- 메타데이터 요약
- 추가 권장 작업

## 주의사항
- 동적 라우트(`[id]`)인 경우 generateMetadata 함수 사용
- 인증 필요 페이지는 middleware 확인
