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
  const { data } = await supabasePublic
    .from('posts')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
  const posts = (data as Post[]) || []

  return <BlogList posts={posts} />
}
