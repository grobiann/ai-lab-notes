import type { Metadata } from 'next'
import { supabasePublic } from '@/lib/supabase/public'
import type { Project } from '@/lib/types'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Projects',
  description: '장진석의 회사 프로젝트 및 개인 프로젝트',
}

function TagList({ tags }: { tags: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5 mt-3">
      {tags.map((tag) => (
        <span
          key={tag}
          className="text-xs text-ink-light bg-cream-200 border border-cream-400 px-2.5 py-0.5 rounded-full"
        >
          {tag}
        </span>
      ))}
    </div>
  )
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="bg-card border border-cream-400 hover:border-cream-500 rounded-xl p-6 transition-all hover:shadow-sm focus-within:outline-2 focus-within:outline-offset-1 focus-within:outline-amber-warm">
      <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
        <h3 className="font-semibold text-ink-dark">{project.title}</h3>
        <div className="flex items-center gap-3">
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-amber-warm hover:text-amber-light transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-amber-warm"
            >
              GitHub →
            </a>
          )}
          {project.demo && (
            <a
              href={project.demo}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-amber-warm hover:text-amber-light transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-amber-warm"
            >
              Demo →
            </a>
          )}
        </div>
      </div>
      {(project.company || project.period) && (
        <p className="text-xs text-ink-muted mb-1">
          {[project.company, project.period].filter(Boolean).join(' · ')}
        </p>
      )}
      <p className="text-sm text-ink-light leading-relaxed">{project.description}</p>
      {project.tags.length > 0 && <TagList tags={project.tags} />}
    </div>
  )
}

export default async function ProjectsPage() {
  let projects: Project[] | null = null
  if (supabasePublic) {
    try {
      const { data } = await supabasePublic
        .from('projects')
        .select('*')
        .order('display_order', { ascending: true })
      projects = data as Project[] | null
    } catch {
      // DB 연결 실패 시 빈 목록으로 폴백
    }
  }

  const workProjects = projects?.filter((p) => p.type === 'work') ?? []
  const personalProjects = projects?.filter((p) => p.type === 'personal') ?? []

  return (
    <div className="bg-body min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="mb-14">
          <h1 className="font-serif text-5xl font-black tracking-tight text-ink-dark">
            Projects
          </h1>
        </div>

        {/* 회사 프로젝트 */}
        <section className="mb-16">
          <h2 className="font-serif text-2xl font-bold text-ink-dark mb-6">Work Projects</h2>
          {workProjects.length > 0 ? (
            <div className="flex flex-col gap-4">
              {workProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <p className="text-ink-muted text-sm">프로젝트가 없습니다.</p>
          )}
        </section>

        {/* 개인 프로젝트 */}
        <section>
          <h2 className="font-serif text-2xl font-bold text-ink-dark mb-6">Personal Projects</h2>
          {personalProjects.length > 0 ? (
            <div className="flex flex-col gap-4">
              {personalProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <p className="text-ink-muted text-sm">프로젝트가 없습니다.</p>
          )}
        </section>
      </div>
    </div>
  )
}
