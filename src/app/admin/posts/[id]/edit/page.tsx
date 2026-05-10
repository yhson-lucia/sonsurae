// /admin/posts/[id]/edit — 기존 글 수정 페이지.
// Phase 5 mock: id 가 mock post 의 id 와 일치하면 초기값 채움.

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { PostEditor } from '@/components/editor/PostEditor';
import {
  getAllCategories,
  getAllPosts,
  getKnownSlugs,
} from '@/lib/mock/queries';

export const metadata: Metadata = {
  title: '글 수정',
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: PageProps) {
  const { id } = await params;

  const [allPosts, allCats, knownSlugSet] = await Promise.all([
    getAllPosts(),
    getAllCategories(),
    getKnownSlugs(),
  ]);

  const post = allPosts.find((p) => p.id === id);
  if (!post) notFound();

  const categories = allCats.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
  }));
  const initialCategoryId =
    categories.find((c) => c.slug === post.category.slug)?.id ?? categories[0]?.id;

  const knownSlugs = Array.from(knownSlugSet).filter((s) => s !== post.slug);

  return (
    <PostEditor
      mode="edit"
      postId={post.id}
      initial={{
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        body_md: post.body_md,
        category_id: initialCategoryId,
        published: post.published,
      }}
      categories={categories}
      knownSlugs={knownSlugs}
    />
  );
}
