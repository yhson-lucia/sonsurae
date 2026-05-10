// 환경 변수 헬퍼.
//
// 이 파일은 환경 변수의 *유무*를 안전하게 다룬다.
// Supabase 프로젝트가 아직 없는 phase 1~6 동안에도 빌드/렌더가 깨지지 않도록,
// 누락 시 placeholder 를 반환하고 hasSupabase = false 를 노출한다.

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const env = {
  supabaseUrl: SUPABASE_URL,
  supabaseAnonKey: SUPABASE_ANON_KEY,
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  migrationTempDir: process.env.MIGRATION_TEMP_DIR ?? './migration-temp',
} as const;

export const hasSupabase = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

/** 서버 전용 환경 변수가 모두 갖춰져 있는지. (어드민/마이그레이션 가드) */
export const hasServiceRole = Boolean(env.serviceRoleKey);

export function assertSupabase(): void {
  if (!hasSupabase) {
    throw new Error(
      'Supabase 환경 변수가 설정되지 않았습니다. .env.local 에 NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY 를 추가하세요.',
    );
  }
}
