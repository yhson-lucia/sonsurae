import type { Metadata } from 'next';

// Phase 5/7 에서 실제 프로젝트 데이터로 채워진다.
// 지금은 페이지 골격 + skeleton 카드만 — 디자인 / 라우팅 검증.
//
// 데이터 모델 메모 (Phase 5):
//   글(posts) 과 프로젝트(projects) 는 분리된 테이블이 적절하다.
//   - projects: name, slug, summary, status('진행중'|'완료'|'중단'), period_start, period_end,
//               stack[], repo_url, demo_url, body_md, cover_image_url
//   - 글과 달리 "기간" / "스택" / "결과물 링크" 같은 별도 필드가 핵심이라 posts 와 합치면 어색하다.
//   - 지식그래프(post_links) 와는 무관 — 별도 페이지에서만 노출.

export const metadata: Metadata = {
  title: '프로젝트',
  description: '직접 만든 프로젝트들의 기록 — 구조, 의사결정, 회고.',
};

export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <header className="mx-auto max-w-3xl">
        <p className="text-xs font-medium uppercase tracking-wider text-warm">Projects</p>
        <h1 className="text-display mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
          지나온 프로젝트들
        </h1>
        <p className="mt-4 text-base leading-relaxed text-foreground-soft sm:text-lg">
          개념을 글로 정리하는 것과는 별개로, 직접 만들고 부딪힌 프로젝트들을 모아둡니다.
          무엇을 만들었는지보다 <em className="not-italic text-foreground">왜 그렇게 만들었는지</em>,
          무엇을 배웠는지를 남기려 합니다.
        </p>
      </header>

      {/* Skeleton grid — 실제 프로젝트 카드 디자인 미리보기 */}
      <ul className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <li
            key={i}
            className="lift-on-hover relative overflow-hidden rounded-3xl border border-border bg-background-soft p-6 sm:p-7"
          >
            {/* 상태 배지 */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border-strong bg-background px-2.5 py-0.5 text-xs font-medium text-foreground-soft">
                <span className="h-1.5 w-1.5 rounded-full bg-warm" />
                예정
              </span>
              <span className="text-xs text-foreground-mute">2024 — 2025</span>
            </div>

            <div className="mt-4 h-6 w-3/5 rounded bg-background-mute" />
            <div className="mt-3 h-3 w-full rounded bg-background-mute/70" />
            <div className="mt-1.5 h-3 w-5/6 rounded bg-background-mute/70" />
            <div className="mt-1.5 h-3 w-2/3 rounded bg-background-mute/70" />

            {/* 스택 칩 */}
            <div className="mt-5 flex flex-wrap gap-1.5">
              {['stack', 'stack', 'stack'].map((_, j) => (
                <span
                  key={j}
                  className="inline-block h-5 w-14 rounded-full bg-background-mute"
                />
              ))}
            </div>
          </li>
        ))}
      </ul>

      <p className="mx-auto mt-10 max-w-3xl text-center text-sm text-foreground-mute">
        곧 채워집니다.
      </p>
    </div>
  );
}
