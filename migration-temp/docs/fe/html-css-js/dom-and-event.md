---
title: DOM과 이벤트
slug: dom-and-event
category: fe/html-css-js
summary: DOM 개념과 Document/Node 객체, 노드 종류와 관계, 이벤트 핸들러와 addEventListener
tags: [fe, javascript, dom, node, event, event-listener]
sort_order: null
created: 2025-01-19
updated: 2026-05-10
---

## 1. DOM (Document Object Model)

**문서 객체 모델**: 객체 지향 모델로 구조화된 문서를 표현하는 형식. 줄글 형식을 트리 구조로 바꾸어 주는 모델. DOM은 XML/HTML 문서의 프로그래밍 **인터페이스** 제공.

- 문서의 구조화된 표현(structured representation)을 제공해 프로그래밍 언어가 문서 구조·스타일·내용을 변경할 수 있게 함

| 종류 | 설명 |
|---|---|
| **Core DOM** | 모든 문서 타입을 위한 DOM |
| **HTML DOM** | HTML 문서를 위한 DOM. HTML 문서를 조작·접근하는 표준화된 방법 |
| **XML DOM** | XML 문서를 위한 DOM. XML 문서에 접근하는 표준화된 방법 |

### 1.1 Document 객체

웹 페이지를 의미. 웹 페이지의 HTML 요소에 접근하려면 반드시 **Document 객체부터 시작**해야 함.

### 1.2 HTML 요소 선택 메서드

| 메서드 | 설명 |
|---|---|
| `document.getElementById()` | 해당 ID의 요소 선택 |
| `document.getElementsByClassName()` | 해당 클래스의 요소들 선택 |
| `document.getElementsByName()` | 해당 name 속성값을 가진 요소들 선택 |
| `document.querySelectorAll()` | 해당 선택자로 선택되는 모든 요소 |
| `document.querySelector()` | 해당 선택자로 선택되는 첫 번째 요소 |

### 1.3 HTML 요소 생성

| 메서드 | 설명 |
|---|---|
| `document.createElement()` | 지정된 HTML 요소 생성 |
| `document.write()` | HTML 출력 스트림으로 텍스트 출력 |

### 1.4 HTML 이벤트 핸들러 추가

```js
요소.onclick = function() { ... }
```

마우스 클릭 이벤트와 연결될 이벤트 핸들러. 해당 요소를 클릭했을 때 실행됨.

### 1.5 DOM 트리 구조 (HTML → DOM)

```html
<!DOCTYPE html>
<html>
  <head>
    <title>자바스크립트 기초</title>
  </head>
  <body>
    <article>
      <header>header</header>
      <section>
        <header>header 1</header>
        section 1
      </section>
    </article>
  </body>
</html>
```

HTML 태그가 묶인 부분에 따라 트리 구조로 표현됨.

## 2. 자바스크립트와 DOM

### 2.1 DOM 요소 선택

```js
// HTML <li> 요소 선택
var selectedItem = document.getElementsByTagName("li");

// 아이디가 "id"인 요소 선택
var selectedItem = document.getElementById("id");

// 클래스가 "odd"인 요소 선택
var selectedItem = document.getElementsByClassName("odd");

// name 속성값이 "first"인 요소 선택
var selectedItem = document.getElementsByName("first");
```

### 2.2 DOM 요소 스타일 변경

```js
// 아이디가 "even"인 요소 선택
var selectedItem = document.getElementById("even");

// 텍스트 색상 변경
selectedItem.style.color = "red";
```

### 2.3 DOM 요소 내용 변경

```js
// 아이디가 "text"인 요소 선택
var str = document.getElementById("text");

// 내용 변경
str.innerHTML = "요소의 내용을 바꿉니다";
```

## 3. Node 객체

### 3.1 Node와 Node Tree

- HTML DOM에서 정보를 저장하는 **계층적 단위**
- Node Tree는 Node들의 집합으로, 노드 간의 관계를 나타냄
- 자바스크립트에서 HTML DOM을 이용해 노드 트리의 모든 노드에 접근 가능

![DOM 노드 트리 구조](images/dom-and-event-01.webp)

### 3.2 노드 간의 관계

노드 트리의 모든 노드는 서로 **계층적 관계**를 맺고 있음.

![노드 간의 관계](images/dom-and-event-02.webp)

### 3.3 노드의 종류

| 노드 종류 | 설명 |
|---|---|
| **문서 노드** (document node) | HTML 문서 전체 |
| **요소 노드** (element node) | 모든 HTML 요소. 속성 노드를 가질 수 있는 유일한 노드 |
| **주석 노드** (comment node) | HTML 문서의 모든 주석 |
| **속성 노드** (attribute node) | HTML 요소의 속성. 요소 노드의 자식 노드에는 포함되지 않음 |
| **텍스트 노드** (text node) | HTML 문서의 모든 텍스트 (`<p>텍스트 노드</p>`) |

### 3.4 노드의 값

노드 정보는 다음 프로퍼티로 접근.

- `nodeName` (이름)
- `nodeValue` (값)
- `nodeType` (타입)

```js
// 모든 자식 노드 중 첫 번째 노드의 이름
document.childNodes[0].nodeName;

// 아이디 "heading"의 첫 번째 자식 노드의 값
document.getElementById("heading").firstChild.nodeValue;

// 아이디 "heading"의 첫 번째 자식 노드의 타입
document.getElementById("heading").firstChild.nodeType;
```

## 4. 이벤트 (Event)

웹 브라우저가 알려주는 HTML 요소에 대한 **사건의 발생**. 자바스크립트는 발생한 이벤트에 반응해 동작 수행 (마우스 움직임, 클릭 등).

### 4.1 이벤트 타입

발생한 이벤트의 종류 (폼, 키보드, 마우스, HTML DOM, Window 객체 등).

```html
<p onclick="changeText(this)">여길 클릭하세요!</p>
<!-- this는 자기 자신. changeText 함수는 아래에서 정의 -->

<script>
function changeText(element) {
  element.innerHTML = "내용이 바뀌었습니다!";
}
</script>
```

### 4.2 이벤트 핸들러

이벤트가 발생했을 때 처리를 담당하는 함수. 지정된 이벤트가 발생하면 웹 브라우저가 그 요소에 등록된 이벤트 핸들러를 실행.

```js
// HTML 문서 로드 시 실행
window.onload = function() {
  var text = document.getElementById("text");
  text.innerHTML = "HTML 문서가 로드되었습니다.";
};
```

### 4.3 addEventListener

```js
대상객체.addEventListener(이벤트명, 이벤트핸들러, 이벤트전파방식);
```
