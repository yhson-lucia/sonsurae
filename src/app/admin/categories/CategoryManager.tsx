'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { createCategory, deleteCategory } from '@/lib/actions/categories';
import type { MockCategory } from '@/lib/mock/types';

const COLORS: { value: string; label: string; hex: string }[] = [
  { value: 'emerald', label: '에메랄드', hex: '#10b981' },
  { value: 'blue',    label: '파랑',     hex: '#3b82f6' },
  { value: 'sky',     label: '하늘',     hex: '#0ea5e9' },
  { value: 'cyan',    label: '청록',     hex: '#06b6d4' },
  { value: 'lime',    label: '라임',     hex: '#84cc16' },
  { value: 'amber',   label: '앰버',     hex: '#f59e0b' },
  { value: 'orange',  label: '오렌지',   hex: '#f97316' },
  { value: 'red',     label: '빨강',     hex: '#ef4444' },
  { value: 'pink',    label: '핑크',     hex: '#ec4899' },
  { value: 'violet',  label: '보라',     hex: '#8b5cf6' },
  { value: 'indigo',  label: '인디고',   hex: '#6366f1' },
  { value: 'green',   label: '초록',     hex: '#22c55e' },
  { value: 'slate',   label: '슬레이트', hex: '#64748b' },
];

function toSlug(val: string): string {
  return val
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-/]/g, '')
    .replace(/-+/g, '-')
    .slice(0, 60);
}

export function CategoryManager({ categories }: { categories: MockCategory[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const [name, setName]           = useState('');
  const [slug, setSlug]           = useState('');
  const [slugManual, setSlugManual] = useState(false);
  const [description, setDescription] = useState('');
  const [icon, setIcon]           = useState('');
  const [color, setColor]         = useState('blue');
  const [parentId, setParentId]   = useState('');

  function handleNameChange(val: string) {
    setName(val);
    if (!slugManual) {
      const base = toSlug(val);
      const parent = categories.find((c) => c.id === parentId);
      setSlug(parent ? `${parent.slug}/${base}` : base);
    }
  }

  function handleParentChange(val: string) {
    setParentId(val);
    if (!slugManual && name) {
      const base = toSlug(name);
      const parent = categories.find((c) => c.id === val);
      setSlug(parent ? `${parent.slug}/${base}` : base);
    }
  }

  function resetForm() {
    setName('');
    setSlug('');
    setSlugManual(false);
    setDescription('');
    setIcon('');
    setColor('blue');
    setParentId('');
  }

  function handleAdd() {
    setMessage(null);
    startTransition(async () => {
      const result = await createCategory({
        slug: slug.trim(),
        name: name.trim(),
        description: description.trim() || null,
        icon: icon.trim() || null,
        color,
        parent_category_id: parentId || null,
        sort_order: (categories.length + 1) * 10,
      });
      if (!result.ok) {
        setMessage({ type: 'error', text: result.error ?? '오류가 발생했습니다.' });
      } else {
        setMessage({ type: 'success', text: `"${name}" 카테고리가 추가됐습니다.` });
        resetForm();
        router.refresh();
      }
    });
  }

  function handleDelete(id: string, catName: string) {
    if (!confirm(`"${catName}" 카테고리를 삭제할까요?`)) return;
    setMessage(null);
    startTransition(async () => {
      const result = await deleteCategory(id);
      if (!result.ok) {
        setMessage({ type: 'error', text: result.error ?? '삭제 실패' });
      } else {
        setMessage({ type: 'success', text: `"${catName}" 카테고리가 삭제됐습니다.` });
        router.refresh();
      }
    });
  }

  const topLevel = categories.filter((c) => !c.parent_slug);
  const selectedColor = COLORS.find((c) => c.value === color);

  return (
    <div className="mt-10 space-y-10">

      {/* ── 알림 메시지 ── */}
      {message && (
        <p
          className={`rounded-xl px-4 py-3 text-sm ${
            message.type === 'error'
              ? 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400'
              : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
          }`}
        >
          {message.text}
        </p>
      )}

      {/* ── 현재 카테고리 목록 ── */}
      <div>
        <h2 className="text-lg font-bold tracking-tight">현재 카테고리</h2>
        <p className="mt-1 text-sm text-foreground-mute">총 {categories.length}개</p>

        {categories.length === 0 ? (
          <p className="mt-4 text-sm text-foreground-mute">아직 카테고리가 없어요.</p>
        ) : (
          <ul className="mt-4 overflow-hidden rounded-2xl border border-border divide-y divide-border">
            {categories.map((cat) => {
              const colorHex = COLORS.find((c) => c.value === cat.color)?.hex;
              const parentCat = categories.find((c) => c.slug === cat.parent_slug);
              return (
                <li
                  key={cat.id}
                  className="flex items-center justify-between gap-4 bg-background-soft px-5 py-3.5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {/* 색상 도트 */}
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: colorHex ?? '#94a3b8' }}
                    />
                    {cat.icon && <span className="shrink-0 text-base">{cat.icon}</span>}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium">{cat.name}</span>
                        {parentCat && (
                          <span className="rounded-md bg-background-mute px-1.5 py-0.5 text-xs text-foreground-mute">
                            {parentCat.name} 하위
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-xs text-foreground-mute">{cat.slug}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(cat.id, cat.name)}
                    disabled={isPending}
                    className="shrink-0 text-xs text-red-500 transition-colors hover:text-red-600 disabled:opacity-40"
                  >
                    삭제
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* ── 카테고리 추가 폼 ── */}
      <div className="rounded-2xl border border-border bg-background-soft p-6 sm:p-7">
        <h2 className="text-lg font-bold tracking-tight">카테고리 추가</h2>
        <p className="mt-1 text-sm text-foreground-mute">
          상위 카테고리를 선택하면 하위 카테고리로 등록됩니다.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">

          {/* 이름 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-foreground-soft">이름 *</label>
            <input
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="예: 감염병"
              className="rounded-xl border border-border bg-background px-3.5 py-2 text-sm outline-none transition-colors focus:border-accent"
            />
          </div>

          {/* 슬러그 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-foreground-soft">
              슬러그 *{' '}
              <span className="font-normal text-foreground-mute">(영문·숫자·하이픈)</span>
            </label>
            <input
              value={slug}
              onChange={(e) => { setSlug(e.target.value); setSlugManual(true); }}
              placeholder="예: infectious-disease"
              className="rounded-xl border border-border bg-background px-3.5 py-2 font-mono text-sm outline-none transition-colors focus:border-accent"
            />
          </div>

          {/* 아이콘 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-foreground-soft">아이콘 (이모지)</label>
            <input
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="예: 🦠"
              className="rounded-xl border border-border bg-background px-3.5 py-2 text-sm outline-none transition-colors focus:border-accent"
            />
          </div>

          {/* 색상 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-foreground-soft">색상</label>
            <div className="flex items-center gap-2">
              <span
                className="h-4 w-4 shrink-0 rounded-full border border-border"
                style={{ backgroundColor: selectedColor?.hex ?? '#94a3b8' }}
              />
              <select
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="flex-1 rounded-xl border border-border bg-background px-3.5 py-2 text-sm outline-none transition-colors focus:border-accent"
              >
                {COLORS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 설명 */}
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="text-xs font-medium text-foreground-soft">설명</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="예: 감염병 역학, 예방, 관리에 관한 내용"
              className="rounded-xl border border-border bg-background px-3.5 py-2 text-sm outline-none transition-colors focus:border-accent"
            />
          </div>

          {/* 상위 카테고리 */}
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="text-xs font-medium text-foreground-soft">
              상위 카테고리{' '}
              <span className="font-normal text-foreground-mute">(없으면 최상위로 등록)</span>
            </label>
            <select
              value={parentId}
              onChange={(e) => handleParentChange(e.target.value)}
              className="rounded-xl border border-border bg-background px-3.5 py-2 text-sm outline-none transition-colors focus:border-accent"
            >
              <option value="">— 최상위 카테고리 —</option>
              {topLevel.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon ? `${c.icon} ` : ''}{c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleAdd}
          disabled={isPending || !name.trim() || !slug.trim()}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background shadow-sm transition-all hover:shadow-glow disabled:opacity-40"
        >
          {isPending ? '저장 중…' : '카테고리 추가'}
        </button>
      </div>
    </div>
  );
}
