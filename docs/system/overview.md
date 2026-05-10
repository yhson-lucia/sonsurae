# 손수레 시스템 개요

> 한 페이지로 보는 손수레.

## 한 줄 요약
개발/AI 학습 노트를 글 단위로 정리하고, 본문 위키링크(`[[slug]]`)로 자동 연결되는 지식그래프를 가진 공개 블로그.

## 핵심 아이디어
- **글 = 개념**: 한 글은 하나의 주제만 다룬다.
- **그래프 = 본문 링크**: 작성자가 본문에 `[[slug]]` 라고 쓰면 → 저장 시 자동 파싱 → `post_links` 동기화.
- **폴더 ≠ 그래프**: 폴더(카테고리)는 사이드바 트리용. 그래프는 위키링크만으로 만들어진다.
- **공개 읽기 / 본인만 쓰기**: anon = SELECT, authenticated(=오너) = ALL.

## 시스템 구성

```
사용자 브라우저
    │  HTTPS
    ▼
Vercel (Next.js 16 App Router)
    │
    ├── Server Components → Supabase REST/PG (SELECT, RLS 적용)
    ├── Server Actions    → Supabase REST/PG (INSERT/UPDATE, owner 검증)
    └── /graph (Client)   → Supabase REST (그래프 노드/엣지 한 번에)
                                │
                                ▼
                         Supabase (Postgres + Auth + Storage)
                            ├── posts, categories, post_links, images, tags, post_tags, profiles
                            ├── RLS 정책 (public read, owner write)
                            └── Storage bucket "images" (public read)
```

## 데이터 모델 요약

| 테이블 | 핵심 역할 |
|--------|----------|
| `categories` | 폴더 — `slug` 에 슬래시 가능 (`ai/deep-learning`). `parent_category_id` 자기참조. |
| `posts` | 글 = 개념. `slug` 고유. 본문 `body_md`. `published / published_at`. |
| `post_links` | 위키링크에서 자동 추출되는 M:N 엣지 (`from`, `to`, `relation_type`). |
| `images` | Supabase Storage 객체의 메타. 글에 종속. |
| `tags` / `post_tags` | 자유 분류 (옵션, Phase 6 이후). |
| `profiles` | 단일 작성자. `auth.users` 1:1 확장. |

세부 흐름은 [data-flow.md](./data-flow.md) 참고.

## Phase별 진행 상황

| Phase | 내용 | 상태 |
|-------|------|------|
| 1 | Foundation: 스키마·디자인 토큰·레이아웃·Supabase 클라이언트 | 진행 중 |
| 2 | 마크다운 + 위키링크 파이프라인 | 대기 |
| 3 | 읽기 페이지 (mock 데이터) | 대기 |
| 4 | 그래프뷰 | 대기 |
| 5 | 인증 + 작성 흐름 (에디터, 이미지 업로드) | 대기 |
| 6 | 검색 + SEO + 테스트 | 대기 |
| 7 | 데이터 마이그레이션 (마지막, 격리) | 대기 |

## 의도적으로 미룬 결정
- Supabase 프로젝트 실제 생성 → Phase 7 직전
- 지식그래프 라이브러리 선정 (`react-force-graph` vs `cytoscape`) → Phase 4
- 검색 방식 (trigram vs full-text) → Phase 6
- 다크모드 토글 (자동 vs 수동) → Phase 6
