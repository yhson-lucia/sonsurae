---
title: 오차역전파법
slug: backpropagation
category: ai/deep-learning
summary: 계산 그래프로 본 순전파/역전파, 곱셈/덧셈 노드 구현, ReLU/Sigmoid 계층 구현
tags: [ai, deep-learning, backpropagation, computational-graph, relu, sigmoid]
sort_order: 4
created: 2025-04-26
updated: 2026-05-10
---

## 1. 오차역전파

- 오차를 역으로 전파하는 방법 (**Backward Propagation of Errors**)
- **계산 그래프**: 계산 과정을 표현한 그래프. Node와 Edge로 표현되며, Node의 방향은 계산 순서대로 진행됨
  - 진행 단계: **순전파 (Forward Propagation)**
  - 반대 방향: **역전파 (Backward Propagation)**

### 1.1 계산 그래프의 장점

- 각 노드에서의 계산은 다른 노드와 영향을 주지 않는 **국소적 계산**. 전체에서 어떤 일이 벌어지든 상관없이 자신과 관계된 정보만으로 결과를 출력
- 중간 계산 결과를 모두 보관할 수 있음
- **역전파를 통해 미분을 효율적으로 계산** 가능
  - 전체 결과값에 대해 노드의 계산 변화가 어떤 영향을 끼치는지 알고 싶다면 각 노드에서의 미분값을 구하면 됨
  - 역전파 진행 시 거꾸로 미분 값을 계산하므로, **순방향의 입력 신호 값이 필요**. 곱셈 노드는 순전파의 입력 신호를 변수에 저장해 둬야 함

## 2. 곱셈/덧셈 노드 구현

사과와 오렌지를 사는 계산 그래프 예시. 과일 가격 × 개수 × 세금으로 계산되며, 각 노드들이 이를 맡음.

### 2.1 곱셈 / 덧셈 계층

```python
class MulLayer:
    def __init__(self):
        self.x = None
        self.y = None

    def forward(self, x, y):
        self.x = x
        self.y = y
        out = x * y
        return out

    def backward(self, dout):
        dx = dout * self.y    # 곱셈은 상대 입력값을 곱해 전파
        dy = dout * self.x
        return dx, dy


class AddLayer:
    def __init__(self):
        pass

    def forward(self, x, y):
        out = x + y
        return out

    def backward(self, dout):
        dx = dout * 1         # 덧셈은 그대로 전파
        dy = dout * 1
        return dx, dy
```

- `forward`는 입력 `(x, y)`를 받아 출력을 계산
- `backward`는 상류의 미분값 `dout`을 받아 하류로 전파할 미분값을 계산

### 2.2 계산 그래프 적용

```python
from layer_naive import MulLayer, AddLayer

apple = 100
apple_num = 2
orange = 150
orange_num = 3
tax = 1.1

# 계층들
mul_apple_layer = MulLayer()
mul_orange_layer = MulLayer()
add_apple_orange_layer = AddLayer()
mul_tax_layer = MulLayer()

# 순전파
apple_price = mul_apple_layer.forward(apple, apple_num)
orange_price = mul_orange_layer.forward(orange, orange_num)
all_price = add_apple_orange_layer.forward(apple_price, orange_price)
price = mul_tax_layer.forward(all_price, tax)

# 역전파
dprice = 1
dall_price, dtax = mul_tax_layer.backward(dprice)
dapple_price, dorange_price = add_apple_orange_layer.backward(dall_price)
dapple, dapple_num = mul_apple_layer.backward(dapple_price)
dorange, dorange_num = mul_orange_layer.backward(dorange_price)   # ← orange layer 사용

print(price)
print(dapple_num, dapple, dorange, dorange_num, dtax)
```

> **주의**: 마지막 줄은 반드시 `mul_orange_layer.backward(...)` 를 사용해야 함 (apple layer가 아님). 원본 노트에 `mul_apple_layer`로 잘못 쓰여 있던 부분을 정정함.

- 위 코드는 실제 값을 넣어 계산. 계산 그래프와 노드를 이용해 역으로 미분값을 계산할 수 있음

## 3. 활성화 함수 계층 구현

실제 Layer는 활성화 함수를 이용해 계층을 표현. weight·bias로 나온 값을 활성화 함수로 계산하는 과정을 거치므로, 각 활성화 함수를 클래스 하나로 구현 가능.

### 3.1 ReLU 계층

활성화 함수로 사용되는 ReLU.

$$
y = \begin{cases}
x & (x > 0) \\
0 & (x \leq 0)
\end{cases}
$$

미분하면

$$
\frac{\partial y}{\partial x} = \begin{cases}
1 & (x > 0) \\
0 & (x \leq 0)
\end{cases}
$$

코드 구현

```python
class ReLU:
    def __init__(self):
        self.mask = None

    def forward(self, x):
        self.mask = (x <= 0)    # x <= 0인 위치를 True로 마스킹
        out = x.copy()
        out[self.mask] = 0
        return out

    def backward(self, dout):
        dout[self.mask] = 0     # 순전파 때 0이었던 위치는 역전파도 0
        dx = dout
        return dx
```

### 3.2 Sigmoid 계층

활성화 함수로 사용되는 Sigmoid.

$$y = \frac{1}{1 + e^{-x}}$$

미분하면

$$\frac{\partial y}{\partial x} = y(1 - y)$$

코드 구현

```python
class Sigmoid:
    def __init__(self):
        self.out = None

    def forward(self, x):
        out = 1 / (1 + np.exp(-x))
        self.out = out          # 역전파에서 사용
        return out

    def backward(self, dout):
        dx = dout * (1.0 - self.out) * self.out
        return dx
```

> Sigmoid의 역전파는 **순전파의 출력값**만 있으면 계산 가능 ($y(1-y)$). 그래서 `self.out`을 저장해 둠.
