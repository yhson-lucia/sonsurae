---
title: Random Forest
slug: random-forest
category: ai/machine-learning
summary: Random Forest의 등장 배경, Bootstrap Sampling, Random Feature Selection, OOB Error, Feature Importance, Hyperparameter
tags: [ai, ml, random-forest, ensemble, bagging, bootstrap, oob]
sort_order: 6
created: 2025-04-19
updated: 2026-05-10
---

Random Forest는 Decision Tree의 한계를 극복하기 위해 개발된 **앙상블(Ensemble) 학습 알고리즘**. 여러 개의 Decision Tree를 결합해 과적합을 방지하고 일반화 성능을 향상시킴.

***

## 1. Decision Tree의 문제점

### 1.1 학습 데이터에 대한 민감성

**핵심 문제**: Decision Tree는 학습 데이터에 **매우 민감**하다

**이유**:
- Entropy를 기반으로 재귀적 분할 수행
- Feature 값이 조금만 변경되어도 분할 기준점이 바뀜
- 기준점 변경 → 완전히 다른 트리 구조 생성

**예시**:

```
원본 데이터:
petal_length = [1.4, 1.5, 4.7, 5.1]
→ 최적 분할: petal_length <= 2.0

데이터 일부 변경:
petal_length = [1.4, 1.5, 2.3, 4.7, 5.1]
→ 최적 분할: petal_length <= 3.0 (완전히 다른 기준)
```

### 1.2 높은 분산 (High Variance)

**분산이 높다** = 데이터가 조금만 바뀌어도 모델이 크게 변한다

**결과**:
- 학습 데이터: 높은 정확도 (Training Accuracy ≈ 100%)
- 테스트 데이터: 낮은 정확도 (Test Accuracy 감소)
- **과적합(Overfitting)** 발생

**분산과 편향의 트레이드오프**:

| 모델 | 분산 | 편향 | 문제점 |
|------|------|------|--------|
| 단순 모델 | 낮음 | 높음 | 과소적합 (Underfitting) |
| Decision Tree (깊음) | **높음** | 낮음 | **과적합 (Overfitting)** |
| Random Forest | 중간 | 중간 | 균형 잡힌 성능 |

### 1.3 일반화 실패

**일반화(Generalization)**: 새로운 데이터에도 잘 작동하는 능력

- Decision Tree는 학습 데이터의 노이즈까지 학습
- 새로운 데이터에 대한 예측 성능 저하
- 모델의 실용성 감소

***

## 2. Random Forest의 핵심 아이디어

### 2.1 기본 개념

**"나무 한 그루보다 숲이 더 안정적이다"**

- 여러 개의 Decision Tree를 사용하여 **숲(Forest)** 구성
- 각 Tree의 예측을 **종합(Aggregate)**하여 최종 결정
- 개별 Tree의 오류를 상쇄하여 **분산 감소**

### 2.2 왜 "Random" Forest인가?

**두 가지 무작위성**:

1. **Random Sampling (Bootstrap)**: 데이터를 무작위로 샘플링
2. **Random Feature Selection**: Feature를 무작위로 선택

→ 모든 과정이 무작위(Random)이므로 **Random Forest**

### 2.3 앙상블 학습 (Ensemble Learning)

**앙상블**: 여러 개의 약한 학습기(Weak Learner)를 결합하여 강한 학습기(Strong Learner) 생성

**Random Forest의 장점**:
- 개별 Tree는 과적합될 수 있음
- 여러 Tree를 결합하면 과적합 감소
- 안정적이고 일반화 성능이 높은 모델

***

## 3. Bootstrap Sampling (부트스트랩 샘플링)

### 3.1 Bootstrap이란?

**Bootstrap**: 원본 데이터셋에서 **복원 추출(Sampling with Replacement)**로 새로운 데이터셋 생성

**복원 추출**:
- 데이터를 뽑은 후 다시 넣음
- 같은 데이터가 여러 번 선택될 수 있음
- 선택되지 않는 데이터도 있음

### 3.2 Bootstrap 과정

```
원본 데이터 (150개):
[샘플1, 샘플2, 샘플3, ..., 샘플150]

Bootstrap 샘플링 → Bootstrapped Data 1 (150개):
[샘플3, 샘플3, 샘플7, 샘플1, ..., 샘플99]
(샘플3이 2번, 샘플2는 없음)

Bootstrap 샘플링 → Bootstrapped Data 2 (150개):
[샘플5, 샘플1, 샘플1, 샘플50, ..., 샘플3]
(샘플1이 2번, 샘플4는 없음)

...
```

### 3.3 Bootstrapped Data의 특징

**평균적으로**:
- 원본 데이터의 약 63.2%가 선택됨
- 약 36.8%는 선택되지 않음 (Out-Of-Bag, OOB)

**효과**:
- 각 Tree가 서로 다른 데이터로 학습
- Tree 간 상관관계 감소
- 다양성(Diversity) 증가

***

## 4. Random Feature Selection (무작위 특성 선택)

### 4.1 Feature Subset 선택

**각 노드에서 분할할 때**:
- 모든 Feature를 고려하지 않음
- **일부 Feature만 무작위로 선택**하여 최적 분할 찾기

**예시**:

```
전체 Feature: [sepal_length, sepal_width, petal_length, petal_width]

Tree 1의 어떤 노드:
→ 무작위 선택: [sepal_width, petal_length]
→ 이 중에서 최적 분할 찾기

Tree 2의 어떤 노드:
→ 무작위 선택: [sepal_length, petal_width]
→ 이 중에서 최적 분할 찾기
```

### 4.2 선택할 Feature 개수

**연구 결과에 따른 권장사항**:

| Feature 총 개수 | 선택할 개수 (권장) |
|----------------|-------------------|
| $p$ | $\sqrt{p}$ (제곱근) |
| $p$ | $\log_2(p)$ (로그) |

**예시**:

```
전체 Feature = 16개

방법 1: √16 = 4개 선택
방법 2: log₂(16) = 4개 선택

→ 각 노드에서 4개 Feature만 무작위로 선택
```

### 4.3 Random Feature의 효과

**목적**: 특정 Feature에 덜 민감하게 학습

**효과**:
- Tree 간 상관관계 감소
- 각 Tree가 서로 다른 패턴 학습
- 특정 Feature가 지배적인 영향을 미치는 것 방지

**트레이드오프**:
- 개별 Tree의 성능은 다소 감소할 수 있음
- 하지만 여러 Tree를 결합하면 전체 성능 향상

***

## 5. Random Forest 알고리즘

### 5.1 학습 과정 (Training)

```
1. Bootstrap 샘플링
   ├─ 원본 데이터에서 복원 추출
   └─ Bootstrapped Data 1, 2, 3, ..., N 생성

2. 각 Bootstrapped Data로 Tree 학습
   ├─ Tree 1: Bootstrapped Data 1로 학습
   ├─ Tree 2: Bootstrapped Data 2로 학습
   ├─ ...
   └─ Tree N: Bootstrapped Data N로 학습

3. 각 Tree 학습 시
   ├─ 각 노드에서 분할할 때
   ├─ 전체 Feature 중 일부만 무작위 선택
   └─ 선택된 Feature 중 최적 분할 찾기

4. N개의 서로 다른 Tree 완성
```

### 5.2 예측 과정 (Prediction)

```
1. 새로운 데이터 입력
   ↓
2. 모든 Tree에서 예측 수행
   ├─ Tree 1 → 클래스 A
   ├─ Tree 2 → 클래스 B
   ├─ Tree 3 → 클래스 A
   ├─ ...
   └─ Tree N → 클래스 A
   ↓
3. Aggregation (집계)
   - 분류: 다수결(Majority Voting)
   - 회귀: 평균(Average)
   ↓
4. 최종 예측 결과
   → 클래스 A (다수결)
```

### 5.3 의사 코드 (Pseudocode)

```python
# Random Forest 학습
def train_random_forest(data, num_trees, num_features):
    forest = []

    for i in range(num_trees):
        # 1. Bootstrap 샘플링
        bootstrapped_data = bootstrap_sample(data)

        # 2. Decision Tree 학습
        tree = DecisionTree(max_features=num_features)
        tree.fit(bootstrapped_data)

        # 3. Forest에 추가
        forest.append(tree)

    return forest

# Random Forest 예측
def predict_random_forest(forest, X):
    predictions = []

    for tree in forest:
        # 각 Tree의 예측
        pred = tree.predict(X)
        predictions.append(pred)

    # 다수결
    final_prediction = majority_vote(predictions)
    return final_prediction
```

***

## 6. Aggregation (집계)

### 6.1 분류 문제: Majority Voting (다수결)

**각 Tree의 예측을 투표로 간주**

**예시**:

```
100개의 Tree가 있다고 가정

입력 데이터 X에 대해:
- 60개 Tree: 클래스 A 예측
- 30개 Tree: 클래스 B 예측
- 10개 Tree: 클래스 C 예측

최종 예측: 클래스 A (60표로 가장 많음)
```

### 6.2 회귀 문제: Average (평균)

**각 Tree의 예측값을 평균**

**예시**:

```
100개의 Tree가 있다고 가정

입력 데이터 X에 대해:
- Tree 1: 23.5
- Tree 2: 25.1
- Tree 3: 24.3
- ...
- Tree 100: 24.0

최종 예측: (23.5 + 25.1 + ... + 24.0) / 100 = 24.2
```

### 6.3 Soft Voting (확률 기반 투표)

**각 Tree의 확률 예측을 평균**

**예시**:

```
3개의 Tree, 2개 클래스 (A, B)

Tree 1: P(A)=0.8, P(B)=0.2
Tree 2: P(A)=0.6, P(B)=0.4
Tree 3: P(A)=0.7, P(B)=0.3

평균 확률:
P(A) = (0.8 + 0.6 + 0.7) / 3 = 0.7
P(B) = (0.2 + 0.4 + 0.3) / 3 = 0.3

최종 예측: 클래스 A (확률 0.7)
```

***

## 7. Random Forest의 효과

### 7.1 분산 감소 (Variance Reduction)

**개별 Tree**:
- 높은 분산 (데이터에 민감)
- 과적합 가능성

**Random Forest**:
- 여러 Tree의 예측을 평균
- 분산 = $\frac{\sigma^2}{N}$ (N: Tree 개수)
- Tree가 많을수록 분산 감소

### 7.2 Tree 간 독립성

**Bootstrap + Random Feature 효과**:

| 방법 | 효과 |
|------|------|
| Bootstrap | 각 Tree가 다른 데이터로 학습 |
| Random Feature | 각 Tree가 다른 Feature 조합 사용 |
| **결합** | Tree 간 상관관계 최소화 |

**상관관계가 낮을수록**:
- 각 Tree가 서로 다른 오류 발생
- 오류가 상쇄되어 전체 성능 향상

### 7.3 일반화 성능 향상

**과적합 방지**:
- 개별 Tree는 과적합될 수 있음
- 여러 Tree의 다수결로 노이즈 제거
- 일반적인 패턴만 남음

**예시**:

```
Tree 1: 노이즈에 과적합 → 잘못된 예측
Tree 2: 올바른 패턴 학습 → 올바른 예측
Tree 3: 올바른 패턴 학습 → 올바른 예측
...

다수결 → 올바른 예측 (2:1로 승리)
```

***

## 8. Random Forest vs Decision Tree

### 8.1 비교표

| 특성 | Decision Tree | Random Forest |
|------|---------------|---------------|
| 모델 개수 | 1개 | N개 (앙상블) |
| 학습 데이터 | 전체 데이터 | Bootstrap 샘플 |
| Feature 선택 | 모든 Feature | 일부 Feature (무작위) |
| 분산 | 높음 | 낮음 |
| 과적합 | 쉬움 | 어려움 |
| 해석 가능성 | 높음 | 낮음 |
| 학습 시간 | 빠름 | 느림 (N배) |
| 예측 시간 | 빠름 | 느림 (N배) |
| 정확도 | 낮음~중간 | 높음 |

### 8.2 시각적 비교

**Decision Tree**:
```
       [Root]
       /    \
    [A]      [B]
   /  \     /  \
 [C] [D] [E] [F]

→ 단일 트리, 데이터 변화에 민감
```

**Random Forest**:
```
Tree 1        Tree 2        Tree N
[Root]        [Root]  ...   [Root]
 / \           / \            / \

→ 여러 트리, 다수결로 안정적
```

***

## 9. Out-Of-Bag (OOB) Error

### 9.1 OOB 데이터

**Bootstrap 샘플링 특성**:
- 평균적으로 약 36.8% 데이터가 선택되지 않음
- 이 데이터를 **OOB 데이터**라 함

### 9.2 OOB Error 계산

**각 샘플에 대해**:
1. 해당 샘플이 OOB인 Tree들만 선택
2. 이 Tree들로 예측 수행
3. 실제값과 비교하여 오류 계산

**장점**:
- 별도의 Validation Set 불필요
- 학습 과정에서 자동으로 검증
- Cross-Validation과 유사한 효과

### 9.3 예시

```
원본 데이터: [샘플1, 샘플2, ..., 샘플100]

Tree 1 (Bootstrap): 샘플1 포함 ✓, 샘플2 미포함 ✗
Tree 2 (Bootstrap): 샘플1 미포함 ✗, 샘플2 포함 ✓
Tree 3 (Bootstrap): 샘플1 미포함 ✗, 샘플2 미포함 ✗

샘플1의 OOB 예측:
→ Tree 2, Tree 3만 사용 (샘플1이 학습에 사용되지 않은 Tree)

샘플2의 OOB 예측:
→ Tree 1, Tree 3만 사용
```

***

## 10. Feature Importance (특성 중요도)

### 10.1 계산 방법

**각 Feature에 대해**:
1. 모든 Tree에서 해당 Feature가 사용된 노드 찾기
2. 각 노드의 Information Gain 합산
3. 전체 Tree에 대해 평균

**수식**:

$$Importance(f) = \frac{1}{N} \sum_{t=1}^{N} \sum_{node \in Tree_t} IG(node, f)$$

### 10.2 활용

**중요한 Feature 파악**:
- 어떤 Feature가 분류/회귀에 가장 중요한지 확인
- 불필요한 Feature 제거 (Feature Selection)
- 도메인 이해도 향상

**예시**:

```
Feature Importance:
- petal_length: 0.45 (가장 중요)
- petal_width:  0.32
- sepal_length: 0.15
- sepal_width:  0.08 (가장 덜 중요)

→ petal 관련 특성이 Iris 분류에 중요
```

***

## 11. Hyperparameters (하이퍼파라미터)

### 11.1 주요 하이퍼파라미터

| 파라미터 | 설명 | 권장값 |
|----------|------|--------|
| `n_estimators` | Tree 개수 | 100~500 |
| `max_features` | 각 분할에서 선택할 Feature 수 | $\sqrt{p}$ 또는 $\log_2(p)$ |
| `max_depth` | 각 Tree의 최대 깊이 | 10~30 |
| `min_samples_split` | 노드 분할 최소 샘플 수 | 2~10 |
| `min_samples_leaf` | Leaf 노드 최소 샘플 수 | 1~5 |
| `bootstrap` | Bootstrap 사용 여부 | True |

### 11.2 튜닝 전략

**1. Tree 개수 (`n_estimators`)**:
- 많을수록 성능 향상, 하지만 계산 비용 증가
- 보통 100~500개면 충분

**2. Feature 선택 (`max_features`)**:
- 분류: $\sqrt{p}$ (제곱근)
- 회귀: $p/3$ (전체의 1/3)

**3. Tree 깊이 (`max_depth`)**:
- 너무 깊으면 개별 Tree 과적합
- 너무 얕으면 성능 저하
- Grid Search로 최적값 찾기

***

## 12. 핵심 요약

### 12.1 Random Forest의 핵심 아이디어

1. **Bootstrap Sampling**: 복원 추출로 다양한 데이터셋 생성
2. **Random Feature Selection**: 각 노드에서 일부 Feature만 선택
3. **Multiple Trees**: 여러 개의 Decision Tree 학습
4. **Aggregation**: 다수결 또는 평균으로 최종 예측

### 12.2 장점

- **높은 정확도**: 단일 Tree보다 성능 우수
- **과적합 방지**: 앙상블 효과로 일반화 성능 향상
- **안정성**: 데이터 변화에 덜 민감
- **Feature Importance**: 중요한 Feature 파악 가능
- **OOB Error**: 별도 검증 세트 불필요

### 12.3 단점

- **해석 어려움**: 단일 Tree에 비해 블랙박스
- **학습 시간**: N개 Tree 학습으로 느림
- **메모리 사용**: N개 Tree 저장 필요
- **예측 시간**: 모든 Tree 실행 필요

### 12.4 활용 분야

- 분류 문제 (Classification)
- 회귀 문제 (Regression)
- Feature Selection
- Anomaly Detection (이상치 탐지)
- 캐글(Kaggle) 등 데이터 과학 경진대회

### 12.5 알고리즘 요약

```
Random Forest = Bootstrap + Random Feature + Multiple Trees + Aggregation

목적: Decision Tree의 높은 분산 문제 해결
방법: 여러 Tree의 예측을 종합하여 안정적인 모델 생성
결과: 과적합 방지 + 일반화 성능 향상
```