'use client'

import { useState, useMemo } from 'react'
import type { Post } from '@/lib/types'
import PostCard from './PostCard'
import ProfileSidebar from './ProfileSidebar'

type ViewMode = 'list' | 'compact' | 'card'

export default function BlogList({ posts }: { posts: Post[] }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('compact')

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
        className={`w-full text-left text-xs px-2 py-1.5 rounded transition-colors flex justify-between items-center ${
          selectedCategory === node.path
            ? 'bg-indigo text-white font-medium'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
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
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex gap-5">
        {/* 좌측: 프로필 + 검색 */}
        <div className="w-48 shrink-0">
          <ProfileSidebar />
          <div className="mt-3 bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-bold text-sm text-gray-900 mb-2">검색</h3>
            <input
              type="text"
              placeholder="제목·설명·태그..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:border-indigo bg-white"
            />
          </div>
        </div>

        {/* 가운데: 글 목록 */}
        <main className="flex-1 min-w-0">
          {/* 헤더 + 보기모드 */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="font-bold text-lg text-gray-900">블로그</h1>
              <p className="text-xs text-gray-400 mt-0.5">
                {filteredPosts.length !== posts.length
                  ? `${filteredPosts.length} / 전체 ${posts.length}개`
                  : `전체 ${posts.length}개`}
              </p>
            </div>
            {/* 보기모드 토글 */}
            <div className="flex gap-1 bg-gray-100 rounded p-0.5">
              {([
                { mode: 'list' as ViewMode, title: '목록', icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" />
                    <line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" />
                    <line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
                  </svg>
                )},
                { mode: 'compact' as ViewMode, title: '압축', icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" />
                    <line x1="8" y1="18" x2="21" y2="18" /><circle cx="4" cy="6" r="1" />
                    <circle cx="4" cy="12" r="1" /><circle cx="4" cy="18" r="1" />
                  </svg>
                )},
                { mode: 'card' as ViewMode, title: '카드', icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                  </svg>
                )},
              ]).map(({ mode, title, icon }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  title={title}
                  className={`p-1.5 rounded transition-colors ${
                    viewMode === mode
                      ? 'bg-white shadow-sm text-indigo'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {filteredPosts.length > 0 ? (
            <div className={
              viewMode === 'list'
                ? 'flex flex-col gap-2'
                : viewMode === 'compact'
                  ? 'flex flex-col bg-white border border-gray-200 rounded-lg overflow-hidden'
                  : 'grid grid-cols-2 gap-3'
            }>
              {filteredPosts.map((post) => (
                <PostCard key={post.id} post={post} mode={viewMode} />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg py-16 text-center">
              <p className="text-gray-400 text-sm">
                {searchQuery || selectedCategory ? '검색 결과가 없습니다.' : '아직 글이 없습니다.'}
              </p>
            </div>
          )}
        </main>

        {/* 우측: 카테고리 */}
        <aside className="w-44 shrink-0">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-bold text-sm text-gray-900 mb-3">카테고리</h3>
            <div className="space-y-0.5">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`w-full text-left text-xs px-2 py-1.5 rounded transition-colors flex justify-between items-center ${
                  selectedCategory === null
                    ? 'bg-indigo text-white font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span>전체</span>
                <span className="opacity-70">({posts.length})</span>
              </button>
              {categoryTree.map((node) => renderCategoryNode(node))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
