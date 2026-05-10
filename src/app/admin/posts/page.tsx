// /admin/posts — 모든 글 목록 (초안 포함). RLS 가 본인 글만 보이도록 자동 필터링.

import type { Metadata } from 'next';
import Link from 'next/link';

import { formatShortDate } from '@/lib/format';
import { getAllPosts } from '@/lib/mock/queries';

export const metadata: Metadata = {
  title: '글 관리',
  robots: { index: false, follow: false },
};

export default async function AdminPostsPage() {
  const posts = await getAllPosts();

  return (
    <div className="mx-auto max-w-screen-lg px-4 py-12 sm:px-6 sm:py-16">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-accent">Admin · Posts</p>
          <h1 className="text-display mt-2 text-3xl font-bold tracking-tight">글 관리</h1>
          <p className="mt-2 text-sm text-foreground-soft">총 {posts.length}편</p>
        </div>
        <Link
          href="/admin/posts/new"
          className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background hover:shadow-glow"
        >
          + 새 글
        </Link>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-background-soft">
        <table className="w-full text-sm">
          <thead className="bg-background-mute text-xs uppercase tracking-wider text-foreground-soft">
            <tr>
              <th className="px-4 py-3 text-left font-medium">제목</th>
              <th className="px-4 py-3 text-left font-medium">카테고리</th>
              <th className="px-4 py-3 text-left font-medium">상태</th>
              <th className="px-4 py-3 text-left font-medium">발행일</th>
              <th className="px-4 py-3 text-right font-medium">액션</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="px-4 py-3">
                  <Link href={`/posts/${p.slug}`} className="font-medium text-foreground hover:text-accent">
                    {p.title}
                  </Link>
                  <p className="font-mono text-xs text-foreground-mute">/{p.slug}</p>
                </td>
                <td className="px-4 py-3 text-foreground-soft">{p.category.name}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      p.published
                        ? 'bg-accent-soft text-accent'
                        : 'bg-background-mute text-foreground-soft'
                    }`}
                  >
                    {p.published ? '발행' : '초안'}
                  </span>
                </td>
                <td className="px-4 py-3 text-foreground-mute">
                  {formatShortDate(p.published_at)}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/posts/${p.id}/edit`}
                    className="text-sm text-foreground-soft hover:text-accent"
                  >
                    수정
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
