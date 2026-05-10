// 내부 미리보기 — MarkdownRenderer 의 렌더 결과를 눈으로 확인하기 위한 페이지.
// 본 사이트의 정식 라우트 아님. Phase 6 SEO 단계에서 robots disallow 추가 예정.
//
// 마이그레이션 데이터의 실제 글 형식(LaTeX + 코드 + 표 + 한국어 본문)을 모사한 샘플을 둔다.

import type { Metadata } from 'next';

import { MarkdownRenderer } from '@/components/markdown/MarkdownRenderer';

export const metadata: Metadata = {
  title: '미리보기 (내부)',
  robots: { index: false, follow: false },
};

const KNOWN_SLUGS = new Set([
  'perceptron',
  'neural-network',
  'backpropagation',
]);

const SAMPLE = `# 마크다운 렌더러 미리보기

이 페이지는 손수레의 본문 렌더링을 빠르게 점검하기 위한 내부용입니다. 정식 글이 아닙니다.

## 위키링크

본문에 \`[[perceptron]]\` 처럼 쓰면 → [[perceptron]] 으로 자동 변환됩니다.
[[neural-network|신경망]] 처럼 라벨을 붙일 수도 있고, [[neural-network#training]] 처럼 앵커도 됩니다.
존재하지 않는 [[no-such-slug]] 는 점선 링크 (stub) 으로 표시됩니다.

\`\`\`text
코드 블록 안의 [[ignored]] 는 위키링크로 변환되지 않습니다.
\`\`\`

## LaTeX

인라인 수식: $\\sigma(x) = \\frac{1}{1 + e^{-x}}$ — 시그모이드는 입력을 0~1 로 압축합니다.

블록 수식:

$$
\\text{Cost}(W, b) = -\\frac{1}{m}\\sum_{i=1}^{m}\\left[y^{(i)} \\log(H(x^{(i)})) + (1 - y^{(i)}) \\log(1 - H(x^{(i)}))\\right]
$$

이게 [[backpropagation|역전파]] 학습의 손실 함수입니다.

## 코드 블록 (Shiki — one-light / one-dark-pro)

\`\`\`python
# 이진 분류용 간단한 신경망 — Binary Cross-Entropy 손실
import torch
import torch.nn as nn
from typing import Tuple


class SimpleClassifier(nn.Module):
    """입력 차원을 받아 0~1 확률을 출력하는 모델."""

    def __init__(self, input_dim: int = 784) -> None:
        super().__init__()
        self.layers = nn.Sequential(
            nn.Linear(input_dim, 128),
            nn.ReLU(),
            nn.Linear(128, 1),
            nn.Sigmoid(),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.layers(x)


# 학습 루프
model = SimpleClassifier()
criterion = nn.BCELoss()
optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)

for epoch in range(100):
    pred = model(X_train)
    loss = criterion(pred, y_train)
    optimizer.zero_grad()
    loss.backward()
    optimizer.step()
    if epoch % 10 == 0:
        print(f"Epoch {epoch:3d}: loss = {loss.item():.4f}")
\`\`\`

TypeScript 도 비교 확인:

\`\`\`typescript
import { useState, useEffect } from 'react';

interface Post {
  id: string;
  slug: string;
  title: string;
  publishedAt: Date | null;
}

async function fetchRecentPosts(limit = 10): Promise<Post[]> {
  const res = await fetch(\`/api/posts?limit=\${limit}\`);
  if (!res.ok) throw new Error('failed to fetch');
  return res.json();
}
\`\`\`

## 표 (GFM)

| 모델 | 정확도 | 비고 |
|------|--------|------|
| ResNet-50 | 93% | baseline |
| ViT-Base  | 95% | finetuned |
| Custom    | 96% | 도메인 적응 |

## 체크리스트

- [x] 위키링크 파서 + 변환
- [x] LaTeX 렌더 (KaTeX)
- [x] GFM 표·체크리스트
- [ ] 코드 하이라이팅 (Shiki, Phase 6)
- [ ] 검색 (Phase 6)

## 강조

> 인용. 학습 노트에서 자주 쓰임. 본문 색조와 자연스럽게 어울려야 함.

**bold**, *italic*, ~~strikethrough~~, \`inline code\` 모두 정상 동작 확인.
`;

export default function PreviewPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="mb-8 rounded-2xl border border-warm/40 bg-warm-soft px-4 py-3 text-sm text-foreground-soft">
        <strong className="text-foreground">내부 미리보기 페이지.</strong>{' '}
        본문 렌더링 점검용. 정식 발행물 아님.
      </div>

      <MarkdownRenderer source={SAMPLE} knownSlugs={KNOWN_SLUGS} />
    </div>
  );
}
