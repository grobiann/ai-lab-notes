# AI Lab Notes — Claude 작업 지침

grobiann의 AI·개발 학습 블로그.
**Next.js 15 + Supabase + Vercel** 풀스택 구조.

- 저장소: https://github.com/grobiann/ai-lab-notes
- 배포 브랜치: `claude/review-and-test-build-9Vy8z` (기본 브랜치, Vercel 자동 배포)
- 아키텍처 결정 기록: [ARCHITECTURE.md](./ARCHITECTURE.md)

**작업 완료 시 변경사항이 생기면 관련 CLAUDE 파일도 함께 최신화한다.**

---

## 주요 명령어

```bash
npm run dev      # 개발 서버 (http://localhost:3000)
npm run build    # 프로덕션 빌드
npm run start    # 빌드 결과 실행
```

---

## 프로젝트 구조

```
app/
├── layout.tsx                 # 공통 레이아웃 (nav, footer)
├── globals.css                # 글로벌 스타일
├── page.tsx                   # 홈 (최근 글 목록)
├── blog/
│   ├── page.tsx               # /blog 전체 목록
│   └── [slug]/page.tsx        # /blog/:slug 글 상세
├── about/page.tsx             # /about
├── login/page.tsx             # 어드민 로그인 (Supabase Auth)
├── admin/
│   ├── layout.tsx             # 인증 보호 (미로그인 → /login)
│   ├── AdminNav.tsx           # 어드민 상단 네비 (Client Component)
│   ├── PostForm.tsx           # 글 작성/수정 공용 폼 (Client Component)
│   ├── page.tsx               # 어드민 대시보드 (글 목록)
│   └── posts/
│       ├── new/page.tsx       # 새 글 작성
│       └── [id]/page.tsx      # 글 수정
└── api/auth/callback/route.ts # Supabase Auth 콜백
components/
├── Navigation.tsx             # 사이트 상단 네비
├── Footer.tsx                 # 사이트 푸터
└── PostCard.tsx               # 블로그 목록 카드
lib/
├── supabase/
│   ├── client.ts              # 브라우저용 ('use client' 환경)
│   └── server.ts              # 서버 컴포넌트용
└── types.ts                   # Post, Database 타입
middleware.ts                  # /admin 접근 인증 체크
```

---

## 핵심 설정

- **프레임워크**: Next.js 15 (App Router)
- **DB + Auth**: Supabase (PostgreSQL + Row Level Security)
- **호스팅**: Vercel (push → 자동 배포, 서버 불필요)
- **배포 트리거**: `claude/review-and-test-build-9Vy8z` 브랜치 push → Vercel 자동 빌드

---

## 환경 변수

로컬 개발: `.env.local` 파일 생성 (`.env.local.example` 참고)
프로덕션: Vercel 대시보드 > Environment Variables에 설정

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

---

## Supabase DB 스키마

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
CREATE POLICY "public_read_published" ON posts FOR SELECT USING (is_published = TRUE);
CREATE POLICY "admin_all" ON posts FOR ALL USING (auth.role() = 'authenticated');
```

---

## 디자인 시스템

색상 토큰 (tailwind.config.ts 정의):

| 토큰 | 값 | 용도 |
|------|-----|------|
| `amber.warm` | `#c07a2f` | 포인트 컬러 |
| `amber.light` | `#e8a84e` | 호버 |
| `amber.pale` | `#fdf3e3` | 태그 배경 |
| `ink.DEFAULT` | `#2c2416` | 기본 텍스트 |
| `ink.light` | `#7a6a52` | 보조 텍스트 |
| `ink.muted` | `#b0977a` | 날짜·메타 |
| `cream-*` | 다양한 크림톤 | 배경·테두리 |
| 페이지 배경 | `#faf8f5` | |
| 테두리 | `#e8ddd0` | |

---

## 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-02 초 | Astro + Tailwind 정적 사이트 구축 |
| 2026-02 | Express + React 풀스택으로 전환 시도 (폐기) |
| 2026-02-28 | Next.js 15 + Supabase + Vercel로 완전 재설계 |
