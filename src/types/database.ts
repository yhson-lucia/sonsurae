// 손수레 DB 타입 정의
//
// 이 파일은 supabase/migrations/0001_init_schema.sql 과 1:1 매칭된다.
// Supabase 프로젝트가 만들어지면 `supabase gen types typescript` 로 자동 생성된 타입으로 교체할 수 있다.
// 그전까지는 손으로 동기화한다.

export type PostLinkRelation =
  | 'related'
  | 'references'
  | 'prerequisite'
  | 'followup';

export interface Profile {
  user_id: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  slug: string;                          // 슬래시 가능: 'ai/deep-learning'
  name: string;
  description: string | null;
  parent_category_id: string | null;
  icon: string | null;
  color: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body_md: string;
  cover_image_url: string | null;
  category_id: string;
  parent_post_id: string | null;
  author_id: string;
  published: boolean;
  published_at: string | null;
  sort_order: number;
  imported_from: string | null;
  created_at: string;
  updated_at: string;
}

export interface PostLink {
  from_post_id: string;
  to_post_id: string;
  relation_type: PostLinkRelation;
  note: string | null;
  created_at: string;
}

export interface Image {
  id: string;
  post_id: string;
  storage_path: string;
  alt: string | null;
  width: number | null;
  height: number | null;
  caption: string | null;
  sort_order: number;
  created_at: string;
}

export interface Tag {
  id: string;
  slug: string;
  name: string;
  created_at: string;
}

export interface PostTag {
  post_id: string;
  tag_id: string;
}

export type ProjectStatus = '진행중' | '완료' | '중단';

export interface Project {
  id: string;
  slug: string;
  name: string;
  summary: string | null;
  body_md: string;
  cover_image_url: string | null;
  status: ProjectStatus;
  period_start: string | null;     // YYYY-MM-DD
  period_end: string | null;       // null = 진행 중
  stack: string[];
  repo_url: string | null;
  demo_url: string | null;
  author_id: string;
  published: boolean;
  published_at: string | null;
  sort_order: number;
  imported_from: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectListItem
  extends Pick<
    Project,
    | 'id'
    | 'slug'
    | 'name'
    | 'summary'
    | 'cover_image_url'
    | 'status'
    | 'period_start'
    | 'period_end'
    | 'stack'
    | 'published_at'
  > {}

// ============================================================
// 조회용 합성 타입 (API 응답에서 자주 쓰일 모양)
// ============================================================

export interface PostWithCategory extends Post {
  category: Pick<Category, 'id' | 'slug' | 'name' | 'icon' | 'color'>;
}

export interface PostListItem
  extends Pick<
    Post,
    'id' | 'slug' | 'title' | 'excerpt' | 'cover_image_url' | 'published_at'
  > {
  category: Pick<Category, 'slug' | 'name' | 'icon' | 'color'>;
}

// 그래프뷰용 — 무거운 본문은 빼고 노드 그리는 데 필요한 것만
export interface GraphNode {
  id: string;
  slug: string;
  title: string;
  category_slug: string;
  parent_post_id: string | null;
}

export interface GraphEdge {
  from: string;
  to: string;
  relation: PostLinkRelation;
}
