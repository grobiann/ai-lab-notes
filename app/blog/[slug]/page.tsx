import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { createClient } from '@/lib/supabase/server'
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
    <div className="bg-body min-h-screen py-8">
      <article className="max-w-4xl mx-auto px-4">
        {/* 뒤로가기 */}
        <div className="mb-6">
          <Link href="/blog" className="inline-flex items-center gap-1 text-xs text-ink-light hover:text-amber-warm transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-amber-warm">
            ← 블로그 목록
          </Link>
        </div>

        {/* 헤더 */}
        <header className="mb-8 pb-8 border-b border-cream-400">
          {post.category && (
            <p className="text-xs font-semibold text-amber-warm mb-3 uppercase tracking-wider">{post.category}</p>
          )}

          <h1 className="font-bold text-4xl text-ink-dark leading-snug mb-4">
            {post.title}
          </h1>

          {post.description && (
            <p className="text-lg text-ink-light mb-4 leading-relaxed">
              {post.description}
            </p>
          )}

          {/* 메타데이터 */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <time dateTime={post.published_at || post.created_at} className="text-xs text-ink-muted">
              {dateStr}
            </time>
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs text-amber-warm bg-amber-pale px-2.5 py-1 rounded-full font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* 본문 */}
        <div className="prose prose-warm max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
            {post.content}
          </ReactMarkdown>
        </div>

        {/* 하단 네비게이션 */}
        <div className="mt-16 pt-8 border-t border-cream-400">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1 text-sm text-amber-warm hover:text-amber-light transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-amber-warm font-medium"
          >
            ← 블로그 목록으로
          </Link>
        </div>
      </article>
    </div>
  )
}
