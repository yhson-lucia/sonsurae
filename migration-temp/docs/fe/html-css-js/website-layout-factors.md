---
title: 웹사이트 레이아웃에 영향을 미치는 요소
slug: website-layout-factors
category: fe/html-css-js
summary: 박스 모델, Block/Inline 요소, 마진 병합 현상, display/float/clear 속성과 기본 margin 초기화
tags: [fe, css, box-model, layout, float, margin, display]
sort_order: null
created: 2025-01-19
updated: 2026-05-10
---

## 1. 박스 모델

어떤 공간 크기를 설정했을 때 그 구조.

### 1.1 박스 모델 구조

`margin` → `border` → `padding` → `content`

| 요소 | 설명 |
|---|---|
| **margin** | border(보이지 않으면 값 0)를 기준으로 바깥쪽 |
| **padding** | border를 기준으로 안쪽 |

- `margin-left`, `margin-right`, `margin-top`, `margin-bottom` 4가지
- 한 번에 표기: `margin: 100px 0 0 100px;` (12시 시계 방향 = top → right → bottom → left)

## 2. Block 요소와 Inline 요소

| 구분 | Block 요소 | Inline 요소 |
|---|---|---|
| 정렬 | Y축 (줄바꿈) | X축 (같은 줄) |
| 대표 태그 | `<p>`, `<div>` 등 | `<a>`, `<span>` 등 |
| width / height | 사용 가능 → 공간 만들기 가능 | 사용 불가 |
| margin / padding | 사용 가능 → 상하 배치 가능 | 사용 불가 |

## 3. 마진 병합 현상

### 3.1 형제 간의 마진 병합

양쪽에 `margin-top`, `margin-bottom`이 각각 적용되어 있을 때, 공간의 공통된 영역은 공유되어 **숫자가 큰 값**으로 적용됨.

### 3.2 부모-자식 간의 마진 병합

자식과 부모가 공간을 가지고 있을 때, 자식의 공간에 `margin-top`을 적용하면 **부모에게도 함께 margin이 적용**됨.

## 4. 레이아웃에 영향을 미치는 속성

### 4.1 display

Block과 Inline 요소의 성격을 바꿀 때 사용. 원래 적용되지 않는 공간 설정을 적용되도록 변경.

```css
p { display: inline; }
a { display: inline-block; }   /* X축 정렬이면서 공간을 가짐 */
```

### 4.2 float

왼쪽 또는 오른쪽에서부터 정렬하고자 할 때 사용. 선택된 요소를 새로운 레이어층으로 띄움 (포토샵 레이어 비유).

```css
.box { float: left; }
```

### 4.3 clear

오른쪽 또는 왼쪽 정렬 후, 다음 요소가 정렬된 레이어층에 겹쳐지는 것을 막아 다음 영역으로 옮김. **float와 clear는 함께 사용**.

```css
.next { clear: both; }   /* float left와 right의 모든 기능을 꺼줌 */
```

### 4.4 브라우저 기본 margin 제거

`html`과 `body` 태그는 기본적으로 margin 값을 가지므로 빈 공간이 항상 생김. **초기화 필요**.

```css
* {
  margin: 0;
  padding: 0;
}
```

- `*`는 **모든 HTML 태그를 선택**
