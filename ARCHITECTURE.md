# ai-lab-notes — 아키텍처 결정 기록

작성일: 2026-02-28

---

## 배경

기존 두 가지 구조의 문제점:

| 구조 | 문제 |
|------|------|
| Astro + GitHub Pages | 글을 쓸 때마다 마크다운 파일 작성 → Git 커밋 필요. UI 없음 |
| Express + React + Docker | 별도 VPS 서버 상시 운영 필요. 유료 인프라 필수 |

**요구사항 재정의:**
- 무료 (트래픽이 적어 무료 티어로 충분)
- 서버 상시 운영 없음 (로컬 PC도, 유료 VPS도 X)
- 누구나 접근 가능한 공개 URL
- DB 기반 콘텐츠 관리 (Git 커밋 없이 UI에서 글 작성)
- 나만 글 작성 가능 (어드민 로그인)

---

## 기술 선택 과정

### 1단계 — 프레임워크 + 호스팅

| 옵션 | 특징 | 선택 여부 |
|------|------|-----------|
| **Next.js + Vercel** ✅ | React 기반, 프론트+API 통합, 자료 가장 많음, Vercel과 최적 호환 | **선택** |
| Astro (SSR 모드) + Vercel | 기존 경험 있음, 콘텐츠 사이트에 특화, 동적 기능 구현 시 번거로움 | 미선택 |
| SvelteKit + Vercel | 코드 간결, 배우기 쉬움, 생태계·자료가 상대적으로 적음 | 미선택 |

**선택 이유:** 동적 기능(DB 연동, 로그인, 글 작성 UI)이 핵심인 구조에서 Next.js가 자료와 안정성 면에서 가장 검증됨. Vercel이 Next.js를 만든 회사라 호환성 최고.

---

### 2단계 — 데이터베이스

| 옵션 | 특징 | 선택 여부 |
|------|------|-----------|
| **Supabase** ✅ | PostgreSQL + Auth + Storage 올인원. DB와 로그인을 한 번에 해결. 무료 500MB | **선택** |
| Neon | Serverless PostgreSQL 전용. 무료 티어 더 넉넉. 인증은 별도 구현 필요 | 미선택 |
| MongoDB Atlas | NoSQL(JSON 문서형). 무료 512MB. Next.js + Supabase 조합보다 자료 적음 | 미선택 |

**선택 이유:** DB와 어드민 로그인을 Supabase 하나로 해결해 설정 최소화. 무료 플랜의 1주 미접속 시 일시정지 단점은 개인 블로그 수준에서 영향 미미.

---

### 3단계 — 어드민 인증

| 옵션 | 특징 | 선택 여부 |
|------|------|-----------|
| **Supabase Auth** ✅ | Supabase 내장 인증. 이메일+비밀번호. 추가 서비스 불필요 | **선택** |
| NextAuth.js | GitHub/Google 소셜 로그인 지원. Supabase와 별도 연동 설정 필요 | 미선택 |
| Clerk | 로그인 UI까지 제공. 설정 가장 간단하지만 외부 서비스 하나 더 추가됨 | 미선택 |

**선택 이유:** Supabase Auth를 쓰면 별도 서비스 추가 없이 해결. 어드민 1명짜리 블로그에 이메일+비밀번호 로그인으로 충분.

---

## 최종 아키텍처

```
┌─────────────────────────────────────────┐
│           Next.js 15 (App Router)       │
│  - 프론트엔드 (React Server Components) │
│  - 백엔드 API (Route Handlers)          │
│  - 미들웨어 (어드민 인증 보호)           │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│              Supabase                   │
│  - PostgreSQL (posts 테이블)            │
│  - Auth (이메일+비밀번호 어드민 로그인)  │
│  - RLS (비인증 사용자는 읽기만 가능)     │
└─────────────────────────────────────────┘

호스팅: Vercel (무료)
배포: claude/review-and-test-build-9Vy8z 브랜치 push → 자동 배포
URL: grobiann.vercel.app (또는 커스텀 도메인)
```

---

## 작동 방식

### 방문자 (누구나)
```
grobiann.vercel.app 접속
  → /        홈 (최근 글 목록)
  → /blog    전체 글 목록
  → /blog/:slug  글 상세
  → /about   소개 페이지
```

### 어드민 (나만)
```
/login 접속 → 이메일+비밀번호 로그인
  → /admin           글 목록 + 관리 대시보드
  → /admin/posts/new 새 글 작성 (마크다운 에디터)
  → /admin/posts/:id 기존 글 수정/삭제
  저장 → Supabase DB에 즉시 반영 → 사이트에 바로 표시
```

### 배포
```
코드 수정 → claude/review-and-test-build-9Vy8z 브랜치 push
  → Vercel 자동 감지 → 빌드 & 배포 (약 1~2분)
  (글 작성은 이 과정과 무관 — UI에서 직접)
```

---

## DB 스키마 (Supabase에서 실행)

```sql
CREATE TABLE posts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  slug         TEXT UNIQUE NOT NULL,
  description  TEXT,
  content      TEXT NOT NULL,
  tags         TEXT[] DEFAULT '{}',
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 누구나 발행된 글 읽기 가능
CREATE POLICY "public_read_published" ON posts
  FOR SELECT USING (is_published = TRUE);

-- 인증된 사용자(어드민)만 전체 접근
CREATE POLICY "admin_all" ON posts
  FOR ALL USING (auth.role() = 'authenticated');
```

---

## 환경 변수 (Vercel 대시보드에 설정)

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

---

## 프로젝트 폴더 구조

```
ai-lab-notes/
├── app/
│   ├── layout.tsx                 # 공통 레이아웃 (nav, footer)
│   ├── globals.css                # 글로벌 스타일
│   ├── page.tsx                   # 홈 (최근 글 목록)
│   ├── blog/
│   │   ├── page.tsx               # /blog 전체 목록
│   │   └── [slug]/page.tsx        # /blog/:slug 글 상세
│   ├── about/page.tsx             # /about
│   ├── login/page.tsx             # 어드민 로그인
│   ├── admin/
│   │   ├── layout.tsx             # 인증 보호 (미로그인 → /login)
│   │   ├── page.tsx               # 어드민 대시보드
│   │   └── posts/
│   │       ├── new/page.tsx       # 새 글 작성
│   │       └── [id]/page.tsx      # 글 수정
│   └── api/auth/callback/route.ts # Supabase 인증 콜백
├── components/
│   ├── Navigation.tsx
│   ├── Footer.tsx
│   └── PostCard.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts              # 브라우저용
│   │   └── server.ts              # 서버 컴포넌트용
│   └── types.ts
├── middleware.ts                   # /admin 접근 인증 체크
├── next.config.ts
├── tailwind.config.ts             # amber/ink/cream 디자인 토큰
├── package.json
└── tsconfig.json
```

---

## Vercel + Supabase 설정 순서 (구현 완료 후 사용자가 할 일)

1. **Supabase** — supabase.com에서 프로젝트 생성
2. **Supabase** — SQL Editor에서 위 스키마 실행
3. **Supabase** — Authentication > Users에서 어드민 계정 1개 생성
4. **Vercel** — vercel.com에서 GitHub 저장소 연결
5. **Vercel** — 배포 브랜치를 `claude/review-and-test-build-9Vy8z`로 설정
6. **Vercel** — Environment Variables에 Supabase 키 3개 입력
7. **완료** — grobiann.vercel.app 접속 확인
