---
title: ReLU
slug: relu
category: ai/deep-learning
summary: 활성화 함수 개요, Vanishing Gradient 문제, ReLU의 등장과 효과, Leaky ReLU/ELU/PReLU/Tanh 비교, 사용 가이드
tags: [ai, deep-learning, relu, activation-function, vanishing-gradient, leaky-relu, elu]
sort_order: 9
created: 2025-04-26
updated: 2026-05-10
---

## 1. 활성화 함수 (Activation Function)란?

### 정의

활성화 함수는 신경망의 각 뉴런에서 **입력 신호를 변환하여 출력**하는 함수입니다.

**역할:**
- **비선형성 추가**: 선형 변환만으로는 복잡한 패턴 학습 불가능
- **출력 범위 제한**: 특정 범위로 값을 정규화 (예: 0~1, -1~1)
- **뉴런 활성화 제어**: 특정 값 이상에서만 활성화

### 대표적인 활성화 함수

**Sigmoid:**
$$\sigma(x) = \frac{1}{1 + e^{-x}}$$
- 출력 범위: 0 ~ 1
- 이진 분류 출력층에서 사용

**Tanh:**
$$\text{tanh}(x) = \frac{e^x - e^{-x}}{e^x + e^{-x}}$$
- 출력 범위: -1 ~ 1
- Sigmoid를 0 중심으로 이동한 형태

**ReLU:**
$$\text{ReLU}(x) = \max(0, x)$$
- 출력 범위: 0 ~ ∞
- 현대 신경망에서 가장 널리 사용

***

## 2. Hidden Layer (은닉층) 설계

### Hidden Layer의 자유도

신경망을 설계할 때:
- **입력층 (Input Layer)**: 데이터의 특성 개수로 고정
- **출력층 (Output Layer)**: 예측 목표에 따라 고정
- **은닉층 (Hidden Layer)**: 설계자가 자유롭게 결정 가능

### 설계 시 결정 사항

**1. 층의 개수 (Depth)**
```python
# 얕은 네트워크 (2층)
model = nn.Sequential(
    nn.Linear(input_size, hidden_size),
    nn.ReLU(),
    nn.Linear(hidden_size, output_size)
)

# 깊은 네트워크 (9층)
model = nn.Sequential(
    nn.Linear(input_size, 128),
    nn.ReLU(),
    nn.Linear(128, 128),
    nn.ReLU(),
    nn.Linear(128, 128),
    nn.ReLU(),
    # ... 계속 추가
    nn.Linear(128, output_size)
)
```

**2. 각 층의 노드 수 (Width)**
- 너무 적으면: 표현력 부족
- 너무 많으면: 과적합, 연산 비용 증가

**3. 활성화 함수 선택**
- 은닉층: ReLU, Leaky ReLU, ELU 등
- 출력층: Sigmoid (이진 분류), Softmax (다중 분류)

**4. Bias 사용 여부**
- 일반적으로 `bias=True` 권장

### 모델 시각화

**TensorBoard를 통한 네트워크 구조 시각화:**
```python
from torch.utils.tensorboard import SummaryWriter

writer = SummaryWriter('runs/experiment_1')
dummy_input = torch.randn(1, input_size)
writer.add_graph(model, dummy_input)
writer.close()
```

***

## 3. 깊은 네트워크의 문제: Vanishing Gradient

### 문제 발견

**실험 결과:**
- 2~3층 네트워크: 학습 잘 됨
- 9~10층 네트워크: 정확도가 오히려 **감소**
- 정확도가 0.5 근처에서 진동 (학습 실패)

### Vanishing Gradient 현상

**원인:**

Backpropagation 시 Chain Rule을 적용하면:
$$\frac{\partial L}{\partial w_1} = \frac{\partial L}{\partial y} \cdot \frac{\partial y}{\partial a_n} \cdot \frac{\partial a_n}{\partial a_{n-1}} \cdots \frac{\partial a_2}{\partial a_1} \cdot \frac{\partial a_1}{\partial w_1}$$

**Sigmoid의 미분:**
$$\sigma'(x) = \sigma(x)(1 - \sigma(x))$$
- 최댓값: 0.25 (x=0일 때)
- 출력 범위: 0 ~ 0.25

**문제점:**
1. Sigmoid를 통과할 때마다 **0~0.25 사이 값이 곱해짐**
2. 층이 깊어질수록 gradient가 **기하급수적으로 감소**
3. 앞쪽 층으로 갈수록 gradient가 **0에 수렴**
4. 앞쪽 층의 가중치가 **거의 업데이트되지 않음**

**수치 예시:**

9층 네트워크에서:
$$0.25 \times 0.25 \times 0.25 \times \cdots \text{(9번)} \approx 3.8 \times 10^{-6}$$

거의 0에 가까워져 학습 불가능!

### 결과

- **2006년까지 딥러닝 연구 침체**
- 깊은 네트워크를 학습시킬 수 없었음
- SVM, Random Forest 같은 전통적 ML이 더 우수한 성능

***

## 4. ReLU: 혁신적인 해결책

### ReLU (Rectified Linear Unit)

**수식:**
$$\text{ReLU}(x) = \max(0, x) = \begin{cases} x & \text{if } x > 0 \\ 0 & \text{if } x \leq 0 \end{cases}$$

**미분:**
$$\text{ReLU}'(x) = \begin{cases} 1 & \text{if } x > 0 \\ 0 & \text{if } x \leq 0 \end{cases}$$

### ReLU의 장점

**1. Gradient 소실 방지**
- 양수 영역에서 미분값이 **항상 1**
- 깊은 네트워크에서도 gradient가 유지됨
- Backpropagation이 효과적으로 작동

**2. 계산 효율성**
- 단순한 max(0, x) 연산
- Sigmoid처럼 지수 함수 불필요
- 학습 속도 빠름

**3. 희소성 (Sparsity)**
- 음수 입력은 0으로 변환
- 일부 뉴런만 활성화 → 효율적인 표현

### Sigmoid vs ReLU 비교

| 특성 | Sigmoid | ReLU |
|------|---------|------|
| **수식** | $\frac{1}{1+e^{-x}}$ | $\max(0, x)$ |
| **출력 범위** | 0 ~ 1 | 0 ~ ∞ |
| **미분 범위** | 0 ~ 0.25 | 0 또는 1 |
| **Vanishing Gradient** | 심각함 | 없음 (양수 영역) |
| **계산 비용** | 높음 (지수 연산) | 낮음 |
| **은닉층 사용** | 비권장 | 권장 (기본값) |
| **출력층 사용** | 이진 분류 | 사용 안 함 |

***

## 5. ReLU 사용 예제

### Sigmoid vs ReLU 성능 비교

```python
import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np

# 데이터 생성
torch.manual_seed(777)
X = torch.randn(1000, 20)
Y = (X.sum(dim=1, keepdim=True) > 0).float()

# Sigmoid 기반 깊은 네트워크 (9층)
class SigmoidDeepNet(nn.Module):
    def __init__(self):
        super(SigmoidDeepNet, self).__init__()
        self.layers = nn.Sequential(
            nn.Linear(20, 128), nn.Sigmoid(),
            nn.Linear(128, 128), nn.Sigmoid(),
            nn.Linear(128, 128), nn.Sigmoid(),
            nn.Linear(128, 128), nn.Sigmoid(),
            nn.Linear(128, 128), nn.Sigmoid(),
            nn.Linear(128, 128), nn.Sigmoid(),
            nn.Linear(128, 128), nn.Sigmoid(),
            nn.Linear(128, 128), nn.Sigmoid(),
            nn.Linear(128, 1), nn.Sigmoid()
        )

    def forward(self, x):
        return self.layers(x)

# ReLU 기반 깊은 네트워크 (9층)
class ReLUDeepNet(nn.Module):
    def __init__(self):
        super(ReLUDeepNet, self).__init__()
        self.layers = nn.Sequential(
            nn.Linear(20, 128), nn.ReLU(),
            nn.Linear(128, 128), nn.ReLU(),
            nn.Linear(128, 128), nn.ReLU(),
            nn.Linear(128, 128), nn.ReLU(),
            nn.Linear(128, 128), nn.ReLU(),
            nn.Linear(128, 128), nn.ReLU(),
            nn.Linear(128, 128), nn.ReLU(),
            nn.Linear(128, 128), nn.ReLU(),
            nn.Linear(128, 1), nn.Sigmoid()  # 출력층만 Sigmoid
        )

    def forward(self, x):
        return self.layers(x)

# 학습 함수
def train_model(model, name, epochs=100):
    criterion = nn.BCELoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001)

    print(f"\n=== {name} 학습 ===")
    for epoch in range(epochs):
        optimizer.zero_grad()
        output = model(X)
        loss = criterion(output, Y)
        loss.backward()
        optimizer.step()

        if (epoch + 1) % 20 == 0:
            accuracy = ((output > 0.5).float() == Y).float().mean()
            print(f'Epoch [{epoch+1}/{epochs}], Loss: {loss.item():.4f}, Acc: {accuracy.item():.4f}')

# 비교 실험
sigmoid_model = SigmoidDeepNet()
relu_model = ReLUDeepNet()

train_model(sigmoid_model, "Sigmoid Network")
train_model(relu_model, "ReLU Network")
```

**실행 결과:**
```
=== Sigmoid Network 학습 ===
Epoch [20/100], Loss: 0.6932, Acc: 0.5010
Epoch [40/100], Loss: 0.6932, Acc: 0.4990
Epoch [60/100], Loss: 0.6931, Acc: 0.5000
Epoch [80/100], Loss: 0.6931, Acc: 0.5000
Epoch [100/100], Loss: 0.6931, Acc: 0.5000

=== ReLU Network 학습 ===
Epoch [20/100], Loss: 0.2145, Acc: 0.9230
Epoch [40/100], Loss: 0.0823, Acc: 0.9710
Epoch [60/100], Loss: 0.0421, Acc: 0.9850
Epoch [80/100], Loss: 0.0245, Acc: 0.9930
Epoch [100/100], Loss: 0.0156, Acc: 0.9960
```

**결과 분석:**
- **Sigmoid**: 정확도 50% (학습 실패, Vanishing Gradient)
- **ReLU**: 정확도 99.6% (학습 성공)

***

## 6. 다양한 활성화 함수

### Leaky ReLU

**문제점:** ReLU는 음수 영역에서 gradient가 0 (Dying ReLU 문제)

**해결책:**
$$\text{Leaky ReLU}(x) = \begin{cases} x & \text{if } x > 0 \\ \alpha x & \text{if } x \leq 0 \end{cases}$$

여기서 $\alpha$는 작은 값 (보통 0.01)

```python
nn.LeakyReLU(negative_slope=0.01)
```

**장점:**
- 음수 영역에서도 작은 gradient 유지
- Dying ReLU 문제 완화

### ELU (Exponential Linear Unit)

**수식:**
$$\text{ELU}(x) = \begin{cases} x & \text{if } x > 0 \\ \alpha(e^x - 1) & \text{if } x \leq 0 \end{cases}$$

```python
nn.ELU(alpha=1.0)
```

**장점:**
- 음수 영역에서 부드러운 곡선
- 평균 출력이 0에 가까움 → 학습 안정성

**단점:**
- 지수 연산으로 계산 비용 증가

### Tanh (Hyperbolic Tangent)

**수식:**
$$\text{tanh}(x) = \frac{e^x - e^{-x}}{e^x + e^{-x}}$$

```python
nn.Tanh()
```

**특징:**
- Sigmoid를 0 중심으로 이동 (-1 ~ 1)
- Sigmoid보다 gradient 소실 덜함
- 하지만 ReLU보다는 여전히 느림

### PReLU (Parametric ReLU)

**수식:**
$$\text{PReLU}(x) = \begin{cases} x & \text{if } x > 0 \\ \alpha x & \text{if } x \leq 0 \end{cases}$$

여기서 $\alpha$는 **학습 가능한 파라미터**

```python
nn.PReLU()
```

**장점:**
- $\alpha$를 자동으로 학습
- 데이터에 맞는 최적의 기울기 찾음

***

## 7. 활성화 함수 비교

### 수식 및 특성 비교

| 활성화 함수 | 수식 | 출력 범위 | Vanishing Gradient | 계산 비용 |
|-------------|------|-----------|-------------------|----------|
| **Sigmoid** | $\frac{1}{1+e^{-x}}$ | (0, 1) | 심각 | 높음 |
| **Tanh** | $\frac{e^x-e^{-x}}{e^x+e^{-x}}$ | (-1, 1) | 있음 | 높음 |
| **ReLU** | $\max(0, x)$ | [0, ∞) | 없음 | 낮음 |
| **Leaky ReLU** | $\max(\alpha x, x)$ | (-∞, ∞) | 없음 | 낮음 |
| **ELU** | $x$ or $\alpha(e^x-1)$ | (-α, ∞) | 없음 | 중간 |
| **PReLU** | $\max(\alpha x, x)$ | (-∞, ∞) | 없음 | 낮음 |

### 사용 가이드

**은닉층:**
1. **ReLU**: 기본 선택 (가장 널리 사용)
2. **Leaky ReLU / PReLU**: ReLU로 성능 부족 시
3. **ELU**: 더 부드러운 학습 원할 때
4. **Tanh**: RNN, LSTM에서 가끔 사용
5. **Sigmoid**: 은닉층에서 사용 금지 (Vanishing Gradient)

**출력층:**
1. **Sigmoid**: 이진 분류 (0 또는 1)
2. **Softmax**: 다중 클래스 분류
3. **Linear (활성화 없음)**: 회귀 문제
4. **Tanh**: 출력이 -1~1 범위일 때

***

## 8. 실전 예제: 최적의 활성화 함수 찾기

```python
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import TensorDataset, DataLoader

# 데이터 생성
torch.manual_seed(42)
X = torch.randn(5000, 50)
Y = (X[:, :25].sum(dim=1) > X[:, 25:].sum(dim=1)).long()

dataset = TensorDataset(X, Y)
train_loader = DataLoader(dataset, batch_size=64, shuffle=True)

# 다양한 활성화 함수로 모델 생성
def create_model(activation):
    if activation == 'relu':
        act = nn.ReLU()
    elif activation == 'leaky_relu':
        act = nn.LeakyReLU(0.01)
    elif activation == 'elu':
        act = nn.ELU()
    elif activation == 'tanh':
        act = nn.Tanh()
    elif activation == 'sigmoid':
        act = nn.Sigmoid()

    model = nn.Sequential(
        nn.Linear(50, 128), act,
        nn.Linear(128, 64), act,
        nn.Linear(64, 32), act,
        nn.Linear(32, 2)  # 출력층: 활성화 함수 없음 (CrossEntropyLoss 사용)
    )
    return model

# 학습 및 평가
def train_and_evaluate(activation_name):
    model = create_model(activation_name)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001)

    # 학습
    for epoch in range(20):
        for batch_x, batch_y in train_loader:
            optimizer.zero_grad()
            output = model(batch_x)
            loss = criterion(output, batch_y)
            loss.backward()
            optimizer.step()

    # 최종 정확도
    with torch.no_grad():
        output = model(X)
        predicted = output.argmax(dim=1)
        accuracy = (predicted == Y).float().mean()

    return accuracy.item()

# 모든 활성화 함수 비교
activations = ['relu', 'leaky_relu', 'elu', 'tanh', 'sigmoid']
results = {}

for act in activations:
    acc = train_and_evaluate(act)
    results[act] = acc
    print(f'{act:12s}: {acc:.4f}')

# 최고 성능 출력
best = max(results, key=results.get)
print(f'\n최고 성능: {best} ({results[best]:.4f})')
```

**예상 출력:**
```
relu        : 0.9820
leaky_relu  : 0.9835
elu         : 0.9828
tanh        : 0.9245
sigmoid     : 0.5012

최고 성능: leaky_relu (0.9835)
```

***

## 9. 핵심 정리

### Vanishing Gradient 문제

**원인:**
- Sigmoid/Tanh의 미분값이 1보다 작음
- 깊은 네트워크에서 gradient가 0으로 소실
- 앞쪽 층의 가중치가 업데이트되지 않음

**해결책:**
- **ReLU 사용**: 양수 영역에서 gradient = 1
- 적절한 가중치 초기화 (He initialization)
- Batch Normalization
- Residual Connection (ResNet)

### 활성화 함수 선택 전략

**1순위: ReLU**
- 계산 빠름
- Vanishing Gradient 없음
- 대부분의 경우 좋은 성능

**2순위: Leaky ReLU / PReLU**
- Dying ReLU 문제 해결
- ReLU와 거의 동일한 속도

**3순위: ELU**
- 더 부드러운 학습
- 약간 느림

**사용 금지: Sigmoid (은닉층)**
- Vanishing Gradient 심각
- 계산 비용 높음
- 오직 이진 분류 출력층에서만 사용

### 실무 팁

```python
# 권장 구조
model = nn.Sequential(
    nn.Linear(input_size, 128),
    nn.ReLU(),                    # 은닉층: ReLU
    nn.Linear(128, 64),
    nn.ReLU(),                    # 은닉층: ReLU
    nn.Linear(64, output_size),
    nn.Sigmoid()                  # 출력층: Sigmoid (이진 분류)
)

# 또는 (다중 클래스 분류)
model = nn.Sequential(
    nn.Linear(input_size, 128),
    nn.ReLU(),
    nn.Linear(128, num_classes)   # Softmax는 CrossEntropyLoss에 포함
)
```

***