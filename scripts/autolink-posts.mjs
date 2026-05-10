#!/usr/bin/env node
// 자동 위키링크 — DB 의 모든 글을 스캔해서 다른 글의 제목이 본문에 등장하면
// 첫 위치에 [[slug|title]] 형태로 삽입한다.
//
// 안전 장치:
//   - 코드 블록(``` / ~~~), 인라인 코드(`...`), 기존 [[...]], 마크다운 링크/이미지는 건드리지 않음
//   - 긴 제목 우선 매칭 (예: "신경망 학습" 이 "신경망" 보다 먼저)
//   - 매 target 별 첫 occurrence 1회만 (스팸 방지)
//   - 너무 짧은 제목(MIN_TITLE_LEN 미만) 은 매칭 후보에서 제외
//
// 동작:
//   1) 모든 posts 가져오기 (service role)
//   2) 본문 자동 링크 — 변경된 글만 추적
//   3) dry-run: 통계 + 샘플 diff 출력
//   4) --apply: posts.body_md UPDATE + post_links 재구성
//
// 사용:
//   node --env-file=.env.local scripts/autolink-posts.mjs            # dry-run
//   node --env-file=.env.local scripts/autolink-posts.mjs --apply    # 실제 적용
//   node --env-file=.env.local scripts/autolink-posts.mjs --min=3    # 최소 제목 길이 변경
//
// 멱등성: 여러 번 실행해도 안전 (이미 [[..]] 인 영역은 자동 스킵).

import { createClient } from '@supabase/supabase-js';

/* ───────── 설정 ───────── */

const APPLY = process.argv.includes('--apply');
const MIN_TITLE_LEN = (() => {
  const arg = process.argv.find((a) => a.startsWith('--min='));
  return arg ? parseInt(arg.split('=')[1], 10) || 2 : 2;
})();

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SB_URL || !SB_KEY) {
  console.error('환경 변수 누락: NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}
const sb = createClient(SB_URL, SB_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

/* ───────── 본문 자동 링크 ───────── */

/** 본문에서 위키링크/코드/마크다운 링크 영역의 (start, end) 범위 모음. */
function getExcludeRanges(body) {
  const ranges = [];
  // 펜스 코드 (``` / ~~~)
  for (const m of body.matchAll(/(```|~~~)[\s\S]*?\1/g)) {
    ranges.push([m.index, m.index + m[0].length]);
  }
  // 인라인 코드 `...`
  for (const m of body.matchAll(/`[^`\n]*`/g)) {
    ranges.push([m.index, m.index + m[0].length]);
  }
  // 기존 위키링크 [[..]]
  for (const m of body.matchAll(/\[\[[^\]\n]+\]\]/g)) {
    ranges.push([m.index, m.index + m[0].length]);
  }
  // 마크다운 링크/이미지 [text](url) / ![alt](url)
  for (const m of body.matchAll(/!?\[[^\]\n]*\]\([^)\n]*\)/g)) {
    ranges.push([m.index, m.index + m[0].length]);
  }
  return ranges;
}

/** body 에서 needle 의 첫 occurrence 중 exclude 영역에 안 걸리는 인덱스. 없으면 -1. */
function findUnexcludedOccurrence(body, needle, excludeRanges) {
  let from = 0;
  while (true) {
    const idx = body.indexOf(needle, from);
    if (idx < 0) return -1;
    const end = idx + needle.length;
    const inExclude = excludeRanges.some(([s, e]) => idx < e && end > s);
    if (!inExclude) return idx;
    from = idx + 1;
  }
}

/** 한 글에 자동 링크 적용. 변경된 본문 + 추가된 링크 수 반환. */
function autoLinkPost(body, otherPosts) {
  let result = body;
  let added = 0;
  const insertedTargets = []; // 디버그용

  for (const target of otherPosts) {
    const excludeRanges = getExcludeRanges(result);
    const idx = findUnexcludedOccurrence(result, target.title, excludeRanges);
    if (idx < 0) continue;

    const wikilink = `[[${target.slug}|${target.title}]]`;
    result =
      result.slice(0, idx) + wikilink + result.slice(idx + target.title.length);
    added++;
    insertedTargets.push(target.slug);
  }

  return { body: result, added, insertedTargets };
}

/* ───────── post_links 재구성 ───────── */

const WIKILINK_RE =
  /\[\[([^\[\]\n#|]+)(?:#[^\[\]\n|]+)?(?:\|[^\[\]\n]+)?\]\]/g;

function extractSlugs(body) {
  // 코드 블록은 마스킹
  let masked = body
    .replace(/(```|~~~)[\s\S]*?\1/g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/`[^`\n]*`/g, (m) => m.replace(/./g, ' '));
  const out = new Set();
  for (const m of masked.matchAll(WIKILINK_RE)) {
    out.add(m[1].trim().toLowerCase());
  }
  return [...out];
}

async function rebuildPostLinks(allPosts) {
  // 1) 자동(=related) 링크 모두 비움
  const del = await sb.from('post_links').delete().eq('relation_type', 'related');
  if (del.error) throw new Error(`post_links 삭제 실패: ${del.error.message}`);

  // 2) slug → id 맵
  const slugToId = new Map(allPosts.map((p) => [p.slug, p.id]));

  // 3) 모든 본문에서 [[..]] 추출 → 행 모음
  const rows = [];
  const seen = new Set();
  for (const p of allPosts) {
    const targets = extractSlugs(p.body_md);
    for (const t of targets) {
      const toId = slugToId.get(t);
      if (!toId || toId === p.id) continue;
      const key = `${p.id}->${toId}`;
      if (seen.has(key)) continue;
      seen.add(key);
      rows.push({ from_post_id: p.id, to_post_id: toId, relation_type: 'related' });
    }
  }

  if (rows.length === 0) return 0;

  // chunk 단위로 INSERT (한 번에 너무 많지 않게)
  const CHUNK = 500;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const slice = rows.slice(i, i + CHUNK);
    const ins = await sb.from('post_links').insert(slice);
    if (ins.error) throw new Error(`post_links 삽입 실패: ${ins.error.message}`);
  }
  return rows.length;
}

/* ───────── main ───────── */

async function main() {
  console.log(`autolink-posts — ${APPLY ? '🔥 APPLY' : 'dry-run'} (min title=${MIN_TITLE_LEN})`);

  const { data: posts, error } = await sb
    .from('posts')
    .select('id, slug, title, body_md')
    .order('slug');
  if (error) throw new Error(`posts 조회 실패: ${error.message}`);

  // 후보 — 너무 짧은 제목 제외, 길이 DESC
  const targets = posts
    .filter((p) => p.title.length >= MIN_TITLE_LEN)
    .sort((a, b) => b.title.length - a.title.length);

  console.log(`전체 글: ${posts.length}, 후보 제목: ${targets.length}`);

  const updates = [];
  let totalAdded = 0;

  for (const post of posts) {
    const others = targets.filter((t) => t.id !== post.id);
    const { body, added, insertedTargets } = autoLinkPost(post.body_md, others);
    if (added > 0) {
      updates.push({ id: post.id, slug: post.slug, title: post.title, body_md: body, added, insertedTargets });
      totalAdded += added;
    }
  }

  console.log(`\n변경 요약:`);
  console.log(`  영향 받은 글: ${updates.length} / ${posts.length}`);
  console.log(`  추가될 위키링크: ${totalAdded} 개`);

  // top 10 글
  console.log(`\n많이 변경되는 글 top 10:`);
  for (const u of [...updates].sort((a, b) => b.added - a.added).slice(0, 10)) {
    console.log(`  ${u.added.toString().padStart(3)} 개  ${u.slug}  (${u.title})`);
    console.log(`        → ${u.insertedTargets.slice(0, 6).join(', ')}${u.insertedTargets.length > 6 ? ', …' : ''}`);
  }

  if (!APPLY) {
    console.log(`\n(dry-run — DB 변경 없음. --apply 추가하면 실제 실행)`);
    return;
  }

  console.log(`\n🔥 APPLY — DB 갱신 시작...`);

  // posts.body_md 일괄 UPDATE (개별 — 트랜잭션 한 번에 못 묶지만 양이 ~100 수준이라 OK)
  let done = 0;
  for (const u of updates) {
    const upd = await sb.from('posts').update({ body_md: u.body_md }).eq('id', u.id);
    if (upd.error) {
      console.error(`  ❌ ${u.slug}: ${upd.error.message}`);
      continue;
    }
    done++;
  }
  console.log(`  ✓ ${done} 개 글 본문 갱신`);

  // post_links 재구성 — 자동(= related) 링크 모두 다시 만듦
  // (방금 갱신된 body_md 기준이어야 하므로 다시 fetch)
  const refreshed = await sb.from('posts').select('id, slug, body_md');
  if (refreshed.error) throw new Error(`재조회 실패: ${refreshed.error.message}`);
  const linkRows = await rebuildPostLinks(refreshed.data);
  console.log(`  ✓ post_links 재구성: ${linkRows} 개 행`);

  console.log(`\n완료.`);
}

main().catch((e) => {
  console.error('실패:', e.message);
  process.exit(1);
});
