import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { CategoryTreeNode, MockCategory } from '@/lib/mock/types';

import { FolderTree } from './FolderTree';

function cat(over: Partial<MockCategory> = {}): MockCategory {
  return {
    id: 'c',
    slug: 's',
    name: 'X',
    description: null,
    icon: null,
    color: null,
    parent_slug: null,
    sort_order: 0,
    ...over,
  };
}

const TREE: CategoryTreeNode[] = [
  {
    category: cat({ id: 'ai', slug: 'ai', name: 'AI', icon: '🧠' }),
    postCount: 0,
    children: [
      {
        category: cat({
          id: 'dl',
          slug: 'ai/deep-learning',
          name: '딥러닝',
          parent_slug: 'ai',
        }),
        postCount: 3,
        children: [],
      },
    ],
  },
  {
    category: cat({ id: 'fe', slug: 'fe', name: 'FE', icon: '🎨' }),
    postCount: 1,
    children: [],
  },
];

describe('FolderTree', () => {
  it('루트 카테고리 + 하위 카테고리를 모두 렌더', () => {
    render(<FolderTree tree={TREE} />);
    expect(screen.getByText('AI')).toBeInTheDocument();
    expect(screen.getByText('딥러닝')).toBeInTheDocument();
    expect(screen.getByText('FE')).toBeInTheDocument();
  });

  it('각 카테고리 링크가 /category/{slug} 로 연결', () => {
    render(<FolderTree tree={TREE} />);
    expect(screen.getByRole('link', { name: /AI/ })).toHaveAttribute(
      'href',
      '/category/ai',
    );
    expect(screen.getByRole('link', { name: /딥러닝/ })).toHaveAttribute(
      'href',
      '/category/ai/deep-learning',
    );
  });

  it('postCount 가 0 보다 클 때만 카운트 숫자를 표시', () => {
    render(<FolderTree tree={TREE} />);
    expect(screen.getByText('3')).toBeInTheDocument(); // 딥러닝 글 3편
    expect(screen.getByText('1')).toBeInTheDocument(); // FE 글 1편
    // AI 자체 직속 글은 0 → 카운트 X
  });

  it('activeSlug 와 일치하는 항목은 aria-current="page"', () => {
    render(<FolderTree tree={TREE} activeSlug="ai/deep-learning" />);
    const active = screen.getByRole('link', { name: /딥러닝/ });
    expect(active).toHaveAttribute('aria-current', 'page');
  });
});
