import type { Metadata } from 'next'
import { getPublishedPosts } from '@/lib/dynamo'
import BlogList from '@/components/BlogList'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Blog',
  description: 'AI·개발 학습 블로그 글 목록',
}

export default async function BlogPage() {
  let posts = []
  try {
    posts = await getPublishedPosts()
  } catch {
    // DB 연결 실패 시 빈 목록으로 폴백
  }

  return <BlogList posts={posts} />
}
