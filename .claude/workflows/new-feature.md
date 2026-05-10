# 워크플로우: 새 기능 추가

> 트리거: `/feature` 슬래시 커맨드 또는 "X 기능 추가해줘"

## 목적
일관된 품질로 새 기능을 추가하기 위한 표준 워크플로우.

## 흐름도

```
[요구사항 분석]
      ↓
┌─────┴─────┐
↓           ↓
Explore   db-architect    (병렬 - Phase 1)
└─────┬─────┘
      ↓
ui-designer                (Phase 2)
      ↓
┌─────┼─────┐
↓     ↓     ↓
code  sec   seo            (병렬 - Phase 3)
└─────┼─────┘
      ↓ (통과 시)
test-writer                (Phase 4)
      ↓
docs-writer                (Phase 5)
      ↓
[완성 보고]
```

## 단계별 책임

### Phase 1: 분석 (병렬)
| 에이전트 | 책임 |
|---------|------|
| Explore | 기존 코드/패턴 검색, 재사용 가능 컴포넌트 발견 |
| db-architect | 데이터 요구사항 분석, 스키마/RLS 설계 |

### Phase 2: 구현
| 에이전트 | 책임 |
|---------|------|
| ui-designer | UI 컴포넌트 작성, 반응형, 접근성 |

### Phase 3: 검증 (병렬)
| 에이전트 | 책임 |
|---------|------|
| code-reviewer | 코드 품질 게이트 |
| security-auditor | 보안 게이트 |
| seo-optimizer | SEO 게이트 (페이지 추가 시) |

### Phase 4: 테스트
| 에이전트 | 책임 |
|---------|------|
| test-writer | Happy/Edge/Error 케이스 |

### Phase 5: 문서화 (⚠️ 필수, 누락 시 워크플로우 미완료)
| 에이전트 | 책임 |
|---------|------|
| docs-writer | **docs/system/* 동기화 (최우선)** + 아키텍처/컨벤션/트러블슈팅 갱신 |

**docs/system 갱신 매핑** (변경 종류에 따라):
- 새 페이지 → `docs/system/pages.md`
- 새 컴포넌트 → `docs/system/components.md`
- DB/Server Action 변경 → `docs/system/data-flow.md`
- 외부 서비스/환경변수 → `docs/system/integrations.md`
- 큰 구조 변경 → `docs/system/overview.md`

## 종료 조건
- 모든 검증 에이전트 🟢 통과
- 빌드 성공 (`npm run build`)
- 테스트 작성 및 실행 통과
- 문서 갱신 완료

## 실패 시 대응
- 검증 실패 → 해당 영역 에이전트로 다시 수정
- 3회 이상 실패 → 사용자에게 재설계 요청
