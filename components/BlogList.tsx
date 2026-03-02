'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import type { Post } from '@/lib/types'
import PostCard from './PostCard'

export default function BlogList({ posts }: { posts: Post[] }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // 고유한 카테고리 목록 (null 제외)
  const categories = useMemo(() => {
    const cats = posts
      .map((p) => p.category)
      .filter((cat): cat is string => cat !== null && cat !== undefined)
    return Array.from(new Set(cats)).sort()
  }, [posts])

  // 필터링된 글 목록
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      // 카테고리 필터
      if (selectedCategory && post.category !== selectedCategory) {
        return false
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

  // 카테고리별 글 개수
  const categoryCount = useMemo(() => {
    const count: Record<string, number> = {}
    posts.forEach((post) => {
      if (post.category) {
        count[post.category] = (count[post.category] ?? 0) + 1
      }
    })
    return count
  }, [posts])

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      {/* 제목 + 전체 글 수 */}
      <div className="mb-8">
        <h1 className="font-serif text-4xl font-bold tracking-tight text-[#1a1208] mb-2">
          Blog
        </h1>
        <p className="text-sm text-[#b0977a]">전체 {posts.length}개</p>
      </div>

      {/* 검색 필드 */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="제목, 설명, 태그로 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2.5 border border-[#e8ddd0] rounded-lg text-sm focus:outline-none focus:border-[#c07a2f] bg-white"
        />
      </div>

      {/* 카테고리 필터 */}
      {categories.length > 0 && (
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`text-sm font-medium px-3 py-1.5 rounded-full transition-colors ${
                selectedCategory === null
                  ? 'bg-[#c07a2f] text-white'
                  : 'bg-[#fdf3e3] text-[#c07a2f] hover:bg-[#f5e6d3]'
              }`}
            >
              전체
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-sm font-medium px-3 py-1.5 rounded-full transition-colors ${
                  selectedCategory === cat
                    ? 'bg-[#c07a2f] text-white'
                    : 'bg-[#fdf3e3] text-[#c07a2f] hover:bg-[#f5e6d3]'
                }`}
              >
                {cat} <span className="text-xs ml-1">({categoryCount[cat]})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 글 목록 또는 검색 결과 없음 */}
      {filteredPosts.length > 0 ? (
        <div className="flex flex-col gap-4">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
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
    </div>
  )
}
