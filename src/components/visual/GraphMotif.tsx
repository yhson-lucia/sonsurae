// 손수레의 시각 정체성 — 노드와 엣지로 구성된 미세 아트워크.
// Hero 뒤에 깔리는 backdrop. SVG 라 가볍고 다크/라이트 모두 자연스럽게 따라옴.
//
// 좌표는 viewBox 1200x600 기준으로 손으로 배치 — 너무 균일하지 않게.

interface Node {
  cx: number;
  cy: number;
  r: number;
  delay?: number;       // 펄스 애니메이션 phase shift
  highlight?: boolean;  // accent 색상 적용
}

interface Edge {
  from: number; // node index
  to: number;
  dashed?: boolean;
}

const NODES: ReadonlyArray<Node> = [
  { cx: 180,  cy: 180, r: 6,  delay: 0    },
  { cx: 320,  cy: 110, r: 4,  delay: 0.5  },
  { cx: 460,  cy: 220, r: 8,  delay: 1.2, highlight: true },
  { cx: 600,  cy: 130, r: 5,  delay: 0.8  },
  { cx: 740,  cy: 250, r: 7,  delay: 0.3, highlight: true },
  { cx: 880,  cy: 160, r: 4,  delay: 1.5  },
  { cx: 1020, cy: 280, r: 5,  delay: 0.6  },
  { cx: 1100, cy: 110, r: 3,  delay: 1.0  },
  { cx: 260,  cy: 360, r: 5,  delay: 1.4  },
  { cx: 420,  cy: 460, r: 4,  delay: 0.2  },
  { cx: 600,  cy: 410, r: 9,  delay: 1.8, highlight: true },
  { cx: 780,  cy: 480, r: 4,  delay: 0.9  },
  { cx: 920,  cy: 420, r: 6,  delay: 0.4  },
  { cx: 1080, cy: 500, r: 4,  delay: 1.1  },
  { cx: 100,  cy: 480, r: 3,  delay: 1.6  },
];

const EDGES: ReadonlyArray<Edge> = [
  { from: 0, to: 1 },
  { from: 1, to: 2 },
  { from: 2, to: 3 },
  { from: 3, to: 4 },
  { from: 4, to: 5 },
  { from: 5, to: 6 },
  { from: 5, to: 7, dashed: true },
  { from: 2, to: 8 },
  { from: 8, to: 9 },
  { from: 9, to: 10 },
  { from: 4, to: 10, dashed: true },
  { from: 10, to: 11 },
  { from: 11, to: 12 },
  { from: 12, to: 13 },
  { from: 6, to: 12, dashed: true },
  { from: 9, to: 14 },
  { from: 0, to: 8, dashed: true },
];

interface Props {
  className?: string;
}

export function GraphMotif({ className }: Props) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1200 600"
      preserveAspectRatio="xMidYMid slice"
      className={className}
    >
      {/* 엣지 — 노드 뒤에 깔리도록 먼저 렌더 */}
      <g stroke="var(--graph-edge)" strokeWidth="1" fill="none">
        {EDGES.map((e, i) => {
          const a = NODES[e.from];
          const b = NODES[e.to];
          return (
            <line
              key={i}
              x1={a.cx}
              y1={a.cy}
              x2={b.cx}
              y2={b.cy}
              strokeDasharray={e.dashed ? '3 5' : undefined}
              opacity={0.7}
            />
          );
        })}
      </g>

      {/* 노드 */}
      <g>
        {NODES.map((n, i) => (
          <circle
            key={i}
            cx={n.cx}
            cy={n.cy}
            r={n.r}
            fill={n.highlight ? 'var(--graph-node-active)' : 'var(--graph-node)'}
            opacity={n.highlight ? 0.95 : 0.55}
            className="graph-node-anim"
            style={{ animationDelay: `${n.delay ?? 0}s` }}
          />
        ))}
      </g>
    </svg>
  );
}
