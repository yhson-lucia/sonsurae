// 로그인 페이지 — 단일 작성자(오너) 만 사용. Supabase Auth 의 magic link 또는 비밀번호 로그인.
//
// Phase 5 단계: Supabase 프로젝트 미설정이라 실제 동작은 Phase 7 에서 검증.
// UI 와 클라이언트 호출 코드는 미리 만들어 둠.

import type { Metadata } from 'next';
import Link from 'next/link';

import { LoginForm } from './LoginForm';
import { env, hasSupabase } from '@/lib/env';

export const metadata: Metadata = {
  title: '로그인',
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{ reason?: string; next?: string }>;
}

export default async function LoginPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const reason = params.reason;
  const next = params.next ?? '/admin';

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <div className="rounded-3xl border border-border bg-background-soft p-8 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wider text-accent">
          손수레 어드민
        </p>
        <h1 className="text-display mt-2 text-2xl font-bold tracking-tight">
          로그인
        </h1>
        <p className="mt-3 text-sm text-foreground-soft">
          작성자 본인만 접근하는 영역입니다. 글을 보는 데에는 로그인이 필요 없어요.
        </p>

        {reason === 'supabase-not-configured' ? (
          <p className="mt-4 rounded-xl border border-warm/40 bg-warm-soft p-3 text-xs text-foreground-soft">
            ⚠ Supabase 프로젝트가 아직 설정되지 않았습니다. <code className="rounded bg-code-bg px-1 py-0.5">.env.local</code> 의 키를 채워주세요.
          </p>
        ) : null}

        {hasSupabase ? (
          <LoginForm next={next} siteUrl={env.siteUrl} />
        ) : (
          <p className="mt-6 text-sm text-foreground-mute">
            로그인 폼은 Supabase 프로젝트가 연결된 후 동작합니다.
          </p>
        )}

        <p className="mt-8 border-t border-border pt-4 text-center text-xs">
          <Link href="/" className="text-foreground-soft hover:text-foreground">
            ← 홈으로
          </Link>
        </p>
      </div>
    </div>
  );
}
