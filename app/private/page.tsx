import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function PrivatePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/admin')
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-32 text-center">
      <div className="text-5xl mb-8">🔒</div>
      <h1 className="font-serif text-2xl font-bold text-[#1a1208] mb-4">
        비공개 영역입니다
      </h1>
      <p className="text-[#7a6a52] text-sm leading-relaxed">
        이 페이지는 사이트 운영자만 접근할 수 있습니다.<br />
        방문해 주셔서 감사합니다.
      </p>
      <Link
        href="/"
        className="inline-block mt-10 text-sm text-[#c07a2f] hover:text-[#a86828] transition-colors"
      >
        ← 홈으로 돌아가기
      </Link>
    </main>
  )
}
