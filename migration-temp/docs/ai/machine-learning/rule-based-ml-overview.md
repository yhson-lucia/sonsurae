---
title: Rule-based Machine Learning Overview
slug: rule-based-ml-overview
category: ai/machine-learning
summary: 규칙 기반 머신러닝의 완벽한 세계 가정, Function Approximation, Version Space, Candidate Elimination Algorithm과 한계
tags: [ai, ml, rule-based, version-space, candidate-elimination, hypothesis]
sort_order: 2
created: 2025-04-19
updated: 2026-05-10
---

- 머신러닝(Machine Learning)은 경험을 통해 자동으로 배우는 학습 방법
- 규칙 기반 머신러닝은 완벽한 환경에서 데이터의 패턴을 찾아 최적의 가설을 도출하는 방법

## 1. Perfect World for Rule Based Learning

규칙 기반 학습이 이상적으로 작동하기 위한 완벽한 세계의 조건.

### 1.1 날씨 예측 문제 예시

다음 6가지 속성으로 야외 활동 여부(Yes/No)를 예측하는 문제.

| 속성 | 값 |
|---|---|
| **Sky** | Sunny, Cloudy, Rainy |
| **Temp** | Warm, Cold |
| **Humid** | Normal, High |
| **Wind** | Strong, Weak |
| **Water** | Warm, Cool |
| **Forecast** | Same, Change |

### 1.2 기본 조건

- 모든 관측이 완벽하게 가능하고 일관적임 (No inconsistent observations)
- 확률적 요소(stochastic elements)가 없음
- 모든 정보가 명확한 규칙 안에 포함됨

이 세 조건이 만족될 때 완벽한 학습 환경이 구성됨.

### 1.3 학습 목표

- 6가지 feature 중 어떤 feature가 분류에 가장 중요한 영향을 미치는지 찾는 것

## 2. Function Approximation (함수 근사)

Function Approximation은 머신러닝의 핵심 개념. 입력과 출력 사이의 관계를 가설로 모델링하는 과정.

### 2.1 구성 요소

| 요소 | 설명 |
|---|---|
| **Instance X** | 하나의 데이터 샘플 (예: `x₁ = <Sunny, Warm, Normal, Strong, Warm, Same>`) |
| **Label Y** | 출력 값 (예: `Yes`) |
| **Training Dataset D** | 학습에 사용되는 데이터셋 |
| **Hypotheses H** | 여러 가설들의 집합. 각 가설은 특정 조건을 만족하는 Instance를 `Yes`로 분류. `?`는 해당 속성의 값이 무엇이든 상관없음 |
| **Target Function c** | 실제 정답 함수 (찾고자 하는 목표) |

### 2.2 Graphical Representation

![Instance-Hypothesis 매핑](images/rule-based-ml-overview-01.png)

Instance X₁, X₂, X₃가 가설 h에 어떻게 매핑되는지 확인하는 것이 핵심.

### 2.3 가설 예시 분석

다음 세 가지 가설을 비교.

- **h₁**: `<Sunny, ?, ?, ?, Warm, ?>` → Yes
  - "Sky가 Sunny이고 Water가 Warm이면 야외 활동 가능"
  - Humid, Wind, Forecast는 어떤 값이든 상관없음 (가장 General)
- **h₂**: `<Sunny, ?, ?, ?, Warm, Same>` → Yes
  - h₁보다 조건이 하나 더 추가됨 (중간 수준)
- **h₃**: `<Sunny, ?, ?, Strong, Warm, ?>` → Yes
  - h₁과 다른 속성에 조건 추가 (중간 수준)

#### 구체적인 Instance 예시

**x₁** = `<Sunny, Warm, Normal, Strong, Warm, Same>` → Label: `Yes`
- h₁ 만족: Sunny ✓, Warm ✓
- h₂ 만족: Sunny ✓, Warm ✓, Same ✓
- h₃ 만족: Sunny ✓, Strong ✓, Warm ✓
- 결과: x₁은 세 가설 모두를 만족함

**x₂** = `<Sunny, Cold, High, Weak, Warm, Same>` → Label: `Yes`
- h₁ 만족: Sunny ✓, Warm ✓
- h₂ 만족: Sunny ✓, Warm ✓, Same ✓
- h₃ 불만족: Strong ✗ (실제는 Weak)
- 결과: x₂는 h₁, h₂만 만족

**x₃** = `<Sunny, Warm, Normal, Strong, Warm, Change>` → Label: `Yes`
- h₁ 만족: Sunny ✓, Warm ✓
- h₂ 불만족: Same ✗ (실제는 Change)
- h₃ 만족: Sunny ✓, Strong ✓, Warm ✓
- 결과: x₃는 h₁, h₃만 만족

### 2.4 가설 공간의 특성

- 위 예시에서 x₁은 h₁, h₂, h₃ 모두를 만족하므로 벤다이어그램의 공통 영역에 위치
- Instance와 Hypothesis 사이의 만족 관계를 시각적으로 매핑할 수 있음
- 가설들 사이에는 일반성(General)과 구체성(Specific)의 차이가 있음
  - **General한 가설**: 조건이 느슨해 더 많은 Instance를 포함 (예: h₁)
  - **Specific한 가설**: 조건이 엄격해 적은 Instance만 포함 (예: h₂, h₃)
- h₁이 가장 General하므로 `h₁ ⊇ h₂`, `h₁ ⊇ h₃`의 관계가 성립

### 2.5 Version Space

- 모든 Instance를 완벽하게 만족하는 하나의 Hypothesis를 찾기는 어려움
- 따라서 가능한 가설들의 경계(Boundary)를 설정해야 함
- General한 가설과 Specific한 가설 사이의 공간을 **Version Space**라 함
- Version Space는 데이터와 일치하는 모든 가능한 가설들의 집합

## 3. Candidate Elimination Algorithm

Candidate Elimination Algorithm은 가장 General한 가설과 가장 Specific한 가설의 경계를 점진적으로 좁혀가는 알고리즘.

### 3.1 알고리즘 개요

| 경계 | 설명 | 초기값 |
|---|---|---|
| **General Boundary (G)** | 가능한 가장 일반적인 가설들의 집합 | `<?, ?, ?, ?, ?, ?>` (모든 조건 허용) |
| **Specific Boundary (S)** | 가능한 가장 구체적인 가설들의 집합 | `<∅, ∅, ∅, ∅, ∅, ∅>` (아무것도 허용 X) |

학습 과정에서 새로운 데이터를 관찰하며 두 경계를 조정함.

### 3.2 학습 과정

#### Positive Example이 주어질 때

- **Specific Boundary (S)를 일반화**
  - S가 해당 example을 포함하지 못하면 최소한으로 일반화하여 포함시킴
  - 예: S = `<∅, ∅, ∅, ∅, ∅, ∅>`에 x₁ = `<Sunny, Warm, Normal, Strong, Warm, Same>`이 주어지면
  - S를 `<Sunny, Warm, Normal, Strong, Warm, Same>`으로 업데이트

#### Negative Example이 주어질 때

- **General Boundary (G)를 구체화**
  - G가 해당 example을 포함하면 이를 제외하도록 구체화
  - 하나의 feature만 specialize해도 더 specific한 가설이 됨
  - 예: G = `<?, ?, ?, ?, ?, ?>`에 negative example `<Rainy, Cold, High, Weak, Cool, Change>`가 주어지면 여러 가설로 분화 가능
    - `<Sunny, ?, ?, ?, ?, ?>` (Sky만 제한)
    - `<?, Warm, ?, ?, ?, ?>` (Temp만 제한)
    - `<?, ?, Normal, ?, ?, ?>` (Humid만 제한) 등

#### 구체적인 예시

**Step 1: 초기 상태**
- S = `<∅, ∅, ∅, ∅, ∅, ∅>`
- G = `<?, ?, ?, ?, ?, ?>`

**Step 2: Positive example `<Sunny, Warm, Normal, Strong, Warm, Same>` (Yes) 관찰**
- S 업데이트: `<Sunny, Warm, Normal, Strong, Warm, Same>`
- G 유지: `<?, ?, ?, ?, ?, ?>`

**Step 3: Positive example `<Sunny, Warm, High, Strong, Warm, Same>` (Yes) 관찰**
- S 일반화: `<Sunny, Warm, ?, Strong, Warm, Same>` (Humid 조건 완화)
- G 유지: `<?, ?, ?, ?, ?, ?>`

**Step 4: Negative example `<Rainy, Cold, High, Weak, Cool, Change>` (No) 관찰**
- S 유지: `<Sunny, Warm, ?, Strong, Warm, Same>`
- G 구체화: `<Sunny, ?, ?, ?, ?, ?>`, `<?, Warm, ?, ?, ?, ?>`, `<?, ?, ?, Strong, ?, ?>` 등

### 3.3 알고리즘의 특징

- 두 경계가 수렴하면서 Version Space가 좁아짐
- 최종적으로 데이터와 일치하는 최적의 가설 공간을 찾음
- 효율적으로 가설 공간을 탐색할 수 있음

### 3.4 알고리즘의 한계

- **Instance 부족 문제**: Version Space 내에 만족하는 가설도, 만족하지 못하는 가설도 존재할 수 있음
  - 학습 데이터가 충분하지 않으면 Version Space가 여전히 넓게 남아 어떤 가설이 정답인지 확신할 수 없음

- **완벽한 세계의 가정**: 이 알고리즘은 다음 이상적인 조건에서만 제대로 작동함
  1. 모든 관측이 완벽하게 일관적
  2. 확률적 요소가 없음
  3. Target function이 가설 공간 내에 존재

- **현실 세계의 문제**
  - 실제 데이터에는 노이즈(noise)가 존재
  - 불완전하거나 모순된 관측값이 있을 수 있음
  - 확률적 변동성을 처리할 수 없음
  - 새로운 변수나 예외 상황에 대응할 수 없음

- **결론**: 이러한 한계 때문에 실제 머신러닝에서는 Candidate Elimination Algorithm을 잘 사용하지 않으며, **통계적 학습 방법이나 확률적 모델**을 더 선호함
