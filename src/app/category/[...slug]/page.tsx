// 카테고리 페이지 — /category/[...slug]
// 슬래시 슬러그(예: 'ai/deep-learning') 를 catch-all 로 받음.

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { CategoryBreadcrumb } from '@/components/post/CategoryBreadcrumb';
import { FolderTree } from '@/components/layout/FolderTree';
import { PostCard } from '@/components/post/PostCard';
import {
  getAllCategories,
  getCategoryBySlug,
  getCategoryTree,
  getPostsByCategorySlug,
} from '@/lib/mock/queries';

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

export async function generateStaticParams() {
  return getAllCategories().map((c) => ({ slug: c.slug.split('/') }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const slugStr = slug.join('/');
  const cat = getCategoryBySlug(slugStr);
  if (!cat) return { title: '카테고리를 찾을 수 없음' };
  return {
    title: cat.name,
    description: cat.description ?? undefined,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const slugStr = slug.join('/');
  const category = getCategoryBySlug(slugStr);
  if (!category) notFound();

  const posts = getPostsByCategorySlug(slugStr);
  const tree = getCategoryTree();

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-[16rem_1fr] lg:gap-12">
        {/* Sidebar — 모바일에서는 숨김. 카테고리 트리. */}
        <aside className="hidden lg:block">
          <div className="sticky top-20">
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-foreground-mute">
              카테고리
            </p>
            <FolderTree tree={tree} activeSlug={slugStr} />
          </div>
        </aside>

        {/* Main */}
        <div className="min-w-0">
          <header className="border-b border-border pb-6">
            <CategoryBreadcrumb slug={category.slug} />
            <div className="mt-3 flex items-baseline gap-3">
              {category.icon ? (
                <span aria-hidden className="text-3xl">
                  {category.icon}
                </span>
              ) : null}
              <h1 className="text-display text-3xl font-bold tracking-tight sm:text-4xl">
                {category.name}
              </h1>
            </div>
            {category.description ? (
              <p className="mt-3 text-base text-foreground-soft">
                {category.description}
              </p>
            ) : null}
            <p className="mt-4 text-sm text-foreground-mute">
              {posts.length === 0 ? '아직 글이 없어요.' : `총 ${posts.length}편`}
            </p>
          </header>

          {posts.length > 0 ? (
            <ul className="mt-8 grid grid-cols-1 gap-4 sm:gap-5">
              {posts.map((p) => (
                <li key={p.id}>
                  <PostCard post={p} />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  );
}
