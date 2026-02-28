import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About',
  description: 'grobiann 소개',
}

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <div className="mb-12">
        <p className="text-xs font-semibold tracking-widest uppercase text-[#c07a2f] mb-3">
          About
        </p>
        <h1 className="font-serif text-4xl font-bold tracking-tight text-[#1a1208]">
          grobiann
        </h1>
      </div>

      <div className="prose prose-warm max-w-none">
        <p>
          Unity 게임 개발과 AI 기술에 관심이 많은 개발자입니다.
          학습 과정에서 발견한 것들을 이 블로그에 기록합니다.
        </p>
        <h2>관심 분야</h2>
        <ul>
          <li>Unity / C# 게임 개발</li>
          <li>AI · 머신러닝 응용</li>
          <li>PostgreSQL · 데이터베이스</li>
          <li>웹 개발 (Next.js, Supabase)</li>
        </ul>
      </div>
    </div>
  )
}
