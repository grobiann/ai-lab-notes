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
        className="flex gap-5 items-start px-5 py-4 bg-white border border-[#e8ddd0] hover:border-[#d4b896] rounded-lg transition-all hover:shadow-sm hover:bg-[#faf8f5]"
      >
        <div className="flex-1 min-w-0">
          <h2 className="font-serif text-base font-bold text-[#1a1208] mb-1 line-clamp-2">
            {post.title}
          </h2>
          {post.description && (
            <p className="text-sm text-[#7a6a52] line-clamp-2 mb-2">
              {post.description}
            </p>
          )}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-medium text-[#c07a2f] bg-[#fdf3e3] px-2.5 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
              {post.tags.length > 3 && (
                <span className="text-xs text-[#b0977a] pt-1">+{post.tags.length - 3}</span>
              )}
            </div>
          )}
        </div>
        <p className="text-xs text-[#b0977a] whitespace-nowrap shrink-0 pt-0.5">{dateStr}</p>
      </Link>
    )
  }

  // Compact 모드: 한 줄 최소
  if (mode === 'compact') {
    return (
      <Link
        href={`/blog/${post.slug}`}
        className="flex justify-between items-center p-3 border-b border-[#e8ddd0] hover:bg-[#faf8f5] transition-colors"
      >
        <h2 className="font-serif text-sm font-bold text-[#1a1208] truncate flex-1">
          {post.title}
        </h2>
        <p className="text-xs text-[#b0977a] ml-4 shrink-0">{dateStr}</p>
      </Link>
    )
  }

  // Card 모드 (기본): 원래 레이아웃
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="block bg-white border border-[#e8ddd0] hover:border-[#d4b896] rounded-xl p-6 transition-all hover:shadow-sm"
    >
      <div className="flex flex-wrap gap-2 mb-3">
        {post.tags.map((tag) => (
          <span
            key={tag}
            className="text-xs font-medium text-[#c07a2f] bg-[#fdf3e3] px-2.5 py-1 rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>
      <h2 className="font-serif text-xl font-bold text-[#1a1208] mb-2 leading-snug">
        {post.title}
      </h2>
      {post.description && (
        <p className="text-sm text-[#7a6a52] mb-4 line-clamp-2">
          {post.description}
        </p>
      )}
      <p className="text-xs text-[#b0977a]">{dateStr}</p>
    </Link>
  )
}
