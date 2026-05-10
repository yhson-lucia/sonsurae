---
title: Decision Tree
slug: decision-tree
category: ai/machine-learning
summary: Decision Tree의 등장 배경, Entropy/Conditional Entropy/Information Gain, ID3 알고리즘, Overfitting과 가지치기
tags: [ai, ml, decision-tree, entropy, information-gain, id3, overfitting]
sort_order: 3
created: 2025-04-19
updated: 2026-05-10
---

- Decision Tree(결정 트리)는 Rule-based Machine Learning의 한계를 극복하기 위해 개발된 지도학습 알고리즘
- 트리 구조를 사용해 데이터를 분류하며, 각 노드에서 최적의 특성을 선택해 분기를 만듦

## 1. Decision Tree 개요

### 1.1 Rule-based ML의 한계

- 이전에 학습한 Candidate Elimination Algorithm은 완벽한 세계를 가정함
- 노이즈가 있는 현실 데이터를 처리하지 못함
- 확률적 변동성에 대응할 수 없음
- 이러한 한계를 극복하기 위해 Decision Tree가 등장

### 1.2 신용평가 문제 예시

개인의 신용평가를 판단하는 문제.

- **Attributes**: A1 ~ A15 (15개의 신용평가 지표)
- **Class**: C ∈ \{+, -\} (신용 승인/거부)

![신용평가 데이터 분류](images/decision-tree-01.png)

#### 단일 Attribute로 분류하는 경우

| Attribute | 분류 결과 | 특징 |
|---|---|---|
| **A1** | A1=a → 98+, 112- (혼합) | 불확실성 높음 |
| **A9** | A9=true → 284+, 77- | A1보다 불확실성 낮음. 그러나 여전히 오류 존재 |

### 1.3 최적의 Attribute 선택 문제

- 어떤 attribute가 데이터를 더 잘 분류할 수 있는가?
- A9의 경우 284:77로 비율이 높지만, A1은 98:112로 불확실성이 높음
- 이러한 불확실성을 측정하는 방법이 필요 → **Entropy**

## 2. Entropy (엔트로피)

Entropy는 데이터의 불확실성(uncertainty) 또는 무질서도(disorder)를 측정하는 지표.

### 2.1 Entropy 정의

랜덤 변수 X의 엔트로피는 다음과 같이 정의됨.

$$H(X) = -\sum_{x} P(X=x) \log_b P(X=x)$$

| 기호 | 의미 |
|---|---|
| **X** | 랜덤 변수 (예: attribute A1, A9 등) |
| **x** | X가 가질 수 있는 값 (예: \{true, false\}) |
| **P(X=x)** | X가 값 x를 가질 확률 |
| **b** | 로그의 밑 (일반적으로 2) |

### 2.2 Entropy의 특징

- 확률 분포가 균등할수록 엔트로피가 높음 (불확실성 높음)
- 확률 분포가 한쪽으로 치우칠수록 엔트로피가 낮음 (확실성 높음)
- 연속적인 값의 경우 시그마(Σ)는 적분 기호(∫)로 대체됨

### 2.3 Entropy 계산 예시

**이진 분류 문제**에서 Class Y ∈ \{+, -\}의 엔트로피.

**예시 1**: 전체 데이터가 296+, 357-로 구성

- $P(Y=+) = 296/653 \approx 0.453$
- $P(Y=-) = 357/653 \approx 0.547$
- $H(Y) = -(0.453 \times \log_2(0.453) + 0.547 \times \log_2(0.547))$
- $H(Y) \approx 0.994$ (높은 불확실성)

**예시 2**: A9 = true인 경우 284+, 77-로 구성

- $P(Y=+|A9=true) = 284/361 \approx 0.787$
- $P(Y=-|A9=true) = 77/361 \approx 0.213$
- $H(Y|A9=true) = -(0.787 \times \log_2(0.787) + 0.213 \times \log_2(0.213))$
- $H(Y|A9=true) \approx 0.764$ (낮아진 불확실성)

## 3. Conditional Entropy (조건부 엔트로피)

특정 feature가 주어졌을 때의 엔트로피를 측정.

### 3.1 Conditional Probability (조건부 확률)

- $P(Y|X)$: X가 주어졌을 때 Y의 확률
- 특정 attribute의 값이 주어졌을 때 클래스의 불확실성을 측정

### 3.2 Conditional Entropy 정의

$$H(Y|X) = \sum_{x} P(X=x) \cdot H(Y|X=x)$$

$$= \sum_{x} P(X=x) \left\{ -\sum_{y} P(Y=y|X=x) \log_b P(Y=y|X=x) \right\}$$

### 3.3 계산 과정

**A9 attribute의 조건부 엔트로피 H(Y|A9)**

1. $A9 = true$인 경우의 엔트로피 $H(Y|A9=true)$ 계산
2. $A9 = false$인 경우의 엔트로피 $H(Y|A9=false)$ 계산
3. 각 경우의 확률을 가중치로 곱해 합산

$$H(Y|A9) = P(A9=true) \cdot H(Y|A9=true) + P(A9=false) \cdot H(Y|A9=false)$$

## 4. Information Gain (정보 이득)

Information Gain은 특정 attribute를 사용했을 때 불확실성이 얼마나 감소하는지를 측정하는 지표.

### 4.1 Information Gain 정의

$$IG(Y, A_i) = H(Y) - H(Y|A_i)$$

| 기호 | 의미 |
|---|---|
| $H(Y)$ | 원래 데이터의 엔트로피 (분류 전) |
| $H(Y|A_i)$ | $A_i$로 분류한 후의 조건부 엔트로피 |
| $IG(Y, A_i)$ | $A_i$를 사용함으로써 얻는 정보 이득 |

### 4.2 Information Gain의 의미

- 불확실성을 최대한 없애는 방향으로 가야 함
- 확실한 부분을 최대한 늘리는 방향으로 가야 함
- **IG가 클수록** 해당 attribute가 데이터를 잘 분류함

### 4.3 최적의 Attribute 선택

**Decision Tree 구축 과정**

1. 모든 attribute에 대해 $IG(Y, A_1), IG(Y, A_2), \ldots, IG(Y, A_{15})$를 계산
2. Information Gain이 가장 높은 attribute를 루트 노드로 선택
3. 해당 attribute의 값에 따라 데이터를 분할
4. 각 분할된 노드에서 위 과정을 반복

### 4.4 구체적인 예시

전체 데이터: 296+, 357- (총 653개)

**Step 1**: $H(Y)$ 계산

$$H(Y) = -(296/653 \times \log_2(296/653) + 357/653 \times \log_2(357/653)) \approx 0.994$$

**Step 2**: A9에 대한 $H(Y|A9)$ 계산

- A9 = true: 284+, 77- (총 361개) → $H(Y|A9=true) \approx 0.764$
- A9 = false: 12+, 280- (총 292개) → $H(Y|A9=false) \approx 0.233$

$$H(Y|A9) = (361/653 \times 0.764) + (292/653 \times 0.233) \approx 0.527$$

**Step 3**: $IG(Y, A9)$ 계산

$$IG(Y, A9) = 0.994 - 0.527 = 0.467$$

**Step 4**: 모든 attribute에 대해 반복하여 최댓값 선택

- $IG(Y, A1) = 0.994 - H(Y|A1)$
- $IG(Y, A2) = 0.994 - H(Y|A2)$
- ...
- 가장 높은 IG를 가진 attribute를 루트로 선택

## 5. ID3 Algorithm

**ID3 (Iterative Dichotomiser 3)** 는 Information Gain을 기반으로 Decision Tree를 구축하는 대표적인 알고리즘 (Quinlan, 1986).

### 5.1 알고리즘 개요

**초기 상태**

- Root node 생성
- 모든 training data를 root node에 할당
- 모든 노드를 "open node"로 표시

**반복 과정**

1. Open node가 존재하는 동안 반복
2. 각 open node에 대해:
   - 해당 노드의 데이터에서 Information Gain이 가장 높은 attribute 선택
   - 선택된 attribute의 값에 따라 데이터를 분할해 자식 노드 생성
   - 자식 노드가 순수(pure)하면 leaf node로 표시, 아니면 open node로 유지
3. 모든 노드가 leaf node가 되면 종료

### 5.2 종료 조건

| 조건 | 처리 |
|---|---|
| **순수 노드 (Pure Node)** | open node에 속한 데이터가 모두 동일한 클래스로 구분되면 leaf node로 종료 |
| **Attribute 소진** | 더 이상 사용할 attribute가 없으면 다수결(majority voting)로 클래스 결정 |

### 5.3 ID3 알고리즘 예시

**초기 데이터**: 296+, 357-

**Iteration 1**

- 모든 attribute의 IG 계산 → A9이 가장 높다고 가정
- Root = A9
  - A9 = true → 284+, 77- (open node)
  - A9 = false → 12+, 280- (open node)

**Iteration 2** (A9 = true 노드)

- 남은 attribute의 IG 계산 → A7이 가장 높다고 가정
- A7 = v → 모두 + (leaf node, 분류 완료)
- A7 = h → 혼합 (open node, 계속 분할)

**Iteration 3** (A9 = false 노드)

- 남은 attribute의 IG 계산 → A3이 가장 높다고 가정
- A3 = u → 모두 - (leaf node)
- A3 = y → 모두 - (leaf node)

이런 방식으로 모든 노드가 순수해질 때까지 반복.

## 6. Overfitting 문제

Decision Tree를 만들 때 발생하는 주요 문제점.

### 6.1 Overfitting의 정의

- Training data set을 100% 정확하게 분류하도록 트리를 만들 수 있음
- 하지만 새로운 test data에 대해서는 예측 정확도가 떨어질 수 있음
- 이는 트리가 training data의 노이즈까지 학습했기 때문

### 6.2 Overfitting 현상

![Overfitting 그래프](images/decision-tree-02.png)

- **Training Accuracy**: Decision Tree의 노드를 계속 늘리면 training data에 대한 정확도는 계속 증가
- **Test Accuracy**: 초반에는 증가하다가, 어느 시점 이후로는 오히려 감소
- **최적 지점**: Test accuracy가 최대가 되는 지점에서 트리 생성을 중단

### 6.3 Overfitting의 원인

- 트리가 너무 깊어지면 training data의 특이 사례(outlier)나 노이즈까지 학습
- 일반화(generalization) 능력이 떨어짐
- Training data에만 특화된 규칙을 만들게 됨

### 6.4 Overfitting 방지 방법

- **Pre-pruning (사전 가지치기)**
  - 트리가 일정 깊이에 도달하면 성장 중단
  - Information Gain이 특정 임계값 이하면 분할 중지
  - 노드의 샘플 수가 최소값 이하면 분할 중지
- **Post-pruning (사후 가지치기)**
  - 완전한 트리를 만든 후 validation set으로 평가하며 가지치기
  - 정확도 향상에 기여하지 않는 서브트리를 제거
- **교차 검증 (Cross-validation)**
  - 데이터를 여러 부분으로 나누어 검증
  - 일반화 성능이 최대가 되는 트리 복잡도 선택
