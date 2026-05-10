// 단순 점수 기반 클라이언트 검색.
//
// 매칭 가중치:
//  - 제목 일치: +10 (시작 위치 가까울수록 보너스)
//  - 카테고리명 일치: +3
//  - 요약 일치: +2
//  - 본문 일치: +1 (출현 횟수)
//
// 한국어 + 영어 혼합 환경. 대소문자 무시, NFC 정규화.
// Phase 7 이후 Postgres 트라이그램 검색으로 대체 가능.

export interface SearchableDoc {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body_md: string;
  category_name: string;
}

export interface SearchHit<T extends SearchableDoc = SearchableDoc> {
  doc: T;
  score: number;
  /** 결과 카드에 보여줄 짧은 본문 발췌 (매칭 위치 주변). */
  snippet: string | null;
}

export function searchDocs<T extends SearchableDoc>(
  docs: ReadonlyArray<T>,
  rawQuery: string,
): SearchHit<T>[] {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return [];

  // 다중 토큰 — 공백 분리. 모두 포함하는 문서가 우선.
  const tokens = query.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [];

  const hits: SearchHit<T>[] = [];

  for (const doc of docs) {
    const title = doc.title.toLowerCase();
    const excerpt = (doc.excerpt ?? '').toLowerCase();
    const body = doc.body_md.toLowerCase();
    const cat = doc.category_name.toLowerCase();

    let score = 0;
    let allTokensMatch = true;

    for (const t of tokens) {
      let tokenScore = 0;
      const titleIdx = title.indexOf(t);
      if (titleIdx >= 0) {
        tokenScore += 10 + Math.max(0, 5 - titleIdx); // 앞쪽 매칭 보너스
      }
      if (cat.includes(t)) tokenScore += 3;
      if (excerpt.includes(t)) tokenScore += 2;

      let bodyOcc = 0;
      let from = 0;
      while (true) {
        const idx = body.indexOf(t, from);
        if (idx < 0) break;
        bodyOcc++;
        from = idx + t.length;
      }
      tokenScore += Math.min(bodyOcc, 5); // 본문 매칭 횟수 가중 (최대 5)

      if (tokenScore === 0) {
        allTokensMatch = false;
        break;
      }
      score += tokenScore;
    }

    if (!allTokensMatch || score === 0) continue;

    hits.push({ doc, score, snippet: makeSnippet(doc.body_md, tokens[0]) });
  }

  return hits.sort((a, b) => b.score - a.score);
}

/** 첫 매칭 위치 주변 ~120자 발췌 + 매칭 토큰 강조 (마크업은 안 넣음, 호출자 책임). */
function makeSnippet(body: string, token: string): string | null {
  const lower = body.toLowerCase();
  const idx = lower.indexOf(token.toLowerCase());
  if (idx < 0) return null;
  const start = Math.max(0, idx - 50);
  const end = Math.min(body.length, idx + token.length + 90);
  let s = body.slice(start, end).replace(/\s+/g, ' ').trim();
  if (start > 0) s = '… ' + s;
  if (end < body.length) s = s + ' …';
  return s;
}
