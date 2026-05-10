'use client';

// 손수레 글 에디터 — 단일 작성자(오너) 용.
//
// 구성:
//   - 좌: textarea (마크다운 본문). 라이브 글자 수 + 위키링크 카운트.
//   - 우: 라이브 미리보기 (MarkdownPreview).
//   - 상단: 메타 폼 (제목 / 슬러그 / 카테고리 / 요약 / 발행 토글)
//   - 하단: 저장 / 취소 버튼.
//
// 모바일: 미리보기 탭 토글로 전환.
//
// excerpt 입력 시 [[ 또는 ]] 검출하면 즉시 경고 (data-flow.md 룰).

import { useRouter } from 'next/navigation';
import { useMemo, useRef, useState } from 'react';

import { MarkdownPreview } from '@/components/markdown/MarkdownPreview';
import { WikilinkSuggestions } from '@/components/editor/WikilinkSuggestions';
import { createPost, updatePost, type PostInput } from '@/lib/actions/posts';
import { extractSlugs } from '@/lib/wikilinks';

interface CategoryOption {
  id: string;
  slug: string;
  name: string;
}

interface Props {
  mode: 'create' | 'edit';
  /** edit 모드일 때 기존 글 ID + 초기값. */
  postId?: string;
  initial?: Partial<PostInput>;
  categories: ReadonlyArray<CategoryOption>;
  /** 위키링크 stub 판정 + 자동완성용 슬러그 후보 */
  knownSlugs: ReadonlyArray<string>;
}

export function PostEditor({ mode, postId, initial, categories, knownSlugs }: Props) {
  const router = useRouter();

  const [title, setTitle] = useState(initial?.title ?? '');
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? '');
  const [body, setBody] = useState(initial?.body_md ?? '');
  const [categoryId, setCategoryId] = useState(initial?.category_id ?? categories[0]?.id ?? '');
  const [published, setPublished] = useState(initial?.published ?? false);

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'edit' | 'preview'>('edit');

  const knownSlugsSet = useMemo(() => new Set(knownSlugs), [knownSlugs]);

  const wikilinkSlugs = useMemo(() => extractSlugs(body), [body]);
  const stubsCount = wikilinkSlugs.filter((s) => !knownSlugsSet.has(s)).length;

  // textarea 커서 추적 — 위키링크 자동완성용
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [caret, setCaret] = useState(0);
  const updateCaret = () => {
    const ta = textareaRef.current;
    if (ta) setCaret(ta.selectionStart);
  };

  const excerptHasWikilink = excerpt && /\[\[|\]\]/.test(excerpt);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (excerptHasWikilink) {
      setError('요약(excerpt) 에는 위키링크 [[...]] 를 쓸 수 없습니다.');
      return;
    }

    setPending(true);
    try {
      const input: PostInput = {
        slug: slug.trim(),
        title: title.trim(),
        excerpt: excerpt.trim() || null,
        body_md: body,
        category_id: categoryId,
        published,
      };

      const res =
        mode === 'create'
          ? await createPost(input)
          : await updatePost(postId!, input);

      if (!res.ok) {
        setError(res.error ?? '저장 실패');
        return;
      }

      router.push('/admin/posts');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장 실패');
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 lg:px-8">
      {/* 상단 — 메타 */}
      <div className="rounded-2xl border border-border bg-background-soft p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:gap-5">
          <div>
            <label className="text-xs font-medium text-foreground-soft" htmlFor="title">제목</label>
            <input
              id="title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-base text-foreground focus:border-accent focus:outline-none"
              placeholder="예: 퍼셉트론"
            />
          </div>
          <div className="flex items-end gap-2">
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="h-4 w-4 rounded border-border accent-accent"
              />
              <span className={published ? 'font-medium text-accent' : 'text-foreground-soft'}>
                {published ? '발행됨' : '초안'}
              </span>
            </label>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-foreground-soft" htmlFor="slug">슬러그</label>
            <input
              id="slug"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm text-foreground focus:border-accent focus:outline-none"
              placeholder="perceptron"
            />
            <p className="mt-1 text-xs text-foreground-mute">URL: /posts/{slug || '...'}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-foreground-soft" htmlFor="category">카테고리</label>
            <select
              id="category"
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.slug} · {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="text-xs font-medium text-foreground-soft" htmlFor="excerpt">
            요약 (평문, 위키링크 X)
          </label>
          <textarea
            id="excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={2}
            className={`mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:outline-none ${
              excerptHasWikilink ? 'border-red-500/60 focus:border-red-500' : 'border-border focus:border-accent'
            }`}
            placeholder="OG / 카드 / 검색 결과에 노출되는 한 문장 요약"
          />
          {excerptHasWikilink ? (
            <p className="mt-1 text-xs text-red-600">
              ⚠ 요약에 [[...]] 를 쓸 수 없습니다 (OG/카드에서 깨짐). 본문에만 사용하세요.
            </p>
          ) : null}
        </div>
      </div>

      {/* 본문 — split view */}
      <div className="mt-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-1 rounded-full border border-border bg-background-soft p-1">
            <TabButton active={tab === 'edit'} onClick={() => setTab('edit')}>
              작성
            </TabButton>
            <TabButton active={tab === 'preview'} onClick={() => setTab('preview')}>
              미리보기
            </TabButton>
          </div>
          <div className="text-xs text-foreground-mute">
            {body.length} 자 · 위키링크 {wikilinkSlugs.length}개
            {stubsCount > 0 ? ` (없는 노트 ${stubsCount})` : ''}
          </div>
        </div>

        <div className={`mt-3 grid gap-4 lg:grid-cols-2`}>
          <div className={`flex flex-col gap-3 ${tab === 'edit' ? 'block' : 'hidden lg:block'}`}>
            <textarea
              ref={textareaRef}
              value={body}
              onChange={(e) => {
                setBody(e.target.value);
                updateCaret();
              }}
              onKeyUp={updateCaret}
              onClick={updateCaret}
              onSelect={updateCaret}
              rows={24}
              spellCheck={false}
              className="block h-full min-h-[28rem] w-full rounded-xl border border-border bg-background px-4 py-3 font-mono text-sm leading-relaxed text-foreground focus:border-accent focus:outline-none"
              placeholder={'## 정의\n\n본문을 마크다운으로 작성하세요. [[다른노트]] 형식으로 위키링크 가능. $\\sigma(x)$ 같은 인라인 LaTeX 도 됩니다.'}
            />
            <WikilinkSuggestions
              value={body}
              caret={caret}
              knownSlugs={knownSlugs}
              onSelect={({ value, caret: newCaret }) => {
                setBody(value);
                // 다음 paint 후 textarea 커서 위치 복원
                requestAnimationFrame(() => {
                  const ta = textareaRef.current;
                  if (ta) {
                    ta.focus();
                    ta.setSelectionRange(newCaret, newCaret);
                    setCaret(newCaret);
                  }
                });
              }}
            />
          </div>
          <div className={tab === 'preview' ? 'block' : 'hidden lg:block'}>
            <div className="min-h-[28rem] rounded-xl border border-border bg-background-soft px-5 py-4">
              {body.trim() ? (
                <MarkdownPreview source={body} knownSlugs={knownSlugsSet} />
              ) : (
                <p className="text-sm text-foreground-mute">본문이 비어 있습니다.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 하단 — 액션 */}
      <div className="mt-6 flex items-center justify-end gap-3">
        {error ? (
          <p className="mr-auto text-sm text-red-600">{error}</p>
        ) : null}
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-full border border-border-strong px-4 py-2 text-sm font-medium text-foreground-soft hover:bg-background-soft hover:text-foreground"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={pending || !!excerptHasWikilink}
          className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-all hover:shadow-glow disabled:opacity-60"
        >
          {pending ? '저장 중…' : mode === 'create' ? '생성' : '수정 저장'}
        </button>
      </div>
    </form>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
        active ? 'bg-foreground text-background' : 'text-foreground-soft hover:text-foreground'
      }`}
    >
      {children}
    </button>
  );
}
