---
title: Logistic Regression Cost
slug: logistic-regression-cost
category: ai/deep-learning
summary: 로지스틱 회귀의 Sigmoid 가설, MSE 대신 Log Loss를 쓰는 이유, Binary Cross-Entropy, PyTorch BCELoss/BCEWithLogitsLoss
tags: [ai, deep-learning, logistic-regression, bce, sigmoid, cost-function, convex]
sort_order: 5
created: 2025-04-26
updated: 2026-05-10
---

## 1. 로지스틱 회귀란?

- **로지스틱 회귀 (Logistic Regression)**
	- 선형 회귀의 출력값을 0~1 사이의 확률 값으로 변환하는 분류 알고리즘
	- 이진 분류 (Binary Classification) 문제에 주로 사용
	- 예시: 스팸 메일 분류, 질병 진단, 합격/불합격 예측

- **선형 회귀와의 차이**
	- 선형 회귀: y = WX + b → 연속된 실수 값 출력
	- 로지스틱 회귀: y = σ(WX + b) → 0~1 사이의 확률 값 출력

***
## 2. Sigmoid 함수

- **Sigmoid 활성화 함수**
	- 선형 회귀의 출력을 0~1 범위로 변환
	- 확률로 해석 가능한 값을 만들어줌

$$\sigma(x) = \frac{1}{1 + e^{-x}}$$

- **Sigmoid 함수의 특징**
	- 입력값이 커질수록 → 1에 가까워짐
	- 입력값이 작아질수록 → 0에 가까워짐
	- x = 0일 때 → 0.5
	- 모든 실수를 0~1 범위로 압축

- **로지스틱 회귀 가설 함수**
$$H(X) = \sigma(WX + b) = \frac{1}{1 + e^{-(WX + b)}}$$

***
## 3. 왜 새로운 Cost 함수가 필요한가?

- **선형 회귀의 MSE 문제**
	- 선형 회귀 Cost 함수: $\text{Cost}(W, b) = \frac{1}{m}\sum_{i=1}^{m}(H(x^{(i)}) - y^{(i)})^2$
	- Sigmoid를 거친 $H(x)$를 MSE에 적용하면 문제 발생

- **Local Minimum 문제**
	- Sigmoid 함수는 지수 함수를 포함
	- MSE를 적용하면 Cost 함수가 non-convex(비볼록) 형태
	- 여러 개의 local minimum 발생
	- 경사 하강법이 global minimum을 찾지 못할 위험

- **해결 방법**
	- 로지스틱 회귀에 적합한 새로운 Cost 함수 필요
	- Convex(볼록) 형태를 만드는 로그 손실 함수 사용

***
## 4. 로그 손실 함수 (Log Loss)

- **새로운 Cost 함수 정의**

$$\text{Cost}(W, b) = \frac{1}{m}\sum_{i=1}^{m}c(H(x^{(i)}), y^{(i)})$$

- **개별 샘플의 손실 함수**

$$
c(H(x), y) = \begin{cases}
-\log(H(x)) & \text{if } y = 1 \\\\
-\log(1 - H(x)) & \text{if } y = 0
\end{cases}
$$

### 4.1 y = 1인 경우

- **손실 함수: $c(H(x), y) = -\log(H(x))$**
	- $H(x) = 1$ (정답 예측) → $-\log(1) = 0$ → 손실 없음
	- $H(x) = 0$ (오답 예측) → $-\log(0) = \infty$ → 큰 손실
	- $H(x)$가 1에 가까울수록 손실 감소
	- $H(x)$가 0에 가까울수록 손실 증가

### 4.2 y = 0인 경우

- **손실 함수: $c(H(x), y) = -\log(1 - H(x))$**
	- $H(x) = 0$ (정답 예측) → $-\log(1) = 0$ → 손실 없음
	- $H(x) = 1$ (오답 예측) → $-\log(0) = \infty$ → 큰 손실
	- $H(x)$가 0에 가까울수록 손실 감소
	- $H(x)$가 1에 가까울수록 손실 증가

### 4.3 로그 함수의 특성

- **$-\log(x)$ 함수 그래프**
	- x = 1일 때: $-\log(1) = 0$
	- x → 0일 때: $-\log(x) \to \infty$
	- x ∈ (0, 1) 범위에서 단조 감소

- **왜 로그를 사용하는가?**
	- Sigmoid 함수의 지수를 상쇄
	- Convex 형태의 Cost 함수 생성
	- $H(x)$는 양수이므로 제곱 불필요
	- 경사 하강법 적용 가능한 형태

***
## 5. 통합 Cost 함수

- **조건문 제거**
	- TensorFlow, PyTorch 등의 프레임워크에서는 if 조건문 사용 어려움
	- 두 경우를 하나의 수식으로 통합 필요

- **통합된 손실 함수**

$$c(H(x), y) = -y \log(H(x)) - (1 - y) \log(1 - H(x))$$

### 5.1 통합 함수의 원리

- **y = 1일 때**
	- $c(H(x), 1) = -1 \cdot \log(H(x)) - (1 - 1) \cdot \log(1 - H(x))$
	- $= -\log(H(x)) - 0$
	- $= -\log(H(x))$ ✓

- **y = 0일 때**
	- $c(H(x), 0) = -0 \cdot \log(H(x)) - (1 - 0) \cdot \log(1 - H(x))$
	- $= 0 - \log(1 - H(x))$
	- $= -\log(1 - H(x))$ ✓

### 5.2 최종 Cost 함수

$$\text{Cost}(W, b) = -\frac{1}{m}\sum_{i=1}^{m}\left[y^{(i)} \log(H(x^{(i)})) + (1 - y^{(i)}) \log(1 - H(x^{(i)}))\right]$$

- **수식 구성 요소**
	- m: 학습 샘플 개수
	- $y^{(i)}$: i번째 샘플의 실제 레이블 (0 또는 1)
	- $H(x^{(i)})$: i번째 샘플의 예측 확률
	- $-\frac{1}{m}$: 평균을 구하기 위한 계수 (음수는 최대화를 최소화로 전환)

***
## 6. Binary Cross-Entropy

- **이진 교차 엔트로피 (Binary Cross-Entropy)**
	- 로지스틱 회귀의 Cost 함수는 Binary Cross-Entropy Loss라고도 불림
	- 정보 이론의 엔트로피 개념에서 유래

$$\text{BCE}(y, \hat{y}) = -\frac{1}{m}\sum_{i=1}^{m}\left[y^{(i)} \log(\hat{y}^{(i)}) + (1 - y^{(i)}) \log(1 - \hat{y}^{(i)})\right]$$

- **Cross-Entropy의 의미**
	- 두 확률 분포 간의 차이를 측정
	- 예측 분포가 실제 분포와 얼마나 다른지 정량화
	- 값이 작을수록 두 분포가 유사

***
## 7. 경사 하강법 적용

- **최적화 목표**
	- Cost 함수를 최소화하는 W, b 찾기
	- 경사 하강법 (Gradient Descent) 사용

- **파라미터 업데이트**

$$W := W - \alpha \frac{\partial \text{Cost}(W, b)}{\partial W}$$

$$b := b - \alpha \frac{\partial \text{Cost}(W, b)}{\partial b}$$

- **학습 과정**
	1. 초기 파라미터 W, b 설정
	2. 순전파: $H(X) = \sigma(WX + b)$ 계산
	3. 손실 계산: $\text{Cost}(W, b)$ 계산
	4. 역전파: $\frac{\partial \text{Cost}}{\partial W}$, $\frac{\partial \text{Cost}}{\partial b}$ 계산
	5. 파라미터 업데이트
	6. 수렴할 때까지 2-5 반복

***
## 8. PyTorch 구현

- **Binary Cross-Entropy Loss**

```python
import torch
import torch.nn as nn

# 모델 정의
model = nn.Sequential(
    nn.Linear(input_dim, 1),  # 선형 변환
    nn.Sigmoid()              # Sigmoid 활성화
)

# 손실 함수
criterion = nn.BCELoss()  # Binary Cross-Entropy Loss

# 옵티마이저
optimizer = torch.optim.SGD(model.parameters(), lr=0.01)

# 학습 루프
for epoch in range(1000):
    # 순전파
    y_pred = model(X)

    # 손실 계산
    loss = criterion(y_pred, y_true)

    # 역전파
    optimizer.zero_grad()
    loss.backward()

    # 파라미터 업데이트
    optimizer.step()
```

- **BCEWithLogitsLoss (권장)**
	- Sigmoid + BCELoss를 한 번에 수행
	- 수치적 안정성 향상

```python
# 모델 정의 (Sigmoid 없음)
model = nn.Linear(input_dim, 1)

# 손실 함수 (Sigmoid 포함)
criterion = nn.BCEWithLogitsLoss()

# 사용 방법은 동일
y_pred = model(X)  # Sigmoid 거치지 않은 logits
loss = criterion(y_pred, y_true)
```

***
## 9. 예측 및 결정 경계

- **확률을 클래스로 변환**

```python
# 예측 확률
y_prob = model(X)  # 0~1 사이의 값

# 클래스 결정 (임계값 0.5)
y_pred = (y_prob >= 0.5).float()
# 0.5 이상이면 클래스 1, 미만이면 클래스 0
```

- **임계값 조정**
	- 기본 임계값: 0.5
	- 상황에 따라 조정 가능
		- 정밀도 중요 → 임계값 높임 (0.7, 0.8 등)
		- 재현율 중요 → 임계값 낮춤 (0.3, 0.4 등)

***
## 10. MSE vs Cross-Entropy 비교

| 구분 | MSE (Mean Squared Error) | Cross-Entropy |
|------|-------------------------|---------------|
| **수식** | $\frac{1}{m}\sum(H(x) - y)^2$ | $-\frac{1}{m}\sum[y\log(H(x)) + (1-y)\log(1-H(x))]$ |
| **적용 분야** | 선형 회귀 (회귀 문제) | 로지스틱 회귀 (분류 문제) |
| **Cost 함수 형태** | Sigmoid와 함께 사용 시 non-convex | Convex (볼록) |
| **최적화** | Local minimum 위험 | Global minimum 보장 |
| **출력 범위** | 실수 전체 | 0~1 (확률) |
| **사용 상황** | 연속된 값 예측 | 이진 분류 |

***
## 11. 핵심 정리

- **로지스틱 회귀의 특징**
	- Sigmoid 함수를 사용하여 0~1 사이의 확률 출력
	- 이진 분류 문제에 적합
	- 선형 결정 경계 (Linear Decision Boundary)

- **Cost 함수 설계 원리**
	- MSE는 Sigmoid와 함께 사용 시 non-convex
	- 로그 손실 함수를 사용하여 convex 형태 만듦
	- Binary Cross-Entropy = 로그 손실 함수

- **수식 요약**
	- 가설 함수: $H(X) = \sigma(WX + b) = \frac{1}{1 + e^{-(WX + b)}}$
	- Cost 함수: $\text{Cost}(W, b) = -\frac{1}{m}\sum[y\log(H(x)) + (1-y)\log(1-H(x))]$
	- 최적화: 경사 하강법으로 Cost 최소화

- **실전 사용**
	- PyTorch: `nn.BCELoss()` 또는 `nn.BCEWithLogitsLoss()`
	- TensorFlow: `tf.keras.losses.BinaryCrossentropy()`
	- 임계값 조정으로 정밀도-재현율 트레이드오프 조절

***
## 12. 왜 로그를 사용하는가? (심화)

- **수학적 이유**
	1. **지수 함수 상쇄**
		- Sigmoid: $\sigma(z) = \frac{1}{1 + e^{-z}}$
		- 로그를 취하면 지수 부분이 선형으로 변환
		- 미분이 간단해짐

	2. **Convex 함수 생성**
		- $-\log(x)$는 (0, 1)에서 convex
		- Cost 함수 전체가 convex가 되어 최적화 용이

	3. **정보 이론적 의미**
		- 엔트로피: 불확실성의 측정
		- Cross-Entropy: 예측 분포와 실제 분포의 차이
		- 정보량을 로그로 표현하는 것이 자연스러움

- **직관적 이해**
	- 예측이 맞으면 (H(x) = y) → 손실 0
	- 예측이 틀리면 → 손실 증가
	- 확신 있게 틀리면 → 손실 무한대로 폭증
	- 올바른 방향으로 학습하도록 강하게 유도