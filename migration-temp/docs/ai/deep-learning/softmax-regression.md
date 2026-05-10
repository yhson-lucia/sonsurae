---
title: Softmax Regression
slug: softmax-regression
category: ai/deep-learning
summary: 다중 클래스 분류, One-vs-Rest와 행렬 통합, Softmax 함수, Cross-Entropy, PyTorch CrossEntropyLoss 사용법
tags: [ai, deep-learning, softmax, multi-class-classification, cross-entropy, one-hot]
sort_order: 6
created: 2025-04-26
updated: 2026-05-10
---

## 1. 다중 클래스 분류란?

- **이진 분류 vs 다중 분류**
	- **로지스틱 회귀 (Logistic Regression)**: 이진 분류 (Binary Classification)
		- 출력: 0 또는 1 (두 가지 클래스)
		- 예시: 스팸/정상, 합격/불합격
	- **소프트맥스 회귀 (Softmax Regression)**: 다중 분류 (Multinomial Classification)
		- 출력: 3개 이상의 클래스
		- 예시: A/B/C 등급, 숫자 0-9 인식

- **다중 분류 문제 예시**
	- 손글씨 숫자 인식: 0, 1, 2, ..., 9 (10개 클래스)
	- 동물 분류: 고양이, 강아지, 새, 물고기 등
	- 뉴스 카테고리: 정치, 경제, 스포츠, 연예 등

***
## 2. 다중 분류 접근 방법

### 2.1 One-vs-Rest 전략

- **기본 아이디어**
	- A, B, C 세 클래스가 있다면
	- 각 클래스에 대해 독립적인 이진 분류기 구성
	- 세 개의 독립된 분류 함수 필요

- **독립적인 분류기**
	1. "A인지 아닌지" 분류 → 이진 분류
	2. "B인지 아닌지" 분류 → 이진 분류
	3. "C인지 아닌지" 분류 → 이진 분류

- **각 분류기의 출력**
	- 각각 독립적인 예측값 생성
	- A, B, C에 대한 점수 획득

***
## 3. 행렬 연산으로 통합

### 3.1 개별 가중치 벡터

- **각 클래스마다 독립적인 가중치**
	- A 분류를 위한 가중치 벡터: $\mathbf{w}_A$
	- B 분류를 위한 가중치 벡터: $\mathbf{w}_B$
	- C 분류를 위한 가중치 벡터: $\mathbf{w}_C$
	- 입력 데이터: $\mathbf{x}$ (모든 분류기에 공통)

- **개별 계산**
	- A에 대한 점수: $z_A = \mathbf{w}_A^T \mathbf{x} + b_A$
	- B에 대한 점수: $z_B = \mathbf{w}_B^T \mathbf{x} + b_B$
	- C에 대한 점수: $z_C = \mathbf{w}_C^T \mathbf{x} + b_C$

### 3.2 가중치 행렬로 통합

- **행렬 형태로 결합**
	```
	W = [w_A]     b = [b_A]
	    [w_B]         [b_B]
	    [w_C]         [b_C]
	```

- **행렬 곱셈으로 한 번에 계산**
$$\mathbf{z} = W\mathbf{x} + \mathbf{b}$$

- **결과**
	```
	z = [z_A]
	    [z_B]
	    [z_C]
	```
	- 한 번의 행렬 곱셈으로 모든 클래스의 점수 계산
	- 효율적인 연산

***
## 4. Softmax 함수

### 4.1 왜 Softmax가 필요한가?

- **Sigmoid의 한계**
	- 각 클래스에 Sigmoid 적용 → 각각 0~1 사이 값
	- 문제: 각 출력이 독립적 → 합이 1이 아님
	- 확률로 해석하기 어려움

- **예시**
	- 선형 변환 결과: $z = [2.0, 1.0, 0.1]$
	- 가장 큰 값(2.0)이 가장 가능성 높음
	- 하지만 확률로 표현하고 싶음

### 4.2 Softmax 함수 정의

$$\text{Softmax}(z_i) = \frac{e^{z_i}}{\sum_{j=1}^{K} e^{z_j}}$$

- **구성 요소**
	- $z_i$: i번째 클래스의 점수 (logit)
	- $K$: 전체 클래스 개수
	- $e^{z_i}$: 지수 함수로 변환 (항상 양수)
	- 분모: 모든 클래스의 지수 값의 합

### 4.3 Softmax의 특징

- **확률 분포 생성**
	- 모든 출력값이 0~1 사이
	- 모든 출력의 합 = 1
	- 확률로 해석 가능

$$\sum_{i=1}^{K} \text{Softmax}(z_i) = 1$$

- **상대적 크기 유지**
	- 입력값이 클수록 출력 확률이 높음
	- 지수 함수로 차이 증폭

### 4.4 Softmax 계산 예시

- **입력 (logits)**
	```
	z = [2.0, 1.0, 0.1]
	```

- **지수 계산**
	```
	e^2.0 ≈ 7.39
	e^1.0 ≈ 2.72
	e^0.1 ≈ 1.11
	합 = 11.22
	```

- **Softmax 출력**
	```
	P(A) = 7.39 / 11.22 ≈ 0.659 (65.9%)
	P(B) = 2.72 / 11.22 ≈ 0.242 (24.2%)
	P(C) = 1.11 / 11.22 ≈ 0.099 (9.9%)
	합 = 1.0 (100%)
	```

***
## 5. One-Hot Encoding

### 5.1 예측 클래스 결정

- **가장 높은 확률 선택**
	```python
	predictions = [0.659, 0.242, 0.099]
	predicted_class = argmax(predictions)  # 0 (A 클래스)
	```

- **One-Hot Encoding으로 변환**
	```
	예측: [0.659, 0.242, 0.099]
	↓
	One-Hot: [1, 0, 0]  # A 클래스만 1, 나머지 0
	```

### 5.2 실제 레이블 표현

- **레이블도 One-Hot Encoding**
	```
	A 클래스: [1, 0, 0]
	B 클래스: [0, 1, 0]
	C 클래스: [0, 0, 1]
	```

- **비교 용이**
	- 예측: [1, 0, 0]
	- 실제: [1, 0, 0]
	- 일치 → 정확한 예측

***
## 6. Cross-Entropy Loss

### 6.1 손실 함수의 필요성

- **왜 MSE를 사용하지 않는가?**
	- Softmax는 지수 함수 포함
	- MSE 사용 시 non-convex 형태
	- Local minimum 문제 발생
	- Cross-Entropy가 더 적합

### 6.2 Cross-Entropy 정의

$$\mathcal{L}(S, L) = -\sum_{i=1}^{K} L_i \log(S_i)$$

- **구성 요소**
	- $L$: 실제 레이블 (One-Hot Encoded)
	- $S$: Softmax 출력 (예측 확률)
	- $L_i$: i번째 클래스의 실제 레이블 (0 또는 1)
	- $S_i$: i번째 클래스의 예측 확률

### 6.3 Cross-Entropy 계산 과정

- **예시 1: 정확한 예측**
	```
	실제 레이블: L = [1, 0, 0]  (A 클래스)
	예측 확률:   S = [0.9, 0.05, 0.05]

	Loss = -(1 × log(0.9) + 0 × log(0.05) + 0 × log(0.05))
	     = -log(0.9)
	     ≈ 0.105  (낮은 손실)
	```

- **예시 2: 잘못된 예측**
	```
	실제 레이블: L = [1, 0, 0]  (A 클래스)
	예측 확률:   S = [0.1, 0.7, 0.2]

	Loss = -(1 × log(0.1) + 0 × log(0.7) + 0 × log(0.2))
	     = -log(0.1)
	     ≈ 2.303  (높은 손실)
	```

### 6.4 One-Hot Encoding의 효과

- **실제 레이블이 One-Hot이면**
	- 정답 클래스만 $L_i = 1$, 나머지는 $L_i = 0$
	- 정답 클래스의 $-\log(S_i)$만 계산
	- 나머지는 0으로 곱해져서 무시됨

$$\mathcal{L} = -\log(S_{\text{true class}})$$

- **$-\log(x)$ 함수 특성**
	- x = 1: $-\log(1) = 0$ → 완벽한 예측, 손실 0
	- x → 0: $-\log(x) \to \infty$ → 잘못된 예측, 손실 무한대
	- x ∈ (0, 1): 단조 감소

***
## 7. Logistic Regression과의 관계

### 7.1 Binary Cross-Entropy

- **로지스틱 회귀 손실 함수**
$$\text{BCE} = -[y \log(\hat{y}) + (1-y) \log(1-\hat{y})]$$

### 7.2 Softmax Regression과의 관계

- **이진 분류의 경우**
	- 클래스: A (클래스 1), Not-A (클래스 0)
	- One-Hot: [1, 0] 또는 [0, 1]
	- Softmax: [p, 1-p] (p + (1-p) = 1)

- **Cross-Entropy 적용**
	```
	실제: [1, 0] (클래스 A)
	예측: [p, 1-p]

	Loss = -(1 × log(p) + 0 × log(1-p))
	     = -log(p)
	```
	```
	실제: [0, 1] (클래스 Not-A)
	예측: [p, 1-p]

	Loss = -(0 × log(p) + 1 × log(1-p))
	     = -log(1-p)
	```

- **결합하면**
$$\text{Loss} = -[y \log(p) + (1-y) \log(1-p)]$$
	- Binary Cross-Entropy와 동일!

### 7.3 결론

- **Cross-Entropy는 일반화된 형태**
	- Binary Classification → Binary Cross-Entropy
	- Multi-class Classification → Categorical Cross-Entropy
	- 본질적으로 같은 원리

***
## 8. 전체 학습 과정

### 8.1 순전파 (Forward Propagation)

```
1. 선형 변환
   z = Wx + b
   shape: (K,) - K개 클래스

2. Softmax 적용
   S = Softmax(z)
   shape: (K,) - 확률 분포

3. 손실 계산
   Loss = CrossEntropy(S, L)
   scalar 값
```

### 8.2 역전파 (Backward Propagation)

```
1. 손실에 대한 기울기 계산
   ∂Loss/∂W, ∂Loss/∂b

2. 경사 하강법으로 파라미터 업데이트
   W := W - α × (∂Loss/∂W)
   b := b - α × (∂Loss/∂b)
```

### 8.3 학습 알고리즘

```python
for epoch in range(num_epochs):
    # 1. 순전파
    z = W @ x + b              # 선형 변환
    S = softmax(z)             # Softmax
    loss = cross_entropy(S, L) # 손실 계산

    # 2. 역전파
    grad_W = compute_gradient_W(x, S, L)
    grad_b = compute_gradient_b(S, L)

    # 3. 파라미터 업데이트
    W = W - learning_rate * grad_W
    b = b - learning_rate * grad_b
```

***
## 9. PyTorch 구현

### 9.1 모델 정의

```python
import torch
import torch.nn as nn

# 다중 분류 모델
class SoftmaxClassifier(nn.Module):
    def __init__(self, input_dim, num_classes):
        super(SoftmaxClassifier, self).__init__()
        self.linear = nn.Linear(input_dim, num_classes)

    def forward(self, x):
        logits = self.linear(x)
        return logits  # Softmax는 손실 함수에서 처리

# 모델 생성
model = SoftmaxClassifier(input_dim=10, num_classes=3)
```

### 9.2 손실 함수 및 옵티마이저

```python
# CrossEntropyLoss (Softmax + Cross-Entropy 통합)
criterion = nn.CrossEntropyLoss()

# 옵티마이저
optimizer = torch.optim.SGD(model.parameters(), lr=0.01)
```

### 9.3 학습 루프

```python
for epoch in range(100):
    # 순전파
    logits = model(X)  # (batch_size, num_classes)

    # 손실 계산 (내부에서 Softmax 적용)
    # Y는 클래스 인덱스 (0, 1, 2, ...)
    loss = criterion(logits, Y)

    # 역전파
    optimizer.zero_grad()
    loss.backward()

    # 파라미터 업데이트
    optimizer.step()

    if epoch % 10 == 0:
        print(f'Epoch: {epoch}, Loss: {loss.item():.4f}')
```

### 9.4 예측

```python
# 학습된 모델로 예측
with torch.no_grad():
    logits = model(X_test)
    probabilities = torch.softmax(logits, dim=1)  # Softmax 적용
    predictions = torch.argmax(probabilities, dim=1)  # 가장 높은 확률의 클래스

print(f'Predictions: {predictions}')
print(f'Probabilities: {probabilities}')
```

***
## 10. CrossEntropyLoss 주의사항

### 10.1 PyTorch의 CrossEntropyLoss

- **내부에서 Softmax 포함**
	```python
	criterion = nn.CrossEntropyLoss()
	```
	- LogSoftmax + NLLLoss (Negative Log Likelihood Loss) 결합
	- 입력: logits (Softmax 거치지 않은 값)
	- 수치적 안정성 향상

### 10.2 잘못된 사용

```python
# ❌ 잘못된 예시
model = nn.Sequential(
    nn.Linear(10, 3),
    nn.Softmax(dim=1)  # Softmax를 모델에 포함
)
criterion = nn.CrossEntropyLoss()
loss = criterion(model(X), Y)  # Softmax가 중복 적용됨!
```

### 10.3 올바른 사용

```python
# ✅ 올바른 예시 1: CrossEntropyLoss 사용
model = nn.Linear(10, 3)  # Softmax 없음
criterion = nn.CrossEntropyLoss()
loss = criterion(model(X), Y)

# ✅ 올바른 예시 2: NLLLoss 사용 (수동 Softmax)
model = nn.Sequential(
    nn.Linear(10, 3),
    nn.LogSoftmax(dim=1)  # Log-Softmax
)
criterion = nn.NLLLoss()
loss = criterion(model(X), Y)
```

***
## 11. 레이블 형식

### 11.1 PyTorch 레이블 형식

- **CrossEntropyLoss의 경우**
	```python
	# 클래스 인덱스 사용 (One-Hot 아님!)
	Y = torch.tensor([0, 2, 1, 0])  # 클래스 0, 2, 1, 0
	# shape: (batch_size,)
	```

- **One-Hot Encoding은 사용하지 않음**
	```python
	# ❌ 이렇게 하면 안 됨
	Y = torch.tensor([[1, 0, 0],
	                  [0, 0, 1],
	                  [0, 1, 0],
	                  [1, 0, 0]])
	```

### 11.2 One-Hot → 클래스 인덱스 변환

```python
# One-Hot Encoding
Y_onehot = torch.tensor([[1, 0, 0],
                          [0, 0, 1],
                          [0, 1, 0]])

# 클래스 인덱스로 변환
Y_class = torch.argmax(Y_onehot, dim=1)
# tensor([0, 2, 1])
```

### 11.3 클래스 인덱스 → One-Hot 변환

```python
# 클래스 인덱스
Y_class = torch.tensor([0, 2, 1])

# One-Hot Encoding으로 변환
num_classes = 3
Y_onehot = torch.nn.functional.one_hot(Y_class, num_classes=num_classes)
# tensor([[1, 0, 0],
#         [0, 0, 1],
#         [0, 1, 0]])
```

***
## 12. Softmax vs Sigmoid 비교

| 구분 | Sigmoid | Softmax |
|------|---------|---------|
| **사용 목적** | 이진 분류 | 다중 분류 |
| **출력 범위** | 각 출력 0~1 | 각 출력 0~1 |
| **출력 합** | 합이 1이 아님 (독립적) | 합이 정확히 1 (확률 분포) |
| **수식** | $\sigma(z) = \frac{1}{1+e^{-z}}$ | $\text{Softmax}(z_i) = \frac{e^{z_i}}{\sum_j e^{z_j}}$ |
| **손실 함수** | Binary Cross-Entropy | Categorical Cross-Entropy |
| **클래스 수** | 2개 | 2개 이상 (K개) |
| **출력 해석** | 클래스 1의 확률 | 각 클래스의 확률 |

***
## 13. 핵심 정리

### 13.1 Softmax Regression 특징

- **다중 클래스 분류**
	- 3개 이상의 클래스 분류
	- 각 클래스에 대한 독립적인 가중치
	- 행렬 곱셈으로 효율적 계산

- **Softmax 함수**
	- 지수 함수로 변환 후 정규화
	- 확률 분포 생성 (합 = 1)
	- 상대적 크기 유지 및 증폭

### 13.2 수식 요약

- **모델**
$$\mathbf{z} = W\mathbf{x} + \mathbf{b}$$
$$S_i = \frac{e^{z_i}}{\sum_{j=1}^{K} e^{z_j}}$$

- **손실 함수**
$$\mathcal{L} = -\sum_{i=1}^{K} L_i \log(S_i)$$

- **예측**
$$\hat{y} = \arg\max_i(S_i)$$

### 13.3 PyTorch 구현 포인트

- **CrossEntropyLoss 사용**
	- 모델 출력: logits (Softmax 없음)
	- 레이블: 클래스 인덱스 (One-Hot 아님)
	- 내부에서 Softmax + Cross-Entropy 처리

- **예측 시**
	- `torch.softmax()`: 확률 분포 얻기
	- `torch.argmax()`: 클래스 결정

### 13.4 Logistic Regression과의 관계

- **일반화 관계**
	- Logistic Regression = 2-class Softmax Regression
	- Binary Cross-Entropy = Categorical Cross-Entropy (K=2)
	- Sigmoid = Softmax (K=2)

- **통일된 프레임워크**
	- 이진 분류와 다중 분류를 같은 방식으로 처리
	- Cross-Entropy Loss의 일반화

***
## 14. 실전 예제: MNIST

```python
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms

# 데이터 로드
transform = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize((0.1307,), (0.3081,))
])

train_dataset = datasets.MNIST('./data', train=True, download=True, transform=transform)
train_loader = torch.utils.data.DataLoader(train_dataset, batch_size=64, shuffle=True)

# 모델 정의 (784 입력 → 10 출력)
model = nn.Linear(28*28, 10)

# 손실 함수 및 옵티마이저
criterion = nn.CrossEntropyLoss()
optimizer = optim.SGD(model.parameters(), lr=0.01)

# 학습
for epoch in range(10):
    for batch_idx, (data, target) in enumerate(train_loader):
        # 이미지 평탄화: (batch, 28, 28) → (batch, 784)
        data = data.view(-1, 28*28)

        # 순전파
        output = model(data)
        loss = criterion(output, target)

        # 역전파
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

    print(f'Epoch {epoch+1}, Loss: {loss.item():.4f}')

# 예측
with torch.no_grad():
    test_data = next(iter(train_loader))[0].view(-1, 28*28)
    logits = model(test_data)
    probabilities = torch.softmax(logits, dim=1)
    predictions = torch.argmax(probabilities, dim=1)
    print(f'Predictions: {predictions[:10]}')
```