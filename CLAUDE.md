# AI Lab Notes — Claude 작업 지침

grobiann의 AI·개발 학습 블로그 + 포트폴리오 사이트.
Astro + Tailwind CSS로 빌드, GitHub Pages(`docs/` 폴더)로 배포.

- 저장소: https://github.com/grobiann/ai-lab-notes
- 배포 URL: https://grobiann.github.io/ai-lab-notes

**작업 완료 시 변경사항이 생기면 관련 CLAUDE 파일도 함께 최신화한다.**

---

## 주요 명령어

```bash
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
public/admin/              # Sveltia CMS
docs/                      # 빌드 결과물 — 직접 수정 금지
```

---

## 핵심 설정

- **base**: `/ai-lab-notes` — 모든 내부 링크에 접두사 필요
- **outDir**: `docs/` — GitHub Pages 서빙 경로
- **배포 트리거**: `main` 브랜치 push → GitHub Actions 자동 빌드

---

## 세부 규칙

@.claude/rules/content.md
@.claude/rules/design.md
@.claude/rules/deployment.md

---

## 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-02 초 | 프로젝트 생성, Astro + Tailwind 기반 구축 |
| 2026-02 | Decap CMS → Sveltia CMS 교체 (GitHub PAT 로그인) |
| 2026-02 | 배포 브랜치를 `main` 단일 브랜치로 통합 |
| 2026-02-22 | CLAUDE.md 작성, rules 분리 구조로 전환 |
