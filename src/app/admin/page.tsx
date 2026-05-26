// 어드민 대시보드 — 단일 작성자 전용. 미들웨어가 인증 가드.

import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '어드민',
  robots: { index: false, follow: false },
};

export default function AdminHomePage() {
  return (
    <div className="mx-auto max-w-screen-md px-4 py-12 sm:px-6 sm:py-16">
      <p className="text-xs font-medium uppercase tracking-wider text-accent">Admin</p>
      <h1 className="text-display mt-2 text-3xl font-bold tracking-tight">손수레 어드민</h1>
      <p className="mt-3 text-foreground-soft">
        본인 글을 작성·수정·삭제하는 영역입니다.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <AdminCard
          href="/admin/posts"
          title="글 관리"
          description="모든 글(초안 포함) 목록·검색·수정·삭제"
        />
        <AdminCard
          href="/admin/posts/new"
          title="새 글 작성"
          description="에디터 — 마크다운 + 라이브 미리보기"
          accent
        />
        <AdminCard
          href="/admin/categories"
          title="카테고리 관리"
          description="카테고리 추가·삭제, 계층 구조 설정"
        />
      </div>
    </div>
  );
}

function AdminCard({
  href,
  title,
  description,
  accent,
}: {
  href: string;
  title: string;
  description: string;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`lift-on-hover rounded-2xl border p-5 transition-colors sm:p-6 ${
        accent
          ? 'border-accent/40 bg-accent-soft hover:border-accent/70'
          : 'border-border bg-background-soft hover:border-border-strong'
      }`}
    >
      <h2 className="text-display text-lg font-bold tracking-tight">{title}</h2>
      <p className="mt-1.5 text-sm text-foreground-soft">{description}</p>
      <span aria-hidden className="arrow-shift mt-3 inline-block text-sm text-foreground-mute">
        →
      </span>
    </Link>
  );
}
