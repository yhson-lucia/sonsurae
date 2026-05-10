## 0. 전체 코드 예시

- **다변수 선형 회귀 실습 코드**
	- 3개의 입력 특징(x1, x2, x3)에서 1개의 출력을 예측하는 다변수 선형 회귀 모델
	- 여러 개의 독립 변수를 사용하여 하나의 종속 변수를 예측

```python
import torch
import torch.nn as nn

# 학습 데이터 (3개의 입력 변수)
x_data = [[1, 2, 3],
          [4, 5, 6],
          [7, 8, 9],
          [10, 11, 12],
          [13, 14, 15]]
y_data = [[1.],
          [2.],
          [3.],
          [4.],
          [5.]]

# 텐서로 변환
X = torch.Tensor(x_data)  # shape: (5, 3)
Y = torch.Tensor(y_data)  # shape: (5, 1)

# 모델 정의 - 다변수 선형 회귀
model = nn.Linear(3, 1, bias=True)  # 입력 3개, 출력 1개

# 손실 함수
criterion = nn.MSELoss()  # 평균 제곱 오차

# 옵티마이저
optimizer = torch.optim.SGD(model.parameters(), lr=1e-5)
# model.parameters()는 데이터 참조(reference)를 반환
# weight와 bias에 직접 접근 가능

# 학습 루프
for step in range(2001):
    optimizer.zero_grad()  # 기울기 초기화
    hypothesis = model(X)  # 예측값 계산
    loss = criterion(hypothesis, Y)  # 손실 계산
    loss.backward()  # 역전파
    optimizer.step()  # 파라미터 업데이트

    # 진행 상황 출력
    if step % 100 == 0:
        print(f'Step: {step}, Loss: {loss.item():.4f}')
```

- **코드 설명**
	- **입력 데이터**: 5개의 샘플, 각 샘플은 3개의 특징 (x1, x2, x3)
	- **출력 데이터**: 각 샘플마다 1개의 출력값
	- **모델 구조**: `nn.Linear(3, 1)` - 3차원 입력 → 1차원 출력
	- **학습률**: 1e-5 (0.00001) - 다변수이므로 작은 학습률 사용

***
## 1. 다변수 선형 회귀란?

- **다변수 선형 회귀 (Multi-variable Linear Regression)**
	- 여러 개의 독립 변수(입력)를 사용하여 하나의 종속 변수(출력)를 예측
	- 단순 선형 회귀와 달리 여러 특징을 고려하여 더 정확한 예측 가능

- **수식 표현**
	- 단순 선형 회귀: y = w·x + b
	- 다변수 선형 회귀: y = w₁·x₁ + w₂·x₂ + w₃·x₃ + b
	- 일반화: y = w₁·x₁ + w₂·x₂ + ... + wₙ·xₙ + b

- **행렬 표현**
	- y = XW + b
	- X: 입력 행렬 (샘플 수 × 특징 수)
	- W: 가중치 벡터 (특징 수 × 1)
	- b: 편향 (스칼라)

***
## 2. 데이터 구조

- **입력 데이터 (X)**
	```python
	x_data = [[1, 2, 3],      # 샘플 1: x1=1, x2=2, x3=3
	          [4, 5, 6],      # 샘플 2: x1=4, x2=5, x3=6
	          [7, 8, 9],      # 샘플 3: x1=7, x2=8, x3=9
	          [10, 11, 12],   # 샘플 4
	          [13, 14, 15]]   # 샘플 5
	```
	- 5개의 샘플 (행)
	- 각 샘플은 3개의 특징 (열)
	- Tensor 크기: (5, 3)

- **출력 데이터 (Y)**
	```python
	y_data = [[1.], [2.], [3.], [4.], [5.]]
	```
	- 5개의 출력값
	- Tensor 크기: (5, 1)

***
## 3. 모델 구조

- **`nn.Linear(3, 1, bias=True)`**
	- 입력 차원: 3 (x1, x2, x3)
	- 출력 차원: 1 (y)
	- 편향 사용: True

- **파라미터 구조**
	```python
	model.weight = [[w1, w2, w3]]  # shape: (1, 3)
	model.bias = [b]                # shape: (1,)
	```
	- 가중치 W: 3개 (각 입력 특징마다 하나씩)
	- 편향 b: 1개

- **계산 과정**
	```
	입력: [x1, x2, x3]
	↓
	y = w1·x1 + w2·x2 + w3·x3 + b
	↓
	출력: [y]
	```

***
## 4. 행렬 연산

- **순전파 계산**
	```python
	# X: (5, 3), W: (3, 1), b: (1,)
	hypothesis = X @ W.T + b  # 결과: (5, 1)
	```

- **계산 예시**
	```
	X(5×3) × W(3×1) = Y(5×1)

	[1  2  3 ]   [w1]   [b]   [y1]
	[4  5  6 ]   [w2] + [b] = [y2]
	[7  8  9 ] × [w3]   [b]   [y3]
	[10 11 12]          [b]   [y4]
	[13 14 15]          [b]   [y5]
	```

***
## 5. 파라미터 참조

- **`model.parameters()`의 특징**
	- 데이터 복제가 아닌 **참조(reference)** 반환
	- 메모리 효율적
	- 옵티마이저가 직접 파라미터에 접근하여 수정 가능

- **파라미터 접근**
	```python
	# 가중치 확인
	print(model.weight)  # tensor([[w1, w2, w3]])

	# 편향 확인
	print(model.bias)    # tensor([b])

	# 모든 파라미터 순회
	for param in model.parameters():
	    print(param.shape)
	# 출력:
	# torch.Size([1, 3])  <- weight
	# torch.Size([1])     <- bias
	```

***
## 6. 학습률 설정

- **학습률의 중요성**
	- 다변수 선형 회귀에서는 입력 특징이 여러 개
	- 각 특징의 스케일이 다를 수 있음
	- 너무 큰 학습률 → 발산 위험
	- 너무 작은 학습률 → 학습 속도 느림

- **학습률 선택**
	```python
	lr = 1e-5  # 0.00001
	```
	- 예제 코드에서는 매우 작은 학습률 사용
	- 입력 값이 큰 경우 작은 학습률이 안정적

- **학습률 조정 팁**
	- 손실이 발산하면 → 학습률 감소
	- 학습이 너무 느리면 → 학습률 증가
	- 입력 데이터 정규화(normalization) 고려

***
## 7. 역전파와 기울기

- **각 가중치의 기울기 계산**
	```python
	loss.backward()

	# 기울기 확인
	print(model.weight.grad)
	# tensor([[∂loss/∂w1, ∂loss/∂w2, ∂loss/∂w3]])

	print(model.bias.grad)
	# tensor([∂loss/∂b])
	```

- **기울기 계산 과정**
	- loss = MSE(y_pred, y_true)
	- ∂loss/∂w₁ 계산 (x₁에 대한 가중치)
	- ∂loss/∂w₂ 계산 (x₂에 대한 가중치)
	- ∂loss/∂w₃ 계산 (x₃에 대한 가중치)
	- ∂loss/∂b 계산 (편향)

***
## 8. 파라미터 업데이트

- **개별 업데이트 공식**
	```python
	w1_new = w1_old - lr × (∂loss/∂w1)
	w2_new = w2_old - lr × (∂loss/∂w2)
	w3_new = w3_old - lr × (∂loss/∂w3)
	b_new  = b_old  - lr × (∂loss/∂b)
	```

- **optimizer.step()의 역할**
	- 모든 파라미터에 대해 위 공식을 자동으로 적용
	- 각 파라미터는 자신의 기울기에 따라 독립적으로 업데이트

***
## 9. 단순 vs 다변수 선형 회귀 비교

| 구분 | 단순 선형 회귀 | 다변수 선형 회귀 |
|------|---------------|-----------------|
| **입력 변수** | 1개 (x) | 여러 개 (x₁, x₂, ..., xₙ) |
| **수식** | y = wx + b | y = w₁x₁ + w₂x₂ + ... + wₙxₙ + b |
| **가중치** | 1개 (w) | n개 (w₁, w₂, ..., wₙ) |
| **모델** | nn.Linear(1, 1) | nn.Linear(n, 1) |
| **입력 shape** | (샘플수, 1) | (샘플수, n) |
| **활용** | 단순한 관계 모델링 | 복잡한 관계 모델링 |

***
## 10. 실전 활용 예시

- **부동산 가격 예측**
	```python
	# 입력: [면적, 방 개수, 층수]
	x = [[85, 3, 5], [60, 2, 3], [120, 4, 10]]
	# 출력: [가격]
	y = [[450], [320], [680]]

	model = nn.Linear(3, 1)  # 3개 특징 → 1개 출력
	```

- **학생 성적 예측**
	```python
	# 입력: [출석률, 과제점수, 중간고사점수]
	x = [[95, 88, 85], [70, 65, 72], [100, 95, 92]]
	# 출력: [기말고사예상점수]
	y = [[87], [70], [94]]

	model = nn.Linear(3, 1)
	```

- **주의사항**
	- 입력 특징들의 스케일이 다르면 정규화 필요
	- 특징 간 상관관계가 높으면 다중공선성 문제 발생 가능
	- 충분한 학습 데이터 필요 (특징 수보다 많은 샘플)

***
## 11. 데이터 정규화

- **정규화가 필요한 이유**
	- 입력 특징들의 스케일이 크게 다른 경우
	- 예: x₁은 0-100, x₂는 0-1000000
	- 큰 값을 가진 특징이 학습을 지배할 수 있음

- **표준화 (Standardization)**
	```python
	# 평균 0, 표준편차 1로 변환
	X_normalized = (X - X.mean()) / X.std()
	```

- **최소-최대 정규화 (Min-Max Normalization)**
	```python
	# 0-1 범위로 변환
	X_normalized = (X - X.min()) / (X.max() - X.min())
	```

***
## 12. 핵심 정리

- **다변수 선형 회귀의 장점**
	- 여러 특징을 동시에 고려하여 더 정확한 예측
	- 현실 세계의 복잡한 관계를 모델링 가능
	- 각 특징의 중요도를 가중치로 학습

- **학습 과정**
	1. 데이터 준비 (여러 입력 특징 + 출력)
	2. 모델 정의 (nn.Linear(입력차원, 출력차원))
	3. 손실 함수 및 옵티마이저 설정
	4. 학습 루프: 순전파 → 손실 계산 → 역전파 → 업데이트
	5. 각 가중치가 독립적으로 업데이트됨

- **주의사항**
	- 적절한 학습률 선택 중요
	- 데이터 정규화 고려
	- 충분한 학습 데이터 확보
	- 과적합(overfitting) 주의

***
## 13. CSV 파일을 이용한 실습

- **실전 데이터로 학습하기**
	- NumPy를 사용하여 CSV 파일에서 데이터 로드
	- 학생들의 시험 점수 데이터 (data-01-test-score.csv)
	- 3개의 입력 특징 (퀴즈1, 퀴즈2, 중간고사) → 1개의 출력 (기말고사)

### 13.1 전체 코드

```python
import torch
import torch.nn as nn
import numpy as np

# CSV 파일에서 데이터 로드
data = np.loadtxt('data-01-test-score.csv', delimiter=',', dtype=np.float32)

# 입력과 출력 분리
x_data = data[:, 0:-1]  # 처음부터 마지막 열 전까지 (입력 특징)
y_data = data[:, [-1]]  # 마지막 열만 (출력)

# 데이터 정보 출력
print(x_data.shape, x_data.dtype, len(x_data), len(y_data))

# NumPy 배열을 PyTorch 텐서로 변환
x_data = torch.from_numpy(x_data)  # 입력 텐서
y_data = torch.from_numpy(y_data)  # 정답 텐서

# 선형 회귀 모델 정의
model = nn.Linear(3, 1, bias=True)  # 3개 입력 → 1개 출력

# 손실 함수
criterion = nn.MSELoss()

# 옵티마이저
optimizer = torch.optim.SGD(model.parameters(), lr=1e-5)

# 학습 루프
for step in range(20000):
    optimizer.zero_grad()  # 기울기 초기화
    y_pred = model(x_data)  # 예측값 계산
    loss = criterion(y_pred, y_data)  # 손실 계산
    loss.backward()  # 역전파
    optimizer.step()  # 파라미터 업데이트

    # 진행 상황 출력
    if step % 1000 == 0:
        print(f'Step: {step}, Weight: {model.weight.data}, Bias: {model.bias.data}, Loss: {loss.item():.4f}')
```

### 13.2 데이터 로딩 상세

- **`np.loadtxt()` 사용법**
	```python
	data = np.loadtxt('data-01-test-score.csv', delimiter=',', dtype=np.float32)
	```
	- `'data-01-test-score.csv'`: 파일 경로
	- `delimiter=','`: CSV 파일의 구분자 (쉼표)
	- `dtype=np.float32`: 데이터 타입 (32비트 실수)

- **데이터 분리**
	```python
	x_data = data[:, 0:-1]  # 모든 행, 처음부터 마지막 열 전까지
	y_data = data[:, [-1]]  # 모든 행, 마지막 열만
	```
	- `[:, 0:-1]`: 입력 특징들 (첫 번째 ~ 마지막-1 번째 열)
	- `[:, [-1]]`: 출력 값 (마지막 열, 2D 유지)
	- `[-1]` 대신 `[[-1]]` 사용 이유: 2차원 형태 유지

### 13.3 NumPy → PyTorch 변환

- **`torch.from_numpy()`**
	```python
	x_data = torch.from_numpy(x_data)
	y_data = torch.from_numpy(y_data)
	```
	- NumPy 배열을 PyTorch 텐서로 변환
	- 메모리 공유: 원본 NumPy 배열과 메모리 공유 (복사 아님)
	- dtype 자동 변환: np.float32 → torch.float32

- **메모리 공유 주의사항**
	```python
	# from_numpy는 메모리를 공유함
	x_tensor = torch.from_numpy(x_array)
	x_array[0] = 999  # NumPy 배열 수정
	# x_tensor도 함께 변경됨!

	# 독립적인 복사본 생성하려면
	x_tensor = torch.tensor(x_array)  # 복사본 생성
	```

### 13.4 CSV 데이터 구조 예시

```
# data-01-test-score.csv 파일 내용 예시
73,80,75,152
93,88,93,185
89,91,90,180
96,98,100,196
73,66,70,142
...
```

- **열 구조**
	- 1열: 퀴즈1 점수 (x1)
	- 2열: 퀴즈2 점수 (x2)
	- 3열: 중간고사 점수 (x3)
	- 4열: 기말고사 점수 (y) - 예측 대상

### 13.5 데이터 확인

```python
print(x_data.shape)  # (샘플수, 3) - 예: (25, 3)
print(y_data.shape)  # (샘플수, 1) - 예: (25, 1)
print(x_data.dtype)  # torch.float32
print(len(x_data))   # 샘플 개수

# 첫 5개 샘플 확인
print(x_data[:5])
print(y_data[:5])
```

### 13.6 학습률과 반복 횟수

- **학습률: 1e-5**
	- CSV 데이터의 값 범위가 큰 경우 작은 학습률 사용
	- 점수 데이터: 0~100 범위
	- 안정적인 학습을 위해 작은 학습률 필요

- **반복 횟수: 20000번**
	- 작은 학습률을 사용하므로 충분한 반복 필요
	- 손실 값이 수렴할 때까지 학습
	- 실전에서는 early stopping 기법 사용 권장

### 13.7 학습 모니터링

```python
# 매 스텝마다 출력 (디버깅용)
print(step, model.weight, model.bias, loss.item())

# 일정 간격마다 출력 (권장)
if step % 1000 == 0:
    print(f'Step: {step}')
    print(f'  Weight: {model.weight.data}')
    print(f'  Bias: {model.bias.data}')
    print(f'  Loss: {loss.item():.4f}')
```

### 13.8 학습 후 예측

```python
# 학습 완료 후 새로운 데이터로 예측
new_student = torch.tensor([[95, 90, 88]], dtype=torch.float32)
predicted_score = model(new_student)
print(f'예측 기말고사 점수: {predicted_score.item():.2f}')
```

### 13.9 실습 팁

- **데이터 전처리**
	- CSV 파일에 헤더가 있다면 `skiprows=1` 사용
	- 결측치가 있다면 제거 또는 대체 필요
	- 이상치(outlier) 확인 및 처리

- **성능 개선**
	```python
	# 데이터 정규화
	x_mean = x_data.mean(dim=0)
	x_std = x_data.std(dim=0)
	x_normalized = (x_data - x_mean) / x_std

	# 정규화 후 더 큰 학습률 사용 가능
	optimizer = torch.optim.SGD(model.parameters(), lr=1e-3)
	```

- **학습 곡선 시각화**
	```python
	import matplotlib.pyplot as plt

	losses = []
	for step in range(20000):
	    # ... 학습 코드 ...
	    losses.append(loss.item())

	plt.plot(losses)
	plt.xlabel('Step')
	plt.ylabel('Loss')
	plt.title('Training Loss Curve')
	plt.show()
	```

***
## 14. NumPy vs PyTorch 텐서 변환 정리

| 변환 방향 | 함수 | 메모리 공유 | 사용 시점 |
|----------|------|------------|----------|
| **NumPy → PyTorch** | `torch.from_numpy()` | O (공유) | 메모리 효율 중요 |
| **NumPy → PyTorch** | `torch.tensor()` | X (복사) | 독립적 데이터 필요 |
| **PyTorch → NumPy** | `.numpy()` | O (공유) | NumPy 함수 사용 |
| **PyTorch → NumPy** | `.detach().numpy()` | X (분리 후 공유) | 그래디언트 분리 필요 |

- **메모리 공유의 의미**
	- O: 원본 수정 시 변환된 데이터도 변경됨
	- X: 독립적인 복사본, 원본 수정해도 영향 없음