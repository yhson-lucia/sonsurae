## 0. 전체 코드 예시

- **선형 회귀 실습 코드**
	- 1개의 입력 특징에서 10개의 출력을 예측하는 다중 출력 선형 회귀 모델
	- 학습률 0.1로 1000번 반복 학습

```python
import torch
import torch.nn as nn

# X Y input data
x_train = [[1], [2], [3], [4]]
y_train = [[1,2,3,4,5,6,7,8,9,10],
           [2,2,3,4,5,6,7,8,9,10],
           [3,2,3,4,5,6,7,8,9,10],
           [4,2,3,4,5,6,7,8,9,10]]

# 리스트를 텐서로 변환 (dtype 작성 안 하면 long 타입)
X = torch.tensor(x_train, dtype=torch.float32)
Y = torch.tensor(y_train, dtype=torch.float32)

# 모델 선택 - 선형 모델
model = nn.Linear(1, 10, bias=True)  # input data 1개, output data 10개

# 손실 함수 (Cost Criterion)
criterion = nn.MSELoss()  # 평균 제곱 오차 (Y_hat - Y)^2

# 옵티마이저 - SGD(확률적 경사 하강법)
optimizer = torch.optim.SGD(model.parameters(), lr=0.1)
# model.parameters(): 학습 파라미터 (W, b)
# lr: Learning Rate (학습률)

# 학습 루프
for step in range(1000):
    optimizer.zero_grad()  # 기울기 초기화
    y_pred = model(X)  # Y의 예측값
    loss = criterion(y_pred, Y)  # 손실값 계산 (오차 계산)
    loss.backward()  # 역전파 - 손실값으로 각 파라미터의 기울기 계산
    optimizer.step()  # 파라미터 업데이트 - 계산된 기울기로 파라미터 갱신

    # 20번마다 학습 진행 상황 출력
    if step % 20 == 0:
        print(step, y_pred.data.numpy(), model.weight.data.numpy(), model.bias.data.numpy())
```

- **코드 설명**
	- **입력 데이터**: 4개의 샘플, 각 샘플은 1개의 특징
	- **출력 데이터**: 각 샘플마다 10개의 출력값
	- **모델 구조**: `nn.Linear(1, 10)` - 1차원 입력 → 10차원 출력
	- **학습 과정**: 기울기 초기화 → 순전파 → 손실 계산 → 역전파 → 파라미터 업데이트
	- **모니터링**: 20번마다 예측값, 가중치, 편향 출력

***
## 1. PyTorch 기본 설정

- **난수 고정**
	- `torch.manual_seed(777)`: 임의의 숫자로 난수 생성을 고정
	- 777은 임의의 숫자이며, 재현성을 위해 사용
	- 항상 같은 난수가 생성되어 실험 결과를 재현할 수 있음

- **데이터 준비**
	- `x_train = [[1], [2], [3]]`
	- `y_train = [[1], [2], [3]]`
	- y = x를 학습시키려는 예제 데이터

- **텐서 변환**
	- 리스트 데이터를 텐서로 변환: `torch.tensor(x_train)`
	- 3x1 크기의 텐서 생성: `[[1.], [2.], [3.]]`
	- 최신 PyTorch에서는 `torch.tensor(x_train, dtype=torch.float32)` 사용 권장

***
## 2. 모델 정의

- **선형 회귀 모델**
	- `model = nn.Linear(1, 1, bias=True)`
	- `nn.Linear(입력 크기, 출력 크기, 편향 사용 여부)`
	- 모델 구조: 입력 x → [W × X + b] → 출력 ŷ

- **파라미터 설명**
	- 입력 크기: 1 (x 텐서의 피처 개수)
	- 출력 크기: 1 (y 텐서의 피처 개수)
	- bias=True: 편향(b) 사용

***
## 3. 손실 함수

- **MSE (Mean Squared Error, 평균 제곱 오차)**
	- `criterion = nn.MSELoss()`
	- 예측값과 실제값의 차이를 제곱하여 평균을 계산

- **계산 예시**
	- 예측값: [1.2, 2.1, 2.9]
	- 실제값: [1.0, 2.0, 3.0]
	- 오차 제곱: [(1.2-1.0)², (2.1-2.0)², (2.9-3.0)²]
	- MSE: (0.04 + 0.01 + 0.01) / 3 = 0.02

***
## 4. 옵티마이저

- **SGD (Stochastic Gradient Descent, 확률적 경사 하강법)**
	- `optimizer = torch.optim.SGD(model.parameters(), lr=0.01)`
	- `model.parameters()`: 학습할 파라미터들 (W, b)
	- `lr` (learning rate): 학습률, 파라미터 업데이트 크기 조절

***
## 5. 학습 과정

- **학습 루프**
	- `for step in range(2001)`: 학습을 2001번 반복 (0~2000)

### 5.1 기울기 초기화
- **`optimizer.zero_grad()`**
	- 이전 step의 기울기를 0으로 리셋
	- PyTorch는 기울기를 누적하므로 초기화 필수
	- 예시:
		- Step 1 기울기: 0.5
		- Step 2 기울기: 0.3
		- 초기화 안 하면: 0.5 + 0.3 = 0.8
		- 초기화 하면: 0.3

### 5.2 순전파 (Forward Propagation)
- **`hypothesis = model(X)`**
	- 입력 데이터 X를 모델에 통과시켜 예측값 계산
	- 예시 (W=0.5, b=0.1 가정):
		- X = [[1], [2], [3]]
		- hypothesis = [[0.6], [1.1], [1.6]]
		- 계산: W × X + b

### 5.3 손실 계산
- **`cost = criterion(hypothesis, Y)`**
	- 예측값(hypothesis)과 실제값(Y)의 차이를 MSE로 계산
	- 손실 함수는 단일 스칼라 값을 반환

### 5.4 역전파 (Backward Propagation)
- **`cost.backward()`**
	- 손실 값을 기준으로 각 파라미터의 기울기 계산
	- 연쇄 법칙을 이용한 미분 수행
	- 계산 결과: ∂cost/∂W, ∂cost/∂b

- **역전파 과정**
	- cost 값 대비 W, b를 어떻게 변경해야 하는지 계산
	- 각 파라미터의 기울기(gradient) 계산

### 5.5 파라미터 업데이트
- **`optimizer.step()`**
	- 계산된 기울기를 사용하여 파라미터 업데이트
	- 업데이트 공식:
		- W_new = W_old - lr × (∂cost/∂W)
		- b_new = b_old - lr × (∂cost/∂b)

### 5.6 진행 상황 출력
- **`if step % 20 == 0:`**
	- 20번마다 학습 진행 상황 출력
	- 손실 값 확인을 통해 학습 모니터링

***
## 6. 모델 테스트

- **예측 수행**
	- `predicted = model(Variable(torch.Tensor([[5]])))`
	- 학습된 모델로 새로운 입력(5)에 대한 출력 예측
	- y = x 관계를 학습했다면 약 5에 가까운 값 출력

***
## 7. 다중 가중치 처리

### 7.1 여러 입력 특징이 있을 때
- **각 가중치마다 개별적으로 기울기 계산**
- 예시: `nn.Linear(3, 1)` - 3개의 입력, 1개의 출력

```python
model = nn.Linear(3, 1)  # w1, w2, w3, b

# 파라미터 구조
model.weight = [[w1, w2, w3]]  # shape: (1, 3)
model.bias = [b]                # shape: (1,)
```

### 7.2 역전파 후 기울기 확인
```python
hypothesis = model(X)
cost = criterion(hypothesis, Y)
cost.backward()

print(model.weight.grad)
# tensor([[-0.25, -0.18, -0.32]])
#          ↑      ↑      ↑
#       ∂cost  ∂cost  ∂cost
#        /∂w1   /∂w2   /∂w3

print(model.bias.grad)
# tensor([-0.12])
#          ↑
#       ∂cost/∂b
```

***
## 8. 기울기 시각화

```
파라미터          backward() 후 grad

weight:          weight.grad:
[[w1, w2, w3]]   [[∂cost/∂w1, ∂cost/∂w2, ∂cost/∂w3]]

bias:            bias.grad:
[b]              [∂cost/∂b]
```

***
## 9. 파라미터 업데이트 과정

- **개별 업데이트**
	- 각 파라미터는 자신의 기울기에 따라 독립적으로 업데이트

```python
w1_new = w1_old - lr × (∂cost/∂w1)
w2_new = w2_old - lr × (∂cost/∂w2)
w3_new = w3_old - lr × (∂cost/∂w3)
b_new  = b_old  - lr × (∂cost/∂b)
```

***
## 10. 대규모 모델 예시

- **많은 파라미터를 가진 모델**

```python
model = nn.Linear(100, 50)  # w: 5000개, b: 50개

cost.backward()

print(model.weight.grad.shape)  # (50, 100) → 5000개 기울기
print(model.bias.grad.shape)    # (50,)     → 50개 기울기
```

- **핵심 원리**
	- 파라미터의 개수와 관계없이 동일한 방식으로 작동
	- 각 파라미터는 독립적으로 자신의 기울기에 따라 업데이트
	- PyTorch가 자동으로 모든 파라미터의 기울기를 계산하고 관리