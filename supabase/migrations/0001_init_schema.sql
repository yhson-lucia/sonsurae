-- 손수레 (Sonsurae) 초기 스키마
-- 학습 아카이브 블로그 + 계층적 지식그래프
--
-- 핵심 모델:
--   글(post) = 개념. parent_post_id 자기참조로 계층 구성.
--   post_links 로 옆방향 관련 링크 (M:N).
--   public read / owner write.

-- ============================================================
-- 1. extensions
-- ============================================================

create extension if not exists "uuid-ossp";
create extension if not exists pg_trgm;  -- 한글/영문 검색 인덱싱용 (옵션)

-- ============================================================
-- 2. enums
-- ============================================================

-- 글 사이의 관계 타입.
--   related        : 일반 관련 (양방향처럼 취급 가능)
--   references     : 이 글이 다른 글을 참고함 (방향성)
--   prerequisite   : 이 글을 읽으려면 대상 글을 먼저 읽으면 좋음
--   followup       : 이 글 이후에 읽으면 좋은 다음 단계
create type post_link_relation as enum ('related', 'references', 'prerequisite', 'followup');

-- ============================================================
-- 3. profiles  (단일 작성자 + auth.users 1:1)
-- ============================================================

create table public.profiles (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  bio          text,
  avatar_url   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ============================================================
-- 4. categories  (최상위 분류: AI / Spring / FE / 네트워크 등)
-- ============================================================

create table public.categories (
  id                  uuid primary key default uuid_generate_v4(),
  slug                text not null unique,                  -- 슬래시 포함 가능: 'ai/deep-learning'
  name                text not null,
  description         text,                                  -- _meta/*.md 본문 흡수처
  parent_category_id  uuid references public.categories(id) on delete set null,
  -- UI 용 시각 토큰
  icon                text,                                  -- 이모지 또는 아이콘 키
  color               text,                                  -- tailwind 컬러 키 (예: 'emerald')
  sort_order          int  not null default 0,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  constraint categories_no_self_parent check (id <> parent_category_id)
);

create index idx_categories_sort_order on public.categories(sort_order);
create index idx_categories_parent on public.categories(parent_category_id);

-- ============================================================
-- 5. posts  (글 = 개념)
-- ============================================================

create table public.posts (
  id              uuid primary key default uuid_generate_v4(),
  slug            text not null unique,                 -- URL: /posts/{slug}
  title           text not null,
  excerpt         text,                                 -- 카드/검색결과 요약
  body_md         text not null default '',             -- 원본 마크다운
  cover_image_url text,                                 -- 대표 이미지 (Storage URL)
  category_id     uuid not null references public.categories(id) on delete restrict,
  parent_post_id  uuid references public.posts(id) on delete set null,  -- 계층
  author_id       uuid not null references auth.users(id) on delete restrict,

  -- 발행 제어
  published       boolean      not null default false,
  published_at    timestamptz,                          -- 최초 발행 시각
  sort_order      int          not null default 0,      -- 형제 글 정렬 (수동)

  -- 마이그레이션 추적
  imported_from   text,                                 -- 예: 'my-website/docs/AI/머신러닝/foo.md'

  created_at      timestamptz  not null default now(),
  updated_at      timestamptz  not null default now(),

  -- 자기참조 사이클 방지는 애플리케이션 레벨에서 검사 (DB CHECK는 비용 큼)
  constraint posts_no_self_parent check (id <> parent_post_id)
);

-- 메인 시간순 피드용
create index idx_posts_published_at on public.posts(published_at desc nulls last)
  where published = true;
-- 카테고리/트리 탐색용
create index idx_posts_category on public.posts(category_id);
create index idx_posts_parent on public.posts(parent_post_id);
-- 검색용 (제목/요약 trigram)
create index idx_posts_title_trgm on public.posts using gin (title gin_trgm_ops);

-- ============================================================
-- 6. post_links  (M:N, 옆방향 관련 링크)
-- ============================================================

create table public.post_links (
  from_post_id  uuid not null references public.posts(id) on delete cascade,
  to_post_id    uuid not null references public.posts(id) on delete cascade,
  relation_type post_link_relation not null default 'related',
  note          text,                                   -- 왜 연결했는지 짧은 메모 (선택)
  created_at    timestamptz not null default now(),

  primary key (from_post_id, to_post_id, relation_type),
  constraint post_links_no_self check (from_post_id <> to_post_id)
);

create index idx_post_links_from on public.post_links(from_post_id);
create index idx_post_links_to   on public.post_links(to_post_id);

-- ============================================================
-- 7. images  (Supabase Storage 메타데이터)
-- ============================================================

create table public.images (
  id            uuid primary key default uuid_generate_v4(),
  post_id       uuid not null references public.posts(id) on delete cascade,
  storage_path  text not null,                          -- Storage 객체 경로
  alt           text,
  width         int,
  height        int,
  caption       text,
  sort_order    int  not null default 0,
  created_at    timestamptz not null default now(),

  unique (post_id, storage_path)
);

create index idx_images_post on public.images(post_id);

-- ============================================================
-- 8. tags + post_tags  (자유 분류, category 와 별개)
-- ============================================================

create table public.tags (
  id         uuid primary key default uuid_generate_v4(),
  slug       text not null unique,
  name       text not null,
  created_at timestamptz not null default now()
);

create table public.post_tags (
  post_id uuid not null references public.posts(id) on delete cascade,
  tag_id  uuid not null references public.tags(id)  on delete cascade,
  primary key (post_id, tag_id)
);

create index idx_post_tags_tag on public.post_tags(tag_id);

-- ============================================================
-- 9. updated_at 자동 갱신 트리거
-- ============================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger trg_categories_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

create trigger trg_posts_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

-- ============================================================
-- 10. 발행 시각 자동 기록
--   published 가 false → true 로 바뀔 때 published_at 을 처음 한 번만 기록
-- ============================================================

create or replace function public.set_published_at()
returns trigger
language plpgsql
as $$
begin
  if new.published = true and (old.published is null or old.published = false) and new.published_at is null then
    new.published_at = now();
  end if;
  return new;
end;
$$;

create trigger trg_posts_published_at
  before update on public.posts
  for each row execute function public.set_published_at();
