# next/image — Supabase Storage 호스트 미등록으로 카테고리 페이지 500

**발생일**: 2026-05-10 (Phase 7 마이그레이션 직후)
**난이도**: 30분 (에러 메시지가 명확해서 빠르게 잡힘)

## 증상
마이그레이션으로 글 93편 + 이미지 131개를 Supabase Storage 에 올린 직후:
- `/` 홈 → 200 ✓
- `/posts/perceptron` → 200 ✓
- `/category/ai/deep-learning` → **500** ❌

브라우저 응답 HTML 안에 다음 에러 다이제스트:
```
Invalid src prop (https://{project}.supabase.co/storage/v1/object/public/images/perceptron-01.webp)
on `next/image`, hostname "{project}.supabase.co" is not configured under images
in your `next.config.js`
```

## 원인
`PostCard` 가 `cover_image_url` 이 있을 때 `<Image src={...}>` 로 렌더하는데,
Next.js 의 `next/image` 컴포넌트는 **외부 호스트를 명시적으로 화이트리스트하지 않으면 차단**한다.
Mock 데이터 시절에는 `cover_image_url=null` 이라 한 번도 트리거 안 됐고,
실제 마이그된 글이 cover 이미지를 가지자 카테고리 페이지가 처음으로 폭발.

## 해결
`next.config.ts` 에 `images.remotePatterns` 추가:
```ts
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: '*.supabase.co',
      pathname: '/storage/v1/object/public/**',
    },
  ],
}
```
와일드카드 호스트 + Storage 공개 객체 경로 한정.

## 재발 방지
- **체크리스트**: 외부 이미지 호스트가 새로 추가될 때마다 `next.config.ts` 동기화.
- **문서 갱신**: `docs/system/integrations.md` 에 명시 (이번 사례로 추가됨).
- **Mock → 실데이터 전환 시 점검**: `null` 로 가려져 있던 이미지 필드가 실제 URL 로 바뀌는 순간을 검증 라우트로 확인.
