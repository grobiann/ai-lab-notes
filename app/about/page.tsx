import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About',
  description: '장진석 — 5년차 게임 클라이언트 개발자',
}

const skills = ['Unity', 'C#', 'Spine', 'Android', 'iOS', 'AWS', 'Jenkins', 'Next.js']

const experience = [
  {
    company: '네오위즈',
    period: '2023.05 – 2024.10',
    role: 'Game Client Developer',
    summary: '단기 일정으로 고고 레이더스, LoopBound 등 모바일 게임 3개 개발 · 출시. 맵툴 제작 및 데이터 자동화로 팀 개발 효율 대폭 향상.',
  },
  {
    company: 'Tesseract Studio · 헌터서바이벌',
    period: '2022.03 – 2022.07',
    role: 'Game Client Developer & PM',
    summary: '핵앤슬래시 모바일 게임 개발 및 출시. 구글플레이 인기순위 1위 달성. AWS 전환으로 서버 비용 절감 및 멀티쓰레딩으로 게임 성능 2배 향상.',
  },
  {
    company: 'Tesseract Studio · 미니알피지:판옵티콘',
    period: '2020.09 – 2022.02',
    role: 'Game Client Developer & PM',
    summary: '모바일 RPG 게임 기획·개발·운영 전담. 구글 피쳐드 선정. 130개 게임 맵툴 제작.',
  },
  {
    company: 'Kigle',
    period: '2019.05 – 2020.04',
    role: 'Game Client Developer',
    summary: '로보카폴리 지진안전(유튜브 4000만 조회), 뽀로로 시리즈 등 키즈 앱 다수 개발 및 Android · iOS 출시.',
  },
]

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      {/* 헤더 */}
      <div className="mb-14">
        <h1 className="font-serif text-5xl font-black tracking-tight text-[#1a1208] mb-2">
          장진석
        </h1>
        <p className="text-[#7a6a52] text-lg">5년차 게임 클라이언트 개발자</p>
        <p className="text-sm text-[#b0977a] mt-1">grobiann0@gmail.com</p>
      </div>

      {/* 소개 */}
      <section className="mb-12">
        <p className="text-[#2c2416] leading-relaxed mb-3">
          코드 품질과 팀 효율을 함께 챙기는 개발자입니다. 반복 업무를 자동화하고,
          다른 직군이 더 빠르게 일할 수 있는 환경을 만드는 것을 좋아합니다.
        </p>
        <p className="text-[#2c2416] leading-relaxed">
          최근에는 AI 도구와 웹 기술을 활용한 사이드 프로젝트를 이어가며 배운 것들을 이 블로그에 기록하고 있습니다.
        </p>
      </section>

      {/* 기술 스택 */}
      <section className="mb-12">
        <h2 className="font-serif text-xl font-bold text-[#1a1208] mb-4">Skills</h2>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span
              key={skill}
              className="text-sm text-[#7a6a52] bg-[#f5ead8] border border-[#e8ddd0] px-3 py-1 rounded-full"
            >
              {skill}
            </span>
          ))}
        </div>
      </section>

      {/* 경력 */}
      <section className="mb-12">
        <h2 className="font-serif text-xl font-bold text-[#1a1208] mb-6">Work Experience</h2>
        <div className="flex flex-col gap-6">
          {experience.map((exp) => (
            <div key={exp.company} className="border-l-2 border-[#e8ddd0] pl-5">
              <div className="flex flex-wrap items-baseline gap-x-3 mb-1">
                <span className="font-serif font-bold text-[#1a1208]">{exp.company}</span>
                <span className="text-xs text-[#b0977a]">{exp.period}</span>
              </div>
              <p className="text-xs text-[#c07a2f] mb-1">{exp.role}</p>
              <p className="text-sm text-[#7a6a52] leading-relaxed">{exp.summary}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 학력 */}
      <section>
        <h2 className="font-serif text-xl font-bold text-[#1a1208] mb-4">Education</h2>
        <div className="border-l-2 border-[#e8ddd0] pl-5">
          <span className="font-serif font-bold text-[#1a1208]">충남대학교 수학과</span>
          <span className="text-xs text-[#b0977a] ml-3">2011 – 2017</span>
        </div>
      </section>
    </div>
  )
}
