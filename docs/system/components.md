# 컴포넌트 카탈로그

> 변경 시 이 표를 함께 갱신.

## 레이아웃 (`src/components/layout/`)

| 컴포넌트 | 역할 | 상태 |
|---------|------|------|
| `SiteHeader` | 상단 헤더 — 로고 + 네비 (홈/그래프/검색) | ✅ |
| `SiteFooter` | 푸터 — 저작권 + 푸터 네비 | ✅ |
| `Sidebar` | 사이드바 폴더 트리 (카테고리) | 미작성 (P3) |

## 글 (`src/components/post/`) — Phase 3

| 컴포넌트 | 역할 |
|---------|------|
| `PostCard` | 시간순 피드 카드 (제목 / 요약 / 카테고리 / 날짜) |
| `PostBody` | 마크다운 렌더 결과 wrapper (.prose-study 적용) |
| `PostMeta` | 발행일, 카테고리 breadcrumb, 태그 |
| `BacklinksPanel` | "이 글을 참조한 글들" 목록 |
| `RelatedPosts` | 같은 카테고리 / 직접 링크된 글 |
| `MiniGraph` | 글 페이지에 표시되는 작은 로컬 그래프 (P4) |

## 마크다운 (`src/components/markdown/`) — Phase 2

| 컴포넌트 | 역할 |
|---------|------|
| `MarkdownRenderer` | react-markdown 기반 렌더링 (KaTeX, Shiki, 위키링크 처리) |
| `WikiLink` | `[[slug]]` 를 실제 `<Link>` 로 변환. 존재하지 않으면 stub 스타일 |
| `CodeBlock` | Shiki 하이라이팅된 코드 블록 |

## 그래프 (`src/components/graph/`) — Phase 4

| 컴포넌트 | 역할 |
|---------|------|
| `GraphView` | 전체 그래프 캔버스 (라이브러리 미정) |
| `GraphLegend` | 노드/엣지 색·크기 의미 |
| `GraphFilter` | 카테고리·태그로 필터 |

## 에디터 (`src/components/editor/`) — Phase 5

| 컴포넌트 | 역할 |
|---------|------|
| `MarkdownEditor` | 본문 에디터 (텍스트영역 + 미리보기) |
| `WikiLinkAutocomplete` | `[[` 입력 시 슬러그 후보 띄움 |
| `ImageUploader` | 드래그앤드롭 → Supabase Storage 업로드 |
| `FrontmatterForm` | title/category/published 등 메타 입력 |

## 명명 규칙
- 파일명 = 컴포넌트명 = PascalCase
- 한 파일 한 컴포넌트 (관련 작은 hook/util 은 같은 파일 OK)
- 클라이언트 컴포넌트는 파일 최상단 `'use client'`
- 폴더 구조는 도메인별 (`layout`, `post`, `markdown`, `graph`, `editor`) — atomic 같은 일반 분류는 안 씀
