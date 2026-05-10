// /admin/posts/new — 새 글 작성 페이지.

import type { Metadata } from 'next';

import { PostEditor } from '@/components/editor/PostEditor';
import { getAllCategories, getKnownSlugs } from '@/lib/mock/queries';

export const metadata: Metadata = {
  title: '새 글',
  robots: { index: false, follow: false },
};

export default async function NewPostPage() {
  const [allCats, knownSlugSet] = await Promise.all([
    getAllCategories(),
    getKnownSlugs(),
  ]);
  const categories = allCats.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
  }));
  const knownSlugs = Array.from(knownSlugSet);

  return (
    <PostEditor
      mode="create"
      categories={categories}
      knownSlugs={knownSlugs}
    />
  );
}
