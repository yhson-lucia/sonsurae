// 위키링크 파서.
//
// 손수레의 본문 마크다운에서 [[slug]], [[slug|label]], [[slug#anchor]],
// [[slug#anchor|label]] 패턴을 추출한다. 코드 블록과 인라인 코드 안의 패턴은 무시한다.
//
// 이 모듈은 "구문 파싱" 만 책임진다. 슬러그가 실제로 존재하는지 (stub 판단), 링크를
// 어떻게 렌더링할지는 호출자(markdown.ts / MarkdownRenderer)가 결정한다.

export interface WikiLink {
  /** 원문에서 발견된 [[...]] 그 자체. 치환 시 정확히 매칭하기 위해 보존. */
  raw: string;
  /** 정규화된 대상 슬러그 (lowercase, trimmed). */
  slug: string;
  /** 글 내 앵커 (옵션, lowercase, trimmed, 공백 → 하이픈). */
  anchor?: string;
  /** 표시할 텍스트. label 명시가 없으면 원본 slug 표기를 사용. */
  label: string;
  /** 원문 내 시작 인덱스 (raw 가 시작하는 위치). */
  start: number;
  /** 원문 내 끝 인덱스 (exclusive). */
  end: number;
}

/** [[ ... ]] 패턴. slug | anchor | label 모두 포착.
 *  - 대괄호/줄바꿈/구분자(`#`,`|`)는 슬러그·앵커에서 제외.
 *  - label 은 줄바꿈만 제외 (한글/공백 OK).
 */
const WIKILINK_RE =
  /\[\[([^\[\]\n#|]+)(?:#([^\[\]\n|]+))?(?:\|([^\[\]\n]+))?\]\]/g;

/* ─────────────────────────────────────────────
 * Public API
 * ───────────────────────────────────────────── */

/**
 * 본문에서 위키링크를 모두 추출한다.
 * 코드 블록(``` ... ```), 틸드 펜스(~~~ ... ~~~), 인라인 코드(`...`) 안의 패턴은 무시.
 */
export function parseWikilinks(text: string): WikiLink[] {
  const masked = maskCode(text);
  const out: WikiLink[] = [];

  for (const match of masked.matchAll(WIKILINK_RE)) {
    const slugRaw = match[1];
    const anchorRaw = match[2];
    const labelRaw = match[3];

    const slug = normalizeSlug(slugRaw);
    if (!slug) continue;

    const start = match.index;
    const end = start + match[0].length;
    const raw = text.slice(start, end);

    out.push({
      raw,
      slug,
      anchor: anchorRaw ? normalizeAnchor(anchorRaw) : undefined,
      label: (labelRaw ?? slugRaw).trim(),
      start,
      end,
    });
  }

  return out;
}

/** 본문 내 모든 위키링크의 고유 슬러그를 추출한다. (post_links 동기화용) */
export function extractSlugs(text: string): string[] {
  const seen = new Set<string>();
  for (const link of parseWikilinks(text)) {
    seen.add(link.slug);
  }
  return [...seen];
}

/** 슬러그 정규화: 양 끝 공백 제거 + 소문자. */
export function normalizeSlug(s: string): string {
  return s.trim().toLowerCase();
}

/** 앵커 정규화: trim + lowercase + 내부 공백을 하이픈으로. */
export function normalizeAnchor(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, '-');
}

/* ─────────────────────────────────────────────
 * Internal — 코드 영역 마스킹
 * ───────────────────────────────────────────── */

/**
 * 코드 영역을 같은 길이의 공백으로 치환한다 (원본 인덱스 보존).
 * 처리 순서가 중요하다 — fenced 가 inline 보다 먼저.
 */
function maskCode(text: string): string {
  let masked = text;
  masked = maskFenced(masked);
  masked = maskInline(masked);
  return masked;
}

/** ``` ... ``` 또는 ~~~ ... ~~~ 펜스 코드. 멀티라인. 줄바꿈은 보존. */
function maskFenced(text: string): string {
  return text.replace(/(```|~~~)[\s\S]*?\1/g, (m) =>
    m.replace(/[^\n]/g, ' '),
  );
}

/** `...` 인라인 코드. 단일 줄, 백틱 안 줄바꿈 X. */
function maskInline(text: string): string {
  return text.replace(/`[^`\n]*`/g, (m) => m.replace(/./g, ' '));
}
