---
description: 새 기능 추가 풀 워크플로우 (DB → UI → 검증 → 테스트 → 문서)
argument-hint: <기능명> [상세 설명]
---

# 🚀 새 기능 추가 풀 워크플로우

다음 기능을 손수레(Sonsurae) 프로젝트에 추가합니다: **$ARGUMENTS**

## 작업 순서

이 워크플로우는 멀티 에이전트를 순차/병렬로 호출하여 완성도 높은 기능을 만듭니다.

### Phase 1: 분석 및 설계 (병렬)
다음 두 에이전트를 **병렬로 호출**하세요:

1. **Explore agent** 사용하여 관련 기존 코드 파악
   - 비슷한 기능이 이미 있는지 검색
   - 재사용 가능한 컴포넌트/유틸 발견
   - 영향 범위 분석

2. **db-architect agent** 사용하여 데이터 요구사항 분석
   - 새 테이블 필요 여부
   - 기존 테이블 수정 필요 여부
   - RLS Policy 설계
   - GRANT 권한 설계
   - 마이그레이션 SQL 작성

### Phase 2: 구현
1. **db-architect agent**가 제공한 SQL이 있으면 사용자에게 실행 요청 (Supabase SQL Editor)
2. **ui-designer agent** 호출하여 UI 컴포넌트 구현
   - Server/Client Component 적절히 분리
   - Tailwind CSS로 반응형 디자인
   - 접근성(a11y) 고려
   - 손수레 학습 블로그 톤 유지 (slate 본문 + emerald 강조, 가독성 우선)

### Phase 3: 검증 (병렬)
다음 에이전트들을 **모두 병렬로 호출**하여 검증:

1. **code-reviewer agent**: 코드 품질, 컨벤션, 가독성
2. **security-auditor agent**: 보안 취약점, RLS 검증
3. **seo-optimizer agent**: 메타태그, 시맨틱 HTML, 구조화 데이터 (페이지 추가 시)

검증에서 Critical 이슈 발견 시:
- ui-designer를 다시 호출하여 수정
- 모든 검증 통과할 때까지 반복

### Phase 4: 테스트 (⚠️ 필수, 누락 시 워크플로우 미완료)
**test-writer agent** 호출하여 테스트 코드 작성:
- 정상 흐름 (Happy Path)
- 엣지 케이스 (빈값, 경계값, 특수문자)
- 에러 케이스 (DB 실패, 입력 검증 실패)
- 보안 케이스 (변조 입력, 권한 우회 시도)

**테스트 의무 영역**:
- Server Action (`actions.ts`) → 입력 검증 + DB 흐름
- `src/lib/**` 단위 함수 → 모든 export
- 인증/인가 → 추가로 통합 테스트 (가능하면 E2E)

**검증**: `npm test` 모두 통과해야 Phase 5로 진행

### Phase 5: 문서화 (⚠️ 필수)
**docs-writer agent** 호출하여 관련 문서 갱신.

**최우선: `docs/system/*` 동기화** (maintainer 에이전트가 이걸 참고하므로 outdated 금지)
- 새 페이지 추가 시 → `docs/system/pages.md`
- 새 컴포넌트 추가 시 → `docs/system/components.md`
- DB/Server Action 변경 시 → `docs/system/data-flow.md`
- 외부 서비스 추가 시 → `docs/system/integrations.md`
- 큰 구조 변경 시 → `docs/system/overview.md`

추가:
- 아키텍처 영향 시 → docs/architecture/
- 새 컨벤션 추가 시 → docs/conventions/
- 트러블슈팅 발생 시 → docs/troubleshooting/

**이 단계 누락 시 워크플로우 미완료로 간주.**

## 최종 보고 형식

모든 단계 완료 후 사용자에게 다음 형식으로 보고:

```markdown
## ✅ "$ARGUMENTS" 기능 구현 완료

### 📦 생성/수정된 파일
- src/app/...
- src/components/...

### 🗄 DB 변경사항 (있다면)
- [SQL 또는 변경 내역]

### 🔍 검증 결과
- code-reviewer: 🟢 통과 / 🟡 경미한 개선 / 🔴 재작업
- security-auditor: 🟢 / 🟡 / 🔴
- seo-optimizer: 🟢 / 🟡 / 🔴

### 🧪 추가된 테스트
- [테스트 파일들]

### 📝 갱신된 문서
- [문서 파일들]

### 💡 다음 단계 추천
- [후속 작업 제안]
```

## 주의사항

- 사용자가 프론트엔드 초보자임을 고려하여 자세한 설명 포함
- 각 에이전트 호출 결과를 통합하여 일관된 코드 생성
- 에이전트 간 충돌 발견 시 사용자에게 확인 요청
- DB 변경은 **반드시 사용자 승인** 후 진행
