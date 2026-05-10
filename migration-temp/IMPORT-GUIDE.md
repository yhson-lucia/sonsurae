# 데이터 임포트 실행 가이드

`migration-temp/` 의 정리된 93개 글을 Supabase로 옮기는 절차.

## 사전 준비

### 1. Supabase 프로젝트 생성
- <https://supabase.com> 에서 새 프로젝트 생성
- Settings → API 에서 다음 3개 키 확인:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (절대 클라이언트에 노출 X)

### 2. 스키마 + 시드 적용

#### 옵션 A: Supabase CLI 사용 (권장)
```bash
# CLI 설치
brew install supabase/tap/supabase

# 프로젝트 link
npx supabase login
npx supabase link --project-ref <your-project-ref>

# 마이그레이션 적용 (0001_init_schema.sql, 0002_rls_policies.sql)
npx supabase db push

# 시드 적용 (categories 20개)
npx supabase db reset --linked    # 또는 dashboard SQL Editor 에서 seed.sql 직접 실행
```

#### 옵션 B: Supabase 대시보드에서 수동
- Database → SQL Editor 에서 다음 순서로 붙여넣기/실행:
  1. `supabase/migrations/0001_init_schema.sql`
  2. `supabase/migrations/0002_rls_policies.sql`
  3. `supabase/seed.sql`

### 3. 작성자 계정 만들기
- 앱이나 Supabase 대시보드에서 회원가입 1회
- Authentication → Users 에서 본인 user id 복사 (UUID)
- `profiles` 테이블에 row 1개 INSERT (아래 SQL):

```sql
insert into public.profiles (user_id, display_name)
values ('<여기에-본인-user-id>', '황예준');
```

### 4. `.env.local` 채우기

`.env.example` 복사 후 값 채움:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_SITE_URL=http://localhost:3000

AUTHOR_USER_ID=<위에서 만든 user id>
MIGRATION_TEMP_DIR=./migration-temp
```

## 마이그레이션 실행

### 1. dry-run (먼저 권장 — DB 변경 없이 카운트만)

```bash
npm run migrate:from-my-website:dry
```

예상 출력:
```
🚀 마이그레이션 시작 (TEMP_DIR=./migration-temp)
   (dry-run 모드 — DB/Storage 변경 없음)

📂 카테고리 매핑 로드 ...
   20개 카테고리 확인

📑 md 파일 수집 ...
   93개 파일 발견

📝 글 임포트 시작 ...
[dry] post=perceptron  category=ai/deep-learning  images=2  tags=6
[dry] post=neural-network  category=ai/deep-learning  images=5  tags=7
...

📤 Storage 업로드: 131개
[dry-upload] perceptron-01.webp  (image/webp, 12345B)
...

────── 결과 ──────
  posts     : 93
  images    : ~126
  tags(rel) : ~600
  uploaded  : 131
  skipped   : 0
  errors    : 0
```

### 2. 실제 실행

```bash
# 기본: 모든 글이 published=false (초안)
npm run migrate:from-my-website

# 또는 임포트 즉시 published=true (바로 공개)
node --env-file=.env.local scripts/migrate-from-my-website.mjs --published=true
```

### 3. 부분 실행 (옵션)

```bash
# 특정 글만
node --env-file=.env.local scripts/migrate-from-my-website.mjs --only=perceptron,relu

# Storage 업로드 생략 (메타만 다시)
node --env-file=.env.local scripts/migrate-from-my-website.mjs --skip-images
```

## 결과 확인

Supabase 대시보드 → Database → Tables 에서:
- **categories**: 20 rows
- **posts**: 93 rows (published=false 기본)
- **images**: ~126 rows
- **tags**: ~50개
- **post_tags**: ~600 rows
- **Storage → images** 버킷: 131개 파일

## 마이그레이션 후

1. 글들을 검토하고 published=true 로 변경
2. parent_post_id 로 계층 관계 수동 설정 (예: `perceptron` → 부모: `neural-network`)
3. post_links 로 옆방향 관계 설정 (예: `cross-entropy` ↔ `softmax-regression`)
4. 모든 작업 끝나면 `migration-temp/` 폴더 삭제

## 트러블슈팅

### "카테고리가 비어 있음"
→ seed.sql 미실행. `supabase db reset` 또는 SQL Editor 에서 수동 실행.

### "category 'X' 없음"
→ frontmatter 의 `category` 가 seed 한 20개와 일치하지 않음. md 파일 또는 seed.sql 확인.

### "permission denied for table posts"
→ SERVICE_ROLE_KEY 가 아닌 ANON_KEY 를 사용 중. .env.local 확인.

### Storage 업로드 실패
→ 'images' 버킷 미생성. `0002_rls_policies.sql` 의 `insert into storage.buckets` 가 적용됐는지 확인.

### 멱등성 확인
→ 다시 실행해도 같은 결과. posts.slug, tags.slug, storage upsert 로 중복 방지됨.
