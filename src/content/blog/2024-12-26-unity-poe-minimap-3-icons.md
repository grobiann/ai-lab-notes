---
title: "[Unity] PathOfExile 따라하기 - 미니맵 #3: 아이콘 표시"
description: "미니맵에 몬스터·웨이포인트 아이콘을 표시하는 방법. 월드 좌표 → UV 좌표 변환, 전장의 안개 가시성 체크, 범위 밖 오브젝트 인디케이터 처리까지 정리한다."
pubDate: 2024-12-26
tags: ["Unity", "C#", "미니맵", "PathOfExile 따라하기"]
---

미니맵 시리즈 마지막이다. 이번엔 몬스터, 웨이포인트, NPC 등 게임 오브젝트를 미니맵 위에 아이콘으로 표시한다.

## 동작 방식 정리

PathOfExile 2 기준으로 아이콘 시스템의 규칙은 이렇다.

- 전장의 안개가 걷힌 영역만 아이콘을 표시한다
- 미니맵 범위 안이면 해당 위치에 아이콘 표시
- 미니맵 범위 밖이면 테두리 위에 인디케이터(방향 표시)로 보여준다
- 전체화면 모드와 미니맵 모드에서 아이콘 크기/종류가 다를 수 있다

## 아이콘 데이터 구조

각 오브젝트가 미니맵에 어떻게 표시될지 정보를 담는 클래스를 만든다.

```csharp
public class MinimapIconAttribute
{
    public Vector2 Offset;        // 아이콘 위치 보정
    public bool IsPublic;         // 전체화면에서도 보이는지
    public Sprite IconSprite;     // 표시할 스프라이트
}
```

오브젝트마다 이 컴포넌트를 달아두면 미니맵 매니저가 순회하며 처리한다.

## 월드 좌표 → UV 좌표 변환

미니맵은 텍스처 UV 공간에서 동작한다. 월드 좌표를 UV로 변환하는 공식이 핵심이다.

```csharp
Vector2 WorldToUV(Vector3 worldPos)
{
    // tileSize: 타일 한 칸의 월드 크기
    // MapSize: 맵 전체 타일 수
    float uvX = worldPos.x / (MapSize.x * tileSize);
    float uvY = worldPos.z / (MapSize.y * tileSize);
    return new Vector2(uvX, uvY);
}
```

이 UV 좌표를 미니맵 RectTransform 크기에 곱하면 스크린 위치를 구할 수 있다.

## 전장의 안개 체크

아이콘을 표시하기 전에 해당 위치가 안개가 걷혔는지 확인한다.

방법 1 — **거리 기반**: 캐릭터와 오브젝트 간 거리를 계산해 시야 범위 안이면 표시.

```csharp
bool IsVisible(Vector3 objPos)
{
    float dist = Vector3.Distance(playerPos, objPos);
    return dist <= visionRadius;
}
```

방법 2 — **컴퓨트 셰이더 결과 활용**: 이전 편에서 만든 안개 텍스처의 해당 픽셀 알파값을 읽는다.

```csharp
bool IsVisible(Vector2Int uvPixel)
{
    Color fogSample = fogTexture.GetPixel(uvPixel.x, uvPixel.y);
    return fogSample.a < 0.5f; // 안개가 충분히 걷힌 경우
}
```

텍스처를 읽는 방식이 조금 더 정확하지만 `GetPixel`은 비용이 있다. 오브젝트 수가 많다면 거리 기반으로 먼저 걸러내는 게 낫다.

## 범위 밖 오브젝트 — 인디케이터

미니맵 Rect 바깥에 있는 오브젝트는 아이콘 대신 테두리에 방향 인디케이터를 표시한다.

사각형 경계와 캐릭터→오브젝트 선분의 교점을 구하는 방식으로 위치를 계산했다.

```csharp
Vector2 ClampToRect(Vector2 origin, Vector2 target, Rect rect)
{
    Vector2 dir = (target - origin).normalized;
    float tMin = float.MaxValue;

    // 사각형 4변과의 교점 중 가장 가까운 것
    TryIntersect(origin, dir, rect.xMin, true, ref tMin);
    TryIntersect(origin, dir, rect.xMax, true, ref tMin);
    TryIntersect(origin, dir, rect.yMin, false, ref tMin);
    TryIntersect(origin, dir, rect.yMax, false, ref tMin);

    return origin + dir * tMin;
}
```

교점에 아이콘을 작게 배치하고 방향을 향해 회전시키면 인디케이터처럼 보인다.

---

미니맵 시리즈는 여기서 마무리다. 다음 편부터는 **절차적 던전 생성** 으로 넘어간다.
