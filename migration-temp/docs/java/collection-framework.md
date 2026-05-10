---
title: 컬렉션 프레임워크
slug: collection-framework
category: java
summary: 자료구조 개요(배열·리스트·스택·큐·트리·해시), List/Set/Map의 주요 메서드, 정렬 메서드 정리
tags: [java, collection, data-structure, list, map, set, tree, hash]
sort_order: null
created: 2025-01-01
updated: 2026-05-10
---

## 0. 자료구조 (Data Structure)

- 프로그램 내에서 다루는 데이터를 효율적으로 관리하기 위한 개념
- 상황에 따라 데이터를 어떻게 조직화하느냐가 달라지므로, 다양한 유형의 자료구조가 만들어짐

## 1. 배열

- 가장 단순한 복합 데이터 구조
- 고정된 크기의 연속된 저장 공간 사용
- 고정 크기이므로 배열이 꽉 차면 데이터 추가 불가
- 연속된 메모리이므로 데이터 접근이 연결 리스트 대비 빠름 (첫 요소 주소 + offset 조합으로 접근)

## 2. 리스트

- **가변 길이** 데이터 구조. 배열이 초기화 시 연속 메모리를 할당받는 것과 달리, 리스트는 데이터가 추가될 때마다 동적으로 메모리를 할당받음
- 요소 간 연결 정보가 필요. 이를 **엣지(edge)** 또는 **링크(link)** 라 하고, 요소를 담은 공간을 **노드(node)** 또는 **버텍스(vertex)** 라 함

### 2.1 List 주요 메서드

| 메서드 | 설명 |
|---|---|
| `add(E e)` | 리스트의 끝에 요소를 추가 |
| `add(int index, E element)` | 리스트의 지정 위치에 요소 삽입 |
| `addAll(Collection<? extends E> c)` | 컬렉션의 모든 요소를 끝에 추가 |
| `addAll(int index, Collection<? extends E> c)` | 컬렉션의 모든 요소를 지정 위치에 추가 |
| `get(int index)` | 지정 위치의 요소 반환 |
| `set(int index, E element)` | 지정 위치의 요소를 변경하고 이전 요소 반환 |
| `remove(int index)` | 지정 위치의 요소를 제거하고 그 요소 반환 |
| `remove(Object o)` | 지정된 첫 번째 요소를 제거 |
| `clear()` | 모든 요소 제거 |
| `indexOf(Object o)` | 지정 요소의 첫 번째 인덱스 반환 |
| `lastIndexOf(Object o)` | 지정 요소의 마지막 인덱스 반환 |
| `contains(Object o)` | 지정 요소 포함 여부 반환 |
| `sort(Comparator<? super E> c)` | 비교자에 따라 정렬 |
| `subList(int fromIndex, int toIndex)` | 일부분의 뷰 반환 |
| `size()` | 요소 수 반환 |
| `isEmpty()` | 비어 있는지 여부 |
| `iterator()` | 요소에 대한 반복자 반환 |
| `toArray()` | 모든 요소를 배열로 반환 |
| `toArray(T[] a)` | 모든 요소를 지정된 배열로 반환 |

## 3. 스택 (Stack)

- 데이터를 넣고 뺄 수 있는 **LIFO** (Last In First Out) 구조
- 데이터를 넣는 행위 = `push`, 빼는 행위 = `pop`
- 데이터를 뺄 때는 항상 가장 최근에 넣은 데이터부터
- 활용 예: 브라우저의 히스토리 관리(뒤로가기), JVM 스택 공간

## 4. 큐 (Queue)

- 데이터를 넣고 뺄 수 있는 **FIFO** (First In First Out) 구조
- 데이터를 넣는 행위 = `enqueue`, 빼는 행위 = `dequeue`
- 데이터를 뺄 때는 항상 가장 이전에 넣은 데이터부터
- 내부 저장소로 배열 또는 연결 리스트 사용 가능

### 4.1 Deque (양방향 큐)

![Deque 구조](images/collection-framework-01.webp)

| 메서드 | 설명 |
|---|---|
| `offerFirst()` | 앞에 추가 |
| `offerLast()` | 뒤에 추가 |
| `pollFirst()` | 앞에서 꺼냄 |
| `pollLast()` | 뒤에서 꺼냄 |

## 5. 트리 (Tree)

- 부모-자식 관계의 노드들이 연결된 자료구조. **그래프의 부분집합**
- 연결 그래프이며, 사이클이 존재하지 않고, 트리의 연결(엣지) 수가 노드 수보다 1개 적음
- 피라미드 구조로 시각화 가능
- 자식 노드에서 부모로 타고 올라갔을 때, **부모가 없는 단 하나의 노드**가 **루트 노드(root node)**. 자식이 없는 노드들은 **리프 노드(leaf node)**

![트리 구조 예시](images/collection-framework-02.webp)

### 5.1 트리 순회 알고리즘

1. **전위 순회 (pre-order)**
2. **중위 순회 (in-order)**
3. **후위 순회 (post-order)**

**DFS** (Depth-First Search)와 **BFS** (Breadth-First Search) 알고리즘 또한 데이터 탐색 시 자주 사용되는 핵심 알고리즘.

## 6. 해시 (Hash)

- 데이터를 **해시 함수**라는 특수 함수로 변환해 위치값으로 저장
- 고유값(id)이 있는 데이터를 다룰 때 효과적
- **단점**: 충돌(collision). 해시 함수는 보통 모듈로 연산(`%`)을 포함하는데, 고유한 값이 나오지 않아 충돌이 발생할 수 있음

### 6.1 HashSet

| 메서드 | 설명 |
|---|---|
| `add(E e)` | 요소 추가 (이미 있으면 추가하지 않음) |
| `addAll(Collection<? extends E> c)` | 컬렉션의 모든 요소 추가 |
| `contains(Object o)` | 요소 포함 여부 반환 |
| `containsAll(Collection<?> c)` | 컬렉션의 모든 요소 포함 여부 반환 |
| `remove(Object o)` | 요소 제거 |
| `removeAll(Collection<?> c)` | 지정 컬렉션 요소를 모두 제거 |
| `retainAll(Collection<?> c)` | 지정 컬렉션 요소만 유지하고 나머지 제거 |
| `clear()` | 모든 요소 제거 |
| `size()` | 요소 수 반환 |
| `isEmpty()` | 비어 있는지 여부 |
| `iterator()` | 요소에 대한 반복자 반환 |
| `toArray()` | 모든 요소를 배열로 반환 |
| `toArray(T[] a)` | 모든 요소를 지정된 배열로 반환 |

### 6.2 HashMap

| 메서드 | 설명 |
|---|---|
| `put(K key, V value)` | 키-값 저장 (같은 키가 있으면 값 변경) |
| `putAll(Map<? extends K, ? extends V> m)` | 지정 맵의 모든 매핑을 복사 |
| `putIfAbsent(K key, V value)` | 키가 없는 경우에만 저장 |
| `get(Object key)` | 키에 연결된 값 반환 |
| `getOrDefault(Object key, V defaultValue)` | 키 부재 시 `defaultValue` 반환 |
| `remove(Object key)` | 키와 그 값을 제거 |
| `clear()` | 모든 매핑 제거 |
| `containsKey(Object key)` | 키 존재 여부 반환 |
| `keySet()` | 키들을 `Set`으로 반환 |
| `values()` | 값들을 `Collection`으로 반환 |
| `entrySet()` | 키-값 쌍을 `Set<Map.Entry<K,V>>`로 반환 |
| `size()` | 키-값 쌍의 개수 반환 |
| `isEmpty()` | 비어 있는지 여부 |

## 7. Collections 정렬 메서드

| 메서드 | 설명 |
|---|---|
| `max` | 최대값 찾아 반환 |
| `min` | 최소값 찾아 반환 |
| `shuffle` | 컬렉션을 랜덤하게 섞음 |
| `sort` | 정렬 기준으로 정렬 |
| `reverse` | 정렬 기준의 반대로 정렬 |
