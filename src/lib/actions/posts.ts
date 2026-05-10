'use server';

// 손수레 글 CRUD Server Actions.
//
// - createPost: 글 생성 + body_md 위키링크 파싱 → post_links 동기화
// - updatePost: 글 수정 + post_links 재동기화
// - deletePost: 글 삭제 (post_links 는 ON DELETE CASCADE 로 자동)
//
// 검증 (data-flow.md 룰):
//   - excerpt 에 [[...]] 토큰 금지 (마크다운 렌더 안 되니 OG/카드에서 깨짐)
//   - title/slug 필수
//   - slug 형식: kebab-case, 슬래시 없음
//
// RLS 가 author_id 검증을 한 번 더 함 — 미들웨어 + RLS = 이중 게이트.

import { revalidatePath } from 'next/cache';

import { extractSlugs } from '@/lib/wikilinks';
import { createSupabaseServer } from '@/lib/supabase/server';

/* ─────────────────────────────────────────────
 * 입력 타입 + 검증
 * ───────────────────────────────────────────── */

export interface PostInput {
  slug: string;
  title: string;
  excerpt: string | null;
  body_md: string;
  category_id: string;
  cover_image_url?: string | null;
  parent_post_id?: string | null;
  published?: boolean;
  sort_order?: number;
}

export interface ActionResult<T = void> {
  ok: boolean;
  error?: string;
  data?: T;
}

const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

function validatePost(input: PostInput): string | null {
  if (!input.title.trim()) return '제목은 필수입니다.';
  if (!input.slug.trim()) return '슬러그는 필수입니다.';
  if (!SLUG_RE.test(input.slug)) {
    return '슬러그 형식이 올바르지 않습니다 (소문자 영문/숫자/-, 슬래시 X).';
  }
  if (input.excerpt && /\[\[|\]\]/.test(input.excerpt)) {
    return 'excerpt 에는 위키링크 [[...]] 를 쓸 수 없습니다. 본문(body_md) 에만 사용하세요.';
  }
  if (!input.category_id) return '카테고리를 선택해주세요.';
  return null;
}

/* ─────────────────────────────────────────────
 * 헬퍼 — body_md → post_links 동기화
 * ───────────────────────────────────────────── */

interface SupabaseLike {
  from: (t: string) => {
    select: (cols: string) => {
      in: (col: string, vals: string[]) => Promise<{ data: { id: string; slug: string }[] | null }>;
    };
    delete: () => {
      eq: (col: string, val: string) => {
        eq: (col: string, val: string) => Promise<{ error: { message: string } | null }>;
      };
    };
    insert: (rows: object[]) => Promise<{ error: { message: string } | null }>;
  };
}

async function syncPostLinks(
  supabase: SupabaseLike,
  postId: string,
  bodyMd: string,
): Promise<string | null> {
  const targetSlugs = extractSlugs(bodyMd);

  // 1. 'related' 타입 기존 링크 제거 (자동 동기화 영역만)
  const del = await supabase
    .from('post_links')
    .delete()
    .eq('from_post_id', postId)
    .eq('relation_type', 'related');
  if (del.error) return `post_links 정리 실패: ${del.error.message}`;

  if (targetSlugs.length === 0) return null;

  // 2. slug → id 매핑
  const { data: existing } = await supabase
    .from('posts')
    .select('id, slug')
    .in('slug', targetSlugs);
  if (!existing || existing.length === 0) return null;

  // 3. 새 링크 INSERT (자기참조 제외)
  const rows = existing
    .filter((p) => p.id !== postId)
    .map((p) => ({
      from_post_id: postId,
      to_post_id: p.id,
      relation_type: 'related',
    }));

  if (rows.length === 0) return null;

  const ins = await supabase.from('post_links').insert(rows);
  if (ins.error) return `post_links 삽입 실패: ${ins.error.message}`;
  return null;
}

/* ─────────────────────────────────────────────
 * Actions
 * ───────────────────────────────────────────── */

export async function createPost(input: PostInput): Promise<ActionResult<{ id: string; slug: string }>> {
  const err = validatePost(input);
  if (err) return { ok: false, error: err };

  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: '인증이 필요합니다.' };

  const { data, error } = await supabase
    .from('posts')
    .insert({
      slug: input.slug,
      title: input.title,
      excerpt: input.excerpt,
      body_md: input.body_md,
      category_id: input.category_id,
      cover_image_url: input.cover_image_url ?? null,
      parent_post_id: input.parent_post_id ?? null,
      published: input.published ?? false,
      sort_order: input.sort_order ?? 0,
      author_id: user.id,
    })
    .select('id, slug')
    .single();

  if (error || !data) return { ok: false, error: error?.message ?? '글 생성 실패' };

  const linkErr = await syncPostLinks(supabase as unknown as SupabaseLike, data.id, input.body_md);
  if (linkErr) return { ok: false, error: linkErr };

  revalidatePath('/');
  revalidatePath(`/posts/${data.slug}`);
  revalidatePath('/graph');

  return { ok: true, data };
}

export async function updatePost(
  id: string,
  input: PostInput,
): Promise<ActionResult> {
  const err = validatePost(input);
  if (err) return { ok: false, error: err };

  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: '인증이 필요합니다.' };

  const { error } = await supabase
    .from('posts')
    .update({
      slug: input.slug,
      title: input.title,
      excerpt: input.excerpt,
      body_md: input.body_md,
      category_id: input.category_id,
      cover_image_url: input.cover_image_url ?? null,
      parent_post_id: input.parent_post_id ?? null,
      published: input.published ?? false,
      sort_order: input.sort_order ?? 0,
    })
    .eq('id', id);

  if (error) return { ok: false, error: error.message };

  const linkErr = await syncPostLinks(supabase as unknown as SupabaseLike, id, input.body_md);
  if (linkErr) return { ok: false, error: linkErr };

  revalidatePath('/');
  revalidatePath(`/posts/${input.slug}`);
  revalidatePath('/graph');

  return { ok: true };
}

export async function deletePost(id: string): Promise<ActionResult> {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: '인증이 필요합니다.' };

  const { error } = await supabase.from('posts').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };

  revalidatePath('/');
  revalidatePath('/graph');
  return { ok: true };
}
