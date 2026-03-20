import Link from 'next/link'
import { supabasePublic } from '@/lib/supabase/public'
import PostCard from '@/components/PostCard'
import ProfileSidebar from '@/components/ProfileSidebar'
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
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex gap-5 flex-col md:flex-row">
        {/* 좌측: 프로필 사이드바 (md 이상에서 고정) */}
        <div className="md:w-52 md:shrink-0">
          <ProfileSidebar />
        </div>

        {/* 가운데: 최근 글 */}
        <main className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-ink-dark">최근 글</h2>
            <Link
              href="/blog"
              className="text-xs text-amber-warm hover:underline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-amber-warm"
            >
              전체 보기→
            </Link>
          </div>

          {posts && posts.length > 0 ? (
            <div className="flex flex-col gap-2">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} mode="compact" />
              ))}
            </div>
          ) : (
            <div className="bg-card border border-cream-400 rounded-lg p-8 text-center">
              <p className="text-ink-muted text-sm">아직 글이 없습니다.</p>
            </div>
          )}
        </main>

        {/* 우측: 카테고리 (md 이상에서 표시) */}
        <aside className="md:w-44 md:shrink-0">
          <div className="bg-card border border-cream-400 rounded-lg p-4 mb-3">
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

          {/* 태그 바로가기 */}
          <div className="bg-card border border-cream-400 rounded-lg p-4">
            <h3 className="font-bold text-sm text-ink-dark mb-2">바로가기</h3>
            <Link href="/projects" className="block text-xs text-ink-light hover:text-amber-warm py-1 transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-amber-warm">
              🗂 프로젝트
            </Link>
            <Link href="/about" className="block text-xs text-ink-light hover:text-amber-warm py-1 transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-amber-warm">
              👤 소개
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
