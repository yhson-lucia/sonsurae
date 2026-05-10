// 손수레 인증 미들웨어 헬퍼.
//
// /admin/* 진입 시 세션 확인:
//   - 세션 없음 → /login 으로 redirect
//   - 세션 있지만 author_id 와 다름 → /login (단일 작성자 모델)
//
// Supabase 가 아직 셋업 안 된 phase 5 에서는 hasSupabase=false → 모든 /admin 차단.

import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

import { env, hasSupabase } from '@/lib/env';

export async function updateAuthSession(request: NextRequest): Promise<NextResponse> {
  let supabaseResponse = NextResponse.next({ request });

  // /admin/* 가 아니면 그대로 통과.
  const path = request.nextUrl.pathname;
  const isAdmin = path.startsWith('/admin');
  if (!isAdmin) return supabaseResponse;

  // Supabase 미설정 — 어드민 영역 잠금 + /login 으로 보냄.
  if (!hasSupabase) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('reason', 'supabase-not-configured');
    return NextResponse.redirect(url);
  }

  const supabase = createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  // getUser() 는 토큰 만료 시 자동 갱신을 시도 — 미들웨어에서 호출 권장.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', path);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
