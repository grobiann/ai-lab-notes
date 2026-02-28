import { createClient } from '@supabase/supabase-js'

// 공개 페이지용 클라이언트 — cookies() 미사용으로 Next.js ISR 캐싱 가능
export const supabasePublic = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
