import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import AdminNav from './AdminNav'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  if (!session) redirect('/login')

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <AdminNav />
      {children}
    </div>
  )
}
