// 마크다운 전처리.
//
// 본문에 등장한 [[slug]] / [[slug|label]] / [[slug#anchor]] / [[slug#anchor|label]] 를
// react-markdown 에서 렌더 가능한 HTML 앵커로 변환한다 (rehype-raw 가 이걸 통과시킴).
//
// stub 판정: knownSlugs 가 주어지고 그 안에 슬러그가 없으면 stub 클래스를 추가.
// 실제 라우팅은 components.a 에서 className 을 보고 처리한다.

import { parseWikilinks, type WikiLink } from './wikilinks';

export interface PreprocessResult {
  /** react-markdown 에 넘길 변환된 마크다운 문자열. */
  markdown: string;
  /** 본문에서 추출된 위키링크 목록 (post_links 동기화용). */
  links: WikiLink[];
}

/**
 * 본문 마크다운에서 위키링크를 HTML 앵커로 치환한다.
 * - 코드 블록·인라인 코드 안의 [[...]] 는 무시 (parseWikilinks 가 이미 처리).
 * - 위키링크 외 다른 마크다운 구조는 건드리지 않는다.
 * - 위치 변동을 막기 위해 뒤에서부터 슬라이스 치환한다.
 */
export function preprocessMarkdown(
  source: string,
  knownSlugs?: ReadonlySet<string>,
): PreprocessResult {
  const links = parseWikilinks(source);

  // 끝에서 앞으로 치환 — start/end 인덱스가 영향받지 않게.
  let out = source;
  for (let i = links.length - 1; i >= 0; i--) {
    const link = links[i];
    const html = renderWikilinkAnchor(link, knownSlugs);
    out = out.slice(0, link.start) + html + out.slice(link.end);
  }

  return { markdown: out, links };
}

/**
 * 단일 WikiLink → `<a class="wikilink ..." href="...">label</a>` HTML 문자열.
 * label, slug 등은 안전하게 escape.
 */
function renderWikilinkAnchor(
  link: WikiLink,
  knownSlugs?: ReadonlySet<string>,
): string {
  const isStub = knownSlugs ? !knownSlugs.has(link.slug) : false;
  const className = isStub ? 'wikilink wikilink--stub' : 'wikilink';
  const href = link.anchor
    ? `/posts/${encodeURIComponent(link.slug)}#${encodeURIComponent(link.anchor)}`
    : `/posts/${encodeURIComponent(link.slug)}`;
  const title = isStub ? '아직 작성되지 않은 노트' : link.slug;
  return (
    `<a href="${escapeAttr(href)}"` +
    ` class="${className}"` +
    ` data-wikilink="${escapeAttr(link.slug)}"` +
    ` title="${escapeAttr(title)}">` +
    escapeText(link.label) +
    '</a>'
  );
}

/* ─────────────────────────────────────────────
 * HTML escape — 작성자 본인만 글을 쓰지만, 안전 기본값을 유지한다.
 * ───────────────────────────────────────────── */

function escapeText(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeAttr(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
