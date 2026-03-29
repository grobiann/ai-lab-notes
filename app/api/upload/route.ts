import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { uploadToS3 } from '@/lib/s3'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  if (!file.type.startsWith('image/')) {
    return NextResponse.json(
      { error: '이미지 파일(jpg, png, gif, webp 등)만 업로드할 수 있습니다.' },
      { status: 400 }
    )
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json(
      { error: '파일 크기는 5MB 이하여야 합니다.' },
      { status: 400 }
    )
  }

  const ext = file.name.split('.').pop()
  const key = `blog-images/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const publicUrl = await uploadToS3(buffer, key, file.type)
  return NextResponse.json({ url: publicUrl })
}
