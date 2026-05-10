// 글 카드 — 시간순 피드 / 카테고리 페이지 / 검색 결과 등에서 공용으로 쓰는 단위.
//
// 디자인 결: 손수레의 lift-on-hover + warm 카드 톤. Bento 카드와 시각 언어 일관.
// 카테고리 배지 + 발행일 메타 + 제목 + 요약 + (선택) 커버 이미지.

import Link from 'next/link';
import Image from 'next/image';

import { formatPublishedDate } from '@/lib/format';
import type { MockPost } from '@/lib/mock/types';

interface Props {
  post: MockPost;
}

export function PostCard({ post }: Props) {
  return (
    <Link
      href={`/posts/${post.slug}`}
      className="lift-on-hover group relative block overflow-hidden rounded-2xl border border-border bg-background-soft p-5 sm:p-6"
    >
      {/* 메타 — 카테고리 배지 + 날짜 */}
      <div className="flex items-center gap-2 text-xs">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border-strong bg-background px-2.5 py-0.5 font-medium text-foreground-soft">
          {post.category.icon ? (
            <span aria-hidden>{post.category.icon}</span>
          ) : null}
          <span>{post.category.name}</span>
        </span>
        <time
          dateTime={post.published_at}
          className="text-foreground-mute"
        >
          {formatPublishedDate(post.published_at)}
        </time>
      </div>

      {/* 제목 */}
      <h3 className="text-display mt-3 text-lg font-bold tracking-tight text-foreground sm:text-xl">
        {post.title}
      </h3>

      {/* 요약 */}
      {post.excerpt ? (
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-foreground-soft">
          {post.excerpt}
        </p>
      ) : null}

      {/* 커버 이미지 (있을 때만) */}
      {post.cover_image_url ? (
        <div className="mt-4 aspect-[16/9] overflow-hidden rounded-xl border border-border">
          <Image
            src={post.cover_image_url}
            alt={post.title}
            width={800}
            height={450}
            className="h-full w-full object-cover"
          />
        </div>
      ) : null}

      {/* 호버 시 미세 이동 화살표 */}
      <span
        aria-hidden
        className="arrow-shift mt-4 inline-block text-sm font-medium text-foreground-mute group-hover:text-foreground"
      >
        →
      </span>
    </Link>
  );
}
