---
title: Gradient Boosting
slug: gradient-boost
category: ai/machine-learning
summary: Gradient Boosting 회귀, 초기 예측-Residual-Tree 학습-업데이트 흐름, Pseudo Residual, Learning Rate, AdaBoost와의 차이
tags: [ai, ml, gradient-boosting, boosting, residual, regression, learning-rate]
sort_order: 8
created: 2025-04-19
updated: 2026-05-10
---

Gradient Boosting은 약한 학습기(Weak Learner)를 순차적으로 결합해 강한 학습기를 만드는 **부스팅 앙상블 알고리즘**. AdaBoost와 유사하지만, 이전 모델의 **잔차(Residual)** 를 학습해 예측 성능을 점진적으로 향상시킴.

***

## 1. Gradient Boosting의 기본 개념

### 1.1 AdaBoost vs Gradient Boosting

**공통점**:
- 둘 다 부스팅(Boosting) 기반 앙상블 학습
- 이전 모델의 오류를 기반으로 다음 모델 학습
- 순차적 학습 방식

**차이점**:

| 특성 | AdaBoost | Gradient Boosting |
|------|----------|-------------------|
| 기본 모델 | Stump (깊이 1) | Tree (깊이 8~32) |
| 학습 대상 | 틀린 샘플에 가중치 부여 | **Residual (잔차) 학습** |
| 사용 목적 | 주로 분류 | **회귀 + 분류** 모두 가능 |
| 손실 함수 | 지수 손실 | **일반 손실 함수** (MSE, Log Loss 등) |

### 1.2 Gradient Boosting의 핵심 아이디어

**"이전 모델의 오류를 다음 모델이 보완한다"**

1. **초기 예측**: 단순한 값으로 시작 (평균값)
2. **Residual 계산**: 실제값 - 예측값
3. **Residual 학습**: 새로운 Tree로 Residual 예측
4. **예측 업데이트**: 이전 예측 + Learning Rate × 새 예측
5. **반복**: Residual이 충분히 작아질 때까지 2~4 반복

***

## 2. Gradient Boosting for Regression

### 2.1 문제 설정

**목표**: Height, Favorite Color, Gender로 Weight 예측

**데이터 예시**:

```
| Height | Color | Gender | Weight (실제) |
|--------|-------|--------|---------------|
| 170    | Blue  | M      | 88.0          |
| 165    | Red   | F      | 76.0          |
| 180    | Blue  | M      | 95.0          |
| 160    | Green | F      | 72.0          |
```

**주의**: 선형 회귀(Linear Regression)와는 다른 방법임

***

## 3. Gradient Boosting 알고리즘

### 3.1 전체 과정 요약

```
1. 초기 예측 (F₀)
   - 모든 샘플에 대해 평균값으로 예측
   ↓
2. Residual 계산
   - Residual = Observed - Predicted
   ↓
3. Tree 생성
   - Residual을 타겟으로 새로운 Tree 학습
   - 보통 8~32개 Leaf 사용
   ↓
4. 예측 업데이트
   - New Prediction = Old Prediction + Learning Rate × Tree Prediction
   ↓
5. 반복
   - 2~4 과정을 반복 (Tree가 개선을 멈출 때까지)
   ↓
6. 최종 모델
   - F(x) = F₀(x) + η·h₁(x) + η·h₂(x) + ... + η·hₙ(x)
```

### 3.2 Step 1: 초기 예측 (Initial Prediction)

**첫 번째 모델: Single Leaf**

- 가장 단순한 형태: 노드 1개 (Leaf만 존재)
- 모든 데이터에 대해 동일한 값 예측

**초기값 계산**:

$$F_0(x) = \bar{y} = \frac{1}{N} \sum_{i=1}^{N} y_i$$

**예시**:

```
Weight 데이터: [88.0, 76.0, 95.0, 72.0]

초기 예측 F₀ = (88.0 + 76.0 + 95.0 + 72.0) / 4 = 82.75

모든 샘플의 예측값 = 82.75
```

### 3.3 Step 2: Residual 계산

**Residual (잔차)**: 실제값과 예측값의 차이

$$r_i = y_i - F_0(x_i)$$

**예시**:

```
| Height | Weight (y) | 예측 (F₀) | Residual (r) |
|--------|-----------|-----------|--------------|
| 170    | 88.0      | 82.75     | +5.25        |
| 165    | 76.0      | 82.75     | -6.75        |
| 180    | 95.0      | 82.75     | +12.25       |
| 160    | 72.0      | 82.75     | -10.75       |
```

**Residual의 의미**:
- 양수(+): 과소 예측 (실제가 더 큼)
- 음수(-): 과대 예측 (실제가 더 작음)

### 3.4 Step 3: Tree로 Residual 학습

**목표**: Residual을 타겟으로 새로운 Tree 학습

**Tree 구조**:
- Stump (깊이 1)이 아님
- 보통 **8~32개 Leaf** 사용
- 더 복잡한 패턴 학습 가능

**학습 과정**:

```
1. Feature 선택 (예: Height)
2. Residual을 기반으로 분할

   Height <= 167.5?
      /            \
   Yes             No
  (r=-6.75,      (r=+5.25,
   r=-10.75)      r=+12.25)
```

**Leaf 값 계산**:
- 같은 Leaf에 속한 샘플들의 **Residual 평균값**

```
Left Leaf:  (-6.75 + -10.75) / 2 = -8.75
Right Leaf: (+5.25 + +12.25) / 2 = +8.75
```

### 3.5 Step 4: 예측 업데이트

**새로운 예측값**:

$$F_1(x) = F_0(x) + \eta \cdot h_1(x)$$

여기서:
- $F_0(x)$: 이전 예측
- $h_1(x)$: 첫 번째 Tree의 예측 (Residual)
- $\eta$: Learning Rate (학습률)

**Learning Rate 없이 업데이트** (η = 1.0):

```
| Height | F₀    | Tree₁  | F₁ = F₀ + Tree₁ |
|--------|-------|--------|-----------------|
| 170    | 82.75 | +8.75  | 91.50           |
| 165    | 82.75 | -8.75  | 74.00           |
| 180    | 82.75 | +8.75  | 91.50           |
| 160    | 82.75 | -8.75  | 74.00           |
```

### 3.6 Step 5: 반복 학습

**두 번째 Residual 계산**:

```
| Height | y     | F₁    | Residual₂ |
|--------|-------|-------|-----------|
| 170    | 88.0  | 91.50 | -3.50     |
| 165    | 76.0  | 74.00 | +2.00     |
| 180    | 95.0  | 91.50 | +3.50     |
| 160    | 72.0  | 74.00 | -2.00     |
```

**두 번째 Tree 학습**:
- Residual₂를 타겟으로 새로운 Tree 학습
- 예측 업데이트: $F_2(x) = F_1(x) + \eta \cdot h_2(x)$

**반복 종료 조건**:
- 설정한 Tree 개수에 도달
- Residual이 충분히 작아짐
- 검증 오류가 증가하기 시작 (Early Stopping)

***

## 4. Pseudo Residual과 손실 함수

### 4.1 왜 Residual을 사용하는가?

**손실 함수 (MSE)**:

$$L = \frac{1}{2}(y - F(x))^2$$

**손실 함수의 미분 (Gradient)**:

$$\frac{\partial L}{\partial F(x)} = -(y - F(x)) = -r$$

여기서:
- $r = y - F(x)$: Residual
- 미분값 = -Residual

**Gradient Descent의 관점**:
- 손실 함수를 최소화하려면 **Gradient의 반대 방향**으로 이동
- Gradient = -Residual → 반대 방향 = +Residual
- 따라서 **Residual을 학습**하면 손실 최소화

### 4.2 Pseudo Residual

**일반적인 Residual**:

$$r_i = y_i - F(x_i)$$

**Pseudo Residual (일반화)**:

$$r_i = -\frac{\partial L(y_i, F(x_i))}{\partial F(x_i)}$$

**손실 함수에 따른 Pseudo Residual**:

| 손실 함수 | Pseudo Residual |
|-----------|----------------|
| MSE: $\frac{1}{2}(y-F)^2$ | $y - F$ |
| MAE: $\|y-F\|$ | $\text{sign}(y-F)$ |
| Log Loss | $y - \sigma(F)$ |

**의미**:
- Gradient Boosting은 **Gradient Descent**를 함수 공간에서 수행
- 각 Tree는 **Negative Gradient** 방향을 학습
- MSE의 경우: Negative Gradient = Residual

***

## 5. Learning Rate (학습률)

### 5.1 Learning Rate의 필요성

**문제점**: Residual을 그대로 사용하면 분산이 커짐

- Tree의 예측값이 과도하게 큼
- 과적합(Overfitting) 발생
- 새로운 데이터에 대한 성능 저하

### 5.2 Learning Rate 적용

**업데이트 규칙**:

$$F_m(x) = F_{m-1}(x) + \eta \cdot h_m(x)$$

여기서:
- $\eta$: Learning Rate (0 < η ≤ 1)
- 보통 0.01 ~ 0.3 사용

**효과**:
- 각 Tree의 기여도를 축소
- 더 많은 Tree 필요하지만 과적합 방지
- 일반화 성능 향상

### 5.3 예시 비교

**η = 1.0 (Learning Rate 없음)**:

```
F₀ = 82.75
F₁ = 82.75 + 1.0 × 8.75 = 91.50 (큰 변화)
→ 빠르지만 과적합 위험
```

**η = 0.1**:

```
F₀ = 82.75
F₁ = 82.75 + 0.1 × 8.75 = 83.625 (작은 변화)
F₂ = 83.625 + 0.1 × h₂(x)
...
→ 느리지만 안정적
```

### 5.4 Learning Rate vs Tree 개수

**트레이드오프**:

| Learning Rate | Tree 개수 | 학습 시간 | 성능 |
|---------------|-----------|-----------|------|
| 높음 (0.5~1.0) | 적음 (10~50) | 빠름 | 낮음 |
| 중간 (0.1~0.3) | 중간 (50~200) | 중간 | 좋음 |
| 낮음 (0.01~0.05) | 많음 (200~1000) | 느림 | **가장 좋음** |

***

## 6. 최종 예측 모델

### 6.1 최종 수식

**Gradient Boosting 모델**:

$$F(x) = F_0(x) + \sum_{m=1}^{M} \eta \cdot h_m(x)$$

여기서:
- $F_0(x)$: 초기 예측 (평균값)
- $h_m(x)$: m번째 Tree의 예측
- $M$: Tree 개수
- $\eta$: Learning Rate

### 6.2 예측 과정

**새로운 샘플 x에 대해**:

```
1. 초기값: F₀(x) = 평균값
2. Tree 1: F₁(x) = F₀(x) + η × h₁(x)
3. Tree 2: F₂(x) = F₁(x) + η × h₂(x)
...
M. Tree M: F(x) = F_{M-1}(x) + η × h_M(x)

최종 예측 = F(x)
```

### 6.3 예시

```
새로운 샘플: Height=175, Color=Blue, Gender=M

F₀(175) = 82.75                           (초기 평균)
h₁(175) = +8.75                           (Tree 1)
h₂(175) = +3.20                           (Tree 2)
h₃(175) = +1.50                           (Tree 3)
...

최종 예측 (η=0.1, M=100):
F(175) = 82.75 + 0.1×(8.75 + 3.20 + ... + h₁₀₀)
       ≈ 89.5
```

***

## 7. Gradient Boosting의 특성

### 7.1 장점

**1. 높은 정확도**:
- 순차적 학습으로 점진적 성능 향상
- Residual을 직접 학습하여 오류 최소화

**2. 유연성**:
- 다양한 손실 함수 사용 가능
- 분류, 회귀 모두 적용 가능

**3. Feature Importance**:
- 각 Feature의 중요도 계산 가능
- 해석 가능성

**4. 결측치 처리**:
- Tree 기반이므로 결측치에 강건

### 7.2 단점

**1. 학습 시간**:
- 순차적 학습으로 병렬화 어려움
- Tree 개수가 많으면 느림

**2. 과적합 위험**:
- Learning Rate가 높거나 Tree가 너무 많으면 과적합
- 조기 종료(Early Stopping) 필요

**3. 노이즈에 민감**:
- 이상치(Outlier)에 영향받을 수 있음

**4. 하이퍼파라미터 튜닝**:
- 여러 파라미터 조정 필요
- 최적값 찾기 어려움

***

## 8. Random Forest vs AdaBoost vs Gradient Boosting

### 8.1 비교표

| 특성 | Random Forest | AdaBoost | Gradient Boosting |
|------|---------------|----------|-------------------|
| 앙상블 방식 | Bagging | Boosting | Boosting |
| 기본 모델 | 완전한 Tree | Stump (깊이 1) | Tree (깊이 4~8) |
| 학습 방식 | 병렬 | 순차 | 순차 |
| 학습 대상 | 원본 데이터 | 샘플 가중치 | **Residual** |
| 손실 함수 | - | 지수 손실 | **일반 손실** |
| 투표 방식 | 균등/평균 | 가중 투표 | 가중 합 |
| 과적합 위험 | 낮음 | 중간 | 중간~높음 |
| 노이즈 강건성 | 높음 | 낮음 | 중간 |
| 학습 속도 | 빠름 (병렬) | 중간 | 느림 (순차) |

### 8.2 알고리즘 선택 가이드

**Random Forest**:
- 빠른 학습 필요
- 노이즈가 많은 데이터
- 해석 가능성 중요

**AdaBoost**:
- 이진 분류 문제
- 단순한 모델 선호
- 빠른 예측 필요

**Gradient Boosting**:
- 최고 성능 필요
- 회귀 문제
- 학습 시간 충분
- 하이퍼파라미터 튜닝 가능

***

## 9. 구현 예시 (Scikit-learn)

### 9.1 기본 사용법

```python
from sklearn.ensemble import GradientBoostingRegressor, GradientBoostingClassifier

# 회귀
model = GradientBoostingRegressor(
    n_estimators=100,       # Tree 개수
    learning_rate=0.1,      # Learning Rate
    max_depth=3,            # Tree 깊이
    min_samples_split=2,    # 분할 최소 샘플
    min_samples_leaf=1,     # Leaf 최소 샘플
    subsample=1.0,          # 샘플 비율
    loss='squared_error'    # 손실 함수
)

# 학습
model.fit(X_train, y_train)

# 예측
predictions = model.predict(X_test)

# Feature Importance
importances = model.feature_importances_
```

### 9.2 분류 문제

```python
# 이진 분류
model = GradientBoostingClassifier(
    n_estimators=100,
    learning_rate=0.1,
    max_depth=3,
    loss='log_loss'         # Log Loss (Binary Cross-Entropy)
)

model.fit(X_train, y_train)
predictions = model.predict(X_test)
probabilities = model.predict_proba(X_test)
```

### 9.3 하이퍼파라미터

| 파라미터 | 설명 | 권장값 |
|----------|------|--------|
| `n_estimators` | Tree 개수 | 100~500 |
| `learning_rate` | Learning Rate (η) | 0.01~0.1 |
| `max_depth` | Tree 최대 깊이 | 3~8 |
| `min_samples_split` | 분할 최소 샘플 수 | 2~10 |
| `subsample` | 샘플링 비율 | 0.8~1.0 |
| `loss` | 손실 함수 | 'squared_error', 'log_loss' |

***

## 10. 핵심 요약

### 10.1 Gradient Boosting의 핵심 아이디어

1. **초기 예측**: 평균값으로 시작
2. **Residual 계산**: 실제값 - 예측값
3. **Tree 학습**: Residual을 타겟으로 학습
4. **예측 업데이트**: 이전 예측 + Learning Rate × 새 예측
5. **반복**: 성능 향상이 멈출 때까지 반복

### 10.2 핵심 수식

**최종 모델**:
$$F(x) = F_0(x) + \sum_{m=1}^{M} \eta \cdot h_m(x)$$

**Residual (MSE)**:
$$r_i = y_i - F_{m-1}(x_i)$$

**Pseudo Residual (일반)**:
$$r_i = -\frac{\partial L(y_i, F(x_i))}{\partial F(x_i)}$$

### 10.3 알고리즘 요약

```
Gradient Boosting = Residual Learning + Sequential Trees + Learning Rate

목적: 이전 모델의 오류를 순차적으로 보완
방법: Residual을 학습하는 Tree를 반복적으로 추가
결과: 점진적 성능 향상 + 높은 예측 정확도
```

### 10.4 핵심 포인트

**AdaBoost와의 차이**:
- AdaBoost: 샘플 가중치 조정
- Gradient Boosting: **Residual 직접 학습**

**학습 대상**:
- 처음: 실제값 (y)
- 이후: Residual (y - F(x))

**Learning Rate의 역할**:
- 과적합 방지
- 안정적인 학습
- 일반화 성능 향상
