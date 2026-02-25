---
title: "[Unity] PathOfExile 따라하기 - 미니맵 #3: 아이콘 표시"
description: "미니맵에 오브젝트 아이콘을 표시하는 방법. 월드 좌표 → UV 좌표 변환, 전장의 안개 가시성 체크, 범위 밖 오브젝트 인디케이터 처리까지 정리한다."
pubDate: 2024-12-26
tags: ["Unity", "C#", "미니맵", "PathOfExile 따라하기"]
---

최근 PathOfExile2(이하 poe2) 얼리엑세스가 출시되었습니다. 게임에 적용된 복잡해 보이는 기술들을 하나씩 따라해보려 합니다.

![미니맵 아이콘 표시 결과](/ai-lab-notes/images/blog/poe-minimap-3-1.png)

## 미니맵 아이콘 표시하기

맵에는 여러 인터렉션 가능한 오브젝트가 있으며, 미니맵에서는 이를 아이콘으로 표현합니다.

**개발 내용 분석**
1. 아이콘은 전장의 안개가 걷혔을 때에만 보여줍니다.
2. 지도의 두 가지 모드에 따라 다르게 표현됩니다.
   - 전체화면모드: 실제 지도 위치에 고정
   - 미니맵모드: 거리에 따라 indicator 또는 투명도 조정

## 개발 순서

1. 각 오브젝트의 uv좌표 구하기
2. 전장의 안개 여부 확인하기
3. Rect 범위 내 아이콘 표시

## 오브젝트의 uv좌표 구하기

```csharp
public class MinimapIconAttribute
{
    public Vector2 position;
    public bool revealed;
    public Sprite icon;
}
```

```csharp
float WorldToUV = 1.0f / _map.MapSize / _tileSize;

public Vector2 WorldPositonToUV(Vector3 worldPosition)
{
    float x = worldPosition.x * WorldToUV;
    float y = worldPosition.z * WorldToUV;
    return new Vector2(x, y);
}
```

![UV Rect 설명](/ai-lab-notes/images/blog/poe-minimap-3-2.png)

## 전장의 안개가 걷혀졌는지 확인

**방법 1: 거리 비교**

```csharp
private void UpdateIconReveal(MinimapIconAttribute icon)
{
    if (icon.revealed)
        return;

    foreach (Transform agent in _fogAgents)
    {
        Vector2 agentPosition = agent.position;
        Vector2 iconPosition = icon.position;

        float distance = Vector3.Distance(agentPosition, iconPosition);
        if (distance < _fogDrawer.RevealRadius)
        {
            icon.revealed = true;
        }
    }
}
```

**방법 2: 컴퓨트 셰이더 결과 활용**

```csharp
RenderTexture currentRT = RenderTexture.active;
RenderTexture.active = renderTexture;
texture2D.ReadPixels(new Rect(0, 0, width, height), 0, 0);
texture2D.Apply();
RenderTexture.active = currentRT;
```

## 미니맵 모드에서 Rect 범위 내 아이콘 표시

![Indicator 방향 표시](/ai-lab-notes/images/blog/poe-minimap-3-3.png)

- 아이콘이 UVRect 내부: 해당 위치에 그대로 표현
- 아이콘이 UVRect 외부: 사각형 내부 위치로 변환 표현 (padding 포함)

사각형 경계 외부에 있는 오브젝트는 테두리에 인디케이터로 방향을 표시합니다. 선분과 사각형의 교점을 구하는 방법으로 위치를 계산합니다.

## 참고자료

- [[Unity 2D] Indicator](https://inyongs.tistory.com/29)
- [[게임수학] 선분의 교점 구하기](https://velog.io/@sehoon/SegmentIntersection)
