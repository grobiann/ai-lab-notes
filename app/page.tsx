import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import PostCard from '@/components/PostCard'
import type { Post } from '@/lib/types'

export default async function HomePage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('posts')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(5)
  const posts = data as Post[] | null

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      {/* Hero */}
      <section className="mb-16">
        <p className="text-xs font-semibold tracking-widest uppercase text-[#c07a2f] mb-3">
          Blog & Dev Notes
        </p>
        <h1 className="font-serif text-4xl font-bold tracking-tight text-[#1a1208] mb-4">
          AI Lab Notes
        </h1>
        <p className="text-[#7a6a52] text-lg leading-relaxed max-w-xl">
          AI·개발 학습 과정에서 발견한 것들을 기록합니다.
          Unity, PostgreSQL, 그리고 그 사이의 모든 것.
        </p>
      </section>

      {/* Recent Posts */}
      {posts && posts.length > 0 ? (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl font-bold text-[#1a1208]">
              최근 글
            </h2>
            <Link
              href="/blog"
              className="text-sm text-[#c07a2f] hover:text-[#a86828] transition-colors"
            >
              전체 보기 →
            </Link>
          </div>
          <div className="flex flex-col gap-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      ) : (
        <section className="text-center py-16">
          <p className="text-[#b0977a]">아직 글이 없습니다.</p>
        </section>
      )}
    </div>
  )
}
