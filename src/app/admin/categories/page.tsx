import type { Metadata } from 'next';
import Link from 'next/link';

import { getAllCategories } from '@/lib/mock/queries';
import { CategoryManager } from './CategoryManager';

export const metadata: Metadata = {
  title: '카테고리 관리 — 어드민',
  robots: { index: false, follow: false },
};

export default async function CategoriesAdminPage() {
  const categories = await getAllCategories();

  return (
    <div className="mx-auto max-w-screen-md px-4 py-12 sm:px-6 sm:py-16">
      <div className="flex items-center gap-2 text-xs text-foreground-mute">
        <Link href="/admin" className="hover:text-foreground transition-colors">어드민</Link>
        <span>/</span>
        <span>카테고리 관리</span>
      </div>

      <p className="mt-4 text-xs font-medium uppercase tracking-wider text-accent">Admin</p>
      <h1 className="text-display mt-2 text-3xl font-bold tracking-tight">카테고리 관리</h1>
      <p className="mt-3 text-foreground-soft">
        카테고리를 추가하거나 삭제할 수 있습니다. 글이 있는 카테고리는 삭제되지 않습니다.
      </p>

      <CategoryManager categories={categories} />
    </div>
  );
}
