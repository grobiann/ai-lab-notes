import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 공개 페이지용 클라이언트 — cookies() 미사용으로 Next.js ISR 캐싱 가능
// 환경 변수 누락 시 null — 각 페이지에서 null 체크 후 사용
export const supabasePublic: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null
