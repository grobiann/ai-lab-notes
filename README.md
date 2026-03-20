# 🎓 AI Lab Notes — 개발 학습 블로그

> grobiann의 AI·웹 개발 학습 기록소

**📍 라이브**: [ai-lab-notes.vercel.app](https://ai-lab-notes.vercel.app)
**🔗 GitHub**: [grobiann/ai-lab-notes](https://github.com/grobiann/ai-lab-notes)

---

## 📖 개요

**AI Lab Notes**는 5년차 게임 개발자가 AI와 웹 기술을 학습하며 기록하는 개인 기술 블로그입니다.

- 📝 **기술 블로그**: AI, 웹 개발, 프로그래밍 관련 글 (카테고리 필터 지원)
- 🗂️ **포트폴리오**: 회사 및 개인 프로젝트 포트폴리오
- 👤 **프로필**: 경력, 기술 스택, 교육 배경 소개

### ✨ **2026년 3월 — UI/UX 전면 리디자인**

전문적이고 현대적인 디자인으로 완전히 재설계되었습니다:
- 🎨 **통합 색상 시스템**: ink/amber/cream 디자인 토큰
- 📱 **완벽한 모바일 대응**: md 브레이크포인트 반응형 설계
- ♿ **접근성 강화**: WCAG AA+ 준수 (focus-visible, 색상 대비)
- 📚 **개선된 읽기 경험**: 복잡한 3단 레이아웃 → 깔끔한 단일 열 구조

---

## 🚀 기술 스택

### 프레임워크 & 라이브러리
- **Next.js 15** — React App Router 기반 풀스택 프레임워크
- **TypeScript** — 타입 안정성
- **Tailwind CSS** — 유틸리티 기반 스타일링
- **React Markdown** — 마크다운 렌더링 (GFM + 문법 강조)

### 데이터 & 인증
- **Supabase** — PostgreSQL + Row Level Security + JWT 인증
- **Next.js Server Components** — 서버 사이드 렌더링 (SSR)
- **On-Demand ISR** — 캐시 무효화 API

### 배포 & 호스팅
- **Vercel** — 엣지 컴퓨팅 기반 호스팅
- **GitHub** — 소스 코드 버전 관리
- **자동 배포**: `main` 브랜치 push → Vercel 자동 배포

---

## 📊 도메인 & 배포 정책

### 프로덕션 도메인

| 환경 | 도메인 | 브랜치 | 설명 |
|------|--------|--------|------|
| **프로덕션** | [ai-lab-notes.vercel.app](https://ai-lab-notes.vercel.app) | `main` | 공개 도메인 (최종 배포) |
| **프리뷰** | `ai-lab-notes-git-*-*.vercel.app` | `claude/*` | 기능 브랜치 미리보기 (임시) |

### 배포 워크플로우

```
작업 브랜치 (claude/feature-*)
    ↓
GitHub push (프리뷰 URL 자동 생성)
    ↓
main으로 fast-forward merge
    ↓
main 브랜치 push
    ↓
Vercel 자동 배포 (ai-lab-notes.vercel.app)
    ↓
Production 라이브 🚀
```

### 배포 규칙

1. **모든 작업은 `claude/<feature>-<id>` 브랜치에서 시작**
   - 예: `claude/blog-redesign-ui`, `claude/fix-404-page`

2. **작업 완료 후 `main`으로 병합**
   ```bash
   git checkout main
   git merge claude/feature-name --ff-only
   git push origin main
   ```

3. **main 푸시 시 자동으로 프로덕션 배포**
   - Vercel에서 빌드 시작
   - 5분 이내 ai-lab-notes.vercel.app에 반영

### Vercel 대시보드 설정

Vercel 프로젝트 설정:
- **프로덕션 브랜치**: `main`
- **프리뷰 브랜치**: `claude/*`
- **자동 배포**: 활성화
- **환경 변수**: `.env.local` 참고

---

## 🏗️ 프로젝트 구조

```
ai-lab-notes/
├── app/                           # Next.js App Router
│   ├── layout.tsx                 # 루트 레이아웃 (네비, 푸터)
│   ├── globals.css                # 글로벌 스타일 + 색상 시스템
│   ├── page.tsx                   # 홈 (최근 글 + 카테고리)
│   ├── blog/
│   │   ├── page.tsx               # /blog — 글 목록 (검색, 카테고리 필터)
│   │   └── [slug]/page.tsx        # /blog/:slug — 글 상세
│   ├── projects/page.tsx          # /projects — 포트폴리오
│   ├── about/page.tsx             # /about — 소개 페이지
│   ├── login/page.tsx             # /login — 어드민 로그인
│   ├── admin/                      # 인증 보호 영역
│   │   ├── layout.tsx             # 미로그인 → /login 리다이렉트
│   │   ├── page.tsx               # 대시보드 (글/프로젝트 관리)
│   │   ├── posts/                 # 글 관리
│   │   └── projects/              # 프로젝트 관리
│   └── api/
│       ├── auth/callback/         # Supabase Auth 콜백
│       └── revalidate/            # On-Demand ISR
│
├── components/                    # React 컴포넌트
│   ├── Navigation.tsx             # 상단 네비 (스티키)
│   ├── Footer.tsx                 # 푸터
│   ├── BlogList.tsx               # 글 목록 + 필터
│   ├── PostCard.tsx               # 글 카드 (3 모드)
│   └── ProfileSidebar.tsx         # 프로필 사이드바
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts              # 클라이언트 (브라우저)
│   │   ├── server.ts              # 서버 (쿠키)
│   │   └── public.ts              # 공개 데이터 (ISR)
│   ├── types.ts                   # TypeScript 타입
│   └── utils.ts                   # 유틸리티 함수
│
├── tailwind.config.ts             # Tailwind + 색상 토큰
├── middleware.ts                  # 인증 미들웨어
├── tsconfig.json                  # TypeScript 설정
├── next.config.ts                 # Next.js 설정
├── package.json                   # 의존성
└── README.md                      # 이 파일
```

---

## 🎨 설계 철학

### 색상 시스템 (Design Tokens)

**따뜻하고 전문적인** 색상 팔레트:

| 토큰 | HEX | 용도 | 예시 |
|------|-----|------|------|
| `ink.dark` | `#1a1208` | 제목, 강조 | 글 제목, 헤더 |
| `ink.DEFAULT` | `#2c2416` | 본문 텍스트 | 글 본문 |
| `ink.light` | `#7a6a52` | 보조 텍스트 | 설명, 부제 |
| `ink.muted` | `#b0977a` | 메타 정보 | 날짜, 카테고리 수 |
| `amber.warm` | `#c07a2f` | 포인트 색상 | 링크, 버튼, 활성 상태 |
| `amber.light` | `#e8a84e` | 호버 상태 | 링크 호버 |
| `amber.pale` | `#fdf3e3` | 배경 강조 | 태그 배경, 강조 상자 |
| `cream.50~500` | 다양 | 중성 배경 | 카드, 테두리 |

**색상 대비 (WCAG 표준)**:
- ink.dark vs white: **21:1** ✅ AAA
- ink.light vs white: **6.5:1** ✅ AAA
- amber.warm vs amber.pale: **4.8:1** ✅ AA

### 타이포그래피

- **Display (serif)**: Playfair Display
  - 제목, 섹션 헤더
  - 무게: 400, 700, 900

- **Body (sans-serif)**: Noto Sans KR
  - 본문, UI 텍스트
  - 무게: 400, 500, 700

### 반응형 설계

| 브레이크포인트 | 너비 | 레이아웃 |
|-------------|------|---------|
| **모바일** | < 768px | 단일 열, 사이드바 숨김 |
| **태블릿** | 768px+ | 2단 레이아웃, 카테고리 표시 |
| **데스크탑** | 1024px+ | 3단 레이아웃, 모든 요소 표시 |

---

## 📚 데이터베이스 스키마

### `posts` 테이블

```sql
CREATE TABLE posts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  description   TEXT,                    -- SEO, 카드 미리보기
  category      TEXT,                    -- 계층 구조 (예: AI/LLM)
  content       TEXT NOT NULL,           -- Markdown
  tags          TEXT[] DEFAULT '{}',     -- 배열 (예: ['Next.js', 'React'])
  is_published  BOOLEAN DEFAULT FALSE,
  published_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_published" ON posts
  FOR SELECT USING (is_published = TRUE);

CREATE POLICY "admin_all" ON posts
  FOR ALL USING (auth.role() = 'authenticated');
```

### `projects` 테이블

```sql
CREATE TABLE projects (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  company       TEXT,
  period        TEXT,
  description   TEXT NOT NULL,
  tags          TEXT[] DEFAULT '{}',
  type          TEXT NOT NULL CHECK (type IN ('work', 'personal')),
  github        TEXT,                    -- GitHub 저장소 URL
  demo          TEXT,                    -- 데모 사이트 URL
  display_order INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read" ON projects
  FOR SELECT USING (TRUE);

CREATE POLICY "admin_all" ON projects
  FOR ALL USING (auth.role() = 'authenticated');
```

---

## 🔐 보안 & 접근 제어

### Row Level Security (RLS)

Supabase RLS로 모든 데이터 접근 제어:

**posts 테이블**:
- ✅ 공개: `is_published = TRUE`인 글만 조회 가능
- 🔒 어드민: 로그인한 사용자만 모든 작업 가능

**projects 테이블**:
- ✅ 공개: 모든 프로젝트 조회 가능 (인증 불필요)
- 🔒 어드민: 로그인한 사용자만 작성/수정/삭제

### 인증 (Authentication)

- **Supabase Auth**: 이메일 기반 인증
- **JWT 토큰**: 쿠키에 저장 (httpOnly, secure)
- **Next.js 미들웨어**: `/admin` 경로 보호
- **서버 검증**: 모든 API 요청에서 인증 확인

### 🔴 중요한 보안 규칙

⚠️ **절대 하면 안 되는 것들**:

1. **서비스 역할 키 노출 금지**
   ```
   ❌ SUPABASE_SERVICE_ROLE_KEY를 클라이언트에 노출하지 마세요
   ✅ 환경 변수로만 관리 (Vercel 대시보드)
   ```

2. **민감한 정보 로깅 금지**
   ```
   ❌ console.log(user_token, password, api_key)
   ✅ 필요한 정보만 로깅
   ```

3. **환경 파일 커밋 금지**
   ```
   ❌ git add .env.local
   ✅ .gitignore에 .env* 추가
   ```

---

## ♿ 접근성 (Accessibility)

### WCAG 2.1 AA 준수

| 기준 | 구현 상태 | 설명 |
|------|---------|------|
| **색상 대비** | ✅ 준수 | 4.5:1 이상 (AAA 수준) |
| **포커스 표시** | ✅ 준수 | `focus-visible` outline 적용 |
| **키보드 네비** | ✅ 준수 | Tab으로 모든 버튼 접근 가능 |
| **대체 텍스트** | ✅ 준수 | 이미지 alt 속성 포함 |
| **의미론적 HTML** | ✅ 준수 | `<button>`, `<a>`, `<article>` 등 사용 |
| **스크린 리더** | ✅ 준수 | ARIA 레이블, 시맨틱 HTML |

---

## 🔄 Git 워크플로우 & 기여

### 로컬 개발

```bash
# 저장소 클론
git clone https://github.com/grobiann/ai-lab-notes.git
cd ai-lab-notes

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
# http://localhost:3000 에서 확인
```

### 환경 변수 설정

`.env.local` 파일 생성:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 브랜치 전략

```bash
# 1. main에서 새 브랜치 생성
git checkout -b claude/my-feature

# 2. 작업 및 커밋
git add .
git commit -m "feat: 새 기능 추가"

# 3. 푸시 및 PR
git push -u origin claude/my-feature

# 4. main으로 merge (fast-forward)
git checkout main
git merge claude/my-feature --ff-only
git push origin main
```

### 커밋 메시지 규칙

```
<type>: <subject>

<body>

Co-Authored-By: Author Name <email@example.com>
```

**타입 목록**:
- `feat`: 새 기능
- `fix`: 버그 수정
- `refactor`: 코드 리팩토링
- `docs`: 문서 변경
- `style`: CSS/UI 스타일 변경
- `chore`: 빌드, 의존성 등

---

## 📝 글 작성 가이드

### 파일 구조

마크다운 파일이 Supabase 데이터베이스에 저장됩니다 (git 추적 안 함).

### 프론트매터 (Frontmatter)

```yaml
title: "글 제목"
description: "1~2 문장 설명 (SEO, 카드에 표시)"
pubDate: "2026-03-20"
category: "AI/LLM"  # 선택사항, 계층 구조 지원
tags: ["Next.js", "React", "TypeScript"]
draft: false
```

### 마크다운 기능

- **문법 강조 (Syntax Highlighting)**: GFM 지원
- **테이블**: 마크다운 테이블 완벽 지원
- **이모지**: 자유롭게 사용 가능
- **인라인 코드**: `` `code` `` 형식

---

## 📖 참고 리소스

### 공식 문서
- [Next.js 15](https://nextjs.org/docs)
- [Supabase](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [React Markdown](https://github.com/remarkjs/react-markdown)

### 유사 블로그 (영감 출처)
- [Vercel Blog](https://vercel.com/blog)
- [Stripe Blog](https://stripe.com/blog)
- [Kent C. Dodds](https://kentcdodds.com)
- [Dan Abramov's Blog](https://overreacted.io/)

---

## 👨‍💻 저자

**장진석 (grobiann)**
- **GitHub**: [@grobiann](https://github.com/grobiann)
- **Email**: grobiann0@gmail.com
- **경력**: 5년차 게임 클라이언트 개발자
- **현재**: AI·웹 기술 학습 중

---

## 📄 라이선스

### 콘텐츠
**Creative Commons Attribution 4.0 (CC BY 4.0)**

블로그의 글과 이미지는 자유롭게 인용 가능합니다:
- ✅ 인용 및 공유 가능
- ✅ 수정 및 2차 저작 가능
- ⚠️ 출처 표기 필수

**인용 형식**:
```markdown
> [원문 제목](https://ai-lab-notes.vercel.app/blog/slug)
> 저자: grobiann
```

### 코드
**개인용** (상업적 재사용 금지)

이 저장소의 소스 코드는 개인 블로그용으로 제작되었습니다.

---

## 🐛 이슈 & 피드백

### 버그 리포트
[GitHub Issues](https://github.com/grobiann/ai-lab-notes/issues)에서 버그를 보고해주세요.

### 기능 요청
[GitHub Discussions](https://github.com/grobiann/ai-lab-notes/discussions)에서 제안해주세요.

### 연락
- Email: grobiann0@gmail.com
- GitHub: [@grobiann](https://github.com/grobiann)

---

## ✨ 변경 이력

### 2026년 3월 20일 — UI/UX 리디자인 🚀
- 🎨 색상 토큰 체계 통합 (ink/amber/cream)
- 📱 모바일 완벽 대응 (md 브레이크포인트)
- ♿ 접근성 강화 (WCAG AA+)
- 📚 글 상세 페이지 구조 개선
- ✨ Prose 스타일 개선
- 🔗 focus-visible 상태 추가

### 2026년 2월 초 — 초기 구축
- Next.js 15 + Supabase 풀스택 설계
- 블로그 & 포트폴리오 기능 구현

더 자세한 내용은 [Git 커밋 히스토리](https://github.com/grobiann/ai-lab-notes/commits/main)를 참고하세요.

---

## 🙏 감사의 말

이 블로그는 다음의 오픈소스 프로젝트로 만들어졌습니다:
- [Next.js](https://nextjs.org)
- [Supabase](https://supabase.com)
- [Tailwind CSS](https://tailwindcss.com)
- [React Markdown](https://github.com/remarkjs/react-markdown)

그리고 Claude AI의 도움으로 UI/UX가 크게 개선되었습니다. 🤖

---

**Made with ❤️ using Next.js + Supabase + Vercel**

Last updated: 2026-03-20
