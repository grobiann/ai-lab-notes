import Link from 'next/link'
import type { Post } from '@/lib/types'

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

type PostCardMode = 'list' | 'compact' | 'card'

interface PostCardProps {
  post: Post
  mode?: PostCardMode
}

export default function PostCard({ post, mode = 'card' }: PostCardProps) {
  const dateStr = post.published_at ? formatDate(post.published_at) : formatDate(post.created_at)

  // List 모드: 가로 레이아웃
  if (mode === 'list') {
    return (
      <Link
        href={`/blog/${post.slug}`}
        className="flex gap-5 items-start px-4 sm:px-6 py-5 bg-card border border-cream-400 hover:border-cream-500 rounded-lg transition-all hover:shadow-sm hover:bg-cream-50 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-amber-warm"
      >
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-sm text-ink-dark mb-1 line-clamp-2 leading-snug">
            {post.title}
          </h2>
          {post.description && (
            <p className="text-sm text-ink-light line-clamp-2 mb-2 leading-relaxed">
              {post.description}
            </p>
          )}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-medium text-amber-warm bg-amber-pale px-2.5 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
              {post.tags.length > 3 && (
                <span className="text-xs text-ink-muted pt-1">+{post.tags.length - 3}</span>
              )}
            </div>
          )}
        </div>
        <p className="text-xs text-ink-muted whitespace-nowrap shrink-0 pt-0.5">{dateStr}</p>
      </Link>
    )
  }

  // Compact 모드: 한 줄 최소
  if (mode === 'compact') {
    return (
      <Link
        href={`/blog/${post.slug}`}
        className="flex justify-between items-center px-3 py-2 border-b border-cream-300 hover:bg-cream-50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-amber-warm"
      >
        <h2 className="font-sans text-sm text-ink-dark truncate flex-1">
          {post.title}
        </h2>
        <p className="text-xs text-ink-muted ml-4 shrink-0">{dateStr}</p>
      </Link>
    )
  }

  // Card 모드 (기본): 원래 레이아웃
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="block bg-card border border-cream-400 hover:border-cream-500 rounded-xl p-6 transition-all hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-amber-warm"
    >
      <div className="flex flex-wrap gap-2 mb-3">
        {post.tags.map((tag) => (
          <span
            key={tag}
            className="text-xs font-medium text-amber-warm bg-amber-pale px-2.5 py-1 rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>
      <h2 className="font-semibold text-ink-dark mb-2 leading-snug">
        {post.title}
      </h2>
      {post.description && (
        <p className="text-sm text-ink-light mb-4 line-clamp-2">
          {post.description}
        </p>
      )}
      <p className="text-xs text-ink-muted">{dateStr}</p>
    </Link>
  )
}
