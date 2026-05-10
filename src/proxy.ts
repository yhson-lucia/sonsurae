// Next.js 16 — proxy convention (deprecated `middleware` 의 후속).
// /admin/* 진입 시 Supabase 세션 검증.

import type { NextRequest } from 'next/server';

import { updateAuthSession } from '@/lib/supabase/middleware';

export async function proxy(request: NextRequest) {
  return updateAuthSession(request);
}

// /admin/* 만 검사 — 정적 자원 / 공개 라우트는 통과.
export const config = {
  matcher: ['/admin/:path*'],
};
