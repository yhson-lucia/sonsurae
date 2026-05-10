// 백링크 패널 — 이 글을 [[...]] 로 참조하는 다른 글들 + 이 글이 가리키는 다른 글들.
// Obsidian 그래프뷰의 사이드 패널에 해당.

import Link from 'next/link';

import type { MockPost } from '@/lib/mock/types';

interface Props {
  /** 이 글을 참조하는 글들 (incoming). */
  backlinks: MockPost[];
  /** 이 글이 참조하는 글들 (outgoing, stub 제외). */
  outgoingLinks: MockPost[];
}

export function BacklinksPanel({ backlinks, outgoingLinks }: Props) {
  if (backlinks.length === 0 && outgoingLinks.length === 0) return null;

  return (
    <aside
      aria-label="관련 노트"
      className="mt-12 grid gap-6 rounded-2xl border border-border bg-background-soft p-6 sm:grid-cols-2 sm:p-7"
    >
      <Section
        title="이 글이 참조하는 노트"
        subtitle="본문에 [[...]] 로 직접 연결한 글들"
        posts={outgoingLinks}
        emptyHint="본문에서 다른 글을 참조하지 않습니다."
      />
      <Section
        title="이 글을 참조한 노트"
        subtitle="다른 글이 이 노트를 [[...]] 로 가리킵니다"
        posts={backlinks}
        emptyHint="아직 이 글을 참조하는 글이 없어요."
        accent="warm"
      />
    </aside>
  );
}

function Section({
  title,
  subtitle,
  posts,
  emptyHint,
  accent = 'accent',
}: {
  title: string;
  subtitle: string;
  posts: MockPost[];
  emptyHint: string;
  accent?: 'accent' | 'warm';
}) {
  const eyebrowColor = accent === 'warm' ? 'text-warm' : 'text-accent';
  return (
    <section>
      <p className={`text-xs font-medium uppercase tracking-wider ${eyebrowColor}`}>
        {title}
      </p>
      <p className="mt-1 text-xs text-foreground-mute">{subtitle}</p>

      {posts.length === 0 ? (
        <p className="mt-3 text-sm text-foreground-mute">{emptyHint}</p>
      ) : (
        <ul className="mt-3 space-y-1.5">
          {posts.map((p) => (
            <li key={p.id}>
              <Link
                href={`/posts/${p.slug}`}
                className="group inline-flex items-baseline gap-2 rounded px-1 py-0.5 text-sm transition-colors hover:bg-background"
              >
                <span className="font-medium text-foreground group-hover:text-accent">
                  {p.title}
                </span>
                <span className="text-xs text-foreground-mute">
                  {p.category.name}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
