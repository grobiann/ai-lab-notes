'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { revalidateBlog } from '@/lib/actions'
import type { Post } from '@/lib/types'

function toSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export default function PostForm({ post }: { post?: Post }) {
  const router = useRouter()
  const isEdit = !!post

  const [title, setTitle] = useState(post?.title ?? '')
  const [slug, setSlug] = useState(post?.slug ?? '')
  const [description, setDescription] = useState(post?.description ?? '')
  const [tags, setTags] = useState(post?.tags?.join(', ') ?? '')
  const [content, setContent] = useState(post?.content ?? '')
  const [isPublished, setIsPublished] = useState(post?.is_published ?? false)
  const [preview, setPreview] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setTitle(val)
    if (!isEdit) setSlug(toSlug(val))
  }

  async function handleSave(publish: boolean) {
    if (!title.trim() || !slug.trim() || !content.trim()) {
      setError('제목, 슬러그, 본문은 필수입니다.')
      return
    }
    setError('')
    setLoading(true)

    const supabase = createClient()
    const tagArray = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      description: description.trim() || null,
      content: content.trim(),
      tags: tagArray,
      is_published: publish,
      published_at: publish ? (post?.published_at ?? new Date().toISOString()) : null,
      updated_at: new Date().toISOString(),
    }

    let err
    if (isEdit) {
      const result = await supabase.from('posts').update(payload).eq('id', post.id)
      err = result.error
    } else {
      const result = await supabase.from('posts').insert(payload)
      err = result.error
    }

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    await revalidateBlog()
    router.push('/admin')
    router.refresh()
  }

  async function handleDelete() {
    if (!post || !confirm('정말 삭제하시겠습니까?')) return
    setLoading(true)
    const supabase = createClient()
    await supabase.from('posts').delete().eq('id', post.id)
    await revalidateBlog()
    router.push('/admin')
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {/* 제목 */}
      <div>
        <label className="block text-sm font-medium text-[#2c2416] mb-1">
          제목 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          className="w-full px-4 py-2.5 border border-[#e8ddd0] rounded-lg text-sm focus:outline-none focus:border-[#c07a2f] bg-white font-serif text-lg"
          placeholder="글 제목"
        />
      </div>

      {/* 슬러그 */}
      <div>
        <label className="block text-sm font-medium text-[#2c2416] mb-1">
          슬러그 <span className="text-red-500">*</span>
          <span className="text-[#b0977a] font-normal ml-1">
            (URL: /blog/슬러그)
          </span>
        </label>
        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="w-full px-4 py-2.5 border border-[#e8ddd0] rounded-lg text-sm focus:outline-none focus:border-[#c07a2f] bg-white font-mono"
          placeholder="my-post-title"
        />
      </div>

      {/* 설명 */}
      <div>
        <label className="block text-sm font-medium text-[#2c2416] mb-1">
          설명
          <span className="text-[#b0977a] font-normal ml-1">
            (목록 카드 + meta description)
          </span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full px-4 py-2.5 border border-[#e8ddd0] rounded-lg text-sm focus:outline-none focus:border-[#c07a2f] bg-white resize-none"
          placeholder="1~2문장 요약"
        />
      </div>

      {/* 태그 */}
      <div>
        <label className="block text-sm font-medium text-[#2c2416] mb-1">
          태그
          <span className="text-[#b0977a] font-normal ml-1">
            (쉼표로 구분)
          </span>
        </label>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="w-full px-4 py-2.5 border border-[#e8ddd0] rounded-lg text-sm focus:outline-none focus:border-[#c07a2f] bg-white"
          placeholder="Unity, C#, AI"
        />
      </div>

      {/* 본문 */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium text-[#2c2416]">
            본문 (Markdown) <span className="text-red-500">*</span>
          </label>
          <button
            type="button"
            onClick={() => setPreview(!preview)}
            className="text-xs text-[#c07a2f] hover:text-[#a86828]"
          >
            {preview ? '편집 모드' : '미리보기'}
          </button>
        </div>
        {preview ? (
          <div className="min-h-[400px] p-4 border border-[#e8ddd0] rounded-lg bg-white prose prose-warm max-w-none text-sm overflow-auto">
            {content || <span className="text-[#b0977a]">내용을 입력하세요</span>}
          </div>
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={20}
            className="w-full px-4 py-3 border border-[#e8ddd0] rounded-lg text-sm focus:outline-none focus:border-[#c07a2f] bg-white resize-y font-mono leading-relaxed"
            placeholder="# 제목&#10;&#10;본문을 Markdown으로 작성하세요."
          />
        )}
      </div>

      {/* 에러 */}
      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-4 py-2.5 rounded-lg">
          {error}
        </p>
      )}

      {/* 버튼 */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={() => handleSave(false)}
            className="text-sm font-medium text-[#2c2416] bg-[#f5ead8] hover:bg-[#ecdcc0] border border-[#d4b896] disabled:opacity-60 px-4 py-2 rounded-lg transition-colors"
          >
            임시저장
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => handleSave(true)}
            className="text-sm font-medium text-white bg-[#c07a2f] hover:bg-[#a86828] disabled:opacity-60 px-4 py-2 rounded-lg transition-colors"
          >
            {isEdit && isPublished ? '저장' : '발행'}
          </button>
        </div>
        {isEdit && (
          <button
            type="button"
            disabled={loading}
            onClick={handleDelete}
            className="text-sm text-red-500 hover:text-red-700 disabled:opacity-60"
          >
            삭제
          </button>
        )}
      </div>
    </div>
  )
}
