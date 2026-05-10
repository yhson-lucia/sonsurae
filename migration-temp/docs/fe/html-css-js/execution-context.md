---
title: 실행 컨텍스트
slug: execution-context
category: fe/html-css-js
summary: 실행 컨텍스트, this 동적 바인딩, 화살표 함수와 일반 함수의 this 차이, Closure, ES6 Rest/Spread
tags: [fe, javascript, execution-context, this, closure, arrow-function, rest, spread]
sort_order: null
created: 2025-01-19
updated: 2026-05-10
---

## 1. 자바스크립트 코드의 실행

### 1.1 코드가 없는 경우 초기화

자바스크립트 엔진은 코드가 없어도 실행 환경(실행 컨텍스트)을 초기화함.

- **`this`**: 실행되는 환경 (window 객체)
- **변수들 (Variable Object)**: `{}`
- **Scope chain**: `[]`
- **스코프 (scope)**: 코드가 현재 실행되는 환경·맥락(context)
- this 포인터·스코프 변수·스코프 체인 등이 환경에 포함
- this 포인터(레퍼런스 변수)는 글로벌 스코프에서 `window`를 가리킴

### 1.2 함수 실행 예시

```js
function myFunc() {
  let a = 10;
  let b = 20;
  function add(first, second) {
    return first + second;
  }
  return add(a, b);
}

myFunc();
```

- `this`: `undefined` (strict mode)
- 변수들 (Variable Object): `{ a: 10, b: 20, add: function {...} }`
- `Scope chain`: `[ global ]`
- **stack 구조**로 이루어짐
- 함수가 모두 끝나면 global context로 돌아감
- 함수가 실행되면 함수 스코프에 따라 환경이 만들어짐
- this, 함수 스코프 변수, 스코프 체인이 형성
- 스코프 체인을 따라 글로벌 환경에 도달

### 1.3 객체 메서드 예시

```js
let o = {
  name: 'Daniel',
  method: function(number) {
    return this.name.repeat(number);
  }
};

function myFunc() {
  let n = 10;
  return o.method(n);
}
```

- `this`: `window`
- 변수들: `{ o: {...}, myFunc: function {...} }`
- `Scope chain`: `[]`
- 객체의 메서드의 경우 메서드 환경의 this는 **해당 객체**를 가리킴
- 단, this가 가리키는 것은 환경에 따라 변할 수 있음

## 2. 실행 컨텍스트 (Execution Context)

- 실행 컨텍스트(실행 맥락)는 자바스크립트 코드가 실행되는 환경
- 코드에서 참조하는 변수, 객체(함수 포함), this 등에 대한 레퍼런스
- 실행 컨텍스트는 **전역에서 시작**해 함수가 호출될 때 **스택에 쌓임**
- 자바스크립트 실행 시: **Global Execution Context** 생성
- 함수 실행 시: **Function Execution Context** 생성

## 3. this가 가리키는 것

함수가 호출되는 4가지 상황 + 콜백 함수.

| 호출 방식 | 설명 |
|---|---|
| **함수 호출** | 함수를 직접 호출 |
| **메서드 호출** | 객체의 메서드 호출 |
| **생성자 호출** | 생성자 함수 호출 |
| **간접 호출** | `call`, `apply` 등으로 간접 호출 (function 객체의 메서드) |
| **콜백 함수** | 특정 동작 이후 호출되는 함수. 보통 다른 함수의 인자로 보내짐 |

```js
function myFunc() {
  console.log('myFunc called');
}
myFunc();   // 함수 직접 호출

const o = {
  name: 'Daniel',
  printName: function() {
    console.log(this.name);
  }
};
o.printName();   // 객체의 메서드 호출

function Person(name) {
  this.name = name;
  this.printName = function() {
    console.log(this.name);
  };
}
const p = new Person('Daniel');   // 생성자 호출

setTimeout(p.printName.bind(p), 1000);
// 간접 호출. bind는 특정 this에 해당하는 객체를 메서드에 묶음
```

- 함수의 호출 환경에 따라 this는 동적으로 세팅됨 → **동적 바인딩 (Dynamic Binding)**
- `bind`, `apply`, `call`로 this가 가리키는 것을 조작 가능

## 4. 화살표 함수와 일반 함수의 this

| 함수 종류 | this |
|---|---|
| **화살표 함수** | 호출된 함수를 둘러싼 실행 컨텍스트 |
| **일반 함수** | 새롭게 생성된 실행 컨텍스트 |

```js
const o = {
  method() {
    console.log("context: ", this);   // o
    let f1 = function () {
      console.log("[f1] this: ", this);
    };
    let f2 = () => console.log("[f2] this: ", this);
    f1();   // global
    f2();   // o
  },
};
o.method();
```

- `f1()`은 실행 시 새 컨텍스트 생성. 바인딩된 컨텍스트가 없으므로 this는 global
- `f2()`는 함수 컨텍스트를 생성하지만 this는 부모의 컨텍스트(o)를 가리킴

### 4.1 화살표 함수와 Dynamic Binding

- 화살표 함수의 this는 **정해지면 바꿀 수 없음**
- `call`, `bind`, `apply`로도 변경 불가
- `setTimeout` 등 this가 바뀌는 상황에서 유용

## 5. 자바스크립트 Closure

### 5.1 함수는 일급 객체 (First-class Object)

- 일급 객체란 다른 변수처럼 대상을 다룰 수 있는 것
- 자바스크립트에서 함수는 일급 객체
- 즉, 자바스크립트에서 함수는 변수처럼 다룰 수 있음

### 5.2 클로저

- 자바스크립트 클로저는 함수의 **일급 객체 성질**을 이용
- 함수가 생성될 때, 함수 내부에서 사용되는 변수들이 외부에 존재하는 경우 그 변수들은 함수의 스코프에 저장
- **함수와 함수가 사용하는 변수들을 저장한 공간** = 클로저

## 6. ES6 Rest / Spread Operator

### 6.1 Rest Operator

함수의 인자, 배열, 객체 중 **나머지 값을 묶어** 사용.

#### 함수 인자 Rest Operator

```js
function findMin(...rest) {
  return rest.reduce((a, b) => a < b ? a : b);
}
findMin(7, 4, 6, 3, 4, 1);   // 1
```

- 함수 인자 rest operator는 인자들을 배열로 묶음
- `rest`에 숫자들이 배열로 담긴 뒤 `reduce` 함수로 min 값 리턴

#### 객체 Rest Operator

```js
const o = {
  name: "Daniel",
  age: 23,
  address: "Street",
  job: "Software Engineer",
};

const { age, name, ...rest } = o;
findSamePerson(age, name);
```

- 객체 rest operator는 지정된 필드 외의 나머지를 객체로 묶음
- `age`, `name`을 제외한 나머지는 `rest`에 할당

#### 배열 Rest Operator

```js
function sumArray(sum, arr) {
  if (arr.length === 0) return sum;
  const [head, ...tail] = arr;
  return sumArray(sum + head, tail);
}
sumArray(0, [1, 2, 3, 4, 5]);
```

- 배열 rest operator는 나머지 인자를 배열로 묶음
- `sumArray`의 `tail`은 첫 원소 `head`를 제외한 나머지를 배열로 묶음
- `tail`은 하나씩 줄어들어 길이 0이 되면 합 반환

### 6.2 Spread Operator

묶인 배열·객체를 각각의 필드로 변환.

- 객체는 또 다른 객체로의 spread 지원
- 배열은 다른 배열의 인자, 함수의 인자로의 spread 지원

#### 객체 Spread Operator

```js
let o = {
  name: "Daniel",
  age: 23,
  address: "Street",
  job: "Software Engineer",
};

let o2 = { ...o, name: "Tom", age: 24 };
let o3 = { name: "Tom", age: 24, ...o };

o2.job;    // "Software Engineer"
o3.name;   // "Daniel"
```

- spread operator의 등장 순서에 따라 객체 필드가 덮어씌워짐
- `...o`가 뒤에 등장하면 기존 `name`이 나중에 등장해 앞의 `name: "Tom"`을 덮어씀

#### 배열 Spread Operator

```js
function findMinInObject(o) {
  return Math.min(...Object.values(o));
}

let o1 = { a: 1 };
let o2 = { b: 3 };
let o3 = { c: 7 };

findMinInObject(mergeObjects(o1, o2, o3));   // 1
```

- `mergeObjects`는 주어진 객체들의 필드를 합침
- `findMinInObject`에서 객체 필드 중 최솟값 반환
- `Object.values`는 객체 값들의 배열을 반환
- 배열 spread operator로 `Math.min`의 인자를 넘김
