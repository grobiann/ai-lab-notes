---
title: "[Unity] PathOfExile 따라하기 - 미니맵 #2: 전장의 안개"
description: "Color 배열과 가우시안 분포로 전장의 안개(Fog of War)를 구현하고, 컴퓨트 셰이더로 0.53ms에서 0.01ms로 개선한 과정을 정리한다."
pubDate: 2024-12-22
tags: ["Unity", "C#", "미니맵", "셰이더", "PathOfExile 따라하기"]
---

![전장의 안개 구현 결과](/ai-lab-notes/images/blog/poe-minimap-2-1.png)

## 전장의 안개 (Fog of War)

안개를 만드는데 고민해야 할 기능들:
- 유닛 주위 반경 시야 처리
- 이전 방문 지역 처리
- 경계부분 smoothing

## 개발 방법 선택

![개발 방법 다이어그램](/ai-lab-notes/images/blog/poe-minimap-2-2.png)

핵심 구현 방식:
- `Color[]` 배열을 이용한 시야 처리
- 가우시안 분포 기반 경계 smoothing
- Shader에서 MainTex와 FogTex 혼합

## C# - Reveal 함수

```csharp
private Color32[] _fogPixels;

public void Reveal(Texture2D texture, Vector3 position)
{
    int centerX = (int)(position.x / _tileSize);
    int centerY = (int)(position.z / _tileSize);
    float gridRevealRadius = RevealRadius / _tileSize;
    float radiusSquared = gridRevealRadius * gridRevealRadius;

    for (int y = centerY - (int)gridRevealRadius; y <= centerY + (int)gridRevealRadius; y++)
    {
        for (int x = centerX - (int)gridRevealRadius; x <= centerX + (int)gridRevealRadius; x++)
        {
            int index = y * _textureSize + x;
            if (index < 0 || index >= _fogPixels.Length)
                continue;

            float dx = x - centerX;
            float dy = y - centerY;
            float distanceSquared = dx * dx + dy * dy;
            if (distanceSquared > radiusSquared)
                continue;

            float xValue = Mathf.Sqrt(distanceSquared / radiusSquared);
            float alpha = Mathf.Clamp01(EdgeSharpness * (1 - xValue));
            byte opacity = (byte)(255 * (1.0f - alpha));
            byte prevOpacity = _fogPixels[index].a;

            if (opacity < prevOpacity)
            {
                _fogPixels[index] = new Color32(0, 0, 0, opacity);
            }
        }
    }

    texture.SetPixels32(_fogPixels);
    texture.Apply();
}
```

![Reveal 함수 적용 결과](/ai-lab-notes/images/blog/poe-minimap-2-3.png)

## HLSL - Fragment Shader (기본)

```hlsl
fixed4 frag (v2f i) : SV_Target
{
    half4 mainColor = tex2D(_MainTex, i.uv);
    half4 fogColor = tex2D(_FogTex, i.uv);

    if(fogColor.a > 0.0 && fogColor.a < 1.0)
    {
        half fogAlpha = (exp(-pow(2*fogColor.a-1, 2))-0.37)*1.59;
        half4 fog = half4(0.0, 0.0, 1.0, fogAlpha*0.9);
        mainColor *= (1 - fogColor.a* 2);
        return mainColor + fog ;
    }

    mainColor.a = mainColor.a * (1 - fogColor.a);
    return mainColor;
}
```

## HLSL - Fragment Shader (NavMesh 적용)

```hlsl
fixed4 frag (v2f i) : SV_Target
{
    half4 mainColor = tex2D(_MainTex, i.uv);
    half4 fogColor = tex2D(_FogTex, i.uv);
    half4 movableColor = tex2D(_MovableTex, i.uv);

    if (fogColor.a > 0.0 && fogColor.a < 1.0 && movableColor.r > 0)
    {
        half fogAlpha = (exp(-pow(2 * fogColor.a - 1, 2)) - 0.37) * 1.59;
        half4 fog = half4(0.0, 0.0, 1.0, fogAlpha * 0.9);
        mainColor *= (1 - fogColor.a * 2);
        return mainColor + fog;
    }

    mainColor.a = mainColor.a * (1 - fogColor.a);
    return mainColor;
}
```

![셰이더 적용 결과](/ai-lab-notes/images/blog/poe-minimap-2-4.png)

## 주요 계산식

- 기본 경계 투명도: `clamp01(cof*(1-abs(x)))`
- 가우시안 분포: `f(x) = (e^(-x²) - 0.37) × 1.59`
- 셰이더용 수정식: `(e^(-(2x-1)²) - 0.37) × 1.59`

## 최적화 - 컴퓨트 셰이더

![NavMesh 이동 가능 영역 표시](/ai-lab-notes/images/blog/poe-minimap-2-5.png)

- CPU 기반: **0.53ms** → 컴퓨트 셰이더 적용: **0.01ms**
- 512×512 텍스처 3개 = 약 3MB

![컴퓨트 셰이더 최적화 결과](/ai-lab-notes/images/blog/poe-minimap-2-6.png)

다음 편에서는 미니맵 위에 오브젝트 **아이콘을 표시**하는 기능을 구현합니다.
