---
title: 미디어쿼리
slug: media-query
category: fe/html-css-js
summary: 반응형/적응형 웹사이트를 위한 @media 구문, viewport 설정 시 주의사항
tags: [fe, css, media-query, responsive, viewport, mobile]
sort_order: null
created: 2025-01-19
updated: 2026-05-10
---

## 1. 미디어쿼리 소개

PC뿐 아니라 모바일·태블릿에도 대응되는 웹사이트를 만들기 위한 CSS 구문.

| 종류 | 설명 |
|---|---|
| **반응형** | 브라우저를 늘리거나 줄일 때 자연스럽게 resize 효과가 일어남 |
| **적응형** | 뚝뚝 끊겨서 레이아웃 변화·폰트 크기 등이 달라짐 |

### 1.1 `@media` 구문

```css
@media (min-width: 320px) and (max-width: 800px) {
  .media {
    width: 300px;
    height: 300px;
    background-color: yellow;
  }
}
```

- 기기의 가로폭·세로폭 사이즈를 미리 설정해 모바일/태블릿 여부 확인 가능
- `min-width`와 `max-width`로 브라우저 가로폭 설정
- 위 예시: 브라우저 가로폭이 320px ~ 800px일 때 `{}` 안의 CSS 적용

## 2. 미디어쿼리 사용 시 주의사항

### 2.1 viewport 설정

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

- HTML 코드 안쪽에 **`meta` 태그가 반드시 있어야 함**
- 없으면 모바일·태블릿에서 미디어쿼리가 제대로 작동하지 않을 수 있음
- viewport로 너비와 배율을 설정해야 모바일 디바이스에서 의도한 화면을 볼 수 있음
- **viewport**: 다양한 디지털 기기 화면에 표시되는 영역. 너비·배율 설정에 사용하는 메타 태그 속성

### 2.2 content 속성

| 속성 | 설명 |
|---|---|
| `width=device-width` | viewport의 가로폭 = 디바이스의 가로폭. viewport의 width를 기기 width로 대체 |
| `initial-scale=1.0` | 화면 비율을 항상 1.0으로 유지. 적용 안 하면 화면이 깨질 수 있음 |

### 2.3 CSS 상속

- 미디어쿼리 바깥쪽에서 `background-color`를 노란색으로 설정한 경우, 미디어쿼리 안쪽에서 크기 조정만 한다면 **외부 영역의 CSS 속성을 상속**받음
- 상속받지 않으려면 `none`으로 속성값을 설정
