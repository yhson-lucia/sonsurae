# XOR Gate 구현

***

## 개요

XOR (Exclusive OR) 게이트는 **선형 분리가 불가능**한 대표적인 문제입니다. 이 실습에서는:
1. **단층 신경망으로 XOR을 시도** → 실패 (왜 안되는지 확인)
2. **다층 신경망으로 XOR 구현** → 성공 (은닉층의 중요성)
3. **Wide vs Deep 네트워크** 비교

***

## 1. XOR 문제란?

### XOR 진리표

| x1 | x2 | XOR 출력 |
|----|----|----|
| 0  | 0  | 0  |
| 0  | 1  | 1  |
| 1  | 0  | 1  |
| 1  | 1  | 0  |

### 왜 선형 분리가 불가능한가?

- AND, OR 게이트는 **하나의 직선**으로 0과 1을 분리 가능
- XOR은 하나의 직선으로는 절대 분리할 수 없음
- **비선형 결정 경계**가 필요 → 은닉층 필요

***

## 2. 실패 사례: 단층 신경망

### 코드 (은닉층 없음)

```python
import torch
import numpy as np

torch.manual_seed(777)

# XOR 데이터
x_data = np.array([[0,0],[0,1],[1,0],[1,1]], dtype=np.float32)
y_data = np.array([[0],[1],[1],[0]], dtype=np.float32)

X = torch.from_numpy(x_data)  # (4,2)
Y = torch.from_numpy(y_data)  # (4,1)

# 단층 신경망: 입력층 → 출력층 (은닉층 없음!)
linear = torch.nn.Linear(X.shape[1], Y.shape[1], bias=True)  # (2,1)
sigmoid = torch.nn.Sigmoid()
model = torch.nn.Sequential(linear, sigmoid)

# 옵티마이저
optimizer = torch.optim.SGD(model.parameters(), lr=0.1)

# 학습
for step in range(1000):
    optimizer.zero_grad()
    hypothesis = model(X)

    # Binary Cross Entropy (수동 계산)
    cost = -(Y*torch.log(hypothesis) + (1-Y)*torch.log(1-hypothesis)).mean()

    cost.backward()
    optimizer.step()

    if step % 100 == 0:
        print(step, cost.data.numpy())

# 정확도 계산
predicted = (model(X).data > 0.5).float()
accuracy = (predicted == Y.data).float().mean()
print("\nHypothesis: ", hypothesis.data.numpy())
print("Correct: ", predicted.numpy())
print("Accuracy: ", accuracy)
```

### 실행 결과

```
0 0.7136697
100 0.69314724
200 0.69314724
300 0.69314724
...
900 0.69314724

Hypothesis:  [[0.5]
              [0.5]
              [0.5]
              [0.5]]
Correct:  [[0.]
           [1.]
           [1.]
           [0.]]
Accuracy:  tensor(0.5000)
```

### 왜 실패했는가?

- **정확도 50%** - 랜덤과 동일
- 모든 입력에 대해 **0.5로 수렴** (결정을 못 내림)
- Cost가 **0.693으로 고정** (더 이상 학습 안됨)
- **은닉층이 없어** 비선형 패턴을 학습할 수 없음
- 단층 퍼셉트론의 한계를 명확히 보여주는 예시

***

## 3. 성공 사례: 다층 퍼셉트론 (은닉층 추가)

### 코드 (은닉층 2개 노드)

```python
import torch
import numpy as np

torch.manual_seed(777)

# XOR 데이터
x_data = np.array([[0, 0], [0, 1], [1, 0], [1, 1]], dtype=np.float32)
y_data = np.array([[0], [1], [1], [0]], dtype=np.float32)

X = torch.from_numpy(x_data)
Y = torch.from_numpy(y_data)

# 다층 신경망: 입력층(2) → 은닉층(2) → 출력층(1)
linear = torch.nn.Linear(X.shape[1], 2, bias=True)      # 입력층 → 은닉층
linear2 = torch.nn.Linear(2, Y.shape[1], bias=True)     # 은닉층 → 출력층
sigmoid = torch.nn.Sigmoid()

model = torch.nn.Sequential(
    linear,
    sigmoid,      # 은닉층 활성화
    linear2,
    sigmoid       # 출력층 활성화
)

optimizer = torch.optim.SGD(model.parameters(), lr=0.1)

# 학습
for step in range(10000):
    optimizer.zero_grad()
    hypothesis = model(X)

    # Binary Cross Entropy
    cost = -(Y * torch.log(hypothesis) + (1 - Y)*torch.log(1-hypothesis)).mean()

    cost.backward()
    optimizer.step()

    if step % 1000 == 0:
        print("step:", step, "cost:", cost.item())

# 정확도 계산
predicted = (model(X).data > 0.5).float()
accuracy = (predicted == Y.data).float().mean()
print("\nHypothesis: ", hypothesis.data.numpy())
print("Correct: ", predicted.numpy())
print("Accuracy: ", accuracy)
```

### 실행 결과

```
step: 0 cost: 0.7447916865348816
step: 1000 cost: 0.08034417033195496
step: 2000 cost: 0.03346471115946770
step: 3000 cost: 0.02022820152342319
step: 4000 cost: 0.01423891168087721
step: 5000 cost: 0.01083815190941095
step: 6000 cost: 0.00870161037892103
step: 7000 cost: 0.00723783904686570
step: 8000 cost: 0.00616788677871227
step: 9000 cost: 0.00535689247772098

Hypothesis:  [[0.01338215]
              [0.98166835]
              [0.98809403]
              [0.01135805]]
Correct:  [[0.]
           [1.]
           [1.]
           [0.]]
Accuracy:  tensor(1.)
```

### 성공 요인

- **정확도 100%** 달성!
- Cost가 **0.005로 감소** (지속적 학습)
- 예측값이 **명확한 0 또는 1**로 수렴
- **은닉층 2개 노드**로 비선형 결정 경계 형성
- XOR 문제 완벽 해결

***

## 4. Wide vs Deep 네트워크

### 네트워크를 확장하는 2가지 방법

**1. Wide Network (넓게)**
- 각 층의 **노드 수를 늘림**
- 예: 은닉층 2개 → 10개, 50개, 100개

```python
# Wide 예시
model = torch.nn.Sequential(
    torch.nn.Linear(2, 100),   # 은닉층 노드 100개
    torch.nn.Sigmoid(),
    torch.nn.Linear(100, 1),
    torch.nn.Sigmoid()
)
```

**2. Deep Network (깊게)**
- **층의 개수를 늘림**
- 예: 은닉층 1개 → 2개, 3개, 10개

```python
# Deep 예시
model = torch.nn.Sequential(
    torch.nn.Linear(2, 10),     # 은닉층 1
    torch.nn.ReLU(),
    torch.nn.Linear(10, 10),    # 은닉층 2
    torch.nn.ReLU(),
    torch.nn.Linear(10, 10),    # 은닉층 3
    torch.nn.ReLU(),
    torch.nn.Linear(10, 1),     # 출력층
    torch.nn.Sigmoid()
)
```

### 비교

| 특성 | Wide Network | Deep Network |
|------|--------------|--------------|
| **구조** | 층은 적지만 노드 많음 | 노드는 적지만 층이 많음 |
| **학습 속도** | 빠름 (층이 적어서) | 느림 (Backprop 경로 길어짐) |
| **표현력** | 제한적 | 뛰어남 (계층적 특징 학습) |
| **파라미터 수** | 많음 (노드 수에 비례) | 상대적으로 적음 |
| **일반화** | 과적합 위험 높음 | 더 좋은 일반화 성능 |
| **적용** | 간단한 문제 | 복잡한 문제 (이미지, 언어) |

### 현대 딥러닝의 경향

- **Deep Network가 주류**
- ResNet (152층), GPT (수십~수백 층)
- 층이 깊을수록 **추상적이고 복잡한 패턴** 학습 가능
- XOR처럼 간단한 문제는 얕은 네트워크로도 충분

***

## 5. 최신 PyTorch 코드 (권장)

### BCEWithLogitsLoss 사용

```python
import torch
import torch.nn as nn
import torch.optim as optim

# 시드 고정
torch.manual_seed(777)

# XOR 데이터
X = torch.FloatTensor([[0, 0],
                       [0, 1],
                       [1, 0],
                       [1, 1]])
Y = torch.FloatTensor([[0], [1], [1], [0]])

# 다층 신경망 모델 (클래스 방식)
class XOR_Net(nn.Module):
    def __init__(self):
        super(XOR_Net, self).__init__()
        self.fc1 = nn.Linear(2, 10)        # 입력층 → 은닉층
        self.fc2 = nn.Linear(10, 1)        # 은닉층 → 출력층
        self.relu = nn.ReLU()              # ReLU 활성화 함수

    def forward(self, x):
        x = self.relu(self.fc1(x))         # 은닉층 (ReLU 사용)
        x = self.fc2(x)                     # 출력층 (Sigmoid 제거)
        return x

# 모델, 손실 함수, 옵티마이저
model = XOR_Net()
criterion = nn.BCEWithLogitsLoss()  # Sigmoid + BCE 통합
optimizer = optim.Adam(model.parameters(), lr=0.01)

# 학습
for epoch in range(5000):
    optimizer.zero_grad()

    # Forward
    output = model(X)
    loss = criterion(output, Y)

    # Backward
    loss.backward()
    optimizer.step()

    if (epoch + 1) % 500 == 0:
        print(f'Epoch [{epoch+1}/5000], Loss: {loss.item():.4f}')

# 테스트
with torch.no_grad():
    model.eval()
    predicted = torch.sigmoid(model(X))  # Sigmoid 적용
    predicted_class = (predicted > 0.5).float()
    accuracy = (predicted_class == Y).float().mean()

    print('\n=== 최종 결과 ===')
    print(f'예측 확률:\n{predicted.numpy()}')
    print(f'\n예측 클래스:\n{predicted_class.numpy()}')
    print(f'\n정답:\n{Y.numpy()}')
    print(f'\n정확도: {accuracy.item() * 100:.2f}%')
```

### 개선 사항

1. **ReLU 활성화 함수**: Sigmoid 대신 ReLU 사용 (학습 안정성 향상)
2. **BCEWithLogitsLoss**: 수치적 안정성 개선
3. **Adam 옵티마이저**: SGD보다 빠른 수렴
4. **클래스 방식**: 확장 가능한 모델 구조
5. **torch.no_grad()**: 추론 시 메모리 효율적

***

## 6. 학습 결과 시각화

### 결정 경계 그리기

```python
import matplotlib.pyplot as plt
import numpy as np

# 학습된 모델로 결정 경계 시각화
def plot_decision_boundary(model, X, Y):
    x_min, x_max = -0.5, 1.5
    y_min, y_max = -0.5, 1.5
    h = 0.01

    # 그리드 생성
    xx, yy = np.meshgrid(np.arange(x_min, x_max, h),
                         np.arange(y_min, y_max, h))

    # 모든 그리드 포인트에 대해 예측
    grid_points = torch.FloatTensor(np.c_[xx.ravel(), yy.ravel()])

    with torch.no_grad():
        Z = torch.sigmoid(model(grid_points))
        Z = Z.reshape(xx.shape).numpy()

    # 결정 경계 그리기
    plt.contourf(xx, yy, Z, levels=20, cmap='RdYlBu', alpha=0.6)
    plt.colorbar(label='Prediction Probability')

    # 데이터 포인트 표시
    X_np = X.numpy()
    Y_np = Y.numpy().flatten()
    plt.scatter(X_np[Y_np == 0, 0], X_np[Y_np == 0, 1],
                c='blue', marker='o', s=100, label='Class 0', edgecolors='k')
    plt.scatter(X_np[Y_np == 1, 0], X_np[Y_np == 1, 1],
                c='red', marker='s', s=100, label='Class 1', edgecolors='k')

    plt.xlabel('x1')
    plt.ylabel('x2')
    plt.title('XOR Decision Boundary')
    plt.legend()
    plt.grid(True)
    plt.show()

# 시각화 실행
plot_decision_boundary(model, X, Y)
```

***

## 7. 핵심 정리

### XOR 문제 해결의 핵심

1. **은닉층의 필요성**
   - 단층 신경망: 선형 분리만 가능 → XOR 불가능
   - 다층 신경망: 비선형 결정 경계 형성 → XOR 가능

2. **최소 구조**
   - 입력층: 2개 노드
   - 은닉층: 최소 2개 노드
   - 출력층: 1개 노드

3. **학습 결과**
   - 단층: 정확도 50% (실패)
   - 다층: 정확도 100% (성공)

### Wide vs Deep

| 방식 | 장점 | 단점 |
|------|------|------|
| **Wide** | 학습 빠름 | 표현력 제한적, 파라미터 많음 |
| **Deep** | 뛰어난 표현력, 좋은 일반화 | 학습 느림, 기울기 소실 위험 |

### 실무 팁

- **간단한 문제**: 얕고 좁은 네트워크 (XOR → 2-10-1)
- **복잡한 문제**: 깊은 네트워크 (ImageNet → ResNet-152)
- **활성화 함수**: 은닉층은 ReLU, 출력층은 Sigmoid/Softmax
- **손실 함수**: BCEWithLogitsLoss 사용 (수치적 안정성)

***