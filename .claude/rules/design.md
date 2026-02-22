---
paths: src/**/*.{astro,html,css}
---

# 디자인 시스템 규칙

## 색상 토큰 (tailwind.config.mjs 정의)

| 토큰 | 값 | 용도 |
|------|-----|------|
| `amber.warm` | `#c07a2f` | 포인트 컬러 (링크, 태그 텍스트, 강조) |
| `amber.light` | `#e8a84e` | 호버 상태 포인트 |
| `amber.pale` | `#fdf3e3` | 블로그 태그 배경 |
| `ink.DEFAULT` | `#2c2416` | 기본 텍스트 |
| `ink.light` | `#7a6a52` | 보조 텍스트, 설명 |
| `ink.muted` | `#b0977a` | 날짜·메타 정보 |
| `cream-100` | `#faf5ec` | 코드블록 배경 |
| `cream-200` | `#f5ead8` | 프로젝트 태그 배경 |
| `cream-300` | `#ecdcc0` | 호버 배경 |
| `cream-500` | `#d4b896` | 구분선, 테두리 |

- 페이지 배경: `bg-[#faf8f5]` (크림색)
- 주요 테두리: `border-[#e8ddd0]`

## 타이포그래피

- serif (제목): `font-serif` → Georgia
- sans (본문): `font-sans` → Helvetica Neue
- 본문 prose: `prose-warm` variant 사용 (BlogLayout, ProjectLayout)

## 자주 쓰는 컴포넌트 패턴

### 카드
```html
<a class="bg-white border border-[#e8ddd0] hover:border-[#d4b896] rounded-xl p-6 transition-all hover:shadow-sm">
```

### 블로그 태그
```html
<span class="text-xs font-medium text-[#c07a2f] bg-[#fdf3e3] px-2.5 py-1 rounded-full">
```

### 프로젝트 태그
```html
<span class="text-xs text-[#7a6a52] bg-[#f5ead8] border border-[#e8ddd0] px-2.5 py-0.5 rounded-full">
```

### 섹션 헤더 (목록 상단)
```html
<p class="text-xs font-semibold tracking-widest uppercase text-[#c07a2f] mb-3">섹션명</p>
<h1 class="font-serif text-4xl font-bold tracking-tight text-[#1a1208]">제목</h1>
```

### 포인트 버튼 (CTA)
```html
<a class="text-sm font-medium text-white bg-[#c07a2f] hover:bg-[#a86828] px-4 py-2 rounded-lg transition-colors">
```

### 일반 버튼
```html
<a class="text-sm font-medium text-[#2c2416] bg-[#f5ead8] hover:bg-[#ecdcc0] border border-[#d4b896] px-4 py-2 rounded-lg transition-colors">
```

## 규칙

- 임의의 hex 색상 직접 사용 금지 — 위 토큰 표 기반으로 작성
- 새 UI 요소 추가 시 위 패턴을 먼저 참고하고, 없는 경우에만 새로 작성
- max-width는 본문 `max-w-2xl`, 전체 레이아웃 `max-w-3xl` 사용
