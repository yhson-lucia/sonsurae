---
title: CSS
slug: css
category: fe/html-css-js
summary: CSS 기본 형식, 연동 방법(Inline/Internal/External), 선택자 3종, 부모-자식 관계, 캐스케이딩, 주요 속성
tags: [fe, css, selector, cascading, inline-style, external-style]
sort_order: null
created: 2025-01-19
updated: 2026-05-10
---

## 1. CSS란

- **CSS** (Cascading Style Sheet): HTML로 작성된 정보를 꾸며주는 언어
- HTML과 디자인을 분리해 문서의 스타일과 레이아웃을 정의

### 1.1 기본 형식

```css
선택자 {
  속성: 속성값;
}
```

| 요소 | 설명 |
|---|---|
| **선택자** | 스타일을 적용할 HTML 영역 (예: `h1`, `p`) |
| **속성** | 적용할 디자인 요소 (예: `color`, `font-size`) |
| **속성값** | 구체적인 디자인 값 (예: `red`, `20px`) |

### 1.2 예시

```css
h1 {
  font-size: 20px;
  font-family: sans-serif;
  color: blue;
  background-color: yellow;
  text-align: center;
}
```

## 2. CSS 연동 방법

### 2.1 Inline Style Sheet

HTML 태그 안에 직접 스타일을 적용.

```html
<h1 style="color: red;">Hello, World!</h1>
```

### 2.2 Internal Style Sheet

HTML 파일의 `<style>` 태그 안에 지정.

```html
<head>
  <style>
    h1 {
      background-color: yellow;
    }
  </style>
</head>
```

### 2.3 External Style Sheet

CSS 파일을 별도로 만들어 HTML 문서와 연결.

```html
<head>
  <link rel="stylesheet" href="style.css">
</head>
```

## 3. CSS 선택자

### 3.1 Type 선택자

특정 태그에 스타일을 적용.

```css
h2 { color: red; }
```

### 3.2 Class 선택자

태그에 별명(class)을 붙여 스타일을 적용.

```html
<h2 class="title">Hello</h2>
```

```css
.title { color: blue; }
```

### 3.3 ID 선택자

태그에 ID를 부여해 스타일을 적용. **ID는 페이지 내에서 고유**해야 함.

```html
<h2 id="heading">Hello</h2>
```

```css
#heading { color: green; }
```

## 4. 부모-자식 관계

- 부모 태그가 자식 태그를 포함하는 관계
- 예: `<header>`는 `<h1>`과 `<p>`를 포함할 수 있음
- 부모에 스타일을 적용하면 자식에게도 상속됨. 원하는 영역에만 스타일을 적용하려면 부모를 구체적으로 지정

```html
<header>
  <h1>Title</h1>
  <p>Description</p>
</header>
```

```css
header   { color: red; }
header h1 { color: blue; }
header p  { color: green; }
```

## 5. 캐스케이딩 (우선순위)

CSS의 우선순위를 결정하는 규칙. 다음 3가지 요소.

1. **순서**: 나중에 작성된 스타일이 우선
2. **디테일**: 선택자가 구체적일수록 우선
3. **선택자 종류**: `style > ID > class > type` 순

## 6. 주요 CSS 속성

### 6.1 width / height

```css
width: 100px;
height: 200px;
```

### 6.2 font-family

```css
font-family: Arial, sans-serif;
```

### 6.3 border

```css
border: 1px solid black;
```

### 6.4 background

```css
background-color: yellow;
background-image: url('image.png');
```
