'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function AdminNav() {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
    router.refresh()
  }

  return (
    <div className="flex items-center justify-between mb-10 pb-6 border-b border-[#e8ddd0]">
      <div className="flex items-center gap-4">
        <Link
          href="/admin"
          className="text-sm font-semibold text-[#c07a2f] hover:text-[#a86828]"
        >
          글 관리
        </Link>
        <span className="text-[#e8ddd0]">|</span>
        <Link
          href="/admin/projects"
          className="text-sm font-semibold text-[#c07a2f] hover:text-[#a86828]"
        >
          프로젝트
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="text-sm text-[#7a6a52] hover:text-[#c07a2f]"
        >
          사이트 보기
        </Link>
        <button
          onClick={handleLogout}
          className="text-sm text-[#7a6a52] hover:text-red-600 transition-colors"
        >
          로그아웃
        </button>
      </div>
    </div>
  )
}
