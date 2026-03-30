-- ============================================================
-- USER AI SETTINGS
-- Stores per-user BYOK AI configuration (provider + model per role).
-- Uses the 'private' schema to keep it separate from app tables.
-- ============================================================

CREATE SCHEMA IF NOT EXISTS private;

CREATE TABLE IF NOT EXISTS private.user_ai_settings (
  user_id   UUID PRIMARY KEY REFERENCES neon_auth.user(id) ON DELETE CASCADE,
  settings  JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row-level: only the owning user should read/write their own settings.
-- Enforce this at the application layer (middleware injects x-user-id).
