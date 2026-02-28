import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProjectForm from '@/app/admin/ProjectForm'
import type { Project } from '@/lib/types'

type Props = { params: Promise<{ id: string }> }

export default async function EditProjectPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('projects').select('*').eq('id', id).single()
  const project = data as Project | null
  if (!project) notFound()
  return <ProjectForm project={project} />
}
