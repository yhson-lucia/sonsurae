// 글 상세 페이지 — /posts/[slug]
//
// Phase 3 단계: mock 데이터 사용. Phase 7 에서 Supabase 쿼리로 교체된다.
// 구성: 카테고리 breadcrumb + 제목/날짜 + MarkdownRenderer + BacklinksPanel + 다음/이전(추후).

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { BacklinksPanel } from '@/components/post/BacklinksPanel';
import { CategoryBreadcrumb } from '@/components/post/CategoryBreadcrumb';
import { MarkdownRenderer } from '@/components/markdown/MarkdownRenderer';
import { formatPublishedDate } from '@/lib/format';
import {
  getAllPublishedPosts,
  getBacklinksTo,
  getKnownSlugs,
  getOutgoingLinksFrom,
  getPostBySlug,
} from '@/lib/mock/queries';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllPublishedPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: '찾을 수 없는 글' };
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      type: 'article',
      publishedTime: post.published_at,
    },
  };
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const backlinks = getBacklinksTo(post.slug);
  const outgoingLinks = getOutgoingLinksFrom(post.slug);
  const knownSlugs = getKnownSlugs();

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      {/* Header */}
      <header className="border-b border-border pb-8">
        <CategoryBreadcrumb slug={post.category.slug} />
        <h1 className="text-display mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          {post.title}
        </h1>
        {post.excerpt ? (
          <p className="mt-3 text-base leading-relaxed text-foreground-soft sm:text-lg">
            {post.excerpt}
          </p>
        ) : null}
        <div className="mt-5 flex items-center gap-2 text-sm text-foreground-mute">
          <time dateTime={post.published_at}>
            {formatPublishedDate(post.published_at)}
          </time>
        </div>
      </header>

      {/* Body */}
      <div className="mt-10">
        <MarkdownRenderer source={post.body_md} knownSlugs={knownSlugs} />
      </div>

      {/* Backlinks + outgoing */}
      <BacklinksPanel backlinks={backlinks} outgoingLinks={outgoingLinks} />
    </article>
  );
}
