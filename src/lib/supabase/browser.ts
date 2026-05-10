// Browser-side Supabase 클라이언트.
//
// Client Component 에서 사용 (예: 로그인 폼, 실시간 구독).
// 싱글턴으로 한 번만 초기화한다.

import { createBrowserClient } from '@supabase/ssr';

import { assertSupabase, env } from '@/lib/env';

let _client: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseBrowser() {
  if (_client) return _client;
  assertSupabase();
  _client = createBrowserClient(env.supabaseUrl, env.supabaseAnonKey);
  return _client;
}
