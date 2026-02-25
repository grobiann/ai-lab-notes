---
title: "[Unity] PathOfExile 따라하기 - 던전생성 #2: 야외지역"
description: "길·강·언덕이 뒤얽힌 야외지역을 절차적으로 생성하는 방법. Path 타입 설계, Voronoi 공간분할, Room 배치 Validation까지 정리한다."
pubDate: 2025-01-21
tags: ["Unity", "C#", "절차적 생성", "PathOfExile 따라하기"]
---

실내 던전은 직사각형 방들을 연결하면 됐다. 야외지역은 훨씬 복잡하다. 꼬불꼬불한 길, 강, 언덕이 겹치고, 그 위에 보스 구역·웨이포인트 같은 방이 얹혀야 한다.

## 핵심 개념: Path

야외지역 생성의 핵심은 **Path** 다. Path는 게임 오브젝트(타일, 장식물)를 어디에 어떤 방향으로 배치할지 결정하는 선 데이터다.

Path에는 세 가지 타입이 있다.

| 타입 | 설명 |
|------|------|
| `SinglePath` | 단선 — 좁은 길, 울타리 등 |
| `DoublePath` | 양선 — 너비가 있는 도로, 강 등 |
| `Outward` | 외향 — 언덕처럼 중심에서 바깥으로 퍼지는 형태 |

## 7단계 생성 흐름

```
1. Path에 중간 점 추가      → 꼬불꼬불하게
2. DoublePath로 분리         → 두 갈래 선으로 너비 표현
3. 극단적 꺾임 완화          → 자연스러운 곡선
4. 타일 타입 결정            → Path 경로에 타일 배치
5. 고정 Room 배치            → 퀘스트, 웨이포인트, 보스
6. 랜덤 Room으로 빈 영역 채움
7. 타일 정보 기반 오브젝트 생성
```

## Path 꼬불꼬불하게

시작·종료 점을 직선으로 이으면 너무 단조롭다. 선분 중간에 랜덤 오프셋을 준 점을 재귀적으로 삽입하면 자연스러운 곡선이 된다.

```csharp
List<Vector2> SubdividePath(Vector2 a, Vector2 b, int depth, float spread)
{
    if (depth == 0) return new List<Vector2> { b };

    Vector2 mid = (a + b) / 2f;
    Vector2 perp = new Vector2(-(b - a).y, (b - a).x).normalized;
    mid += perp * Random.Range(-spread, spread);

    var result = SubdividePath(a, mid, depth - 1, spread * 0.5f);
    result.AddRange(SubdividePath(mid, b, depth - 1, spread * 0.5f));
    return result;
}
```

## 극단적 꺾임 완화

Path를 꼬불꼬불하게 만들다 보면 거의 180도로 꺾이는 구간이 생긴다. 이런 부분은 타일을 배치하기도 어렵고 플레이어가 이동하기도 이상하다.

인접한 세 점 사이의 각도를 구해서 임계값 이하면 중간 점을 이동시킨다.

```csharp
void SmoothPath(List<Vector2> points, float minAngle)
{
    for (int i = 1; i < points.Count - 1; i++)
    {
        Vector2 prev = points[i - 1];
        Vector2 curr = points[i];
        Vector2 next = points[i + 1];

        float angle = Vector2.Angle(curr - prev, next - curr);
        if (angle < minAngle)
        {
            // 중간 점을 양쪽 점의 평균 방향으로 이동
            points[i] = (prev + next) / 2f;
        }
    }
}
```

## Voronoi로 교차점 처리

도로와 강이 교차하면 다리를 생성해야 한다. 교차 판정은 선분-선분 교점 공식으로 구한다.

교차점 주변을 어느 Path에 귀속시킬지는 **Voronoi 공간분할** 로 처리한다. 각 격자 셀을 가장 가까운 Path에 귀속시키면 된다.

```csharp
PathType GetDominantPath(Vector2Int cell, List<Path> paths)
{
    float minDist = float.MaxValue;
    PathType result = PathType.None;

    foreach (var path in paths)
    {
        float dist = path.DistanceTo(cell);
        if (dist < minDist)
        {
            minDist = dist;
            result = path.Type;
        }
    }
    return result;
}
```

## Room 배치 Validation

고정 Room(보스, 웨이포인트)을 배치할 때 기존 Path와 겹치면 안 된다. 랜덤 위치를 시도하고, 겹치면 다른 seed로 재시도한다.

목표 지표: **성공률 90% 이상, 처리시간 20ms 이내**

```csharp
bool TryPlaceRoom(Room room, DungeonGrid grid, int maxAttempts = 50)
{
    for (int attempt = 0; attempt < maxAttempts; attempt++)
    {
        Vector2Int pos = GetRandomPosition(grid, room.Size);
        if (!OverlapsPath(room, pos, grid))
        {
            PlaceRoom(room, pos, grid);
            return true;
        }
    }
    return false; // 실패 → 상위에서 다른 seed로 재시도
}
```

## 타일 20여 종

야외지역 타일은 실내보다 훨씬 많다. DoublePath와 Outward 타입은 방향성이 있어서, 회전·Flip만으로는 모든 경우를 커버하지 못하는 케이스가 생긴다. 각 변을 3구간(L1·L2·L3, R1·R2·R3, U1~U3, B1~B3)으로 나눠 곡선 조합을 처리했다.

결국 약 **20여 종**의 타일이 필요했다.

---

다음 편은 Unity 프로파일러를 코드로 접근하는 방법이다.
