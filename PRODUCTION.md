# Production Deployment Checklist

## 1. Database (Neon)

### Run the schema
In your Neon SQL editor, run `supabase/schema.sql` in full. This creates all tables including `private.user_ai_settings`.

If the database already has the base tables from a previous deploy, run only the migration:
```sql
-- supabase/migrations/001_user_ai_settings.sql
CREATE SCHEMA IF NOT EXISTS private;

CREATE TABLE IF NOT EXISTS private.user_ai_settings (
  user_id    UUID PRIMARY KEY REFERENCES neon_auth.user(id) ON DELETE CASCADE,
  settings   JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Rotate credentials
The old Neon password (`npg_7EMRCyNBQz4l`) was committed to source control and must be rotated:
1. Go to Neon dashboard → your project → Settings → Reset password
2. Update all environment variables below with the new password

---

## 2. Environment Variables

Set these in your hosting platform (Vercel, Railway, etc.) and in `.env.local` for local development.

### Required — app will not start without these

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_DB_HOST` | Neon pooler host, e.g. `ep-xxx.ap-southeast-1.aws.neon.tech` |
| `NEXT_PUBLIC_DB_USER` | Neon database user, e.g. `neondb_owner` |
| `NEXT_PUBLIC_DB_PASSWORD` | Neon database password (rotate first — see above) |
| `NEXT_PUBLIC_DB_NAME` | Neon database name, e.g. `neondb` |
| `DATABASE_URL` | Full connection string for the Edge middleware: `postgresql://USER:PASSWORD@HOST/DBNAME?sslmode=require` |

### Required — AI features will fail without at least one

| Variable | Description |
|---|---|
| `OPENAI_API_KEY` | Used by `generate-document`, `section-improve`, `section-regenerate`, and as the default provider for wizard routes |
| `ANTHROPIC_API_KEY` | Used when a user configures Anthropic as their provider in AI Settings |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Used when a user configures Gemini as their provider in AI Settings |

### Optional

| Variable | Default | Description |
|---|---|---|
| `OPENAI_MODEL` | `gpt-4o` | Model used by document generation routes |
| `NEXT_PUBLIC_DB_PORT` | `5432` | Neon port (rarely needs changing) |

---

## 3. AI Settings (BYOK)

The wizard routes (`/api/follow-up`, `/api/auto-answer`, `/api/ai-answer`, `/api/ai-suggestions`, `/api/section-ask`) and the fact extraction route (`/api/facts/extract`) use the **user's personal AI configuration** stored in `private.user_ai_settings`.

- If a user has not configured their settings, the app falls back to `AIOrchestrator.getDefaultConfig()`, which uses:
  - `synthesizer` → OpenAI `gpt-4o-mini`
  - `pm` → Gemini `gemini-1.5-pro`
  - `architect` → Anthropic `claude-3-5-sonnet-20240620`
  - `security` → OpenAI `gpt-4o`
  - `writer` → OpenAI `gpt-4o`
- The fallback config reads API keys from the server-side env vars above.
- Users can override per-role provider and model at `/settings/ai`.

---

## 4. Auth

Auth uses `neon_auth.session` and `neon_auth.user` tables. These are created by Neon's built-in auth extension — enable it in your Neon project settings before running the schema.

Passwords are hashed with `bcryptjs`. No third-party auth provider is required.

---

## 5. Deploy

### Vercel (recommended)
```bash
vercel --prod
```
Set all env vars in the Vercel dashboard under Project → Settings → Environment Variables.

### Self-hosted / Docker
```bash
npm run build
npm start
```
Ensure all env vars are set in the process environment.

### Local development
```bash
cp .env.local.example .env.local
# Fill in your values
npm run dev
```

---

## 6. Post-deploy verification

- [ ] Sign up creates a user in `neon_auth.user`
- [ ] Login sets a session cookie and redirects to dashboard
- [ ] Creating a project writes to `projects` table
- [ ] Wizard follow-up questions return AI-generated content (not hardcoded)
- [ ] Document generation produces a real document
- [ ] AI Settings page saves and loads from `private.user_ai_settings`
- [ ] `/api/facts/extract` returns a fact graph (not an error)
