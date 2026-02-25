---
title: "[Unity] PathOfExile 따라하기 - 미니맵 #1"
description: "PathOfExile 2 얼리액세스를 보면서 미니맵을 어떻게 구현하는지 궁금해졌다. 카메라와 RenderTexture로 지도를 UI에 표현하고, NavMesh로 이동 가능 영역 경계를 시각화한 과정을 정리한다."
pubDate: 2024-12-20
tags: ["Unity", "C#", "미니맵", "PathOfExile 따라하기"]
---

PathOfExile 2가 얼리액세스로 출시되면서 게임을 하다 보니 기술적으로 따라 구현해보고 싶어졌다. 그 중 첫 번째는 미니맵이다.

## 미니맵 구현 방향

구현할 기능을 정리하면 세 가지다.

1. 지도를 UI에 표현
2. 이동 가능 영역의 경계면 표현 (NavMesh 활용)
3. 전체화면 / 미니맵 모드 전환

## 지도를 UI에 표현하기

가장 직관적인 방법은 카메라를 위에서 내려다보게 배치하고 결과를 RenderTexture에 담는 것이다.

미니맵 전용 카메라를 만들고, 미니맵에 표시할 레이어만 Culling Mask에 지정한다. 이 카메라의 출력을 RenderTexture에 연결하면, UI의 RawImage에서 그 텍스처를 바로 보여줄 수 있다.

```csharp
// 카메라 위치를 맵 중앙 위쪽으로 설정
minimapCamera.orthographic = true;
minimapCamera.cullingMask = minimapLayerMask;
minimapCamera.targetTexture = minimapRenderTexture;
```

카메라를 Orthographic(직교 투영)으로 설정해야 위에서 본 지도처럼 보인다. Perspective로 하면 원근감 때문에 왜곡된다.

## NavMesh로 경계 시각화

이동 가능 영역을 표시하려면 NavMesh의 삼각형 데이터를 활용한다.

```csharp
NavMeshTriangulation triangulation = NavMesh.CalculateTriangulation();
Vector3[] vertices = triangulation.vertices;
int[] indices = triangulation.indices;
```

`CalculateTriangulation()`은 NavMesh 전체를 삼각형 메시로 반환한다. 삼각형의 세 변 중 인접한 삼각형과 공유하지 않는 변만 남기면 경계선이 된다.

중복 선분 제거 로직이 핵심이다. 각 변을 `(작은 인덱스, 큰 인덱스)` 쌍으로 정규화한 뒤, 딕셔너리로 등장 횟수를 세어 1번만 나온 변만 남긴다.

```csharp
var edgeCount = new Dictionary<(int, int), int>();

for (int i = 0; i < indices.Length; i += 3)
{
    AddEdge(edgeCount, indices[i], indices[i + 1]);
    AddEdge(edgeCount, indices[i + 1], indices[i + 2]);
    AddEdge(edgeCount, indices[i + 2], indices[i]);
}

// 한 번만 등장한 변 = 경계선
var boundaryEdges = edgeCount.Where(e => e.Value == 1).Select(e => e.Key);
```

이렇게 추린 경계 선분들로 `MeshTopology.Lines` 메시를 만들어 미니맵 카메라 레이어에 배치하면 경계선이 렌더링된다.

## 전체화면 / 미니맵 모드

두 모드 모두 같은 RenderTexture를 쓴다. 차이는 UI의 표시 범위다.

`RawImage`의 `uvRect`를 조정하면 텍스처의 어느 부분을 표시할지 제어할 수 있다.

```csharp
// 미니맵 모드: 캐릭터 주변만 표시
rawImage.uvRect = ExtractRect(characterPosition, minimapSize);

// 전체화면 모드: 맵 전체 표시
rawImage.uvRect = new Rect(0, 0, 1, 1);
```

`ExtractRect()`는 캐릭터의 월드 좌표를 UV 좌표로 변환하고, 미니맵 크기에 맞는 Rect를 계산해 반환한다.

---

다음 편에서는 디아블로류 게임에 흔히 나오는 **전장의 안개(Fog of War)** 기능을 구현한다.
