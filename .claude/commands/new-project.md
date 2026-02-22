---
description: 새 프로젝트 항목을 src/content/projects/에 생성합니다.
allowed-tools: Read, Write, Glob
---

새 프로젝트 항목을 `src/content/projects/` 에 생성해 주세요.

## 입력 처리

`$ARGUMENTS` 에서 프로젝트 이름을 파악합니다.
- 예: `my-awesome-cli`

## 파일 생성 규칙

1. 기존 프로젝트 파일들의 `order` 값을 확인해 다음 순서를 결정합니다.
   - `src/content/projects/` 내 파일들의 frontmatter `order` 를 읽어 최댓값 + 1 사용
2. slug는 `$ARGUMENTS` 그대로 사용 (소문자, 하이픈 연결 확인)
3. 파일명: `slug.md`
4. `src/content/projects/` 에 아래 형식으로 생성합니다:

```markdown
---
title: "프로젝트 이름"
description: ""
tags: []
order: N
# github: "https://github.com/..."
# demo: "https://..."
---

<!-- 프로젝트 소개를 여기에 작성하세요 -->
```

## 주의사항

- `github`, `demo` 필드는 있을 때만 주석 해제
- `description` 은 1~2문장, 목록 카드에 그대로 표시됨
- 생성 후 파일 경로와 현재 `order` 순서를 알려줍니다.
