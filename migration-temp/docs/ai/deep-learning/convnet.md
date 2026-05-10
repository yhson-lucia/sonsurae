***
## 1. Convolutional Neural Network란?

- **CNN (Convolutional Neural Network)**
	- 합성곱 신경망
	- 뉴런의 각 부분이 이미지의 특정 부분만 담당
	- 여러 층을 거치면서 이미지의 특징을 학습하는 딥러닝 모델
	- 이미지 인식, 객체 탐지, 영상 처리 등에 주로 사용

- **고양이 시각 피질 실험에서 영감**
	- 뇌의 뉴런이 전체 시야가 아닌 특정 영역에만 반응
	- 이를 모방하여 이미지의 일부분만 처리하는 구조 설계
	- 전체 이미지를 한 번에 받지 않고 부분적으로 처리

***
## 2. Convolutional Layer의 동작 원리

### 2.1 입력 데이터

- **입력 이미지 예시**
	- 크기: 32×32×3
	- 32×32: 이미지의 가로×세로 픽셀
	- 3: 색상 채널 (RGB)

### 2.2 Filter (Kernel)

- **필터의 역할**
	- 이미지의 일부분만 처리
	- 필터 크기는 사용자가 정의 (예: 5×5)
	- 전체 이미지를 스캔하며 특징 추출

- **필터 연산 과정**
	1. 입력 이미지의 5×5×3 영역을 선택
	2. 이 영역에 대해 $Y = WX + b$ 연산 수행
	3. ReLU 활성화 함수 적용
	4. 하나의 출력 값 생성

- **필터 이동 (Sliding)**
	- 같은 필터를 이미지 전체에 적용
	- 좌에서 우로, 위에서 아래로 이동하며 연산
	- 모든 위치에서 특징 추출

***
## 3. 출력 크기 계산

### 3.1 기본 공식

$$\text{Output Size} = \frac{N - F}{\text{Stride}} + 1$$

- **변수 설명**
	- N: 입력 이미지 크기
	- F: 필터 크기
	- Stride: 필터 이동 간격

### 3.2 계산 예시

- **조건**
	- 입력: 32×32×3
	- 필터: 5×5×3
	- Stride: 1

- **출력 크기**
	- $(32 - 5) / 1 + 1 = 28$
	- 출력: 28×28×1

### 3.3 Stride의 영향

- **Stride = 1**
	- 필터가 한 칸씩 이동
	- 출력 크기가 상대적으로 큼

- **Stride = 2**
	- 필터가 두 칸씩 이동
	- 출력 크기가 작아짐
	- 계산량 감소

- **주의사항**
	- Stride 값에 따라 소수점이 나올 수 있음
	- 이 경우 padding으로 해결

***
## 4. Padding

### 4.1 Padding이란?

- **정의**
	- 입력 이미지의 테두리에 값을 추가하는 기법
	- 주로 0으로 채움 (Zero Padding)

### 4.2 Padding을 사용하는 이유

1. **모서리 정보 보존**
	- 네트워크에 이미지의 경계 정보 전달
	- 모서리 픽셀도 충분히 활용

2. **출력 크기 유지**
	- 입력과 출력의 크기를 같게 만듦
	- 정보 손실 없이 깊은 네트워크 구성 가능

### 4.3 Same Padding

- **입력 = 출력 크기**
	- 가장 일반적으로 사용하는 방식
	- Padding 크기 계산: $P = \frac{F - 1}{2}$
	- 예: 5×5 필터 → Padding 2

***
## 5. 다중 필터 사용

### 5.1 여러 필터 적용

- **6개의 필터 사용 예시**
	- 입력: 32×32×3
	- 필터 크기: 5×5×3
	- 필터 개수: 6개
	- 출력: 28×28×6 (Padding 없이)

- **각 필터의 역할**
	- 필터마다 다른 가중치(W) 사용
	- 서로 다른 특징 추출 (엣지, 텍스처, 패턴 등)

### 5.2 Layer 쌓기

- **CONV + ReLU 반복**
	- 입력: 32×32×3
	- CONV + ReLU (5×5×3 필터 6개) → 28×28×6
	- CONV + ReLU (5×5×6 필터) → ...
	- 여러 층을 쌓아 깊은 네트워크 구성

***
## 6. 학습 가능한 파라미터

### 6.1 가중치 개수 계산

- **한 개의 5×5×3 필터**
	- 가중치: $5 \times 5 \times 3 = 75$개
	- 편향: 1개
	- 총 76개 파라미터

- **6개의 필터 사용 시**
	- $76 \times 6 = 456$개 파라미터
	- 이 값들이 학습을 통해 최적화됨

### 6.2 완전 연결층과의 비교

- **장점**
	- 같은 필터를 여러 위치에 재사용
	- 파라미터 수가 크게 감소
	- 과적합 위험 감소
	- 계산 효율성 향상

***
## 7. Pooling Layer

### 7.1 Pooling이란?

- **정의**
	- Sampling(다운샘플링) 기법
	- Feature map의 크기를 줄임
	- 공간적 크기는 감소, 깊이는 유지

### 7.2 Max Pooling

- **동작 원리**
	- 특정 영역에서 최댓값만 선택
	- 가장 강한 특징만 추출

- **예시**
	- 입력: 4×4 영역
	- 2×2 필터, Stride 2
	- 각 2×2 영역에서 최댓값 선택
	- 출력: 2×2

### 7.3 다른 Pooling 방법

- **Average Pooling**
	- 평균값 계산
	- 전체적인 특징 반영

- **Global Average Pooling**
	- 각 채널의 전체 평균
	- 완전 연결층 대체 가능

### 7.4 Pooling의 장점

1. **차원 축소**
	- 계산량 감소
	- 메모리 사용량 감소

2. **불변성 (Invariance)**
	- 작은 위치 변화에 강건
	- 약간의 이동이나 왜곡에도 동일한 특징 추출

3. **과적합 방지**
	- 파라미터 없음 (학습 불필요)
	- 일반화 성능 향상

***
## 8. CNN 전체 구조

### 8.1 전형적인 CNN 아키텍처

```
입력 이미지
  ↓
[CONV → ReLU → POOL] × N
  ↓
[CONV → ReLU → POOL] × M
  ↓
Flatten
  ↓
[Fully Connected → ReLU] × K
  ↓
Softmax
  ↓
출력 (분류 결과)
```

### 8.2 각 단계의 역할

- **CONV Layer**
	- 특징 추출
	- 학습 가능한 필터 적용

- **Activation (ReLU)**
	- 비선형성 추가
	- 음수 값 제거

- **POOL Layer**
	- 차원 축소
	- 위치 불변성 확보

- **Fully Connected Layer**
	- 고수준 추론
	- 최종 분류

***
## 9. CNN의 특징

### 9.1 장점

1. **파라미터 공유 (Parameter Sharing)**
	- 같은 필터를 이미지 전체에 적용
	- 파라미터 수 대폭 감소

2. **지역적 연결 (Local Connectivity)**
	- 인접한 픽셀만 연결
	- 공간적 관계 학습

3. **계층적 특징 학습**
	- 낮은 층: 엣지, 선 등 단순한 특징
	- 높은 층: 복잡한 패턴, 객체 부분

4. **이동 불변성 (Translation Invariance)**
	- 객체의 위치가 바뀌어도 인식 가능

### 9.2 단점

1. **많은 데이터 필요**
	- 깊은 네트워크일수록 더 많은 데이터 필요

2. **계산 비용**
	- 학습 시간이 오래 걸림
	- GPU 필요

3. **위치 정보 손실**
	- Pooling으로 인한 정확한 위치 정보 손실

***
## 10. 주요 CNN 아키텍처 예시

- **LeNet-5 (1998)**
	- 최초의 실용적 CNN
	- 손글씨 숫자 인식

- **AlexNet (2012)**
	- ImageNet 대회 우승
	- ReLU, Dropout 사용

- **VGGNet (2014)**
	- 3×3 필터 반복 사용
	- 깊은 네트워크 (16~19층)

- **ResNet (2015)**
	- Skip Connection (잔차 연결)
	- 매우 깊은 네트워크 (152층 이상)

***
## 11. PyTorch 구현 예시

```python
import torch
import torch.nn as nn

class SimpleCNN(nn.Module):
    def __init__(self):
        super(SimpleCNN, self).__init__()

        # Convolutional Layers
        self.conv1 = nn.Conv2d(
            in_channels=3,      # RGB 입력
            out_channels=6,     # 6개 필터
            kernel_size=5,      # 5x5 필터
            stride=1,
            padding=2           # Same padding
        )

        self.pool = nn.MaxPool2d(
            kernel_size=2,      # 2x2 풀링
            stride=2
        )

        self.conv2 = nn.Conv2d(6, 16, 5)

        # Fully Connected Layers
        self.fc1 = nn.Linear(16 * 5 * 5, 120)
        self.fc2 = nn.Linear(120, 84)
        self.fc3 = nn.Linear(84, 10)  # 10개 클래스

    def forward(self, x):
        # CONV → ReLU → POOL
        x = self.pool(torch.relu(self.conv1(x)))

        # CONV → ReLU → POOL
        x = self.pool(torch.relu(self.conv2(x)))

        # Flatten
        x = x.view(-1, 16 * 5 * 5)

        # Fully Connected
        x = torch.relu(self.fc1(x))
        x = torch.relu(self.fc2(x))
        x = self.fc3(x)

        return x

# 모델 생성
model = SimpleCNN()

# 입력 예시 (배치 크기 1, RGB, 32x32)
input_image = torch.randn(1, 3, 32, 32)
output = model(input_image)
print(output.shape)  # torch.Size([1, 10])
```

***
## 12. 핵심 정리

- **CNN의 핵심 개념**
	- Convolution: 필터로 특징 추출
	- Pooling: 차원 축소 및 불변성 확보
	- 계층적 학습: 단순한 특징에서 복잡한 특징으로

- **출력 크기 계산**
	- $\text{Output} = \frac{N - F}{\text{Stride}} + 1$
	- Padding으로 크기 조절 가능

- **파라미터 수 계산**
	- 필터 하나: $F_h \times F_w \times C_{in} + 1$ (편향 포함)
	- 전체: 필터 개수만큼 곱하기

- **설계 원칙**
	- CONV 층: 특징 추출, 깊이 증가
	- POOL 층: 크기 감소, 계산량 감소
	- FC 층: 최종 분류 또는 회귀

- **실전 팁**
	- 3×3 필터가 가장 일반적
	- Batch Normalization으로 학습 안정화
	- Dropout으로 과적합 방지
	- Data Augmentation으로 데이터 부족 해결