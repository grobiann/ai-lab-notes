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

export type Database = {
  public: {
    Tables: {
      posts: {
        Row: Post
        Insert: Omit<Post, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Post, 'id' | 'created_at'>>
        Relationships: []
      }
      projects: {
        Row: Project
        Insert: Omit<Project, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Project, 'id' | 'created_at'>>
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}
