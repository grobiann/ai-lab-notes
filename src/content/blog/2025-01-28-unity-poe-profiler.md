---
title: '[Unity] PathOfExile 따라하기 - 프로파일러'
description: Unity ProfilerRecorder로 CPU·GPU·메모리·네트워크를 런타임에서 직접 읽는 방법과, Unsafe 코드로 성능을 높이는 stackalloc 활용법을 정리한다.
pubDate: 2025-01-28
updatedDate: ''
tags:
  - Unity
  - C#
  - 최적화
  - PathOfExile 따라하기
draft: true
---

## 개요

게임 최적화를 위해 프로파일러를 사용하며, CPU/GPU 계산 속도와 네트워크 통신 속도를 파악합니다. cpu바운드인지, gpu바운드인지를 명확히 확인하여 병목지점을 확인하는 것이 핵심입니다.

Path of Exile 2는 런타임 프로파일러를 지원하며, Latency Exposure 전략으로 지연시간을 노출시켜 플레이 경험을 개선합니다.

![POE2 프로파일러 화면](/ai-lab-notes/images/blog/poe-profiler-1.png)

**POE2 프로파일러의 8가지 항목**

- **cpu**: CPU 작업 처리 시간
- **gpu**: GPU 렌더링 작업 시간
- **network**: 네트워크 통신 (Ping)
- **server**: 서버 응답속도
- **mem**: 메모리 사용량
- **vram**: GPU 메모리 사용량
- **drive**: 파일 I/O 속도
- **shader**: 셰이더 계산 시간

## Unity의 프로파일러

Ctrl+7로 프로파일러 창을 오픈하며, 카테고리는 CPU, Rendering, Memory, Physics, UI 등이 있습니다. Development 빌드에서만 사용 가능합니다. `Unity.Profiling`의 `ProfilerRecorder`를 통해 런타임 프로파일링이 가능합니다. `ProfilerRecorderHandle.GetAvailable`으로 약 4,800개의 Stat을 확인할 수 있습니다.

![Unity 프로파일러 창](/ai-lab-notes/images/blog/poe-profiler-2.png)

**카테고리**: Render, Scripts, Physics, Animation, AI, Audio, Particles, Lighting, Network, Loading, Memory, FileIO

**Stat**: CommandBuffer, Shader, Canvas, GUI, Batch, Scene, GI, CPU, GPU, MainThread, RenderThread, Jobs

![카테고리 및 Stat 목록](/ai-lab-notes/images/blog/poe-profiler-3.png)

Game 탭의 Statistics 기능은 이러한 Stat을 활용한 간편한 프로파일러입니다.

![Statistics 기능](/ai-lab-notes/images/blog/poe-profiler-4.png)

## 런타임 코드 구현

**최종 선택 Stat**

- cpu: CPU Total Frame Time
- gpu: GPU Frame Time
- network: Ping
- server: 미구현
- mem: System Used Memory
- vram: Gfx Used Memory
- drive: 미구현
- shader: SRPBRender.ApplyShader

**추가 모니터링 항목**: GC Used Memory, CPU Main/Render Thread Frame Time, Gfx Reserved Memory, Batches Count, SetPass Calls Count, Shadow Casters Count, File Bytes Read/Written, StdRender.ApplyShader

![Stat 선택 목록](/ai-lab-notes/images/blog/poe-profiler-5.png)

## Unsafe Code

Unsafe 키워드는 "관리되지 않는 코드"로 포인터를 통한 직접 메모리 접근을 허용합니다.

```csharp
unsafe
{
    int x = 10;
    int* ptr = &x;
    *ptr = 20;
    Debug.Log($"x: {x}"); // x: 20
}
```

```csharp
unsafe
{
    int* numbers = stackalloc int[5];
    for (int i = 0; i < 5; i++)
    {
        numbers[i] = i * 10;
        Debug.Log(numbers[i]); // 0, 10, 20, 30, 40
    }
}
```

성능 최적화에는 유리하지만 멀티플랫폼 이슈가 있습니다. 특히 IL2CPP 기반의 iOS/콘솔 빌드에서 문제가 발생할 수 있습니다.

```plain
void Func()
{
 int* pointer = 5;
}
```

## 참고자료

- scalalang2, "멀티-플레이어 게임 서버와 레이턴시 보상 테크닉", Medium
