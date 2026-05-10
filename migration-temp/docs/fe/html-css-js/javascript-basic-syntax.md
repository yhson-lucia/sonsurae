---
title: 자바스크립트 기초 문법 및 활용
slug: javascript-basic-syntax
category: fe/html-css-js
summary: 산술/비교/논리 연산자, 조건문/반복문, 활용 예제(주사위, 소수 판별, 문자열 거꾸로)
tags: [fe, javascript, operator, condition, loop, syntax]
sort_order: null
created: 2025-01-19
updated: 2026-05-10
---

## 1. 연산자

### 1.1 산술 연산자

사칙연산, `%` (나머지). 숫자뿐 아니라 문자도 사용 가능.

```js
console.log("20" + "10");   // "2010" (문자열 연결)
```

### 1.2 증감 연산자

- `++`: 1씩 증가
- `--`: 1씩 감소

### 1.3 비교 연산자

| 연산자 | 의미 |
|---|---|
| `==` | 값이 같음 (타입 무관) |
| `===` | 데이터 타입과 값이 모두 같음 |
| `!==` | 값이 같지 않음 (또는 타입이 다름) |

```js
console.log(10 == "10");    // true
console.log(10 === "10");   // false
```

### 1.4 논리 연산자

| 연산자 | 의미 |
|---|---|
| `&&` | 앞뒤 조건 모두 참이면 true |
| `\|\|` | 둘 중 하나만 참이어도 true |

## 2. 조건문

주어진 조건에 따라 결과를 출력하는 구문. 비교 연산자·논리 연산자 사용.

| 종류 | 사용법 | 설명 |
|---|---|---|
| **`if`** | `if (조건) { 명령 }` | 조건이 참이면 `{}` 안의 코드 실행 |
| **`if ~ else`** | `if (조건) { 명령 } else { 명령 }` | true면 `if`, false면 `else` |
| **`else if`** | 여러 조건 분기 | 여러 개의 조건문 |
| **중첩 `if`** | `if` 안에 또 다른 `if` | |

## 3. 반복문

반복되는 코드를 효율적으로 실행하기 위해 사용.

| 종류 | 사용법 | 설명 |
|---|---|---|
| **`for`** | `for (초기값; 조건; 증감) { 명령 }` | |
| **`while`** | `while (조건) { 명령 }` | 조건이 참인 동안 반복 |
| **`do ~ while`** | `do { 명령 } while (조건);` | while 조건과 무관하게 `do` 명령은 무조건 1회 실행 |

## 4. 자바스크립트 활용 예제

### 4.1 주사위 게임

```js
var dice = Math.floor(Math.random() * 6) + 1;
```

### 4.2 소수 판별

```js
function isPrime(n) {
  var divisor = 2;
  while (n > divisor) {
    if (n % divisor === 0) {
      return false;
    } else {
      divisor++;
    }
  }
  return true;
}
```

### 4.3 문자열 거꾸로 출력

```js
function reverse(str) {
  var reverStr = '';
  for (var i = str.length - 1; i >= 0; i--) {
    reverStr = reverStr + str.charAt(i);
  }
  return reverStr;
}

console.log(reverse('Hello'));   // 'olleH'
```
