// 지식그래프 데이터 빌더.
//
// 두 종류 노드:
//   - 'post'     : 발행된 글. wikilinks(post_links) 로 서로 연결.
//   - 'category' : 글 카테고리. 글 → 카테고리(membership) + 자식 → 부모(hierarchy) 엣지.
//
// id 충돌 방지를 위해 prefix 사용 (`post:slug`, `cat:slug`). 라우팅 시 prefix 제거.
//
// stub(존재하지 않는 슬러그) 위키링크는 그래프에서 제외.

import { extractSlugs } from './wikilinks';
import type { MockCategory, MockPost } from './mock/types';

export type GraphNodeKind = 'post' | 'category';

export interface GraphNode {
  id: string;             // 'post:{slug}' or 'cat:{slug}' — globally unique
  kind: GraphNodeKind;
  slug: string;           // 원본 슬러그 (prefix 제거됨)
  title: string;          // post.title 또는 category.name
  group: string;          // 최상위 카테고리 슬러그 (예: 'ai') — 색 그룹핑
  parentSlug?: string;    // category 가 부모를 가질 때 (root 카테고리는 undefined)
}

export type GraphLinkKind = 'wikilink' | 'membership' | 'hierarchy';

export interface GraphLink {
  source: string;         // node.id
  target: string;
  kind: GraphLinkKind;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

const POST_PREFIX = 'post:';
const CAT_PREFIX = 'cat:';

function postNodeId(slug: string) { return POST_PREFIX + slug; }
function catNodeId(slug: string)  { return CAT_PREFIX + slug; }

/**
 * 글 + 카테고리 → 그래프 데이터.
 *
 * @param categories 비우면 카테고리 노드/엣지 없이 글-위키링크만 (구버전 호환).
 */
export function buildGraphFromPosts(
  posts: ReadonlyArray<MockPost>,
  categories: ReadonlyArray<MockCategory> = [],
): GraphData {
  const slugSet = new Set(posts.map((p) => p.slug));
  const catSlugSet = new Set(categories.map((c) => c.slug));

  /* ─── 노드 ─── */
  const postNodes: GraphNode[] = posts.map((p) => ({
    id: postNodeId(p.slug),
    kind: 'post',
    slug: p.slug,
    title: p.title,
    group: p.category.slug.split('/')[0],
  }));

  const catNodes: GraphNode[] = categories.map((c) => ({
    id: catNodeId(c.slug),
    kind: 'category',
    slug: c.slug,
    title: c.name,
    group: c.slug.split('/')[0],
    parentSlug: c.parent_slug ?? undefined,
  }));

  /* ─── 엣지 1) 글 ↔ 글 (위키링크) ─── */
  const seen = new Set<string>();
  const wikilinkLinks: GraphLink[] = [];
  for (const p of posts) {
    for (const t of extractSlugs(p.body_md)) {
      if (t === p.slug) continue;
      if (!slugSet.has(t)) continue;        // stub 제외
      const key = `${p.slug}->${t}`;
      if (seen.has(key)) continue;
      seen.add(key);
      wikilinkLinks.push({
        source: postNodeId(p.slug),
        target: postNodeId(t),
        kind: 'wikilink',
      });
    }
  }

  /* ─── 엣지 2) 글 → 카테고리 (membership) ─── */
  const membershipLinks: GraphLink[] = catNodes.length === 0
    ? []
    : posts
        .filter((p) => catSlugSet.has(p.category.slug))
        .map((p) => ({
          source: postNodeId(p.slug),
          target: catNodeId(p.category.slug),
          kind: 'membership' as const,
        }));

  /* ─── 엣지 3) 자식 카테고리 → 부모 카테고리 (hierarchy) ─── */
  const hierarchyLinks: GraphLink[] = categories
    .filter((c) => c.parent_slug && catSlugSet.has(c.parent_slug))
    .map((c) => ({
      source: catNodeId(c.slug),
      target: catNodeId(c.parent_slug as string),
      kind: 'hierarchy' as const,
    }));

  return {
    nodes: [...postNodes, ...catNodes],
    links: [...wikilinkLinks, ...membershipLinks, ...hierarchyLinks],
  };
}

/**
 * 한 글 주변 1-hop 이웃 (위키링크 기준) + 그 글이 속한 카테고리.
 * 글 상세의 MiniGraph 용.
 */
export function buildLocalGraph(
  posts: ReadonlyArray<MockPost>,
  centerSlug: string,
  categories: ReadonlyArray<MockCategory> = [],
): GraphData {
  const full = buildGraphFromPosts(posts, categories);
  const center = postNodeId(centerSlug);

  // 위키링크 엣지로만 1-hop 이웃 산출 (membership/hierarchy 는 거의 모든 글이 잡혀 의미 X)
  const neighbors = new Set<string>([center]);
  for (const link of full.links) {
    if (link.kind !== 'wikilink') continue;
    if (link.source === center) neighbors.add(link.target);
    if (link.target === center) neighbors.add(link.source);
  }

  // 중심 글의 카테고리 노드도 함께 (있다면) 포함
  const centerPost = posts.find((p) => p.slug === centerSlug);
  if (centerPost) {
    const catId = catNodeId(centerPost.category.slug);
    if (full.nodes.some((n) => n.id === catId)) neighbors.add(catId);
  }

  return {
    nodes: full.nodes.filter((n) => neighbors.has(n.id)),
    links: full.links.filter(
      (l) => neighbors.has(l.source) && neighbors.has(l.target),
    ),
  };
}
