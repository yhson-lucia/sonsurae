import { describe, expect, it } from 'vitest';

import { buildGraphFromPosts, buildLocalGraph } from './graph';
import type { MockCategory, MockPost } from './mock/types';

function p(over: Partial<MockPost> & Pick<MockPost, 'slug' | 'body_md'>): MockPost {
  return {
    id: `post-${over.slug}`,
    title: over.slug,
    excerpt: null,
    cover_image_url: null,
    category: { slug: 'ai', name: 'AI', icon: null, color: null },
    parent_post_slug: null,
    published: true,
    published_at: '2026-01-01T00:00:00+09:00',
    sort_order: 0,
    ...over,
  };
}

function c(over: Partial<MockCategory> & Pick<MockCategory, 'slug'>): MockCategory {
  return {
    id: `cat-${over.slug}`,
    name: over.slug,
    description: null,
    icon: null,
    color: null,
    parent_slug: null,
    sort_order: 0,
    ...over,
  };
}

/* ────────────────── buildGraphFromPosts ────────────────── */

describe('buildGraphFromPosts (post-only mode)', () => {
  it('카테고리 미제공 시 카테고리 노드/엣지 없음 (구버전 호환)', () => {
    const posts = [p({ slug: 'a', body_md: '[[b]]' }), p({ slug: 'b', body_md: '' })];
    const g = buildGraphFromPosts(posts);
    expect(g.nodes.every((n) => n.kind === 'post')).toBe(true);
    expect(g.links.every((l) => l.kind === 'wikilink')).toBe(true);
  });

  it('각 글마다 post 노드 (id prefix=post:)', () => {
    const g = buildGraphFromPosts([p({ slug: 'a', body_md: '' })]);
    expect(g.nodes[0].id).toBe('post:a');
    expect(g.nodes[0].kind).toBe('post');
  });

  it('본문 위키링크 → wikilink 엣지 (prefix 적용)', () => {
    const posts = [p({ slug: 'a', body_md: '[[b]]' }), p({ slug: 'b', body_md: '' })];
    const g = buildGraphFromPosts(posts);
    expect(g.links).toEqual([{ source: 'post:a', target: 'post:b', kind: 'wikilink' }]);
  });

  it('stub(존재하지 않는 슬러그)/자기참조/중복은 제외', () => {
    const posts = [
      p({ slug: 'a', body_md: '[[ghost]] [[a]] [[b]] [[b]]' }),
      p({ slug: 'b', body_md: '' }),
    ];
    const g = buildGraphFromPosts(posts);
    expect(g.links).toHaveLength(1);
    expect(g.links[0].target).toBe('post:b');
  });

  it('group = 최상위 카테고리 슬러그', () => {
    const post = p({
      slug: 'x',
      body_md: '',
      category: { slug: 'ai/deep-learning', name: '딥러닝', icon: null, color: null },
    });
    const g = buildGraphFromPosts([post]);
    expect(g.nodes[0].group).toBe('ai');
  });
});

describe('buildGraphFromPosts (with categories)', () => {
  const posts = [
    p({ slug: 'a', body_md: '[[b]]', category: { slug: 'ai', name: 'AI', icon: null, color: null } }),
    p({ slug: 'b', body_md: '', category: { slug: 'ai/deep-learning', name: '딥러닝', icon: null, color: null } }),
  ];
  const cats = [
    c({ slug: 'ai' }),
    c({ slug: 'ai/deep-learning', parent_slug: 'ai' }),
  ];

  it('카테고리도 노드로 추가됨 (id prefix=cat:)', () => {
    const g = buildGraphFromPosts(posts, cats);
    const catNodes = g.nodes.filter((n) => n.kind === 'category');
    expect(catNodes.map((n) => n.id).sort()).toEqual(['cat:ai', 'cat:ai/deep-learning']);
  });

  it('각 글 → 카테고리 membership 엣지 생성', () => {
    const g = buildGraphFromPosts(posts, cats);
    const mem = g.links.filter((l) => l.kind === 'membership');
    expect(mem).toEqual(
      expect.arrayContaining([
        { source: 'post:a', target: 'cat:ai', kind: 'membership' },
        { source: 'post:b', target: 'cat:ai/deep-learning', kind: 'membership' },
      ]),
    );
  });

  it('자식 카테고리 → 부모 카테고리 hierarchy 엣지', () => {
    const g = buildGraphFromPosts(posts, cats);
    const h = g.links.filter((l) => l.kind === 'hierarchy');
    expect(h).toEqual([
      { source: 'cat:ai/deep-learning', target: 'cat:ai', kind: 'hierarchy' },
    ]);
  });

  it('카테고리 노드의 parentSlug 가 채워짐', () => {
    const g = buildGraphFromPosts(posts, cats);
    const dl = g.nodes.find((n) => n.id === 'cat:ai/deep-learning')!;
    expect(dl.parentSlug).toBe('ai');
    const root = g.nodes.find((n) => n.id === 'cat:ai')!;
    expect(root.parentSlug).toBeUndefined();
  });
});

/* ────────────────── buildLocalGraph ────────────────── */

describe('buildLocalGraph', () => {
  const posts = [
    p({ slug: 'a', body_md: '[[b]]' }),
    p({ slug: 'b', body_md: '[[c]]' }),
    p({ slug: 'c', body_md: '[[d]]' }),
    p({ slug: 'd', body_md: '' }),
    p({ slug: 'lonely', body_md: '' }),
  ];

  it('중심 + 1-hop 이웃 + 그 사이 wikilink 엣지', () => {
    const g = buildLocalGraph(posts, 'b');
    const ids = g.nodes.map((n) => n.id).sort();
    expect(ids).toEqual(['post:a', 'post:b', 'post:c']);
  });

  it('연결 안 된 외톨이는 제외', () => {
    const g = buildLocalGraph(posts, 'a');
    expect(g.nodes.map((n) => n.id)).not.toContain('post:lonely');
  });

  it('카테고리 제공 시 중심 글의 카테고리 노드도 포함', () => {
    const cats = [c({ slug: 'ai' })];
    const g = buildLocalGraph(posts, 'b', cats);
    expect(g.nodes.some((n) => n.id === 'cat:ai')).toBe(true);
  });
});
