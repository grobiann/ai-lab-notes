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
          className="text-xs text-[#7a6a52] bg-[#f5ead8] border border-[#e8ddd0] px-2.5 py-0.5 rounded-full"
        >
          {tag}
        </span>
      ))}
    </div>
  )
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="bg-white border border-[#e8ddd0] rounded-xl p-6">
      <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
        <h3 className="font-semibold text-[#1a1208]">{project.title}</h3>
        <div className="flex items-center gap-3">
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
      {(project.company || project.period) && (
        <p className="text-xs text-[#b0977a] mb-1">
          {[project.company, project.period].filter(Boolean).join(' · ')}
        </p>
      )}
      <p className="text-sm text-[#7a6a52] leading-relaxed">{project.description}</p>
      {project.tags.length > 0 && <TagList tags={project.tags} />}
    </div>
  )
}

export default async function ProjectsPage() {
  const { data } = await supabasePublic
    .from('projects')
    .select('*')
    .order('display_order', { ascending: true })
  const projects = data as Project[] | null

  const workProjects = projects?.filter((p) => p.type === 'work') ?? []
  const personalProjects = projects?.filter((p) => p.type === 'personal') ?? []

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="mb-14">
        <h1 className="font-serif text-5xl font-black tracking-tight text-[#1a1208]">
          Projects
        </h1>
      </div>

      {/* 회사 프로젝트 */}
      <section className="mb-16">
        <h2 className="font-serif text-2xl font-bold text-[#1a1208] mb-6">Work Projects</h2>
        {workProjects.length > 0 ? (
          <div className="flex flex-col gap-4">
            {workProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <p className="text-[#b0977a] text-sm">프로젝트가 없습니다.</p>
        )}
      </section>

      {/* 개인 프로젝트 */}
      <section>
        <h2 className="font-serif text-2xl font-bold text-[#1a1208] mb-6">Personal Projects</h2>
        {personalProjects.length > 0 ? (
          <div className="flex flex-col gap-4">
            {personalProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <p className="text-[#b0977a] text-sm">프로젝트가 없습니다.</p>
        )}
      </section>
    </div>
  )
}
