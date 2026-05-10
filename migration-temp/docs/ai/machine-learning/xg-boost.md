---
title: XGBoost (eXtreme Gradient Boosting)
slug: xg-boost
category: ai/machine-learning
summary: XGBoost의 정규화된 목적 함수, 2차 테일러 전개, Similarity Score와 Gain, γ·λ 정규화, Gradient Boosting과의 차이
tags: [ai, ml, xgboost, boosting, regularization, similarity-score, gain]
sort_order: 10
created: 2025-04-19
updated: 2026-05-10
---

XGBoost는 Gradient Boosting을 기반으로 **정규화된 목적 함수**와 **최적화된 Tree 분할 기준**을 도입해 성능과 일반화를 동시에 향상시킨 앙상블 알고리즘.

***

## 1. Gradient Boosting → XGBoost

### 1.1 Gradient Boosting 복습

**Gradient Boosting의 핵심 흐름**:

```
1. 초기 예측 (F₀ = 평균값)
   ↓
2. Residual 계산 (r = 실제값 - 예측값)
   ↓
3. Tree로 Residual 학습
   ↓
4. 예측 업데이트 (F₁ = F₀ + η × Tree)
   ↓
5. 반복
```

### 1.2 Gradient Boosting의 한계

| 한계 | 설명 |
|------|------|
| 과적합 위험 | 손실만 줄이려 하면 훈련 데이터에 과하게 맞춤 |
| 분할 기준 | Gini Index, IG는 손실 함수와 직접적인 연결 없음 |
| 정규화 부재 | Tree 복잡도를 제어하는 명시적 메커니즘 없음 |

### 1.3 XGBoost의 핵심 개선점

**"손실도 줄이고, 모델도 단순하게"**

1. **목적 함수에 정규화 항 추가** → 과적합 방지
2. **Similarity Score / Gain** → 손실 함수 기반 분할 기준
3. **γ, λ 파라미터** → Tree 복잡도 직접 제어

***

## 2. 목적 함수 (Objective Function)

### 2.1 목적 함수란?

**목적 함수 = 모델이 최소화하려는 기준**

모델에게 "너의 점수는 이걸로 매길 거야"라고 알려주는 식. 모델은 이 점수를 최대한 낮추려고 학습함.

### 2.2 일반 Gradient Boosting의 목적 함수

$$Obj = \sum_{i=1}^{N} L(y_i, \hat{y}_i)$$

- 손실 함수만 존재
- "틀린 거 줄여!" → 훈련 데이터에 과하게 맞춤 → 과적합

### 2.3 XGBoost의 목적 함수

$$Obj = \underbrace{\sum_{i=1}^{N} L(y_i, \hat{y}_i)}_{\text{손실: 얼마나 틀렸나}} + \underbrace{\Omega(T)}_{\text{정규화: 모델이 얼마나 복잡한가}}$$

- **손실 항**: 예측이 얼마나 틀렸는지 (MSE, Log Loss 등)
- **정규화 항**: 모델이 얼마나 복잡한지에 대한 벌점

**핵심**: 예측을 잘 하면서도 최대한 단순한 Tree를 만들려고 함.

***

## 3. 정규화 항 Ω(T)

### 3.1 정규화 항의 구성

$$\Omega(T) = \gamma \cdot T + \frac{1}{2}\lambda \sum_{j=1}^{T} w_j^2$$

여기서:
- $T$: Leaf 노드의 개수
- $w_j$: 각 Leaf의 출력값 (예측 보정값)
- $\gamma$ (gamma): Leaf 추가 비용
- $\lambda$ (lambda): Leaf 출력값에 대한 L2 정규화 강도

### 3.2 γ (gamma)의 역할: Leaf 개수 제어

$$\gamma \cdot T$$

- Leaf가 많다 = Tree가 복잡하다 → 벌점 부여
- γ가 클수록 Leaf 추가 비용이 커짐 → Tree가 단순해짐
- **가지치기(Pruning) 효과**

| γ 값 | 효과 |
|------|------|
| γ = 0 | 벌점 없음, Leaf 자유롭게 추가 |
| γ 작음 | 약한 가지치기 |
| γ 큼 | 강한 가지치기, 확실한 분할만 허용 |

### 3.3 λ (lambda)의 역할: Leaf 출력값 억제

$$\frac{1}{2}\lambda \sum_{j=1}^{T} w_j^2$$

- Leaf의 출력값(w)이 극단적으로 커지는 것을 억제
- **L2 Regularization과 동일한 원리**
    - 신경망에서: $\lambda \sum w^2$ → 뉴런의 가중치 억제
    - XGBoost에서: $\lambda \sum w_j^2$ → Leaf 출력값 억제

**왜 Leaf 출력값이 크면 안 되는가?**:
- Leaf 출력값이 크다 = "이 방향으로 확 보정해!"
- 한 번에 너무 크게 보정 → 훈련 데이터의 노이즈까지 학습 → 과적합
- Learning Rate가 너무 클 때 발산하는 것과 같은 원리

| λ 값 | 효과 |
|------|------|
| λ = 0 | 정규화 없음, 출력값 제한 없음 |
| λ 작음 | 약한 억제 |
| λ 큼 | 강한 억제, 보수적인 예측 |

***

## 4. 2차 테일러 전개와 최적화

### 4.1 손실 함수의 근사

XGBoost는 손실 함수를 **2차 테일러 전개**로 근사함.

각 샘플에 대해:
- $g_i$ (1차 미분, Gradient): 손실 함수의 1차 도함수
- $h_i$ (2차 미분, Hessian): 손실 함수의 2차 도함수

**MSE 손실 함수의 경우**:

$$L = \frac{1}{2}(y - \hat{y})^2$$

| 값 | 수식 | MSE에서의 값 |
|----|------|-------------|
| $g_i$ (Gradient) | $\frac{\partial L}{\partial \hat{y}}$ | $-(y_i - F(x_i))$ = -Residual |
| $h_i$ (Hessian) | $\frac{\partial^2 L}{\partial \hat{y}^2}$ | 1 (상수) |

### 4.2 Leaf의 최적 출력값 유도

하나의 Leaf에 속한 샘플들에 대해 목적 함수를 최소화하면:

$$w_j^* = -\frac{\sum_{i \in leaf} g_i}{\sum_{i \in leaf} h_i + \lambda}$$

**MSE의 경우** ($g_i = -Residual$, $h_i = 1$):

$$w_j^* = \frac{\sum_{i \in leaf} Residual_i}{N_{leaf} + \lambda}$$

- 분자: Residual의 합 (같은 방향이면 커짐)
- 분모: 샘플 수 + λ (정규화로 출력값 억제)

***

## 5. Similarity Score

### 5.1 정의

$$Similarity = \frac{(\sum_{i \in node} Residual_i)^2}{N + \lambda}$$

- $N$: 해당 노드의 샘플 개수
- $\lambda$: 정규화 파라미터

### 5.2 직관적 의미

**"이 노드의 Residual들이 같은 방향으로 쏠려 있는가?"**

- Residual이 같은 방향 → 합이 큼 → Similarity 높음 → 좋은 노드
- Residual이 반대 방향으로 섞임 → 합이 작음 → Similarity 낮음 → 나쁜 노드

**주의**: 각각 제곱 후 합산(MSE 방식)이 아님

| 방식 | 의미 | 예시 [+5, -15, +15, -5] |
|------|------|------------------------|
| $\sum r_i^2$ | 개별 오차 크기 | $25+225+225+25 = 500$ |
| $(\sum r_i)^2$ | 방향 일관성 | $(0)^2 = 0$ |

Similarity Score는 손실을 측정하는 게 아니라 **방향의 일관성**을 측정함. Decision Tree의 Gini Index에서 "한쪽으로 쏠리면 좋은 분할"과 같은 원리.

### 5.3 λ의 효과

$$Similarity = \frac{(\sum Residual)^2}{N + \lambda}$$

- λ가 커지면 → 분모가 커짐 → Similarity가 작아짐 → 분할 효과 감소
- **소수의 샘플로 이루어진 노드의 Similarity를 억제**
- 노이즈에 의한 분할 방지

### 5.4 계산 예시

**노드에 Residual = [+5, +15]가 있고, λ = 1일 때**:

$$Similarity = \frac{(5 + 15)^2}{2 + 1} = \frac{400}{3} \approx 133.3$$

같은 방향(양수)으로 쏠려 있으므로 Similarity가 높다.

**노드에 Residual = [+5, -15, +15, -5]가 있고, λ = 1일 때**:

$$Similarity = \frac{(5 + (-15) + 15 + (-5))^2}{4 + 1} = \frac{0}{5} = 0$$

양수/음수가 섞여 있어서 Similarity가 0이다. → 이 노드는 분할이 필요하다.

***

## 6. Gain (분할 기준)

### 6.1 정의

$$Gain = Similarity_{Left} + Similarity_{Right} - Similarity_{Parent} - \gamma$$

- **분할 후 Similarity 합** - **분할 전 Similarity** - **Leaf 추가 비용(γ)**
- **Gain > 0**: 분할할 가치가 있다
- **Gain ≤ 0**: 분할하지 않는다 (가지치기)

### 6.2 γ의 역할

- γ = 0: 벌점 없음 → 작은 개선이라도 분할
- γ가 큼: 높은 벌점 → 확실하게 좋은 분할만 허용

**가지치기(Pruning) 효과**:

| Gain 값 | γ = 0 | γ = 300 |
|---------|-------|---------|
| 266.7 | 분할 O | 분할 X (266.7 - 300 < 0) |
| 500.0 | 분할 O | 분할 O (500.0 - 300 > 0) |

### 6.3 계산 예시

**분할 전**: Residual = [+5, -15, +15, -5], λ = 1

$$Similarity_{Parent} = \frac{0^2}{4+1} = 0$$

**Height ≤ 165로 분할 후**:
- 왼쪽 (Height ≤ 165): Residual = [-15, -5]
- 오른쪽 (Height > 165): Residual = [+5, +15]

$$Similarity_{Left} = \frac{(-20)^2}{2+1} = \frac{400}{3} \approx 133.3$$

$$Similarity_{Right} = \frac{(20)^2}{2+1} = \frac{400}{3} \approx 133.3$$

**Gain (γ = 0)**:

$$Gain = 133.3 + 133.3 - 0 - 0 = 266.7 > 0 \quad → \text{분할 O}$$

**Gain (γ = 300)**:

$$Gain = 133.3 + 133.3 - 0 - 300 = -33.3 < 0 \quad → \text{분할 X}$$

***

## 7. XGBoost의 Tree 구축 과정

### 7.1 전체 흐름

```
1. 초기 예측 (F₀ = 평균값)
   ↓
2. Residual 계산
   ↓
3. Tree 구축
   - 모든 (Feature, Threshold) 조합에 대해 Gain 계산
   - Gain이 가장 큰 분할 선택
   - Gain ≤ 0이면 분할 중단 (가지치기)
   ↓
4. Leaf 출력값 계산
   - w = Σ Residual / (N + λ)
   ↓
5. 예측 업데이트
   - F₁(x) = F₀(x) + η × w
   ↓
6. 반복 (2~5)
```

### 7.2 분할 기준 비교: 일반 Decision Tree vs XGBoost

| 항목 | Decision Tree | XGBoost |
|------|--------------|---------|
| 분할 기준 | Gini Index / Information Gain | **Similarity Score / Gain** |
| 최적화 대상 | 불순도 감소 | **목적 함수 감소** |
| 정규화 | 없음 (max_depth로 간접 제어) | **γ, λ로 직접 제어** |
| Leaf 출력값 | 클래스 비율 / Residual 평균 | **정규화된 최적값** |

***

## 8. Gradient Boosting vs XGBoost 비교

### 8.1 비교표

| 특성 | Gradient Boosting | XGBoost |
|------|-------------------|---------|
| 목적 함수 | 손실 함수만 | 손실 + **정규화** |
| Tree 분할 기준 | Gini / IG | **Similarity Score / Gain** |
| 정규화 | 없음 | **γ (Leaf 수) + λ (출력값)** |
| Leaf 출력값 | Residual 평균 | **정규화된 최적값** |
| 가지치기 | 사전 (max_depth) | **사후 (Gain ≤ 0이면 제거)** |
| 테일러 전개 | 1차 (Gradient만) | **2차 (Gradient + Hessian)** |
| 병렬 처리 | 불가 | **Feature 단위 병렬화 가능** |

### 8.2 핵심 차이

**Gradient Boosting**: "Residual을 학습하는 Tree를 순차 추가"
**XGBoost**: "Residual을 학습하되, **정규화된 목적 함수를 최적화하는 Tree**를 순차 추가"

***

## 9. 하이퍼파라미터 정리

| 파라미터 | 설명 | 권장값 |
|----------|------|--------|
| `n_estimators` | Tree 개수 | 100~500 |
| `learning_rate` (η) | 학습률 | 0.01~0.1 |
| `max_depth` | Tree 최대 깊이 | 3~8 |
| `gamma` (γ) | Leaf 추가 최소 Gain | 0~5 |
| `lambda` (λ) | L2 정규화 강도 | 1~10 |
| `alpha` | L1 정규화 강도 | 0~1 |
| `subsample` | 샘플링 비율 | 0.8~1.0 |
| `colsample_bytree` | Feature 샘플링 비율 | 0.8~1.0 |

***

## 10. 핵심 요약

### 10.1 XGBoost = Gradient Boosting + 정규화 + 최적화된 분할

```
XGBoost = Gradient Boosting 기본 흐름
        + 정규화된 목적 함수 (γ, λ)
        + Similarity Score / Gain 기반 분할
        + 2차 테일러 전개 (Gradient + Hessian)
```

### 10.2 핵심 수식 모음

**목적 함수**:
$$Obj = \sum L(y_i, \hat{y}_i) + \gamma T + \frac{1}{2}\lambda \sum w_j^2$$

**Similarity Score** (회귀, MSE):
$$Similarity = \frac{(\sum Residual_i)^2}{N + \lambda}$$

**Gain**:
$$Gain = Similarity_{Left} + Similarity_{Right} - Similarity_{Parent} - \gamma$$

**Leaf 최적 출력값** (회귀, MSE):
$$w_j^* = \frac{\sum Residual_i}{N + \lambda}$$

### 10.3 정규화 파라미터의 역할

| 파라미터 | 대상 | 효과 |
|----------|------|------|
| γ (gamma) | Leaf 개수 | 불필요한 분할 방지 (가지치기) |
| λ (lambda) | Leaf 출력값 | 극단적 보정 억제 (L2 정규화) |
| η (learning rate) | Tree 기여도 | 각 Tree의 영향력 축소 |

### 10.4 핵심 포인트

**Similarity Score**:
- Residual의 방향 일관성을 측정
- 같은 방향으로 쏠릴수록 높음 → 좋은 노드

**Gain**:
- 분할의 가치를 판단
- Gain > 0이면 분할, ≤ 0이면 가지치기

**목적 함수**:
- 손실(얼마나 틀렸나) + 정규화(얼마나 복잡한가)
- 예측 성능과 일반화를 동시에 추구