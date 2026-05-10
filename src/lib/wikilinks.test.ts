import { describe, expect, it } from 'vitest';

import {
  extractSlugs,
  normalizeAnchor,
  normalizeSlug,
  parseWikilinks,
} from './wikilinks';

describe('normalizeSlug', () => {
  it('trim + lowercase', () => {
    expect(normalizeSlug('  Perceptron  ')).toBe('perceptron');
  });
});

describe('normalizeAnchor', () => {
  it('trim + lowercase + 내부 공백을 하이픈으로', () => {
    expect(normalizeAnchor('  Cost Function ')).toBe('cost-function');
    expect(normalizeAnchor('Sub Section')).toBe('sub-section');
  });
});

describe('parseWikilinks', () => {
  it('단일 [[slug]] 추출', () => {
    const links = parseWikilinks('퍼셉트론은 [[perceptron]] 의 기초이다.');
    expect(links).toHaveLength(1);
    expect(links[0].slug).toBe('perceptron');
    expect(links[0].label).toBe('perceptron');
    expect(links[0].anchor).toBeUndefined();
    expect(links[0].raw).toBe('[[perceptron]]');
  });

  it('[[slug|label]] — label 우선', () => {
    const links = parseWikilinks('[[perceptron|퍼셉트론]] 참고.');
    expect(links).toHaveLength(1);
    expect(links[0].slug).toBe('perceptron');
    expect(links[0].label).toBe('퍼셉트론');
  });

  it('[[slug#anchor]] — 앵커 추출', () => {
    const links = parseWikilinks('[[neural-network#cost-function]]');
    expect(links).toHaveLength(1);
    expect(links[0].slug).toBe('neural-network');
    expect(links[0].anchor).toBe('cost-function');
    expect(links[0].label).toBe('neural-network');
  });

  it('[[slug#anchor|label]] — 모두 다 있는 경우', () => {
    const links = parseWikilinks('[[neural-network#training|학습 부분]]');
    expect(links).toHaveLength(1);
    expect(links[0].slug).toBe('neural-network');
    expect(links[0].anchor).toBe('training');
    expect(links[0].label).toBe('학습 부분');
  });

  it('한 줄에 여러 위키링크', () => {
    const links = parseWikilinks('[[a]] 와 [[b]] 그리고 [[c|씨]]');
    expect(links.map((l) => l.slug)).toEqual(['a', 'b', 'c']);
    expect(links.map((l) => l.label)).toEqual(['a', 'b', '씨']);
  });

  it('대문자 슬러그는 소문자로 정규화', () => {
    const links = parseWikilinks('[[Perceptron]]');
    expect(links[0].slug).toBe('perceptron');
  });

  it('start/end 인덱스가 원문 위치와 일치', () => {
    const text = '앞 [[foo]] 뒤';
    const links = parseWikilinks(text);
    expect(text.slice(links[0].start, links[0].end)).toBe('[[foo]]');
  });

  it('펜스 코드 블록 내부의 [[...]] 는 무시', () => {
    const md = [
      '본문 [[outside]] 시작',
      '```',
      '[[inside-code-block]] 무시되어야 함',
      '```',
      '본문 [[after]] 끝',
    ].join('\n');
    const slugs = parseWikilinks(md).map((l) => l.slug);
    expect(slugs).toEqual(['outside', 'after']);
  });

  it('틸드 펜스 코드 블록 내부의 [[...]] 도 무시', () => {
    const md = ['~~~js', '[[in-tilde]]', '~~~', '[[out-tilde]]'].join('\n');
    const slugs = parseWikilinks(md).map((l) => l.slug);
    expect(slugs).toEqual(['out-tilde']);
  });

  it('인라인 코드 안의 [[...]] 는 무시', () => {
    const text = '본문 `[[ignored]]` 다시 [[picked]] 끝';
    const slugs = parseWikilinks(text).map((l) => l.slug);
    expect(slugs).toEqual(['picked']);
  });

  it('빈 [[]] 는 결과에서 제외', () => {
    const text = '[[]] 그리고 [[ ]] 그리고 [[real]]';
    const slugs = parseWikilinks(text).map((l) => l.slug);
    expect(slugs).toEqual(['real']);
  });

  it('줄바꿈을 가로지르는 [[...]] 는 매칭 X', () => {
    const text = '[[start\nend]]';
    expect(parseWikilinks(text)).toEqual([]);
  });

  it('label 은 trim 됨', () => {
    const links = parseWikilinks('[[slug|  공백 양옆  ]]');
    expect(links[0].label).toBe('공백 양옆');
  });

  it('label 에 한글/공백/특수문자(! ? . ,) 허용', () => {
    const links = parseWikilinks('[[a|왜? 그렇게 됐나.]]');
    expect(links[0].label).toBe('왜? 그렇게 됐나.');
  });

  it('펜스 직후 인접한 [[...]] 도 정상 추출', () => {
    const md = '```\nfoo\n```\n[[next]]';
    const slugs = parseWikilinks(md).map((l) => l.slug);
    expect(slugs).toEqual(['next']);
  });
});

describe('extractSlugs', () => {
  it('중복 제거 + 정규화 후 unique 슬러그 반환', () => {
    const text = '[[A]] [[a]] [[B|보일것]] [[a]]';
    const slugs = extractSlugs(text);
    expect(slugs.sort()).toEqual(['a', 'b']);
  });

  it('코드 블록의 슬러그는 포함되지 않음', () => {
    const md = '```\n[[in-code]]\n```\n[[out]]';
    expect(extractSlugs(md)).toEqual(['out']);
  });
});
