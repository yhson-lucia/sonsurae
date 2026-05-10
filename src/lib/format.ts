// 날짜/숫자 등 표시용 포매터.
// 손수레는 한국어 사이트라 ko-KR 로케일 기본.

import { format, formatDistanceToNowStrict, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

/** "2026년 5월 10일" 형식 — 글 카드의 발행일 등 정식 표시. */
export function formatPublishedDate(iso: string): string {
  return format(parseISO(iso), 'yyyy년 M월 d일', { locale: ko });
}

/** "3일 전", "방금" 등 상대 시간 — 보조용. */
export function formatRelative(iso: string): string {
  return formatDistanceToNowStrict(parseISO(iso), { locale: ko, addSuffix: true });
}

/** ISO → "2026.05.10" 짧은 표기 */
export function formatShortDate(iso: string): string {
  return format(parseISO(iso), 'yyyy.MM.dd');
}
