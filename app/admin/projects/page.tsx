import Link from 'next/link'
import { getAllProjects } from '@/lib/dynamo'
import type { Project } from '@/lib/types'

export default async function AdminProjectsPage() {
  const projects = await getAllProjects()

  const work = projects.filter((p) => p.type === 'work')
  const personal = projects.filter((p) => p.type === 'personal')

  function Section({ title, items }: { title: string; items: Project[] }) {
    return (
      <div className="mb-10">
        <h2 className="font-serif text-lg font-bold text-[#1a1208] mb-3">{title}</h2>
        {items.length > 0 ? (
          <div className="space-y-2">
            {items.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between bg-white border border-[#e8ddd0] rounded-xl px-5 py-4"
              >
                <div className="flex-1 min-w-0 mr-4">
                  <p className="text-sm font-medium text-[#1a1208] truncate">{p.title}</p>
                  {p.company && <p className="text-xs text-[#b0977a]">{p.company} · {p.period}</p>}
                </div>
                <Link
                  href={`/admin/projects/${p.id}`}
                  className="text-sm font-medium text-[#c07a2f] hover:text-[#a86828] whitespace-nowrap"
                >
                  수정
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#b0977a]">프로젝트가 없습니다.</p>
        )}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-3xl font-bold text-[#1a1208]">프로젝트 관리</h1>
        <Link
          href="/admin/projects/new"
          className="text-sm font-medium text-white bg-[#c07a2f] hover:bg-[#a86828] px-4 py-2 rounded-lg transition-colors"
        >
          + 새 프로젝트
        </Link>
      </div>
      <Section title="Work Projects" items={work} />
      <Section title="Personal Projects" items={personal} />
    </div>
  )
}
