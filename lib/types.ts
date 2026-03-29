export type Post = {
  id: string
  title: string
  slug: string
  description: string | null
  content: string
  tags: string[]
  category: string | null
  is_published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
}

export type Project = {
  id: string
  title: string
  company: string | null
  period: string | null
  description: string
  tags: string[]
  type: 'work' | 'personal'
  github: string | null
  demo: string | null
  display_order: number
  created_at: string
  updated_at: string
}
