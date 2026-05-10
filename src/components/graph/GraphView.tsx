'use client';

// 손수레 지식그래프 — post + category 두 종류 노드.
//
// 디자인 요소:
//  - 그라디언트 메시 백드롭 (CSS) + 도트 그리드 오버레이
//  - 노드 종류별 차별 렌더:
//     · post     → 작은 원 + halo + 라벨(줌/호버 시)
//     · category → 큰 원 + 두꺼운 ring + 라벨 항상 표시
//  - 엣지 종류별 차별:
//     · wikilink   → 곡선, 정상 굵기 (글↔글, 핵심)
//     · membership → 직선, 얇고 옅음 (글→카테고리, 배경 구조)
//     · hierarchy  → 직선, dashed (자식→부모 카테고리)
//  - 호버 디밍, 호버 엣지 입자 흐름.
//  - 클릭 → kind 별 라우팅 (post → /posts/{slug}, category → /category/{slug}).

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { GraphData, GraphLink, GraphNode } from '@/lib/graph';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-sm text-foreground-mute">
      그래프 로딩 중…
    </div>
  ),
});

interface Props {
  data: GraphData;
  /** 컨테이너 높이 (px). 기본 600. */
  height?: number;
  /** 강조 표시할 중심 노드 (mini-graph 용). */
  centerSlug?: string;
}

/* 카테고리 group → 노드 색상. 사이트 팔레트와 호응. */
const GROUP_COLORS: Record<string, string> = {
  ai: '#10b981',     // emerald-500
  fe: '#0ea5e9',     // sky-500
  spring: '#84cc16', // lime-500
  java: '#f59e0b',   // amber-500
  jpa: '#65a30d',    // lime-600
  jdbc: '#65a30d',
  network: '#06b6d4',// cyan-500
  database: '#6366f1',// indigo-500
  os: '#8b5cf6',     // violet-500
  docker: '#0ea5e9',
  aws: '#f97316',    // orange-500
};

const DEFAULT_NODE = '#64748b'; // slate-500
const ACCENT = '#10b981';

export function GraphView({ data, height = 600, centerSlug }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height });
  const [isDark, setIsDark] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const router = useRouter();

  /* 컨테이너 너비 측정 */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setSize({ width: el.clientWidth, height });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [height]);

  /* data-theme 감지 — 라벨/링 색상 라이브 스왑 */
  useEffect(() => {
    const sync = () =>
      setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
    sync();
    const mo = new MutationObserver(sync);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => mo.disconnect();
  }, []);

  /* 인접 인덱스 — 호버 디밍에 사용 */
  const adjacency = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const link of data.links) {
      const s = typeof link.source === 'string' ? link.source : (link.source as GraphNode).id;
      const t = typeof link.target === 'string' ? link.target : (link.target as GraphNode).id;
      if (!map.has(s)) map.set(s, new Set());
      if (!map.has(t)) map.set(t, new Set());
      map.get(s)!.add(t);
      map.get(t)!.add(s);
    }
    return map;
  }, [data.links]);

  const isConnectedToHover = useCallback(
    (id: string) => {
      if (!hoveredId) return false;
      if (hoveredId === id) return true;
      return adjacency.get(hoveredId)?.has(id) ?? false;
    },
    [adjacency, hoveredId],
  );

  const nodeColor = useCallback(
    (n: GraphNode) => {
      if (centerSlug && n.kind === 'post' && n.slug === centerSlug) return ACCENT;
      return GROUP_COLORS[n.group] ?? DEFAULT_NODE;
    },
    [centerSlug],
  );

  /* 사이즈/라벨 색은 테마에 따라 다르게 */
  const labelColor = isDark ? 'rgba(220,225,235,0.95)' : 'rgba(30,41,59,0.92)';
  const ringColor = isDark ? '#0f172a' : '#fafaf7';
  const linkBaseLight = isDark ? 'rgba(148,163,184,0.18)' : 'rgba(100,116,139,0.22)';
  const linkHi = isDark ? 'rgba(16,185,129,0.85)' : 'rgba(16,185,129,0.9)';

  /* 엣지 종류별 색 / dash / 굵기 */
  const linkStyle = useCallback(
    (link: GraphLink, isHi: boolean, dim: number) => {
      const dashByKind: Record<string, number[] | undefined> = {
        wikilink: undefined,
        membership: undefined,
        hierarchy: [4, 4],
      };
      const widthByKind: Record<string, number> = {
        wikilink: isHi ? 1.8 : 0.9,
        membership: isHi ? 1.0 : 0.4,
        hierarchy: isHi ? 1.4 : 0.7,
      };
      const baseOpacity: Record<string, number> = {
        wikilink: 1,
        membership: 0.45,
        hierarchy: 0.7,
      };

      const color = isHi
        ? linkHi
        : applyAlpha(linkBaseLight, baseOpacity[link.kind] * dim);

      return {
        color,
        width: widthByKind[link.kind],
        dash: dashByKind[link.kind],
      };
    },
    [linkBaseLight, linkHi],
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-3xl border border-border-strong"
      style={{
        height,
        background: `
          radial-gradient(ellipse 70% 60% at 80% 0%, color-mix(in oklch, var(--accent) 14%, transparent), transparent 60%),
          radial-gradient(ellipse 55% 45% at 0% 100%, color-mix(in oklch, var(--warm) 12%, transparent), transparent 55%),
          radial-gradient(ellipse 40% 50% at 100% 100%, color-mix(in oklch, var(--accent) 8%, transparent), transparent 60%),
          var(--background-soft)
        `,
      }}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-dot-grid opacity-50" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 60%, color-mix(in oklch, var(--foreground) 5%, transparent) 100%)',
        }}
      />

      {size.width > 0 ? (
        <ForceGraph2D
          graphData={data as never}
          width={size.width}
          height={size.height}
          backgroundColor="rgba(0,0,0,0)"
          /* ─── 링크 ─── */
          linkCurvature={(l: object) => ((l as GraphLink).kind === 'wikilink' ? 0.22 : 0)}
          linkColor={(l: object) => {
            const link = l as GraphLink;
            const s = typeof link.source === 'string' ? link.source : (link.source as GraphNode).id;
            const t = typeof link.target === 'string' ? link.target : (link.target as GraphNode).id;
            const isHi = !!hoveredId && (s === hoveredId || t === hoveredId);
            const dim = hoveredId ? 0.4 : 1;
            return linkStyle(link, isHi, dim).color;
          }}
          linkWidth={(l: object) => {
            const link = l as GraphLink;
            const s = typeof link.source === 'string' ? link.source : (link.source as GraphNode).id;
            const t = typeof link.target === 'string' ? link.target : (link.target as GraphNode).id;
            const isHi = !!hoveredId && (s === hoveredId || t === hoveredId);
            return linkStyle(link, isHi, 1).width;
          }}
          linkLineDash={(l: object) => {
            const link = l as GraphLink;
            return linkStyle(link, false, 1).dash ?? null;
          }}
          /* 입자: wikilink 호버에만 */
          linkDirectionalParticles={(l: object) => {
            const link = l as GraphLink;
            if (link.kind !== 'wikilink') return 0;
            const s = typeof link.source === 'string' ? link.source : (link.source as GraphNode).id;
            const t = typeof link.target === 'string' ? link.target : (link.target as GraphNode).id;
            return hoveredId && (s === hoveredId || t === hoveredId) ? 3 : 0;
          }}
          linkDirectionalParticleWidth={2}
          linkDirectionalParticleColor={() => ACCENT}
          linkDirectionalParticleSpeed={0.006}
          /* ─── 노드 ─── */
          nodeRelSize={5}
          nodeCanvasObjectMode={() => 'replace'}
          nodeCanvasObject={(rawNode, ctx, scale) => {
            const node = rawNode as GraphNode & { x?: number; y?: number };
            if (node.x == null || node.y == null) return;

            const isCenter = !!centerSlug && node.kind === 'post' && node.slug === centerSlug;
            const isHovered = node.id === hoveredId;
            const isConnected = isConnectedToHover(node.id);
            const dimmed = !!hoveredId && !isConnected;

            const base = nodeColor(node);
            const alpha = dimmed ? 0.25 : 1;

            // 카테고리 노드 — 더 크게, 두꺼운 ring
            if (node.kind === 'category') {
              const r = (node.parentSlug ? 9 : 12) / Math.sqrt(scale);
              const haloR = r * (isHovered ? 3 : 2.4);

              // halo
              const grad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, haloR);
              grad.addColorStop(0, hex(base, 0.45 * alpha));
              grad.addColorStop(0.5, hex(base, 0.15 * alpha));
              grad.addColorStop(1, hex(base, 0));
              ctx.fillStyle = grad;
              ctx.beginPath();
              ctx.arc(node.x, node.y, haloR, 0, Math.PI * 2);
              ctx.fill();

              // body — accent ring + 안쪽 흐릿
              ctx.fillStyle = hex(base, 0.18 * alpha);
              ctx.beginPath();
              ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
              ctx.fill();

              ctx.strokeStyle = hex(base, alpha);
              ctx.lineWidth = 2.4;
              ctx.beginPath();
              ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
              ctx.stroke();

              // 라벨 — 카테고리는 항상 보임
              const fontSize = Math.max(11.5, 13 / scale);
              ctx.font = `700 ${fontSize}px "Pretendard Variable", system-ui, sans-serif`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'top';
              ctx.fillStyle = dimmed ? hex(labelColor, 0.4) : hex(labelColor, alpha);
              ctx.fillText(node.title, node.x, node.y + r + 6);
              return;
            }

            // 기본(post) 노드 — 글로우 + 채움 + 배경색 ring
            const r = (isCenter ? 7 : isHovered ? 6.2 : 5) / Math.sqrt(scale);
            const haloR = r * (isHovered || isCenter ? 4.5 : 3.2);

            const grad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, haloR);
            grad.addColorStop(0, hex(base, 0.5 * alpha));
            grad.addColorStop(0.4, hex(base, 0.18 * alpha));
            grad.addColorStop(1, hex(base, 0));
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(node.x, node.y, haloR, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = hex(base, alpha);
            ctx.beginPath();
            ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = ringColor;
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
            ctx.stroke();

            // 라벨 — 줌이 들어왔거나 호버/중심일 때만
            const showLabel = scale > 1.4 || isHovered || isCenter;
            if (showLabel) {
              const fontSize = Math.max(10.5, 12 / scale);
              ctx.font = `${isCenter || isHovered ? '600 ' : ''}${fontSize}px "Pretendard Variable", system-ui, sans-serif`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'top';
              ctx.fillStyle = dimmed ? hex(labelColor, 0.4) : labelColor;
              ctx.fillText(node.title, node.x, node.y + r + 5);
            }
          }}
          /* 인터랙션 */
          onNodeHover={(n: object | null) => setHoveredId(n ? (n as GraphNode).id : null)}
          onNodeClick={(n: object) => {
            const node = n as GraphNode;
            if (node.kind === 'category') {
              router.push(`/category/${node.slug}`);
            } else {
              router.push(`/posts/${node.slug}`);
            }
          }}
          /* 시뮬레이션 */
          cooldownTicks={140}
          warmupTicks={30}
          d3AlphaDecay={0.02}
        />
      ) : null}
    </div>
  );
}

/* CSS 색을 alpha 와 함께 캔버스용 rgba 로. hex/rgb/rgba 모두 입력 받음. */
function hex(color: string, alpha: number): string {
  const m = /^rgba?\(([^)]+)\)$/.exec(color);
  if (m) {
    const parts = m[1].split(',').map((s) => s.trim());
    const [r, g, b] = parts;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  const h = color.replace('#', '');
  if (h.length === 6) {
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return color;
}

function applyAlpha(rgba: string, factor: number): string {
  return rgba.replace(/[\d.]+\)$/, (m) => `${(parseFloat(m) * factor).toFixed(3)})`);
}
