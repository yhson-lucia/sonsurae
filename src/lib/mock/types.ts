// Mock 데이터용 가벼운 타입.
// 실제 DB 타입(src/types/database.ts) 의 필요한 필드만 재현한다.
// Phase 7 에서 Supabase 쿼리로 대체될 때 시그니처가 호환되도록 의도적으로 비슷하게 짠다.

export interface MockCategory {
  id: string;
  slug: string;             // 슬래시 가능: 'ai/deep-learning'
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;     // 'emerald' / 'amber' 등 tailwind 컬러 토큰
  parent_slug: string | null;
  sort_order: number;
}

export interface MockPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body_md: string;
  cover_image_url: string | null;
  category: Pick<MockCategory, 'slug' | 'name' | 'icon' | 'color'>;
  parent_post_slug: string | null;
  published: boolean;
  published_at: string;     // ISO
  sort_order: number;
}

/** 카테고리 트리 노드 — FolderTree 컴포넌트가 소비. */
export interface CategoryTreeNode {
  category: MockCategory;
  children: CategoryTreeNode[];
  /** 이 카테고리에 직접 속한 글 수 (자식 카테고리 제외). */
  postCount: number;
}
