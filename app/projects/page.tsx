import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Projects',
  description: '장진석의 회사 프로젝트 및 개인 프로젝트',
}

const workProjects = [
  {
    title: '고고 레이더스 / LoopBound 외',
    company: '네오위즈',
    period: '2023 – 2024',
    description: '단기 일정으로 모바일 게임 3개를 개발·출시. 100여 개 스테이지 맵툴 제작, 밸런스 데이터 자동화(30초→5초) 등 팀 개발 인프라 구축.',
    tags: ['Unity', 'C#', 'Android', 'iOS', 'Jenkins', 'Firebase'],
  },
  {
    title: '헌터서바이벌',
    company: 'Tesseract Studio',
    period: '2022',
    description: '핵앤슬래시 모바일 게임 개발 및 출시. 구글플레이 인기순위 1위 달성. AWS 전환으로 서버 비용 제로화, Unity Job 시스템으로 게임 성능 2배 향상.',
    tags: ['Unity', 'C#', 'Android', 'iOS', 'AWS', 'DynamoDB'],
  },
  {
    title: '미니알피지:판옵티콘',
    company: 'Tesseract Studio',
    period: '2020 – 2022',
    description: '스타트업 3인 팀에서 모바일 RPG 기획·개발·운영 전담. 구글 피쳐드 선정. 130개 맵툴, XML 기반 게임 데이터 시스템 구축.',
    tags: ['Unity', 'C#', 'Android', 'iOS', 'AWS', 'Spine'],
  },
  {
    title: '로보카폴리 지진안전 외',
    company: 'Kigle',
    period: '2019 – 2020',
    description: '로보카폴리 지진안전(유튜브 조회수 4000만), 뽀로로 시리즈 등 키즈 앱 다수 개발. 게임 템플릿화로 개발 속도 대폭 단축(2~3일→6시간).',
    tags: ['Unity', 'C#', 'Android', 'iOS', 'Spine'],
  },
]

const personalProjects = [
  {
    title: 'AI Lab Notes',
    description: 'AI·개발 학습 내용을 기록하는 개인 블로그. Next.js 15 + Supabase 풀스택으로 직접 설계·구축. 이 사이트가 바로 그 결과물.',
    tags: ['TypeScript', 'Next.js', 'Supabase', 'Tailwind CSS'],
    github: 'https://github.com/grobiann/ai-lab-notes',
    demo: 'https://ai-lab-notes.vercel.app',
  },
  {
    title: 'AI Lab Voice Typer',
    description: 'Ctrl+Space 단축키로 음성을 인식해 텍스트로 자동 타이핑하는 PC 도구. Google Cloud STT를 주 엔진으로, Whisper를 오프라인 폴백으로 지원.',
    tags: ['Python', 'Google STT', 'Whisper', 'Windows'],
    github: 'https://github.com/grobiann/ai-lab-voice-typer',
  },
  {
    title: 'USM — Unity UI State Machine',
    description: 'Unity 프로젝트에서 UI 화면·탭 전환을 구조적으로 관리할 수 있는 오픈소스 패키지. UPM을 통해 Git URL로 바로 설치 가능. MIT 라이선스.',
    tags: ['C#', 'Unity', 'UPM', 'MIT'],
    github: 'https://github.com/grobiann/usm',
  },
]

function TagList({ tags }: { tags: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5 mt-3">
      {tags.map((tag) => (
        <span
          key={tag}
          className="text-xs text-[#7a6a52] bg-[#f5ead8] border border-[#e8ddd0] px-2.5 py-0.5 rounded-full"
        >
          {tag}
        </span>
      ))}
    </div>
  )
}

export default function ProjectsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      {/* 헤더 */}
      <div className="mb-14">
        <p className="text-xs font-semibold tracking-widest uppercase text-[#c07a2f] mb-3">
          Projects
        </p>
        <h1 className="font-serif text-4xl font-bold tracking-tight text-[#1a1208]">
          Projects
        </h1>
      </div>

      {/* 회사 프로젝트 */}
      <section className="mb-16">
        <h2 className="font-serif text-2xl font-bold text-[#1a1208] mb-6">
          Work Projects
        </h2>
        <div className="flex flex-col gap-4">
          {workProjects.map((project) => (
            <div
              key={project.title}
              className="bg-white border border-[#e8ddd0] rounded-xl p-6"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                <h3 className="font-semibold text-[#1a1208]">{project.title}</h3>
                <span className="text-xs text-[#b0977a]">{project.company} · {project.period}</span>
              </div>
              <p className="text-sm text-[#7a6a52] leading-relaxed">{project.description}</p>
              <TagList tags={project.tags} />
            </div>
          ))}
        </div>
      </section>

      {/* 개인 프로젝트 */}
      <section>
        <h2 className="font-serif text-2xl font-bold text-[#1a1208] mb-6">
          Personal Projects
        </h2>
        <div className="flex flex-col gap-4">
          {personalProjects.map((project) => (
            <div
              key={project.title}
              className="bg-white border border-[#e8ddd0] rounded-xl p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                <h3 className="font-semibold text-[#1a1208]">{project.title}</h3>
                <div className="flex gap-3">
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#c07a2f] hover:text-[#a86828] transition-colors"
                    >
                      GitHub →
                    </a>
                  )}
                  {project.demo && (
                    <a
                      href={project.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#c07a2f] hover:text-[#a86828] transition-colors"
                    >
                      Demo →
                    </a>
                  )}
                </div>
              </div>
              <p className="text-sm text-[#7a6a52] leading-relaxed">{project.description}</p>
              <TagList tags={project.tags} />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
