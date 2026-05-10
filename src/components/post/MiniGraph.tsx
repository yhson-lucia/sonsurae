// 글 상세 페이지 하단의 미니 그래프.
// 중심 글 + 1-hop 이웃 글들 + 그 글이 속한 카테고리 노드.

import { GraphView } from '@/components/graph/GraphView';
import { buildLocalGraph } from '@/lib/graph';
import type { MockCategory, MockPost } from '@/lib/mock/types';

interface Props {
  posts: ReadonlyArray<MockPost>;
  centerSlug: string;
  categories?: ReadonlyArray<MockCategory>;
}

export function MiniGraph({ posts, centerSlug, categories }: Props) {
  const data = buildLocalGraph(posts, centerSlug, categories);

  // 외톨이(연결 0) 글이면 표시 X.
  if (data.nodes.length <= 1) return null;

  return (
    <section className="mt-12">
      <p className="text-xs font-medium uppercase tracking-wider text-accent">
        Local graph
      </p>
      <h2 className="text-display mt-2 text-lg font-bold tracking-tight">
        이 글의 이웃
      </h2>
      <p className="mt-1 text-sm text-foreground-mute">
        직접 링크로 연결된 글 + 이 글이 속한 카테고리. 클릭 시 해당 페이지로 이동.
      </p>
      <div className="mt-4">
        <GraphView data={data} height={360} centerSlug={centerSlug} />
      </div>
    </section>
  );
}
