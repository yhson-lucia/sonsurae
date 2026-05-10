# Overfitting과 해결 방법

***

## 1. Overfitting (과적합)이란?

### 정의

**Overfitting:**
- **학습 데이터**에서는 굉장히 높은 정확도
- **테스트 데이터**에서는 정확도가 떨어지는 현상
- 모델이 학습 데이터에 **지나치게 맞춰진** 상태

### Overfitting 발생 원리

**문제:**
- 특정 학습 데이터의 패턴을 **과하게 학습**
- Weight 값이 **비정상적으로 커짐**
- **일반화 능력** 상실

**시각적 비교:**

```
언더피팅 (Underfitting):    적절한 피팅:           오버피팅 (Overfitting):

    y                          y                        y
    │    ●  ●                  │    ●  ●                │    ●  ●
    │  ●                       │  ●   ╱                 │  ●  ╱╲
    │ ●                        │ ●   ╱                  │ ●  ╱  ╲●
    │●                         │●   ╱                   │● ╱    ╲
    │   ●                      │   ╱  ●                 │ ╱      ╲●
    └─────── x                 └─────── x               └─────── x

    너무 단순함                 적절한 복잡도             너무 복잡함
    (High Bias)                (Balanced)               (High Variance)
```

### Overfitting vs 정상 학습

| 특성 | 정상 학습 | Overfitting |
|------|----------|-------------|
| **학습 데이터 정확도** | 높음 (85-95%) | 매우 높음 (95-100%) |
| **테스트 데이터 정확도** | 높음 (80-90%) | 낮음 (50-70%) |
| **일반화 능력** | 좋음 | 나쁨 |
| **모델 복잡도** | 적절함 | 과도함 |
| **Weight 크기** | 적당함 | 매우 큼 |
| **결정 경계** | 부드러움 | 구불구불함 |

***

## 2. Overfitting의 원인

### 주요 원인

**1. 학습 데이터 부족**
- 데이터가 적으면 노이즈까지 학습
- 일반적인 패턴을 찾기 어려움

**2. 모델이 너무 복잡함**
- 층이 너무 많음
- 노드 수가 너무 많음
- 파라미터가 데이터에 비해 과다

**3. 학습 시간이 너무 길음**
- Epoch가 너무 많음
- 학습 데이터에 과도하게 최적화

**4. Regularization 부재**
- Weight 제약이 없음
- Weight가 무한정 커질 수 있음

### Weight가 커지는 문제

**Weight가 크면:**

결정 함수가 **구불구불한 형태**가 됨:
$$f(x) = w_1x + w_2x^2 + w_3x^3 + \cdots$$

여기서 $w_i$가 크면:
- 고차항의 영향이 커짐
- 학습 데이터의 작은 변화에 민감
- **과도하게 복잡한 결정 경계** 형성

**예시:**
```python
# Weight가 작을 때 (좋음)
# f(x) = 2x + 0.5x^2
# → 부드러운 곡선

# Weight가 클 때 (나쁨)
# f(x) = 100x + 50x^2 + 30x^3 + 20x^4
# → 구불구불한 곡선, 노이즈까지 학습
```

***

## 3. Regularization (정규화)

### Regularization 개념

**목적:**
- Weight 값이 **너무 커지는 것을 방지**
- 모델의 **복잡도를 제어**
- **일반화 성능 향상**

### L2 Regularization (Ridge)

**수식:**

기존 손실 함수에 페널티 추가:
$$\text{Loss}_{\text{total}} = \text{Loss}_{\text{original}} + \lambda \sum_{i} w_i^2$$

여기서:
- $\text{Loss}_{\text{original}}$: 원래 손실 (MSE, Cross-Entropy 등)
- $\lambda$: Regularization strength (하이퍼파라미터)
- $\sum w_i^2$: Weight의 제곱합 (L2 norm)

**효과:**
- Weight가 클수록 손실이 **추가로 증가**
- 모델이 **작은 Weight를 선호**하도록 유도
- **부드러운 결정 경계** 형성

**PyTorch 구현:**

```python
import torch
import torch.nn as nn
import torch.optim as optim

# 모델 정의
model = nn.Sequential(
    nn.Linear(10, 50),
    nn.ReLU(),
    nn.Linear(50, 1)
)

# L2 Regularization은 weight_decay 파라미터로 설정
optimizer = optim.Adam(model.parameters(), lr=0.001, weight_decay=0.01)
# weight_decay = λ (lambda)

# 학습
for epoch in range(100):
    optimizer.zero_grad()
    output = model(X)
    loss = criterion(output, Y)
    loss.backward()
    optimizer.step()  # weight_decay가 자동으로 적용됨
```

### L1 Regularization (Lasso)

**수식:**
$$\text{Loss}_{\text{total}} = \text{Loss}_{\text{original}} + \lambda \sum_{i} |w_i|$$

**특징:**
- Weight의 **절댓값 합**을 페널티로 사용
- 일부 Weight를 **정확히 0**으로 만듦 (Feature Selection)
- **희소한 모델** (Sparse Model) 생성

**PyTorch 구현:**

```python
# L1 Regularization은 수동으로 추가
def l1_regularization(model, lambda_l1):
    l1_norm = sum(p.abs().sum() for p in model.parameters())
    return lambda_l1 * l1_norm

# 학습 루프
for epoch in range(100):
    optimizer.zero_grad()
    output = model(X)
    loss = criterion(output, Y)

    # L1 페널티 추가
    loss = loss + l1_regularization(model, lambda_l1=0.01)

    loss.backward()
    optimizer.step()
```

### L1 vs L2 비교

| 특성 | L1 Regularization | L2 Regularization |
|------|------------------|------------------|
| **페널티** | $\sum \|w_i\|$ | $\sum w_i^2$ |
| **효과** | Feature Selection | Weight Shrinkage |
| **결과** | 일부 Weight = 0 | 모든 Weight 작아짐 |
| **희소성** | 높음 (Sparse) | 낮음 (Dense) |
| **PyTorch** | 수동 구현 | `weight_decay` |
| **사용 사례** | 특성 선택 필요 시 | 일반적인 경우 |

***

## 4. Dropout

### Dropout 개념

**아이디어:**
- 학습 시 **랜덤하게 일부 노드를 제거**
- 남은 노드들로만 학습 진행
- 모든 노드가 **골고루 학습**되도록 유도

**동작 방식:**

```
정상 네트워크:              Dropout 적용 (학습 시):
  ●─●─●                       ●─✗─●
  │╲│╱│                       │  ╱│
  ●─●─●                       ●─●─✗
  │╲│╱│                       │╲│
  ●─●─●                       ●─●─●

  모든 노드 활성화             50%가 비활성화
```

### Dropout이 Overfitting을 방지하는 이유

**1. 노드 간 공동 적응 방지**
- 특정 노드가 다른 노드에 **과도하게 의존** 방지
- 각 노드가 **독립적으로** 유용한 특징 학습

**2. 앙상블 효과**
- 매 학습마다 **다른 서브 네트워크**가 학습됨
- 여러 모델의 **평균 효과**
- 일반화 성능 향상

**3. Weight 분산**
- 특정 Weight가 **과도하게 커지는 것** 방지
- Weight가 **골고루 분산**

### PyTorch 구현

```python
import torch
import torch.nn as nn

class DropoutNet(nn.Module):
    def __init__(self):
        super(DropoutNet, self).__init__()
        self.fc1 = nn.Linear(100, 128)
        self.dropout1 = nn.Dropout(p=0.5)  # 50% 노드 제거
        self.fc2 = nn.Linear(128, 64)
        self.dropout2 = nn.Dropout(p=0.3)  # 30% 노드 제거
        self.fc3 = nn.Linear(64, 10)

    def forward(self, x):
        x = torch.relu(self.fc1(x))
        x = self.dropout1(x)  # 학습 시에만 적용됨
        x = torch.relu(self.fc2(x))
        x = self.dropout2(x)
        x = self.fc3(x)
        return x

# 모델 생성
model = DropoutNet()

# 학습 모드
model.train()  # Dropout 활성화
for epoch in range(100):
    optimizer.zero_grad()
    output = model(X_train)
    loss = criterion(output, Y_train)
    loss.backward()
    optimizer.step()

# 테스트 모드
model.eval()   # Dropout 비활성화 (모든 노드 사용)
with torch.no_grad():
    output = model(X_test)
    accuracy = calculate_accuracy(output, Y_test)
```

### Dropout 주의사항

**중요:**
- **학습 시**: Dropout 활성화 (`model.train()`)
- **테스트 시**: Dropout 비활성화 (`model.eval()`)
- 테스트 시 모든 노드를 사용해야 최고 성능

**Dropout Rate 선택:**
- 너무 낮음 (0.1): Overfitting 방지 효과 적음
- 적절함 (0.3-0.5): 일반적으로 좋은 성능
- 너무 높음 (0.8): Underfitting 위험

***

## 5. Ensemble (앙상블)

### Ensemble 개념

**아이디어:**
- **여러 개의 독립적인 모델**을 학습
- 각 모델의 예측을 **결합**
- 더 강건하고 정확한 예측

**과정:**

```
Model 1 (독립 학습) → Prediction 1 ┐
Model 2 (독립 학습) → Prediction 2 ├→ 최종 예측 (투표/평균)
Model 3 (독립 학습) → Prediction 3 ┘
```

### Ensemble 방법

**1. Voting (투표)**

분류 문제에서 **다수결**:
```python
# 3개 모델의 예측
model1_pred = 0  # Class 0
model2_pred = 1  # Class 1
model3_pred = 0  # Class 0

# 최종 예측: Class 0 (2표)
final_pred = mode([model1_pred, model2_pred, model3_pred])
```

**2. Averaging (평균)**

회귀 문제에서 **평균**:
```python
# 3개 모델의 예측
model1_pred = 5.2
model2_pred = 5.8
model3_pred = 5.5

# 최종 예측: 5.5
final_pred = mean([model1_pred, model2_pred, model3_pred])
```

**3. Weighted Average (가중 평균)**

성능에 따라 **가중치 부여**:
```python
# 가중치 (정확도에 비례)
weights = [0.5, 0.3, 0.2]

# 가중 평균
final_pred = 0.5 * model1_pred + 0.3 * model2_pred + 0.2 * model3_pred
```

### PyTorch 구현

```python
import torch
import torch.nn as nn

# 동일한 구조의 모델 5개 생성
def create_model():
    return nn.Sequential(
        nn.Linear(100, 128),
        nn.ReLU(),
        nn.Dropout(0.5),
        nn.Linear(128, 10)
    )

# 앙상블: 5개 모델
models = [create_model() for _ in range(5)]

# 각 모델을 독립적으로 학습
for i, model in enumerate(models):
    print(f"Training model {i+1}/5")
    optimizer = torch.optim.Adam(model.parameters(), lr=0.001)

    for epoch in range(50):
        optimizer.zero_grad()
        output = model(X_train)
        loss = criterion(output, Y_train)
        loss.backward()
        optimizer.step()

# 테스트: 앙상블 예측
def ensemble_predict(models, X):
    predictions = []
    for model in models:
        model.eval()
        with torch.no_grad():
            pred = model(X)
            predictions.append(pred)

    # 평균
    ensemble_pred = torch.stack(predictions).mean(dim=0)
    return ensemble_pred

# 최종 예측
final_output = ensemble_predict(models, X_test)
```

### Ensemble의 장점

**1. 정확도 향상**
- 여러 모델의 **오류를 상쇄**
- 단일 모델보다 **높은 성능**

**2. 강건성 (Robustness)**
- 특정 모델의 **실패에 덜 민감**
- 안정적인 예측

**3. Overfitting 감소**
- 각 모델의 Overfitting이 **평균화됨**
- 일반화 성능 향상

### Ensemble의 단점

**1. 계산 비용**
- 여러 모델 학습 → **시간과 메모리 증가**
- 추론 시에도 모든 모델 실행 필요

**2. 복잡성**
- 모델 관리가 복잡
- 디버깅 어려움

***

## 6. Overfitting 방지 종합 전략

### 방법별 비교

| 방법 | 원리 | 장점 | 단점 | 적용 시기 |
|------|------|------|------|----------|
| **Regularization (L2)** | Weight 제약 | 간단, 효과적 | 하이퍼파라미터 조정 필요 | 기본적으로 항상 |
| **Dropout** | 랜덤 노드 제거 | 강력한 효과 | 학습 느려짐 | 큰 네트워크 |
| **Ensemble** | 여러 모델 결합 | 최고 성능 | 비용 많이 듦 | 최종 성능 극대화 |
| **Data Augmentation** | 데이터 증강 | 근본적 해결 | 데이터 생성 필요 | 데이터 부족 시 |
| **Early Stopping** | 학습 조기 종료 | 간단 | 최적 시점 찾기 어려움 | 항상 |

### 실전 조합 예시

**기본 설정 (항상 사용):**
```python
model = nn.Sequential(
    nn.Linear(100, 128),
    nn.ReLU(),
    nn.Linear(128, 10)
)

# L2 Regularization (기본)
optimizer = torch.optim.Adam(
    model.parameters(),
    lr=0.001,
    weight_decay=0.01  # L2 정규화
)
```

**중간 복잡도 (Dropout 추가):**
```python
model = nn.Sequential(
    nn.Linear(100, 128),
    nn.ReLU(),
    nn.Dropout(0.5),  # Dropout 추가
    nn.Linear(128, 64),
    nn.ReLU(),
    nn.Dropout(0.3),
    nn.Linear(64, 10)
)

optimizer = torch.optim.Adam(
    model.parameters(),
    lr=0.001,
    weight_decay=0.01
)
```

**최고 성능 (Ensemble):**
```python
# 5개 모델 앙상블 + Dropout + Regularization
models = []
for i in range(5):
    model = nn.Sequential(
        nn.Linear(100, 128),
        nn.ReLU(),
        nn.Dropout(0.5),
        nn.Linear(128, 64),
        nn.ReLU(),
        nn.Dropout(0.3),
        nn.Linear(64, 10)
    )
    models.append(model)

# 각 모델을 L2 정규화로 학습
for model in models:
    optimizer = torch.optim.Adam(
        model.parameters(),
        lr=0.001,
        weight_decay=0.01
    )
    # ... 학습 진행
```

***

## 7. Overfitting 진단

### 학습 곡선 분석

```python
import matplotlib.pyplot as plt

# 학습 및 검증 손실 기록
train_losses = []
val_losses = []

for epoch in range(100):
    # 학습
    model.train()
    train_loss = train_one_epoch(model, train_loader, optimizer, criterion)
    train_losses.append(train_loss)

    # 검증
    model.eval()
    val_loss = evaluate(model, val_loader, criterion)
    val_losses.append(val_loss)

# 시각화
plt.figure(figsize=(10, 6))
plt.plot(train_losses, label='Train Loss')
plt.plot(val_losses, label='Validation Loss')
plt.xlabel('Epoch')
plt.ylabel('Loss')
plt.legend()
plt.title('Learning Curves')
plt.grid(True)
plt.show()
```

### Overfitting 판단 기준

**정상 학습:**
```
Train Loss: ↓↓↓
Val Loss:   ↓↓↓
```

**Overfitting 발생:**
```
Train Loss: ↓↓↓↓↓ (계속 감소)
Val Loss:   ↓↓↑↑↑ (증가 시작)
```

**Underfitting:**
```
Train Loss: ↓── (높은 값에서 정체)
Val Loss:   ↓── (높은 값에서 정체)
```

***

## 8. 핵심 정리

### Overfitting의 특징

**증상:**
- 학습 데이터: 매우 높은 정확도 (95-100%)
- 테스트 데이터: 낮은 정확도 (50-70%)
- Weight 값이 비정상적으로 큼
- 구불구불한 결정 경계

**원인:**
- 학습 데이터 부족
- 모델이 너무 복잡함
- 학습 시간이 너무 길음
- Regularization 부재

### 해결 방법

**1. Regularization (정규화)**
- L2: Weight 제곱합 페널티 (`weight_decay`)
- L1: Weight 절댓값 페널티 (Feature Selection)
- 효과: Weight 크기 제한, 부드러운 모델

**2. Dropout**
- 랜덤하게 노드 제거
- 학습 시만 적용, 테스트 시 모든 노드 사용
- 효과: 노드 간 독립성, 앙상블 효과

**3. Ensemble**
- 여러 독립 모델 학습 후 결합
- Voting, Averaging, Weighted Average
- 효과: 최고 성능, 강건성

### 실무 가이드

**기본 원칙:**
1. 항상 L2 Regularization 사용 (`weight_decay=0.01`)
2. 깊은 네트워크는 Dropout 추가 (0.3-0.5)
3. 중요한 작업은 Ensemble 고려 (3-5개 모델)
4. Early Stopping으로 과학습 방지
5. 학습/검증 곡선으로 지속 모니터링

**선택 기준:**
- **간단한 문제**: L2 Regularization만
- **중간 복잡도**: L2 + Dropout
- **고난이도/중요**: L2 + Dropout + Ensemble

***