-- 손수레 프로젝트 테이블 — 글(posts) 과 분리된 별도 컬렉션.
--
-- 모델 결정 (data-flow.md 참고):
--   프로젝트는 글이 아니다. 기간/스택/repo·demo 링크 등 별도 필드가 핵심.
--   지식그래프(post_links) 와 무관 — /projects 페이지에서만 노출.
--   공개 읽기 / 작성자만 쓰기 (posts 와 동일 권한 모델).

-- ============================================================
-- 1. enum
-- ============================================================

create type project_status as enum ('진행중', '완료', '중단');

-- ============================================================
-- 2. projects 테이블
-- ============================================================

create table public.projects (
  id              uuid primary key default uuid_generate_v4(),
  slug            text not null unique,                -- URL: /projects/{slug}
  name            text not null,
  summary         text,                                -- 카드/메타용 평문 (위키링크 X)
  body_md         text not null default '',            -- 본문 마크다운 (위키링크 OK)
  cover_image_url text,
  status          project_status not null default '진행중',
  period_start    date,
  period_end      date,                                -- null 이면 진행 중
  stack           text[] not null default '{}',        -- ['Next.js', 'Supabase', ...]
  repo_url        text,
  demo_url        text,
  author_id       uuid not null references auth.users(id) on delete restrict,

  -- 발행 제어 (글과 동일)
  published       boolean not null default false,
  published_at    timestamptz,
  sort_order      int     not null default 0,

  -- 마이그레이션 추적
  imported_from   text,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_projects_published_at on public.projects(published_at desc nulls last)
  where published = true;
create index idx_projects_status on public.projects(status);
create index idx_projects_stack on public.projects using gin (stack);

-- updated_at / published_at 트리거 (0001 의 함수 재사용)
create trigger trg_projects_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

create trigger trg_projects_published_at
  before update on public.projects
  for each row execute function public.set_published_at();

-- ============================================================
-- 3. RLS + GRANT (posts 와 동일 패턴)
-- ============================================================

alter table public.projects enable row level security;

grant select on public.projects to anon, authenticated;
grant insert, update, delete on public.projects to authenticated;

create policy projects_select_published
  on public.projects for select
  to anon
  using (published = true);

create policy projects_select_authed
  on public.projects for select
  to authenticated
  using (published = true or auth.uid() = author_id);

create policy projects_insert_owner
  on public.projects for insert
  to authenticated
  with check (auth.uid() = author_id);

create policy projects_update_owner
  on public.projects for update
  to authenticated
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

create policy projects_delete_owner
  on public.projects for delete
  to authenticated
  using (auth.uid() = author_id);
