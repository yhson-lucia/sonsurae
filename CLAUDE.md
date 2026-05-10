@AGENTS.md

# 손수레 (Sonsurae)

> 개인 학습 아카이브 블로그. 개발/AI 주제를 정리하고, 다시 공부하기 좋도록 모바일·웹 어디서나 접근.

## 프로젝트 개요
공개 학습 블로그 + 계층적 지식그래프. 글마다 하나의 개념/주제를 다루며, 상위·하위·관련 개념으로 연결된다. 메인은 시간순 피드, 별도 `/graph` 페이지에서 전체 지식 네트워크를 시각화한다.

### 핵심 컨셉
- **메인 뷰**: 최신 글 시간순 피드 (블로그 형태)
- **글 = 개념**: 한 글이 한 주제/개념을 다룸
- **계층**: `parent_post_id`로 상위 → 하위 개념 트리
- **관련 링크**: `post_links` 테이블로 옆방향 관계 (M:N)
- **그래프 뷰**: `/graph` 페이지에서 전체 네트워크 시각화
- **공개 읽기 / 본인만 쓰기**: 누구나 읽을 수 있고, 글 작성은 작성자만

## 기술 스택
- **Framework**: Next.js 16 App Router, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (Postgres)
- **Auth**: Supabase Auth (단일 사용자, public read / owner write)
- **Storage**: Supabase Storage (이미지 자산)
- **Deployment**: Vercel
- **Package Manager**: (확정 전 — npm 기본)

## 폴더 구조
```
Sonsurae/
├── .claude/                  # Harness Engineering 설정 (8 agents + 6 commands + 3 workflows)
├── docs/
│   ├── system/               # 시스템 문서 (작성 예정)
│   └── troubleshooting/      # 트러블슈팅 사례
├── src/
│   ├── app/                  # Next.js App Router (페이지, layout)
│   ├── components/           # 재사용 컴포넌트
│   ├── lib/                  # 비즈니스 로직, Supabase 클라이언트
│   └── types/                # 타입 정의
├── supabase/
│   ├── migrations/           # SQL 마이그레이션
│   └── seed.sql
├── scripts/
│   └── migrate-from-my-website.ts  # 기존 110개 md → Supabase 임포트
├── CLAUDE.md
└── README.md
```

## 데이터 모델 개요 (db-architect로 확정 예정)
```
categories     — 최상위 분류 (AI, FE, Spring 등)
posts          — 글 = 개념. parent_post_id (self-ref) + category_id
post_links     — M:N 관련 링크 (from_post_id, to_post_id, relation_type)
images         — Storage 메타데이터 (post_id, storage_path, alt)
profiles       — 작성자 (단일 사용자)
```

## 코딩 컨벤션
- 컴포넌트: PascalCase (`PostCard.tsx`)
- 함수/변수: camelCase
- 타입/인터페이스: PascalCase
- DB 컬럼: snake_case (Postgres 관례)
- 슬러그: 한글 → 영문 음역 또는 영문 키워드 매핑 + kebab-case

## 작업자 정보
- 프론트엔드 입문자 (개발자 백그라운드 있음, Next.js/React는 익히는 중)
- "왜 이렇게 하는지"를 설명해주는 걸 선호 (단순 코드 제공 X)
- 마크다운/git 친숙

## 명령어
- 개발 서버: `npm run dev`
- 빌드: `npm run build`
- 테스트: `npm test` (Vitest 예정)
- 린트: `npm run lint`
- Supabase 로컬: `npx supabase start`
- 마이그레이션 임포트: `npm run migrate:from-my-website`

## 기존 자산 마이그레이션 메모
- 출처: `/Users/hwang-yejun/Desktop/WB/my-website/` (Docusaurus)
- 110개 md/mdx + 150개 이미지
- Frontmatter: `title`, `sidebar_position` → `posts.title`, `posts.sort_order`
- 이미지 경로 `images/xxx.webp` → Supabase Storage 업로드 후 URL 치환
- 카테고리 폴더 구조 (`AI/머신러닝/`) → `categories` + 초기 `parent_post_id` 계층
- 사용자 메모: 마이그레이션 시 일부 글 수정 필요 가능성 있음

---

## Harness Engineering: 전문 에이전트

본 프로젝트는 8개의 전문 에이전트와 협업합니다.

### 에이전트 목록 (.claude/agents/)

| 에이전트 | 역할 | 사용 시점 |
|---------|------|----------|
| **maintainer** ⭐ | 유지보수 계획 (메타) | 변경 전 영향 분석 + 단계별 계획 수립 |
| **ui-designer** | UI/UX 컴포넌트 설계 | 새 페이지/컴포넌트, 디자인 작업 |
| **db-architect** | DB 스키마 + 권한 설계 | 테이블 생성, RLS 설계, 마이그레이션 |
| **code-reviewer** | 코드 품질 리뷰 | 구현 후, PR 전, 리팩토링 후 |
| **docs-writer** | 기술 문서 작성 | 기능 추가 후, 트러블슈팅 후 |
| **test-writer** | 테스트 코드 작성 | 기능 구현 후, 버그 수정 후 |
| **seo-optimizer** | SEO 최적화 | 새 페이지 후, 검색 노출 개선 |
| **security-auditor** | 보안 감사 | 인증 변경, RLS 변경, 배포 전 |

### maintainer 사용법
**maintainer는 코드를 직접 수정하지 않고 계획만 세웁니다.**
- 큰 변경 전 영향 범위 분석
- 단계별 실행 계획 + 추천 에이전트
- 시스템 문서(`docs/system/*`)를 항상 먼저 참고

### 시스템 문서 (docs/system/) — 셋업 후 작성 예정
- `overview.md` - 시스템 전체 개요
- `pages.md` - 라우트 카탈로그
- `components.md` - 컴포넌트 카탈로그
- `data-flow.md` - DB/API 흐름 (지식그래프 쿼리 포함)
- `integrations.md` - Supabase, Vercel 등 외부 서비스

## 슬래시 커맨드 (.claude/commands/)

| 커맨드 | 용도 |
|--------|------|
| `/feature <기능명>` | 새 기능 풀 워크플로우 (DB → UI → 검증 → 테스트 → 문서) |
| `/new-page <경로>` | 새 페이지 생성 |
| `/new-component <이름>` | 새 컴포넌트 생성 |
| `/review-all [범위]` | 전체 검증 에이전트 병렬 실행 |
| `/deploy-check` | 배포 전 종합 점검 |
| `/quick-fix <버그>` | 빠른 버그 수정 (분석 → 수정 → 회귀 테스트) |

## 표준 워크플로우 (.claude/workflows/)

| 워크플로우 | 트리거 | 문서 |
|----------|-------|------|
| 새 기능 추가 | `/feature` | workflows/new-feature.md |
| 버그 수정 | `/quick-fix` | workflows/bug-fix.md |
| 리팩토링 | "리팩토링해줘" | workflows/refactor.md |

## 자동화된 검증 (Hooks)

`.claude/settings.json`의 hooks:
- **Edit/Write 후**: TypeScript 타입 체크 자동 실행
- **코드 변경 시**: 갱신 필요한 docs/system 파일 알림
- **Server Action / 인증 코드 변경 시**: 테스트 작성 의무 알림

---

## ⚠️ 테스트 작성 의무화 규칙

**원칙: 단위 함수 / 비즈니스 로직 / Server Action 추가/수정 = test-writer 호출은 한 세트.**

| 변경 종류 | test-writer 의무? |
|---------|----------------|
| Server Action 추가/수정 | ✅ **의무** |
| `src/lib/**` 단위 함수 | ✅ **의무** |
| 인증/인가 코드 (RLS 정책 포함) | ✅ **의무** + E2E 권장 |
| 새 컴포넌트 (인터랙션 포함) | ✅ **의무** |
| 정적 콘텐츠 변경 | ❌ 면제 |
| 시스템 문서 (`docs/`) | ❌ 면제 |

---

## ⚠️ 코드-문서 동기화 규칙

**원칙: 코드 변경 = docs/system 갱신은 한 세트.**

| 변경 종류 | 갱신 파일 |
|---------|----------|
| 새 페이지 / page.tsx 수정 | `docs/system/pages.md` |
| 새 컴포넌트 / 수정 | `docs/system/components.md` |
| Server Action / DB 변경 | `docs/system/data-flow.md` |
| 환경변수 / 외부 서비스 | `docs/system/integrations.md` |
| 큰 구조 변경 / 에이전트 추가 | `docs/system/overview.md` |
| 새 에이전트 / 슬래시 커맨드 | 이 파일 (CLAUDE.md) |

---

## 트러블슈팅 사례

`docs/troubleshooting/` 디렉토리에 발생한 버그 사례를 누적합니다.
