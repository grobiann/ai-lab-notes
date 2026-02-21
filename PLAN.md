# 개인 블로그 & 포트폴리오 사이트 계획서

## 1. 목표 정리

- 기술 블로그: 개발/학습 내용 기록
- 포트폴리오: 프로젝트 소개, 이력서 제출 시 링크로 첨부 가능
- GitHub Pages 무료 호스팅, 외부 공개

---

## 2. 기술 스택 추천: **Astro**

### 왜 Astro인가?

| 항목 | Astro | Next.js | Jekyll |
|------|-------|---------|--------|
| 빌드 속도 | 매우 빠름 | 보통 | 보통 |
| 콘텐츠 중심 사이트 적합도 | ★★★★★ | ★★★★☆ | ★★★★☆ |
| GitHub Pages 지원 | 공식 지원 | 추가 설정 필요 | 네이티브 지원 |
| 번들 크기 (성능) | 최소 JS | React 번들 포함 | 없음 |
| React/Vue 컴포넌트 사용 | 가능 | React 전용 | 불가 |
| Markdown/MDX 지원 | 기본 내장 | 별도 설치 | 기본 내장 |
| TypeScript | 완벽 지원 | 완벽 지원 | 미지원 |

Astro는 블로그 + 포트폴리오 조합에 최적화되어 있으며,
**빌드 시 정적 HTML로 변환**되어 GitHub Pages에서 완벽하게 동작합니다.

### 함께 사용할 도구

- **Tailwind CSS**: 유틸리티 기반 스타일링, 빠른 개발
- **MDX**: Markdown 안에서 React 컴포넌트 삽입 가능
- **GitHub Actions**: 자동 빌드 & 배포 파이프라인

---

## 3. DB가 필요한가?

**결론: 별도 DB 불필요**

GitHub Pages는 정적 파일만 제공합니다. 대신 아래처럼 처리합니다:

| 기능 | DB 대신 사용하는 방법 |
|------|----------------------|
| 블로그 포스트 | Markdown/MDX 파일 (`src/content/blog/`) |
| 포트폴리오 항목 | JSON 또는 Markdown 파일 (`src/content/projects/`) |
| 댓글 기능 (선택) | **Giscus** - GitHub Discussions 기반, 무료 |
| 방문자 통계 (선택) | Google Analytics 또는 Plausible |
| 연락처 폼 (선택) | Formspree (무료 50회/월) 또는 GitHub Issues 링크 |

---

## 4. 사이트 구조

```
/                   ← 홈 (소개 + 최근 포스트 + 주요 프로젝트)
/blog               ← 블로그 목록
/blog/[slug]        ← 개별 포스트
/projects           ← 포트폴리오/프로젝트 목록
/projects/[slug]    ← 프로젝트 상세
/about              ← 자기소개 + 기술 스택 + 경력 (이력서 대용)
/resume             ← PDF 이력서 다운로드 링크 (선택)
```

---

## 5. 레포지토리 구조 (파일 트리)

```
my-blog/
├── .github/
│   └── workflows/
│       └── deploy.yml          ← GitHub Actions 자동 배포
├── public/
│   ├── favicon.svg
│   └── images/                 ← 정적 이미지
├── src/
│   ├── components/
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── PostCard.astro
│   │   └── ProjectCard.astro
│   ├── content/
│   │   ├── blog/               ← Markdown 블로그 포스트
│   │   │   └── 2024-01-first-post.md
│   │   └── projects/           ← 프로젝트 설명 파일
│   │       └── my-project.md
│   ├── layouts/
│   │   ├── BaseLayout.astro
│   │   ├── BlogLayout.astro
│   │   └── ProjectLayout.astro
│   └── pages/
│       ├── index.astro
│       ├── blog/
│       │   ├── index.astro
│       │   └── [slug].astro
│       ├── projects/
│       │   ├── index.astro
│       │   └── [slug].astro
│       └── about.astro
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
└── package.json
```

---

## 6. 배포 방식: GitHub Pages + GitHub Actions

```
코드 push (main 브랜치)
    ↓
GitHub Actions 실행
    ↓
npm run build (Astro → 정적 HTML/CSS/JS 생성)
    ↓
gh-pages 브랜치 또는 GitHub Pages 디렉토리에 배포
    ↓
https://{username}.github.io/{repo-name}/ 로 접속 가능
```

**커스텀 도메인** (선택 사항): 본인 도메인이 있다면 `CNAME` 설정으로 연결 가능.
예: `https://yourname.dev`

---

## 7. 포트폴리오 이력서 활용 전략

- `/about` 페이지에 기술 스택, 경력, 프로젝트 요약 작성
- 프로젝트마다 GitHub 링크, 데모 링크, 기술 설명 포함
- 이력서 PDF에 `https://{username}.github.io/{repo}/` URL 기재
- `/projects` 페이지에서 각 프로젝트의 성과/기술적 도전 상세 서술

---

## 8. 구현 단계 (순서)

### Phase 1: 기본 세팅
1. Astro 프로젝트 초기화
2. Tailwind CSS 연동
3. GitHub Actions 배포 워크플로우 작성
4. GitHub Pages 설정

### Phase 2: 핵심 페이지 개발
5. 기본 레이아웃 (Header, Footer)
6. 홈 페이지
7. 블로그 목록 + 개별 포스트 페이지
8. 프로젝트 포트폴리오 페이지
9. About 페이지

### Phase 3: 콘텐츠 & 마무리
10. 샘플 블로그 포스트 작성
11. 샘플 프로젝트 항목 작성
12. SEO 메타태그, Open Graph 설정
13. 반응형 디자인 최적화

### Phase 4: 선택 기능 (나중에)
- Giscus 댓글 연동
- 검색 기능 (Pagefind - 정적 검색)
- RSS 피드 자동 생성 (Astro 기본 지원)
- Dark mode

---

## 9. 비용

| 항목 | 비용 |
|------|------|
| GitHub Pages 호스팅 | **무료** |
| GitHub Actions (public repo) | **무료** |
| Giscus 댓글 | **무료** |
| 도메인 (선택) | 연 ~$10-15 |

DB, 서버, 별도 호스팅 없이 **완전 무료** 운영 가능.

---

## 10. 다음 단계

이 계획서를 바탕으로 실제 구현을 시작하려면:

1. **이 레포를 그대로 사용할지, 새 레포를 만들지** 결정
2. **GitHub 유저명** 확인 (GitHub Pages URL에 영향)
3. **사이트 이름/테마 색상 취향** 공유 (밝은/어두운 톤 등)
4. **커스텀 도메인** 보유 여부

준비되면 Phase 1부터 바로 코드 작성을 시작할 수 있습니다.
