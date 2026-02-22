---
title: "[샘플 글] PostgreSQL 인덱스 전략 — 실전 가이드"
description: "언제 어떤 인덱스를 쓰면 좋은지, EXPLAIN ANALYZE로 실제 성능을 확인하는 방법을 정리합니다."
pubDate: 2026-01-28
tags: ["Backend", "Database"]
---

쿼리가 느리다는 걸 알면서도 어떤 인덱스를 걸어야 할지 매번 고민했다. 정리해두기로 했다.

## EXPLAIN ANALYZE로 확인부터

```sql
EXPLAIN ANALYZE
SELECT * FROM posts WHERE user_id = 123 ORDER BY created_at DESC LIMIT 10;
```

`Seq Scan`이 나오면 인덱스가 없다는 뜻이다. `Index Scan`이 나오면 인덱스를 타고 있는 것.

## B-Tree 인덱스 (기본)

```sql
-- 단일 컬럼
CREATE INDEX idx_posts_user_id ON posts(user_id);

-- 복합 컬럼 (선택도 높은 것 먼저)
CREATE INDEX idx_posts_user_date ON posts(user_id, created_at DESC);
```

복합 인덱스는 순서가 중요하다. `WHERE user_id = ? ORDER BY created_at` 패턴이면 `(user_id, created_at)` 순서가 맞다.

## 부분 인덱스

```sql
-- is_deleted = false인 행만 인덱싱
CREATE INDEX idx_posts_active ON posts(created_at)
WHERE is_deleted = false;
```

전체 데이터의 일부만 자주 쿼리한다면 부분 인덱스로 인덱스 크기를 줄일 수 있다.

## 언제 인덱스를 걸지 말아야 하나

- 갱신이 매우 잦은 컬럼 (쓰기 때마다 인덱스도 갱신)
- 카디널리티가 낮은 컬럼 (boolean, 성별 등 — 전체 스캔이 오히려 빠를 수 있음)
- 작은 테이블 (몇 천 행 이하라면 시퀀셜 스캔이 더 빠름)

인덱스는 읽기를 빠르게 하는 대신 쓰기를 느리게 하고 공간을 쓴다는 트레이드오프를 기억해두자.
