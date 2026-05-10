'use client';

import { useEffect, useState } from 'react';

// 테마 토글 — system → light → dark → system 순환.
// 실제 적용은 inline 스크립트(layout.tsx)와 이 컴포넌트가 같이 함:
//   - 페이지 로드 시: inline 스크립트가 localStorage('theme') 또는 시스템 설정으로 data-theme 세팅 (FOUC 방지)
//   - 사용자가 토글: 이 컴포넌트가 localStorage 갱신 + data-theme 갱신 + (system 모드면) 시스템 변화 청취

type Mode = 'system' | 'light' | 'dark';

const ORDER: Mode[] = ['system', 'light', 'dark'];

function readMode(): Mode {
  if (typeof window === 'undefined') return 'system';
  const v = window.localStorage.getItem('theme');
  return v === 'light' || v === 'dark' ? v : 'system';
}

function applyMode(mode: Mode) {
  const resolved =
    mode === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : mode;
  document.documentElement.setAttribute('data-theme', resolved);
  if (mode === 'system') {
    window.localStorage.removeItem('theme');
  } else {
    window.localStorage.setItem('theme', mode);
  }
}

export function ThemeToggle() {
  // mounted gate — 서버/클라이언트 hydration mismatch 방지 (initial mode 가 다를 수 있음)
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<Mode>('system');

  useEffect(() => {
    setMounted(true);
    setMode(readMode());

    // system 모드일 때 OS 테마가 바뀌면 자동 반영
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      if (readMode() === 'system') applyMode('system');
    };
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  function cycle() {
    const next = ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length];
    setMode(next);
    applyMode(next);
  }

  // SSR 동안에는 placeholder 만 — 색이 잘못된 아이콘이 잠깐 깜빡이는 것 방지
  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="테마 전환"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground-mute"
      >
        <span className="sr-only">테마 전환</span>
      </button>
    );
  }

  const labels: Record<Mode, string> = {
    system: '시스템 설정 따라가기',
    light: '라이트 모드',
    dark: '다크 모드',
  };

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={`테마: ${labels[mode]} (눌러서 변경)`}
      title={labels[mode]}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background/60 text-foreground-soft backdrop-blur transition-all hover:border-border-strong hover:bg-background-soft hover:text-foreground"
    >
      {mode === 'system' && <IconSystem />}
      {mode === 'light' && <IconSun />}
      {mode === 'dark' && <IconMoon />}
    </button>
  );
}

/* ─── Icons (inline SVG, currentColor) ─── */

function IconSun() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4" />
    </svg>
  );
}

function IconMoon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  );
}

function IconSystem() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="13" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  );
}
