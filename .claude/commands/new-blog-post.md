---
description: 새 블로그 글 파일을 올바른 frontmatter와 함께 생성합니다.
allowed-tools: Read, Write, Bash
---

새 블로그 글을 `src/content/blog/` 에 생성해 주세요.

## 입력 처리

`$ARGUMENTS` 에서 제목(필수)과 태그(선택)를 파악합니다.
- 예: `PostgreSQL 인덱스 최적화 Backend Database`
- 첫 번째 단어 그룹이 제목, 이후 단어들이 태그

## 파일 생성 규칙

1. 오늘 날짜를 `date +%Y-%m-%d` 로 확인합니다.
2. slug는 제목에서 생성합니다:
   - 한국어 → 영어 키워드로 변환 (예: "PostgreSQL 인덱스" → `postgresql-index`)
   - 소문자, 하이픈 연결
3. 파일명: `YYYY-MM-DD-slug.md`
4. `src/content/blog/` 에 아래 형식으로 생성합니다:

```markdown
---
title: "제목"
description: ""
pubDate: YYYY-MM-DD
tags: []
draft: true
---

<!-- 본문을 여기에 작성하세요 -->
```

## 주의사항

- `draft: true` 로 시작 — 완성 후 제거
- `description` 은 1~2문장으로 구체적으로 작성 (meta description에 그대로 사용됨)
- 생성 후 파일 경로를 알려주고, 다음 할 일(description 작성, 본문 작성)을 안내합니다.
