import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { createClient } from '@/lib/supabase/server'
import ProfileSidebar from '@/components/ProfileSidebar'
import type { Post } from '@/lib/types'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: post } = await supabase
    .from('posts')
    .select('title, description')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!post) return { title: '글을 찾을 수 없습니다' }
  return {
    title: post.title,
    description: post.description ?? undefined,
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()
  const post = data as Post | null

  if (!post) notFound()

  const dateStr = post.published_at ? formatDate(post.published_at) : formatDate(post.created_at)

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex gap-5">
        {/* 좌측: 프로필 사이드바 */}
        <ProfileSidebar />

        {/* 가운데: 본문 */}
        <article className="flex-1 min-w-0">
          {/* 뒤로가기 */}
          <div className="mb-4">
            <Link href="/blog" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
              ← 목록으로
            </Link>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-8">
            {/* 헤더 */}
            <header className="mb-8">
              {post.category && (
                <p className="text-xs font-medium text-[#c07a2f] mb-2">{post.category}</p>
              )}
              <h1 className="font-bold text-2xl text-gray-900 leading-snug mb-3">
                {post.title}
              </h1>
              {post.description && (
                <p className="text-sm text-gray-500 mb-3">{post.description}</p>
              )}
              <p className="text-xs text-gray-400">{dateStr}</p>
            </header>

            <hr className="border-gray-100 mb-8" />

            {/* 본문 */}
            <div className="prose prose-warm max-w-none prose-sm">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                {post.content}
              </ReactMarkdown>
            </div>
          </div>
        </article>

        {/* 우측: 메타 정보 */}
        <aside className="w-44 shrink-0">
          <div className="bg-white border border-gray-200 rounded-lg p-4 sticky top-20">
            <h3 className="font-bold text-sm text-gray-900 mb-3">글 정보</h3>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-400 mb-1">작성일</p>
                <p className="text-xs text-gray-700">{dateStr}</p>
              </div>

              {post.category && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">카테고리</p>
                  <p className="text-xs text-[#c07a2f]">{post.category}</p>
                </div>
              )}

              {post.tags.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-2">태그</p>
                  <div className="flex flex-wrap gap-1">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs text-[#c07a2f] bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <hr className="border-gray-100 my-4" />

            <Link
              href="/blog"
              className="block text-center text-xs text-gray-500 hover:text-[#c07a2f] transition-colors"
            >
              ← 목록으로
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
