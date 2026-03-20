'use client'

import { useState, useMemo } from 'react'
import type { Post } from '@/lib/types'
import PostCard from './PostCard'

export default function BlogList({ posts }: { posts: Post[] }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'compact' | 'card'>('list')
  const [showCategories, setShowCategories] = useState(false)

  const categories = useMemo(() => {
    const cats = posts
      .map((p) => p.category)
      .filter((cat): cat is string => cat !== null && cat !== undefined)
    return Array.from(new Set(cats)).sort()
  }, [posts])

  interface CategoryNode {
    name: string
    path: string
    children: CategoryNode[]
  }

  const categoryTree = useMemo(() => {
    const root: Map<string, CategoryNode> = new Map()
    categories.forEach((cat) => {
      const parts = cat.split('/')
      let currentPath = ''
      parts.forEach((part, index) => {
        currentPath = currentPath ? `${currentPath}/${part}` : part
        if (!root.has(currentPath)) {
          const node: CategoryNode = { name: part, path: currentPath, children: [] }
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
  }, [categories])

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      if (selectedCategory) {
        if (!post.category) return false
        const isExactMatch = post.category === selectedCategory
        const isChildMatch = post.category.startsWith(selectedCategory + '/')
        if (!isExactMatch && !isChildMatch) return false
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const titleMatch = post.title.toLowerCase().includes(query)
        const descMatch = post.description?.toLowerCase().includes(query) ?? false
        const tagsMatch = post.tags.some((tag) => tag.toLowerCase().includes(query))
        return titleMatch || descMatch || tagsMatch
      }
      return true
    })
  }, [posts, searchQuery, selectedCategory])

  const categoryCount = useMemo(() => {
    const count: Record<string, number> = {}
    posts.forEach((post) => {
      if (post.category) {
        count[post.category] = (count[post.category] ?? 0) + 1
      }
    })
    const parents = new Set<string>()
    Object.keys(count).forEach((cat) => {
      const parts = cat.split('/')
      for (let i = 1; i < parts.length; i++) {
        parents.add(parts.slice(0, i).join('/'))
      }
    })
    parents.forEach((parent) => {
      count[parent] = Object.entries(count).reduce((sum, [cat, num]) => {
        if (cat === parent || cat.startsWith(parent + '/')) return sum + num
        return sum
      }, 0)
    })
    return count
  }, [posts])

  const renderCategoryNode = (node: CategoryNode, depth: number = 0): React.ReactNode => (
    <div key={node.path}>
      <button
        onClick={() => setSelectedCategory(node.path)}
        className={`w-full text-left text-xs px-2 py-1.5 rounded transition-colors flex justify-between items-center focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-amber-warm ${
          selectedCategory === node.path
            ? 'bg-amber-warm text-white font-medium'
            : 'text-ink-light hover:bg-cream-100 hover:text-ink-dark'
        }`}
        style={{ paddingLeft: `${8 + depth * 12}px` }}
      >
        <span>{node.name}</span>
        <span className="opacity-70">({categoryCount[node.path] || 0})</span>
      </button>
      {node.children.map((child) => renderCategoryNode(child, depth + 1))}
    </div>
  )

  return (
    <div className="bg-body min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 상단 헤더 + 검색 */}
        <div className="mb-8">
          {/* 토글 버튼들 */}
          <div className="flex items-center gap-3 mb-6">
            {/* 모바일: 카테고리 토글 */}
            <button
              onClick={() => setShowCategories(!showCategories)}
              className="md:hidden px-3 py-2 text-xs font-medium text-ink-light border border-cream-400 rounded hover:bg-cream-100 transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-amber-warm"
            >
              카테고리 {showCategories ? '▲' : '▼'}
            </button>
            {/* 뷰 모드 토글 */}
          </div>
          <div className="flex gap-1 mb-6">
            {[
              { mode: 'compact' as const, icon: '−', label: 'Compact' },
              { mode: 'list' as const, icon: '≡', label: 'List' },
              { mode: 'card' as const, icon: '⊞', label: 'Card' },
            ].map(({ mode, icon, label }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                title={label}
                className={`w-9 h-9 flex items-center justify-center text-sm font-medium transition-colors rounded border focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-amber-warm ${
                  viewMode === mode
                    ? 'bg-amber-pale text-amber-warm border-amber-warm'
                    : 'border-cream-400 text-ink-light hover:text-ink-dark hover:border-cream-300'
                }`}
              >
                {icon}
              </button>
            ))}
          </div>

          {/* 검색 */}
          <input
            type="text"
            placeholder="제목·설명·태그로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2.5 border border-cream-400 rounded-lg text-sm bg-card text-ink-dark placeholder-ink-muted transition-all focus:outline-2 focus:outline-amber-warm focus:outline-offset-1 focus:bg-cream-50"
          />
        </div>

        <div className="flex gap-8 flex-col md:flex-row">
          {/* 좌측: 카테고리 목차 (md 이상에서 항상 표시, 모바일에서는 토글) */}
          <aside className={`md:w-40 md:shrink-0 ${showCategories ? 'block' : 'hidden'} md:block`}>
            <div className="md:sticky md:top-20">
              <h3 className="font-bold text-sm text-ink-dark mb-3">카테고리</h3>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full text-left text-xs px-3 py-2 rounded transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-amber-warm ${
                    selectedCategory === null
                      ? 'bg-amber-pale text-amber-warm font-semibold'
                      : 'text-ink-light hover:bg-cream-100 hover:text-ink-dark'
                  }`}
                >
                  전체 ({posts.length})
                </button>
                {categoryTree.map((node) => renderCategoryNode(node))}
              </div>
            </div>
          </aside>

          {/* 중앙: 글 목록 */}
          <main className="flex-1 min-w-0">
            {filteredPosts.length > 0 ? (
              <div className={viewMode === 'card' ? 'grid grid-cols-1 gap-4' : 'space-y-3'}>
                {filteredPosts.map((post) => (
                  <PostCard key={post.id} post={post} mode={viewMode} />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <p className="text-ink-muted text-sm">
                  {searchQuery || selectedCategory ? '검색 결과가 없습니다.' : '아직 글이 없습니다.'}
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
