// Shiki 싱글턴 하이라이터.
//
// react-markdown 의 rehype 단계에서 코드 블록을 색구분(syntax highlighting) 한다.
// Shiki 는 무거운 초기화 비용이 있으니 한 번 만들어 모듈 변수로 캐싱한다.
//
// 듀얼 테마: one-light + one-dark-pro (Atom One 페어 — 토큰별 색구분 선명).
//  - light/dark 둘 다 인라인 style 로 출력되고,
//  - globals.css 가 [data-theme="dark"] 일 때 dark 변수를 활성화한다.

import { createHighlighter, type Highlighter } from 'shiki';

// 미리 로드할 언어 — 마이그레이션 데이터(AI/백엔드/FE) 와 학습 노트에서 자주 쓰일 것들.
const LANGS = [
  'python',
  'typescript',
  'tsx',
  'javascript',
  'jsx',
  'java',
  'sql',
  'bash',
  'shell',
  'json',
  'yaml',
  'css',
  'html',
  'markdown',
  'go',
  'rust',
  'plaintext',
] as const;

const THEMES = ['one-light', 'one-dark-pro'] as const;

let cached: Highlighter | null = null;
let pending: Promise<Highlighter> | null = null;

/**
 * 싱글턴 highlighter — 첫 호출 시 비동기 초기화, 이후 캐시 반환.
 * Server Component 에서 await 으로 받아 rehypeShiki 에 넘긴다.
 */
export async function getHighlighter(): Promise<Highlighter> {
  if (cached) return cached;
  if (!pending) {
    pending = createHighlighter({
      themes: [...THEMES],
      langs: [...LANGS],
    }).then((h) => {
      cached = h;
      return h;
    });
  }
  return pending;
}

export const SHIKI_THEMES = {
  light: 'one-light',
  dark: 'one-dark-pro',
} as const;
