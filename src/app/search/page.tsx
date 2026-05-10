// 검색 페이지 — /search
// Phase 6: 클라이언트 사이드 즉시 검색 (mock 데이터). Phase 7 이후 Supabase 트라이그램으로 전환 가능.

import type { Metadata } from 'next';

import { SearchInterface } from '@/components/search/SearchInterface';
import { getAllPublishedPosts } from '@/lib/mock/queries';

export const metadata: Metadata = {
  title: '검색',
  description: '손수레에 쌓인 글을 검색합니다.',
};

export default async function SearchPage() {
  const posts = await getAllPublishedPosts();

  // 클라이언트로 넘기는 최소 데이터 — 본문 포함 (검색 매칭에 필요)
  const minimal = posts.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    body_md: p.body_md,
    category_name: p.category.name,
    category_slug: p.category.slug,
    category_icon: p.category.icon,
    published_at: p.published_at,
  }));

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <header className="mx-auto max-w-3xl">
        <p className="text-xs font-medium uppercase tracking-wider text-accent">Search</p>
        <h1 className="text-display mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          글 찾기
        </h1>
        <p className="mt-3 text-base text-foreground-soft">
          제목·요약·본문·카테고리에서 단어를 찾습니다.
        </p>
      </header>

      <div className="mt-8">
        <SearchInterface posts={minimal} />
      </div>
    </div>
  );
}
