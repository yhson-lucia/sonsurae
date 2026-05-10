// 카테고리 슬러그 (예: 'ai/deep-learning') 를 단계별 링크 breadcrumb 으로 표시.
// 슬래시 단위로 잘라 각 단계가 카테고리 페이지로 연결되게.

import Link from 'next/link';

interface Props {
  /** 슬래시 포함 슬러그. 예: 'ai/deep-learning' */
  slug: string;
}

export function CategoryBreadcrumb({ slug }: Props) {
  const parts = slug.split('/');
  const items = parts.map((label, i) => ({
    label,
    href: `/category/${parts.slice(0, i + 1).join('/')}`,
  }));

  return (
    <nav aria-label="카테고리" className="flex flex-wrap items-center gap-1.5 text-sm text-foreground-soft">
      {items.map((item, i) => (
        <span key={item.href} className="inline-flex items-center gap-1.5">
          <Link
            href={item.href}
            className="rounded px-1.5 py-0.5 text-foreground-soft transition-colors hover:bg-background-soft hover:text-foreground"
          >
            {item.label}
          </Link>
          {i < items.length - 1 ? (
            <span aria-hidden className="text-foreground-mute">/</span>
          ) : null}
        </span>
      ))}
    </nav>
  );
}
