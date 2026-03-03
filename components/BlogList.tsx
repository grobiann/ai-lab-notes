'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import type { Post } from '@/lib/types'
import PostCard from './PostCard'

type ViewMode = 'list' | 'compact' | 'card'

export default function BlogList({ posts }: { posts: Post[] }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('compact')

  // 고유한 카테고리 목록 (null 제외)
  const categories = useMemo(() => {
    const cats = posts
      .map((p) => p.category)
      .filter((cat): cat is string => cat !== null && cat !== undefined)
    return Array.from(new Set(cats)).sort()
  }, [posts])

  // 카테고리 트리 구조 구성
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
            const parent = root.get(parentPath)
            if (parent) {
              parent.children.push(node)
            }
          }
        }
      })
    })

    return Array.from(root.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [categories])

  // 필터링된 글 목록
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      // 카테고리 필터: 선택된 카테고리 또는 그 자식 카테고리 포함
      if (selectedCategory) {
        // 카테고리가 없으면 제외
        if (!post.category) {
          return false
        }
        const isExactMatch = post.category === selectedCategory
        const isChildMatch = post.category.startsWith(selectedCategory + '/')
        if (!isExactMatch && !isChildMatch) {
          return false
        }
      }

      // 검색 필터 (제목 + 설명 + 태그)
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

  // 카테고리별 글 개수 (자식 카테고리 포함)
  const categoryCount = useMemo(() => {
    const count: Record<string, number> = {}
    posts.forEach((post) => {
      if (post.category) {
        count[post.category] = (count[post.category] ?? 0) + 1
      }
    })

    // 부모 카테고리의 개수를 자식 카테고리 포함으로 업데이트
    const parents = new Set<string>()
    Object.keys(count).forEach((cat) => {
      const parts = cat.split('/')
      for (let i = 1; i < parts.length; i++) {
        const parentPath = parts.slice(0, i).join('/')
        parents.add(parentPath)
      }
    })

    parents.forEach((parent) => {
      const childCount = Object.entries(count).reduce((sum, [cat, num]) => {
        if (cat === parent || cat.startsWith(parent + '/')) {
          return sum + num
        }
        return sum
      }, 0)
      count[parent] = childCount
    })

    return count
  }, [posts])

  // 트리 노드 렌더링 함수
  const renderCategoryNode = (node: CategoryNode, depth: number = 0) => (
    <div key={node.path}>
      <button
        onClick={() => setSelectedCategory(node.path)}
        className={`w-full text-left text-sm px-3 py-1 rounded-lg transition-colors flex justify-between items-center ${
          selectedCategory === node.path
            ? 'bg-[#c07a2f] text-white font-medium'
            : 'text-[#7a6a52] hover:bg-[#faf8f5]'
        }`}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
      >
        <span>{node.name}</span>
        <span className="text-xs opacity-75">({categoryCount[node.path] || 0})</span>
      </button>
      {node.children.map((child) => renderCategoryNode(child, depth + 1))}
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="flex gap-8">
        {/* 좌측 사이드바 */}
        <aside className="w-56 shrink-0">
          {/* 검색 필드 */}
          <div className="mb-8">
            <h3 className="font-serif text-sm font-bold text-[#1a1208] mb-3">검색</h3>
            <input
              type="text"
              placeholder="검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 border border-[#e8ddd0] rounded-lg text-sm focus:outline-none focus:border-[#c07a2f] bg-white"
            />
          </div>

          {/* 카테고리 필터 */}
          {categories.length > 0 && (
            <div>
              <h3 className="font-serif text-sm font-bold text-[#1a1208] mb-3">카테고리</h3>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full text-left text-sm px-3 py-1 rounded-lg transition-colors flex justify-between items-center ${
                    selectedCategory === null
                      ? 'bg-[#c07a2f] text-white font-medium'
                      : 'text-[#7a6a52] hover:bg-[#faf8f5]'
                  }`}
                >
                  <span>전체</span>
                  <span className="text-xs opacity-75">({posts.length})</span>
                </button>
                {categoryTree.map((node) => renderCategoryNode(node))}
              </div>
            </div>
          )}
        </aside>

        {/* 우측 메인 */}
        <main className="flex-1 min-w-0">
          {/* 헤더 + 보기모드 토글 */}
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <h1 className="font-serif text-5xl font-black tracking-tight text-[#1a1208] mb-2">
                Blog
              </h1>
              <p className="text-sm text-[#b0977a]">
                {filteredPosts.length > 0
                  ? `${filteredPosts.length}개 (전체 ${posts.length}개)`
                  : `전체 ${posts.length}개`}
              </p>
            </div>

            {/* 보기모드 토글 버튼 */}
            <div className="flex gap-2 bg-[#fdf3e3] rounded-lg p-1 shrink-0">
              <button
                onClick={() => setViewMode('list')}
                title="목록 보기"
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white shadow-sm text-[#c07a2f]'
                    : 'text-[#b0977a] hover:text-[#7a6a52]'
                }`}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" />
                  <line x1="3" y1="12" x2="3.01" y2="12" />
                  <line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('compact')}
                title="압축 보기"
                className={`p-2 rounded transition-colors ${
                  viewMode === 'compact'
                    ? 'bg-white shadow-sm text-[#c07a2f]'
                    : 'text-[#b0977a] hover:text-[#7a6a52]'
                }`}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <circle cx="4" cy="6" r="1" />
                  <circle cx="4" cy="12" r="1" />
                  <circle cx="4" cy="18" r="1" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('card')}
                title="카드 보기"
                className={`p-2 rounded transition-colors ${
                  viewMode === 'card'
                    ? 'bg-white shadow-sm text-[#c07a2f]'
                    : 'text-[#b0977a] hover:text-[#7a6a52]'
                }`}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
              </button>
            </div>
          </div>

          {/* 글 목록 또는 검색 결과 없음 */}
          {filteredPosts.length > 0 ? (
            <div
              className={
                viewMode === 'list'
                  ? 'flex flex-col gap-3'
                  : viewMode === 'compact'
                    ? 'flex flex-col'
                    : 'grid grid-cols-2 gap-4'
              }
            >
              {filteredPosts.map((post) => (
                <PostCard key={post.id} post={post} mode={viewMode} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-[#b0977a]">
                {searchQuery || selectedCategory
                  ? '검색 결과가 없습니다.'
                  : '아직 글이 없습니다.'}
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
