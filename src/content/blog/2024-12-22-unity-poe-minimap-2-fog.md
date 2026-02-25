---
title: "[Unity] PathOfExile 따라하기 - 미니맵 #2: 전장의 안개"
description: "Color 배열과 가우시안 분포로 전장의 안개를 구현하고, 컴퓨트 셰이더로 성능을 0.53ms에서 0.01ms로 개선한 과정을 정리한다."
pubDate: 2024-12-22
tags: ["Unity", "C#", "미니맵", "셰이더", "PathOfExile 따라하기"]
---

지난 편에서 미니맵 기본 렌더링을 완성했다. 이번엔 디아블로류 게임의 상징인 **전장의 안개(Fog of War)** 를 구현한다.

## 구현 방식 선택

접근법은 크게 두 가지다.

- **메시 기반**: 안개를 3D 메시로 표현하고 미니맵 카메라에 잡히도록 배치
- **텍스처 기반**: 맵 전체 크기의 텍스처를 CPU에서 픽셀 단위로 갱신

텍스처 기반을 선택했다. 구현이 단순하고, 이후에 컴퓨트 셰이더로 GPU로 넘기기 쉽기 때문이다.

## 텍스처 갱신

맵 전체 크기에 대응하는 `Color[]` 배열을 만들고, 캐릭터 위치 주변을 매 프레임 갱신한다.

```csharp
void Reveal(Vector2Int center, int radius)
{
    for (int x = center.x - radius; x <= center.x + radius; x++)
    for (int y = center.y - radius; y <= center.y + radius; y++)
    {
        float dx = x - center.x;
        float dy = y - center.y;
        float dist = Mathf.Sqrt(dx * dx + dy * dy);
        if (dist > radius) continue;

        // 경계부분을 부드럽게 처리
        float t = dist / radius;
        float alpha = Mathf.Clamp01(1f - t);
        fogColors[y * mapWidth + x].a = Mathf.Min(fogColors[y * mapWidth + x].a, 1f - alpha);
    }
    fogTexture.SetPixels(fogColors);
    fogTexture.Apply();
}
```

경계를 단순히 잘라내면 딱딱해 보인다. 거리 비율(t)로 알파값을 부드럽게 줄여서 가장자리가 자연스럽게 퍼지도록 했다.

## 셰이더로 혼합

미니맵 텍스처와 안개 텍스처를 셰이더에서 합성한다.

```hlsl
float4 frag(v2f i) : SV_Target
{
    float4 mapColor = tex2D(_MainTex, i.uv);
    float4 fogColor = tex2D(_FogTex, i.uv);

    // 가우시안 분포로 경계 처리
    float fogAlpha = (exp(-pow(2.0 * fogColor.a - 1.0, 2.0)) - 0.37) * 1.59;
    fogAlpha = saturate(fogAlpha);

    return lerp(float4(0, 0, 0, 1), mapColor, fogAlpha);
}
```

단순 선형 보간 대신 가우시안 분포를 쓰면 경계가 훨씬 부드럽다. PathOfExile 2에서 안개 가장자리가 자연스럽게 흐릿한 이유가 이것이다.

## 성능 문제와 컴퓨트 셰이더

512×512 텍스처 기준으로 `Reveal()` 하나에 **0.53ms** 가 걸렸다. 캐릭터가 여러 명이거나 시야 범위가 넓어지면 병목이 된다.

컴퓨트 셰이더로 GPU에 연산을 넘겼다.

```hlsl
// FogReveal.compute
#pragma kernel Reveal

RWTexture2D<float4> FogTexture;
float2 Center;
float Radius;

[numthreads(8, 8, 1)]
void Reveal(uint3 id : SV_DispatchThreadID)
{
    float2 pos = float2(id.xy);
    float dist = length(pos - Center);
    if (dist > Radius) return;

    float t = dist / Radius;
    float alpha = 1.0 - saturate(t);
    FogTexture[id.xy] = min(FogTexture[id.xy], float4(1, 1, 1, 1 - alpha));
}
```

결과: **0.53ms → 0.01ms**. 53배 향상됐다.

## 메모리 사용량

512×512 텍스처 3개(맵 원본, 안개 현재 상태, 누적 방문)를 사용하며 총 **약 3MB** 다. 실용적인 범위다.

---

다음 편에서는 미니맵 위에 몬스터, 웨이포인트 등 **아이콘을 표시** 하는 기능을 구현한다.
