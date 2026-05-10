import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';

import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { env } from '@/lib/env';

// FOUC 방지 — React 하이드레이션 전에 data-theme 을 세팅한다.
// `next/script` + `beforeInteractive` 가 Next.js 16 에서 권장되는 inline script 주입 방식.
const THEME_INIT = `(function(){try{var t=localStorage.getItem('theme');var s=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';var r=t==='light'||t==='dark'?t:s;document.documentElement.setAttribute('data-theme',r);}catch(e){document.documentElement.setAttribute('data-theme','light');}})();`;

// Pretendard Variable — 한국어 가독성 + 디스플레이 weight 확보.
// jsdelivr 의 공식 빌드를 사용 (variable font 단일 파일).
const PRETENDARD_HREF =
  'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css';

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: {
    default: '손수레 (Sonsurae)',
    template: '%s | 손수레',
  },
  description:
    'Learning in public — 한 수레씩 옮겨 담는 어느 개발자의 학습 노트. 새 개념과 도구를 따라가며 손수 정리합니다. 피드백·가르침 환영합니다.',
  applicationName: '손수레',
  authors: [{ name: '손수레' }],
  keywords: [
    '개발자 블로그',
    'AI 개발자',
    '학습 노트',
    '지식그래프',
    '위키링크',
    '머신러닝 정리',
    '딥러닝 정리',
  ],
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    siteName: '손수레',
    title: '손수레 (Sonsurae)',
    description:
      'Learning in public — 한 수레씩 옮겨 담는 어느 개발자의 학습 노트.',
  },
  twitter: {
    card: 'summary_large_image',
    title: '손수레 (Sonsurae)',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0e1116' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // suppressHydrationWarning: theme-init 인라인 스크립트가 React 하이드레이션 전에
    // <html> 의 data-theme 을 세팅하므로, 서버 마크업과 차이가 의도적으로 생긴다.
    // 이 옵션은 <html> 자체의 attribute mismatch 만 무시하고 자식 트리에는 영향 X.
    <html lang="ko" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="" />
        <link rel="stylesheet" href={PRETENDARD_HREF} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT}
        </Script>
        <SiteHeader />
        <main className="flex-1 w-full">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
