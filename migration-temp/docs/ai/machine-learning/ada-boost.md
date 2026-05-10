---
title: AdaBoost (Adaptive Boosting)
slug: ada-boost
category: ai/machine-learning
summary: Stump 기반 Weak Learner의 부스팅, 가중치 기반 Gini, Amount of Say, 지수 손실 함수, 가중치 업데이트, SAMME/SAMME.R
tags: [ai, ml, adaboost, boosting, stump, weak-learner, ensemble]
sort_order: 7
created: 2025-04-19
updated: 2026-05-10
---

AdaBoost는 약한 학습기(Weak Learner)를 순차적으로 결합해 강한 학습기를 만드는 **부스팅(Boosting) 앙상블 알고리즘**. 이전 모델의 오류에 가중치를 부여해 다음 모델이 집중적으로 학습하게 함.

***

## 1. AdaBoost의 기본 개념

### 1.1 Stump (스텀프)

**Stump**: 노드 1개 + Leaf 2개로 구성된 가장 단순한 Decision Tree

```
     [Feature <= threshold?]
        /              \
    [Class A]      [Class B]
```

**특징**:
- 단 하나의 Feature만 사용
- 깊이가 1인 Decision Tree
- **Weak Learner** (약한 학습기)
- 혼자서는 정확한 분류 어려움 (정확도 ≈ 50~60%)

### 1.2 Forest of Stumps

**AdaBoost = Forest of Stumps**

- Random Forest: 완전한 크기의 Tree들 (max_depth 제한 없음)
- AdaBoost: Stump들의 Forest (깊이 1로 고정)

**왜 Stump를 사용하는가?**
- 단순한 모델로 과적합 방지
- 빠른 학습 속도
- 여러 Stump를 결합하여 복잡한 패턴 학습

***

## 2. Random Forest vs AdaBoost

### 2.1 주요 차이점

| 특성 | Random Forest | AdaBoost |
|------|---------------|----------|
| 기본 모델 | 완전한 Tree | Stump (깊이 1) |
| Tree 간 관계 | **독립적** | **순차적** (이전 오류가 다음에 영향) |
| 투표 가중치 | 모든 Tree 동일 | **Stump마다 다름** (성능에 따라) |
| 학습 방식 | 병렬 학습 가능 | 순차 학습 필수 |
| 샘플 가중치 | 없음 (Bootstrap만) | **동적 조정** (오류에 따라) |

### 2.2 AdaBoost의 특징

**1. 가중 투표 (Weighted Voting)**:
- 성능이 좋은 Stump → 더 큰 발언권
- 성능이 나쁜 Stump → 적은 발언권

**2. 순차적 학습 (Sequential Learning)**:
- Stump 1의 오류 → Stump 2가 집중 학습
- Stump 2의 오류 → Stump 3이 집중 학습
- 순서가 중요함

**3. 적응적 샘플링 (Adaptive Sampling)**:
- 틀린 샘플의 가중치 증가
- 맞은 샘플의 가중치 감소
- 어려운 샘플에 집중

***

## 3. Weak Learner (약한 학습기)

### 3.1 정의

**Weak Learner**: 랜덤보다 약간 나은 성능을 가진 모델

- 정확도: 50% < accuracy < 100%
- Stump는 대표적인 Weak Learner

### 3.2 Weak Learner의 장점

**"약한 학습기를 많이 결합하면 강한 학습기가 된다"**

- 개별 Stump: 정확도 55%
- 100개 Stump 결합: 정확도 95%

**부스팅의 핵심**:
- 각 Weak Learner는 이전 모델이 틀린 부분에 집중
- 점진적으로 성능 향상
- 최종적으로 Strong Learner 생성

***

## 4. AdaBoost 알고리즘

### 4.1 전체 과정 요약

```
1. 모든 샘플에 동일한 가중치 부여 (1/n)
   ↓
2. 첫 번째 Stump 생성 (Gini Index 최소)
   ↓
3. Amount of Say 계산 (α)
   ↓
4. 샘플 가중치 업데이트
   - 틀린 샘플: 가중치 증가
   - 맞은 샘플: 가중치 감소
   ↓
5. 가중치 정규화 (총합 = 1)
   ↓
6. 가중치 기반 Gini Index로 다음 Stump 선택
   ↓
7. 2~6 반복 (N개 Stump)
   ↓
8. 모든 Stump의 가중 투표로 최종 예측
```

### 4.2 초기화

**데이터셋 준비**:
- N개의 샘플: $(x_1, y_1), (x_2, y_2), ..., (x_N, y_N)$
- $y_i \in \{-1, +1\}$ (이진 분류)

**샘플 가중치 초기화**:

$$w_i^{(1)} = \frac{1}{N}, \quad i = 1, 2, ..., N$$

- 모든 샘플에 동일한 중요도 부여
- 가중치 총합: $\sum_{i=1}^{N} w_i^{(1)} = 1$

***

## 5. Stump 생성

### 5.1 첫 번째 Stump 선택

**목표**: 가중치를 고려한 Gini Index가 가장 낮은 Feature 선택

**각 Feature에 대해**:
1. 모든 가능한 threshold 시도
2. Gini Index 계산
3. 가장 낮은 Gini Index를 가진 (Feature, threshold) 선택

### 5.2 가중치 기반 Gini Index

**일반 Gini Index** (샘플 개수 기반):

$$Gini = 1 - p_+^2 - p_-^2$$

**가중치 기반 Gini Index**:

$$Gini_{weighted} = 1 - \left(\frac{\sum w_i \cdot \mathbb{1}_{y_i=+1}}{\sum w_i}\right)^2 - \left(\frac{\sum w_i \cdot \mathbb{1}_{y_i=-1}}{\sum w_i}\right)^2$$

**차이점**:
- 샘플 개수 대신 **가중치 합**으로 비율 계산
- 가중치가 높은 샘플이 더 큰 영향

### 5.3 예시

```
3개 샘플, Feature X1 <= 0.5로 분할

샘플 1: X1=0.3, y=+1, w=0.5  → Left
샘플 2: X1=0.7, y=-1, w=0.3  → Right
샘플 3: X1=0.8, y=-1, w=0.2  → Right

Left Node:
- 가중치 합: 0.5
- P(+1) = 0.5/0.5 = 1.0
- P(-1) = 0/0.5 = 0.0
- Gini = 1 - 1² - 0² = 0 (순수)

Right Node:
- 가중치 합: 0.5
- P(+1) = 0/0.5 = 0.0
- P(-1) = 0.5/0.5 = 1.0
- Gini = 1 - 0² - 1² = 0 (순수)

→ 완벽한 분할!
```

***

## 6. Amount of Say (분류기 가중치)

### 6.1 정의

**Amount of Say (α)**: 각 Stump가 최종 예측에 미치는 영향력

$$\alpha = \frac{1}{2} \ln\left(\frac{1 - \epsilon}{\epsilon}\right)$$

여기서:
- $\epsilon$: Total Error (전체 오류율)
- $\epsilon = \sum_{i \in \text{incorrect}} w_i$ (틀린 샘플의 가중치 합)

### 6.2 Total Error 계산

**예시**:

```
5개 샘플, 각 가중치 0.2

Stump 예측 결과:
샘플 1: 예측 +1, 실제 +1 → 맞음
샘플 2: 예측 +1, 실제 -1 → 틀림 (w=0.2)
샘플 3: 예측 -1, 실제 -1 → 맞음
샘플 4: 예측 +1, 실제 +1 → 맞음
샘플 5: 예측 +1, 실제 -1 → 틀림 (w=0.2)

Total Error (ε) = 0.2 + 0.2 = 0.4
```

### 6.3 Amount of Say 계산 예시

**Case 1: 좋은 Stump (ε = 0.1)**

$$\alpha = \frac{1}{2} \ln\left(\frac{1-0.1}{0.1}\right) = \frac{1}{2} \ln(9) \approx 1.1$$

→ 큰 발언권

**Case 2: 나쁜 Stump (ε = 0.4)**

$$\alpha = \frac{1}{2} \ln\left(\frac{1-0.4}{0.4}\right) = \frac{1}{2} \ln(1.5) \approx 0.2$$

→ 작은 발언권

**Case 3: 랜덤 수준 (ε = 0.5)**

$$\alpha = \frac{1}{2} \ln\left(\frac{1-0.5}{0.5}\right) = \frac{1}{2} \ln(1) = 0$$

→ 발언권 없음

**그래프**:

```
α
  |
2 |                    *
  |                  *
1 |              *
  |          *
0 |______*________________
  0    0.5              1.0   ε
      랜덤        완벽
```

***

## 7. 지수 손실 함수 (Exponential Loss)

### 7.1 손실 함수 정의

**AdaBoost의 손실 함수**:

$$L = \sum_{i=1}^{N} w_i \cdot e^{-y_i \cdot \alpha \cdot h(x_i)}$$

여기서:
- $w_i$: 샘플 i의 가중치
- $y_i$: 실제 레이블 (-1 or +1)
- $\alpha$: Amount of Say
- $h(x_i)$: Stump의 예측 (-1 or +1)

### 7.2 손실 함수의 의미

**$y_i \cdot h(x_i)$의 값**:

| 상황 | $y_i$ | $h(x_i)$ | $y_i \cdot h(x_i)$ | 결과 |
|------|-------|----------|-------------------|------|
| 맞음 | +1 | +1 | +1 | $e^{-\alpha}$ (작음) |
| 맞음 | -1 | -1 | +1 | $e^{-\alpha}$ (작음) |
| 틀림 | +1 | -1 | -1 | $e^{+\alpha}$ (큼) |
| 틀림 | -1 | +1 | -1 | $e^{+\alpha}$ (큼) |

**특징**:
- 맞으면: 손실 감소 ($e^{-\alpha} < 1$)
- 틀리면: 손실 증가 ($e^{+\alpha} > 1$)
- 틀릴수록 손실이 지수적으로 증가

### 7.3 Amount of Say 유도

**목표**: 손실 함수 L을 최소화하는 α 찾기

$$\frac{\partial L}{\partial \alpha} = 0$$

**계산 과정** (간략):

$$L = \sum_{\text{correct}} w_i e^{-\alpha} + \sum_{\text{incorrect}} w_i e^{+\alpha}$$

$$= (1-\epsilon) e^{-\alpha} + \epsilon e^{+\alpha}$$

$$\frac{\partial L}{\partial \alpha} = -(1-\epsilon) e^{-\alpha} + \epsilon e^{+\alpha} = 0$$

$$\epsilon e^{+\alpha} = (1-\epsilon) e^{-\alpha}$$

$$\frac{\epsilon}{1-\epsilon} = e^{-2\alpha}$$

$$\alpha = \frac{1}{2} \ln\left(\frac{1-\epsilon}{\epsilon}\right)$$

***

## 8. 샘플 가중치 업데이트

### 8.1 업데이트 규칙

**새로운 가중치**:

$$w_i^{(t+1)} = w_i^{(t)} \cdot e^{-y_i \cdot \alpha^{(t)} \cdot h^{(t)}(x_i)}$$

**간단히**:
- **틀린 샘플**: $w_i^{(t+1)} = w_i^{(t)} \cdot e^{+\alpha}$ (증가)
- **맞은 샘플**: $w_i^{(t+1)} = w_i^{(t)} \cdot e^{-\alpha}$ (감소)

### 8.2 업데이트 예시

```
초기 가중치: w1=0.2, w2=0.2, w3=0.2, w4=0.2, w5=0.2
Total Error: ε = 0.4
Amount of Say: α = 0.2027

샘플 1: 맞음 → w1' = 0.2 × e^(-0.2027) = 0.163
샘플 2: 틀림 → w2' = 0.2 × e^(+0.2027) = 0.245
샘플 3: 맞음 → w3' = 0.2 × e^(-0.2027) = 0.163
샘플 4: 맞음 → w4' = 0.2 × e^(-0.2027) = 0.163
샘플 5: 틀림 → w5' = 0.2 × e^(+0.2027) = 0.245
```

### 8.3 정규화 (Normalization)

**가중치 합이 1이 되도록 정규화**:

$$w_i^{(t+1)} = \frac{w_i^{(t+1)}}{\sum_{j=1}^{N} w_j^{(t+1)}}$$

**예시 (계속)**:

```
합: 0.163 + 0.245 + 0.163 + 0.163 + 0.245 = 0.979

정규화:
w1 = 0.163 / 0.979 = 0.167
w2 = 0.245 / 0.979 = 0.250
w3 = 0.163 / 0.979 = 0.167
w4 = 0.163 / 0.979 = 0.167
w5 = 0.245 / 0.979 = 0.250

합: 0.167 + 0.250 + 0.167 + 0.167 + 0.250 = 1.0 ✓
```

### 8.4 가중치 변화의 의미

**틀린 샘플**:
- 가중치 증가 (0.2 → 0.25)
- 다음 Stump에서 더 중요하게 취급
- 이 샘플을 제대로 분류하는 Feature 선택 가능성 증가

**맞은 샘플**:
- 가중치 감소 (0.2 → 0.167)
- 다음 Stump에서 덜 중요하게 취급
- 이미 잘 분류되므로 신경 쓸 필요 없음

***

## 9. 반복 학습

### 9.1 두 번째 Stump 생성

**업데이트된 가중치로 Gini Index 계산**:

```
샘플 가중치: [0.167, 0.250, 0.167, 0.167, 0.250]
              ↑      ↑                    ↑
           맞음   틀림                  틀림

→ 샘플 2, 5가 더 높은 가중치
→ 이 샘플들을 잘 분류하는 Feature 선택
```

**과정**:
1. 각 Feature에 대해 가중치 기반 Gini Index 계산
2. 가중치가 높은 샘플(틀린 샘플)이 Gini Index에 더 큰 영향
3. 틀린 샘플을 잘 분류하는 Feature가 선택될 가능성 증가

### 9.2 반복

**T번 반복**:

```
for t = 1 to T:
    1. 현재 가중치로 Stump 생성
    2. Total Error 계산
    3. Amount of Say 계산
    4. 샘플 가중치 업데이트
    5. 정규화
```

***

## 10. 최종 예측

### 10.1 가중 투표

**새로운 샘플 x에 대한 예측**:

$$H(x) = \text{sign}\left(\sum_{t=1}^{T} \alpha^{(t)} \cdot h^{(t)}(x)\right)$$

여기서:
- $h^{(t)}(x)$: t번째 Stump의 예측 (-1 or +1)
- $\alpha^{(t)}$: t번째 Stump의 Amount of Say
- $\text{sign}(\cdot)$: 부호 함수 (양수면 +1, 음수면 -1)

### 10.2 예측 예시

```
3개의 Stump로 학습 완료

Stump 1: α1 = 1.1,  h1(x) = +1
Stump 2: α2 = 0.5,  h2(x) = -1
Stump 3: α3 = 0.8,  h3(x) = +1

가중 합:
score = 1.1×(+1) + 0.5×(-1) + 0.8×(+1)
      = 1.1 - 0.5 + 0.8
      = 1.4

최종 예측: sign(1.4) = +1
```

### 10.3 해석

**Stump 1**:
- 가장 성능이 좋음 (α = 1.1)
- +1 예측
- 큰 영향력

**Stump 2**:
- 성능이 낮음 (α = 0.5)
- -1 예측
- 작은 영향력

**Stump 3**:
- 중간 성능 (α = 0.8)
- +1 예측
- 중간 영향력

**결과**: +1 방향이 우세 → 최종 예측 +1

***

## 11. AdaBoost의 특성

### 11.1 장점

**1. 높은 정확도**:
- Weak Learner를 결합하여 Strong Learner 생성
- 순차적 학습으로 오류 집중 개선

**2. 과적합 저항성**:
- Stump는 단순한 모델 (깊이 1)
- 개별 모델의 과적합 가능성 낮음

**3. Feature 중요도**:
- 자주 선택되는 Feature = 중요한 Feature
- 해석 가능

**4. 이론적 보장**:
- Training Error가 지수적으로 감소
- 수학적으로 증명됨

### 11.2 단점

**1. 노이즈에 민감**:
- 이상치(Outlier)에 과도한 가중치 부여
- 노이즈를 과대 학습할 위험

**2. 순차 학습**:
- 병렬화 불가
- 학습 속도 느림

**3. 가중치 폭발**:
- 계속 틀리는 샘플의 가중치 과도 증가
- 수치적 불안정성

### 11.3 Random Forest vs AdaBoost 비교

| 특성 | Random Forest | AdaBoost |
|------|---------------|----------|
| 기본 모델 | 완전한 Tree | Stump |
| 앙상블 방식 | Bagging | Boosting |
| 학습 방식 | 병렬 | 순차 |
| 샘플 선택 | Bootstrap | 가중치 조정 |
| 투표 방식 | 균등 (1표) | 가중 (α표) |
| 노이즈 강건성 | 높음 | 낮음 |
| 과적합 위험 | 낮음 | 중간 |

***

## 12. AdaBoost 변형

### 12.1 SAMME (Stagewise Additive Modeling using a Multi-class Exponential loss)

**다중 클래스 확장**:

$$\alpha = \ln\left(\frac{1-\epsilon}{\epsilon}\right) + \ln(K-1)$$

- K: 클래스 개수
- 이진 분류(K=2) → 원래 AdaBoost와 동일

### 12.2 SAMME.R (Real AdaBoost)

**확률 기반 예측**:

- 클래스 확률 사용
- 더 안정적인 성능
- Scikit-learn 기본값

***

## 13. 구현 예시 (Scikit-learn)

### 13.1 기본 사용법

```python
from sklearn.ensemble import AdaBoostClassifier
from sklearn.tree import DecisionTreeClassifier

# Base Estimator (Stump)
base_estimator = DecisionTreeClassifier(max_depth=1)

# AdaBoost
model = AdaBoostClassifier(
    base_estimator=base_estimator,
    n_estimators=50,        # Stump 개수
    learning_rate=1.0,      # α 조정 (기본 1.0)
    algorithm='SAMME.R'     # 알고리즘
)

# 학습
model.fit(X_train, y_train)

# 예측
predictions = model.predict(X_test)

# Feature Importance
importances = model.feature_importances_
```

### 13.2 하이퍼파라미터

| 파라미터 | 설명 | 권장값 |
|----------|------|--------|
| `n_estimators` | Stump 개수 | 50~200 |
| `learning_rate` | α 스케일링 | 0.5~1.0 |
| `base_estimator` | 기본 모델 | Stump (max_depth=1) |
| `algorithm` | 알고리즘 | 'SAMME.R' |

***

## 14. 핵심 요약

### 14.1 AdaBoost의 핵심 아이디어

1. **Weak Learner (Stump)**: 깊이 1인 단순한 Decision Tree
2. **순차적 학습**: 이전 오류에 집중하여 다음 모델 학습
3. **샘플 가중치**: 틀린 샘플의 가중치 증가
4. **가중 투표**: Amount of Say에 따라 다른 발언권
5. **부스팅**: 약한 학습기를 결합하여 강한 학습기 생성

### 14.2 핵심 수식

**Amount of Say**:
$$\alpha = \frac{1}{2} \ln\left(\frac{1-\epsilon}{\epsilon}\right)$$

**가중치 업데이트**:
$$w_i^{(t+1)} = w_i^{(t)} \cdot e^{-y_i \alpha h(x_i)}$$

**최종 예측**:
$$H(x) = \text{sign}\left(\sum_{t=1}^{T} \alpha^{(t)} h^{(t)}(x)\right)$$

### 14.3 알고리즘 요약

```
AdaBoost = Weak Learners + Sequential Learning + Weighted Voting

목적: 약한 학습기를 순차적으로 결합하여 강한 학습기 생성
방법: 이전 오류에 가중치 부여 → 다음 모델이 집중 학습
결과: 높은 정확도 + 점진적 성능 향상
```

### 14.4 Bagging vs Boosting

| 특성 | Bagging (Random Forest) | Boosting (AdaBoost) |
|------|------------------------|---------------------|
| 목표 | 분산 감소 | 편향 감소 |
| 학습 | 병렬 | 순차 |
| 샘플링 | Bootstrap | 가중치 조정 |
| 결합 | 평균/다수결 | 가중 투표 |
| 대표 알고리즘 | Random Forest | AdaBoost, Gradient Boosting |