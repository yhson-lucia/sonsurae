#!/usr/bin/env node
/**
 * 손수레 데이터 마이그레이션
 *
 * 입력: migration-temp/docs/**\/*.md  (frontmatter 정리 완료)
 *       migration-temp/images/*       (이미지 파일)
 *
 * 출력: Supabase
 *       - posts          (slug upsert)
 *       - images         (post 단위 재구성)
 *       - tags           (slug upsert)
 *       - post_tags      (post 단위 재구성)
 *       - Storage:images (파일 업로드, upsert)
 *
 * 멱등적 — 여러 번 실행해도 같은 결과.
 *
 * 환경변수 (.env.local):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   AUTHOR_USER_ID                 (auth.users 의 id)
 *   MIGRATION_TEMP_DIR             (기본: ./migration-temp)
 *
 * 실행:
 *   npm run migrate:from-my-website
 *   또는 node --env-file=.env.local scripts/migrate-from-my-website.mjs
 *
 * 옵션:
 *   --dry-run            INSERT/UPLOAD 안 하고 카운트만
 *   --skip-images        Storage 업로드 생략 (메타만)
 *   --only=slug-A,slug-B 특정 글만 처리
 *   --published=true     마이그레이션 시 published=true 로 적용 (기본 false)
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import matter from 'gray-matter';

// ─── 0. 환경 변수 / 인자 ──────────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const AUTHOR_USER_ID = process.env.AUTHOR_USER_ID;
const TEMP_DIR = process.env.MIGRATION_TEMP_DIR || './migration-temp';

if (!SUPABASE_URL || !SERVICE_KEY || !AUTHOR_USER_ID) {
  console.error('❌ 환경 변수 누락. 다음을 .env.local 에 채우세요:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  console.error('   AUTHOR_USER_ID');
  process.exit(1);
}

const args = new Set(process.argv.slice(2));
const DRY_RUN = args.has('--dry-run');
const SKIP_IMAGES = args.has('--skip-images');
const PUBLISH_ON_IMPORT =
  process.argv.find((a) => a.startsWith('--published='))?.split('=')[1] === 'true';
const ONLY = (() => {
  const arg = process.argv.find((a) => a.startsWith('--only='));
  if (!arg) return null;
  return new Set(arg.split('=')[1].split(',').filter(Boolean));
})();

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// ─── 1. 카테고리 slug → id 매핑 캐시 ───────────────────────────────────

async function loadCategoryMap() {
  const { data, error } = await supabase.from('categories').select('id, slug');
  if (error) throw new Error(`카테고리 조회 실패: ${error.message}`);
  if (!data || data.length === 0) {
    throw new Error(
      '카테고리가 비어 있음. 먼저 supabase/seed.sql 을 적용하세요 (npx supabase db reset).'
    );
  }
  return new Map(data.map((c) => [c.slug, c.id]));
}

// ─── 2. 마크다운 본문에서 이미지 참조 추출 ────────────────────────────

const IMAGE_RE = /!\[([^\]]*)\]\(images\/([^)\s]+)\)/g;

function extractImages(body) {
  const out = [];
  const seen = new Set();
  let m;
  while ((m = IMAGE_RE.exec(body))) {
    const [, alt, filename] = m;
    if (seen.has(filename)) continue;
    seen.add(filename);
    out.push({ alt: alt || null, filename });
  }
  return out;
}

// ─── 3. md 파일 모두 수집 ────────────────────────────────────────────

async function collectMarkdownFiles(dir) {
  const out = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await collectMarkdownFiles(full)));
    } else if (entry.name.endsWith('.md')) {
      out.push(full);
    }
  }
  return out;
}

// ─── 4. 한 글 처리 ───────────────────────────────────────────────────

async function processPost(filePath, categoryMap, stats) {
  const raw = await fs.readFile(filePath, 'utf8');
  const { data: fm, content: body } = matter(raw);

  // frontmatter 검증
  const required = ['title', 'slug', 'category', 'summary'];
  for (const k of required) {
    if (!fm[k]) {
      console.warn(`⚠️  ${filePath}: frontmatter '${k}' 누락. 건너뜀`);
      stats.skipped++;
      return;
    }
  }

  if (ONLY && !ONLY.has(fm.slug)) return;

  const categoryId = categoryMap.get(fm.category);
  if (!categoryId) {
    console.warn(`⚠️  ${filePath}: category '${fm.category}' 없음. 건너뜀`);
    stats.skipped++;
    return;
  }

  // 날짜 변환 (YYYY-MM-DD → ISO)
  const created = fm.created ? new Date(fm.created).toISOString() : new Date().toISOString();
  const updated = fm.updated ? new Date(fm.updated).toISOString() : created;

  // 이미지 추출
  const images = extractImages(body);
  const coverImagePath = images[0]?.filename ?? null;

  // 마이그레이션 추적용 상대 경로
  const importedFrom = path.relative(process.cwd(), filePath);

  if (DRY_RUN) {
    console.log(
      `[dry] post=${fm.slug}  category=${fm.category}  images=${images.length}  tags=${(fm.tags || []).length}`
    );
    stats.posts++;
    stats.images += images.length;
    stats.tags += (fm.tags || []).length;
    return;
  }

  // 4-1. posts upsert
  const { data: postRow, error: postErr } = await supabase
    .from('posts')
    .upsert(
      {
        slug: fm.slug,
        title: fm.title,
        excerpt: fm.summary,
        body_md: body,
        cover_image_url: coverImagePath, // 상대 경로 저장. 렌더링 시 Storage URL 로 조립
        category_id: categoryId,
        parent_post_id: null, // 추후 사용자가 수동 설정
        author_id: AUTHOR_USER_ID,
        published: PUBLISH_ON_IMPORT,
        sort_order: typeof fm.sort_order === 'number' ? fm.sort_order : 0,
        imported_from: importedFrom,
        created_at: created,
        updated_at: updated,
      },
      { onConflict: 'slug' }
    )
    .select('id')
    .single();

  if (postErr) {
    console.error(`❌  ${fm.slug}: posts upsert 실패 — ${postErr.message}`);
    stats.errors++;
    return;
  }

  const postId = postRow.id;
  stats.posts++;

  // 4-2. images: post 의 기존 row 삭제 후 다시 INSERT (단순화)
  await supabase.from('images').delete().eq('post_id', postId);
  if (images.length > 0) {
    const rows = images.map((img, i) => ({
      post_id: postId,
      storage_path: img.filename,
      alt: img.alt,
      sort_order: i,
    }));
    const { error: imgErr } = await supabase.from('images').insert(rows);
    if (imgErr) {
      console.error(`❌  ${fm.slug}: images insert 실패 — ${imgErr.message}`);
      stats.errors++;
    } else {
      stats.images += rows.length;
    }
  }

  // 4-3. tags: 기존 post_tags 삭제 후 tags upsert + post_tags 재구성
  await supabase.from('post_tags').delete().eq('post_id', postId);
  const tagSlugs = Array.isArray(fm.tags) ? fm.tags.map(String) : [];
  if (tagSlugs.length > 0) {
    // tags upsert
    const tagRows = tagSlugs.map((s) => ({ slug: s, name: s }));
    const { data: tagsData, error: tagErr } = await supabase
      .from('tags')
      .upsert(tagRows, { onConflict: 'slug' })
      .select('id, slug');
    if (tagErr) {
      console.error(`❌  ${fm.slug}: tags upsert 실패 — ${tagErr.message}`);
      stats.errors++;
    } else {
      const linkRows = tagsData.map((t) => ({ post_id: postId, tag_id: t.id }));
      const { error: ptErr } = await supabase.from('post_tags').insert(linkRows);
      if (ptErr) {
        console.error(`❌  ${fm.slug}: post_tags insert 실패 — ${ptErr.message}`);
        stats.errors++;
      } else {
        stats.tags += linkRows.length;
      }
    }
  }

  console.log(`✅  ${fm.slug}  (images=${images.length}, tags=${tagSlugs.length})`);
}

// ─── 5. 이미지 Storage 업로드 ───────────────────────────────────────

async function uploadImages(imagesDir, stats) {
  const files = (await fs.readdir(imagesDir)).filter((f) =>
    /\.(webp|png|jpe?g|gif|svg)$/i.test(f)
  );
  console.log(`\n📤 Storage 업로드: ${files.length}개`);

  for (const file of files) {
    const buffer = await fs.readFile(path.join(imagesDir, file));
    const contentType = inferContentType(file);

    if (DRY_RUN) {
      console.log(`[dry-upload] ${file}  (${contentType}, ${buffer.length}B)`);
      stats.uploaded++;
      continue;
    }

    const { error } = await supabase.storage.from('images').upload(file, buffer, {
      contentType,
      upsert: true,
    });
    if (error) {
      console.error(`❌  ${file}: 업로드 실패 — ${error.message}`);
      stats.errors++;
    } else {
      stats.uploaded++;
    }
  }
}

function inferContentType(filename) {
  const ext = path.extname(filename).toLowerCase();
  return (
    {
      '.webp': 'image/webp',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
    }[ext] || 'application/octet-stream'
  );
}

// ─── 6. 메인 ────────────────────────────────────────────────────────

async function main() {
  console.log(`🚀 마이그레이션 시작 (TEMP_DIR=${TEMP_DIR})`);
  if (DRY_RUN) console.log('   (dry-run 모드 — DB/Storage 변경 없음)');
  if (PUBLISH_ON_IMPORT) console.log('   (글 published=true 로 임포트)');
  if (ONLY) console.log(`   (only: ${[...ONLY].join(', ')})`);

  const docsDir = path.join(TEMP_DIR, 'docs');
  const imagesDir = path.join(TEMP_DIR, 'images');

  const stats = { posts: 0, images: 0, tags: 0, uploaded: 0, skipped: 0, errors: 0 };

  // 1. 카테고리 매핑 로드
  console.log('\n📂 카테고리 매핑 로드 ...');
  const categoryMap = await loadCategoryMap();
  console.log(`   ${categoryMap.size}개 카테고리 확인`);

  // 2. md 파일 수집
  console.log('\n📑 md 파일 수집 ...');
  const files = await collectMarkdownFiles(docsDir);
  console.log(`   ${files.length}개 파일 발견`);

  // 3. 각 글 처리
  console.log('\n📝 글 임포트 시작 ...');
  for (const file of files) {
    await processPost(file, categoryMap, stats);
  }

  // 4. Storage 업로드
  if (!SKIP_IMAGES) {
    await uploadImages(imagesDir, stats);
  }

  // 5. 결과
  console.log('\n────── 결과 ──────');
  console.log(`  posts     : ${stats.posts}`);
  console.log(`  images    : ${stats.images}`);
  console.log(`  tags(rel) : ${stats.tags}`);
  console.log(`  uploaded  : ${stats.uploaded}`);
  console.log(`  skipped   : ${stats.skipped}`);
  console.log(`  errors    : ${stats.errors}`);
  console.log('───────────────────');

  if (stats.errors > 0) process.exit(1);
}

main().catch((err) => {
  console.error('💥 마이그레이션 중단:', err);
  process.exit(1);
});
