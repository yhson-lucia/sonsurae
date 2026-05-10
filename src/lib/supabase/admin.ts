// Service Role 키를 쓰는 어드민 클라이언트.
//
// **서버 전용**. 절대 클라이언트 번들에 포함되면 안 됨.
// 마이그레이션 스크립트 / 어드민 작업 / 작성자 본인의 콘솔에서만 사용.
// RLS 를 우회하므로 사용을 최소화하고 권한 체크는 호출 측에서 직접 한다.

import { createClient } from '@supabase/supabase-js';

import { env, hasServiceRole } from '@/lib/env';

export function createSupabaseAdmin() {
  if (!hasServiceRole) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY 가 설정되지 않았습니다. 어드민 작업에는 서비스 롤 키가 필요합니다.',
    );
  }

  return createClient(env.supabaseUrl, env.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
