---
title: "[Unity] PathOfExile 따라하기 - 미니맵 #1"
description: "PathOfExile2 얼리액세스 출시를 계기로, 게임에 적용된 복잡한 기술들을 하나씩 따라 구현해본다. 첫 번째는 인게임 지도를 UI에 표현하고 NavMesh로 이동 가능 영역 경계를 시각화하는 미니맵 기본 구현이다."
pubDate: 2024-12-20
tags: ["Unity", "C#", "미니맵", "PathOfExile 따라하기"]
---

최근 PathOfExile2(이하 poe2) 얼리엑세스가 출시되었습니다. 게임에 적용된 복잡해 보이는 기술들을 하나씩 따라해보려 합니다.

## Poe2 지도 살펴보기

![poe2 미니맵 화면](/ai-lab-notes/images/blog/poe-minimap-1-1.png)

위 이미지는 poe2의 프레이쏜이라는 지역입니다. 여러 기능들이 복합적으로 적용되어 있는 것을 볼 수 있습니다. 아래 순서대로 하나씩 구현해 보았습니다.

> 1. 인게임 지도를 UI에 표현
> 2. 이동 가능영역의 경계면 표현
> 3. 지도를 전체화면 / 미니맵 두가지 상태로 표현

## 인게임 지도를 UI에 표현하기

미니맵을 가장 빠르고 간단하게 만들 수 있는 방법으로 카메라를 이용한 방법이 있습니다. 카메라를 특정 Layer(ex. Minimap Layer)만 Render하도록 하고, 결과물을 RenderTexture에 표현하는 방법입니다.

![카메라 RenderTexture 설정](/ai-lab-notes/images/blog/poe-minimap-1-2.png)

## 이동 가능영역의 경계면 표현

개발중인 프로젝트에서는 캐릭터의 이동을 유니티의 NavMesh를 이용하여 구현하였습니다. `NavMesh.CalculateTriangulation()`이라는 함수를 통해 읽을 수 있었습니다.

```csharp
public enum MeshTopology
{
    Triangles = 0,
    Quads = 2,
    Lines = 3,
    LineStrip = 4,
    Points = 5
}
```

```csharp
NavMeshTriangulation triangulation = NavMesh.CalculateTriangulation();
Mesh mesh = CreateBorderMesh(triangulation);
MeshFilter meshFilter = _borderRenderer.GetComponent<MeshFilter>();
meshFilter.mesh = mesh;
```

```csharp
private Mesh CreateBorderMesh(NavMeshTriangulation triangulation)
{
    Dictionary<(Vector3, Vector3), int> edgeCount = new Dictionary<(Vector3, Vector3), int>();

    for (int i = 0; i < triangulation.indices.Length; i += 3)
    {
        Vector3 a = triangulation.vertices[triangulation.indices[i]];
        Vector3 b = triangulation.vertices[triangulation.indices[i + 1]];
        Vector3 c = triangulation.vertices[triangulation.indices[i + 2]];

        AddEdge(edgeCount, a, b);
        AddEdge(edgeCount, b, c);
        AddEdge(edgeCount, c, a);
    }

    List<Vector3> vertices = new List<Vector3>();
    List<int> indices = new List<int>();
    foreach (var edge in edgeCount)
    {
        if (edge.Value == 1)
        {
            int cnt = vertices.Count;
            vertices.Add(edge.Key.Item1);
            vertices.Add(edge.Key.Item2);

            indices.Add(cnt);
            indices.Add(cnt + 1);
        }
    }

    Mesh mesh = new Mesh();
    mesh.SetVertices(vertices);
    mesh.SetIndices(indices, MeshTopology.Lines, 0);
    return mesh;
}
```

![NavMesh 경계선 시각화 결과](/ai-lab-notes/images/blog/poe-minimap-1-3.png)

## 지도를 전체화면 / 미니맵 두가지 상태로 표현

poe2에서는 지도를 두 가지로 표현합니다.
- **전체화면 모드**: 화면 중앙에 표현되며, 지도의 모든 영역이 그려집니다.
- **미니맵 모드**: 화면 우상단에 표현되며, 캐릭터 주위만 그려집니다.

```csharp
Vector3 center = new Vector3(mapSize * 0.5f, 0, mapSize * 0.5f);
_borderCamera.transform.position = center + new Vector3(0, 100, 0);
_borderCamera.orthographicSize = mapSize * 0.5f;
_borderCamera.allowHDR = false;
_borderCamera.clearFlags = CameraClearFlags.SolidColor;
_borderCamera.backgroundColor = new Color(0, 0, 0, 0);
_borderCamera.Render();
```

```csharp
public Rect ExtractRect(Vector3 position, float worldWidth, float worldHeight)
{
    float divider = TILE_SIZE * TEXTURE_SIZE;
    float minx = (position.x - worldWidth * 0.5f) / divider;
    float miny = (position.z - worldHeight * 0.5f) / divider;
    float width = worldWidth / divider;
    float height = worldHeight / divider;

    return new Rect(minx, miny, width, height);
}
```

![전체화면/미니맵 모드 비교](/ai-lab-notes/images/blog/poe-minimap-1-4.png)

![최종 결과물](/ai-lab-notes/images/blog/poe-minimap-1-5.png)

다음 편에서는 디아블로류 미니맵에 적용되는 **전장의 안개** 기능을 구현할 예정입니다.
