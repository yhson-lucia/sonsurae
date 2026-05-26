import Link from 'next/link';

import { PostCard } from '@/components/post/PostCard';
import { GraphMotif } from '@/components/visual/GraphMotif';
import { getRecentPosts } from '@/lib/mock/queries';

// 메인 페이지 — 방문자 환영 + 블로그 정체성 + 최근 발자취 피드.
// 디자인 모티프: 노드/엣지 그래프 = 손수레가 만들어가는 지식 네트워크.

export default function HomePage() {
  return (
    <div className="relative">
      {/* ───────────────────────── Hero ───────────────────────── */}
      <section className="relative isolate overflow-hidden">
        {/* 백그라운드 레이어 1 — mesh orb */}
        <div aria-hidden className="absolute inset-0 -z-20 bg-mesh-orb opacity-70" />

        {/* 백그라운드 레이어 2 — dot grid */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-dot-grid opacity-60 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]"
        />

        {/* 백그라운드 레이어 3 — 그래프 모티프 SVG */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-90 [mask-image:linear-gradient(to_bottom,black_30%,transparent_85%)]"
        >
          <GraphMotif className="h-full w-full" />
        </div>

        <div className="mx-auto max-w-screen-xl px-4 pt-20 pb-24 sm:px-6 sm:pt-28 sm:pb-32 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            {/* Eyebrow — chip 없이 가벼운 uppercase 라벨 */}
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-accent">
              Learning in public.
            </p>

            {/* Display heading */}
            <h1 className="text-display mt-4 text-5xl leading-[1.05] font-bold tracking-tight sm:text-6xl">
              <span className="text-gradient">한 수레씩</span> 옮겨 담는<br />
              국제보건 전문가의 학습 노트
            </h1>

            {/* Body */}
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-foreground-soft sm:text-lg">
              완성된 지식을 보여주는 곳이 아니라, 배우는 과정을 그대로 남기는 공간이에요.<br className="hidden sm:inline" />
              {' '}역학, 보건정책, 글로벌보건 주제들을 공부하며 손수 옮겨 담고, 다시 들여다볼 때마다 보강해 갑니다.
            </p>
            <p className="mx-auto mt-3 max-w-xl text-sm text-foreground-mute">
              피드백, 다른 시각, 가르침까지 — 모두 환영합니다.
            </p>

            {/* CTA */}
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/graph"
                className="group inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background shadow-sm transition-all hover:shadow-glow"
              >
                지식그래프로 둘러보기
                <span aria-hidden className="arrow-shift">→</span>
              </Link>
              <Link
                href="#footprints"
                className="group inline-flex items-center gap-2 rounded-full border border-border-strong bg-background/60 px-5 py-2.5 text-sm font-medium text-foreground-soft backdrop-blur transition-colors hover:bg-background-soft hover:text-foreground"
              >
                최근 발자취
                <span aria-hidden className="arrow-shift text-foreground-mute">↓</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────── About / Bento ───────────────────────── */}
      <section className="relative mx-auto max-w-screen-xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-accent">About</p>
          <h2 className="text-display mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            이 블로그는 어떻게 생겼나요?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-foreground-soft">
            국제보건 분야는 넓고 깊습니다. 역학부터 보건정책, 보건시스템, 감염병 대응까지—<br className="hidden sm:inline" />
            {' '}공부한 내용을 이 블로그로 손수 옮겨 담고,<br className="hidden sm:inline" />
            {' '}개념과 개념이 어떻게 연결되는지 함께 그려갑니다.
          </p>
        </div>

        {/* Bento grid — 3 cols × 3 rows.
            graph(2x2) | concept(1x1)
                       | timeline(1x1)
            projects(3x1, 풀와이드)
        */}
        <div className="mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3">
          {/* 큰 카드 — 지식그래프 (왼쪽 2x2) */}
          <Link
            href="/graph"
            className="lift-on-hover group relative col-span-1 overflow-hidden rounded-3xl border border-border bg-background-soft p-7 sm:p-8 md:col-span-2 md:row-span-2"
          >
            {/* mini graph visual */}
            <div aria-hidden className="absolute inset-x-0 -bottom-8 h-2/3 opacity-70 [mask-image:linear-gradient(to_top,black,transparent)]">
              <GraphMotif className="h-full w-full" />
            </div>

            <div className="relative">
              <p className="text-xs font-medium uppercase tracking-wider text-accent">
                지식그래프
              </p>
              <h3 className="text-display mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                개념은 서로<br />연결됩니다
              </h3>
              <p className="mt-3 max-w-md text-sm text-foreground-soft sm:text-base">
                하나의 개념은 다른 여러 개념과 이어져 있어요.<br className="hidden sm:inline" />
                {' '}점은 개념, 선은 개념 사이의 관계입니다.
              </p>
              <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
                그래프 페이지 열기
                <span aria-hidden className="arrow-shift">→</span>
              </span>
            </div>
          </Link>

          {/* 우상 — 글 = 한 개념 */}
          <div className="lift-on-hover relative overflow-hidden rounded-3xl border border-border bg-background-soft p-6 sm:p-7">
            <div
              aria-hidden
              className="absolute right-5 top-5 h-10 w-10 rounded-full border border-accent/30 bg-accent/10"
            />
            <p className="text-xs font-medium uppercase tracking-wider text-accent">Concept</p>
            <h3 className="text-display mt-2 text-xl font-bold tracking-tight">
              글 = 한 개념
            </h3>
            <p className="mt-2 text-sm text-foreground-soft">
              한 편의 글에 한 가지 주제만 담아 깊게 정리합니다.
            </p>
          </div>

          {/* 우하 — 시간순 발자취 */}
          <div className="lift-on-hover relative overflow-hidden rounded-3xl border border-border bg-background-soft p-6 sm:p-7">
            <div aria-hidden className="absolute right-5 top-5 flex flex-col gap-1.5">
              <span className="block h-1 w-6 rounded-full bg-warm" />
              <span className="block h-1 w-9 rounded-full bg-warm/70" />
              <span className="block h-1 w-4 rounded-full bg-warm/40" />
            </div>
            <p className="text-xs font-medium uppercase tracking-wider text-warm">Timeline</p>
            <h3 className="text-display mt-2 text-xl font-bold tracking-tight">
              시간순 발자취
            </h3>
            <p className="mt-2 text-sm text-foreground-soft">
              최근 무엇을 다듬고 보탰는지 따라가실 수 있어요.
            </p>
          </div>

          {/* 풀와이드 — 프로젝트 */}
          <Link
            href="/projects"
            className="lift-on-hover group relative col-span-1 overflow-hidden rounded-3xl border border-border bg-background-soft p-7 sm:p-8 md:col-span-3"
          >
            {/* 데코 — 우측에 떠있는 작은 카드 그림자들 (프로젝트 스택 메타포) */}
            <div
              aria-hidden
              className="pointer-events-none absolute right-6 top-1/2 hidden -translate-y-1/2 sm:block"
            >
              <div className="relative h-28 w-44">
                <span className="absolute right-0 top-0 h-20 w-32 rotate-3 rounded-xl border border-border-strong bg-background shadow-sm" />
                <span className="absolute right-3 top-3 h-20 w-32 -rotate-2 rounded-xl border border-border-strong bg-background-mute shadow-sm" />
                <span className="absolute right-6 top-6 h-20 w-32 rotate-1 rounded-xl border border-warm/40 bg-warm-soft shadow-sm" />
              </div>
            </div>

            <div className="relative max-w-xl">
              <p className="text-xs font-medium uppercase tracking-wider text-warm">Projects</p>
              <h3 className="text-display mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                지나온 프로젝트들
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-foreground-soft sm:text-base">
                개념을 글로 정리하는 것과는 별개로, 직접 만들고 부딪힌 프로젝트들의 기록입니다.<br className="hidden sm:inline" />
                {' '}구조, 의사결정, 회고를 함께 남깁니다.
              </p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
                프로젝트 보러가기
                <span aria-hidden className="arrow-shift">→</span>
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* ───────────────────────── Footprints ───────────────────────── */}
      <FootprintsSection />
    </div>
  );
}

async function FootprintsSection() {
  const posts = await getRecentPosts(8);

  return (
    <section
      id="footprints"
      className="mx-auto mt-12 max-w-screen-xl px-4 pb-24 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-3xl">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-accent">
              Footprints
            </p>
            <h2 className="text-display mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              최근 발자취
            </h2>
          </div>
          <span className="text-sm text-foreground-mute">총 {posts.length}편</span>
        </div>

        {posts.length === 0 ? (
          <p className="mt-8 text-sm text-foreground-mute">아직 글이 없어요.</p>
        ) : (
          <ul className="mt-8 grid grid-cols-1 gap-4 sm:gap-5">
            {posts.map((post) => (
              <li key={post.id}>
                <PostCard post={post} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
