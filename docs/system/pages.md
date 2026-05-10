# 페이지 / 라우트 카탈로그

> 변경 시 이 표를 함께 갱신.

## 공개 라우트

| 경로 | 컴포넌트 | 역할 | 상태 |
|------|---------|------|------|
| `/` | `app/page.tsx` | 메인 — 최근 글 시간순 피드 | placeholder (P3 에서 구현) |
| `/posts/[slug]` | `app/posts/[slug]/page.tsx` | 글 상세. 본문 + 백링크 + 미니 그래프 + 관련 글 | 미작성 (P3) |
| `/category/[...slug]` | `app/category/[...slug]/page.tsx` | 카테고리 페이지. 슬래시 슬러그 catch-all (`/category/ai/deep-learning`) | 미작성 (P3) |
| `/projects` | `app/projects/page.tsx` | 프로젝트 목록 — 글/그래프와 분리된 별도 탭 | placeholder (skeleton 카드) |
| `/projects/[slug]` | `app/projects/[slug]/page.tsx` | 프로젝트 상세 — 구조/의사결정/회고 | 미작성 (P5) |
| `/tags/[slug]` | `app/tags/[slug]/page.tsx` | 태그별 글 목록 | 미작성 (P6 이후) |
| `/graph` | `app/graph/page.tsx` | 전체 지식그래프 시각화 | 미작성 (P4) |
| `/search` | `app/search/page.tsx` | 검색 결과 | 미작성 (P6) |
| `/about` | `app/about/page.tsx` | 사이트 소개 | 미작성 |

## 인증 / 어드민 라우트 (Phase 5)

| 경로 | 역할 | RLS 컨텍스트 |
|------|------|---------------|
| `/login` | 오너 로그인 (Supabase Auth) | anon |
| `/admin/posts` | 글 목록 + 새 글 작성 진입 | authenticated (owner) |
| `/admin/posts/new` | 새 글 에디터 | authenticated (owner) |
| `/admin/posts/[slug]/edit` | 글 수정 에디터 | authenticated (owner) |

## 시스템 라우트 (Phase 6)

| 경로 | 역할 |
|------|------|
| `/sitemap.xml` | `app/sitemap.ts` — DB 동적 |
| `/robots.txt` | `app/robots.ts` |
| `/og/[slug]` | OG 이미지 동적 생성 (`@vercel/og`) |
| `/api/health` | 헬스체크 (선택) |

## 라우트 설계 메모
- **카테고리는 catch-all** (`[...slug]`): 슬러그가 `ai/deep-learning` 같이 슬래시를 포함하므로 단일 dynamic segment 로는 표현 불가.
- **글 상세는 단일 segment** (`[slug]`): 글의 슬러그는 슬래시 없는 단일 토큰 (`perceptron`, `spring-boot`).
- **`/admin/*` 경로는 middleware 에서 세션 검증**하여 미인증 시 `/login` 으로 리다이렉트.
