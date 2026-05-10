# 외부 서비스 / 통합

## Supabase
- **역할**: Postgres + Auth + Storage. 하나로 모두 처리.
- **무료 플랜으로 충분**: 500MB DB / 1GB Storage / 7일 무접속 시 일시정지(클릭 한 번으로 재개).
- **연결**: `@supabase/ssr` (Next.js 통합) + `@supabase/supabase-js`.

### 환경 변수
| 키 | 어디서 쓰나 | 노출 범위 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | 모든 클라이언트 | 공개 OK |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 모든 클라이언트 | 공개 OK (RLS 가 보호) |
| `SUPABASE_SERVICE_ROLE_KEY` | 마이그레이션 / 어드민 스크립트 | **서버 전용**. 절대 클라 번들 X |
| `NEXT_PUBLIC_SITE_URL` | metadata, sitemap, OG | 공개 |
| `MIGRATION_TEMP_DIR` | 마이그 스크립트 | 로컬 |

`.env.local` 에 위 값을 채우고, `.env.example` 은 빈 템플릿으로 git 에 둔다.

### 클라이언트 분리
- `src/lib/supabase/server.ts` — Server Components / Route Handlers / Server Actions. 쿠키 통합.
- `src/lib/supabase/browser.ts` — Client Components 전용. 싱글턴.
- `src/lib/supabase/admin.ts` — Service Role. 마이그레이션 / 어드민 스크립트 전용. RLS 우회.

### 가드
`src/lib/env.ts` 에서 `hasSupabase`, `assertSupabase()` 제공.
환경 변수가 없는 phase 1~6 동안에도 빌드 / 정적 페이지 렌더가 깨지지 않도록 lazy 로 처리.

## Vercel
- **역할**: 호스팅 + Edge / Serverless 런타임 + Image Optimization.
- **연동**: GitHub repo 연결 → push 시 자동 배포.
- **환경 변수**: Vercel 프로젝트 설정에서 위 키들을 동기화.
- **OG 이미지**: `@vercel/og` 사용 예정 (Phase 6).

## (선택) GitHub Actions
- 푸시 시 lint + build + test 검증 (Phase 6).

## 사용 안 하는 외부 API (의도)
- ❌ OpenAI / Anthropic 등 임베딩 API — 비용 들어서 안 씀.
- ❌ 외부 검색 (Algolia, MeiliSearch) — Postgres 풀텍스트/trigram 으로 충분.
- ❌ 외부 이미지 CDN — Supabase Storage 가 CDN 역할 겸함.
- ❌ 외부 분석 — 추후 Vercel Analytics 정도 검토.

## 로컬 개발
- Node 20+ 권장 (Next.js 16 호환).
- npm 사용 (`package.json`).
- 로컬 Supabase 띄우려면 `npx supabase start` (Docker 필요). 지금은 안 띄움 — 페이지 작업은 mock 데이터로 진행.
