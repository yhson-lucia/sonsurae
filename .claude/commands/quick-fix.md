---
description: 빠른 버그 수정 (분석 → 수정 → 검증 → 회귀 테스트)
argument-hint: <버그 설명 또는 에러 메시지>
---

# 🐛 빠른 버그 수정

다음 버그를 수정합니다: **$ARGUMENTS**

## 작업 순서

### 1. 원인 분석
**Explore agent**로 관련 코드 파악:
- 에러 메시지 또는 증상에서 관련 파일 검색
- 호출 스택 추적
- 최근 변경 이력 확인 (`git log`)

### 2. 근본 원인 식별
- 표면 증상이 아닌 **근본 원인** 찾기
- 같은 패턴의 다른 버그 가능성 확인
- 재현 시나리오 정리

### 3. 수정
직접 수정 또는 적절한 에이전트 호출:
- UI 버그 → **ui-designer agent**
- DB/권한 버그 → **db-architect agent**
- 그 외 → 직접 수정

### 4. 검증 (병렬)
- **code-reviewer agent**: 수정 코드 품질
- **security-auditor agent**: 보안 영향 (인증/권한 관련 시)

### 5. 회귀 테스트 (⚠️ 필수)
**test-writer agent** 호출:
- **같은 버그가 재발하지 않도록 테스트 추가** (필수)
- 엣지 케이스 포함
- 수정 전 코드로 테스트 → 실패 확인 (선택)
- 수정 후 코드로 테스트 → 통과 확인
- `npm test` 모두 통과해야 commit 진행

### 6. 문서화 (⚠️ 필수)
**docs-writer agent** 호출:

**docs/system 동기화 (수정된 파일별)**:
- 컴포넌트 수정 → `docs/system/components.md`
- 페이지 수정 → `docs/system/pages.md`
- DB/Server Action 수정 → `docs/system/data-flow.md`
- 외부 서비스 수정 → `docs/system/integrations.md`

**트러블슈팅 사례 추가**:
- `docs/troubleshooting/`에 사례 정리
- 증상, 원인, 해결, 학습 포인트
- 같은 패턴 재발 방지를 위한 컨벤션 권고

## 출력 형식

```markdown
## 🐛 버그 수정 완료

### 🔍 원인 분석
- 증상: [관찰된 문제]
- 근본 원인: [실제 원인]
- 영향 범위: [영향받은 코드/사용자]

### 🔧 수정 내용
- 파일: file:line
- Before:
  \`\`\`typescript
  [기존 코드]
  \`\`\`
- After:
  \`\`\`typescript
  [수정 코드]
  \`\`\`

### 🧪 회귀 테스트
- [추가된 테스트]

### 📝 문서화
- docs/troubleshooting/[issue].md

### 💡 예방 조치
- [같은 유형 버그 예방 방법]
```

## 주의사항
- "동작하면 OK" 식의 임시 패치 금지 (근본 원인 수정)
- 비슷한 패턴의 다른 코드도 점검
- 테스트 추가 필수 (재발 방지)
