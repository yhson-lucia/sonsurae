## 0. 전체 코드 예시 - 기본

- **로지스틱 회귀 실습 코드**
	- 2개의 입력 특징에서 이진 분류(0 또는 1) 수행
	- 선형 회귀 + Sigmoid 활성화 함수
	- Binary Cross-Entropy Loss 사용

```python
import torch
from torch.autograd import Variable
import torch.nn as nn
import numpy as np

torch.manual_seed(777)  # 재현성을 위한 난수 고정

# 학습 데이터 준비
x_data = np.array([[1,2], [2,3], [3,1], [4,3], [5,3], [6,2]], dtype=np.float32)
y_data = np.array([[0], [0], [1], [1], [1], [1]], dtype=np.float32)
# 로지스틱 회귀: 정답을 0 또는 1로 표현 (이진 분류)

# NumPy 배열을 텐서로 변환
X = Variable(torch.from_numpy(x_data))
Y = Variable(torch.from_numpy(y_data))

# 모델 정의: 선형 회귀 + Sigmoid
linear = nn.Linear(in_features=x_data.shape[1], out_features=y_data.shape[1], bias=True)
sigmoid = nn.Sigmoid()
model = nn.Sequential(linear, sigmoid)

# 옵티마이저
optimizer = torch.optim.SGD(model.parameters(), lr=0.01)

# 학습 루프
for step in range(1000):
    optimizer.zero_grad()

    # 순전파: 선형 회귀 → Sigmoid
    hypothesis = model(X)

    # Binary Cross-Entropy Loss (수동 계산)
    cost = -(Y * torch.log(hypothesis) + (1 - Y) * torch.log(1 - hypothesis)).mean()

    # 역전파
    cost.backward()

    # 파라미터 업데이트
    optimizer.step()

    # 예측 및 정확도 계산
    predict = (model(X).data > 0.5).float()  # 0.5를 임계값으로 0/1 분류
    accuracy = (predict == Y.data).float().mean()

    if step % 100 == 0:
        print(f'Step: {step}, Cost: {cost.item():.4f}, Accuracy: {accuracy.item():.4f}')

# 최종 결과
print("\nHypothesis: ", hypothesis.data.numpy())
print("Predicted: ", predict.numpy())
print("Accuracy: ", accuracy)
```

***
## 0-2. 전체 코드 예시 - CSV 데이터

- **당뇨병 데이터셋 분류**
	- CSV 파일에서 실전 데이터 로드
	- 다중 입력 특징으로 당뇨병 여부 예측

```python
import torch
import torch.nn as nn
import numpy as np

# CSV 파일에서 데이터 로드
xy = np.loadtxt('data-03-diabetes.csv', delimiter=',', dtype=np.float32)
x_data_set = xy[:, 0:-1]  # 행 전체, 마지막 열 제외
y_data_set = xy[:, [-1]]  # 행 전체, 마지막 열만

# NumPy → PyTorch 텐서 변환
X_tensor = torch.from_numpy(x_data_set)
Y_tensor = torch.from_numpy(y_data_set)

# 모델 정의
linear_layer = nn.Linear(in_features=X_tensor.shape[1],
                         out_features=Y_tensor.shape[1],
                         bias=True)
sigmoid_layer = nn.Sigmoid()
model = nn.Sequential(linear_layer, sigmoid_layer)

# 옵티마이저
optimizer = torch.optim.SGD(model.parameters(), lr=0.1)

# 학습 루프
for step in range(10001):
    optimizer.zero_grad()

    # 순전파
    data = model(X_tensor)

    # Binary Cross-Entropy Loss
    loss = -(Y_tensor * torch.log(data) +
             (1 - Y_tensor) * torch.log(1 - data)).mean()

    # 역전파
    loss.backward()

    # 파라미터 업데이트
    optimizer.step()

    # 정확도 계산
    if step % 1000 == 0:
        predicted = (model(X_tensor).data > 0.5).float()
        accuracy = (predicted == Y_tensor.data).float().mean()
        print(f'Step: {step}, Loss: {loss.item():.4f}, Accuracy: {accuracy.item():.4f}')
```

***
## 1. 로지스틱 회귀 개념

- **로지스틱 회귀 (Logistic Regression)**
	- 선형 회귀의 출력에 활성화 함수를 추가하여 분류 문제를 해결
	- 이진 분류: 출력값을 0 또는 1로 예측
	- Sigmoid 함수로 0~1 사이의 확률 값으로 변환

- **구조**
	```
	입력 X → 선형 변환 (WX + b) → Sigmoid(σ) → 출력 (0~1)
	```

- **수식**
$$H(X) = \sigma(WX + b) = \frac{1}{1 + e^{-(WX + b)}}$$

***
## 2. 데이터 준비

- **입력 데이터 (X)**
	```python
	x_data = [[1,2], [2,3], [3,1], [4,3], [5,3], [6,2]]
	```
	- 6개의 샘플
	- 각 샘플은 2개의 특징
	- shape: (6, 2)

- **출력 데이터 (Y)**
	```python
	y_data = [[0], [0], [1], [1], [1], [1]]
	```
	- 6개의 레이블
	- 이진 분류: 0 또는 1
	- shape: (6, 1)

- **데이터 타입 지정**
	```python
	dtype=np.float32
	```
	- PyTorch는 기본적으로 float32 사용
	- NumPy 배열 생성 시 dtype 명시 권장

***
## 3. 모델 구조

### 3.1 선형 레이어

```python
linear = nn.Linear(in_features=x_data.shape[1],  # 입력 차원: 2
                   out_features=y_data.shape[1],  # 출력 차원: 1
                   bias=True)                     # 편향 사용
```

- **파라미터**
	- `in_features`: 입력 특징 개수 (2)
	- `out_features`: 출력 개수 (1)
	- `bias`: 편향 사용 여부

### 3.2 Sigmoid 레이어

```python
sigmoid = nn.Sigmoid()
```

- **Sigmoid 함수**
	- 선형 레이어의 출력을 0~1 사이로 변환
	- 확률로 해석 가능

### 3.3 Sequential 모델

```python
model = nn.Sequential(linear, sigmoid)
```

- **nn.Sequential**
	- 여러 레이어를 순차적으로 연결
	- 데이터가 linear → sigmoid 순서로 통과
	- 간단한 순차 모델 구성에 유용

***
## 4. 손실 함수 (Binary Cross-Entropy)

- **수동 구현**
	```python
	cost = -(Y * torch.log(hypothesis) +
	         (1 - Y) * torch.log(1 - hypothesis)).mean()
	```

- **수식**
$$\text{BCE} = -\frac{1}{m}\sum_{i=1}^{m}\left[y^{(i)} \log(h^{(i)}) + (1 - y^{(i)}) \log(1 - h^{(i)})\right]$$

- **구성 요소**
	- `Y * torch.log(hypothesis)`: y=1일 때의 손실
	- `(1-Y) * torch.log(1-hypothesis)`: y=0일 때의 손실
	- `.mean()`: 모든 샘플의 평균 손실

- **왜 MSE를 사용하지 않는가?**
	- Sigmoid + MSE는 non-convex 형태
	- Local minimum 문제 발생
	- BCE는 convex 형태로 최적화가 용이

***
## 5. Variable 사용

- **torch.autograd.Variable**
	```python
	X = Variable(torch.from_numpy(x_data))
	Y = Variable(torch.from_numpy(y_data))
	```

- **Variable의 역할**
	- PyTorch 초기 버전에서 자동 미분을 위해 사용
	- 텐서를 Variable로 감싸서 그래디언트 추적
	- **현대 PyTorch (1.0+)**에서는 불필요
		- 일반 텐서가 자동으로 그래디언트 추적
		- 하위 호환성을 위해 여전히 동작

- **최신 버전 권장 방식**
	```python
	# Variable 없이 사용 (권장)
	X = torch.from_numpy(x_data)
	Y = torch.from_numpy(y_data)
	```

***
## 6. 예측 및 정확도 계산

### 6.1 예측 클래스 결정

```python
predict = (model(X).data > 0.5).float()
```

- **과정**
	1. `model(X)`: 0~1 사이의 확률 값 출력
	2. `.data`: 텐서의 데이터 추출 (그래디언트 추적 제거)
	3. `> 0.5`: 임계값 0.5로 비교 → True/False
	4. `.float()`: True→1.0, False→0.0 변환

- **임계값 (Threshold)**
	- 기본값: 0.5
	- 확률 ≥ 0.5 → 클래스 1
	- 확률 < 0.5 → 클래스 0

### 6.2 정확도 계산

```python
accuracy = (predict == Y.data).float().mean()
```

- **과정**
	1. `predict == Y.data`: 예측과 실제 레이블 비교
	2. `.float()`: True→1.0, False→0.0 변환
	3. `.mean()`: 평균 = 정확하게 예측한 비율

- **정확도 해석**
	- 0.0 ~ 1.0 범위
	- 1.0 = 100% 정확도
	- 예: 0.75 = 75% 정확도

***
## 7. 학습 과정 상세

### 7.1 학습 루프 구조

```python
for step in range(1000):
    optimizer.zero_grad()    # 1. 기울기 초기화
    hypothesis = model(X)     # 2. 순전파
    cost = -(Y * torch.log(hypothesis) +
             (1-Y) * torch.log(1-hypothesis)).mean()  # 3. 손실 계산
    cost.backward()           # 4. 역전파
    optimizer.step()          # 5. 파라미터 업데이트
```

### 7.2 각 단계 설명

1. **기울기 초기화**
	- 이전 반복의 기울기를 0으로 리셋
	- PyTorch는 기울기를 누적하므로 필수

2. **순전파 (Forward Propagation)**
	- 입력 X를 모델에 통과
	- Linear → Sigmoid 순서로 계산
	- 0~1 사이의 확률 값 출력

3. **손실 계산**
	- Binary Cross-Entropy Loss 계산
	- 예측값과 실제값의 차이 측정

4. **역전파 (Backward Propagation)**
	- 손실에 대한 각 파라미터의 기울기 계산
	- 연쇄 법칙(Chain Rule) 적용

5. **파라미터 업데이트**
	- 경사 하강법으로 W, b 업데이트
	- W = W - lr × ∂Loss/∂W

***
## 8. CSV 데이터셋 실습

### 8.1 데이터 로딩

```python
xy = np.loadtxt('data-03-diabetes.csv', delimiter=',', dtype=np.float32)
x_data_set = xy[:, 0:-1]  # 입력 특징
y_data_set = xy[:, [-1]]  # 출력 레이블
```

- **데이터 분리**
	- `[:, 0:-1]`: 모든 행, 첫 번째~마지막-1 열 (입력)
	- `[:, [-1]]`: 모든 행, 마지막 열만 (출력)
	- `[-1]` vs `[[-1]]`: 2차원 형태 유지

### 8.2 당뇨병 데이터셋 특징

- **Pima Indians Diabetes Dataset**
	- 8개의 입력 특징:
		1. 임신 횟수
		2. 포도당 농도
		3. 혈압
		4. 피부 두께
		5. 인슐린
		6. BMI (체질량지수)
		7. 당뇨병 혈통 함수
		8. 나이
	- 1개의 출력: 당뇨병 여부 (0 또는 1)

### 8.3 모델 구성

```python
model = nn.Sequential(
    nn.Linear(in_features=X_tensor.shape[1],  # 8개 입력
              out_features=Y_tensor.shape[1],  # 1개 출력
              bias=True),
    nn.Sigmoid()
)
```

### 8.4 학습률 조정

```python
optimizer = torch.optim.SGD(model.parameters(), lr=0.1)
```

- **학습률 0.1**
	- 기본 예제(lr=0.01)보다 10배 큼
	- CSV 데이터가 정규화되어 있어 가능
	- 더 빠른 수렴

***
## 9. PyTorch 내장 BCE Loss 사용

- **수동 구현 대신 내장 함수 사용 (권장)**

```python
# 모델 정의 (Sigmoid 포함)
model = nn.Sequential(
    nn.Linear(input_dim, 1),
    nn.Sigmoid()
)

# 손실 함수
criterion = nn.BCELoss()

# 학습 루프
for step in range(1000):
    optimizer.zero_grad()
    hypothesis = model(X)
    loss = criterion(hypothesis, Y)  # 간단하게 사용
    loss.backward()
    optimizer.step()
```

- **BCEWithLogitsLoss (더 권장)**
	- Sigmoid + BCELoss를 한 번에 수행
	- 수치적 안정성 향상

```python
# 모델 정의 (Sigmoid 없음)
model = nn.Linear(input_dim, 1)

# 손실 함수 (Sigmoid 포함)
criterion = nn.BCEWithLogitsLoss()

# 학습
for step in range(1000):
    optimizer.zero_grad()
    logits = model(X)  # Sigmoid 거치지 않은 값
    loss = criterion(logits, Y)
    loss.backward()
    optimizer.step()

# 예측 시에는 Sigmoid 적용
with torch.no_grad():
    logits = model(X)
    probs = torch.sigmoid(logits)
    predictions = (probs > 0.5).float()
```

***
## 10. 성능 평가 지표

### 10.1 정확도 (Accuracy)

```python
accuracy = (predicted == Y).float().mean()
```

- **장점**: 직관적이고 이해하기 쉬움
- **단점**: 불균형 데이터셋에서 misleading

### 10.2 혼동 행렬 (Confusion Matrix)

```python
from sklearn.metrics import confusion_matrix

cm = confusion_matrix(Y.numpy(), predicted.numpy())
print("Confusion Matrix:")
print(cm)
#       [[TN  FP]
#        [FN  TP]]
```

### 10.3 정밀도, 재현율, F1 점수

```python
from sklearn.metrics import precision_score, recall_score, f1_score

precision = precision_score(Y.numpy(), predicted.numpy())
recall = recall_score(Y.numpy(), predicted.numpy())
f1 = f1_score(Y.numpy(), predicted.numpy())

print(f'Precision: {precision:.4f}')
print(f'Recall: {recall:.4f}')
print(f'F1 Score: {f1:.4f}')
```

***
## 11. 임계값 조정

- **기본 임계값: 0.5**

```python
threshold = 0.5
predictions = (probs > threshold).float()
```

- **임계값 변경의 효과**

| 임계값 | 효과 | 사용 상황 |
|-------|------|----------|
| **높음 (0.7~0.9)** | FP 감소, FN 증가 | 정밀도가 중요한 경우 (스팸 필터) |
| **낮음 (0.3~0.4)** | TP 증가, FP 증가 | 재현율이 중요한 경우 (질병 진단) |
| **0.5** | 균형 잡힌 예측 | 일반적인 경우 |

- **ROC 곡선과 AUC**
	```python
	from sklearn.metrics import roc_curve, auc
	import matplotlib.pyplot as plt

	fpr, tpr, thresholds = roc_curve(Y.numpy(), probs.numpy())
	roc_auc = auc(fpr, tpr)

	plt.plot(fpr, tpr, label=f'ROC curve (AUC = {roc_auc:.2f})')
	plt.xlabel('False Positive Rate')
	plt.ylabel('True Positive Rate')
	plt.legend()
	plt.show()
	```

***
## 12. 데이터 전처리

### 12.1 정규화

```python
# 표준화 (Standardization)
mean = X_tensor.mean(dim=0)
std = X_tensor.std(dim=0)
X_normalized = (X_tensor - mean) / std

# 최소-최대 정규화 (Min-Max Normalization)
X_min = X_tensor.min(dim=0)[0]
X_max = X_tensor.max(dim=0)[0]
X_normalized = (X_tensor - X_min) / (X_max - X_min)
```

### 12.2 데이터 분할

```python
from sklearn.model_selection import train_test_split

# 학습/테스트 분할 (80:20)
X_train, X_test, Y_train, Y_test = train_test_split(
    X_tensor.numpy(), Y_tensor.numpy(),
    test_size=0.2, random_state=42
)

# NumPy → 텐서
X_train = torch.from_numpy(X_train)
X_test = torch.from_numpy(X_test)
Y_train = torch.from_numpy(Y_train)
Y_test = torch.from_numpy(Y_test)
```

***
## 13. 핵심 정리

- **로지스틱 회귀 구조**
	- 선형 레이어 (nn.Linear) + Sigmoid 활성화 함수
	- 이진 분류: 출력값을 0 또는 1로 예측
	- 순차적 레이어 연결: nn.Sequential 사용

- **손실 함수**
	- Binary Cross-Entropy Loss (BCE)
	- 수동 구현: `-(Y * log(H) + (1-Y) * log(1-H)).mean()`
	- PyTorch 내장: `nn.BCELoss()` 또는 `nn.BCEWithLogitsLoss()` (권장)

- **예측 및 평가**
	- 임계값 0.5로 확률을 클래스로 변환
	- 정확도: 올바른 예측의 비율
	- 불균형 데이터: 정밀도, 재현율, F1 점수 고려

- **학습 과정**
	1. 기울기 초기화 (optimizer.zero_grad())
	2. 순전파 (model(X))
	3. 손실 계산 (criterion(H, Y))
	4. 역전파 (loss.backward())
	5. 파라미터 업데이트 (optimizer.step())

- **실전 팁**
	- `Variable`은 구버전 코드, 현대 PyTorch에서는 불필요
	- `BCEWithLogitsLoss` 사용 시 수치적 안정성 향상
	- 데이터 정규화로 학습 속도 개선
	- 학습/테스트 데이터 분할로 과적합 방지

***
## 14. 최신 PyTorch 코드 (권장)

```python
import torch
import torch.nn as nn
import numpy as np

torch.manual_seed(777)

# 데이터 준비 (Variable 없이)
x_data = np.array([[1,2], [2,3], [3,1], [4,3], [5,3], [6,2]], dtype=np.float32)
y_data = np.array([[0], [0], [1], [1], [1], [1]], dtype=np.float32)

X = torch.from_numpy(x_data)
Y = torch.from_numpy(y_data)

# 모델 정의 (Sigmoid 제거)
model = nn.Linear(2, 1)

# BCEWithLogitsLoss 사용 (Sigmoid 포함)
criterion = nn.BCEWithLogitsLoss()
optimizer = torch.optim.SGD(model.parameters(), lr=0.01)

# 학습
for epoch in range(1000):
    # 순전파
    logits = model(X)
    loss = criterion(logits, Y)

    # 역전파
    optimizer.zero_grad()
    loss.backward()
    optimizer.step()

    # 평가
    if epoch % 100 == 0:
        with torch.no_grad():
            probs = torch.sigmoid(logits)
            predictions = (probs > 0.5).float()
            accuracy = (predictions == Y).float().mean()
            print(f'Epoch: {epoch}, Loss: {loss.item():.4f}, Accuracy: {accuracy.item():.4f}')
```