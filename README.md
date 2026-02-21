# AI Lab Notes

개인 블로그 & 포트폴리오 사이트.

**URL**: https://grobiann.github.io/ai-lab-notes/

## Stack

- [Astro](https://astro.build) — 정적 사이트 빌드
- [Tailwind CSS](https://tailwindcss.com) — 스타일링
- [GitHub Actions](https://github.com/features/actions) — 자동 배포
- [GitHub Pages](https://pages.github.com) — 호스팅

## GitHub Pages 최초 설정 (1회만)

> PR 머지 전, 아래 설정을 먼저 해두면 머지 즉시 자동 배포됩니다.

1. 이 레포 → **Settings** → **Pages**
2. **Source** 항목을 `GitHub Actions` 으로 변경
3. 저장

이후 `main` 브랜치에 커밋이 푸시될 때마다 자동으로 빌드 & 배포됩니다.

## 로컬 개발

```bash
npm install
npm run dev        # http://localhost:4321/ai-lab-notes/
npm run build      # 빌드 결과 확인
```

## 글 작성

`src/content/blog/` 에 Markdown 파일 추가:

```
src/content/blog/YYYY-MM-DD-slug.md
```

```markdown
---
title: "글 제목"
description: "요약"
pubDate: 2026-03-01
tags: ["Python", "AI"]
---

본문 내용...
```

`main` 브랜치에 push하면 자동으로 반영됩니다.

## 프로젝트 추가

`src/content/projects/` 에 Markdown 파일 추가:

```markdown
---
title: "프로젝트 이름"
description: "설명"
tags: ["TypeScript"]
github: "https://github.com/grobiann/..."
order: 3
---
```
