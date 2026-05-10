// 손수레 데이터 쿼리.
//
// Phase 7 마이그레이션 이후 Supabase 에서 직접 읽는다.
// 시그니처는 mock 시절과 호환 (MockPost / MockCategory 형태) — 페이지 코드 변경 최소화.
// 차이점: 모든 함수가 async (Supabase 호출이라 비동기 필수).
//
// 위치는 historical 이유로 src/lib/mock/queries.ts 유지.
// 다음 정리 단계에서 src/lib/queries.ts 로 옮길 예정.

import { extractSlugs } from '@/lib/wikilinks';
import { createSupabaseServer } from '@/lib/supabase/server';
import { env } from '@/lib/env';

import type {
  CategoryTreeNode,
  MockCategory,
  MockPost,
} from './types';

/* ─────────────────────────────────────────────
 * 내부 — Supabase row → MockPost / MockCategory 변환
 * ───────────────────────────────────────────── */

interface PostRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body_md: string;
  cover_image_url: string | null;
  published: boolean;
  published_at: string | null;
  sort_order: number;
  created_at: string;
  parent_post: { slug: string } | null;
  category: {
    slug: string;
    name: string;
    icon: string | null;
    color: string | null;
  } | null;
}

const POST_SELECT = `
  id, slug, title, excerpt, body_md, cover_image_url,
  published, published_at, sort_order, created_at,
  parent_post:parent_post_id ( slug ),
  category:category_id ( slug, name, icon, color )
` as const;

function toMockPost(row: PostRow): MockPost {
  if (!row.category) {
    throw new Error(`post ${row.slug} 의 category 가 비었습니다 (FK 깨짐).`);
  }
  // Storage 경로 → 공개 URL 조립
  const cover = row.cover_image_url
    ? toStorageUrl(row.cover_image_url)
    : null;

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    body_md: rewriteImageUrls(row.body_md),
    cover_image_url: cover,
    category: {
      slug: row.category.slug,
      name: row.category.name,
      icon: row.category.icon,
      color: row.category.color,
    },
    parent_post_slug: row.parent_post?.slug ?? null,
    published: row.published,
    published_at: row.published_at ?? row.created_at,
    sort_order: row.sort_order,
  };
}

interface CategoryRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  sort_order: number;
  parent: { slug: string } | null;
}

const CATEGORY_SELECT = `
  id, slug, name, description, icon, color, sort_order,
  parent:parent_category_id ( slug )
` as const;

function toMockCategory(row: CategoryRow): MockCategory {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    icon: row.icon,
    color: row.color,
    parent_slug: row.parent?.slug ?? null,
    sort_order: row.sort_order,
  };
}

/** Storage 상대 경로 → 공개 URL */
function toStorageUrl(path: string): string {
  return `${env.supabaseUrl}/storage/v1/object/public/images/${path}`;
}

/** body_md 안의 `images/foo.webp` 참조를 Storage 공개 URL 로 치환. */
function rewriteImageUrls(md: string): string {
  return md.replace(
    /(!\[[^\]]*\]\()images\/([^)\s]+)(\))/g,
    (_, l, file, r) => `${l}${toStorageUrl(file)}${r}`,
  );
}

/* ─────────────────────────────────────────────
 * Posts
 * ───────────────────────────────────────────── */

/**
 * 글 모두 (초안 포함). admin 페이지에서 사용.
 * RLS 가 본인 글만 보이게 자동 필터링한다 (authenticated 세션 필수).
 */
export async function getAllPosts(): Promise<MockPost[]> {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from('posts')
    .select(POST_SELECT)
    .order('updated_at', { ascending: false });

  if (error) throw new Error(`getAllPosts: ${error.message}`);
  return (data as unknown as PostRow[]).map(toMockPost);
}

/** 발행된 글 모두. 시간순(최신 → 오래된). */
export async function getAllPublishedPosts(): Promise<MockPost[]> {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from('posts')
    .select(POST_SELECT)
    .eq('published', true)
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (error) throw new Error(`getAllPublishedPosts: ${error.message}`);
  return (data as unknown as PostRow[]).map(toMockPost);
}

/** 메인 피드 — 최근 글 N 개. */
export async function getRecentPosts(limit = 10): Promise<MockPost[]> {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from('posts')
    .select(POST_SELECT)
    .eq('published', true)
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(`getRecentPosts: ${error.message}`);
  return (data as unknown as PostRow[]).map(toMockPost);
}

/** 슬러그로 단일 글. 없으면 null. */
export async function getPostBySlug(slug: string): Promise<MockPost | null> {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from('posts')
    .select(POST_SELECT)
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle();

  if (error) throw new Error(`getPostBySlug(${slug}): ${error.message}`);
  return data ? toMockPost(data as unknown as PostRow) : null;
}

/**
 * 백링크 — 특정 slug 를 본문에 [[...]] 로 참조하는 *발행된* 글들.
 * 자기 자신은 제외.
 *
 * 구현: ilike 1차 필터 + JS 에서 정확 매칭 (mock 과 동일 의미).
 * 글 100~1000개 규모에서 충분히 빠름.
 */
export async function getBacklinksTo(slug: string): Promise<MockPost[]> {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from('posts')
    .select(POST_SELECT)
    .eq('published', true)
    .neq('slug', slug)
    .ilike('body_md', `%[[${slug}%`)
    .order('published_at', { ascending: false, nullsFirst: false });

  if (error) throw new Error(`getBacklinksTo(${slug}): ${error.message}`);

  // 정확 매칭 — extractSlugs 가 추출한 slug 목록에 정말 들어 있는지
  const rows = (data as unknown as PostRow[]).filter((r) =>
    extractSlugs(r.body_md).includes(slug),
  );
  return rows.map(toMockPost);
}

/**
 * 직접 링크된 글들 — 특정 slug 의 본문이 [[...]] 로 가리키는 *발행된* 글들.
 * 존재하지 않는 슬러그는 제외 (stub 은 표시 안 함).
 */
export async function getOutgoingLinksFrom(slug: string): Promise<MockPost[]> {
  const post = await getPostBySlug(slug);
  if (!post) return [];

  const targets = extractSlugs(post.body_md);
  if (targets.length === 0) return [];

  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from('posts')
    .select(POST_SELECT)
    .eq('published', true)
    .in('slug', targets);

  if (error) throw new Error(`getOutgoingLinksFrom(${slug}): ${error.message}`);

  return (data as unknown as PostRow[])
    .map(toMockPost)
    .sort((a, b) => a.title.localeCompare(b.title, 'ko'));
}

/** 한 카테고리(또는 그 자손 카테고리들)에 속한 발행 글들. */
export async function getPostsByCategorySlug(catSlug: string): Promise<MockPost[]> {
  const supabase = await createSupabaseServer();

  // 자손 포함: 'ai' 요청 → 'ai/deep-learning', 'ai/machine-learning' 도 포함.
  // categories.slug 에 슬래시가 들어 있는 구조라서 LIKE 로 처리 가능.
  const { data: catIds, error: catErr } = await supabase
    .from('categories')
    .select('id')
    .or(`slug.eq.${catSlug},slug.like.${catSlug}/%`);
  if (catErr) throw new Error(`getPostsByCategorySlug categories: ${catErr.message}`);
  if (!catIds || catIds.length === 0) return [];

  const ids = catIds.map((c) => c.id);

  const { data, error } = await supabase
    .from('posts')
    .select(POST_SELECT)
    .eq('published', true)
    .in('category_id', ids)
    .order('sort_order', { ascending: true })
    .order('published_at', { ascending: false, nullsFirst: false });

  if (error) throw new Error(`getPostsByCategorySlug posts: ${error.message}`);
  return (data as unknown as PostRow[]).map(toMockPost);
}

/** 본문 위키링크 stub 판정에 쓸, 발행 글의 slug 집합. */
export async function getKnownSlugs(): Promise<ReadonlySet<string>> {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from('posts')
    .select('slug')
    .eq('published', true);
  if (error) throw new Error(`getKnownSlugs: ${error.message}`);
  return new Set((data ?? []).map((r) => r.slug));
}

/* ─────────────────────────────────────────────
 * Categories
 * ───────────────────────────────────────────── */

export async function getAllCategories(): Promise<MockCategory[]> {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from('categories')
    .select(CATEGORY_SELECT)
    .order('sort_order', { ascending: true });
  if (error) throw new Error(`getAllCategories: ${error.message}`);
  return (data as unknown as CategoryRow[]).map(toMockCategory);
}

export async function getCategoryBySlug(slug: string): Promise<MockCategory | null> {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from('categories')
    .select(CATEGORY_SELECT)
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw new Error(`getCategoryBySlug(${slug}): ${error.message}`);
  return data ? toMockCategory(data as unknown as CategoryRow) : null;
}

/**
 * 카테고리를 부모-자식 트리로 묶어 반환. 사이드바 FolderTree 가 소비.
 * 정렬: sort_order 오름차순.
 */
export async function getCategoryTree(): Promise<CategoryTreeNode[]> {
  const supabase = await createSupabaseServer();

  const [catsRes, postsRes] = await Promise.all([
    supabase.from('categories').select(CATEGORY_SELECT).order('sort_order', { ascending: true }),
    supabase.from('posts').select('category:category_id(slug)').eq('published', true),
  ]);

  if (catsRes.error) throw new Error(`getCategoryTree categories: ${catsRes.error.message}`);
  if (postsRes.error) throw new Error(`getCategoryTree posts: ${postsRes.error.message}`);

  const all = (catsRes.data as unknown as CategoryRow[]).map(toMockCategory);

  // slug → 직접 글 수
  // Supabase 의 join 결과는 단일 FK여도 배열 타입으로 추론됨 → 안전하게 첫 원소만 사용.
  const directPostCount = new Map<string, number>();
  for (const p of (postsRes.data ?? []) as unknown as Array<{
    category: { slug: string } | { slug: string }[] | null;
  }>) {
    const cat = Array.isArray(p.category) ? p.category[0] : p.category;
    if (!cat) continue;
    directPostCount.set(cat.slug, (directPostCount.get(cat.slug) ?? 0) + 1);
  }

  // slug → tree node 초기화
  const nodes = new Map<string, CategoryTreeNode>();
  for (const cat of all) {
    nodes.set(cat.slug, {
      category: cat,
      children: [],
      postCount: directPostCount.get(cat.slug) ?? 0,
    });
  }

  // 부모-자식 연결
  const roots: CategoryTreeNode[] = [];
  for (const cat of all) {
    const node = nodes.get(cat.slug)!;
    if (cat.parent_slug) {
      const parent = nodes.get(cat.parent_slug);
      if (parent) parent.children.push(node);
      else roots.push(node);
    } else {
      roots.push(node);
    }
  }

  function sortChildren(node: CategoryTreeNode) {
    node.children.sort((a, b) => a.category.sort_order - b.category.sort_order);
    node.children.forEach(sortChildren);
  }
  roots.forEach(sortChildren);

  return roots;
}
