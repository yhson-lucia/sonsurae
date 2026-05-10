'use client';

// 클라이언트 검색 인터페이스. 페이지 로드 시 mock 글 데이터를 받아두고 입력창 입력에 따라 즉시 필터.
// Phase 7 이후 Postgres 트라이그램으로 전환 가능 — 그때는 server action 으로 옮기면 됨.

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';

import { searchDocs, type SearchableDoc } from '@/lib/search';

interface PostMin extends SearchableDoc {
  published_at: string;
  category_slug: string;
  category_icon: string | null;
}

interface Props {
  posts: ReadonlyArray<PostMin>;
}

export function SearchInterface({ posts }: Props) {
  const [q, setQ] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const hits = useMemo(() => searchDocs(posts, q), [posts, q]);

  return (
    <div className="mx-auto max-w-3xl">
      {/* 검색 입력 */}
      <div className="relative">
        <input
          ref={inputRef}
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="제목, 본문, 카테고리에서 찾기"
          className="w-full rounded-2xl border border-border-strong bg-background-soft px-5 py-4 text-base text-foreground placeholder:text-foreground-mute focus:border-accent focus:outline-none"
          aria-label="검색"
        />
        {q ? (
          <button
            type="button"
            onClick={() => setQ('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-foreground-mute hover:bg-background hover:text-foreground"
            aria-label="입력 지우기"
          >
            ✕
          </button>
        ) : null}
      </div>

      {/* 결과 */}
      <div className="mt-6">
        {q.trim() === '' ? (
          <p className="text-sm text-foreground-mute">
            검색어를 입력하면 결과가 즉시 보입니다.
          </p>
        ) : hits.length === 0 ? (
          <p className="text-sm text-foreground-mute">
            <strong className="text-foreground">{q}</strong> 와 매칭되는 글이 없어요.
          </p>
        ) : (
          <>
            <p className="text-xs text-foreground-mute">
              {hits.length}개 결과
            </p>
            <ul className="mt-3 space-y-3">
              {hits.map((h) => (
                <li key={h.doc.id}>
                  <Link
                    href={`/posts/${h.doc.slug}`}
                    className="lift-on-hover block rounded-2xl border border-border bg-background-soft p-5 sm:p-6"
                  >
                    <div className="flex items-center gap-2 text-xs text-foreground-mute">
                      {h.doc.category_name ? (
                        <span className="rounded-full border border-border-strong bg-background px-2 py-0.5 font-medium text-foreground-soft">
                          {h.doc.category_name}
                        </span>
                      ) : null}
                      <span className="font-mono">{h.doc.slug}</span>
                    </div>
                    <h3 className="text-display mt-2 text-lg font-bold tracking-tight">
                      <Highlight text={h.doc.title} query={q} />
                    </h3>
                    {h.snippet ? (
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-foreground-soft">
                        <Highlight text={h.snippet} query={q} />
                      </p>
                    ) : h.doc.excerpt ? (
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-foreground-soft">
                        {h.doc.excerpt}
                      </p>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

/* 매칭 토큰 하이라이트 — case-insensitive */
function Highlight({ text, query }: { text: string; query: string }) {
  const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return <>{text}</>;

  // 가장 긴 토큰부터 매칭 (단순 처리)
  const re = new RegExp(`(${tokens.map(escapeRegex).join('|')})`, 'gi');
  const parts = text.split(re);
  return (
    <>
      {parts.map((part, i) =>
        re.test(part) ? (
          <mark
            key={i}
            className="rounded bg-accent-soft px-0.5 text-foreground"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
