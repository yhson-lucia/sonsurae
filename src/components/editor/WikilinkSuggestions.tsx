'use client';

// 위키링크 자동완성 패널.
//
// 동작:
//  - 본문 textarea 의 커서 위치 기준 직전 토큰을 본다.
//  - 직전 토큰이 [[ 로 시작하면 그 뒤 텍스트로 슬러그 후보를 필터.
//  - 결과 목록 중 클릭 → textarea 의 [[query 부분을 [[selected]] 로 치환.
//
// caret 위치를 textarea 안에서 정확히 잡는 건 까다롭다 → 커서가 아닌 본문 마지막 [[ 토큰을 추적
// 하는 단순 모델로 시작. (Phase 6 polish — caret-anchored popup 으로 업그레이드 가능)
//
// 예시:
//   본문: "...신경망의 [[per| 다음 토큰..."
//                       ^^^^^^ — 이 부분을 인식

import { useMemo } from 'react';

interface Props {
  /** 현재 textarea 본문. */
  value: string;
  /** 커서 위치 (textarea selectionStart). */
  caret: number;
  /** 사이트 내 발행 글들의 슬러그 후보. */
  knownSlugs: ReadonlyArray<string>;
  /** 선택 시 호출 — 새 본문/커서 위치를 부모에게 돌려준다. */
  onSelect: (next: { value: string; caret: number }) => void;
}

interface ActiveQuery {
  /** [[ 가 시작된 인덱스 */
  start: number;
  /** 커서까지 입력된 query 부분 */
  query: string;
}

function detectActiveQuery(value: string, caret: number): ActiveQuery | null {
  // 커서 이전의 마지막 [[ 위치를 찾는다.
  const before = value.slice(0, caret);
  const lastOpen = before.lastIndexOf('[[');
  if (lastOpen < 0) return null;
  // 같은 위치 이후 ]] 가 있다면 이미 닫힌 위키링크
  const closedAt = before.indexOf(']]', lastOpen);
  if (closedAt >= 0) return null;
  // 줄바꿈을 가로지르면 위키링크 아님
  const fragment = before.slice(lastOpen + 2);
  if (fragment.includes('\n')) return null;
  return { start: lastOpen, query: fragment };
}

export function WikilinkSuggestions({ value, caret, knownSlugs, onSelect }: Props) {
  const active = useMemo(() => detectActiveQuery(value, caret), [value, caret]);

  const matches = useMemo(() => {
    if (!active) return [];
    const q = active.query.trim().toLowerCase();
    const list = q
      ? knownSlugs.filter((s) => s.toLowerCase().includes(q))
      : [...knownSlugs];
    return list.slice(0, 8).sort((a, b) => a.localeCompare(b));
  }, [active, knownSlugs]);

  if (!active) return null;

  function pick(slug: string) {
    if (!active) return;
    const head = value.slice(0, active.start);
    const tail = value.slice(caret);
    const inserted = `[[${slug}]]`;
    const newValue = head + inserted + tail;
    const newCaret = head.length + inserted.length;
    onSelect({ value: newValue, caret: newCaret });
  }

  return (
    <div className="rounded-xl border border-border bg-background-soft p-3">
      <p className="text-xs font-medium uppercase tracking-wider text-accent">
        위키링크 후보
      </p>
      <p className="mt-1 text-xs text-foreground-mute">
        {active.query
          ? `"${active.query}" 와 매칭되는 노트 ${matches.length}개`
          : '입력 중인 [[ 뒤에 슬러그를 채워 넣으세요'}
      </p>
      {matches.length > 0 ? (
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {matches.map((slug) => (
            <li key={slug}>
              <button
                type="button"
                onClick={() => pick(slug)}
                className="rounded-full border border-border-strong bg-background px-2.5 py-1 font-mono text-xs text-foreground-soft transition-colors hover:border-accent hover:bg-accent-soft hover:text-foreground"
              >
                {slug}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-xs text-foreground-mute">
          매칭 슬러그가 없어요. 새 노트가 될 stub 으로 들어갑니다.
        </p>
      )}
    </div>
  );
}
