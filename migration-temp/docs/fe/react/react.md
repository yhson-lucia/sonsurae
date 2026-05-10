---
title: React
slug: react
category: fe/react
summary: React의 등장 배경, Virtual DOM, 컴포넌트, JSX, props 정리
tags: [fe, react, component, jsx, virtual-dom]
sort_order: null
created: 2025-01-19
updated: 2026-05-10
---

## 1. React 개요

- HTML과 JavaScript로 DOM(Document Object Model)에 직접 접근하면, 인터랙션이 자주 발생하고 동적으로 UI를 표현해야 할 때 규칙이 다양해지고 관리가 힘들어짐 (코드가 난잡해짐)
- 처리할 이벤트, 관리할 상태값, 다뤄야 할 DOM이 많아지면 업데이트 규칙이 복잡해지고 유지보수가 어려워짐
- 이런 어려움 때문에 Ember, Backbone, AngularJS, Vue, Svelte 같은 프레임워크가 만들어짐. 작동 방식은 다르지만, JS의 특정 값이 바뀌면 특정 DOM 속성이 바뀌도록 연결해 업데이트 작업을 간소화함
- **React의 접근**: 상태가 변경되면 "어떻게 업데이트할지" 규칙을 정하는 대신, **모두 날려버리고 처음부터 새로 만들어 보여줌**
  - 장점: 업데이트 방식을 고민하지 않아도 되어 개발이 쉬움
  - 단점: 모든 것을 새로 그리면 속도가 매우 느림 → **Virtual DOM**으로 해결

## 2. Virtual DOM

- 메모리에 가상으로 존재하는 DOM. JS 객체이므로 실제 브라우저 DOM 조작보다 훨씬 빠름
- 상태가 업데이트되면, 업데이트가 필요한 부분의 UI를 Virtual DOM에 먼저 렌더링
- 효율적인 비교(diffing) 알고리즘으로 실제 DOM과 비교 후, **차이가 있는 곳만** 실제 DOM에 패치함

![React Virtual DOM 동작 흐름](images/react-01.webp)

## 3. 용어 정리

- **Node.js**: Chrome V8 JS 엔진으로 빌드된 JavaScript 런타임 환경. 서버 사이드 애플리케이션 개발 가능. 비동기 이벤트 기반 아키텍처를 사용해 빠르고 확장 가능한 네트워크 앱을 만들 수 있음. Webpack, Babel 같은 도구가 Node.js 기반으로 만들어짐
- **Webpack** (최근에는 Vite를 많이 씀): 여러 컴포넌트 파일을 하나로 결합해 주는 번들러
- **Babel**: JSX 같은 새로운 JavaScript 문법을 브라우저가 이해할 수 있는 형태로 트랜스파일
- **npm** (Node Package Manager): Node.js 환경의 패키지 관리자. 의존성 패키지 설치/업데이트/제거/관리
- **Yarn**: npm의 개선 버전. 더 나은 속도와 캐싱 시스템 제공

## 4. 리액트 컴포넌트

```jsx
import React from 'react';

function Hello() {
  return <div>안녕하세요</div>;
}

export default Hello;
```

- `import React from 'react'`: 컴포넌트는 React를 불러와서 사용함. 함수형/클래스형 모두 가능
- 컴포넌트는 XML 형식의 값을 반환할 수 있고, 이를 **JSX**라고 부름
- `export default Hello`: 컴포넌트를 외부로 내보내 다른 파일에서 import 가능
- 컴포넌트는 일종의 **UI 조각**으로, 재사용이 쉬움

```jsx
ReactDOM.render(<App />, document.getElementById('root'));
```

- `ReactDOM.render`: 브라우저의 실제 DOM 내부에 React 컴포넌트를 렌더링
- `id="root"`인 DOM(`<div id="root"></div>`) 내부에 컴포넌트가 렌더링됨

## 5. JSX

- React의 생김새를 정의할 때 사용하는 문법. HTML 같지만 실제로는 JavaScript
- JSX가 JavaScript로 변환되려면 다음 규칙을 지켜야 함
  - **태그는 반드시 닫혀 있어야 함**. HTML에서는 `<input>`, `<br>` 처럼 닫지 않아도 되지만 React에서는 안 됨
  - **두 개 이상의 태그는 하나의 태그로 감싸야 함**

```jsx
import React from 'react';
import Hello from './Hello';

function App() {
  return (
    <Hello />
    <div>안녕히계세요.</div>
  );
}

export default App;
```

- 위 코드는 에러가 발생함. 두 태그가 하나로 감싸지지 않았기 때문
- `<div>`로 감싸기 곤란할 때는 `<Fragment>` 또는 단축 문법 `<></>` 사용. 브라우저 상에서 별도 엘리먼트로 나타나지 않음
- JavaScript 변수를 화면에 보여줄 땐 `{}`로 감쌈

### 5.1 Style과 className

- JSX에서 태그에 style/CSS class를 설정하는 방법은 HTML과 다름
- **인라인 스타일**: 객체 형태로 작성
- `background-color`처럼 `-`로 구분된 이름은 camelCase로 변환 (`backgroundColor`)

```jsx
import React from 'react';
import Hello from './Hello';

function App() {
  const name = 'react';
  const style = {
    backgroundColor: 'black',
    color: 'aqua',
    fontSize: 24,        // 기본 단위 px
    padding: '1rem'      // 다른 단위는 문자열로 설정
  };

  return (
    <>
      <Hello />
      <div style={style}>{name}</div>
    </>
  );
}

export default App;
```

- **CSS class** 설정은 `class=`가 아니라 `className=` 사용

## 6. props

- `props`는 properties의 줄임말. 어떤 값을 컴포넌트에게 전달할 때 사용

```jsx
import React from 'react';

function Hello({ color, name }) {
  return <div style={{ color }}>안녕하세요 {name}</div>;
}

Hello.defaultProps = {
  name: '이름없음'
};

export default Hello;
```

- `Hello`에서 `{ color, name }` properties를 받아서 사용
- `defaultProps`로 기본값을 지정할 수 있음 (props가 전달되지 않을 때 사용)

```jsx
import React from 'react';
import Hello from './Hello';

function App() {
  return (
    <>
      <Hello name="react" color="red" />
      <Hello color="pink" />
    </>
  );
}

export default App;
```

- `App`에서 `Hello`에 `name`과 `color`를 props로 전달

### 6.1 props.children

- 컴포넌트 태그 **사이**에 넣은 값을 조회하려면 `props.children` 사용

```jsx
import React from 'react';

function Wrapper({ children }) {
  const style = {
    border: '2px solid black',
    padding: '16px',
  };
  return (
    <div style={style}>
      {children}
    </div>
  );
}

export default Wrapper;
```

- `children`은 컴포넌트 태그 사이에 들어간 내용
- 정리: 외부에서 값을 주입하려면 `props`, 자기 태그 사이의 값을 받고 싶으면 `children`
