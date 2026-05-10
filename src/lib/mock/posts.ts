import type { MockPost } from './types';

import { MOCK_CATEGORIES } from './categories';

// Phase 3 UI 작업용 mock 글들.
// 본문은 짧게 — UI 검증에 필요한 만큼만. 위키링크 / 코드 / 수식이 골고루 들어가도록 작성.
// Phase 7 마이그레이션에서 실제 90+ 글로 대체된다.

function categoryOf(slug: string): MockPost['category'] {
  const c = MOCK_CATEGORIES.find((c) => c.slug === slug);
  if (!c) throw new Error(`unknown category: ${slug}`);
  return { slug: c.slug, name: c.name, icon: c.icon, color: c.color };
}

export const MOCK_POSTS: ReadonlyArray<MockPost> = [
  {
    id: 'post-perceptron',
    slug: 'perceptron',
    title: '퍼셉트론',
    excerpt:
      '입력에 가중치를 곱한 합이 임계값을 넘으면 1, 아니면 0을 출력하는 가장 단순한 신경망.',
    body_md: `## 정의

퍼셉트론은 1957년 Frank Rosenblatt 가 제안한 가장 단순한 신경망 모델이다.
입력에 가중치를 곱해 합한 값이 임계값을 넘으면 1, 아니면 0을 출력한다.

## 수식

$$
y = \\begin{cases}
1 & \\text{if } \\sum_i w_i x_i + b > 0 \\\\
0 & \\text{otherwise}
\\end{cases}
$$

## 한계

XOR 같은 선형 분리 불가능 문제는 단일 퍼셉트론으로 풀 수 없다.
이 한계는 [[neural-network|다층 신경망]] 으로 극복되고, 학습 알고리즘은 [[backpropagation|역전파]] 가 담당한다.

## 코드

\`\`\`python
def perceptron(x, w, b):
    return 1 if sum(wi * xi for wi, xi in zip(w, x)) + b > 0 else 0
\`\`\`
`,
    cover_image_url: null,
    category: categoryOf('ai/deep-learning'),
    parent_post_slug: null,
    published: true,
    published_at: '2026-04-19T09:00:00+09:00',
    sort_order: 1,
  },
  {
    id: 'post-neural-network',
    slug: 'neural-network',
    title: '신경망',
    excerpt:
      '여러 층의 뉴런이 연결되어 비선형 문제를 풀 수 있는 모델. [[perceptron]] 의 자연스러운 확장.',
    body_md: `## 다층 구조

[[perceptron|퍼셉트론]] 을 여러 층으로 쌓아 비선형 함수를 근사할 수 있다.
입력층 → 은닉층(들) → 출력층 구조.

## 활성화 함수

각 층은 비선형 활성화 함수를 통과해야 한다 — 그래야 다층의 의미가 살아난다.

- ReLU: $\\max(0, x)$
- Sigmoid: $\\sigma(x) = \\frac{1}{1 + e^{-x}}$
- Tanh: $\\tanh(x)$

## 학습

손실을 줄이는 방향으로 가중치를 갱신한다.
구체적인 알고리즘은 [[backpropagation]] 참고.
`,
    cover_image_url: null,
    category: categoryOf('ai/deep-learning'),
    parent_post_slug: null,
    published: true,
    published_at: '2026-04-26T14:30:00+09:00',
    sort_order: 2,
  },
  {
    id: 'post-backpropagation',
    slug: 'backpropagation',
    title: '오차 역전파',
    excerpt:
      '신경망이 손실의 그래디언트를 출력층 → 입력층 방향으로 효율적으로 계산하는 알고리즘.',
    body_md: `## 핵심

손실 함수에 대한 각 가중치의 편미분을 *연쇄 법칙(chain rule)* 으로 계산한다.

$$
\\frac{\\partial L}{\\partial w_{ij}^{(l)}} = \\frac{\\partial L}{\\partial a_i^{(l)}} \\cdot \\frac{\\partial a_i^{(l)}}{\\partial w_{ij}^{(l)}}
$$

## 흐름

1. 순전파: 입력 → 출력 → 손실 계산
2. 역전파: 출력층의 그래디언트부터 시작해 거꾸로 전파
3. 갱신: $w \\leftarrow w - \\eta \\cdot \\frac{\\partial L}{\\partial w}$

## 관련 글

- [[neural-network]] — 역전파가 작동하는 모델 구조
- [[gradient-descent]] — 갱신 단계의 최적화 (※ 아직 정리 전)
`,
    cover_image_url: null,
    category: categoryOf('ai/deep-learning'),
    parent_post_slug: null,
    published: true,
    published_at: '2026-05-03T11:00:00+09:00',
    sort_order: 3,
  },
  {
    id: 'post-decision-tree',
    slug: 'decision-tree',
    title: '의사결정 나무',
    excerpt:
      '특징을 기준으로 데이터를 분할하며 분류하는 트리 모델. 해석 가능성이 높다.',
    body_md: `## 핵심 아이디어

각 노드에서 어떤 특징으로 데이터를 나눌지 결정한다.
분할 기준: **정보 이득(Information Gain)**, **지니 불순도** 등.

## 장점

- 해석 가능 (왜 그렇게 예측했는지 추적 가능)
- 전처리 거의 불필요
- 수치형/범주형 모두 처리

## 단점

- 과적합 경향 → 가지치기 또는 앙상블 필요
- 작은 변동에도 트리 구조가 크게 바뀜 → [[random-forest]] 같은 앙상블이 답 (※ stub)
`,
    cover_image_url: null,
    category: categoryOf('ai/machine-learning'),
    parent_post_slug: null,
    published: true,
    published_at: '2026-04-12T17:00:00+09:00',
    sort_order: 1,
  },
  {
    id: 'post-react-server-components',
    slug: 'react-server-components',
    title: 'React Server Components',
    excerpt:
      '서버에서 React 트리를 렌더해 직렬화된 결과만 클라이언트로 보내는 React 19 의 핵심 기능.',
    body_md: `## 왜?

- 클라이언트 번들 크기 감소
- DB / 파일시스템 직접 접근 가능
- 데이터 fetch 폭포(waterfall) 제거

## 구분

| | Server Component | Client Component |
|---|---|---|
| 기본 | ✓ | \`'use client'\` 명시 |
| useState / useEffect | ❌ | ✓ |
| async / DB 직접 호출 | ✓ | ❌ |
| 번들 영향 | 0 (서버 전용) | 있음 |

## 예시

\`\`\`tsx
// app/posts/page.tsx — 기본 server component
import { getPosts } from '@/lib/posts';

export default async function PostsPage() {
  const posts = await getPosts();
  return <ul>{posts.map(p => <li key={p.id}>{p.title}</li>)}</ul>;
}
\`\`\`
`,
    cover_image_url: null,
    category: categoryOf('fe'),
    parent_post_slug: null,
    published: true,
    published_at: '2026-05-01T20:00:00+09:00',
    sort_order: 1,
  },
  {
    id: 'post-spring-boot-intro',
    slug: 'spring-boot-intro',
    title: 'Spring Boot 시작하기',
    excerpt:
      '복잡한 Spring 설정을 자동화한 프레임워크. 어노테이션 기반 빠른 시작.',
    body_md: `## 핵심 가치

- **자동 설정** (Auto-configuration): 클래스패스에 따라 적절한 빈을 자동 등록
- **스타터 의존성**: \`spring-boot-starter-web\` 만 추가하면 웹 서버 + JSON + Validation 일체 셋업
- **내장 톰캣**: war 없이 jar 로 실행

## 최소 예시

\`\`\`java
@SpringBootApplication
public class DemoApplication {
    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }
}

@RestController
class HelloController {
    @GetMapping("/")
    String hello() { return "안녕하세요"; }
}
\`\`\`

## 참고
- 트랜잭션 처리는 [[transaction-management]] (※ stub) 에서 별도 정리.
`,
    cover_image_url: null,
    category: categoryOf('spring'),
    parent_post_slug: null,
    published: true,
    published_at: '2026-04-05T13:00:00+09:00',
    sort_order: 1,
  },
];
