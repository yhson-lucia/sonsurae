## 0. 전체 코드 예시

- **Softmax 회귀 실습 코드**
	- 동물원 데이터셋으로 7개 클래스 분류
	- One-Hot Encoding 수동 구현
	- Cross-Entropy Loss 수동 계산

```python
import torch
import numpy as np

torch.manual_seed(777)

# CSV 파일에서 데이터 로드
xy = np.loadtxt('data-04-zoo.csv', delimiter=',', dtype=np.float32)
x = torch.from_numpy(xy[:, :-1])   # [101, 16] - 입력 특징
y = torch.from_numpy(xy[:, [-1]])  # [101, 1]  - 클래스 레이블

# One-Hot Encoding 생성
y_onehot = torch.zeros(y.size(0), 7)  # [101, 7] - 7개 클래스
y_onehot.scatter_(1, y.long(), 1)     # 클래스 인덱스 위치에 1 설정

print(y_onehot)

# 모델 정의: Linear + Softmax
linear = torch.nn.Linear(x.shape[1], y_onehot.shape[1], bias=True)  # 16 → 7
softmax = torch.nn.Softmax(dim=1)
model = torch.nn.Sequential(linear, softmax)

# 옵티마이저
optimizer = torch.optim.SGD(model.parameters(), lr=0.01)

# 학습 루프
for step in range(2100):
    optimizer.zero_grad()

    # 순전파
    output = model(x)  # [101, 7] - 각 클래스의 확률

    # Cross-Entropy Loss 수동 계산
    cost = -y_onehot * torch.log(output)  # Element-wise 곱
    cost = cost.sum(dim=1).mean()         # 합산 후 평균

    # 역전파
    cost.backward()

    # 파라미터 업데이트
    optimizer.step()

    # 예측 및 정확도 계산
    prediction = torch.max(output, 1)[1].float()  # 최대 확률의 인덱스
    correct_accuracy = prediction == y.squeeze()   # 정답과 비교
    accuracy = correct_accuracy.float().mean()

    # 진행 상황 출력
    if step % 100 == 0:
        print("Step: {:5}\tLoss: {:.3f}\tAcc: {:.2%}".format(
            step, cost.item(), accuracy))
```

***
## 1. 데이터셋 이해

### 1.1 동물원 데이터셋 (Zoo Dataset)

- **특징**
	- 101개의 동물 샘플
	- 16개의 입력 특징 (동물의 속성)
	- 7개의 클래스 (동물 종류)

- **입력 특징 (16개)**
	1. hair (털)
	2. feathers (깃털)
	3. eggs (알 낳기)
	4. milk (젖 생산)
	5. airborne (공중 비행)
	6. aquatic (수중 생활)
	7. predator (포식자)
	8. toothed (이빨)
	9. backbone (척추)
	10. breathes (호흡)
	11. venomous (독성)
	12. fins (지느러미)
	13. legs (다리 수)
	14. tail (꼬리)
	15. domestic (가축)
	16. catsize (고양이 크기)

- **클래스 (7개)**
	- 0: 포유류 (Mammal)
	- 1: 조류 (Bird)
	- 2: 파충류 (Reptile)
	- 3: 어류 (Fish)
	- 4: 양서류 (Amphibian)
	- 5: 곤충 (Bug)
	- 6: 무척추동물 (Invertebrate)

### 1.2 데이터 로딩

```python
xy = np.loadtxt('data-04-zoo.csv', delimiter=',', dtype=np.float32)
x = torch.from_numpy(xy[:, :-1])   # 마지막 열 제외 (입력)
y = torch.from_numpy(xy[:, [-1]])  # 마지막 열만 (레이블)
```

- **데이터 형태**
	- `x`: [101, 16] - 101개 샘플, 16개 특징
	- `y`: [101, 1] - 101개 샘플, 1개 레이블 (0~6)

***
## 2. One-Hot Encoding

### 2.1 One-Hot Encoding이란?

- **정의**
	- 클래스 인덱스를 벡터로 변환
	- 해당 클래스 위치만 1, 나머지는 0

- **예시**
	```
	클래스 0 → [1, 0, 0, 0, 0, 0, 0]
	클래스 1 → [0, 1, 0, 0, 0, 0, 0]
	클래스 2 → [0, 0, 1, 0, 0, 0, 0]
	...
	클래스 6 → [0, 0, 0, 0, 0, 0, 1]
	```

### 2.2 scatter_ 함수를 사용한 구현

```python
y_onehot = torch.zeros(y.size(0), 7)  # [101, 7] - 0으로 초기화
y_onehot.scatter_(1, y.long(), 1)     # 해당 위치에 1 설정
```

- **`scatter_()` 파라미터**
	- 첫 번째 인자 (1): 차원 (dim=1, 열 방향)
	- 두 번째 인자 (`y.long()`): 인덱스 텐서
	- 세 번째 인자 (1): 설정할 값

- **동작 과정**
	```python
	y = [[0], [1], [0]]  # 클래스 인덱스
	y_onehot = torch.zeros(3, 7)

	# scatter_(1, y.long(), 1) 실행
	# 각 행(i)의 y[i] 위치에 1을 설정

	결과:
	[[1, 0, 0, 0, 0, 0, 0],  # 0번 위치에 1
	 [0, 1, 0, 0, 0, 0, 0],  # 1번 위치에 1
	 [1, 0, 0, 0, 0, 0, 0]]  # 0번 위치에 1
	```

### 2.3 scatter_ 상세 설명

- **In-place 연산**
	- `scatter_()`: 원본 텐서를 직접 수정 (언더스코어 _)
	- `scatter()`: 새로운 텐서 반환

- **차원 이해**
	```python
	# dim=0: 행 방향 (세로)
	# dim=1: 열 방향 (가로)

	y_onehot.scatter_(1, y.long(), 1)
	# dim=1 → 각 행 내에서 열 위치에 값 설정
	```

- **y.long()의 이유**
	- `scatter_`는 인덱스가 정수(Long) 타입이어야 함
	- `y`가 Float 타입이므로 `.long()`으로 변환

***
## 3. 모델 구조

### 3.1 Linear 레이어

```python
linear = torch.nn.Linear(x.shape[1], y_onehot.shape[1], bias=True)
# nn.Linear(16, 7)
```

- **파라미터**
	- 입력 차원: 16 (특징 개수)
	- 출력 차원: 7 (클래스 개수)
	- 편향 사용

- **계산**
	- $z = Wx + b$
	- W: [7, 16] 행렬
	- x: [16] 벡터
	- z: [7] 벡터 (각 클래스의 점수)

### 3.2 Softmax 레이어

```python
softmax = torch.nn.Softmax(dim=1)
```

- **역할**
	- 점수(logits)를 확률 분포로 변환
	- 모든 확률의 합 = 1

- **dim=1의 의미**
	- 배치 데이터: [batch_size, num_classes]
	- dim=1: 각 샘플의 클래스 차원에 대해 Softmax 적용

### 3.3 Sequential 모델

```python
model = torch.nn.Sequential(linear, softmax)
```

- **순차적 실행**
	1. 입력 x → Linear → logits (점수)
	2. logits → Softmax → 확률 분포

***
## 4. 손실 함수 (Cross-Entropy)

### 4.1 수동 구현

```python
cost = -y_onehot * torch.log(output)
cost = cost.sum(dim=1).mean()
```

- **수식**
$$\text{Loss} = -\frac{1}{N}\sum_{i=1}^{N}\sum_{j=1}^{K} y_{ij} \log(\hat{y}_{ij})$$

- **계산 과정**
	1. `y_onehot * torch.log(output)`: Element-wise 곱
	2. `sum(dim=1)`: 각 샘플의 클래스 차원 합산
	3. `mean()`: 전체 샘플 평균

### 4.2 계산 예시

```python
# 샘플 1개에 대해
y_onehot = [1, 0, 0, 0, 0, 0, 0]  # 클래스 0
output   = [0.9, 0.05, 0.01, 0.01, 0.01, 0.01, 0.01]  # 예측 확률

# Element-wise 곱
-y_onehot * log(output) = [-1*log(0.9), 0, 0, 0, 0, 0, 0]
                        ≈ [0.105, 0, 0, 0, 0, 0, 0]

# 합산
sum = 0.105

# 모든 샘플에 대해 평균
mean_loss = 평균(모든 샘플의 loss)
```

### 4.3 One-Hot의 효과

- **정답 클래스만 계산**
	- One-Hot에서 정답 위치만 1, 나머지는 0
	- 0으로 곱해진 항은 무시됨
	- 결국 정답 클래스의 $-\log(\hat{y})$만 계산

$$\text{Loss}_i = -\log(\hat{y}_{\text{true class}})$$

***
## 5. 예측 및 정확도

### 5.1 torch.max 함수

```python
prediction = torch.max(output, 1)[1].float()
```

- **`torch.max(input, dim)` 반환값**
	- [0]: 최댓값 (values)
	- [1]: 최댓값의 인덱스 (indices)

- **예시**
	```python
	output = [[0.1, 0.7, 0.2],
	          [0.8, 0.1, 0.1],
	          [0.2, 0.3, 0.5]]

	max_values, max_indices = torch.max(output, 1)
	# max_values  = [0.7, 0.8, 0.5]  # 각 행의 최댓값
	# max_indices = [1, 0, 2]        # 각 행의 최댓값 인덱스

	prediction = max_indices.float()  # [1, 0, 2]
	```

- **`[1]`의 의미**
	- `torch.max(output, 1)`: (values, indices) 튜플 반환
	- `[1]`: indices만 선택
	- `.float()`: Float 타입으로 변환

### 5.2 squeeze() 함수

```python
correct_accuracy = prediction == y.squeeze()
```

- **차원 불일치 문제**
	```python
	prediction: [101]      # 1차원 텐서 [1, 0, 2, ...]
	y:          [101, 1]   # 2차원 텐서 [[1], [0], [2], ...]
	```

- **squeeze() 역할**
	```python
	y.squeeze()  # [101, 1] → [101]
	# [[1], [0], [2]] → [1, 0, 2]
	```
	- 크기가 1인 차원 제거
	- 비교 연산을 위해 차원 맞춤

- **비교 및 정확도**
	```python
	correct_accuracy = prediction == y.squeeze()
	# [True, False, True, ...] - Boolean 텐서

	accuracy = correct_accuracy.float().mean()
	# True → 1.0, False → 0.0 변환 후 평균
	```

***
## 6. 학습 과정 상세

### 6.1 전체 루프

```python
for step in range(2100):
    optimizer.zero_grad()     # 1. 기울기 초기화
    output = model(x)         # 2. 순전파
    cost = ...                # 3. 손실 계산
    cost.backward()           # 4. 역전파
    optimizer.step()          # 5. 파라미터 업데이트
```

### 6.2 각 단계 설명

1. **기울기 초기화**
	- 이전 반복의 기울기 제거
	- PyTorch는 기울기를 누적하므로 필수

2. **순전파**
	- x → Linear → Softmax → output
	- output: [101, 7] - 각 샘플의 클래스별 확률

3. **손실 계산**
	- Cross-Entropy Loss
	- One-Hot 레이블과 예측 확률 비교

4. **역전파**
	- 손실에 대한 파라미터의 기울기 계산
	- ∂Loss/∂W, ∂Loss/∂b

5. **파라미터 업데이트**
	- SGD: W = W - lr × ∂Loss/∂W

### 6.3 출력 형식

```python
print("Step: {:5}\tLoss: {:.3f}\tAcc: {:.2%}".format(
    step, cost.item(), accuracy))
```

- **포맷 지정자**
	- `{:5}`: 5자리 정수
	- `{:.3f}`: 소수점 3자리
	- `{:.2%}`: 백분율 (소수점 2자리)

- **출력 예시**
	```
	Step:     0	Loss: 2.453	Acc: 14.85%
	Step:   100	Loss: 0.852	Acc: 72.28%
	Step:   200	Loss: 0.512	Acc: 89.11%
	```

***
## 7. PyTorch 내장 함수 사용 (권장)

### 7.1 CrossEntropyLoss 사용

```python
import torch
import torch.nn as nn
import numpy as np

torch.manual_seed(777)

# 데이터 로드
xy = np.loadtxt('data-04-zoo.csv', delimiter=',', dtype=np.float32)
x = torch.from_numpy(xy[:, :-1])
y = torch.from_numpy(xy[:, [-1]]).long().squeeze()  # 클래스 인덱스

# 모델 정의 (Softmax 제거!)
model = nn.Linear(x.shape[1], 7)

# CrossEntropyLoss (내부에 Softmax 포함)
criterion = nn.CrossEntropyLoss()

# 옵티마이저
optimizer = torch.optim.SGD(model.parameters(), lr=0.1)

# 학습
for step in range(2100):
    # 순전파
    logits = model(x)  # Softmax 거치지 않은 값

    # 손실 계산 (내부에서 Softmax 적용)
    loss = criterion(logits, y)

    # 역전파
    optimizer.zero_grad()
    loss.backward()
    optimizer.step()

    # 예측 및 정확도
    if step % 100 == 0:
        with torch.no_grad():
            predictions = torch.argmax(logits, dim=1)
            accuracy = (predictions == y).float().mean()
            print(f'Step: {step:5}\tLoss: {loss.item():.3f}\tAcc: {accuracy:.2%}')
```

### 7.2 주요 차이점

| 구분 | 수동 구현 | PyTorch 내장 |
|------|----------|-------------|
| **One-Hot Encoding** | 필요 (scatter_) | 불필요 (클래스 인덱스 사용) |
| **Softmax** | 모델에 포함 | 손실 함수에 포함 |
| **Loss 계산** | 수동 계산 | `nn.CrossEntropyLoss()` |
| **레이블 형식** | One-Hot [101, 7] | 클래스 인덱스 [101] |
| **예측** | `torch.max()[1]` | `torch.argmax()` |
| **수치 안정성** | 낮음 | 높음 (LogSoftmax 사용) |

***
## 8. 함수별 상세 설명

### 8.1 scatter_ vs scatter

```python
# scatter_: in-place 연산 (원본 수정)
y_onehot.scatter_(1, y.long(), 1)  # y_onehot 자체가 변경됨

# scatter: 새 텐서 반환 (원본 유지)
y_onehot_new = y_onehot.scatter(1, y.long(), 1)  # 새 텐서 생성
```

### 8.2 sum(dim=1) vs mean()

```python
# 2D 텐서 [batch_size, num_classes]
cost = -y_onehot * torch.log(output)  # [101, 7]

# sum(dim=1): 각 샘플(행)별로 클래스 차원 합산
cost_per_sample = cost.sum(dim=1)  # [101] - 각 샘플의 총 손실

# mean(): 모든 샘플의 평균 손실
total_cost = cost_per_sample.mean()  # scalar
```

### 8.3 squeeze() vs unsqueeze()

```python
# squeeze(): 크기 1인 차원 제거
y = [[1], [2], [3]]  # shape: (3, 1)
y_squeezed = y.squeeze()  # [1, 2, 3], shape: (3,)

# unsqueeze(): 차원 추가
y = [1, 2, 3]  # shape: (3,)
y_unsqueezed = y.unsqueeze(1)  # [[1], [2], [3]], shape: (3, 1)
```

### 8.4 argmax vs max

```python
output = [[0.1, 0.7, 0.2],
          [0.8, 0.1, 0.1]]

# argmax: 최댓값의 인덱스만 반환
indices = torch.argmax(output, dim=1)  # [1, 0]

# max: (최댓값, 인덱스) 튜플 반환
values, indices = torch.max(output, dim=1)
# values: [0.7, 0.8]
# indices: [1, 0]
```

***
## 9. One-Hot Encoding 대안

### 9.1 torch.nn.functional.one_hot

```python
import torch.nn.functional as F

# 클래스 인덱스
y = torch.tensor([0, 1, 0, 2])  # [4]

# One-Hot Encoding
y_onehot = F.one_hot(y, num_classes=7)
# tensor([[1, 0, 0, 0, 0, 0, 0],
#         [0, 1, 0, 0, 0, 0, 0],
#         [1, 0, 0, 0, 0, 0, 0],
#         [0, 0, 1, 0, 0, 0, 0]])
```

### 9.2 수동 구현 비교

```python
# 방법 1: scatter_ (예제 코드)
y_onehot = torch.zeros(y.size(0), 7)
y_onehot.scatter_(1, y.long(), 1)

# 방법 2: F.one_hot (간단)
y_onehot = F.one_hot(y.long().squeeze(), num_classes=7)

# 방법 3: 반복문 (비효율적)
y_onehot = torch.zeros(y.size(0), 7)
for i in range(y.size(0)):
    y_onehot[i, int(y[i])] = 1
```

***
## 10. 데이터 전처리

### 10.1 특징 정규화

```python
# 표준화
x_mean = x.mean(dim=0)
x_std = x.std(dim=0)
x_normalized = (x - x_mean) / (x_std + 1e-8)  # 0으로 나누기 방지

# 최소-최대 정규화
x_min = x.min(dim=0)[0]
x_max = x.max(dim=0)[0]
x_normalized = (x - x_min) / (x_max - x_min + 1e-8)
```

### 10.2 데이터 분할

```python
from sklearn.model_selection import train_test_split

# NumPy로 변환
x_np = x.numpy()
y_np = y.numpy()

# 학습/테스트 분할
x_train, x_test, y_train, y_test = train_test_split(
    x_np, y_np, test_size=0.2, random_state=777
)

# 다시 텐서로
x_train = torch.from_numpy(x_train)
x_test = torch.from_numpy(x_test)
y_train = torch.from_numpy(y_train)
y_test = torch.from_numpy(y_test)
```

***
## 11. 핵심 정리

### 11.1 Softmax Regression 구조

- **다중 클래스 분류**
	- 7개 클래스 (동물 종류)
	- Linear(16, 7) + Softmax
	- 각 클래스의 확률 분포 출력

- **One-Hot Encoding**
	- 클래스 인덱스 → 벡터 변환
	- `scatter_()` 함수로 구현
	- 정답 클래스 위치만 1, 나머지 0

### 11.2 손실 함수 및 예측

- **Cross-Entropy Loss**
	- 수동 구현: `-y_onehot * log(output)`
	- PyTorch 내장: `nn.CrossEntropyLoss()`
	- 정답 클래스의 예측 확률만 고려

- **예측 클래스 결정**
	- `torch.max(output, 1)[1]`: 최대 확률의 인덱스
	- `torch.argmax(output, 1)`: 동일 기능 (간단)

### 11.3 중요 함수

- **`scatter_(dim, index, value)`**
	- In-place로 특정 위치에 값 설정
	- One-Hot Encoding 생성

- **`squeeze()` / `unsqueeze()`**
	- 차원 조정
	- 비교 연산을 위한 차원 맞춤

- **`sum(dim)` / `mean()`**
	- 차원별 합산 및 평균
	- 손실 함수 계산

### 11.4 수동 구현 vs 내장 함수

- **수동 구현의 장점**
	- 내부 동작 원리 이해
	- 학습 목적으로 유용

- **내장 함수의 장점**
	- 수치적 안정성 (LogSoftmax 사용)
	- 코드 간결성
	- 최적화된 성능

- **실전 권장**
	- `nn.CrossEntropyLoss()` 사용
	- 클래스 인덱스 직접 사용 (One-Hot 불필요)
	- `torch.argmax()` 사용

***
## 12. 최신 PyTorch 코드 (권장)

```python
import torch
import torch.nn as nn
import numpy as np

torch.manual_seed(777)

# 데이터 로드
xy = np.loadtxt('data-04-zoo.csv', delimiter=',', dtype=np.float32)
x = torch.from_numpy(xy[:, :-1])
y = torch.from_numpy(xy[:, -1]).long()  # 클래스 인덱스, Long 타입

# 데이터 분할
from sklearn.model_selection import train_test_split
x_train, x_test, y_train, y_test = train_test_split(
    x.numpy(), y.numpy(), test_size=0.2, random_state=777
)
x_train = torch.from_numpy(x_train)
x_test = torch.from_numpy(x_test)
y_train = torch.from_numpy(y_train)
y_test = torch.from_numpy(y_test)

# 모델 정의
class ZooClassifier(nn.Module):
    def __init__(self):
        super(ZooClassifier, self).__init__()
        self.fc = nn.Linear(16, 7)

    def forward(self, x):
        return self.fc(x)

model = ZooClassifier()

# 손실 함수 및 옵티마이저
criterion = nn.CrossEntropyLoss()
optimizer = torch.optim.SGD(model.parameters(), lr=0.1)

# 학습
num_epochs = 2100
for epoch in range(num_epochs):
    # 순전파
    logits = model(x_train)
    loss = criterion(logits, y_train)

    # 역전파
    optimizer.zero_grad()
    loss.backward()
    optimizer.step()

    # 평가
    if epoch % 100 == 0:
        model.eval()
        with torch.no_grad():
            # 학습 정확도
            train_preds = torch.argmax(logits, dim=1)
            train_acc = (train_preds == y_train).float().mean()

            # 테스트 정확도
            test_logits = model(x_test)
            test_preds = torch.argmax(test_logits, dim=1)
            test_acc = (test_preds == y_test).float().mean()

            print(f'Epoch: {epoch:5}\tLoss: {loss.item():.3f}\t'
                  f'Train Acc: {train_acc:.2%}\tTest Acc: {test_acc:.2%}')
        model.train()

# 최종 평가
model.eval()
with torch.no_grad():
    test_logits = model(x_test)
    test_preds = torch.argmax(test_logits, dim=1)
    test_acc = (test_preds == y_test).float().mean()
    print(f'\nFinal Test Accuracy: {test_acc:.2%}')
```