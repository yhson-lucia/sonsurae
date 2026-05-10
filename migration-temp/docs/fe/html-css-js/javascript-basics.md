---
title: 자바스크립트 기초
slug: javascript-basics
category: fe/html-css-js
summary: JavaScript 변수, 데이터 타입(String/Number/Function/Array/Object/Boolean), String/Array/Math 메서드 정리
tags: [fe, javascript, variable, data-type, array, object, math]
sort_order: null
created: 2025-01-19
updated: 2026-05-10
---

## 1. 자바스크립트란

- **JavaScript**: 동적인 웹사이트 제작에 사용되는 프로그래밍 언어. 이미지 슬라이드, 팝업 효과, 사용자 인터랙션 등을 구현
- 역할 분담
  - **HTML**: 웹사이트의 구조
  - **CSS**: 디자인
  - **JavaScript**: 페이지의 동적 변화
- IoT, 하이브리드 앱, 서버 개발, 게임, 웹 애플리케이션 등에 활용 가능

## 2. 자바스크립트의 변수

- **변수**: 데이터를 저장할 공간
- **변수 선언**: 변수를 만들고 공간을 예약

```js
var fruit;                        // 변수 선언
fruit = "apple";                  // 변수 초기화
var fruit2 = "apple";             // 선언 + 초기화
fruit = "banana";                 // 데이터 변경
console.log(fruit);               // 데이터 확인
```

### 2.1 변수 생성 시 주의사항

- 변수명은 **숫자로 시작 불가**
- 의미가 명확한 변수명 사용
- 특수문자 사용 금지 (단, `$`와 `_`는 가능)

### 2.2 자바스크립트 사용 방법

HTML과 연동할 때 `<script>` 태그의 `src` 속성으로 JS 파일 연결.

```html
<script src="app.js"></script>
```

### 2.3 변수 데이터 확인

우클릭 → "검사" 또는 F12로 크롬 개발자 도구에서 확인.

## 3. 자바스크립트 데이터 타입

| 타입 | 설명 | 예 |
|---|---|---|
| **String** | 문자열. `" "` 또는 `' '` 안의 데이터 | `var str = "Hello";` |
| **Number** | 숫자. 정수·실수 모두 | `var num = 10; var pi = 3.14;` |
| **Function** | 여러 동작을 묶어 함수로 정의 | `function greet() { console.log("Hello"); }` |
| **Array** | 같은 종류의 데이터를 묶은 배열 | `var fruits = ["사과", "배", "수박"];` |
| **Object** | 여러 데이터를 객체로 묶음 | `var student = { name: "Inkwon", age: 20 };` |
| **Boolean** | `true` 또는 `false` | `var isStudent = true;` |
| **undefined** | 변수가 선언되었으나 값이 없음 | |
| **null** | 변수가 빈 값을 명시적으로 가리킴 | |

### 3.1 Function 예시

```js
function greet() {
  console.log("Hello");
}
greet();
```

### 3.2 Array 예시

```js
var fruits = ["사과", "배", "수박"];
console.log(fruits[0]);   // 첫 번째 요소
```

### 3.3 Object 예시

```js
var student = {
  name: "Inkwon",
  age: 20,
  skills: ["JavaScript", "HTML", "CSS"]
};
console.log(student.name);
```

## 4. 자바스크립트 프로퍼티와 메서드

### 4.1 문자열 메서드

| 메서드 | 설명 | 예 |
|---|---|---|
| `str.length` | 문자열 길이 | `"Hello".length // 5` |
| `str.charAt(index)` | 특정 인덱스의 문자 | `"Hello".charAt(0) // 'H'` |
| `str.split(separator)` | 구분자 기준 분할 → 배열 | `"Hello World".split(" ") // ['Hello', 'World']` |

### 4.2 배열 메서드

| 메서드 | 설명 |
|---|---|
| `arr.length` | 배열 길이 |
| `arr.push(item)` | 배열 끝에 요소 추가 |
| `arr.pop()` | 배열 마지막 요소 제거 |

```js
var fruits = ["사과", "배", "수박"];
console.log(fruits.length);   // 3
fruits.push("딸기");
fruits.pop();
```

### 4.3 수학 연산 메서드 (Math)

| 메서드 | 설명 | 예 |
|---|---|---|
| `Math.abs(x)` | 절대값 | `Math.abs(-5) // 5` |
| `Math.ceil(x)` | 올림 | `Math.ceil(3.2) // 4` |
| `Math.floor(x)` | 내림 | `Math.floor(3.9) // 3` |
| `Math.random()` | 0~1 사이 랜덤 실수 | `Math.random()` |

### 4.4 문자 → 숫자 변환

| 메서드 | 설명 | 예 |
|---|---|---|
| `parseInt(s)` | 정수로 변환 | `parseInt("20.6") // 20` |
| `parseFloat(s)` | 실수로 변환 | `parseFloat("20.6") // 20.6` |
