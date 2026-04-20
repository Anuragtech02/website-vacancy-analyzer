-- Migration: Add analysis_jobs table for background processing
-- Created: 2025-01-28

CREATE TABLE IF NOT EXISTS analysis_jobs (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL CHECK(status IN ('pending', 'processing', 'completed', 'failed')),
  vacancy_text TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  locale TEXT DEFAULT 'nl',
  email TEXT,
  result_json TEXT,
  error_message TEXT,
  created_at INTEGER DEFAULT (unixepoch()),
  completed_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_analysis_jobs_status ON analysis_jobs(status);
CREATE INDEX IF NOT EXISTS idx_analysis_jobs_email ON analysis_jobs(email);
CREATE INDEX IF NOT EXISTS idx_analysis_jobs_created_at ON analysis_jobs(created_at);
