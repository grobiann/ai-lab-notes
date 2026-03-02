import Link from 'next/link'
import type { Post } from '@/lib/types'

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function PostCard({ post }: { post: Post }) {
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
      <p className="text-xs text-[#b0977a]">
        {post.published_at ? formatDate(post.published_at) : formatDate(post.created_at)}
      </p>
    </Link>
  )
}
