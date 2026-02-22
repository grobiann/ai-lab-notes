# CLAUDE.md — AI Lab Notes 프로젝트 가이드

이 파일은 Claude가 이 프로젝트를 매번 처음부터 파악하지 않아도 되도록
설계 의도, 구조, 규칙, 기술 세부사항을 정리한 문서입니다.
**작업을 마칠 때마다 변경사항이 생기면 이 파일도 함께 최신화한다.**

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 이름 | ai-lab-notes |
| 목적 | grobiann의 AI·개발 학습 블로그 + 포트폴리오 사이트 |
| URL | https://grobiann.github.io/ai-lab-notes |
| 저장소 | https://github.com/grobiann/ai-lab-notes |
| 배포 방식 | GitHub Pages (`docs/` 폴더, `main` 브랜치) |

---

## 2. 기술 스택

| 역할 | 기술 | 버전 |
|------|------|------|
| 프레임워크 | Astro | ^4.16.0 |
| 스타일링 | Tailwind CSS | ^3.4.0 |
| 산문 타이포그래피 | @tailwindcss/typography | ^0.5.19 |
| MDX 지원 | @astrojs/mdx | ^3.1.0 |
| 사이트맵 | @astrojs/sitemap | ^3.2.0 |
| CMS (선택적) | Sveltia CMS | CDN (`/admin/`) |
| 코드 하이라이터 | Shiki (Astro 내장) | theme: github-light |
| 패키지 매니저 | npm | (package-lock.json 사용) |
| Node.js | 20 | (GitHub Actions 기준) |

---

## 3. 디렉터리 구조

```
ai-lab-notes/
├── src/
│   ├── content/
│   │   ├── config.ts          ← 콘텐츠 컬렉션 스키마 정의
│   │   ├── blog/              ← 블로그 글 (.md 파일)
│   │   └── projects/          ← 프로젝트 소개 (.md 파일)
│   ├── layouts/
│   │   ├── BaseLayout.astro   ← 전체 공통 틀 (nav, footer, SEO)
│   │   ├── BlogLayout.astro   ← 블로그 글 상세 페이지 틀
│   │   └── ProjectLayout.astro← 프로젝트 상세 페이지 틀
│   ├── pages/
│   │   ├── index.astro        → /          (메인: 최근글 + 프로젝트)
│   │   ├── about.astro        → /about/
│   │   ├── blog/
│   │   │   ├── index.astro    → /blog/     (연도별 글 목록)
│   │   │   └── [slug].astro   → /blog/:slug/ (글 상세)
│   │   └── projects/
│   │       ├── index.astro    → /projects/ (그리드 목록)
│   │       └── [slug].astro   → /projects/:slug/ (프로젝트 상세)
│   └── env.d.ts               ← Astro 타입 참조
├── public/
│   ├── favicon.svg
│   ├── .nojekyll              ← GitHub Pages Jekyll 비활성화
│   └── admin/
│       ├── index.html         ← Sveltia CMS 진입점
│       └── config.yml         ← CMS 컬렉션 설정
├── docs/                      ← 빌드 결과물 (자동 생성, git 추적)
├── .github/workflows/
│   └── deploy.yml             ← 자동 빌드·배포 워크플로우
├── astro.config.mjs
├── tailwind.config.mjs
└── package.json
```

---

## 4. 주요 설정값

### astro.config.mjs
```js
site:   'https://grobiann.github.io'
base:   '/ai-lab-notes'       // 모든 링크에 BASE_URL 접두사 필요
outDir: 'docs'                // GitHub Pages용 출력 디렉터리
```

> **주의**: 내부 링크는 반드시 `import.meta.env.BASE_URL`(= `/ai-lab-notes`) 을
> 앞에 붙여야 한다. 빠뜨리면 GitHub Pages에서 링크가 깨짐.
> 예) `href={`${BASE}/blog/`}` — 모든 페이지가 이 패턴을 사용함.

### Tailwind 커스텀 색상 (tailwind.config.mjs)
| 토큰 | 색상 | 용도 |
|------|------|------|
| `cream-50~500` | `#fdf9f4` ~ `#d4b896` | 배경, 구분선 |
| `amber.warm` | `#c07a2f` | 포인트 컬러 (링크, 태그, 강조) |
| `amber.light` | `#e8a84e` | 호버 등 밝은 포인트 |
| `amber.pale` | `#fdf3e3` | 태그 배경 등 연한 포인트 |
| `ink.DEFAULT` | `#2c2416` | 기본 텍스트 |
| `ink.light` | `#7a6a52` | 보조 텍스트 |
| `ink.muted` | `#b0977a` | 희미한 텍스트 (날짜, 메타) |

페이지 배경: `bg-[#faf8f5]` (크림색)
폰트: serif = Georgia, sans = Helvetica Neue
prose: `prose-warm` 커스텀 variant 사용 (BlogLayout, ProjectLayout)

---

## 5. 콘텐츠 스키마

### blog (`src/content/blog/*.md`)
```ts
title:       string           // 필수
description: string           // 필수 (목록 카드, meta description 사용)
pubDate:     Date             // 필수 (정렬 기준)
updatedDate: Date (optional)
tags:        string[]         // 기본값 []
draft:       boolean          // 기본값 false — true 이면 빌드에서 제외
```

파일명 규칙: `YYYY-MM-DD-slug-name.md`
예) `2026-01-28-postgresql-index.md`

### projects (`src/content/projects/*.md`)
```ts
title:       string           // 필수
description: string           // 필수
tags:        string[]         // 기본값 []
github:      string (url, optional)
demo:        string (url, optional)
order:       number           // 기본값 99 — 낮을수록 먼저 표시
```

---

## 6. 페이지별 동작

| 페이지 | 특이사항 |
|--------|----------|
| `index.astro` | 최근 블로그 글 4개 + 프로젝트 4개 표시, draft 제외 |
| `blog/index.astro` | 연도별 그룹핑, 날짜 내림차순, draft 제외 |
| `blog/[slug].astro` | `getStaticPaths`로 정적 생성, draft 제외 |
| `projects/index.astro` | `order` 오름차순 정렬 (draft 필드 없음) |
| `projects/[slug].astro` | github/demo 링크 조건부 렌더링 |
| `about.astro` | 정적 페이지, techStack 배열은 파일 내에 하드코딩 |

---

## 7. 자동 배포 워크플로우

트리거: `main` 브랜치에 push (단, `docs/**` 변경은 제외)

```
push to main
  → npm ci
  → npm run build  (→ docs/ 생성)
  → git add docs/ && git commit && git push
```

`docs/` 폴더가 git에 추적되며, GitHub Pages는 이 폴더를 서빙.
빌드 커밋 메시지: `chore: build site [skip ci]` (재귀 트리거 방지)

---

## 8. Sveltia CMS (`/admin/`)

- 접근: `https://grobiann.github.io/ai-lab-notes/admin/`
- 로그인: GitHub Personal Access Token (PAT) 방식
- 편집 가능 컬렉션: `blog`, `projects`
- 이미지 저장 경로: `public/images/blog/`
- 슬러그 형식: blog → `YYYY-MM-DD-slug`, projects → `slug`

> CMS를 통해 글을 저장하면 GitHub에 직접 커밋되어 Actions 빌드가 자동 트리거됨.

---

## 9. 로컬 개발 명령어

```bash
npm install        # 의존성 설치
npm run dev        # 개발 서버 (http://localhost:4321)
npm run build      # 프로덕션 빌드 → docs/
npm run preview    # 빌드 결과 로컬 미리보기
```

---

## 10. 작업 규칙 (항상 유지)

1. **BASE_URL 필수**: 내부 링크는 항상 `${BASE}/경로/` 형태로 작성.
2. **draft 필터**: blog 컬렉션 조회 시 `({ data }) => !data.draft` 필터 항상 적용.
3. **docs/ 직접 수정 금지**: 빌드 결과물이므로 `npm run build`로만 갱신.
4. **브랜치 전략**: 개발은 `claude/...` 브랜치에서 진행 후 `main`에 머지. 배포는 `main` 기준.
5. **package-lock.json 유지**: CI에서 `npm ci` 사용 중이므로 lock 파일 삭제 금지.
6. **tailwind 클래스 일관성**: 새 UI 요소 추가 시 위 색상 토큰 표를 참고해 기존 디자인 언어 유지.
7. **trailing slash**: Astro static 빌드 특성상 내부 링크 끝에 `/` 붙임 (예: `/blog/`).

---

## 11. 자주 하는 작업

### 블로그 글 추가
1. `src/content/blog/YYYY-MM-DD-slug.md` 파일 생성
2. frontmatter 작성 (title, description, pubDate, tags 필수)
3. 본문 Markdown으로 작성
4. `main`에 push → 자동 배포

### 프로젝트 추가
1. `src/content/projects/slug.md` 파일 생성
2. frontmatter 작성 (title, description, tags, order 필수)
3. `order` 값으로 목록 순서 제어 (낮을수록 앞)

### 네비게이션 링크 변경
`src/layouts/BaseLayout.astro`의 `navLinks` 배열 수정.

### About 페이지 기술스택 변경
`src/pages/about.astro`의 `techStack` 배열 수정.

---

## 12. 변경 이력 (주요 아키텍처 결정)

| 날짜 | 변경 내용 |
|------|-----------|
| 2026-02 초 | 프로젝트 생성, Astro + Tailwind 기반 블로그 구축 |
| 2026-02 | Decap CMS → Sveltia CMS 교체 (GitHub PAT 로그인 지원) |
| 2026-02 | 배포 브랜치를 `main` 단일 브랜치로 통합, 구 브랜치 제거 |
| 2026-02-22 | CLAUDE.md 최초 작성 |
