import { revalidatePath } from 'next/cache'
import type { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-revalidate-secret')

  // 환경 변수에서 설정한 secret과 비교
  if (secret !== process.env.REVALIDATE_SECRET) {
    return Response.json({ message: 'Invalid secret' }, { status: 401 })
  }

  try {
    // 데이터가 변경될 수 있는 모든 페이지 재검증
    await Promise.all([
      revalidatePath('/'),
      revalidatePath('/blog'),
    ])

    return Response.json(
      {
        revalidated: true,
        message: '캐시가 성공적으로 갱신되었습니다.',
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    )
  } catch (err) {
    return Response.json(
      { message: '캐시 갱신 중 오류가 발생했습니다.', error: String(err) },
      { status: 500 }
    )
  }
}
