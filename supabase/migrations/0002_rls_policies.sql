-- 손수레 RLS 정책 + GRANT
--
-- 모델: 공개 학습 블로그
--   anon          : 발행된 글 / 그 글의 이미지 / 카테고리 / 공개 프로필 / 발행 글 사이의 링크 → SELECT
--   authenticated : 본인(author_id = auth.uid()) 데이터에 대해 모든 작업 가능
--   service_role  : 우회 (마이그레이션·백업)
--
-- 단일 작성자 모델이지만, 정책은 author_id 검사로 일반화해서 작성한다.

-- ============================================================
-- 1. RLS 활성화
-- ============================================================

alter table public.profiles    enable row level security;
alter table public.categories  enable row level security;
alter table public.posts       enable row level security;
alter table public.post_links  enable row level security;
alter table public.images      enable row level security;
alter table public.tags        enable row level security;
alter table public.post_tags   enable row level security;

-- ============================================================
-- 2. GRANT (역할별 테이블 접근 — RLS 와 별개로 먼저 통과해야 함)
-- ============================================================

-- 읽기는 anon / authenticated 모두에게
grant select on
  public.profiles,
  public.categories,
  public.posts,
  public.post_links,
  public.images,
  public.tags,
  public.post_tags
to anon, authenticated;

-- 쓰기는 authenticated 에게만 (RLS 가 본인 데이터로 다시 좁힘)
grant insert, update, delete on
  public.profiles,
  public.categories,
  public.posts,
  public.post_links,
  public.images,
  public.tags,
  public.post_tags
to authenticated;

-- ============================================================
-- 3. profiles  : 누구나 읽기, 본인만 수정
-- ============================================================

create policy profiles_select_all
  on public.profiles for select
  using (true);

create policy profiles_insert_self
  on public.profiles for insert
  with check (auth.uid() = user_id);

create policy profiles_update_self
  on public.profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- profiles 삭제는 auth.users 캐스케이드로 처리 → 명시 정책 X

-- ============================================================
-- 4. categories  : 누구나 읽기, 인증된 사용자(=오너)만 관리
-- ============================================================

create policy categories_select_all
  on public.categories for select
  using (true);

create policy categories_insert_authed
  on public.categories for insert
  to authenticated
  with check (true);

create policy categories_update_authed
  on public.categories for update
  to authenticated
  using (true)
  with check (true);

create policy categories_delete_authed
  on public.categories for delete
  to authenticated
  using (true);

-- ============================================================
-- 5. posts  : 발행된 글은 누구나 / 본인 글은 모두
-- ============================================================

-- anon 은 발행된 글만 본다
create policy posts_select_published
  on public.posts for select
  to anon
  using (published = true);

-- authenticated 는 발행 여부 무관, 본인 글 전부 + 발행된 다른 글
create policy posts_select_authed
  on public.posts for select
  to authenticated
  using (published = true or auth.uid() = author_id);

-- 작성/수정/삭제는 본인만
create policy posts_insert_owner
  on public.posts for insert
  to authenticated
  with check (auth.uid() = author_id);

create policy posts_update_owner
  on public.posts for update
  to authenticated
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

create policy posts_delete_owner
  on public.posts for delete
  to authenticated
  using (auth.uid() = author_id);

-- ============================================================
-- 6. post_links  : 양 끝 글이 모두 보일 때만 링크도 보임
-- ============================================================

-- 헬퍼: 어떤 post_id 가 현재 호출자에게 보이는지 (RLS 와 동일 규칙)
create or replace function public.is_post_visible(p_id uuid)
returns boolean
language sql
stable
security definer  -- RLS 우회해서 직접 판정 (정책의 정의 자체에 사용되므로 의도적)
set search_path = public
as $$
  select exists (
    select 1 from public.posts p
    where p.id = p_id
      and (p.published = true or p.author_id = auth.uid())
  );
$$;

create policy post_links_select_visible
  on public.post_links for select
  using (
    public.is_post_visible(from_post_id)
    and public.is_post_visible(to_post_id)
  );

create policy post_links_insert_owner
  on public.post_links for insert
  to authenticated
  with check (
    exists (select 1 from public.posts p where p.id = from_post_id and p.author_id = auth.uid())
    and exists (select 1 from public.posts p where p.id = to_post_id   and p.author_id = auth.uid())
  );

create policy post_links_update_owner
  on public.post_links for update
  to authenticated
  using (
    exists (select 1 from public.posts p where p.id = from_post_id and p.author_id = auth.uid())
  )
  with check (
    exists (select 1 from public.posts p where p.id = from_post_id and p.author_id = auth.uid())
  );

create policy post_links_delete_owner
  on public.post_links for delete
  to authenticated
  using (
    exists (select 1 from public.posts p where p.id = from_post_id and p.author_id = auth.uid())
  );

-- ============================================================
-- 7. images  : 글이 보일 때만 이미지도 보임 / 글 오너만 관리
-- ============================================================

create policy images_select_visible
  on public.images for select
  using (public.is_post_visible(post_id));

create policy images_insert_owner
  on public.images for insert
  to authenticated
  with check (
    exists (select 1 from public.posts p where p.id = post_id and p.author_id = auth.uid())
  );

create policy images_update_owner
  on public.images for update
  to authenticated
  using (
    exists (select 1 from public.posts p where p.id = post_id and p.author_id = auth.uid())
  )
  with check (
    exists (select 1 from public.posts p where p.id = post_id and p.author_id = auth.uid())
  );

create policy images_delete_owner
  on public.images for delete
  to authenticated
  using (
    exists (select 1 from public.posts p where p.id = post_id and p.author_id = auth.uid())
  );

-- ============================================================
-- 8. tags / post_tags  : 누구나 읽기, 인증된 사용자만 관리
-- ============================================================

create policy tags_select_all
  on public.tags for select using (true);

create policy tags_insert_authed
  on public.tags for insert to authenticated with check (true);

create policy tags_update_authed
  on public.tags for update to authenticated using (true) with check (true);

create policy tags_delete_authed
  on public.tags for delete to authenticated using (true);

create policy post_tags_select_visible
  on public.post_tags for select
  using (public.is_post_visible(post_id));

create policy post_tags_insert_owner
  on public.post_tags for insert
  to authenticated
  with check (
    exists (select 1 from public.posts p where p.id = post_id and p.author_id = auth.uid())
  );

create policy post_tags_delete_owner
  on public.post_tags for delete
  to authenticated
  using (
    exists (select 1 from public.posts p where p.id = post_id and p.author_id = auth.uid())
  );

-- ============================================================
-- 9. Storage  : 'images' 버킷
--   - 누구나 read
--   - authenticated 만 upload/update/delete
-- ============================================================

-- 버킷 생성 (public read 활성화)
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do nothing;

-- Storage 객체 정책
create policy "storage_images_read_all"
  on storage.objects for select
  using (bucket_id = 'images');

create policy "storage_images_insert_authed"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'images');

create policy "storage_images_update_authed"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'images')
  with check (bucket_id = 'images');

create policy "storage_images_delete_authed"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'images');
