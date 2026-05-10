import { describe, expect, it } from 'vitest';

import { searchDocs, type SearchableDoc } from './search';

const docs: SearchableDoc[] = [
  {
    id: '1',
    slug: 'perceptron',
    title: '퍼셉트론',
    excerpt: '단순 신경망의 기초.',
    body_md: '퍼셉트론은 1957년 제안되었다.',
    category_name: '딥러닝',
  },
  {
    id: '2',
    slug: 'neural-network',
    title: '신경망',
    excerpt: '여러 층의 뉴런 모델.',
    body_md: '신경망은 다층 퍼셉트론의 일반화이다. 활성화 함수가 핵심.',
    category_name: '딥러닝',
  },
  {
    id: '3',
    slug: 'spring-boot',
    title: 'Spring Boot 시작',
    excerpt: '자동 설정.',
    body_md: '스프링 부트는 자동 설정을 제공한다.',
    category_name: 'Spring',
  },
];

describe('searchDocs', () => {
  it('빈 쿼리는 빈 결과', () => {
    expect(searchDocs(docs, '')).toEqual([]);
    expect(searchDocs(docs, '   ')).toEqual([]);
  });

  it('제목 매칭이 본문 매칭보다 점수 높음', () => {
    const hits = searchDocs(docs, '퍼셉트론');
    expect(hits[0].doc.slug).toBe('perceptron'); // 제목 매칭
  });

  it('카테고리명 매칭', () => {
    const hits = searchDocs(docs, '딥러닝');
    const slugs = hits.map((h) => h.doc.slug);
    expect(slugs).toContain('perceptron');
    expect(slugs).toContain('neural-network');
  });

  it('다중 토큰 — 모두 매칭하는 글만 반환', () => {
    const hits = searchDocs(docs, '신경망 활성화');
    expect(hits).toHaveLength(1);
    expect(hits[0].doc.slug).toBe('neural-network');
  });

  it('대소문자 무시', () => {
    const hits = searchDocs(docs, 'SPRING');
    expect(hits[0].doc.slug).toBe('spring-boot');
  });

  it('매칭 없으면 빈 배열', () => {
    expect(searchDocs(docs, 'xyz123nope')).toEqual([]);
  });

  it('snippet 이 매칭 위치 주변을 포함', () => {
    const hits = searchDocs(docs, '활성화');
    expect(hits[0].snippet).toContain('활성화');
  });
});
