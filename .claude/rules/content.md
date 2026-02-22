# 콘텐츠 작성 규칙

## 콘텐츠 스키마

### blog (`src/content/blog/`)
- 파일명: `YYYY-MM-DD-slug.md` 형식 준수 (예: `2026-01-28-postgresql-index.md`)
- 필수 frontmatter: `title`, `description`, `pubDate`, `tags`
- 선택 frontmatter: `updatedDate`, `draft`
- `draft: true`이면 빌드에서 제외 — 글 조회 시 항상 `({ data }) => !data.draft` 필터 적용
- `description`은 목록 카드와 meta description에 그대로 사용되므로 1~2문장으로 구체적으로 작성

### projects (`src/content/projects/`)
- 파일명: `slug.md` (날짜 없음)
- 필수 frontmatter: `title`, `description`, `tags`, `order`
- 선택 frontmatter: `github` (url), `demo` (url)
- `order` 숫자가 낮을수록 목록 앞에 표시 — 신규 추가 시 기존 순서 확인 후 결정

## 자주 하는 작업

### 블로그 글 추가
1. `src/content/blog/YYYY-MM-DD-slug.md` 생성
2. frontmatter 작성 (`title`, `description`, `pubDate`, `tags` 필수)
3. 본문 Markdown 작성
4. `main`에 push → 자동 배포

### 프로젝트 추가
1. `src/content/projects/slug.md` 생성
2. frontmatter 작성 (`title`, `description`, `tags`, `order` 필수)

### 네비게이션 링크 변경
- `src/layouts/BaseLayout.astro`의 `navLinks` 배열 수정

### About 기술스택 변경
- `src/pages/about.astro`의 `techStack` 배열 수정
