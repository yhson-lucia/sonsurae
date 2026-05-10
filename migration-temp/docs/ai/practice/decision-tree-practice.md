# Decision Tree 직접 구현

## 1. 개요

Decision Tree를 라이브러리 없이 직접 구현

**구현할 핵심 요소**:
- Node 클래스: 트리의 각 노드 표현
- 지니 계수(Gini Index) 계산
- Information Gain 계산
- 최적 분할점 찾기
- 재귀적 트리 구축
- 예측

---

## 2. Node 클래스

### 2.1 Node 클래스 정의

```python
class Node:
    def __init__(self, left, right, criteria, data):
        """
        Decision Tree의 노드를 표현하는 클래스

        Parameters:
        - left: 왼쪽 자식 노드
        - right: 오른쪽 자식 노드
        - criteria: 분할 기준 [feature_index, threshold]
        - data: 해당 노드의 데이터 (X와 Y가 합쳐진 형태)
        """
        self.left = left
        self.right = right
        self.criteria = criteria
        self.data = data
```

### 2.2 노드의 두 가지 유형

**1. Decision Node (내부 노드)**:
- 데이터를 분할하는 노드
- `criteria`, `left`, `right` 사용
- 예: `petal_length <= 1.9` 인가?

**2. Leaf Node (말단 노드)**:
- 최종 예측을 하는 노드
- `left`와 `right`가 `None`
- `data`의 다수결로 클래스 결정

---

## 3. ClassifierTree 클래스

### 3.1 초기화

```python
class ClassifierTree:
    def __init__(self, max_depth):
        """
        Decision Tree 분류기

        Parameters:
        - max_depth: 트리의 최대 깊이 (overfitting 방지)
        """
        self.root = None
        self.max_depth = max_depth
```

**중지 조건의 역할**:
- `max_depth`: 트리가 너무 깊어지는 것을 방지 (과적합 방지)

---

## 4. 데이터 분할 (split)

### 4.1 코드 구현

```python
def split(self, node: Node):
    """
    criteria를 기준으로 데이터를 왼쪽/오른쪽으로 분할

    Parameters:
    - node: 분할할 노드

    Returns:
    - node: 왼쪽/오른쪽 자식이 생성된 노드
    """
    criteria = node.criteria
    right = []
    left = []

    for item in node.data:
        if criteria[1] < item[criteria[0]]:
            right.append(item)
        else:
            left.append(item)

    node.left = Node(None, None, None, np.array(left))
    node.right = Node(None, None, None, np.array(right))
    return node
```

### 4.2 분할 예시

```
Original dataset (petal_length 기준, threshold=1.9):

[1.4, 0.2, ..., Setosa]     → Left  (1.4 <= 1.9)
[4.7, 1.4, ..., Versicolor] → Right (4.7 > 1.9)
[1.3, 0.2, ..., Setosa]     → Left  (1.3 <= 1.9)
[5.1, 2.4, ..., Virginica]  → Right (5.1 > 1.9)
```

---

## 5. 지니 계수 계산 (Gini Index)

### 5.1 코드 구현

```python
def get_gini(self, y):
    """
    지니 계수 계산

    Gini = 1 - Σ p(c)²

    Parameters:
    - y: 클래스 레이블 배열

    Returns:
    - gini: 지니 계수 값
    """
    parent = len(y)
    unique_value = np.unique(y)
    p = {}

    # 각 클래스별 개수 세기
    for item in y:
        p[item] = p.get(item, 0) + 1

    # 지니 계수 계산
    gini = 0
    for item in unique_value:
        pi = p[item] / parent
        gini += pi ** 2

    gini = 1 - gini
    return gini
```

### 5.2 계산 예시

```python
# y = [Setosa, Setosa, Versicolor, Virginica, Virginica, Virginica]
# 클래스 Setosa: 2개 → p = 2/6 = 0.333
# 클래스 Versicolor: 1개 → p = 1/6 = 0.167
# 클래스 Virginica: 3개 → p = 3/6 = 0.5

Gini = 1 - (0.333² + 0.167² + 0.5²)
     = 1 - (0.111 + 0.028 + 0.25)
     = 1 - 0.389
     = 0.611
```

---

## 6. Information Gain 계산

### 6.1 코드 구현

```python
def information_gain(self, node: Node):
    """
    Information Gain 계산

    IG = Gini(parent) - [w_L × Gini(left) + w_R × Gini(right)]

    Parameters:
    - node: 분할된 노드 (left, right 자식이 있어야 함)

    Returns:
    - ig: Information Gain 값
    """
    left = node.left
    right = node.right

    parent_gini = self.get_gini(node.data[:, -1])
    left_gini = self.get_gini(left.data[:, -1])
    right_gini = self.get_gini(right.data[:, -1])

    weight_lf = len(left.data) / len(node.data)
    weight_rf = len(right.data) / len(node.data)

    ig = parent_gini - weight_lf * left_gini - weight_rf * right_gini
    return ig
```

### 6.2 수식

$$IG = Gini(parent) - \left[w_L \cdot Gini(left) + w_R \cdot Gini(right)\right]$$

여기서:
- $w_L = \frac{\text{left 샘플 수}}{\text{parent 샘플 수}}$
- $w_R = \frac{\text{right 샘플 수}}{\text{parent 샘플 수}}$

---

## 7. 최적 분할 찾기 (best_split)

### 7.1 코드 구현

```python
def best_split(self, node):
    """
    Information Gain이 최대인 분할 방법 찾기

    Parameters:
    - node: 분할할 노드

    Returns:
    - node: 최적 기준으로 분할된 노드
    """
    data = node.data
    x = data[:, :-1]
    node_candi = Node(None, None, None, data)
    num_features = x.shape[1]
    best_ig = -1

    # 모든 feature에 대해 반복
    for idx in range(num_features):
        col_x = x[:, idx]
        unique_value = np.unique(col_x)

        # 각 threshold에 대해 반복
        for item in unique_value:
            criteria = [idx, item]
            node_candi.criteria = criteria
            node_candi = self.split(node_candi)

            # 빈 배열 체크
            if len(node_candi.left.data) == 0 or len(node_candi.right.data) == 0:
                continue

            ig = self.information_gain(node_candi)

            # 최댓값 갱신
            if ig > best_ig:
                best_ig = ig
                node.criteria = criteria

    self.split(node)
    return node
```

### 7.2 알고리즘 단계

```
1. 각 feature에 대해:
   ├─ 2. 해당 feature의 고유값들을 threshold 후보로 사용
   │   ├─ 3. 각 threshold로 데이터 분할
   │   ├─ 4. Information Gain 계산
   │   └─ 5. 최댓값 갱신
   └─ 반복

6. IG가 가장 큰 (feature, threshold)로 실제 분할
```

---

## 8. 트리 구축 (buildtree)

### 8.1 코드 구현

```python
def buildtree(self, node, depth):
    """
    재귀적으로 Decision Tree를 구축

    Parameters:
    - node: 현재 노드
    - depth: 현재 깊이
    """
    # 종료 조건 1: 최대 깊이 도달
    if depth == self.max_depth:
        return

    # 종료 조건 2: 데이터 없음
    if len(node.data) == 0:
        return

    # 종료 조건 3: 이미 순수 노드 (모두 같은 클래스)
    if len(np.unique(node.data[:, -1])) == 1:
        return

    # 최적 분할
    self.best_split(node)

    # 왼쪽/오른쪽 자식 재귀 호출
    self.buildtree(node.left, depth + 1)
    self.buildtree(node.right, depth + 1)
```

### 8.2 재귀 흐름

```
buildtree(root, depth=0)
├─ best_split(root)
├─ buildtree(left, depth=1)
│   ├─ best_split(left)
│   ├─ buildtree(left.left, depth=2)
│   └─ buildtree(left.right, depth=2)
└─ buildtree(right, depth=1)
    ├─ best_split(right)
    ├─ buildtree(right.left, depth=2)
    └─ buildtree(right.right, depth=2)
```

---

## 9. 학습 (set_root)

### 9.1 코드 구현

```python
def set_root(self, data):
    """
    Decision Tree 학습

    Parameters:
    - data: 전체 데이터 (X와 Y가 합쳐진 numpy array)
    """
    self.root = Node(None, None, None, data)
    self.buildtree(self.root, 0)
```

---

## 10. 예측 (predict)

### 10.1 코드 구현

```python
def predict(self, X):
    """
    예측 수행

    Parameters:
    - X: 예측할 데이터

    Returns:
    - predict_list: 예측된 클래스 레이블들
    """
    predict_list = []
    for item in X:
        result = self.predict_on(self.root, item)
        predict_list.append(result)
    return predict_list


def predict_on(self, node, row):
    """
    단일 샘플에 대한 예측 (재귀)

    Parameters:
    - node: 현재 노드
    - row: 하나의 샘플

    Returns:
    - 예측 클래스
    """
    # Leaf Node에 도달 (자식 없음)
    if node.left is None and node.right is None:
        y = node.data[:, -1]
        value, count = np.unique(y, return_counts=True)
        return value[np.argmax(count)]  # 다수결

    # Decision Node: 조건 확인 후 이동
    if row[node.criteria[0]] <= node.criteria[1]:
        return self.predict_on(node.left, row)
    else:
        return self.predict_on(node.right, row)
```

### 10.2 예측 과정

```
1. Root 노드에서 시작
   ↓
2. Decision Node인가?
   ↓ (yes)
3. feature_value <= threshold?
   ├─ yes → 왼쪽 자식으로 이동
   └─ no → 오른쪽 자식으로 이동
   ↓
4. 2번으로 돌아가 반복
   ↓
5. Leaf Node 도달 → 다수결로 클래스 반환
```

---

## 11. 전체 코드

```python
import numpy as np
import pandas as pd


class Node:
    def __init__(self, left, right, criteria, data):
        self.left = left
        self.right = right
        self.criteria = criteria
        self.data = data


class ClassifierTree:
    def __init__(self, max_depth):
        self.root = None
        self.max_depth = max_depth

    def split(self, node: Node):
        criteria = node.criteria
        right = []
        left = []
        for item in node.data:
            if criteria[1] < item[criteria[0]]:
                right.append(item)
            else:
                left.append(item)
        node.left = Node(None, None, None, np.array(left))
        node.right = Node(None, None, None, np.array(right))
        return node

    def get_gini(self, y):
        parent = len(y)
        unique_value = np.unique(y)
        p = {}
        for item in y:
            p[item] = p.get(item, 0) + 1
        gini = 0
        for item in unique_value:
            pi = p[item] / parent
            gini += pi ** 2
        gini = 1 - gini
        return gini

    def information_gain(self, node: Node):
        left = node.left
        right = node.right
        parent_gini = self.get_gini(node.data[:, -1])
        left_gini = self.get_gini(left.data[:, -1])
        right_gini = self.get_gini(right.data[:, -1])
        weight_lf = len(left.data) / len(node.data)
        weight_rf = len(right.data) / len(node.data)
        ig = parent_gini - weight_lf * left_gini - weight_rf * right_gini
        return ig

    def best_split(self, node):
        data = node.data
        x = data[:, :-1]
        node_candi = Node(None, None, None, data)
        num_features = x.shape[1]
        best_ig = -1
        for idx in range(num_features):
            col_x = x[:, idx]
            unique_value = np.unique(col_x)
            for item in unique_value:
                criteria = [idx, item]
                node_candi.criteria = criteria
                node_candi = self.split(node_candi)
                if len(node_candi.left.data) == 0 or len(node_candi.right.data) == 0:
                    continue
                ig = self.information_gain(node_candi)
                if ig > best_ig:
                    best_ig = ig
                    node.criteria = criteria
        self.split(node)
        return node

    def buildtree(self, node, depth):
        if depth == self.max_depth:
            return
        if len(node.data) == 0:
            return
        if len(np.unique(node.data[:, -1])) == 1:
            return
        self.best_split(node)
        self.buildtree(node.left, depth + 1)
        self.buildtree(node.right, depth + 1)

    def set_root(self, data):
        self.root = Node(None, None, None, data)
        self.buildtree(self.root, 0)

    def predict(self, X):
        predict_list = []
        for item in X:
            result = self.predict_on(self.root, item)
            predict_list.append(result)
        return predict_list

    def predict_on(self, node, row):
        if node.left is None and node.right is None:
            y = node.data[:, -1]
            value, count = np.unique(y, return_counts=True)
            return value[np.argmax(count)]
        if row[node.criteria[0]] <= node.criteria[1]:
            return self.predict_on(node.left, row)
        else:
            return self.predict_on(node.right, row)
```

---

## 12. 실행 및 테스트

```python
# 데이터 로드
dataset = pd.read_csv('iris.csv')
data = np.array(dataset)

X = data[:, :-1]
Y = data[:, -1]

# 학습
classifier = ClassifierTree(max_depth=3)
classifier.set_root(data)

# 예측
predictions = classifier.predict(X)

# 정확도
accuracy = np.mean(predictions == Y)
print(f"정확도: {accuracy * 100:.2f}%")

# 트리 구조 확인
print(f"루트 기준: {classifier.root.criteria}")
print(f"루트 데이터 수: {len(classifier.root.data)}")
print(f"왼쪽 데이터 수: {len(classifier.root.left.data)}")
print(f"오른쪽 데이터 수: {len(classifier.root.right.data)}")
```

### 실행 결과

```
정확도: 97.33%
루트 기준: [2, 1.9]
루트 데이터 수: 150
왼쪽 데이터 수: 50
오른쪽 데이터 수: 100
```

---

## 13. 핵심 요약

### 13.1 주요 구성 요소

| 구성 요소 | 역할 |
|-----------|------|
| Node | 트리의 각 노드 표현 |
| split | 데이터 분할 |
| get_gini | 지니 계수 계산 |
| information_gain | IG 계산 |
| best_split | 최적 분할점 찾기 |
| buildtree | 재귀적 트리 구축 |
| set_root | 학습 |
| predict | 예측 |

### 13.2 알고리즘 흐름

```
1. set_root() 호출
   ↓
2. buildtree() 재귀 시작
   ↓
3. best_split()으로 최적 분할 찾기
   ├─ 모든 (feature, threshold) 조합 시도
   ├─ information_gain() 계산
   └─ 최댓값 선택
   ↓
4. split()으로 데이터 분할
   ↓
5. 왼쪽/오른쪽 자식에 대해 buildtree() 재귀
   ↓
6. 중지 조건 만족 시 종료
   ↓
7. 트리 완성
```

### 13.3 중지 조건

- `depth == max_depth`: 최대 깊이 도달
- `len(node.data) == 0`: 데이터 없음
- `len(np.unique(node.data[:, -1])) == 1`: 순수 노드

### 13.4 트리 구조 시각화

```
            [petal_length <= 1.9?]
           /                      \
    Setosa (50개)           [다음 분할]
                             /        \
                    Versicolor    Virginica
```