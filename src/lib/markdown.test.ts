import { describe, expect, it } from 'vitest';

import { preprocessMarkdown } from './markdown';

describe('preprocessMarkdown', () => {
  it('단순 [[slug]] 를 wikilink 앵커로 치환', () => {
    const { markdown, links } = preprocessMarkdown('보세요 [[perceptron]] 입니다.');
    expect(markdown).toContain('class="wikilink"');
    expect(markdown).toContain('href="/posts/perceptron"');
    expect(markdown).toContain('>perceptron</a>');
    expect(links).toHaveLength(1);
  });

  it('[[slug|label]] — label 이 앵커 텍스트로 들어감', () => {
    const { markdown } = preprocessMarkdown('[[perceptron|퍼셉트론]]');
    expect(markdown).toContain('>퍼셉트론</a>');
    expect(markdown).toContain('href="/posts/perceptron"');
  });

  it('[[slug#anchor]] — fragment 가 href 에 포함', () => {
    const { markdown } = preprocessMarkdown('[[neural-network#training]]');
    expect(markdown).toContain('href="/posts/neural-network#training"');
  });

  it('knownSlugs 미포함 → stub 클래스 추가', () => {
    const { markdown } = preprocessMarkdown('[[unknown-slug]]', new Set(['exists']));
    expect(markdown).toContain('class="wikilink wikilink--stub"');
    expect(markdown).toContain('title="아직 작성되지 않은 노트"');
  });

  it('knownSlugs 포함 → 일반 wikilink', () => {
    const { markdown } = preprocessMarkdown('[[exists]]', new Set(['exists']));
    expect(markdown).toContain('class="wikilink"');
    expect(markdown).not.toContain('wikilink--stub');
  });

  it('코드 블록 안의 [[...]] 는 그대로 둔다', () => {
    const md = '```\n[[in-code]]\n```\n[[out]]';
    const { markdown, links } = preprocessMarkdown(md);
    // 코드 블록 안의 슬러그는 변환되지 않으므로 원문 그대로 남아 있어야 함
    expect(markdown).toContain('[[in-code]]');
    expect(markdown).toContain('href="/posts/out"');
    expect(links).toHaveLength(1);
    expect(links[0].slug).toBe('out');
  });

  it('label 의 < > 같은 문자는 escape 된다', () => {
    const { markdown } = preprocessMarkdown('[[s|<bad>]]');
    expect(markdown).toContain('&lt;bad&gt;');
    expect(markdown).not.toContain('<bad>');
  });

  it('한 본문 안에 여러 위키링크를 모두 치환', () => {
    const md = '시작 [[a]] 중간 [[b|비]] 끝 [[c#sec]]';
    const { markdown, links } = preprocessMarkdown(md);
    expect(links.map((l) => l.slug)).toEqual(['a', 'b', 'c']);
    expect(markdown).toContain('href="/posts/a"');
    expect(markdown).toContain('href="/posts/b"');
    expect(markdown).toContain('href="/posts/c#sec"');
    expect(markdown).toContain('>비</a>');
  });

  it('위키링크가 없으면 본문 변경 없음', () => {
    const src = '그냥 평범한 본문입니다. **bold** 도 OK.';
    const { markdown, links } = preprocessMarkdown(src);
    expect(markdown).toBe(src);
    expect(links).toEqual([]);
  });
});
