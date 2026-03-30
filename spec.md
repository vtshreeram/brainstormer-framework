# Spec: Wire Real Credentials + Migrate Document Routes to AIOrchestrator

## Problem Statement

The app has no `.env.local` file, so it cannot connect to the database or call any AI provider. Additionally, three API routes (`generate-document`, `section-improve`, `section-regenerate`) are hardwired to the OpenAI SDK and will fail without an OpenAI key. The user has provided a Neon DB connection string and a Gemini API key, and wants document generation to use Gemini instead of OpenAI.

## Credentials Provided

Parsed from the Neon connection string:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_DB_HOST` | `ep-blue-art-a1ym0ofn-pooler.ap-southeast-1.aws.neon.tech` |
| `NEXT_PUBLIC_DB_PORT` | `5432` |
| `NEXT_PUBLIC_DB_USER` | `neondb_owner` |
| `NEXT_PUBLIC_DB_PASSWORD` | `npg_7EMRCyNBQz4l` |
| `NEXT_PUBLIC_DB_NAME` | `neondb` |
| `DATABASE_URL` | full connection string (for middleware) |
| `GOOGLE_GENERATIVE_AI_API_KEY` | provided Gemini key |

## Requirements

### 1. Create `.env.local`
- Write all 7 variables to `.env.local`
- Verify `.env.local` is in `.gitignore`

### 2. Update `AIOrchestrator.getDefaultConfig()`
- Change the `writer` role default from `openai / gpt-4o` to `gemini / gemini-1.5-pro`
- This ensures all document routes work out of the box with only the Gemini key set

### 3. Migrate `generate-document` to AIOrchestrator
- Remove the OpenAI SDK dependency from this route
- Use `aiOrchestrator.runRole('writer', ...)` with `getUserAIConfig(userId)`
- Preserve all existing behaviour: prompt building via `buildPrompt`, ownership check, content length validation, response shape

### 4. Migrate `section-improve` to AIOrchestrator
- Remove the OpenAI SDK dependency
- Use `aiOrchestrator.runRole('writer', ...)` with `getUserAIConfig(userId)`
- Preserve: `section_heading`, `section_content`, `instruction` inputs; `improved_content` response shape

### 5. Migrate `section-regenerate` to AIOrchestrator
- Remove the OpenAI SDK dependency
- Use `aiOrchestrator.runRole('writer', ...)` with `getUserAIConfig(userId)`
- Preserve: `section_heading`, `section_content`, `attempt` inputs; `regenerated_content` response shape

## Acceptance Criteria

- [ ] `.env.local` exists with all 7 variables populated
- [ ] App starts without DB connection errors
- [ ] `generate-document`, `section-improve`, `section-regenerate` no longer import or reference the OpenAI SDK directly
- [ ] All three routes call `aiOrchestrator.runRole('writer', ...)`
- [ ] `AIOrchestrator.getDefaultConfig()` uses Gemini for the `writer` role
- [ ] Document generation works end-to-end with only `GOOGLE_GENERATIVE_AI_API_KEY` set
- [ ] No `OPENAI_API_KEY` is required for the app to function

## Implementation Steps

1. Create `.env.local` with all 7 variables
2. Update `src/lib/ai/orchestrator.ts` — change `writer` default to `gemini / gemini-1.5-pro`
3. Rewrite `src/app/api/generate-document/route.ts` — replace OpenAI SDK with `aiOrchestrator.runRole('writer', ...)`
4. Rewrite `src/app/api/section-improve/route.ts` — same pattern
5. Rewrite `src/app/api/section-regenerate/route.ts` — same pattern
6. Verify no remaining direct OpenAI SDK imports in the three routes
