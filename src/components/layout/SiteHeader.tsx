import Link from 'next/link';

import { ThemeToggle } from './ThemeToggle';

const NAV: ReadonlyArray<{ href: string; label: string }> = [
  { href: '/', label: '홈' },
  { href: '/graph', label: '그래프' },
  { href: '/projects', label: '프로젝트' },
  { href: '/search', label: '검색' },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-screen-xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-label="손수레 홈"
          className="group flex items-center gap-2.5 text-base font-semibold tracking-tight"
        >
          {/* 로고 마크 — 미니 노드 그래프 */}
          <span aria-hidden className="relative inline-flex h-6 w-6 items-center justify-center">
            <svg viewBox="0 0 24 24" className="h-6 w-6">
              <line x1="6" y1="8"  x2="14" y2="6"  stroke="var(--graph-edge)" strokeWidth="1" />
              <line x1="14" y1="6" x2="18" y2="14" stroke="var(--graph-edge)" strokeWidth="1" />
              <line x1="6" y1="8"  x2="10" y2="18" stroke="var(--graph-edge)" strokeWidth="1" />
              <line x1="10" y1="18" x2="18" y2="14" stroke="var(--graph-edge)" strokeWidth="1" />
              <circle cx="6"  cy="8"  r="2"   fill="var(--graph-node)" />
              <circle cx="14" cy="6"  r="1.6" fill="var(--graph-node)" />
              <circle cx="18" cy="14" r="2.6" fill="var(--accent)" />
              <circle cx="10" cy="18" r="1.8" fill="var(--graph-node)" />
            </svg>
          </span>
          <span className="text-display tracking-tight">손수레</span>
        </Link>

        <nav aria-label="주요 내비게이션" className="ml-auto">
          <ul className="flex items-center gap-1 text-sm">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="relative rounded-full px-3.5 py-1.5 text-foreground-soft transition-colors hover:text-foreground"
                >
                  <span className="relative z-10">{item.label}</span>
                  <span
                    aria-hidden
                    className="absolute inset-0 -z-0 rounded-full bg-background-soft opacity-0 transition-opacity duration-200 group-hover:opacity-100 hover:opacity-100"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-1.5">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
