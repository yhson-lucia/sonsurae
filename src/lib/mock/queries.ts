// Mock 데이터를 쿼리하는 헬퍼.
// 실제 Supabase 쿼리와 같은 시그니처를 갖도록 의도적으로 비슷하게 짠다.
// Phase 7 에서 이 함수들의 본문만 Supabase 호출로 바꾸면 된다.

import { extractSlugs } from '@/lib/wikilinks';

import { MOCK_CATEGORIES } from './categories';
import { MOCK_POSTS } from './posts';
import type {
  CategoryTreeNode,
  MockCategory,
  MockPost,
} from './types';

/* ─────────────────────────────────────────────
 * Posts
 * ───────────────────────────────────────────── */

/** 발행된 글 모두. 시간순(최신 → 오래된). */
export function getAllPublishedPosts(): MockPost[] {
  return [...MOCK_POSTS]
    .filter((p) => p.published)
    .sort((a, b) => b.published_at.localeCompare(a.published_at));
}

/** 메인 피드 — 최근 글 N 개. */
export function getRecentPosts(limit = 10): MockPost[] {
  return getAllPublishedPosts().slice(0, limit);
}

/** 슬러그로 단일 글. 없으면 null. */
export function getPostBySlug(slug: string): MockPost | null {
  return MOCK_POSTS.find((p) => p.slug === slug && p.published) ?? null;
}

/**
 * 백링크 — 특정 slug 를 본문에 [[...]] 로 참조하는 *발행된* 글들.
 * 자기 자신은 제외.
 */
export function getBacklinksTo(slug: string): MockPost[] {
  return MOCK_POSTS.filter((p) => {
    if (!p.published) return false;
    if (p.slug === slug) return false;
    const refs = extractSlugs(p.body_md);
    return refs.includes(slug);
  }).sort((a, b) => b.published_at.localeCompare(a.published_at));
}

/**
 * 직접 링크된 글들 — 특정 slug 의 본문이 [[...]] 로 가리키는 *발행된* 글들.
 * 존재하지 않는 슬러그는 제외 (stub 은 표시 안 함).
 */
export function getOutgoingLinksFrom(slug: string): MockPost[] {
  const post = getPostBySlug(slug);
  if (!post) return [];
  const targets = extractSlugs(post.body_md);
  return targets
    .map((s) => getPostBySlug(s))
    .filter((p): p is MockPost => p !== null)
    .sort((a, b) => a.title.localeCompare(b.title, 'ko'));
}

/** 한 카테고리(또는 그 자손 카테고리들)에 속한 발행 글들. */
export function getPostsByCategorySlug(catSlug: string): MockPost[] {
  // 자식 카테고리도 포함: 'ai' 를 요청하면 'ai/deep-learning', 'ai/machine-learning' 도 포함.
  return getAllPublishedPosts().filter(
    (p) => p.category.slug === catSlug || p.category.slug.startsWith(`${catSlug}/`),
  );
}

/** 본문 위키링크 stub 판정에 쓸, 발행 글의 slug 집합. */
export function getKnownSlugs(): ReadonlySet<string> {
  return new Set(MOCK_POSTS.filter((p) => p.published).map((p) => p.slug));
}

/* ─────────────────────────────────────────────
 * Categories
 * ───────────────────────────────────────────── */

export function getAllCategories(): MockCategory[] {
  return [...MOCK_CATEGORIES].sort((a, b) => a.sort_order - b.sort_order);
}

export function getCategoryBySlug(slug: string): MockCategory | null {
  return MOCK_CATEGORIES.find((c) => c.slug === slug) ?? null;
}

/**
 * 카테고리를 부모-자식 트리로 묶어 반환. 사이드바 FolderTree 가 소비.
 * 정렬: sort_order 오름차순.
 */
export function getCategoryTree(): CategoryTreeNode[] {
  const all = getAllCategories();

  // slug → 직접 글 수 (자식 카테고리 미포함)
  const directPostCount = new Map<string, number>();
  for (const p of MOCK_POSTS) {
    if (!p.published) continue;
    directPostCount.set(p.category.slug, (directPostCount.get(p.category.slug) ?? 0) + 1);
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
      else roots.push(node); // 부모가 없으면 (외톨이) 루트 취급
    } else {
      roots.push(node);
    }
  }

  // children 도 sort_order 로 정렬
  function sortChildren(node: CategoryTreeNode) {
    node.children.sort((a, b) => a.category.sort_order - b.category.sort_order);
    node.children.forEach(sortChildren);
  }
  roots.forEach(sortChildren);

  return roots;
}
