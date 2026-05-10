***
## 1. Learning Rate (학습률)

### 1.1 Learning Rate의 역할

- **정의**
	- 경사 하강법에서 파라미터 업데이트 크기를 조절하는 하이퍼파라미터
	- 손실 함수의 기울기를 얼마나 반영할지 결정

- **업데이트 공식**
$$W_{\text{new}} = W_{\text{old}} - \alpha \frac{\partial \text{Loss}}{\partial W}$$

- **구성 요소**
	- $\alpha$: Learning Rate (학습률)
	- $\frac{\partial \text{Loss}}{\partial W}$: 손실에 대한 가중치의 기울기
	- Learning Rate가 클수록 큰 폭으로 업데이트

### 1.2 Learning Rate가 너무 큰 경우

- **문제점**
	- 큰 폭으로 Weight 값이 변화
	- Step이 너무 커서 최적값을 건너뜀
	- 최적값 주변에서 왔다갔다하며 발산

- **시각화**
	```
	Loss
	  ^
	  |     /\    /\
	  |    /  \  /  \
	  |   /    \/    \
	  |  /            \
	  +----------------> W
	     발산하는 모습
	```

- **증상**
	- 손실 값이 감소하지 않음
	- 손실 값이 계속 증가
	- NaN (Not a Number) 발생

### 1.3 Learning Rate가 너무 작은 경우

- **문제점**
	- 학습 속도가 매우 느림
	- 많은 Step 필요
	- 최적값 도달에 오래 걸림
	- Local Minimum에 갇힐 위험

- **시각화**
	```
	Loss
	  ^
	  |
	  |     ___
	  |    /
	  |___/
	  +-----------> W
	     느린 수렴
	```

### 1.4 적절한 Learning Rate 설정

- **실험적 접근**
	1. 초기값 설정 (보통 0.01, 0.001 등)
	2. 손실 함수 출력 확인
	3. 손실이 발산하면 → Learning Rate 감소
	4. 수렴이 너무 느리면 → Learning Rate 증가
	5. 반복 조정

- **일반적인 범위**
	- `0.1`: 큰 학습률
	- `0.01`: 보통 사용
	- `0.001`: 작은 학습률
	- `0.0001`: 매우 작은 학습률

- **환경에 따른 조정**
	- 데이터셋 크기
	- 모델 복잡도
	- 배치 크기
	- 특별한 정답은 없음 → 실험 필요

***
## 2. 데이터 정규화 (Data Normalization)

### 2.1 정규화의 필요성

- **Feature Scale 불균형 문제**
	- x₁과 x₂의 값 차이가 큰 경우
	- 예: x₁ ∈ [0, 1], x₂ ∈ [0, 1000]
	- 결과: w₁, w₂의 크기 차이가 매우 큼

- **등고선 형태**
	```
	Loss 등고선 (정규화 전)
	      w2
	       ^
	       |  o o
	       | o   o  (타원형 - 불균형)
	       |o     o
	       +--------> w1

	Loss 등고선 (정규화 후)
	      w2
	       ^
	       |   o o
	       |  o   o  (원형 - 균형)
	       |   o o
	       +--------> w1
	```

- **학습률 문제**
	- 불균형한 등고선 → 학습률 설정 어려움
	- 한 방향으로 발산하거나 느린 수렴
	- 정규화로 해결 가능

### 2.2 Zero-Centered Data (표준화)

- **Standardization (표준화)**

$$x'_j = \frac{x_j - \mu_j}{\sigma_j}$$

- **구성 요소**
	- $x_j$: 원본 데이터
	- $\mu_j$: 평균 (mean)
	- $\sigma_j$: 표준편차 (standard deviation)
	- $x'_j$: 정규화된 데이터

- **특징**
	- 평균: 0
	- 표준편차: 1
	- 범위: 대략 [-3, 3]

- **PyTorch 구현**
	```python
	mean = X.mean(dim=0)
	std = X.std(dim=0)
	X_normalized = (X - mean) / std
	```

### 2.3 Min-Max Normalization

- **정의**

$$x'_j = \frac{x_j - \min(x_j)}{\max(x_j) - \min(x_j)}$$

- **특징**
	- 범위: [0, 1]
	- 최솟값 → 0
	- 최댓값 → 1

- **PyTorch 구현**
	```python
	X_min = X.min(dim=0)[0]
	X_max = X.max(dim=0)[0]
	X_normalized = (X - X_min) / (X_max - X_min)
	```

### 2.4 정규화의 효과

- **장점**
	1. 학습 속도 향상
	2. 안정적인 경사 하강법
	3. 더 큰 Learning Rate 사용 가능
	4. 수치적 안정성 향상

- **주의사항**
	- 학습 데이터의 평균/표준편차 저장
	- 테스트 데이터에도 동일한 파라미터 적용
	```python
	# 학습 시
	train_mean = X_train.mean(dim=0)
	train_std = X_train.std(dim=0)
	X_train_norm = (X_train - train_mean) / train_std

	# 테스트 시 (학습 데이터의 파라미터 사용!)
	X_test_norm = (X_test - train_mean) / train_std
	```

***
## 3. Overfitting (과적합)

### 3.1 Overfitting이란?

- **정의**
	- 학습 데이터에 과도하게 맞춰진 모델
	- 학습 데이터의 노이즈까지 학습
	- 새로운 데이터에 대한 일반화 능력 저하

- **증상**
	- 학습 정확도: 매우 높음 (90%+)
	- 테스트 정확도: 낮음 (60%)
	- 학습 손실: 계속 감소
	- 테스트 손실: 증가 또는 정체

### 3.2 Overfitting 시각화

```
정확도
  ^
  |  Train Acc (계속 상승)
  |      ___________
  | ____/
  |
  |     Test Acc (정체/감소)
  |  _____
  | /     \____
  +----------------> Epoch
         Overfitting 시작
```

### 3.3 Underfitting vs Good Fit vs Overfitting

| 구분 | Underfitting | Good Fit | Overfitting |
|------|-------------|----------|-------------|
| **학습 정확도** | 낮음 | 높음 | 매우 높음 |
| **테스트 정확도** | 낮음 | 높음 | 낮음 |
| **모델 복잡도** | 너무 단순 | 적절 | 너무 복잡 |
| **학습 데이터** | 제대로 학습 안 됨 | 잘 학습됨 | 과도하게 학습됨 |
| **일반화 능력** | 낮음 | 높음 | 낮음 |

***
## 4. Overfitting 해결 방법

### 4.1 더 많은 학습 데이터

- **데이터 증강 (Data Augmentation)**
	- 기존 데이터를 변형하여 새 데이터 생성
	- 이미지: 회전, 뒤집기, 크롭, 색상 변경
	- 텍스트: 동의어 교체, 역번역

- **데이터 수집**
	- 더 많은 학습 샘플 확보
	- 다양한 케이스 포함
	- 중복 데이터 제거

### 4.2 모델 단순화

- **레이어 수 감소**
	```python
	# 복잡한 모델 (Overfitting 위험)
	model = nn.Sequential(
	    nn.Linear(10, 100),
	    nn.ReLU(),
	    nn.Linear(100, 100),
	    nn.ReLU(),
	    nn.Linear(100, 100),
	    nn.ReLU(),
	    nn.Linear(100, 1)
	)

	# 단순한 모델
	model = nn.Sequential(
	    nn.Linear(10, 20),
	    nn.ReLU(),
	    nn.Linear(20, 1)
	)
	```

- **뉴런 수 감소**
	- 은닉층의 뉴런 수 줄이기
	- 모델의 표현력 감소 → Overfitting 완화

### 4.3 Early Stopping

- **개념**
	- 테스트 손실이 증가하기 시작하면 학습 중단
	- 최적의 에포크에서 멈춤

- **구현**
	```python
	best_loss = float('inf')
	patience = 10
	counter = 0

	for epoch in range(1000):
	    # 학습
	    train_loss = train(model, train_loader)

	    # 검증
	    val_loss = validate(model, val_loader)

	    # Early Stopping 체크
	    if val_loss < best_loss:
	        best_loss = val_loss
	        counter = 0
	        # 최고 모델 저장
	        torch.save(model.state_dict(), 'best_model.pth')
	    else:
	        counter += 1
	        if counter >= patience:
	            print("Early stopping!")
	            break
	```

***
## 5. Regularization (정규화)

### 5.1 Regularization의 개념

- **목적**
	- Weight 값이 너무 커지는 것을 방지
	- 모델의 복잡도 제한
	- 일반화 능력 향상

- **원리**
	- 특정 데이터에 과도하게 맞추면 Weight가 커짐
	- Weight를 작게 유지 → 부드러운 모델
	- 손실 함수에 Weight 크기에 대한 페널티 추가

### 5.2 L2 Regularization (Weight Decay)

- **손실 함수**

$$\text{Loss}_{\text{total}} = \text{Loss}_{\text{original}} + \lambda \sum_{i} w_i^2$$

- **구성 요소**
	- $\text{Loss}_{\text{original}}$: 원래 손실 함수 (MSE, Cross-Entropy 등)
	- $\lambda$: Regularization Strength (정규화 강도)
	- $\sum w_i^2$: Weight의 제곱합 (L2 Norm)

- **효과**
	- Weight가 클수록 손실 증가
	- 최적화 시 Weight를 작게 유지
	- 부드러운 결정 경계

### 5.3 Regularization Strength (λ)

- **λ 값의 의미**
	- λ = 0: Regularization 없음
	- λ 작음 (0.0001): 약한 정규화
	- λ 큼 (1.0): 강한 정규화

- **λ 선택**
	- 너무 작으면: 효과 미미
	- 너무 크면: Underfitting (모델이 너무 단순해짐)
	- 적절한 값: 실험적으로 결정 (0.001 ~ 0.1)

### 5.4 PyTorch 구현

- **옵티마이저에 weight_decay 사용**
	```python
	# L2 Regularization 적용
	optimizer = torch.optim.SGD(
	    model.parameters(),
	    lr=0.01,
	    weight_decay=0.001  # λ = 0.001
	)
	```

- **수동 구현**
	```python
	criterion = nn.MSELoss()
	lambda_reg = 0.001

	for epoch in range(100):
	    optimizer.zero_grad()

	    # 순전파
	    output = model(X)
	    loss = criterion(output, Y)

	    # L2 Regularization 추가
	    l2_reg = 0
	    for param in model.parameters():
	        l2_reg += torch.sum(param ** 2)
	    loss = loss + lambda_reg * l2_reg

	    # 역전파
	    loss.backward()
	    optimizer.step()
	```

### 5.5 L1 Regularization

- **손실 함수**

$$\text{Loss}_{\text{total}} = \text{Loss}_{\text{original}} + \lambda \sum_{i} |w_i|$$

- **L1 vs L2 비교**

| 구분 | L1 Regularization | L2 Regularization |
|------|-------------------|-------------------|
| **수식** | $\lambda \sum \|w_i\|$ | $\lambda \sum w_i^2$ |
| **효과** | Sparse Weight (0 많음) | Weight 전반적 감소 |
| **특징 선택** | 자동 특징 선택 | 모든 특징 유지 |
| **사용 사례** | 특징이 많을 때 | 일반적인 경우 |

### 5.6 Elastic Net (L1 + L2)

- **손실 함수**

$$\text{Loss}_{\text{total}} = \text{Loss}_{\text{original}} + \lambda_1 \sum |w_i| + \lambda_2 \sum w_i^2$$

- **장점**
	- L1과 L2의 장점 결합
	- 특징 선택 + Weight 감소

***
## 6. Dropout

### 6.1 Dropout의 개념

- **정의**
	- 학습 시 무작위로 일부 뉴런 비활성화
	- 각 배치마다 다른 뉴런 조합으로 학습
	- 앙상블 효과

- **Dropout 비율**
	- 0.5: 50% 뉴런 비활성화 (일반적)
	- 0.2: 20% 뉴런 비활성화 (약한 Dropout)
	- 0.8: 80% 뉴런 비활성화 (강한 Dropout)

### 6.2 PyTorch 구현

```python
import torch.nn as nn

class Model(nn.Module):
    def __init__(self):
        super(Model, self).__init__()
        self.fc1 = nn.Linear(10, 50)
        self.dropout1 = nn.Dropout(0.5)  # 50% 드롭아웃
        self.fc2 = nn.Linear(50, 20)
        self.dropout2 = nn.Dropout(0.3)  # 30% 드롭아웃
        self.fc3 = nn.Linear(20, 1)

    def forward(self, x):
        x = torch.relu(self.fc1(x))
        x = self.dropout1(x)  # 학습 시에만 적용
        x = torch.relu(self.fc2(x))
        x = self.dropout2(x)
        x = self.fc3(x)
        return x

# 학습 모드
model.train()  # Dropout 활성화

# 평가 모드
model.eval()  # Dropout 비활성화
```

### 6.3 Dropout의 효과

- **Overfitting 방지**
	- 특정 뉴런에 의존하지 않음
	- 강건한 특징 학습
	- 일반화 능력 향상

- **주의사항**
	- 학습 시에만 적용
	- 테스트/추론 시 비활성화 (`model.eval()`)
	- Dropout 비율이 너무 높으면 Underfitting

***
## 7. 실전 팁

### 7.1 Learning Rate 스케줄링

- **Learning Rate Decay**
	```python
	# StepLR: 일정 에포크마다 감소
	scheduler = torch.optim.lr_scheduler.StepLR(
	    optimizer, step_size=30, gamma=0.1
	)

	for epoch in range(100):
	    train(...)
	    scheduler.step()  # Learning Rate 업데이트
	```

- **다양한 스케줄러**
	- `StepLR`: 일정 간격으로 감소
	- `ExponentialLR`: 지수적 감소
	- `ReduceLROnPlateau`: 성능 정체 시 감소
	- `CosineAnnealingLR`: 코사인 함수로 감소

### 7.2 데이터 분할

```python
# 학습/검증/테스트 분할 (70:15:15)
from sklearn.model_selection import train_test_split

# 학습 + 검증 vs 테스트
X_temp, X_test, y_temp, y_test = train_test_split(
    X, y, test_size=0.15, random_state=42
)

# 학습 vs 검증
X_train, X_val, y_train, y_val = train_test_split(
    X_temp, y_temp, test_size=0.176, random_state=42  # 0.176 ≈ 15/85
)
```

### 7.3 Regularization 조합

```python
# 여러 기법 동시 사용
model = nn.Sequential(
    nn.Linear(100, 50),
    nn.ReLU(),
    nn.Dropout(0.5),      # Dropout
    nn.Linear(50, 20),
    nn.ReLU(),
    nn.Dropout(0.3),
    nn.Linear(20, 1)
)

# L2 Regularization
optimizer = torch.optim.Adam(
    model.parameters(),
    lr=0.001,
    weight_decay=0.01  # L2 정규화
)
```

***
## 8. 핵심 정리

### 8.1 Learning Rate

- **역할**
	- 파라미터 업데이트 크기 조절
	- 학습 속도와 안정성에 영향

- **설정 원칙**
	- 너무 크면: 발산
	- 너무 작으면: 느린 수렴
	- 실험적으로 조정 (보통 0.01, 0.001)

### 8.2 데이터 정규화

- **방법**
	- 표준화 (Standardization): 평균 0, 표준편차 1
	- Min-Max: [0, 1] 범위로 변환

- **효과**
	- 학습 속도 향상
	- 안정적인 경사 하강법
	- 더 큰 Learning Rate 사용 가능

### 8.3 Overfitting 해결

- **방법**
	1. 더 많은 데이터
	2. 모델 단순화
	3. Early Stopping
	4. Regularization (L1, L2)
	5. Dropout

- **진단**
	- 학습/테스트 정확도 차이 확인
	- 손실 곡선 모니터링

### 8.4 Regularization

- **L2 Regularization**
	- 손실 함수에 $\lambda \sum w^2$ 추가
	- PyTorch: `weight_decay` 파라미터

- **Dropout**
	- 무작위 뉴런 비활성화
	- 앙상블 효과

***
## 9. 실전 예제

```python
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset
from sklearn.model_selection import train_test_split

# 데이터 준비 및 정규화
X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2)

# 표준화
train_mean = X_train.mean(dim=0)
train_std = X_train.std(dim=0)
X_train = (X_train - train_mean) / train_std
X_val = (X_val - train_mean) / train_std

# 모델 정의 (Dropout 포함)
class RegularizedModel(nn.Module):
    def __init__(self):
        super(RegularizedModel, self).__init__()
        self.fc1 = nn.Linear(10, 50)
        self.dropout1 = nn.Dropout(0.5)
        self.fc2 = nn.Linear(50, 20)
        self.dropout2 = nn.Dropout(0.3)
        self.fc3 = nn.Linear(20, 1)

    def forward(self, x):
        x = torch.relu(self.fc1(x))
        x = self.dropout1(x)
        x = torch.relu(self.fc2(x))
        x = self.dropout2(x)
        x = self.fc3(x)
        return x

model = RegularizedModel()

# 손실 함수 및 옵티마이저 (L2 Regularization)
criterion = nn.MSELoss()
optimizer = torch.optim.Adam(
    model.parameters(),
    lr=0.001,
    weight_decay=0.01  # L2 정규화
)

# Learning Rate Scheduler
scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(
    optimizer, mode='min', factor=0.5, patience=5
)

# Early Stopping 설정
best_val_loss = float('inf')
patience = 10
counter = 0

# 학습
for epoch in range(100):
    # 학습 모드
    model.train()
    optimizer.zero_grad()
    train_output = model(X_train)
    train_loss = criterion(train_output, y_train)
    train_loss.backward()
    optimizer.step()

    # 검증 모드
    model.eval()
    with torch.no_grad():
        val_output = model(X_val)
        val_loss = criterion(val_output, y_val)

    # Learning Rate 조정
    scheduler.step(val_loss)

    # Early Stopping
    if val_loss < best_val_loss:
        best_val_loss = val_loss
        counter = 0
        torch.save(model.state_dict(), 'best_model.pth')
    else:
        counter += 1
        if counter >= patience:
            print(f"Early stopping at epoch {epoch}")
            break

    if epoch % 10 == 0:
        print(f'Epoch {epoch}: Train Loss={train_loss.item():.4f}, '
              f'Val Loss={val_loss.item():.4f}')

# 최고 모델 로드
model.load_state_dict(torch.load('best_model.pth'))
```