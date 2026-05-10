import Link from 'next/link';

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative mt-20 border-t border-border/60 bg-background-soft">
      {/* 상단 그라디언트 헤어라인 */}
      <div
        aria-hidden
        className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent"
      />

      <div className="mx-auto flex max-w-screen-xl flex-col gap-3 px-4 py-10 text-sm text-foreground-soft sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p className="flex items-center gap-2">
          <span className="text-display font-medium text-foreground">손수레</span>
          <span aria-hidden className="text-foreground-mute">·</span>
          <span>Learning in public</span>
          <span aria-hidden className="text-foreground-mute">·</span>
          <span>© {year}</span>
        </p>
        <nav aria-label="푸터 내비게이션">
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <li>
              <Link href="/about" className="transition-colors hover:text-foreground">
                소개
              </Link>
            </li>
            <li>
              <Link href="/graph" className="transition-colors hover:text-foreground">
                지식그래프
              </Link>
            </li>
            <li>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-foreground"
              >
                GitHub
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
