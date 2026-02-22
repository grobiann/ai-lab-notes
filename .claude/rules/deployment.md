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

- 개발: `claude/...` 브랜치에서 작업
- 배포: `main` 브랜치 기준 (push 시 자동 빌드)
- `package-lock.json` 삭제 금지 — CI에서 `npm ci` 사용 중

## Sveltia CMS

- 접근: `https://grobiann.github.io/ai-lab-notes/admin/`
- 로그인: GitHub Personal Access Token (PAT) 방식
- CMS로 저장 → GitHub 직접 커밋 → Actions 자동 빌드 트리거
- 이미지 저장 경로: `public/images/blog/`
