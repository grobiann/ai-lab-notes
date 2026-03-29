import { notFound } from 'next/navigation'
import { getProjectById } from '@/lib/dynamo'
import ProjectForm from '@/app/admin/ProjectForm'

type Props = { params: Promise<{ id: string }> }

export default async function EditProjectPage({ params }: Props) {
  const { id } = await params
  const project = await getProjectById(id)
  if (!project) notFound()
  return <ProjectForm project={project} />
}
