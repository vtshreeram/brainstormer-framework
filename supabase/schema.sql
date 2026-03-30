-- ============================================================
-- BRAINSTORMER APPLICATION SCHEMA
-- Creates tables in the 'public' schema (app-specific)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROJECTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES neon_auth.user(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'discovery_complete', 'documents_generated')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

-- ============================================================
-- VERSIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  version_number TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_current BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_versions_project_id ON versions(project_id);

-- ============================================================
-- WIZARD_RESPONSES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS wizard_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  version_id UUID NOT NULL REFERENCES versions(id) ON DELETE CASCADE,
  step_id TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT,
  is_complete BOOLEAN NOT NULL DEFAULT FALSE,
  follow_up_question TEXT,
  follow_up_answer TEXT,
  follow_up_skipped BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(version_id, step_id)
);

CREATE INDEX IF NOT EXISTS idx_wizard_responses_version_id ON wizard_responses(version_id);
CREATE INDEX IF NOT EXISTS idx_wizard_responses_step_id ON wizard_responses(step_id);

-- ============================================================
-- ASSUMPTIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS assumptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  response_id UUID NOT NULL REFERENCES wizard_responses(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('technical', 'business', 'platform', 'general')),
  confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assumptions_response_id ON assumptions(response_id);

-- ============================================================
-- GENERATED_DOCUMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS generated_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL CHECK (doc_type IN ('prd', 'architecture', 'user_stories', 'api_spec', 'roadmap')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  export_count INTEGER NOT NULL DEFAULT 0,
  prompt_version TEXT,
  model_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_generated_documents_project_id ON generated_documents(project_id);
CREATE INDEX IF NOT EXISTS idx_generated_documents_doc_type ON generated_documents(doc_type);

-- ============================================================
-- SHARE_SETTINGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS share_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE UNIQUE,
  is_shared BOOLEAN NOT NULL DEFAULT FALSE,
  share_token TEXT UNIQUE,
  allow_comments BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- FEEDBACK_EVENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS feedback_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  doc_id UUID REFERENCES generated_documents(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('rating', 'edit', 'copy', 'export', 'skip', 'section_feedback')),
  payload JSONB,
  user_id UUID REFERENCES neon_auth.user(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedback_events_project_id ON feedback_events(project_id);
CREATE INDEX IF NOT EXISTS idx_feedback_events_doc_id ON feedback_events(doc_id);
CREATE INDEX IF NOT EXISTS idx_feedback_events_event_type ON feedback_events(event_type);
CREATE INDEX IF NOT EXISTS idx_feedback_events_created_at ON feedback_events(created_at);

-- ============================================================
-- PROMPT_VERSIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS prompt_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doc_type TEXT NOT NULL CHECK (doc_type IN ('prd', 'architecture', 'user_stories', 'api_spec', 'roadmap')),
  version TEXT NOT NULL,
  prompt_text TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  avg_quality_score FLOAT,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prompt_versions_doc_type ON prompt_versions(doc_type);
CREATE INDEX IF NOT EXISTS idx_prompt_versions_is_active ON prompt_versions(is_active);

-- ============================================================
-- KNOWLEDGE_PATTERNS TABLE (for RAG)
-- ============================================================
CREATE TABLE IF NOT EXISTS knowledge_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pattern_type TEXT NOT NULL,
  pattern_key TEXT NOT NULL,
  pattern_data JSONB NOT NULL,
  occurrence_count INTEGER NOT NULL DEFAULT 1,
  confidence FLOAT NOT NULL DEFAULT 0.5,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_knowledge_patterns_type_key ON knowledge_patterns(pattern_type, pattern_key);

-- ============================================================
-- TRIGGER: auto-update updated_at on projects
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_wizard_responses_updated_at ON wizard_responses;
CREATE TRIGGER update_wizard_responses_updated_at
  BEFORE UPDATE ON wizard_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- USER AI SETTINGS (private schema)
-- Stores per-user BYOK AI configuration (provider + model per role).
-- ============================================================

CREATE SCHEMA IF NOT EXISTS private;

CREATE TABLE IF NOT EXISTS private.user_ai_settings (
  user_id    UUID PRIMARY KEY REFERENCES neon_auth.user(id) ON DELETE CASCADE,
  settings   JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);