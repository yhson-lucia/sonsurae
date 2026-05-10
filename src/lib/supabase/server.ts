// Server-side Supabase 클라이언트.
//
// Server Components / Route Handlers / Server Actions 에서 사용.
// 쿠키를 통해 사용자 세션을 읽고 RLS 가 적용된 쿼리를 수행한다.
//
// 환경 변수가 아직 없으면 (phase 1~6) 호출 시 명시적으로 에러를 던진다 —
// 페이지 빌드 자체는 실패하지 않도록 lazy 하게 처리한다.

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

import { assertSupabase, env } from '@/lib/env';

export async function createSupabaseServer() {
  assertSupabase();

  const cookieStore = await cookies();

  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Component 컨텍스트에서 cookie 쓰기는 무시된다 (read-only).
          // middleware/Server Action 컨텍스트에서만 실제 적용됨.
        }
      },
    },
  });
}
