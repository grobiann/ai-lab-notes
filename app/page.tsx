import Link from 'next/link'
import { supabasePublic } from '@/lib/supabase/public'
import PostCard from '@/components/PostCard'
import type { Post } from '@/lib/types'

export const revalidate = 3600

interface CategoryNode {
  name: string
  path: string
  children: CategoryNode[]
  count: number
}

function buildCategoryTree(posts: { id: string; category: string | null }[]): CategoryNode[] {
  const countMap: Record<string, number> = {}
  posts.forEach((p) => {
    if (!p.category) return
    const parts = p.category.split('/')
    parts.forEach((_, i) => {
      const path = parts.slice(0, i + 1).join('/')
      countMap[path] = (countMap[path] ?? 0) + (i === parts.length - 1 ? 1 : 0)
    })
  })
  // 부모 카테고리 집계
  Object.keys(countMap).forEach((cat) => {
    const parts = cat.split('/')
    for (let i = 1; i < parts.length; i++) {
      const parent = parts.slice(0, i).join('/')
      countMap[parent] = (countMap[parent] ?? 0) + countMap[cat]
    }
  })

  const root = new Map<string, CategoryNode>()
  const allCats = posts
    .map((p) => p.category)
    .filter((c): c is string => !!c)
  const unique = Array.from(new Set(allCats)).sort()

  unique.forEach((cat) => {
    const parts = cat.split('/')
    let currentPath = ''
    parts.forEach((part, index) => {
      currentPath = currentPath ? `${currentPath}/${part}` : part
      if (!root.has(currentPath)) {
        const node: CategoryNode = { name: part, path: currentPath, children: [], count: countMap[currentPath] ?? 0 }
        if (index === 0) {
          root.set(currentPath, node)
        } else {
          const parentPath = parts.slice(0, index).join('/')
          root.get(parentPath)?.children.push(node)
        }
      }
    })
  })

  return Array.from(root.values()).sort((a, b) => a.name.localeCompare(b.name))
}

export default async function HomePage() {
  let recentData: Post[] | null = null
  let catData: { id: string; category: string | null }[] | null = null

  if (supabasePublic) {
    try {
      const [recentRes, catRes] = await Promise.all([
        supabasePublic
          .from('posts')
          .select('*')
          .eq('is_published', true)
          .order('published_at', { ascending: false })
          .limit(8),
        supabasePublic
          .from('posts')
          .select('id, category')
          .eq('is_published', true),
      ])
      recentData = recentRes.data as Post[] | null
      catData = catRes.data as { id: string; category: string | null }[] | null
    } catch {
      // DB 연결 실패 시 빈 목록으로 폴백
    }
  }

  const posts = recentData
  const categoryTree = buildCategoryTree((catData ?? []) as { id: string; category: string | null }[])
  const totalPosts = (catData ?? []).length

  const renderNode = (node: CategoryNode, depth = 0): React.ReactNode => (
    <div key={node.path}>
      <Link
        href={`/blog`}
        className="flex justify-between items-center text-xs text-ink-light hover:text-amber-warm py-1 transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-amber-warm"
        style={{ paddingLeft: `${depth * 10}px` }}
      >
        <span>{node.name}</span>
        <span className="text-ink-muted">({node.count})</span>
      </Link>
      {node.children.map((child) => renderNode(child, depth + 1))}
    </div>
  )

  return (
    <div className="bg-body min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* 헤더: 페이지 제목 */}
        <div className="mb-12">
          <h1 className="font-bold text-4xl text-ink-dark mb-3">최근 글</h1>
          <p className="text-ink-light text-sm">
            {posts?.length ?? 0}개의 글이 있습니다
          </p>
        </div>

        <div className="flex gap-8 flex-col lg:flex-row">
          {/* 중앙: 최근 글 목록 */}
          <main className="flex-1 min-w-0">
            {posts && posts.length > 0 ? (
              <div className="flex flex-col gap-3">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} mode="list" />
                ))}
              </div>
            ) : (
              <div className="bg-card border border-cream-400 rounded-lg p-12 text-center">
                <p className="text-ink-muted text-sm">아직 글이 없습니다.</p>
              </div>
            )}

            {/* 전체 보기 버튼 */}
            {posts && posts.length > 0 && (
              <div className="mt-8 text-center">
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 px-6 py-2 bg-amber-pale text-amber-warm hover:bg-amber-light hover:text-white transition-all rounded-lg font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-warm"
                >
                  전체 글 보기
                  <span>→</span>
                </Link>
              </div>
            )}
          </main>

          {/* 우측: 카테고리 (lg 이상에서 표시) */}
          <aside className="lg:w-56 lg:shrink-0">
            <div className="bg-card border border-cream-400 rounded-lg p-4 sticky top-20">
              <h3 className="font-bold text-sm text-ink-dark mb-3">카테고리</h3>
              <Link
                href="/blog"
                className="flex justify-between items-center text-xs text-ink-light hover:text-amber-warm py-1 transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-amber-warm"
              >
                <span>전체</span>
                <span className="text-ink-muted">({totalPosts})</span>
              </Link>
              {categoryTree.length > 0 ? (
                <div className="mt-1 space-y-0.5">
                  {categoryTree.map((node) => renderNode(node))}
                </div>
              ) : (
                <p className="text-xs text-ink-muted mt-2">카테고리 없음</p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
