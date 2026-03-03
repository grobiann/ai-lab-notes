import Link from 'next/link'
import { supabasePublic } from '@/lib/supabase/public'
import PostCard from '@/components/PostCard'
import type { Post } from '@/lib/types'

export const revalidate = 3600

export default async function HomePage() {
  const { data } = await supabasePublic
    .from('posts')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(6)
  const posts = data as Post[] | null

  return (
    <div className="max-w-5xl mx-auto px-6">
      {/* Hero */}
      <section className="py-24 border-b border-[#e8ddd0]">
        <div className="text-center">
          {/* Decorative line */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-1 bg-[#c07a2f] rounded-full" />
          </div>

          {/* Eyebrow */}
          <p className="text-xs font-semibold tracking-widest uppercase text-[#c07a2f] mb-4">
            AI · Dev Notes
          </p>

          {/* Main heading */}
          <h1 className="font-serif text-6xl font-black tracking-tight text-[#1a1208] mb-6 leading-tight">
            AI Lab Notes
          </h1>

          {/* Subheading */}
          <p className="text-xl text-[#7a6a52] leading-relaxed max-w-2xl mx-auto mb-10">
            게임 개발자의 AI·개발 학습 기록.
            <br />
            Unity, PostgreSQL, 그리고 그 사이의 모든 것.
          </p>

          {/* CTA Buttons */}
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/blog"
              className="px-6 py-2.5 bg-[#c07a2f] text-white font-medium rounded-lg hover:bg-[#a8672a] transition-colors"
            >
              블로그 읽기 →
            </Link>
            <Link
              href="/about"
              className="px-6 py-2.5 border border-[#c07a2f] text-[#c07a2f] font-medium rounded-lg hover:bg-[#fdf3e3] transition-colors"
            >
              About me
            </Link>
          </div>
        </div>
      </section>

      {/* Recent Posts */}
      {posts && posts.length > 0 ? (
        <section className="py-16">
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-[#e8ddd0]">
            <h2 className="font-serif text-2xl font-bold text-[#1a1208]">
              최근 글
            </h2>
            <Link
              href="/blog"
              className="text-sm text-[#c07a2f] hover:text-[#a8672a] font-medium transition-colors"
            >
              전체 보기 →
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} mode="list" />
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
