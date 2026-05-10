import type { MockCategory } from './types';

// Phase 3 UI 작업용 mock 카테고리.
// Phase 7 마이그레이션에서 실제 20개로 확장된다.

export const MOCK_CATEGORIES: ReadonlyArray<MockCategory> = [
  {
    id: 'cat-ai',
    slug: 'ai',
    name: 'AI',
    description: '머신러닝 / 딥러닝 / LLM 정리.',
    icon: '🧠',
    color: 'emerald',
    parent_slug: null,
    sort_order: 10,
  },
  {
    id: 'cat-ai-dl',
    slug: 'ai/deep-learning',
    name: '딥러닝',
    description: '신경망, 역전파, 활성화 함수.',
    icon: null,
    color: 'emerald',
    parent_slug: 'ai',
    sort_order: 11,
  },
  {
    id: 'cat-ai-ml',
    slug: 'ai/machine-learning',
    name: '머신러닝',
    description: '의사결정나무, 부스팅, 클러스터링.',
    icon: null,
    color: 'emerald',
    parent_slug: 'ai',
    sort_order: 12,
  },
  {
    id: 'cat-fe',
    slug: 'fe',
    name: 'FE',
    description: 'React, Next.js, TypeScript.',
    icon: '🎨',
    color: 'sky',
    parent_slug: null,
    sort_order: 20,
  },
  {
    id: 'cat-spring',
    slug: 'spring',
    name: 'Spring',
    description: 'Spring / Spring Boot.',
    icon: '🌱',
    color: 'lime',
    parent_slug: null,
    sort_order: 30,
  },
];
