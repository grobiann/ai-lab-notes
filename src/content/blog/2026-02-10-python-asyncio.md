---
title: "Python asyncio 패턴 정리"
description: "async/await를 쓰면서 자주 헷갈렸던 패턴들을 실제 코드 예시와 함께 정리합니다."
pubDate: 2026-02-10
tags: ["Python", "Backend"]
---

FastAPI를 쓰면서 asyncio를 자주 접하게 됐는데, 처음엔 어떤 걸 await해야 하는지 헷갈렸다. 자주 쓰는 패턴을 정리해둔다.

## 기본: await는 coroutine에만

```python
import asyncio

async def fetch_data(url: str) -> str:
    await asyncio.sleep(1)  # 네트워크 요청 시뮬레이션
    return f"data from {url}"

async def main():
    result = await fetch_data("https://example.com")
    print(result)

asyncio.run(main())
```

## 여러 작업 동시에: gather

순서대로 await하면 의미가 없다. `asyncio.gather`로 동시에 실행해야 한다.

```python
async def main():
    # 이건 순차 실행 (3초)
    r1 = await fetch_data("url1")
    r2 = await fetch_data("url2")
    r3 = await fetch_data("url3")

    # 이건 동시 실행 (1초)
    r1, r2, r3 = await asyncio.gather(
        fetch_data("url1"),
        fetch_data("url2"),
        fetch_data("url3"),
    )
```

## 타임아웃 처리

```python
async def main():
    try:
        result = await asyncio.wait_for(fetch_data("url"), timeout=2.0)
    except asyncio.TimeoutError:
        print("타임아웃!")
```

## FastAPI에서 주의할 점

FastAPI는 `async def` 라우터면 이벤트 루프에서 직접 실행하고, 일반 `def`라면 threadpool에서 실행한다. 그래서 동기 DB 드라이버를 async def 라우터에서 쓰면 이벤트 루프가 블로킹된다.

```python
# 나쁜 예: async def에서 동기 DB 호출
@app.get("/users")
async def get_users():
    return db.query(User).all()  # 블로킹!

# 좋은 예: async DB 드라이버 사용
@app.get("/users")
async def get_users():
    return await async_db.query(User).all()
```

asyncio는 익숙해지면 강력한데, 처음엔 어떤 게 코루틴인지 파악하는 게 관건인 것 같다.
