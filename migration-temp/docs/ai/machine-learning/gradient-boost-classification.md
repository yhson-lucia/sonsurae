---
title: Gradient Boosting for Classification
slug: gradient-boost-classification
category: ai/machine-learning
summary: 분류용 Gradient Boosting의 Log Odds 초기화, Sigmoid·Cross-Entropy 손실, KL Divergence, Hard/Soft Label
tags: [ai, ml, gradient-boosting, classification, log-odds, cross-entropy, kl-divergence]
sort_order: 9
created: 2025-04-19
updated: 2026-05-10
---

Gradient Boosting 회귀와 달리, 분류 문제에서는 **Log Odds**를 사용해 초기값을 설정하고 업데이트.

> 왜 확률 대신 Log Odds를 사용하는지, 그리고 Cross-Entropy와의 관계 정리.

***

## 1. 왜 확률을 초기값으로 사용하지 않는가?

### 1.1 문제 상황

데이터에 양성(1)이 80개, 음성(0)이 20개 있다고 가정

**가장 단순한 초기 예측**: "80% 확률로 양성"

하지만 Gradient Boosting은 **트리의 출력을 더하는 방식**으로 학습함.

$$F_m(x) = F_{m-1}(x) + \eta \cdot h_m(x)$$

### 1.2 확률로 하면 생기는 문제

```
초기값: 0.8 (확률)
첫 번째 트리: "양성일 가능성이 더 높아서, +0.3 보정"

0.8 + 0.3 = 1.1  ← 확률이 1을 초과
```

확률은 0~1 범위인데, 덧셈을 하면 범위를 벗어날 수 있음

### 1.3 해결책: Log Odds

확률을 **Log Odds로 변환**하면 범위가 -∞ ~ +∞가 되어 덧셈이 자유로워짐

```
초기값: 1.39 (log odds, 확률 0.8에 해당)
첫 번째 트리: +0.5 보정

1.39 + 0.5 = 1.89  ← 문제없음!

시그모이드로 변환: σ(1.89) ≈ 0.87 (확률)
```

***

## 2. Odds와 Log Odds

### 2.1 Odds

**Odds**는 사건이 일어날 확률과 일어나지 않을 확률의 **비율**

$$\text{Odds} = \frac{p}{1-p}$$

| 확률 p | Odds | 해석 |
|--------|------|------|
| 0.5 | 1 | 반반 |
| 0.8 | 4 | 일어날 가능성이 4배 높음 |
| 0.2 | 0.25 | 안 일어날 가능성이 4배 높음 |

**참고**: Odds는 "홀수"가 아니라 도박/통계에서 유래한 "비율"

### 2.2 Log Odds (로짓)

Odds에 로그를 취한 값

$$\text{Log Odds} = \log\left(\frac{p}{1-p}\right)$$

| 확률 | Odds | Log Odds |
|------|------|----------|
| 0.1 | 0.11 | -2.2 |
| 0.5 | 1 | 0 |
| 0.9 | 9 | +2.2 |

**특징**:
- 범위: -∞ ~ +∞
- 확률 0.5일 때 Log Odds = 0
- 0을 중심으로 대칭

### 2.3 Log Odds → 확률 변환 (시그모이드)

- Log Odds를 다시 확률로 변환할 때 **시그모이드 함수**를 사용

$$p = \sigma(\text{log odds}) = \frac{1}{1 + e^{-\text{log odds}}}$$

- 시그모이드는 Log Odds의 **역함수**

***

## 3. Gradient Boosting 분류 알고리즘

### 3.1 전체 과정

```
1. 초기 예측 (Log Odds)
   - Log Odds = log(양성 개수 / 음성 개수)
   ↓
2. 확률 변환
   - p = σ(Log Odds)
   ↓
3. 잔차 계산
   - Residual = 실제값 (0 또는 1) - 예측 확률 (p)
   ↓
4. Tree 생성
   - 잔차를 타겟으로 새로운 Tree 학습
   ↓
5. Log Odds 업데이트
   - 새 Log Odds = 이전 Log Odds + Learning Rate × Tree 출력
   ↓
6. 반복
   - 2~5 과정 반복
```

### 3.2 예시

**데이터**: 양성 4개, 음성 2개

**Step 1: 초기 Log Odds**

$$\text{Log Odds}_0 = \log\left(\frac{4}{2}\right) = \log(2) \approx 0.693$$

**Step 2: 확률 변환**

$$p_0 = \sigma(0.693) = \frac{1}{1 + e^{-0.693}} \approx 0.67$$

**Step 3: 잔차 계산**

| 샘플 | 실제값 (y) | 예측 확률 (p) | 잔차 (y - p) |
|------|-----------|---------------|--------------|
| 1 | 1 | 0.67 | +0.33 |
| 2 | 1 | 0.67 | +0.33 |
| 3 | 1 | 0.67 | +0.33 |
| 4 | 1 | 0.67 | +0.33 |
| 5 | 0 | 0.67 | -0.67 |
| 6 | 0 | 0.67 | -0.67 |

**Step 4-5: Tree 학습 및 업데이트**

트리가 잔차를 학습하고, 출력값을 Log Odds에 더함.

$$\text{Log Odds}_1 = 0.693 + 0.1 \times h_1(x)$$

**Step 6: 반복**

새로운 확률 계산 → 새로운 잔차 → 새로운 트리 → 반복

***

## 4. 분류에서의 Leaf 출력값

### 4.1 회귀 vs 분류

| | 회귀 | 분류 |
|---|------|------|
| Leaf 출력 | 잔차의 평균 | $\frac{\sum(y_i - p_i)}{\sum p_i(1-p_i)}$ |
| 손실 함수 | MSE | Cross-Entropy |

### 4.2 왜 분류에서는 다른 공식인가?

**Cross-Entropy 손실 함수**를 Log Odds에 대해 미분하면:

- **1차 미분**: $y - p$ (잔차)
- **2차 미분**: $p(1-p)$

최적 업데이트를 위해 **뉴턴 방법 (2차 근사)**를 사용한다:

$$\text{최적 업데이트} = -\frac{\text{1차 미분}}{\text{2차 미분}} = \frac{\sum(y_i - p_i)}{\sum p_i(1-p_i)}$$

### 4.3 분모 $p(1-p)$의 의미

$p(1-p)$는 예측의 **불확실성**을 나타낸다.

| 예측 확률 p | p(1-p) | 의미 |
|-------------|--------|------|
| 0.5 | 0.25 | 매우 불확실 → 큰 업데이트 |
| 0.9 | 0.09 | 확신 있음 → 작은 업데이트 |
| 0.99 | 0.01 | 매우 확신 → 아주 작은 업데이트 |

확신이 높을수록 조심스럽게, 불확실할수록 크게 조정

***

## 5. Cross-Entropy 손실 함수

### 5.1 정보량의 개념

정보 이론에서 **정보량**은 "얼마나 놀라운가"를 측정

$$I(p) = -\log(p)$$

| 확률 | 정보량 | 해석 |
|------|--------|------|
| 0.99 | ≈ 0.01 | 당연해서 안 놀람 |
| 0.5 | ≈ 0.69 | 반반이라 좀 놀람 |
| 0.01 | ≈ 4.6 | 엄청 놀람 |

**에너지 관점**: 정보량을 "그 사건을 표현하는 데 필요한 에너지"로 해석할 수 있음.

### 5.2 Cross-Entropy 정의

$$H(p, q) = -\sum_i p_i \log(q_i)$$

- $p$: 실제 정답 분포
- $q$: 모델의 예측 분포

**의미**: "실제 분포($p$)대로 일어나는데, 모델 분포($q$)를 믿었을 때 필요한 에너지"

### 5.3 왜 "Cross"인가?

**엔트로피**는 자기 자신의 분포로 계산:

$$H(p) = -\sum_i p_i \log(p_i)$$

**Cross-Entropy**는 **두 분포를 교차**:

$$H(p, q) = -\sum_i p_i \log(q_i)$$

- $p_i$: 실제 분포 (가중치 역할)
- $\log(q_i)$: 모델 예측의 정보량

"정답 입장에서 모델을 평가"하는 방식

### 5.4 분류에서의 Cross-Entropy

**Hard Label (One-Hot Encoding)**의 경우:

정답이 "고양이"면 $p = [1, 0, 0]$

$$L = -1 \cdot \log(q_{\text{고양이}}) - 0 \cdot \log(q_{\text{개}}) - 0 \cdot \log(q_{\text{새}})$$

결국 **정답 클래스의 예측 확률**만 남는다:

$$L = -\log(q_{\text{정답 클래스}})$$

***

## 6. KL Divergence와 Cross-Entropy의 관계

### 6.1 KL Divergence란?

**Kullback-Leibler Divergence (쿨백-라이블러 발산)** 는 두 분포가 얼마나 다른지 측정함.

$$D_{KL}(p \| q) = \sum_i p_i \log\frac{p_i}{q_i}$$

- $p = q$면 → $D_{KL} = 0$
- $p \neq q$면 → $D_{KL} > 0$

**의미**: "잘못된 믿음($q$) 때문에 낭비한 에너지"

### 6.2 Cross-Entropy 분해

Cross-Entropy는 다음과 같이 분해할 수 있다:

$$H(p, q) = H(p) + D_{KL}(p \| q)$$

- $H(p)$: 엔트로피 (정답 분포의 불확실성, 고정값)
- $D_{KL}(p \| q)$: KL Divergence (예측 오차)

### 6.3 왜 Cross-Entropy가 최소가 되는가?

**KL Divergence는 항상 0 이상**이므로:

$$H(p, q) = H(p) + D_{KL}(p \| q) \geq H(p)$$

$q = p$일 때만 $D_{KL} = 0$이 되어 Cross-Entropy가 **최소**가 됨.

**결론**: Cross-Entropy를 최소화하면 $q$가 $p$에 가까워진다.

### 6.4 KL Divergence가 항상 ≥ 0인 이유

**Jensen's Inequality**로 증명됨.

$\log$는 오목(concave) 함수이므로:

$$\sum_i p_i \log\frac{q_i}{p_i} \leq \log\sum_i p_i \cdot \frac{q_i}{p_i} = \log\sum_i q_i = \log 1 = 0$$

부호를 뒤집으면:

$$D_{KL}(p \| q) = \sum_i p_i \log\frac{p_i}{q_i} \geq 0$$

### 6.5 손해가 커지는 원리

| $p_i$ | $q_i$ | $p_i \log\frac{p_i}{q_i}$ | 해석 |
|-------|-------|---------------------------|------|
| 0.8 | 0.8 | 0 | 정확히 맞춤 |
| 0.8 | 0.3 | +0.78 | 자주 일어나는 걸 낮게 예측 → 큰 손해 |
| 0.2 | 0.7 | -0.25 | 드물게 일어나는 걸 높게 예측 → 작은 이득 |

**핵심**: 자주 일어나는 사건($p_i$ 큼)을 틀리면 손해가 크고, 드문 사건을 틀려도 손해가 작다.

전체 합은 항상 ≥ 0이다. (확률 분포의 합이 1이므로 양수 기여가 항상 음수 기여보다 크거나 같음)

***

## 7. Hard Label vs Soft Label

### 7.1 정의

| | Hard Label | Soft Label |
|---|------------|------------|
| 정답 표현 | One-Hot: [1, 0, 0] | 확률 분포: [0.8, 0.1, 0.1] |
| 불확실성 | 없음 (100% 확신) | 있음 (80% 확신) |
| 사용 상황 | 일반적인 분류 | Knowledge Distillation, Label Smoothing |

### 7.2 Cross-Entropy에서의 차이

**Hard Label**:

$$L = -\log(q_{\text{정답}})$$

정답 클래스만 본다.

**Soft Label**:

$$L = -\sum_i p_i \log(q_i)$$

모든 클래스의 확률을 가중합함. 이때 $p_i$가 기댓값 역할을 함.

### 7.3 Gradient Boosting에서의 의미

Gradient Boosting 분류는 보통 **Hard Label**을 사용함.

- $y_i$: 0 또는 1
- 잔차: $y_i - p_i$

Soft Label이면 잔차 계산 방식이 달라지고 전체 학습 과정도 변경됨.

***

## 8. 핵심 요약

### 8.1 Log Odds를 사용하는 이유

1. 확률(0~1)은 덧셈 시 범위를 벗어날 수 있음
2. Odds(0~∞)는 비대칭
3. Log Odds(-∞~+∞)는 덧셈이 자유로움
4. 시그모이드로 다시 확률 변환 가능

### 8.2 Gradient Boosting 분류 흐름

```
초기 Log Odds (데이터 비율)
       ↓
시그모이드 → 확률
       ↓
잔차 = 실제값 - 확률
       ↓
트리가 잔차 학습
       ↓
Log Odds += Learning Rate × 트리 출력
       ↓
반복
```

### 8.3 Cross-Entropy의 의미

- 정보 이론: "정답 입장에서 모델 예측을 믿었을 때 필요한 에너지"
- 분류: "정답 클래스를 얼마나 확신했냐"만 평가 (Hard Label)
- 특징: 확신 있게 틀리면 손실이 무한대로 커짐

### 8.4 핵심 수식

**Log Odds**:
$$\text{Log Odds} = \log\left(\frac{p}{1-p}\right)$$

**시그모이드 (Log Odds → 확률)**:
$$p = \frac{1}{1 + e^{-\text{log odds}}}$$

**엔트로피 (불확실성, 최솟값)**:
$$H(p) = -\sum_i p_i \log(p_i)$$

**Cross-Entropy**:
$$H(p, q) = -\sum_i p_i \log(q_i)$$

**KL Divergence (예측 오차)**:
$$D_{KL}(p \| q) = \sum_i p_i \log\frac{p_i}{q_i} = H(p, q) - H(p) \geq 0$$

**분류 Leaf 출력**:
$$\gamma = \frac{\sum(y_i - p_i)}{\sum p_i(1-p_i)}$$