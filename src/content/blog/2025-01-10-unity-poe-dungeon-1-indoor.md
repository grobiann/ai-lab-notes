---
title: "[Unity] PathOfExile 따라하기 - 던전생성 #1: 실내지역"
description: "매 플레이마다 새로운 실내 던전을 절차적으로 생성하는 방법. 타일·Room·던전 개념부터 8단계 생성 알고리즘까지 정리한다."
pubDate: 2025-01-10
tags: ["Unity", "C#", "절차적 생성", "PathOfExile 따라하기"]
---

PathOfExile은 매 게임마다 새로운 던전이 생성된다. 직접 구현해보기로 했다. 이번 편은 실내 던전(폐쇄된 방들이 이어진 형태)이다.

## 구성 요소

던전은 세 가지 단위로 이루어진다.

- **타일**: 1×1 격자 한 칸. 주변 타일과 연결 관계를 가진다
- **Room**: 1×1 ~ N×M 직사각형. 여러 타일로 구성
- **던전**: 여러 Room의 집합

## 타일 설계

타일은 상·하·좌·우 4방향의 연결 여부로 정의된다. 4방향 각각이 열림/닫힘이므로 조합은 2⁴ = 16가지지만, 회전과 Flip을 활용하면 실제로 필요한 스프라이트는 훨씬 적다.

Unity의 Rule Tile과 비슷하지만, 직접 만들면 Walkable 정보 등 커스텀 데이터를 타일에 담을 수 있다. 타일을 회전·Flip할 때 Walkable 정보도 함께 변환해야 한다.

## Room 구성

Room은 Tilemap2D를 활용해 프리팹으로 제작한다.

```csharp
public class Room
{
    public int Width;
    public int Height;
    public TileBase[,] Tiles;
    public bool[,] Walkable;
    public RoomType Type; // Start, End, Normal, Boss 등
}
```

Room에는 타일 데이터 외에 어떤 종류인지(`RoomType`)도 담는다. 시작·종료 Room, 보스 Room은 특정 위치에 고정 배치하고, 나머지는 랜덤으로 채운다.

## 8단계 생성 알고리즘

던전을 생성하는 순서다.

1. **던전 크기 결정**: 난이도·챕터에 따라 격자 크기를 설정
2. **시작·종료 위치 배치**: 일정 거리 이상 떨어지도록 배치
3. **Room 랜덤 배치**: 겹치지 않게 랜덤 위치에 Room을 배치
4. **최단경로 탐색**: 시작 → 종료 Room까지 BFS로 경로를 찾는다
5. **경로 최적화**: 경로에서 불필요하게 꺾이는 구간을 제거
6. **인접 Room 추가**: 경로 주변 방들을 연결해 탐험 공간을 넓힌다
7. **문 생성**: Room 사이 경계에 문을 배치
8. **오브젝트 배치**: 타일 정보 기반으로 가구·장애물 등을 스폰

```csharp
IEnumerator GenerateDungeon(DungeonConfig config)
{
    var grid = new DungeonGrid(config.Width, config.Height);

    PlaceStartAndEnd(grid, config);
    PlaceRoomsRandom(grid, config);

    var path = FindPath(grid, grid.StartRoom, grid.EndRoom);
    path = OptimizePath(path);
    ConnectAdjacentRooms(grid, path);

    PlaceDoors(grid);
    SpawnObjects(grid);

    yield return null;
}
```

각 단계를 분리했기 때문에, 예를 들어 경로 탐색 알고리즘만 다른 걸로 교체하거나 Room 배치 규칙을 바꾸기 쉽다.

## 타일 연결 처리

Room을 배치하고 나면 Room 내부 타일의 연결 정보를 갱신해야 한다. 인접한 Room의 경계 타일끼리 연결되도록 처리한다.

```csharp
void UpdateTileConnections(DungeonGrid grid)
{
    for (int x = 0; x < grid.Width; x++)
    for (int y = 0; y < grid.Height; y++)
    {
        var tile = grid.GetTile(x, y);
        if (tile == null) continue;

        tile.ConnectUp    = grid.GetTile(x, y + 1) != null;
        tile.ConnectDown  = grid.GetTile(x, y - 1) != null;
        tile.ConnectLeft  = grid.GetTile(x - 1, y) != null;
        tile.ConnectRight = grid.GetTile(x + 1, y) != null;
    }
}
```

연결 정보가 완성되면 해당하는 타일 스프라이트를 선택해서 렌더링한다.

---

다음 편에서는 길, 강, 언덕이 있는 **야외지역 던전 생성** 을 다룬다. 실내보다 훨씬 복잡하다.
