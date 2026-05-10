/**
 * PostCard 렌더 검증 — 카테고리 배지, 제목, 요약, 날짜, 링크.
 */
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { MockPost } from '@/lib/mock/types';

import { PostCard } from './PostCard';

function makePost(overrides: Partial<MockPost> = {}): MockPost {
  return {
    id: 'p1',
    slug: 'perceptron',
    title: '퍼셉트론',
    excerpt: '단순 신경망의 기초.',
    body_md: '# 퍼셉트론',
    cover_image_url: null,
    category: {
      slug: 'ai/deep-learning',
      name: '딥러닝',
      icon: '🧠',
      color: 'emerald',
    },
    parent_post_slug: null,
    published: true,
    published_at: '2026-05-10T09:00:00+09:00',
    sort_order: 1,
    ...overrides,
  };
}

describe('PostCard', () => {
  it('제목/요약/카테고리/날짜를 렌더한다', () => {
    render(<PostCard post={makePost()} />);
    expect(screen.getByRole('heading', { name: '퍼셉트론' })).toBeInTheDocument();
    expect(screen.getByText('단순 신경망의 기초.')).toBeInTheDocument();
    expect(screen.getByText('딥러닝')).toBeInTheDocument();
    expect(screen.getByText('2026년 5월 10일')).toBeInTheDocument();
  });

  it('href 가 /posts/{slug} 로 연결된다', () => {
    render(<PostCard post={makePost({ slug: 'neural-network' })} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/posts/neural-network');
  });

  it('excerpt 가 null 이면 요약 영역이 렌더되지 않는다', () => {
    render(<PostCard post={makePost({ excerpt: null })} />);
    expect(screen.queryByText('단순 신경망의 기초.')).not.toBeInTheDocument();
  });

  it('카테고리 아이콘이 있으면 함께 표시된다', () => {
    render(<PostCard post={makePost()} />);
    // 이모지를 직접 텍스트로 검사
    expect(screen.getByText(/🧠/)).toBeInTheDocument();
  });
});
