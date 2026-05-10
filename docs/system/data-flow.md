# 데이터 흐름 / DB 스키마

## 스키마 ERD (텍스트)

```
auth.users (Supabase 관리)
    │ 1:1
    ▼
profiles (display_name, bio, avatar_url)

categories ── self-ref ──┐
   ▲ (parent_category_id)│
   │                     │
   │                     │
   │                     ▼
   └── posts (slug, title, body_md, category_id, published, ...)
               │ author_id ──→ auth.users
               │
               ├── 1:N → images (storage_path, alt, ...)
               │
               ├── M:N → tags  (via post_tags)
               │
               └── M:N → posts (via post_links — from/to/relation_type)
                                  ▲ 위키링크 자동 동기화
```

## 테이블 정의 요약

`supabase/migrations/0001_init_schema.sql` 참조. 핵심:

- `categories`: `slug` 슬래시 가능, `parent_category_id` 자기참조
- `posts`: `slug` 고유, `body_md` 원본 마크다운, `published` 게이트, `imported_from` 마이그 추적
- `post_links`: 복합 PK `(from_post_id, to_post_id, relation_type)`. 같은 두 글 사이에 다른 type 의 엣지 동시 가능
- `images`: 글에 종속, `storage_path` 는 Storage 객체 키
- `projects` (Phase 5 추가 예정): 글과 분리된 컬렉션. `name`, `slug`, `summary`, `status('진행중'|'완료'|'중단')`, `period_start/end`, `stack text[]`, `repo_url`, `demo_url`, `body_md`, `cover_image_url`. **지식그래프(post_links)와 무관** — 별도 페이지 `/projects` 에서만 노출.
- 자동 트리거: `updated_at` 모두, `published_at` 은 published 가 false→true 첫 전환 때만

## 권한 매트릭스

`supabase/migrations/0002_rls_policies.sql` 참조.

| 테이블 | anon | authenticated (= owner) |
|--------|------|------------------------|
| `categories` | SELECT | ALL |
| `posts` | SELECT (`published = true`) | ALL (own) + SELECT (others published) |
| `post_links` | SELECT (양쪽 글이 보일 때) | ALL (own posts 기준) |
| `images` | SELECT (post 가 보일 때) | ALL (own post) |
| `tags`, `post_tags` | SELECT | ALL |
| `profiles` | SELECT | UPDATE (self) |
| Storage `images` 버킷 | read | upload/update/delete |

`is_post_visible(post_id)` SECURITY DEFINER 함수로 일관성 확보.

## 주요 쿼리 패턴

### 메인 시간순 피드
```sql
select p.id, p.slug, p.title, p.excerpt, p.cover_image_url, p.published_at,
       c.slug as category_slug, c.name as category_name, c.icon, c.color
from posts p
join categories c on c.id = p.category_id
where p.published = true
order by p.published_at desc
limit 20;
```

### 글 상세 + 백링크 + 관련
```sql
-- 본문
select * from posts where slug = $1 and (published or author_id = auth.uid());

-- 백링크 (이 글을 참조하는 글들)
select p.* from post_links pl
join posts p on p.id = pl.from_post_id
where pl.to_post_id = $post_id and p.published;

-- 직접 링크된 글 (이 글이 참조하는 글들)
select p.* from post_links pl
join posts p on p.id = pl.to_post_id
where pl.from_post_id = $post_id and p.published;
```

### 카테고리 트리
```sql
-- 한 카테고리 + 그 자식들 + 자식의 글
with recursive cat_tree as (
  select id, slug, name, parent_category_id, sort_order, 0 as depth
  from categories where slug = $1
  union all
  select c.id, c.slug, c.name, c.parent_category_id, c.sort_order, ct.depth + 1
  from categories c join cat_tree ct on c.parent_category_id = ct.id
)
select * from cat_tree order by depth, sort_order;
```

### 그래프뷰 (한 번에)
```sql
-- 노드
select id, slug, title, category_id, parent_post_id from posts where published;
-- 엣지
select from_post_id as "from", to_post_id as "to", relation_type as relation
from post_links pl
where exists (select 1 from posts p where p.id = pl.from_post_id and p.published)
  and exists (select 1 from posts p where p.id = pl.to_post_id   and p.published);
```

## 위키링크 → post_links 동기화

**시점**: Server Action 의 `createPost` / `updatePost` 호출 시.

```
1. body_md 받기
2. parseWikilinks(body_md) → [{slug, anchor?, label?}, ...]
3. 트랜잭션 시작
   a. 기존 post_links where from_post_id = post.id 모두 삭제 (relation_type = 'related' 만)
   b. parsed 결과를 slug 로 lookup → post id 변환
   c. 존재하지 않는 slug 는 broken (= post_links 에 안 들어감, UI 에서 stub 처리)
   d. (post.id, target_id, 'related') INSERT (UPSERT)
4. 커밋
```

`relation_type = 'prerequisite' / 'followup'` 같이 명시적 타입의 링크는 별도 syntax 또는 별도 입력 폼에서 만든다 — 위키링크 자동 동기화는 `'related'` 만 건드린다.

## 환경 변수 / 연결

`.env.local` 항목은 [integrations.md](./integrations.md) 참고.

## 마이그레이션 순서 (Phase 7)
1. Supabase 프로젝트 생성 → URL/anon/service-role 키를 `.env.local` 에
2. `supabase db push` 또는 SQL Editor 에서 0001 → 0002 → seed 순서 실행
3. `scripts/import-from-migration-temp.ts` 실행 (service-role 사용)
   - `migration-temp/_meta/*.md` → `categories` 채움
   - `migration-temp/docs/**/*.md` → `posts` 채움
   - `migration-temp/images/**` → Storage 업로드 + `images` 행 생성
   - 본문에서 위키링크 파싱 (이 단계에는 거의 비어 있을 것 — 마이그 후 작성자가 손으로 채움)
