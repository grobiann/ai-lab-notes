# 배포 및 Git 규칙

## 배포 흐름

```
main 브랜치 push
  → GitHub Actions (deploy.yml)
  → npm ci && npm run build
  → docs/ 커밋 (chore: build site [skip ci])
  → GitHub Pages 서빙
```

- `docs/` 폴더는 git에서 추적 중 — 빌드 결과물이므로 직접 수정 금지
- `paths-ignore: docs/**` 설정으로 빌드 커밋이 재귀 트리거되지 않음

## Astro 링크 규칙

- 내부 링크는 항상 `${import.meta.env.BASE_URL}/경로/` 형태로 작성
- trailing slash 필수: `/blog/`, `/projects/`, `/about/`
- `BASE_URL` 누락 시 GitHub Pages에서 404 발생

## Git 브랜치 전략

- **작업 브랜치: `main` 단일 브랜치** — 모든 개발·수정은 main에서 직접 진행
- 별도 feature 브랜치 없이 main에 직접 커밋·푸시
- `package-lock.json` 삭제 금지 — CI에서 `npm ci` 사용 중

> **주의 (Claude Code 환경 제약)**: Claude Code 세션은 보안상 `main`에 직접 push 불가.
> Claude가 작업한 결과는 `claude/...` 브랜치로 올라가며, 사용자가 직접 main에 머지해야 함.

## Sveltia CMS

- 접근: `https://grobiann.github.io/ai-lab-notes/admin/`
- 로그인: GitHub Personal Access Token (PAT) 방식
- CMS로 저장 → GitHub 직접 커밋 → Actions 자동 빌드 트리거
- 이미지 저장 경로: `public/images/blog/`
