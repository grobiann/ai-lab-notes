/**
 * 프로젝트 초기 데이터 시드 스크립트
 * 실행: NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/seed-projects.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('환경변수를 설정해주세요.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const projects = [
  // Work Projects
  {
    title: '고고 레이더스 / LoopBound 외',
    company: '네오위즈',
    period: '2023 – 2024',
    description: '단기 일정으로 모바일 게임 3개를 개발·출시. 100여 개 스테이지 맵툴 제작, 밸런스 데이터 자동화(30초→5초) 등 팀 개발 인프라 구축.',
    tags: ['Unity', 'C#', 'Android', 'iOS', 'Jenkins', 'Firebase'],
    type: 'work',
    github: null,
    demo: null,
    display_order: 1,
  },
  {
    title: '헌터서바이벌',
    company: 'Tesseract Studio',
    period: '2022',
    description: '핵앤슬래시 모바일 게임 개발 및 출시. 구글플레이 인기순위 1위 달성. AWS 전환으로 서버 비용 제로화, Unity Job 시스템으로 게임 성능 2배 향상.',
    tags: ['Unity', 'C#', 'Android', 'iOS', 'AWS', 'DynamoDB'],
    type: 'work',
    github: null,
    demo: null,
    display_order: 2,
  },
  {
    title: '미니알피지:판옵티콘',
    company: 'Tesseract Studio',
    period: '2020 – 2022',
    description: '스타트업 3인 팀에서 모바일 RPG 기획·개발·운영 전담. 구글 피쳐드 선정. 130개 맵툴, XML 기반 게임 데이터 시스템 구축.',
    tags: ['Unity', 'C#', 'Android', 'iOS', 'AWS', 'Spine'],
    type: 'work',
    github: null,
    demo: null,
    display_order: 3,
  },
  {
    title: '로보카폴리 지진안전 외',
    company: 'Kigle',
    period: '2019 – 2020',
    description: '로보카폴리 지진안전(유튜브 조회수 4000만), 뽀로로 시리즈 등 키즈 앱 다수 개발. 게임 템플릿화로 개발 속도 대폭 단축(2~3일→6시간).',
    tags: ['Unity', 'C#', 'Android', 'iOS', 'Spine'],
    type: 'work',
    github: null,
    demo: null,
    display_order: 4,
  },
  // Personal Projects
  {
    title: 'AI Lab Notes',
    company: null,
    period: '2026',
    description: 'AI·개발 학습 내용을 기록하는 개인 블로그. Next.js 15 + Supabase 풀스택으로 직접 설계·구축. 이 사이트가 바로 그 결과물.',
    tags: ['TypeScript', 'Next.js', 'Supabase', 'Tailwind CSS'],
    type: 'personal',
    github: 'https://github.com/grobiann/ai-lab-notes',
    demo: 'https://ai-lab-notes.vercel.app',
    display_order: 10,
  },
  {
    title: 'AI Lab Voice Typer',
    company: null,
    period: '2026',
    description: 'Ctrl+Space 단축키로 음성을 인식해 텍스트로 자동 타이핑하는 PC 도구. Google Cloud STT를 주 엔진으로, Whisper를 오프라인 폴백으로 지원.',
    tags: ['Python', 'Google STT', 'Whisper', 'Windows'],
    type: 'personal',
    github: 'https://github.com/grobiann/ai-lab-voice-typer',
    demo: null,
    display_order: 11,
  },
  {
    title: 'USM — Unity UI State Machine',
    company: null,
    period: '2024',
    description: 'Unity 프로젝트에서 UI 화면·탭 전환을 구조적으로 관리할 수 있는 오픈소스 패키지. UPM을 통해 Git URL로 바로 설치 가능. MIT 라이선스.',
    tags: ['C#', 'Unity', 'UPM', 'MIT'],
    type: 'personal',
    github: 'https://github.com/grobiann/usm',
    demo: null,
    display_order: 12,
  },
]

async function seed() {
  console.log(`총 ${projects.length}개 프로젝트를 삽입합니다...\n`)
  for (const project of projects) {
    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select('id, title')
      .single()
    if (error) {
      console.error(`❌ 실패: ${project.title} — ${error.message}`)
    } else {
      console.log(`✅ 성공: ${data.title}`)
    }
  }
  console.log('\n완료!')
}

seed()
