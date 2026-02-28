'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Project } from '@/lib/types'

type Props = {
  project?: Project
}

export default function ProjectForm({ project }: Props) {
  const router = useRouter()
  const isEdit = !!project

  const [title, setTitle] = useState(project?.title ?? '')
  const [company, setCompany] = useState(project?.company ?? '')
  const [period, setPeriod] = useState(project?.period ?? '')
  const [description, setDescription] = useState(project?.description ?? '')
  const [tagsInput, setTagsInput] = useState(project?.tags.join(', ') ?? '')
  const [type, setType] = useState<'work' | 'personal'>(project?.type ?? 'work')
  const [github, setGithub] = useState(project?.github ?? '')
  const [demo, setDemo] = useState(project?.demo ?? '')
  const [displayOrder, setDisplayOrder] = useState(project?.display_order ?? 0)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  const parseTags = (input: string) =>
    input.split(',').map((t) => t.trim()).filter(Boolean)

  async function handleSave() {
    if (!title.trim() || !description.trim()) {
      setError('제목과 설명은 필수입니다.')
      return
    }
    setSaving(true)
    setError('')
    const supabase = createClient()
    const payload = {
      title: title.trim(),
      company: company.trim() || null,
      period: period.trim() || null,
      description: description.trim(),
      tags: parseTags(tagsInput),
      type,
      github: github.trim() || null,
      demo: demo.trim() || null,
      display_order: displayOrder,
      updated_at: new Date().toISOString(),
    }

    let err
    if (isEdit) {
      ;({ error: err } = await supabase.from('projects').update(payload).eq('id', project.id))
    } else {
      ;({ error: err } = await supabase.from('projects').insert(payload))
    }

    setSaving(false)
    if (err) { setError(err.message); return }
    router.push('/admin/projects')
    router.refresh()
  }

  async function handleDelete() {
    if (!confirm('정말 삭제하시겠습니까?')) return
    setDeleting(true)
    const supabase = createClient()
    const { error: err } = await supabase.from('projects').delete().eq('id', project!.id)
    setDeleting(false)
    if (err) { setError(err.message); return }
    router.push('/admin/projects')
    router.refresh()
  }

  const inputClass =
    'w-full border border-[#e8ddd0] rounded-lg px-3 py-2 text-sm text-[#2c2416] bg-white focus:outline-none focus:border-[#c07a2f]'
  const labelClass = 'block text-xs font-semibold text-[#7a6a52] mb-1'

  return (
    <div className="max-w-xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-2xl font-bold text-[#1a1208]">
          {isEdit ? '프로젝트 수정' : '새 프로젝트'}
        </h1>
        {isEdit && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-sm text-red-500 hover:text-red-700 transition-colors"
          >
            {deleting ? '삭제 중...' : '삭제'}
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-4">
        {/* 타입 */}
        <div>
          <label className={labelClass}>구분</label>
          <div className="flex gap-3">
            {(['work', 'personal'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  type === t
                    ? 'bg-[#c07a2f] text-white border-[#c07a2f]'
                    : 'text-[#7a6a52] border-[#e8ddd0] hover:border-[#c07a2f]'
                }`}
              >
                {t === 'work' ? '회사' : '개인'}
              </button>
            ))}
          </div>
        </div>

        {/* 제목 */}
        <div>
          <label className={labelClass}>제목 *</label>
          <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="프로젝트 이름" />
        </div>

        {/* 회사 / 기간 */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className={labelClass}>회사</label>
            <input className={inputClass} value={company} onChange={(e) => setCompany(e.target.value)} placeholder="회사명 (선택)" />
          </div>
          <div className="flex-1">
            <label className={labelClass}>기간</label>
            <input className={inputClass} value={period} onChange={(e) => setPeriod(e.target.value)} placeholder="2023 – 2024" />
          </div>
        </div>

        {/* 설명 */}
        <div>
          <label className={labelClass}>설명 *</label>
          <textarea
            className={`${inputClass} min-h-[100px] resize-y`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="프로젝트 설명"
          />
        </div>

        {/* 태그 */}
        <div>
          <label className={labelClass}>태그 (쉼표 구분)</label>
          <input className={inputClass} value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="Unity, C#, Android" />
        </div>

        {/* GitHub / Demo */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className={labelClass}>GitHub URL</label>
            <input className={inputClass} value={github} onChange={(e) => setGithub(e.target.value)} placeholder="https://github.com/..." />
          </div>
          <div className="flex-1">
            <label className={labelClass}>Demo URL</label>
            <input className={inputClass} value={demo} onChange={(e) => setDemo(e.target.value)} placeholder="https://..." />
          </div>
        </div>

        {/* 순서 */}
        <div className="w-24">
          <label className={labelClass}>표시 순서</label>
          <input
            type="number"
            className={inputClass}
            value={displayOrder}
            onChange={(e) => setDisplayOrder(Number(e.target.value))}
          />
        </div>

        {/* 저장 버튼 */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="text-sm font-medium text-white bg-[#c07a2f] hover:bg-[#a86828] px-6 py-2 rounded-lg transition-colors disabled:opacity-60"
          >
            {saving ? '저장 중...' : '저장'}
          </button>
          <button
            onClick={() => router.push('/admin/projects')}
            className="text-sm font-medium text-[#7a6a52] hover:text-[#2c2416] px-4 py-2"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  )
}
