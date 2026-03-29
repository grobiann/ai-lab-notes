import Link from 'next/link'
import { getAllPosts } from '@/lib/dynamo'

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default async function AdminPage() {
  const posts = await getAllPosts()

  const published = posts.filter((p) => p.is_published).length
  const drafts = posts.length - published

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#1a1208] mb-1">
            대시보드
          </h1>
          <p className="text-sm text-[#7a6a52]">
            발행 {published}개 · 임시저장 {drafts}개
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="text-sm font-medium text-white bg-[#c07a2f] hover:bg-[#a86828] px-4 py-2 rounded-lg transition-colors"
        >
          + 새 글
        </Link>
      </div>

      {posts.length > 0 ? (
        <div className="space-y-2">
          {posts.map((post) => (
            <div
              key={post.id}
              className="flex items-center justify-between bg-white border border-[#e8ddd0] rounded-xl px-5 py-4 hover:border-[#d4b896] transition-colors"
            >
              <div className="flex-1 min-w-0 mr-4">
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      post.is_published
                        ? 'text-green-700 bg-green-50'
                        : 'text-[#b0977a] bg-[#fdf3e3]'
                    }`}
                  >
                    {post.is_published ? '발행' : '임시저장'}
                  </span>
                  <span className="text-xs text-[#b0977a]">
                    {formatDate(post.created_at)}
                  </span>
                </div>
                <p className="text-sm font-medium text-[#1a1208] truncate">
                  {post.title}
                </p>
              </div>
              <Link
                href={`/admin/posts/${post.id}`}
                className="text-sm font-medium text-[#c07a2f] hover:text-[#a86828] whitespace-nowrap"
              >
                수정
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white border border-[#e8ddd0] rounded-xl">
          <p className="text-[#b0977a] mb-4">글이 없습니다.</p>
          <Link
            href="/admin/posts/new"
            className="text-sm font-medium text-white bg-[#c07a2f] hover:bg-[#a86828] px-4 py-2 rounded-lg transition-colors"
          >
            첫 글 작성하기
          </Link>
        </div>
      )}
    </div>
  )
}
