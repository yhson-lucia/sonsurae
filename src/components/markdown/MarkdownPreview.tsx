'use client';

// 에디터 라이브 미리보기용 마크다운 렌더러.
// Shiki 가 비동기 + 서버 전용이라 클라이언트에선 못 씀 → 코드 블록은 평범한 <pre><code> 로 둠.
// 그 외(KaTeX, GFM, 위키링크) 는 동일 처리.

import ReactMarkdown, { type Components } from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

import { preprocessMarkdown } from '@/lib/markdown';

interface Props {
  source: string;
  knownSlugs?: ReadonlySet<string>;
  className?: string;
}

const COMPONENTS: Components = {
  // 위키링크는 그냥 <a> — 미리보기에선 클라이언트 라우팅 무관
};

export function MarkdownPreview({ source, knownSlugs, className }: Props) {
  const { markdown } = preprocessMarkdown(source, knownSlugs);
  return (
    <div className={['prose-study', className].filter(Boolean).join(' ')}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeKatex]}
        components={COMPONENTS}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
