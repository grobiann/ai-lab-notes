# AI Lab Notes — Claude 작업 지침

grobiann의 AI·개발 학습 블로그 + 포트폴리오 사이트.
Astro + Tailwind CSS로 빌드, GitHub Pages(`docs/` 폴더)로 배포.

**이 파일은 작업 완료 시 변경사항이 생기면 함께 최신화한다.**

---

## 주요 명령어

```bash
npm install        # 의존성 설치
npm run dev        # 개발 서버 (http://localhost:4321)
npm run build      # 프로덕션 빌드 → docs/
npm run preview    # 빌드 결과 로컬 미리보기
```

---

## 프로젝트 구조

```
src/
├── content/
│   ├── config.ts          # 콘텐츠 컬렉션 스키마 (blog, projects)
│   ├── blog/              # 블로그 글 (.md)
│   └── projects/          # 프로젝트 소개 (.md)
├── layouts/
│   ├── BaseLayout.astro   # nav, footer, SEO 공통 틀
│   ├── BlogLayout.astro   # 블로그 글 상세
│   └── ProjectLayout.astro
└── pages/
    ├── index.astro         → /
    ├── about.astro         → /about/
    ├── blog/index.astro    → /blog/
    ├── blog/[slug].astro   → /blog/:slug/
    ├── projects/index.astro → /projects/
    └── projects/[slug].astro → /projects/:slug/
public/
└── admin/                 # Sveltia CMS (config.yml, index.html)
docs/                      # 빌드 결과물 — 직접 수정 금지
.github/workflows/
└── deploy.yml             # main push → 자동 빌드·배포
```

---

## 핵심 설정

- **site**: `https://grobiann.github.io`
- **base**: `/ai-lab-notes` — 모든 내부 링크에 접두사 필요
- **outDir**: `docs/` — GitHub Pages 서빙 경로

---

## 콘텐츠 스키마

### blog (`src/content/blog/YYYY-MM-DD-slug.md`)
- `title`: string (필수)
- `description`: string (필수, 목록 카드·meta에 사용)
- `pubDate`: Date (필수, 정렬 기준)
- `updatedDate`: Date (선택)
- `tags`: string[] (기본값 `[]`)
- `draft`: boolean (기본값 `false` — `true`이면 빌드 제외)

### projects (`src/content/projects/slug.md`)
- `title`: string (필수)
- `description`: string (필수)
- `tags`: string[] (기본값 `[]`)
- `github`: url (선택)
- `demo`: url (선택)
- `order`: number (기본값 `99` — 낮을수록 목록 앞에 표시)

---

## 반드시 지켜야 할 규칙

- **내부 링크**는 항상 `${import.meta.env.BASE_URL}/경로/` 형태로 작성 — 빠뜨리면 GitHub Pages에서 404
- **blog 조회** 시 `({ data }) => !data.draft` 필터를 항상 적용
- **trailing slash** 유지 — 내부 링크 끝에 `/` 붙임 (예: `/blog/`)
- **`docs/` 직접 수정 금지** — `npm run build`로만 갱신
- **`package-lock.json` 삭제 금지** — CI에서 `npm ci` 사용 중
- **브랜치 전략**: 개발은 `claude/...` 브랜치 → `main` 머지 후 자동 배포

---

## 디자인 시스템

### 색상 토큰
| 토큰 | 값 | 용도 |
|------|-----|------|
| `amber.warm` | `#c07a2f` | 포인트 컬러 (링크, 태그, 강조) |
| `amber.light` | `#e8a84e` | 호버 |
| `amber.pale` | `#fdf3e3` | 태그 배경 |
| `ink.DEFAULT` | `#2c2416` | 기본 텍스트 |
| `ink.light` | `#7a6a52` | 보조 텍스트 |
| `ink.muted` | `#b0977a` | 날짜·메타 |
| `cream-100~500` | `#faf5ec`~`#d4b896` | 배경·구분선 |
- 페이지 배경: `bg-[#faf8f5]`
- 폰트: serif = Georgia, sans = Helvetica Neue
- 본문 prose: `prose-warm` (BlogLayout, ProjectLayout에서 사용)

### 새 UI 요소 추가 시
- 위 색상 토큰을 기반으로 작성 — 임의의 hex 직접 사용 지양
- 카드 스타일: `bg-white border border-[#e8ddd0] hover:border-[#d4b896] rounded-xl`

---

## 자주 하는 작업

### 블로그 글 추가
1. `src/content/blog/YYYY-MM-DD-slug.md` 생성
2. frontmatter: `title`, `description`, `pubDate`, `tags` 필수 작성
3. push → 자동 배포

### 프로젝트 추가
1. `src/content/projects/slug.md` 생성
2. frontmatter: `title`, `description`, `tags`, `order` 필수 작성

### 네비게이션 변경
- `src/layouts/BaseLayout.astro`의 `navLinks` 배열 수정

### About 기술스택 변경
- `src/pages/about.astro`의 `techStack` 배열 수정

---

## 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-02 초 | 프로젝트 생성, Astro + Tailwind 기반 구축 |
| 2026-02 | Decap CMS → Sveltia CMS 교체 (GitHub PAT 로그인) |
| 2026-02 | 배포 브랜치를 `main` 단일 브랜치로 통합 |
| 2026-02-22 | CLAUDE.md 작성 (공식 권장 형식 기반) |
