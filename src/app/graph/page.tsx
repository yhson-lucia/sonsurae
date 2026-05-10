// 지식그래프 페이지 — /graph
//
// 손수레의 정체성 페이지. 모든 발행 글을 노드로, 본문 위키링크를 엣지로 시각화.
// 노드 클릭 → 해당 글 상세로 이동.

import type { Metadata } from 'next';

import { GraphView } from '@/components/graph/GraphView';
import { buildGraphFromPosts } from '@/lib/graph';
import { getAllCategories, getAllPublishedPosts } from '@/lib/mock/queries';

export const metadata: Metadata = {
  title: '지식그래프',
  description:
    '손수레에 쌓인 모든 글과 그 사이의 위키링크 관계를 한 장면에. 점은 개념, 선은 개념 사이의 연결.',
};

export default async function GraphPage() {
  const [posts, categories] = await Promise.all([
    getAllPublishedPosts(),
    getAllCategories(),
  ]);
  const data = buildGraphFromPosts(posts, categories);

  // 노드/엣지 통계
  const postCount = data.nodes.filter((n) => n.kind === 'post').length;
  const categoryCount = data.nodes.filter((n) => n.kind === 'category').length;
  const wikilinkCount = data.links.filter((l) => l.kind === 'wikilink').length;

  // group 별 카테고리 색 라벨 — 범례용
  const groups = Array.from(new Set(data.nodes.map((n) => n.group))).sort();

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <header className="mx-auto max-w-3xl">
        <p className="text-xs font-medium uppercase tracking-wider text-accent">
          Knowledge graph
        </p>
        <h1 className="text-display mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          차곡차곡 쌓은 지식들
        </h1>
        <p className="mt-3 text-base leading-relaxed text-foreground-soft">
          비슷한 주제끼리 색으로 묶이고, 서로 이어지는 개념들은 선으로 연결됩니다.
          노드를 클릭하면 그 글로 이동해요.
        </p>
      </header>

      {/* 통계 + 범례 */}
      <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-foreground-soft">
        <span>
          <strong className="text-foreground">{postCount}</strong> 개 글
        </span>
        <span>
          <strong className="text-foreground">{categoryCount}</strong> 개 카테고리
        </span>
        <span>
          <strong className="text-foreground">{wikilinkCount}</strong> 개 위키링크
        </span>
        <span aria-hidden className="text-foreground-mute">·</span>
        <ul className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {groups.map((g) => (
            <li key={g} className="inline-flex items-center gap-1.5">
              <span
                aria-hidden
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: groupColor(g) }}
              />
              <span className="text-xs uppercase tracking-wider">{g}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 그래프 캔버스 */}
      <div className="mt-6">
        <GraphView data={data} height={640} />
      </div>
    </div>
  );
}

function groupColor(g: string): string {
  const map: Record<string, string> = {
    ai: '#10b981',
    fe: '#0ea5e9',
    spring: '#84cc16',
    java: '#f59e0b',
    jpa: '#65a30d',
    jdbc: '#65a30d',
    network: '#06b6d4',
    database: '#6366f1',
    os: '#8b5cf6',
    docker: '#0ea5e9',
    aws: '#f97316',
  };
  return map[g] ?? '#64748b';
}
