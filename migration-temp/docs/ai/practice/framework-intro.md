# Scikit-learn 프레임워크

Scikit-learn은 Python 기반의 머신러닝 라이브러리로, 지도학습과 비지도학습을 위한 다양한 알고리즘과 도구를 제공한다. 일관된 API 구조를 통해 모든 알고리즘을 동일한 방식으로 사용할 수 있다.

***

## 1. Scikit-learn 기본 구조

### 1.1 Estimator와 fit(), predict()

**Estimator 개념**:
- 지도학습에서 분류, 회귀 모델 상관없이 모두 Estimator 객체로 접근
- 일관된 인터페이스를 제공하여 학습과 예측을 동일한 방식으로 수행

**기본 메서드**:
- **fit()**: 학습 데이터로 모델을 학습
- **predict()**: 학습된 모델로 새로운 데이터 예측

### 1.2 주요 Estimator 클래스

**분류(Classification) 구현 클래스**:
- DecisionTreeClassifier
- RandomForestClassifier
- LogisticRegression
- SVC (Support Vector Classifier)
- KNeighborsClassifier

**회귀(Regression) 구현 클래스**:
- LinearRegression
- Ridge
- Lasso
- DecisionTreeRegressor
- RandomForestRegressor

***

## 2. Scikit-learn 주요 모듈

### 2.1 데이터 관련 모듈

**sklearn.datasets**:
- 사이킷런에 내장된 예제 데이터셋 제공
- iris, digits, wine 등의 샘플 데이터 포함

### 2.2 모델 선택 및 검증

**sklearn.model_selection**:
- 데이터 분리, 검증, 파라미터 튜닝 기능 제공
- 교차 검증을 위한 학습용/테스트용 분리
- Grid Search로 최적 파라미터 추출

### 2.3 피처 처리 모듈

**sklearn.preprocessing**:
- 데이터 전처리에 필요한 다양한 가공 기능 제공
- 문자열 → 숫자 코드 인코딩
- 정규화, 스케일링

**sklearn.feature_selection**:
- 알고리즘에 영향을 미치는 피처를 우선순위대로 선택
- 다양한 피처 셀렉션 기능 제공

**sklearn.feature_extraction**:
- 텍스트 데이터나 이미지 데이터의 벡터화된 피처 추출
- 텍스트 → 벡터 데이터 변환

### 2.4 차원 축소

**sklearn.decomposition**:
- 차원 축소와 관련한 알고리즘 지원
- PCA, NMF, Truncated SVD 등을 통해 차원 축소 기능 수행

### 2.5 평가

**sklearn.metrics**:
- 분류, 회귀, 클러스터링, 페어와이즈에 대한 다양한 성능 측정 방법 제공

### 2.6 머신러닝 알고리즘

**sklearn.ensemble**:
- 앙상블 알고리즘 제공
- RandomForest, AdaBoost, Gradient Boosting

**sklearn.linear_model**:
- 선형 회귀, Ridge, Lasso 및 로지스틱 회귀 등 회귀 관련 알고리즘 지원
- SGD(Stochastic Gradient Descent) 관련 알고리즘 제공

**sklearn.naive_bayes**:
- 나이브 베이즈 알고리즘 제공
- Gaussian NB, 다항분포 NB

**sklearn.neighbors**:
- 최근접 이웃 알고리즘
- K-NN 등

**sklearn.svm**:
- 서포트 벡터 머신 알고리즘 제공

**sklearn.tree**:
- 의사 결정 트리 알고리즘 제공

**sklearn.cluster**:
- 비지도 클러스터링 알고리즘 제공
- K-평균, 계층형, DBSCAN 등

### 2.7 유틸리티

**sklearn.pipeline**:
- 피처 처리 등의 변환과 ML 알고리즘 학습, 예측 등을 함께 묶어서 실행할 수 있는 유틸리티 제공

***

## 3. Model Selection

### 3.1 데이터셋 분류

**학습 데이터(Training Data)**:
- 머신러닝 알고리즘의 학습을 위해 사용
- 데이터의 속성들과 결정값(레이블)을 모두 가지고 있음
- 학습 데이터를 기반으로 머신러닝 알고리즘이 데이터 속성과 결정값의 패턴을 인지하고 학습

**테스트 데이터(Test Data)**:
- 머신러닝 알고리즘을 테스트하기 위해 사용
- 학습 데이터와는 별도의 데이터로 제공
- 모델의 일반화 성능 평가

### 3.2 train_test_split()

데이터셋을 학습용과 테스트용으로 분리해주는 함수

**주요 파라미터**:
- **dataset**: 분리할 데이터셋
- **target**: 타겟 레이블
- **test_size**: 테스트 데이터 비율 (예: 0.3 = 30%)
- **random_state**: 난수 값 지정 (동일한 학습 데이터셋 생성을 위해 사용)

**사용 예시**:
```python
from sklearn.model_selection import train_test_split

X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.3,
    random_state=42
)
```

**특징**:
- NumPy array뿐만 아니라 DataFrame/Series도 분할 가능
- 같은 타입의 객체로 반환

***

## 4. 교차 검증 (Cross Validation)

### 4.1 교차 검증 개요

**교차 검증이란**:
- 학습 데이터를 한번 더 분류하여, 학습 데이터셋에서 검증 데이터셋으로 성능 검증을 하는 방식
- 모델을 테스트 데이터로 평가하기 전에 미리 성능을 확인

**교차 검증의 필요성**:
- 작은 데이터셋일 경우, 여러 유형의 데이터셋으로 테스트할 때 성능이 안 나올 수 있음
- 검증 데이터 세트로 돌려가면서 검증을 한 뒤에, 최종적으로 테스트 데이터셋으로 평가

### 4.2 K-Fold 교차 검증

**K-Fold 방식**:
- 교차 검증 중 가장 중요한 방법
- 데이터를 K개의 폴드(Fold)로 나눔
- K번 반복하면서 학습과 검증 수행

**K-Fold 과정** (K=5 예시):
1. 데이터를 5개의 폴드로 분할
2. 1번째 폴드를 검증 세트로, 나머지 4개를 학습 세트로 사용
3. 2번째 폴드를 검증 세트로, 나머지 4개를 학습 세트로 사용
4. ...
5. 5번째 폴드를 검증 세트로, 나머지 4개를 학습 세트로 사용
6. 5번의 평가 결과를 평균하여 최종 성능 산출

### 4.3 Stratified K-Fold

**Stratified K-Fold란**:
- 불균형한 분포도를 가진 레이블(결정 클래스) 데이터 집합을 위한 K-Fold 방식
- 학습 데이터와 검증 데이터 세트가 가지는 레이블 분포도가 유사하도록 검증 데이터 추출

**일반 K-Fold와의 차이**:
- 일반 K-Fold: 단순히 순차적으로 분할
- Stratified K-Fold: 각 폴드의 레이블 분포가 전체 데이터의 레이블 분포와 동일하게 유지

***

## 5. 데이터 전처리 (Preprocessing)

### 5.1 전처리 단계

**주요 전처리 작업**:
- 데이터 클린징
- 결손값 처리 (Null/NaN 처리)
- 데이터 인코딩 (레이블, 원-핫 인코딩)
- 데이터 스케일링
- 이상치 제거
- Feature 선택, 추출 및 가공

### 5.2 결손값 처리

**결손값 (Missing Value)**:
- 데이터 처리할 때 null 값이 있을 수 있음
- 학습 시 어떻게 처리할지 결정해야 함

**처리 방법**:
- 결손값 제거
- 평균값/중앙값으로 대체
- 특정 값으로 채우기

***

## 6. 데이터 인코딩

### 6.1 인코딩의 필요성

**왜 인코딩이 필요한가**:
- 머신러닝 알고리즘은 문자열 데이터 속성을 입력받지 않음
- 모든 데이터는 숫자형으로 표현되어야 함
- 문자형 카테고리형 속성은 모두 숫자값으로 변환/인코딩 필요

### 6.2 레이블 인코딩 (Label Encoding)

**개념**:
- 레이블을 숫자로 변환하여 학습을 시킴
- 예: 붓꽃 종류를 0, 1, 2로 분류

**문제점**:
- 숫자 간 차이가 있기 때문에, 그 값에 의미가 생길 수 있음
- 예: 붓꽃1과 붓꽃2는 전혀 다른 의미지만, 숫자가 1 차이 나는 것이 알고리즘에 따라 의미가 생겨버릴 수 있음
- 순서형 데이터가 아닌 경우 부적절

### 6.3 원-핫 인코딩 (One-Hot Encoding)

**개념**:
- 각 피처 값의 유형에 따라 새로운 피처를 추가
- 고유 값에 해당하는 컬럼에만 1을 표시하고 나머지 컬럼에는 0을 표시

**예시**:
```
원본: ['Red', 'Blue', 'Green']
↓
원-핫 인코딩:
Red:   [1, 0, 0]
Blue:  [0, 1, 0]
Green: [0, 0, 1]
```

**구현**:
```python
import pandas as pd

# pandas의 get_dummies 사용
df_encoded = pd.get_dummies(df)
```

***

## 7. Feature Scaling

### 7.1 표준화 (Standardization)

**정의**:
- 데이터의 Feature 각각의 평균이 0이고 분산이 1인 가우시안 정규분포를 가진 값으로 변환

**수식**:
$$x_{new} = \frac{x - mean(x)}{stdev(x)}$$

**특징**:
- 데이터를 평균 0, 분산 1로 변경
- 이상치의 영향을 덜 받음

### 7.2 정규화 (Normalization)

**정의**:
- 서로 다른 Feature의 크기를 통일하기 위해 크기를 변환
- 데이터를 0~1 사이 값으로 변환

**수식**:
$$x_{new} = \frac{x - min(x)}{max(x) - min(x)}$$

**특징**:
- 음수 값이 있으면 -1에서 1 값으로 변환

### 7.3 Scikit-learn Feature Scaling

**StandardScaler**:
- 평균이 0, 분산이 1인 정규 분포 형태로 변환
- 표준화(Standardization) 수행

**MinMaxScaler**:
- 데이터 값을 0과 1 사이의 범위 값으로 변환
- 음수 값이 있으면 -1에서 1 값으로 변환
- 정규화(Normalization) 수행

**사용 예시**:
```python
from sklearn.preprocessing import StandardScaler, MinMaxScaler

# 표준화
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# 정규화
scaler = MinMaxScaler()
X_normalized = scaler.fit_transform(X)
```

***

## 8. 핵심 요약

### 8.1 Scikit-learn 워크플로우

```
1. 데이터 로드 (sklearn.datasets)
   ↓
2. 데이터 전처리
   - 결손값 처리
   - 데이터 인코딩 (Label/One-Hot)
   - Feature Scaling (표준화/정규화)
   ↓
3. 데이터 분할 (train_test_split)
   - 학습 데이터 / 테스트 데이터
   ↓
4. 모델 선택 및 학습
   - Estimator 객체 생성
   - fit() 메서드로 학습
   ↓
5. 교차 검증 (선택사항)
   - K-Fold / Stratified K-Fold
   ↓
6. 예측 및 평가
   - predict() 메서드로 예측
   - sklearn.metrics로 성능 평가
```

### 8.2 주요 모듈 요약

| 모듈 | 주요 기능 |
|------|----------|
| sklearn.datasets | 샘플 데이터셋 제공 |
| sklearn.model_selection | 데이터 분할, 교차 검증, 파라미터 튜닝 |
| sklearn.preprocessing | 데이터 인코딩, 스케일링 |
| sklearn.ensemble | 앙상블 알고리즘 (RandomForest, Boosting) |
| sklearn.tree | 의사결정 트리 |
| sklearn.linear_model | 선형 회귀, 로지스틱 회귀 |
| sklearn.metrics | 모델 평가 지표 |

### 8.3 핵심 포인트

**일관된 API**:
- 모든 알고리즘이 동일한 인터페이스 (fit, predict) 사용
- 학습 방법이 동일하여 다양한 알고리즘 쉽게 적용 가능

**전처리의 중요성**:
- 데이터 인코딩: 문자열 → 숫자 변환
- Feature Scaling: 서로 다른 스케일의 데이터 통일

**교차 검증**:
- 모델의 일반화 성능을 정확히 평가
- K-Fold, Stratified K-Fold 활용