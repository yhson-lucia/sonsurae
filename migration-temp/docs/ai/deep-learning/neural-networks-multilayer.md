---
title: Neural Networks (다층)
slug: neural-networks-multilayer
category: ai/deep-learning
summary: Hubel & Wiesel 실험, XOR 문제, Backpropagation 등장, Vanishing Gradient, Hinton 2006 가중치 초기화, AlexNet 2012, MNIST 실전 예제
tags: [ai, deep-learning, neural-network, backpropagation, vanishing-gradient, alexnet, history]
sort_order: 8
created: 2025-04-26
updated: 2026-05-10
---

## 1. Neural Networks의 탄생 배경

### 고양이 실험에서의 영감

- **Hubel과 Wiesel의 고양이 시각 피질 실험** (1959)
  - 고양이의 뇌에 전극을 연결하여 시각 자극에 대한 반응을 관찰
  - 특정 입력(특정 각도의 선, 특정 모양 등)에 따라 **활성화되는 뉴런이 다름**을 발견
  - 각 뉴런 신경망은 **특정 역할**을 담당
  - 이러한 뉴런들이 **층층이 합쳐져** 복합적인 인지를 수행

- **컴퓨터에의 응용**
  - 생물학적 신경망의 구조를 컴퓨터 모델로 구현하려는 시도
  - 여러 층(layer)을 쌓아 복잡한 패턴을 학습하는 구조 개발

***

## 2. 초기 Neural Networks의 한계

### XOR 문제 (XOR Problem)

**문제의 발견:**
- 단층 퍼셉트론으로는 **XOR 게이트를 구현할 수 없음**
- XOR는 **선형 분리가 불가능**한 문제

| x1 | x2 | XOR |
|----|----|----|
| 0  | 0  | 0  |
| 0  | 1  | 1  |
| 1  | 0  | 1  |
| 1  | 1  | 0  |

- 하나의 직선으로는 이 4개의 점을 0과 1로 분류할 수 없음
- 이로 인해 1960년대 후반 신경망 연구가 침체

**해결 방향:**
- **다층 퍼셉트론 (Multi-layer Perceptron)** 필요
- AND, OR, NOT 게이트를 조합하여 XOR 구현 가능
- 하지만 여러 층을 쌓았을 때 **각 층의 가중치를 어떻게 학습시킬지** 방법이 없었음

***

## 3. Backpropagation의 등장

### 오차역전파법 (Backpropagation)

**개념:**
- 출력층의 **오차(error)를 역방향으로 전파**하여 각 층의 가중치를 업데이트
- **Chain Rule (연쇄 법칙)** 을 이용한 미분으로 구현

**수식:**

각 가중치에 대한 오차의 gradient:

$$\frac{\partial L}{\partial w_{ij}} = \frac{\partial L}{\partial y} \cdot \frac{\partial y}{\partial z} \cdot \frac{\partial z}{\partial w_{ij}}$$

여기서:
- $L$ : 손실 함수 (Loss Function)
- $y$ : 출력값
- $z$ : 활성화 함수 입력값
- $w_{ij}$ : i번째 노드에서 j번째 노드로의 가중치

**의의:**
- 다층 신경망에서 각 층의 가중치를 학습할 수 있게 됨
- XOR 문제를 비롯한 비선형 문제 해결 가능

***

## 4. Gradient Vanishing 문제

### 기울기 소실 문제 (Vanishing Gradient Problem)

**문제 발생:**
- 층을 **무수히 많이** 쌓았을 때 발생
- Backpropagation 과정에서 오차가 앞쪽 층으로 갈수록 **점점 작아짐**
- 특히 Sigmoid 함수의 경우 gradient가 0~0.25 사이여서 곱셈이 반복되면 0에 수렴

**결과:**
- 앞쪽 층의 가중치가 거의 업데이트되지 않음
- 깊은 신경망 학습이 실질적으로 불가능
- 단순한 알고리즘(예: SVM, Random Forest)이 더 좋은 성능을 보임
- 1990년대 후반~2000년대 초반 신경망 연구 다시 침체

***

## 5. Deep Learning의 부활

### 돌파구

**Geoffrey Hinton의 해결책 (2006):**

1. **가중치 초기화 (Weight Initialization)**
   - 가중치의 **초기값을 적절히 설정**하면 학습이 가능
   - RBM (Restricted Boltzmann Machine)을 이용한 사전학습 (Pre-training)
   - 현재는 Xavier 초기화, He 초기화 등 다양한 방법 사용

2. **깊은 신경망의 효용성 입증**
   - 신경망을 깊게 구축하면 **복잡한 문제를 효과적으로 해결** 가능
   - 층이 깊을수록 더 추상적이고 고수준의 특징(feature)을 학습

### 획기적인 성과들

**AlexNet (2012):**
- ImageNet 대회에서 우승
- 이미지 분류 오류율을 **26%에서 16%로** 대폭 감소 (약 10% 개선)
- CNN (Convolutional Neural Network) 활용

**2015년 이후:**
- 오류율 **3% 이하** 달성 (인간 수준)
- ResNet, VGG, Inception 등 다양한 구조 개발

**RNN (Recurrent Neural Network):**
- 순차 데이터 처리
- 이미지 **캡션 생성** (그림 설명 자동 생성)
- 자연어 처리, 번역 등에 활용

***

## 6. XOR 문제 구현

### XOR을 다층 퍼셉트론으로 해결

**네트워크 구조:**

```
입력층 (x1, x2) → 은닉층 (2개 노드) → 출력층 (1개 노드)
```

**수식:**

은닉층:
$$K(X) = \sigma(XW_1 + B_1)$$

출력층:
$$\hat{Y} = H(X) = \sigma(K(X)W_2 + B_2)$$

여기서:
- $\sigma$ : Sigmoid 활성화 함수
- $W_1$ : 입력층 → 은닉층 가중치
- $W_2$ : 은닉층 → 출력층 가중치
- $B_1, B_2$ : 편향(bias)

### PyTorch 구현 예제

```python
import torch
import torch.nn as nn
import torch.optim as optim

# XOR 데이터
X = torch.FloatTensor([[0, 0],
                       [0, 1],
                       [1, 0],
                       [1, 1]])
Y = torch.FloatTensor([[0], [1], [1], [0]])

# 다층 퍼셉트론 모델
class XOR_Model(nn.Module):
    def __init__(self):
        super(XOR_Model, self).__init__()
        self.fc1 = nn.Linear(2, 2)      # 입력층 → 은닉층 (2→2)
        self.fc2 = nn.Linear(2, 1)      # 은닉층 → 출력층 (2→1)
        self.sigmoid = nn.Sigmoid()

    def forward(self, x):
        x = self.sigmoid(self.fc1(x))   # 은닉층 활성화
        x = self.sigmoid(self.fc2(x))   # 출력층 활성화
        return x

# 모델, 손실 함수, 옵티마이저
model = XOR_Model()
criterion = nn.BCELoss()  # Binary Cross Entropy
optimizer = optim.SGD(model.parameters(), lr=1)

# 학습
for epoch in range(10000):
    optimizer.zero_grad()

    # Forward pass
    output = model(X)
    loss = criterion(output, Y)

    # Backward pass
    loss.backward()
    optimizer.step()

    if (epoch + 1) % 1000 == 0:
        print(f'Epoch [{epoch+1}/10000], Loss: {loss.item():.4f}')

# 테스트
with torch.no_grad():
    predicted = model(X)
    predicted = (predicted > 0.5).float()
    accuracy = (predicted == Y).float().mean()
    print(f'\n예측값:\n{predicted}')
    print(f'정확도: {accuracy.item() * 100:.2f}%')
```

**출력 예시:**
```
Epoch [1000/10000], Loss: 0.6516
Epoch [2000/10000], Loss: 0.5234
Epoch [3000/10000], Loss: 0.1892
Epoch [4000/10000], Loss: 0.0523
Epoch [5000/10000], Loss: 0.0234
...

예측값:
tensor([[0.],
        [1.],
        [1.],
        [0.]])
정확도: 100.00%
```

***

## 7. Forward Propagation과 Backward Propagation

### Forward Propagation (순전파)

**과정:**
1. 입력 데이터를 네트워크에 넣음
2. 각 층을 거치며 가중치와 활성화 함수를 적용
3. 최종 출력값 계산
4. 손실 함수로 오차 계산

```python
# Forward pass 예시
z1 = X @ W1 + b1          # 첫 번째 층
a1 = sigmoid(z1)          # 활성화
z2 = a1 @ W2 + b2         # 두 번째 층
y_pred = sigmoid(z2)      # 최종 출력
loss = criterion(y_pred, y_true)  # 손실 계산
```

### Backward Propagation (역전파)

**과정:**
1. 출력층의 오차 계산
2. Chain Rule을 사용하여 각 층의 gradient 계산
3. 오차를 역방향으로 전파
4. 각 가중치를 gradient descent로 업데이트

```python
# Backward pass (PyTorch에서는 자동으로 수행)
loss.backward()           # 자동 미분으로 gradient 계산
optimizer.step()          # 가중치 업데이트
```

**Chain Rule 예시:**

출력층에서 은닉층으로:
$$\frac{\partial L}{\partial W_2} = \frac{\partial L}{\partial y} \cdot \frac{\partial y}{\partial z_2} \cdot \frac{\partial z_2}{\partial W_2}$$

은닉층에서 입력층으로:
$$\frac{\partial L}{\partial W_1} = \frac{\partial L}{\partial y} \cdot \frac{\partial y}{\partial z_2} \cdot \frac{\partial z_2}{\partial a_1} \cdot \frac{\partial a_1}{\partial z_1} \cdot \frac{\partial z_1}{\partial W_1}$$

***

## 8. Neural Networks의 학습 과정

### 전체 학습 알고리즘

1. **초기화**: 가중치와 편향을 랜덤하게 초기화
2. **Forward Propagation**: 입력 데이터로 예측값 계산
3. **손실 계산**: 예측값과 실제값의 차이 계산
4. **Backward Propagation**: Chain Rule로 각 가중치의 gradient 계산
5. **가중치 업데이트**: Gradient Descent로 가중치 조정
6. **반복**: 2~5 과정을 여러 epoch 반복

### 학습 시 고려사항

**1. 활성화 함수 선택**
- **Sigmoid**: 출력층 (이진 분류), 기울기 소실 문제 있음
- **ReLU**: 은닉층에서 주로 사용, 기울기 소실 문제 완화
- **Tanh**: Sigmoid보다 범위가 넓음 (-1 ~ 1)
- **Softmax**: 다중 클래스 분류 출력층

**2. 가중치 초기화**
- **Xavier 초기화**: Sigmoid, Tanh에 적합
- **He 초기화**: ReLU에 적합
- 초기값이 너무 크면 기울기 폭발, 너무 작으면 기울기 소실

**3. 학습률 (Learning Rate)**
- 너무 크면: 발산 (overshooting)
- 너무 작으면: 학습 속도 느림, 지역 최솟값에 갇힘

**4. 배치 크기 (Batch Size)**
- 전체 데이터: Batch Gradient Descent
- 일부 데이터: Mini-batch Gradient Descent (일반적)
- 1개 데이터: Stochastic Gradient Descent

***

## 9. 실전 예제: MNIST 손글씨 분류

```python
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms
from torch.utils.data import DataLoader

# 데이터 로드
transform = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize((0.5,), (0.5,))
])

train_dataset = datasets.MNIST(root='./data', train=True,
                               download=True, transform=transform)
train_loader = DataLoader(train_dataset, batch_size=64, shuffle=True)

# 다층 신경망 모델
class NeuralNetwork(nn.Module):
    def __init__(self):
        super(NeuralNetwork, self).__init__()
        self.flatten = nn.Flatten()
        self.fc1 = nn.Linear(28*28, 128)   # 입력층 → 은닉층1
        self.relu1 = nn.ReLU()
        self.fc2 = nn.Linear(128, 64)      # 은닉층1 → 은닉층2
        self.relu2 = nn.ReLU()
        self.fc3 = nn.Linear(64, 10)       # 은닉층2 → 출력층

    def forward(self, x):
        x = self.flatten(x)
        x = self.relu1(self.fc1(x))
        x = self.relu2(self.fc2(x))
        x = self.fc3(x)
        return x

# 모델 설정
model = NeuralNetwork()
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=0.001)

# 학습
epochs = 5
for epoch in range(epochs):
    total_loss = 0
    for batch_idx, (data, target) in enumerate(train_loader):
        optimizer.zero_grad()

        # Forward
        output = model(data)
        loss = criterion(output, target)

        # Backward
        loss.backward()
        optimizer.step()

        total_loss += loss.item()

    avg_loss = total_loss / len(train_loader)
    print(f'Epoch [{epoch+1}/{epochs}], Loss: {avg_loss:.4f}')

print("학습 완료!")
```

***

## 10. 핵심 정리

### Neural Networks의 발전 과정

1. **생물학적 영감** → 인공 신경망 개념 탄생
2. **XOR 문제** → 단층 퍼셉트론의 한계 발견
3. **Backpropagation** → 다층 신경망 학습 가능
4. **Gradient Vanishing** → 깊은 신경망의 한계
5. **가중치 초기화 & 새로운 활성화 함수** → Deep Learning 시대 개막

### 주요 개념

| 개념 | 설명 |
|------|------|
| **Forward Propagation** | 입력에서 출력으로 데이터 전달 |
| **Backward Propagation** | 오차를 역방향으로 전파하여 가중치 업데이트 |
| **Chain Rule** | 합성함수 미분법, 역전파의 수학적 기반 |
| **Gradient Descent** | 손실 함수를 최소화하는 최적화 알고리즘 |
| **Activation Function** | 비선형성을 추가하여 복잡한 패턴 학습 가능 |

### Neural Networks의 강점

- **비선형 문제 해결**: XOR 같은 선형 분리 불가능 문제 해결
- **특징 자동 추출**: 원시 데이터에서 유용한 특징을 자동으로 학습
- **확장성**: 층을 추가하여 더 복잡한 문제 해결 가능
- **범용성**: 이미지, 음성, 텍스트 등 다양한 분야에 적용

***