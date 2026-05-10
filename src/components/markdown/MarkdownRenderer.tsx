// 손수레 마크다운 렌더러.
//
// react-markdown 위에 다음 파이프라인:
//   1. preprocessMarkdown → [[wikilink]] 를 HTML 앵커로 치환
//   2. remark-gfm           — 표, 체크리스트, 자동 링크
//   3. remark-math          — $...$ / $$...$$ 인식
//   4. rehype-raw           — preprocess 가 만든 HTML 앵커 통과
//   5. rehype-shiki         — 코드 블록 syntax highlighting (vitesse light + dark 듀얼)
//   6. rehype-katex         — LaTeX 렌더
//
// 위키링크는 components.a 에서 className 을 보고 next/Link 로 감싸 클라이언트 라우팅을 살린다.
// 외부 링크는 새 창으로 연다 (rel=noopener).

import type { ComponentProps } from 'react';
import Link from 'next/link';
import ReactMarkdown, { type Components } from 'react-markdown';
import rehypeShikiFromHighlighter from '@shikijs/rehype/core';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

import { preprocessMarkdown } from '@/lib/markdown';
import { getHighlighter, SHIKI_THEMES } from '@/lib/markdown-highlighter';

interface Props {
  /** 본문 마크다운 원문. */
  source: string;
  /** 존재하는 글의 slug 집합. 미제공 시 stub 판정 안 함 (전부 정상 링크 취급). */
  knownSlugs?: ReadonlySet<string>;
  /** 추가 클래스 — 가장 바깥 wrapper 에 적용. */
  className?: string;
}

const COMPONENTS: Components = {
  a: AnchorRenderer,
};

export async function MarkdownRenderer({ source, knownSlugs, className }: Props) {
  const { markdown } = preprocessMarkdown(source, knownSlugs);
  const highlighter = await getHighlighter();

  return (
    <div className={['prose-study', className].filter(Boolean).join(' ')}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[
          rehypeRaw,
          [
            rehypeShikiFromHighlighter,
            highlighter,
            {
              themes: SHIKI_THEMES,
              // 'light' = light 색상은 inline style 로, dark 색상은 --shiki-dark CSS 변수로.
              // globals.css 의 [data-theme="dark"] 셀렉터가 dark 변수로 스왑한다.
              defaultColor: 'light',
            },
          ],
          rehypeKatex,
        ]}
        components={COMPONENTS}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}

/* ─────────────────────────────────────────────
 * 앵커 렌더러
 * ───────────────────────────────────────────── */

function AnchorRenderer({
  href,
  className,
  children,
  ...rest
}: ComponentProps<'a'>) {
  const cls = className ?? '';
  const isWikilink = cls.includes('wikilink');
  const isExternal =
    !!href && (href.startsWith('http://') || href.startsWith('https://'));

  if (isWikilink && href) {
    return (
      <Link href={href} className={cls} {...rest}>
        {children}
      </Link>
    );
  }

  if (isExternal) {
    return (
      <a
        href={href}
        className={cls}
        target="_blank"
        rel="noopener noreferrer"
        {...rest}
      >
        {children}
      </a>
    );
  }

  return (
    <a href={href} className={cls} {...rest}>
      {children}
    </a>
  );
}
