'use client'

import { useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import type { Post } from '@/lib/types'

interface HeadingItem {
  id: string
  text: string
  level: number
}

function extractHeadings(content: string): HeadingItem[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm
  const headings: HeadingItem[] = []
  let match

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length
    const text = match[2].trim()
    const id = text
      .toLowerCase()
      .replace(/[^\w\s가-힣]/g, '')
      .replace(/\s+/g, '-')

    if (level <= 3) {
      headings.push({ id, text, level })
    }
  }

  return headings
}

export default function BlogContent({ post }: { post: Post }) {
  const headings = useMemo(() => extractHeadings(post.content), [post.content])

  const components: any = {
    h2: ({ children }: any) => {
      const text = String(children)
      const id = text
        .toLowerCase()
        .replace(/[^\w\s가-힣]/g, '')
        .replace(/\s+/g, '-')
      return (
        <h2 id={id} className="scroll-mt-20">
          {children}
        </h2>
      )
    },
    h3: ({ children }: any) => {
      const text = String(children)
      const id = text
        .toLowerCase()
        .replace(/[^\w\s가-힣]/g, '')
        .replace(/\s+/g, '-')
      return (
        <h3 id={id} className="scroll-mt-20">
          {children}
        </h3>
      )
    },
  }

  return (
    <div className="flex gap-8 flex-col lg:flex-row">
      {/* 좌측: 본문 */}
      <article className="flex-1 min-w-0">
        <div className="prose prose-warm max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, rehypeHighlight]} components={components}>
            {post.content}
          </ReactMarkdown>
        </div>
      </article>

      {/* 우측: Table of Contents (lg 이상) */}
      {headings.length > 0 && (
        <aside className="hidden lg:block lg:w-56 lg:shrink-0">
          <div className="bg-card border border-cream-400 rounded-lg p-4 sticky top-20 max-h-[calc(100vh-120px)] overflow-y-auto">
            <h3 className="font-bold text-sm text-ink-dark mb-3">목차</h3>
            <nav className="space-y-2">
              {headings.map((heading) => (
                <a
                  key={heading.id}
                  href={`#${heading.id}`}
                  className={`block text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-amber-warm hover:text-amber-warm ${
                    heading.level === 2 ? 'text-ink-light' : 'text-ink-muted ml-3'
                  }`}
                >
                  {heading.text}
                </a>
              ))}
            </nav>
          </div>
        </aside>
      )}
    </div>
  )
}
