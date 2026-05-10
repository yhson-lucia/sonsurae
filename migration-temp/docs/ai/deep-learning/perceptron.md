---
title: 퍼셉트론
slug: perceptron
category: ai/deep-learning
summary: 퍼셉트론의 정의와 동작, AND/NAND/OR 논리회로 구현, XOR과 다층 퍼셉트론
tags: [ai, deep-learning, perceptron, logic-gate, xor, multi-layer-perceptron]
sort_order: 1
created: 2025-03-30
updated: 2026-05-10
---

## 1. 퍼셉트론 정의

- 프랭크 로젠블랫(Frank Rosenblatt)이 **1957년**에 고안한 알고리즘
- 신경망(딥러닝)의 기원이 되는 알고리즘
- 다수의 신호를 입력으로 받아 하나의 신호를 출력하는 알고리즘

### 1.1 신호와 가중치

- **신호**: 전류나 강물처럼 흐름이 있는 무언가. 전선을 따라 전자를 흘려보내는 전류처럼, 흐름을 만들고 정보를 앞으로 전달함
- 실제 전류와 달리 퍼셉트론 신호는 **'흐른다/안 흐른다(1 또는 0)'** 의 두 가지 값을 가짐

![퍼셉트론 구조](images/perceptron-01.webp)

- 입력으로 2개의 신호를 받는 퍼셉트론의 예시
- $x_1, x_2$: 입력 신호, $y$: 출력 신호, $w_1, w_2$: 가중치(weight)
- 원은 **뉴런** 또는 **노드**라고 부름

### 1.2 동작 방식

- 입력 신호가 뉴런에 보내질 때 → 고유한 가중치가 곱해짐 ($w_1 x_1$, $w_2 x_2$)
- 뉴런에서 보내온 신호의 총합이 정해진 한계를 넘어설 때만 1을 출력 (뉴런이 **활성화한다**고 표현)
- 한계값은 $\theta$(세타)로 나타내며 **임곗값(threshold)** 이라고 함

$$
y = \begin{cases}
0 & (w_1 x_1 + w_2 x_2 \leq \theta) \\
1 & (w_1 x_1 + w_2 x_2 > \theta)
\end{cases}
$$

- 복수의 입력 신호 각각에 고유한 가중치를 부여. 가중치는 각 신호가 결과에 미치는 영향력을 조절하는 요소로 작용함
- **가중치가 클수록 해당 신호가 중요함** (전류에서 저항을 생각하면 됨. 가중치가 클수록 더 강한 신호를 흘려보냄)

## 2. 논리회로

### 2.1 AND 게이트

- 두 입력 신호가 **모두 1**일 때 1을 출력, 그 외에는 0을 출력
- 이를 퍼셉트론으로 표현하도록 $w_1, w_2, \theta$를 정함
- 만족하는 매개변수 조합은 무수히 많음 (예: $0.5, 0.5, 0.8$)

### 2.2 NAND 게이트

- AND의 반대. 두 입력 신호가 **모두 1일 때만 0**을 출력, 그 외에는 1을 출력
- 매개변수 예: $(-0.5, -0.5, -0.7)$

### 2.3 OR 게이트

- 두 입력 신호 중 **하나라도 1**이면 1을 출력 (즉, 둘 다 0일 때만 0)
- 매개변수 예: $(0.4, 0.4, 0.2)$

> 퍼셉트론의 매개변수 값을 정하는 행위를 컴퓨터가 자동으로 하는 것이 **학습**. 사람은 퍼셉트론의 구조(모델)를 고민하고, 컴퓨터에 학습할 데이터를 주는 일을 함.

## 3. 퍼셉트론 구현

### 3.1 AND gate (기본 형태)

```python
def AND(x1, x2):
    w1, w2, theta = 0.5, 0.5, 0.7
    tmp = x1 * w1 + x2 * w2
    if tmp <= theta:
        return 0
    elif tmp > theta:
        return 1
```

### 3.2 편향(bias) 도입

$\theta$ 값을 $-b$로 치환:

$$
y = \begin{cases}
0 & (b + w_1 x_1 + w_2 x_2 \leq 0) \\
1 & (b + w_1 x_1 + w_2 x_2 > 0)
\end{cases}
$$

- 한계값 $\theta$를 치환한 $b$값을 **bias(편향)** 이라고 함
- 즉, 퍼셉트론은 **입력 신호에 가중치를 곱한 값과 편향을 합하여**, 그 값이 0을 넘으면 1을 출력, 그렇지 않으면 0을 출력함

### 3.3 NumPy로 구현

```python
import numpy as np

def AND(x1, x2):
    x = np.array([x1, x2])
    w = np.array([0.5, 0.5])
    b = -0.7
    tmp = np.sum(w * x) + b
    if tmp <= 0:
        return 0
    else:
        return 1

def NAND(x1, x2):
    x = np.array([x1, x2])
    w = np.array([-0.5, -0.5])     # AND와 가중치/편향 부호만 반대
    b = 0.7
    tmp = np.sum(x * w) + b
    if tmp <= 0:
        return 0
    else:
        return 1

def OR(x1, x2):
    x = np.array([x1, x2])
    w = np.array([0.5, 0.5])
    b = -0.2
    tmp = np.sum(x * w) + b
    if tmp <= 0:
        return 0
    else:
        return 1
```

### 3.4 XOR 게이트와 다층 퍼셉트론

- **XOR (배타적 논리합) 게이트**: $x_1$과 $x_2$ 중 **정확히 한 쪽만 1**일 때 1을 출력
- 단층 퍼셉트론으로는 표현할 수 없음 → **선형 영역으로 분리 불가능, 비선형 분리 필요**
- **다층 퍼셉트론(Multi-Layer Perceptron, MLP)** 으로 해결: AND, NAND, OR을 조합

```python
def XOR(x1, x2):
    s1 = NAND(x1, x2)
    s2 = OR(x1, x2)
    y = AND(s1, s2)
    return y
```

![다층 퍼셉트론으로 XOR 구현](images/perceptron-02.webp)

- $x_1, x_2$ 층에서 $s_1, s_2$ 층으로 신호가 전달되고, 이어서 $s_1, s_2$에서 $y$로 신호가 전달됨
- 즉, **2층 구조**의 퍼셉트론으로 XOR 게이트를 구현할 수 있음
- 이렇게 다층으로 이루어진 퍼셉트론은 더 복잡한 함수도 표현 가능
