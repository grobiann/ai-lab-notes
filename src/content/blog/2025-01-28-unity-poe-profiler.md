---
title: "[Unity] PathOfExile 따라하기 - 프로파일러"
description: "Unity ProfilerRecorder로 CPU·GPU·메모리·네트워크를 런타임에서 직접 읽는 방법과, Unsafe 코드로 성능을 높이는 stackalloc 활용법을 정리한다."
pubDate: 2025-01-28
tags: ["Unity", "C#", "최적화", "PathOfExile 따라하기"]
---

PathOfExile 2를 플레이하다 보면 우측 상단에 CPU·GPU·핑 등의 수치가 실시간으로 표시된다. Unity에서도 같은 걸 구현해보기로 했다.

## Unity 프로파일러 기본

`Ctrl+7`로 Unity Editor에서 프로파일러 창을 열 수 있다. 하지만 이건 Editor 전용이다. 빌드된 게임에서 런타임 수치를 읽으려면 `ProfilerRecorder` API를 써야 한다.

주의: **Development Build** 에서만 동작한다. Release 빌드에서는 프로파일러 데이터가 수집되지 않는다.

## ProfilerRecorder로 데이터 읽기

`ProfilerRecorder`는 Unity가 내부적으로 수집하는 약 4,800개의 Stat에 접근할 수 있게 해준다.

```csharp
public class PerformanceMonitor : MonoBehaviour
{
    ProfilerRecorder cpuRecorder;
    ProfilerRecorder gpuRecorder;
    ProfilerRecorder memoryRecorder;

    void OnEnable()
    {
        cpuRecorder    = ProfilerRecorder.StartNew(ProfilerCategory.Internal, "CPU Total Frame Time");
        gpuRecorder    = ProfilerRecorder.StartNew(ProfilerCategory.Internal, "GPU Frame Time");
        memoryRecorder = ProfilerRecorder.StartNew(ProfilerCategory.Memory,   "System Used Memory");
    }

    void OnDisable()
    {
        cpuRecorder.Dispose();
        gpuRecorder.Dispose();
        memoryRecorder.Dispose();
    }

    void Update()
    {
        double cpuMs  = cpuRecorder.LastValue  / 1_000_000.0; // nanosec → ms
        double gpuMs  = gpuRecorder.LastValue  / 1_000_000.0;
        long   memMB  = memoryRecorder.LastValue / (1024 * 1024);
    }
}
```

`LastValue`는 nanosecond 단위로 반환되므로 ms로 변환할 때 10⁶으로 나눈다.

## 모니터링할 주요 Stat 목록

| 항목 | Stat 이름 | 카테고리 |
|------|-----------|----------|
| CPU 프레임 시간 | `CPU Total Frame Time` | `Internal` |
| GPU 프레임 시간 | `GPU Frame Time` | `Internal` |
| 시스템 메모리 | `System Used Memory` | `Memory` |
| GPU 메모리 | `Gfx Used Memory` | `Memory` |
| 셰이더 적용 시간 | `SRPBRender.ApplyShader` | `Render` |
| 네트워크 핑 | `Ping` | `Network` |

Stat 이름은 Unity 문서에 일부만 공개되어 있고, 나머지는 직접 프로파일러 창에서 찾아야 한다.

## 여러 프레임 평균 내기

한 프레임의 값은 튀는 경우가 많다. 최근 N 프레임의 평균을 쓰면 안정적이다.

`ProfilerRecorder`는 생성 시 `capacity` 파라미터로 버퍼 크기를 지정할 수 있다.

```csharp
// 최근 5프레임을 버퍼에 유지
cpuRecorder = ProfilerRecorder.StartNew(
    ProfilerCategory.Internal,
    "CPU Total Frame Time",
    capacity: 5
);

// 평균 계산
double avgCpuMs = 0;
for (int i = 0; i < cpuRecorder.Count; i++)
    avgCpuMs += cpuRecorder.GetSample(i).Value;
avgCpuMs /= cpuRecorder.Count;
avgCpuMs /= 1_000_000.0;
```

## Unsafe 코드로 최적화

샘플을 여러 개 읽을 때 `GetSample(i)`를 루프로 호출하면 managed 메모리 할당이 발생한다. `unsafe` + `stackalloc`을 쓰면 스택에 직접 배열을 할당해 GC 부담을 없앨 수 있다.

```csharp
unsafe void ReadSamples(ProfilerRecorder recorder)
{
    int count = recorder.Count;
    ProfilerRecorderSample* samples = stackalloc ProfilerRecorderSample[count];
    recorder.CopyTo(new Span<ProfilerRecorderSample>(samples, count));

    double total = 0;
    for (int i = 0; i < count; i++)
        total += samples[i].Value;

    double avgMs = total / count / 1_000_000.0;
}
```

**주의**: `unsafe` 코드는 `Project Settings → Player → Allow Unsafe Code`를 켜야 빌드된다. IL2CPP 기반(iOS, 콘솔)에서는 포인터 동작이 다를 수 있으니 플랫폼별 테스트가 필요하다.

## PathOfExile 2의 지연 노출 전략

POE2는 단순히 수치를 보여주는 게 아니라, 수치가 나빠지기 전에 미리 로딩을 시작해서 체감 지연을 줄이는 전략을 쓴다. 예를 들어 CPU 사용률이 특정 임계값에 가까워지면 다음 지역 리소스를 미리 로드하는 식이다.

런타임에서 프로파일링 데이터를 코드로 읽을 수 있으면 이런 적응형 로딩 전략도 구현할 수 있다.
