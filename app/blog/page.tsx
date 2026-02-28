import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import PostCard from '@/components/PostCard'
import type { Post } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'AI·개발 학습 블로그 글 목록',
}

export default async function BlogPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('posts')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
  const posts = data as Post[] | null

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="mb-12">
        <p className="text-xs font-semibold tracking-widest uppercase text-[#c07a2f] mb-3">
          All Posts
        </p>
        <h1 className="font-serif text-4xl font-bold tracking-tight text-[#1a1208]">
          Blog
        </h1>
      </div>

      {posts && posts.length > 0 ? (
        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-[#b0977a]">아직 글이 없습니다.</p>
        </div>
      )}
    </div>
  )
}
