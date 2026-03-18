import type { Metadata } from 'next'
import { supabasePublic } from '@/lib/supabase/public'
import BlogList from '@/components/BlogList'
import type { Post } from '@/lib/types'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Blog',
  description: 'AI·개발 학습 블로그 글 목록',
}

export default async function BlogPage() {
  let posts: Post[] = []
  if (supabasePublic) {
    try {
      const { data } = await supabasePublic
        .from('posts')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false })
      posts = (data as Post[]) || []
    } catch {
      // DB 연결 실패 시 빈 목록으로 폴백
    }
  }

  return <BlogList posts={posts} />
}
