'use client'

import { useState, useMemo } from 'react'
import type { Post } from '@/lib/types'
import PostCard from './PostCard'

export default function BlogList({ posts }: { posts: Post[] }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

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
            ? 'bg-[#c07a2f] text-white font-medium'
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
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 상단 헤더 + 검색 */}
        <div className="mb-8">
          <h1 className="font-bold text-4xl text-gray-900 mb-2">블로그</h1>
          <p className="text-gray-600 text-sm mb-4">
            {filteredPosts.length !== posts.length
              ? `${filteredPosts.length} / 전체 ${posts.length}개`
              : `전체 ${posts.length}개`}
          </p>

          {/* 검색 */}
          <input
            type="text"
            placeholder="제목·설명·태그로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#c07a2f] bg-white"
          />
        </div>

        <div className="flex gap-8">
          {/* 좌측: 카테고리 목차 */}
          <aside className="w-40 shrink-0">
            <div className="sticky top-20">
              <h3 className="font-bold text-sm text-gray-900 mb-3">카테고리</h3>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full text-left text-xs px-3 py-2 rounded transition-colors ${
                    selectedCategory === null
                      ? 'bg-gray-100 text-[#c07a2f] font-semibold'
                      : 'text-gray-600 hover:text-gray-900'
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
              <div className="space-y-3">
                {filteredPosts.map((post) => (
                  <PostCard key={post.id} post={post} mode="list" />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <p className="text-gray-400 text-sm">
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
