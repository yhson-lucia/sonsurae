// 카테고리를 부모-자식 트리로 보여주는 사이드바.
// 카테고리 페이지에서 좌측 사이드바로 사용. Obsidian 의 폴더 트리에 해당.
// 활성 슬러그(현재 보고 있는 카테고리/하위) 는 강조한다.

import Link from 'next/link';

import type { CategoryTreeNode } from '@/lib/mock/types';

interface Props {
  /** 트리 (이미 정렬된 형태). */
  tree: CategoryTreeNode[];
  /** 현재 활성 카테고리 슬러그 (예: 'ai/deep-learning'). 부모 강조용. */
  activeSlug?: string;
}

export function FolderTree({ tree, activeSlug }: Props) {
  return (
    <nav aria-label="카테고리 트리" className="text-sm">
      <ul className="space-y-0.5">
        {tree.map((node) => (
          <FolderNode key={node.category.id} node={node} activeSlug={activeSlug} depth={0} />
        ))}
      </ul>
    </nav>
  );
}

interface NodeProps {
  node: CategoryTreeNode;
  activeSlug?: string;
  depth: number;
}

function FolderNode({ node, activeSlug, depth }: NodeProps) {
  const slug = node.category.slug;
  const isActive = activeSlug === slug;
  const isAncestorOfActive =
    !!activeSlug && (activeSlug === slug || activeSlug.startsWith(`${slug}/`));

  return (
    <li>
      <Link
        href={`/category/${slug}`}
        aria-current={isActive ? 'page' : undefined}
        className={[
          'group flex items-center justify-between gap-2 rounded-md px-2 py-1.5 transition-colors',
          isActive
            ? 'bg-accent-soft font-medium text-foreground'
            : isAncestorOfActive
              ? 'text-foreground'
              : 'text-foreground-soft hover:bg-background-soft hover:text-foreground',
        ].join(' ')}
        style={{ paddingInlineStart: `${0.5 + depth * 0.85}rem` }}
      >
        <span className="flex min-w-0 items-center gap-1.5 truncate">
          {node.category.icon ? (
            <span aria-hidden className="text-base leading-none">
              {node.category.icon}
            </span>
          ) : (
            <span aria-hidden className="text-foreground-mute">
              {node.children.length > 0 ? '▾' : '·'}
            </span>
          )}
          <span className="truncate">{node.category.name}</span>
        </span>
        {node.postCount > 0 ? (
          <span className="text-xs text-foreground-mute">{node.postCount}</span>
        ) : null}
      </Link>

      {node.children.length > 0 ? (
        <ul className="space-y-0.5">
          {node.children.map((child) => (
            <FolderNode
              key={child.category.id}
              node={child}
              activeSlug={activeSlug}
              depth={depth + 1}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}
