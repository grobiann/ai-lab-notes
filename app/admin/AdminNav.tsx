'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AdminNav() {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
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
        <Link
          href="/admin/posts/new"
          className="text-sm font-medium text-white bg-[#c07a2f] hover:bg-[#a86828] px-3 py-1.5 rounded-lg transition-colors"
        >
          + 새 글
        </Link>
        <span className="text-[#e8ddd0]">|</span>
        <Link
          href="/admin/projects"
          className="text-sm font-semibold text-[#c07a2f] hover:text-[#a86828]"
        >
          프로젝트
        </Link>
        <Link
          href="/admin/projects/new"
          className="text-sm font-medium text-[#2c2416] bg-[#f5ead8] hover:bg-[#ecdcc0] border border-[#d4b896] px-3 py-1.5 rounded-lg transition-colors"
        >
          + 새 프로젝트
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
