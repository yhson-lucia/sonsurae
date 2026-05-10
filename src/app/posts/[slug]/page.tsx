// 글 상세 페이지 — /posts/[slug]
//
// Phase 3 단계: mock 데이터 사용. Phase 7 에서 Supabase 쿼리로 교체된다.
// 구성: 카테고리 breadcrumb + 제목/날짜 + MarkdownRenderer + BacklinksPanel + 다음/이전(추후).

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { BacklinksPanel } from '@/components/post/BacklinksPanel';
import { CategoryBreadcrumb } from '@/components/post/CategoryBreadcrumb';
import { MarkdownRenderer } from '@/components/markdown/MarkdownRenderer';
import { MiniGraph } from '@/components/post/MiniGraph';
import { env } from '@/lib/env';
import { formatPublishedDate } from '@/lib/format';
import {
  getAllCategories,
  getAllPublishedPosts,
  getBacklinksTo,
  getKnownSlugs,
  getOutgoingLinksFrom,
  getPostBySlug,
} from '@/lib/mock/queries';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// generateStaticParams 는 cookies() 를 쓸 수 없어 제거.
// 대신 ISR — 60 초마다 재생성.
export const revalidate = 60;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
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
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const [backlinks, outgoingLinks, knownSlugs, allPosts, allCategories] = await Promise.all([
    getBacklinksTo(post.slug),
    getOutgoingLinksFrom(post.slug),
    getKnownSlugs(),
    getAllPublishedPosts(),
    getAllCategories(),
  ]);

  // JSON-LD — TechArticle + BreadcrumbList. 학습/기술 글이라 TechArticle 사용.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'TechArticle',
        headline: post.title,
        description: post.excerpt ?? undefined,
        image: post.cover_image_url ?? undefined,
        datePublished: post.published_at,
        dateModified: post.published_at,
        inLanguage: 'ko',
        author: { '@type': 'Person', name: '손수레' },
        publisher: {
          '@type': 'Organization',
          name: '손수레',
        },
        articleSection: post.category.name,
        mainEntityOfPage: `${env.siteUrl}/posts/${post.slug}`,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: '홈', item: env.siteUrl },
          ...post.category.slug.split('/').map((seg, i, arr) => ({
            '@type': 'ListItem',
            position: i + 2,
            name: seg,
            item: `${env.siteUrl}/category/${arr.slice(0, i + 1).join('/')}`,
          })),
          {
            '@type': 'ListItem',
            position: post.category.slug.split('/').length + 2,
            name: post.title,
          },
        ],
      },
    ],
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      {/* JSON-LD — non-executing data island, no Next/Script needed */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

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

      {/* Mini graph — 1-hop 이웃 */}
      <MiniGraph posts={allPosts} centerSlug={post.slug} categories={allCategories} />
    </article>
  );
}
