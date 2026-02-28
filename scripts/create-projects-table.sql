-- Supabase SQL Editor에서 실행
CREATE TABLE projects (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  company       TEXT,
  period        TEXT,
  description   TEXT NOT NULL DEFAULT '',
  tags          TEXT[] DEFAULT '{}',
  type          TEXT NOT NULL DEFAULT 'personal',  -- 'work' | 'personal'
  github        TEXT,
  demo          TEXT,
  display_order INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read" ON projects
  FOR SELECT USING (true);

CREATE POLICY "admin_all" ON projects
  FOR ALL USING (auth.role() = 'authenticated');
