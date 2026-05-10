---
title: 움직이는 웹사이트 제작
slug: animated-website
category: fe/html-css-js
summary: CSS Transform/Transition/Animation 속성, prefix(브라우저 호환), keyframes 활용
tags: [fe, css, transform, transition, animation, keyframes]
sort_order: null
created: 2025-01-19
updated: 2026-05-10
---

## 1. Transform

웹사이트의 특정 영역에서 각도를 틀거나 크기 조정·위치 변경을 하는 속성.

| 함수 | 설명 |
|---|---|
| `rotate(45deg)` | 입력한 각도만큼 회전. 음수도 가능 |
| `scale(2, 3)` | 비율 지정. width 2배, height 3배. 축소는 0.5 같은 소수 |
| `skew(10deg, 20deg)` | 입체적으로 각도를 비틂. x축, y축 |
| `translate(100px, 200px)` | 선택한 오브젝트의 좌표 변경. margin/padding 대신 사용 가능 |

### 1.1 Prefix (접두사)

CSS3는 최신 언어이므로 다른 버전의 브라우저에서 실행이 안 됨. 다른 버전 호환을 위해 prefix 사용.

| Prefix | 브라우저 |
|---|---|
| `-webkit-` | Chrome, Safari |
| `-moz-` | Firefox |
| `-ms-` | IE 9.0 |
| `-o-` | Opera |

> 최신 버전에 맞춰서 제작할 경우에는 prefix 없이 단독으로 `transform` 값을 적용해도 됨.

> Transform을 계속 사용하면 **마지막에 적용된 transform 코드만** 적용됨.

## 2. Transition

변화하고자 하는 과정을 보여주는 속성. 속성을 변경했을 때 자연스러운 변화를 줄 때 사용.

| 속성 | 설명 |
|---|---|
| `transition-property` | 효과를 적용할 CSS 속성 (예: `width`) |
| `transition-duration` | 효과가 나타나는 데 걸리는 시간 (예: `2s`) |
| `transition-timing-function` | 효과의 속도. `linear`(일정), 빨라졌다 느려지는 등 |
| `transition-delay` | 효과 발동까지의 지연 시간 (예: `1s`) |

### 2.1 가상 선택자

- 일반 선택자: 태그·id·class — 개발자가 임의로 선택
- **가상 선택자**: CSS에서 미리 만들어 놓은 선택자
- `:hover`: 마우스를 올렸을 때

### 2.2 Transition 종합

```css
.transition {
  transition: width 2s linear 1s;
}

.transition:hover {
  width: 300px;
}
```

- 항상 먼저 나오는 숫자가 **duration**, 나중이 **delay**. 숫자가 하나면 무조건 duration
- 위 예시: 마우스를 올리면 1초 후, width가 300px로 2초 동안 일정한 속도로 변하는 애니메이션

## 3. Animation

마우스 움직임 등 특정 조건과 상관없이 이벤트를 적용할 때 사용.

| 속성 | 설명 |
|---|---|
| `animation-name` | 애니메이션 이름. class·id처럼 임의로 작성 |
| `animation-duration` | 동작 시간 |
| `animation-timing-function` | 속도 성격 |
| `animation-delay` | 웹사이트 진입 후 몇 초 뒤에 동작 |
| `animation-iteration-count` | 반복 횟수 |
| `animation-direction` | 진행 방향 |

### 3.1 animation-direction 값

| 값 | 설명 |
|---|---|
| `alternate` | from → to → from (왕복) |
| `normal` | from → to, from → to (반복) |
| `reverse` | to → from, to → from |

### 3.2 @keyframes

Animation에는 항상 `@keyframes`가 따라옴. 시작/끝을 정의.

```css
@keyframes name {
  from { width: 300px; }
  to   { width: 600px; }
}
```

## 4. Transform & Animation 결합

```css
.box {
  animation: rotation 1500ms linear infinite alternate;
}

@keyframes rotation {
  from { transform: rotate(-10deg); }
  to   { transform: rotate(10deg); }
}
```

- 순서는 상관없고 **duration과 delay 위치**만 잘 기억하면 됨

### 4.1 Prefix 작성 시 유의사항

CSS3에 새로 등장한 효과이므로 prefix 적용 가능. 사용 시 `@keyframes`에도 함께 prefix 추가가 필요. `from`/`to` 안의 transform에도 동일한 prefix 입력.

```css
.box {
  -webkit-animation: rotation 1500ms linear infinite alternate;
}

@-webkit-keyframes rotation {
  from { -webkit-transform: rotate(-10deg); }
  to   { -webkit-transform: rotate(10deg); }
}
```
