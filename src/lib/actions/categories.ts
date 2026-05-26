'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServer } from '@/lib/supabase/server';
import type { ActionResult } from './posts';

export interface CategoryInput {
  slug: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  parent_category_id?: string | null;
  sort_order?: number;
}

// 카테고리 슬러그: 소문자 영문·숫자·하이픈, 계층 구분 슬래시(/) 허용
const SLUG_RE = /^[a-z0-9](?:[a-z0-9\-/]*[a-z0-9])?$/;

function validateCategory(input: CategoryInput): string | null {
  if (!input.name.trim()) return '이름은 필수입니다.';
  if (!input.slug.trim()) return '슬러그는 필수입니다.';
  if (!SLUG_RE.test(input.slug)) {
    return '슬러그 형식이 올바르지 않습니다 (소문자 영문/숫자/하이픈, 계층 구분은 슬래시 사용).';
  }
  return null;
}

export async function createCategory(
  input: CategoryInput,
): Promise<ActionResult<{ id: string }>> {
  const err = validateCategory(input);
  if (err) return { ok: false, error: err };

  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: '인증이 필요합니다.' };

  const { data, error } = await supabase
    .from('categories')
    .insert({
      slug: input.slug,
      name: input.name,
      description: input.description ?? null,
      icon: input.icon ?? null,
      color: input.color ?? null,
      parent_category_id: input.parent_category_id ?? null,
      sort_order: input.sort_order ?? 0,
    })
    .select('id')
    .single();

  if (error || !data) {
    if (error?.code === '23505') return { ok: false, error: '이미 존재하는 슬러그입니다.' };
    return { ok: false, error: error?.message ?? '카테고리 생성 실패' };
  }

  revalidatePath('/admin/categories');
  revalidatePath('/');
  revalidatePath('/graph');

  return { ok: true, data };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: '인증이 필요합니다.' };

  // 이 카테고리를 사용하는 글이 있으면 삭제 불가
  const { count, error: countErr } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', id);

  if (countErr) return { ok: false, error: countErr.message };
  if (count && count > 0) {
    return { ok: false, error: `이 카테고리에 글이 ${count}개 있어 삭제할 수 없습니다. 글을 먼저 다른 카테고리로 이동해 주세요.` };
  }

  // 하위 카테고리가 있으면 삭제 불가
  const { count: childCount, error: childErr } = await supabase
    .from('categories')
    .select('*', { count: 'exact', head: true })
    .eq('parent_category_id', id);

  if (childErr) return { ok: false, error: childErr.message };
  if (childCount && childCount > 0) {
    return { ok: false, error: `하위 카테고리가 ${childCount}개 있어 삭제할 수 없습니다. 하위 카테고리를 먼저 삭제해 주세요.` };
  }

  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };

  revalidatePath('/admin/categories');
  revalidatePath('/');
  revalidatePath('/graph');

  return { ok: true };
}
