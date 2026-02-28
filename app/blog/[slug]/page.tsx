import type { Metadata } from 'next'
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

  return (
    <article className="max-w-2xl mx-auto px-6 py-16">
      {/* 헤더 */}
      <header className="mb-10">
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs font-medium text-[#c07a2f] bg-[#fdf3e3] px-2.5 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
        <h1 className="font-serif text-4xl font-bold text-[#1a1208] leading-tight mb-4">
          {post.title}
        </h1>
        {post.description && (
          <p className="text-lg text-[#7a6a52] mb-4">{post.description}</p>
        )}
        <p className="text-sm text-[#b0977a]">
          {formatDate(post.published_at ?? post.created_at)}
        </p>
      </header>

      <hr className="border-[#e8ddd0] mb-10" />

      {/* 본문 */}
      <div className="prose prose-warm max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
          {post.content}
        </ReactMarkdown>
      </div>
    </article>
  )
}
