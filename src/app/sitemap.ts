// 손수레 sitemap.xml — DB 동적 생성.
// 발행된 글 / 카테고리 / 핵심 정적 라우트 포함. 어드민 / 미리보기 / 로그인은 제외.

import type { MetadataRoute } from 'next';

import { env } from '@/lib/env';
import {
  getAllCategories,
  getAllPublishedPosts,
} from '@/lib/mock/queries';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.siteUrl;
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base,                changeFrequency: 'daily',   priority: 1.0, lastModified: now },
    { url: `${base}/graph`,     changeFrequency: 'weekly',  priority: 0.8, lastModified: now },
    { url: `${base}/projects`,  changeFrequency: 'weekly',  priority: 0.7, lastModified: now },
    { url: `${base}/search`,    changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/about`,     changeFrequency: 'monthly', priority: 0.5 },
  ];

  const [categories, posts] = await Promise.all([
    getAllCategories(),
    getAllPublishedPosts(),
  ]);

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${base}/category/${c.slug}`,
    changeFrequency: 'weekly',
    priority: 0.6,
    lastModified: now,
  }));

  const postRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${base}/posts/${p.slug}`,
    lastModified: new Date(p.published_at),
    changeFrequency: 'monthly',
    priority: 0.9,
  }));

  return [...staticRoutes, ...categoryRoutes, ...postRoutes];
}
