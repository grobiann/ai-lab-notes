'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { revalidateBlog } from '@/lib/actions'
import type { Post } from '@/lib/types'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'

type ViewMode = 'edit' | 'split' | 'preview'

function toSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

function formatDate(date: Date) {
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function MarkdownPreview({ content }: { content: string }) {
  return content ? (
    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
      {content}
    </ReactMarkdown>
  ) : (
    <p className="text-[#b0977a] text-sm">내용을 입력하면 여기에 미리보기가 표시됩니다.</p>
  )
}

function FullPreviewModal({
  title,
  description,
  tags,
  content,
  publishedAt,
  onClose,
}: {
  title: string
  description: string
  tags: string
  content: string
  publishedAt?: string | null
  onClose: () => void
}) {
  const tagList = tags.split(',').map((t) => t.trim()).filter(Boolean)
  const dateStr = formatDate(publishedAt ? new Date(publishedAt) : new Date())

  return (
    <div className="fixed inset-0 z-50 bg-[#faf8f5] overflow-y-auto">
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-[#e8ddd0] px-6 py-3 flex items-center justify-between">
        <span className="text-sm text-[#7a6a52]">
          미리보기 — 실제 블로그 페이지와 동일하게 표시됩니다
        </span>
        <button
          onClick={onClose}
          className="text-sm font-medium text-[#2c2416] bg-[#f5ead8] hover:bg-[#ecdcc0] border border-[#d4b896] px-3 py-1.5 rounded-lg transition-colors"
        >
          ✕ 닫기
        </button>
      </div>
      <article className="max-w-2xl mx-auto px-6 py-16">
        <header className="mb-10">
          {tagList.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {tagList.map((tag) => (
                <span key={tag} className="text-xs font-medium text-[#c07a2f] bg-[#fdf3e3] px-2.5 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}
          <h1 className="font-serif text-4xl font-black text-[#1a1208] leading-tight mb-4">
            {title || <span className="text-[#b0977a]">제목 없음</span>}
          </h1>
          {description && <p className="text-lg text-[#7a6a52] mb-4">{description}</p>}
          <p className="text-sm text-[#b0977a]">{dateStr}</p>
        </header>
        <hr className="border-[#e8ddd0] mb-10" />
        <div className="prose prose-warm max-w-none">
          <MarkdownPreview content={content} />
        </div>
      </article>
    </div>
  )
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
  const [viewMode, setViewMode] = useState<ViewMode>('edit')
  const [fullPreview, setFullPreview] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState('')

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setTitle(val)
    if (!isEdit) setSlug(toSlug(val))
  }

  function insertAtCursor(text: string) {
    const textarea = textareaRef.current
    if (!textarea) {
      setContent((prev) => prev + '\n' + text + '\n')
      return
    }
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const newContent = content.slice(0, start) + text + content.slice(end)
    setContent(newContent)
    setTimeout(() => {
      textarea.selectionStart = start + text.length
      textarea.selectionEnd = start + text.length
      textarea.focus()
    }, 0)
  }

  async function uploadImage(file: File) {
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일(jpg, png, gif, webp 등)만 업로드할 수 있습니다.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('파일 크기는 5MB 이하여야 합니다.')
      return
    }
    setError('')
    setUploading(true)
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('blog-images')
      .upload(fileName, file, { cacheControl: '3600', upsert: false })
    if (uploadError) {
      setError(`이미지 업로드 실패: ${uploadError.message}`)
      setUploading(false)
      return
    }
    const { data } = supabase.storage.from('blog-images').getPublicUrl(fileName)
    const altText = file.name.replace(/\.[^.]+$/, '')
    insertAtCursor(`![${altText}](${data.publicUrl})`)
    setUploading(false)
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) uploadImage(file)
    e.target.value = ''
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) uploadImage(file)
  }

  async function handleSave(publish: boolean) {
    if (!title.trim() || !slug.trim() || !content.trim()) {
      setError('제목, 슬러그, 본문은 필수입니다.')
      return
    }
    setError('')
    setLoading(true)
    const supabase = createClient()
    const tagArray = tags.split(',').map((t) => t.trim()).filter(Boolean)
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

  const editorArea = (
    <div
      className={`relative rounded-lg transition-colors ${isDragging ? 'ring-2 ring-[#c07a2f] ring-offset-1' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className={`w-full px-4 py-3 border border-[#e8ddd0] rounded-lg text-sm focus:outline-none focus:border-[#c07a2f] bg-white font-mono leading-relaxed resize-none ${
          viewMode === 'split' ? 'h-full' : ''
        }`}
        rows={viewMode === 'split' ? undefined : 20}
        style={viewMode === 'split' ? { height: '100%' } : undefined}
        placeholder={`# 제목\n\n본문을 Markdown으로 작성하세요.\n\n이미지는 버튼으로 첨부하거나 파일을 드래그&드롭 하세요.`}
      />
      {isDragging && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#fdf3e3]/80 border-2 border-dashed border-[#c07a2f] rounded-lg pointer-events-none">
          <p className="text-sm font-medium text-[#c07a2f]">이미지를 여기에 놓으세요</p>
        </div>
      )}
    </div>
  )

  return (
    <>
      {fullPreview && (
        <FullPreviewModal
          title={title}
          description={description}
          tags={tags}
          content={content}
          publishedAt={post?.published_at}
          onClose={() => setFullPreview(false)}
        />
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileInputChange}
      />

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
            <span className="text-[#b0977a] font-normal ml-1">(URL: /blog/슬러그)</span>
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
            <span className="text-[#b0977a] font-normal ml-1">(목록 카드 + meta description)</span>
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
            <span className="text-[#b0977a] font-normal ml-1">(쉼표로 구분)</span>
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
          {/* 툴바 */}
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-[#2c2416]">
              본문 (Markdown) <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              {/* 이미지 첨부 */}
              {viewMode !== 'preview' && (
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 text-xs text-[#7a6a52] hover:text-[#2c2416] border border-[#e8ddd0] hover:border-[#c07a2f] bg-white px-2.5 py-1 rounded-md transition-colors disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <span className="inline-block w-3 h-3 border-2 border-[#c07a2f] border-t-transparent rounded-full animate-spin" />
                      업로드 중...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      이미지 첨부
                    </>
                  )}
                </button>
              )}

              {/* 보기 모드 토글 */}
              <div className="flex rounded-lg border border-[#e8ddd0] overflow-hidden text-xs">
                {(
                  [
                    { mode: 'edit', label: '편집' },
                    { mode: 'split', label: '분할' },
                    { mode: 'preview', label: '미리보기' },
                  ] as { mode: ViewMode; label: string }[]
                ).map(({ mode, label }) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setViewMode(mode)}
                    className={`px-3 py-1 transition-colors ${
                      viewMode === mode
                        ? 'bg-[#c07a2f] text-white'
                        : 'bg-white text-[#7a6a52] hover:bg-[#fdf3e3]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 편집 전용 */}
          {viewMode === 'edit' && editorArea}

          {/* 미리보기 전용 */}
          {viewMode === 'preview' && (
            <div className="min-h-[500px] p-6 border border-[#e8ddd0] rounded-lg bg-white prose prose-warm max-w-none overflow-auto">
              <MarkdownPreview content={content} />
            </div>
          )}

          {/* 분할 보기 — 뷰포트 전체 너비로 확장 */}
          {viewMode === 'split' && (
            <div
              style={{
                position: 'relative',
                left: '50%',
                right: '50%',
                marginLeft: '-50vw',
                marginRight: '-50vw',
                width: '100vw',
              }}
            >
              <div className="flex border border-[#e8ddd0] rounded-xl overflow-hidden bg-white mx-4" style={{ height: '70vh' }}>
                {/* 왼쪽: 에디터 */}
                <div
                  className="flex flex-col w-1/2 border-r border-[#e8ddd0]"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="flex items-center gap-2 px-3 py-2 border-b border-[#e8ddd0] bg-[#faf8f5]">
                    <span className="w-2 h-2 rounded-full bg-[#c07a2f] opacity-60" />
                    <span className="text-xs text-[#7a6a52] font-medium">Markdown 편집</span>
                  </div>
                  <div className="relative flex-1 overflow-hidden">
                    <textarea
                      ref={textareaRef}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="absolute inset-0 w-full h-full px-4 py-3 text-sm font-mono leading-relaxed bg-white focus:outline-none resize-none"
                      placeholder={`# 제목\n\n본문을 Markdown으로 작성하세요.\n\n이미지는 버튼으로 첨부하거나 파일을 드래그&드롭 하세요.`}
                    />
                    {isDragging && (
                      <div className="absolute inset-0 flex items-center justify-center bg-[#fdf3e3]/80 border-2 border-dashed border-[#c07a2f] pointer-events-none">
                        <p className="text-sm font-medium text-[#c07a2f]">이미지를 여기에 놓으세요</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 오른쪽: 미리보기 */}
                <div className="flex flex-col w-1/2">
                  <div className="flex items-center gap-2 px-3 py-2 border-b border-[#e8ddd0] bg-[#faf8f5]">
                    <span className="w-2 h-2 rounded-full bg-green-400 opacity-70" />
                    <span className="text-xs text-[#7a6a52] font-medium">미리보기</span>
                  </div>
                  <div className="flex-1 overflow-y-auto px-6 py-4 prose prose-warm max-w-none text-sm">
                    <MarkdownPreview content={content} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 에러 */}
        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-4 py-2.5 rounded-lg">{error}</p>
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
            <button
              type="button"
              onClick={() => setFullPreview(true)}
              className="text-sm font-medium text-[#c07a2f] border border-[#c07a2f] hover:bg-[#fdf3e3] px-4 py-2 rounded-lg transition-colors"
            >
              전체 미리보기
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
    </>
  )
}
