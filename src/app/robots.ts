// 크롤링 정책. 네이버(Yeti), 구글(Googlebot) 명시 + 어드민/미리보기 차단.

import type { MetadataRoute } from 'next';

import { env } from '@/lib/env';

export default function robots(): MetadataRoute.Robots {
  const base = env.siteUrl;
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/admin', '/login', '/preview', '/api/'],
      },
      // 네이버 봇 — 명시적으로 허용
      { userAgent: 'Yeti', allow: '/' },
      // 구글 봇 — 명시적으로 허용
      { userAgent: 'Googlebot', allow: '/' },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
