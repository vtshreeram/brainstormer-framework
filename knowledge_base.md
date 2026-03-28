# Brainstormer — Knowledge Base & Self-Learning Architecture Document

> **Prepared by:** AI Systems Architect Analysis  
> **Project:** Brainstormer Framework  
> **Codebase Path:** `brainstormer-framework/`  
> **Current Maturity Level:** 🔴 LOW  
> **Document Version:** 1.0.0

---

## Table of Contents

1. [System Understanding](#1-system-understanding)
2. [Knowledge Base Detection](#2-knowledge-base-detection)
3. [Learning Capability Assessment](#3-learning-capability-assessment)
4. [Gap Analysis](#4-gap-analysis)
5. [Self-Learning Architecture Design](#5-self-learning-architecture-design)
6. [Implementation Plan](#6-implementation-plan)
7. [Autonomous Learning Mode](#7-autonomous-learning-mode)
8. [Summary & Output](#8-summary--output)

---

## 1. System Understanding

### 1.1 What Is Brainstormer?

Brainstormer is a **structured product discovery and documentation generation tool** built as a pure frontend Next.js 14 web application. Its core purpose is to guide product managers, founders, and developers through a guided 7-step discovery wizard and then auto-generate a suite of developer-ready documents (PRD, Architecture, User Stories, API Specs, Roadmap) based on their answers.

Think of it as: **"Answer 7 questions → Get a full product spec package"**

---

### 1.2 Full Project Structure

```
brainstormer-framework/
├── src/
│   ├── app/                          # Next.js 14 App Router pages
│   │   ├── layout.tsx                # Root layout with ToastContainer
│   │   ├── page.tsx                  # Dashboard — project list + create
│   │   ├── globals.css               # Global Tailwind styles
│   │   └── project/[id]/
│   │       ├── page.tsx              # Project overview + progress
│   │       ├── wizard/page.tsx       # 7-step discovery wizard
│   │       ├── review/page.tsx       # Review answers + confirm assumptions
│   │       ├── generate/page.tsx     # Select doc types + trigger generation
│   │       ├── documents/page.tsx    # View, copy, download generated docs
│   │       └── settings/page.tsx     # Project settings, versioning, sharing
│   ├── components/
│   │   └── ui/
│   │       ├── Button.tsx            # Reusable button (4 variants)
│   │       ├── TextArea.tsx          # Auto-resize textarea with char count
│   │       ├── ProgressBar.tsx       # Wizard step progress tracker
│   │       ├── Modal.tsx             # Overlay modal dialog
│   │       ├── Toast.tsx             # Notification toasts (auto-dismiss 5s)
│   │       ├── AssumptionBadge.tsx   # Assumption display + confirm/dismiss
│   │       └── index.ts              # Barrel exports
│   ├── store/
│   │   └── useStore.ts               # Zustand global state + all business logic
│   ├── data/
│   │   └── mockData.ts               # Static wizard steps, doc options, mock projects
│   └── types/
│       └── index.ts                  # All TypeScript interfaces
├── next.config.js
├── tailwind.config.js                # Custom primary color scale (sky blue)
├── tsconfig.json
└── package.json
```

---

### 1.3 Technology Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Framework | Next.js | 14.2.5 | App Router, SSR/SSG |
| UI | React | 18.3.1 | Component rendering |
| Language | TypeScript | 5.5.4 | Type safety |
| State | Zustand | 4.5.4 | Global state + persistence |
| Styling | Tailwind CSS | 3.4.7 | Utility-first CSS |
| Markdown | react-markdown | 9.0.1 | Render generated docs |
| IDs | uuid | 10.0.0 | Unique entity IDs |

**Notable Absences:** No backend, no database, no API layer, no AI/ML library, no authentication, no server-side logic.

---

### 1.4 Core Business Logic

The entire business logic lives in a single file: `src/store/useStore.ts`

**Key operations:**

| Action | What It Does |
|---|---|
| `createProject()` | Creates a new project with v0.1, navigates to wizard |
| `setResponse()` | Stores an answer to a wizard step |
| `updateResponse()` | Updates existing answer, marks `isComplete` if non-empty |
| `confirmAssumption()` | Marks an assumption as user-confirmed |
| `generateDocuments()` | Runs template engine, saves docs to project |
| `updateProjectStatus()` | Transitions project through status states |
| `getCompletionPercentage()` | Calculates % of 7 steps with answers |
| `deleteProject()` | Removes project from state |

**Project Status State Machine:**
```
draft → in_progress → discovery_complete → documents_generated
```

---

### 1.5 Data Input Sources

| Source | Type | Description |
|---|---|---|
| Wizard Step Answers | User Text Input | Free-text answers to 7 guided questions |
| Project Title | User Text Input | Name given at project creation |
| Project Description | User Text Input | Optional descriptor in settings |
| Document Type Selection | User Toggle | Which of 5 doc types to generate |
| Assumption Confirmations | User Click | User confirms or dismisses inferred assumptions |
| localStorage | Browser Storage | Zustand persists projects across sessions |

**There are NO external data sources:** no APIs called, no files imported, no database reads.

---

### 1.6 Output Generation Layer

All output is generated inside `generateDocumentContent()` in `useStore.ts`. This function:

1. Takes `DocumentType`, `responses` (the 7 answers), and `projectTitle`
2. Maps each doc type to a hardcoded Markdown template string
3. Injects specific wizard answers by step ID (e.g., `step_3` answer → PRD Problem Statement section)
4. Returns the complete Markdown string

**Document types and their content:**

| Type | Template Content |
|---|---|
| `prd` | Problem Statement, Target Users, Core Features, Success Metrics, Platform, Timeline |
| `architecture` | Tech stack (hardcoded: React Native, Supabase, AWS S3), Data Model, API Endpoints, Auth |
| `user_stories` | Generic user story template with placeholder brackets |
| `api_spec` | Generic REST endpoint table with placeholder routes |
| `roadmap` | 3-phase plan (MVP weeks 1-4, Enhanced 5-8, Launch 9-12) |

**Critical Finding:** The architecture and user story documents contain **hardcoded boilerplate** regardless of user answers. Only PRD, Roadmap, and partially Architecture pull from actual wizard responses.

---

### 1.7 Existing AI/ML Components

**There are ZERO real AI/ML components in this system.**

The phrase "AI-powered workout suggestions" appears only inside the `mockData.ts` mock project content (sample data to demonstrate the UI) — it is **not implemented functionality**. The document generator is pure string interpolation with no calls to any language model, embedding service, or inference engine.

---

## 2. Knowledge Base Detection

### 2.1 Current Storage Mechanisms

| Storage Type | Present? | Details |
|---|---|---|
| SQL Database | ❌ No | Not integrated |
| NoSQL Database | ❌ No | Not integrated |
| Vector Database (FAISS/Pinecone/Weaviate) | ❌ No | Not integrated |
| File System Storage | ❌ No | No server-side file I/O |
| Redis / Cache Layer | ❌ No | Not present |
| Session Storage | ❌ No | Not used |
| localStorage (Browser) | ✅ Yes | Zustand persist middleware |
| In-Memory State | ✅ Yes | Zustand store (runtime only) |
| Logs / Historical Records | ❌ No | No logging system |
| Exported Files | ✅ Partial | User can download .md files to their machine |

### 2.2 What IS Stored (localStorage)

The Zustand store persists **only these 3 fields** under the key `brainstormer-storage`:

```
{
  projects: Project[],           // Full project array with all responses & docs
  currentProjectId: string|null, // Last active project
  currentVersionId: string|null  // Last active version
}
```

**What this means:**
- ✅ Project data survives browser refresh
- ❌ Data is device-local, not synced across devices
- ❌ Data is lost if user clears browser storage
- ❌ Data is completely inaccessible server-side
- ❌ No analytics, no aggregation, no pattern detection

### 2.3 Is the Data Structured, Retrievable, and Reusable?

**Structured:** Partially. The TypeScript interfaces (`Project`, `Response`, `Assumption`, `GeneratedDocument`) define a clean schema. However, the actual content stored inside `Response.answer` is unstructured free text — there is no NLP parsing, no entity extraction, no semantic tagging.

**Retrievable:** Only from the same browser session on the same device. There is no query API, no search, no filtering beyond what React renders in the UI.

**Reusable:** No. Past project data cannot inform future project generation. Each project is completely isolated. The system has no memory of patterns across projects.

---

## 3. Learning Capability Assessment

### 3.1 Can It Learn From Past Interactions?

**NO.** The system has no mechanism to:
- Compare answers across multiple projects
- Identify common patterns in user inputs
- Improve template quality based on which sections users edit after generation
- Recognize that certain feature descriptions correspond to certain architectural patterns

### 3.2 Can It Improve Outputs Over Time?

**NO.** The `generateDocumentContent()` function is entirely static. Its output for identical inputs will be identical every single time, regardless of how many projects have been created, how much feedback has been given, or what has been exported.

### 3.3 Does It Store Feedback Loops?

**NO.** There is no feedback mechanism of any kind:
- No user rating of generated documents
- No tracking of which sections users copy vs. skip
- No tracking of which documents are exported most
- `exportCount` is stored but is **never used** to influence anything — it is purely a display counter
- No implicit signal capture (time-on-page, edits after generation, etc.)

### 3.4 Summary Assessment

| Learning Dimension | Score | Notes |
|---|---|---|
| Data Collection | 1/10 | Only raw text answers, no structure |
| Knowledge Storage | 1/10 | localStorage only, no server-side |
| Pattern Recognition | 0/10 | None implemented |
| Output Adaptation | 0/10 | 100% static templates |
| Feedback Integration | 0/10 | No feedback mechanism |
| Cross-Project Learning | 0/10 | Projects are fully isolated |
| **Overall** | **0.3/10** | **Pre-learning baseline** |

---

## 4. Gap Analysis

### 4.1 Missing Components Checklist

#### Layer 1 — Backend & Persistence
- [ ] **No server-side backend** — all logic runs in the browser
- [ ] **No persistent database** — data lives only in localStorage
- [ ] **No user authentication** — no identity, no multi-device sync
- [ ] **No API layer** — no REST or GraphQL endpoints

#### Layer 2 — Knowledge Storage
- [ ] **No structured knowledge store** — wizard answers are unstructured blobs
- [ ] **No vector database** — no embeddings, no semantic search
- [ ] **No knowledge graph** — no relationship mapping between concepts
- [ ] **No cross-project aggregation** — patterns across many projects cannot be detected

#### Layer 3 — AI / LLM Integration
- [ ] **No LLM integration** — document generation is pure string templates
- [ ] **No embedding generation** — text is never converted to semantic vectors
- [ ] **No prompt engineering layer** — no dynamic prompt construction from context
- [ ] **No RAG pipeline** — no retrieval-augmented generation

#### Layer 4 — Feedback & Learning Loops
- [ ] **No explicit feedback** — no thumbs up/down, no ratings, no edits tracking
- [ ] **No implicit signal capture** — no behavioral analytics (scroll, time, copy events)
- [ ] **No A/B testing framework** — no way to test template variations
- [ ] **No annotation system** — no way to mark good vs. bad generated content

#### Layer 5 — Evaluation & Metrics
- [ ] **No document quality metrics** — no completeness score, no coherence score
- [ ] **No user satisfaction tracking** — no NPS, no feedback surveys
- [ ] **No system performance monitoring** — no latency tracking, no error rates
- [ ] **No improvement tracking** — no baseline to compare against future versions

#### Layer 6 — Improvement Pipeline
- [ ] **No fine-tuning pipeline** — no mechanism to update the generation model
- [ ] **No prompt optimization loop** — prompts (templates) never change
- [ ] **No data versioning** — no way to track how knowledge evolves
- [ ] **No continuous learning scheduler** — no automated retraining triggers

---

## 5. Self-Learning Architecture Design

### 5.1 Proposed Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        BRAINSTORMER SELF-LEARNING SYSTEM                 │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐     ┌──────────────────┐     ┌──────────────────────┐
│   USER LAYER     │     │  INGESTION LAYER  │     │  KNOWLEDGE STORE     │
│                  │     │                  │     │                      │
│  • Wizard Input  │────▶│  • Text Parser   │────▶│  • PostgreSQL (DB)   │
│  • Doc Feedback  │     │  • Entity Extract│     │  • pgvector (embeds) │
│  • Edit Actions  │     │  • Chunker       │     │  • Redis (cache)     │
│  • Export Events │     │  • Embedder      │     │  • S3 (raw docs)     │
└──────────────────┘     └──────────────────┘     └──────────────────────┘
         │                        │                         │
         │                        ▼                         │
         │               ┌──────────────────┐               │
         │               │  RETRIEVAL LAYER  │◀──────────────┘
         │               │                  │
         │               │  • Semantic Search│
         │               │  • RAG Pipeline  │
         │               │  • Context Build │
         └──────────────▶│  • LLM Call (AI) │
                         └──────────────────┘
                                  │
                                  ▼
         ┌────────────────────────────────────────┐
         │         GENERATION LAYER               │
         │                                        │
         │  • Dynamic Prompt Builder              │
         │  • LLM (GPT-4o / Claude / Gemini)      │
         │  • Output Validator                    │
         │  • Document Renderer                   │
         └────────────────────────────────────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    ▼             ▼             ▼
         ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
         │  FEEDBACK     │ │  EVALUATION  │ │  IMPROVEMENT │
         │  LOOP         │ │  LAYER       │ │  PIPELINE    │
         │               │ │              │ │              │
         │ • Ratings     │ │ • Quality    │ │ • Prompt Opt │
         │ • Edit Diffs  │ │   Scores     │ │ • Fine-tune  │
         │ • Copy Events │ │ • Coherence  │ │   Triggers   │
         │ • Export Logs │ │ • Coverage   │ │ • A/B Tests  │
         └──────────────┘ └──────────────┘ └──────────────┘
                    │             │             │
                    └─────────────┴─────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │   CONTINUOUS LEARNING    │
                    │   ORCHESTRATOR           │
                    │                          │
                    │ • Nightly batch jobs      │
                    │ • Prompt versioning       │
                    │ • Knowledge graph update  │
                    │ • Degradation watchdog    │
                    └─────────────────────────┘
```

---

### 5.2 Knowledge Ingestion Pipeline

**Purpose:** Convert every user interaction into structured, retrievable knowledge.

**What gets ingested:**
1. All 7 wizard step answers (chunked + embedded)
2. Generated document content (stored as versioned artifacts)
3. User edits to generated content (diff captured as structured deltas)
4. Assumption confirmations / dismissals
5. Document export events (implicit quality signal)
6. User-provided ratings on generated sections

**Ingestion flow for each wizard submission:**
```
Raw Text Answer
     │
     ▼
Entity Extraction (NLP)
  - App type detection     (e.g., "mobile fitness tracker" → category: health/fitness)
  - Platform tags          (e.g., "React Native" → tag: cross-platform-mobile)
  - Feature entities       (e.g., "authentication" → entity: auth-feature)
  - Timeline extraction    (e.g., "3 months" → normalized: 90 days)
     │
     ▼
Embedding Generation
  - OpenAI text-embedding-3-small OR
  - Cohere embed-english-v3 OR
  - local: nomic-embed-text (self-hosted)
     │
     ▼
Vector Store Write
  - Store in pgvector with metadata:
    { project_id, step_id, version_id, created_at, app_category, tags[] }
```

---

### 5.3 Storage Recommendations

| Storage Need | Recommended Tool | Why |
|---|---|---|
| Primary relational DB | **PostgreSQL (Supabase)** | Projects, users, versions, feedback |
| Vector embeddings | **pgvector extension** | Same DB, no extra infra for MVP |
| Vector embeddings (scale) | **Pinecone** | Managed, fast ANN at scale |
| Caching / sessions | **Redis (Upstash)** | Serverless Redis, edge-compatible |
| Raw document artifacts | **AWS S3 / Supabase Storage** | Markdown files, versioned exports |
| Analytics events | **PostHog** | Open-source, self-hostable |
| Prompt versioning | **LangSmith / PromptLayer** | Track prompt changes over time |

**Recommended Schema (PostgreSQL):**

```sql
-- Core entities (already modeled in TypeScript, needs DB backing)
CREATE TABLE projects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id),
  title       TEXT NOT NULL,
  description TEXT,
  status      TEXT DEFAULT 'draft',
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE wizard_responses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID REFERENCES projects(id),
  version_id  UUID REFERENCES versions(id),
  step_id     TEXT NOT NULL,           -- 'step_1' through 'step_7'
  question    TEXT NOT NULL,
  answer      TEXT,
  is_complete BOOLEAN DEFAULT false,
  embedding   vector(1536),            -- pgvector column
  tags        TEXT[],                  -- extracted entity tags
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE generated_documents (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   UUID REFERENCES projects(id),
  doc_type     TEXT NOT NULL,          -- 'prd', 'architecture', etc.
  title        TEXT,
  content      TEXT,
  prompt_hash  TEXT,                   -- hash of prompt used
  model_id     TEXT,                   -- which LLM version generated it
  quality_score FLOAT,                 -- auto-computed quality score
  generated_at TIMESTAMPTZ DEFAULT now(),
  export_count INT DEFAULT 0
);

-- Feedback & learning signals
CREATE TABLE feedback_events (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   UUID REFERENCES projects(id),
  doc_id       UUID REFERENCES generated_documents(id),
  event_type   TEXT NOT NULL,          -- 'rating', 'edit', 'copy', 'export', 'skip'
  payload      JSONB,                  -- flexible event data
  user_id      UUID REFERENCES users(id),
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- Knowledge patterns learned across projects
CREATE TABLE knowledge_patterns (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_type TEXT NOT NULL,          -- 'app_category', 'tech_stack', 'feature_combo'
  pattern_key  TEXT NOT NULL,
  pattern_data JSONB,                  -- structured insight
  occurrence_count INT DEFAULT 1,
  confidence   FLOAT DEFAULT 0.5,
  updated_at   TIMESTAMPTZ DEFAULT now()
);

-- Prompt version registry
CREATE TABLE prompt_versions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_type     TEXT NOT NULL,
  version      TEXT NOT NULL,
  prompt_text  TEXT NOT NULL,
  is_active    BOOLEAN DEFAULT false,
  avg_quality  FLOAT,
  usage_count  INT DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT now()
);
```

---

### 5.4 Retrieval Mechanism (RAG Pipeline)

**Purpose:** When generating a document for a new project, retrieve the most relevant past project examples and inject them as few-shot context into the LLM prompt.

**RAG Flow:**

```
New Project Wizard Answers
          │
          ▼
1. EMBED current wizard answers
   (all 7 answers concatenated, chunked by step)
          │
          ▼
2. VECTOR SEARCH in pgvector / Pinecone
   Query: "Find top-5 most similar projects by wizard answer embeddings"
   Filter: same_app_category OR same_platform_tags
          │
          ▼
3. RETRIEVE similar project documents
   - Fetch their generated PRD / Architecture / etc.
   - Fetch their quality scores + export counts
   - Fetch any user edits (diffs) applied post-generation
          │
          ▼
4. BUILD CONTEXT WINDOW
   System Prompt:
     "You are a product documentation expert.
      Here are 3 similar projects and their successful PRDs as examples.
      [EXAMPLE_1: {title}, {prd_content}]
      [EXAMPLE_2: {title}, {prd_content}]
      Generate a PRD for this new project based on these inputs..."
          │
          ▼
5. LLM CALL
   Model: GPT-4o / Claude Sonnet
   Temperature: 0.3 (for consistent, factual output)
   Max tokens: 4096
          │
          ▼
6. OUTPUT VALIDATION
   - Check section completeness
   - Detect placeholder text (e.g., "[Feature 1]" still present)
   - Coherence score via secondary LLM call
          │
          ▼
7. STORE result + embeddings for future retrieval
```

---

### 5.5 Feedback Loop System

**Explicit Feedback (User-Initiated):**

| Signal | Implementation | Weight |
|---|---|---|
| Section Rating | Thumbs up/down per document section | High |
| Overall Doc Rating | 1-5 stars after generation | High |
| Edit Tracking | Capture diffs between generated and user-modified content | Very High |
| Regeneration Request | User clicks "Regenerate" — strong negative signal | High |
| Export Action | User exports doc — strong positive signal | High |

**Implicit Feedback (Behavioral):**

| Signal | How Captured | Interpretation |
|---|---|---|
| Time spent on doc | PostHog page duration | Long time = engaged or confused |
| Sections copied | Copy button click events | Section was useful |
| Section skipped | Scroll past without copy/read | Section was irrelevant |
| Assumption confirmed | User clicks "Confirm" | System inference was correct |
| Assumption dismissed | User clicks "Dismiss" | System inference was wrong |
| Export file count | `exportCount` field (already tracked) | Doc was useful enough to share |

**Feedback Storage Format (JSONB payload in `feedback_events`):**
```json
{
  "event_type": "section_rating",
  "doc_type": "prd",
  "section": "core_features",
  "rating": 2,
  "comment": "Too generic, didn't reflect my specific features",
  "project_id": "proj_abc123",
  "model_id": "gpt-4o-2024-08-06",
  "prompt_version": "prd_v3.2"
}
```

---

### 5.6 Continuous Improvement Cycle

```
Week 1-2: Collect feedback events
          │
          ▼
Batch Analysis Job (nightly via cron / Inngest):
  1. Aggregate ratings by doc_type + prompt_version
  2. Identify lowest-rated sections
  3. Extract high-rated examples as golden samples
  4. Detect patterns in user edits (what do users always change?)
          │
          ▼
Prompt Optimization:
  - Feed golden samples + bad examples to prompt optimizer
  - Use DSPy / manual revision to improve prompt
  - Version new prompt in prompt_versions table
  - A/B test: 50% new prompt, 50% old prompt
          │
          ▼
Evaluation Gate:
  - New prompt must achieve avg_quality > old avg_quality + threshold
  - Must not degrade on any doc_type
  - Automated eval via LLM-as-judge on held-out set
          │
          ▼
Promotion:
  - Set new prompt as active in prompt_versions
  - Log promotion event with metrics
  - Alert if quality drops > 10% (degradation watchdog)
          │
          ▼
Knowledge Graph Update:
  - Refresh app_category → recommended_stack patterns
  - Update feature_combo → architecture_pattern mappings
  - Rebuild embeddings index for new projects
```

---

## 6. Implementation Plan

### Phase 0 — Foundation (Week 1-2)
*No existing code is broken. Add backend plumbing.*

**Step 1: Set up Supabase project**
- Create PostgreSQL database on Supabase
- Run the schema SQL from Section 5.3
- Enable pgvector extension: `CREATE EXTENSION vector;`
- Enable Row Level Security (RLS) for all tables

**Step 2: Add authentication**
- Install `@supabase/ssr` and `@supabase/supabase-js`
- Add `src/app/auth/` routes (login, signup, callback)
- Wrap layout with Supabase session provider
- Map Zustand `projects` state to DB reads/writes

**Step 3: Migrate localStorage to Supabase**
- Replace Zustand `persist` middleware with Supabase real-time subscriptions
- `createProject()` → `INSERT INTO projects`
- `setResponse()` → `UPSERT INTO wizard_responses`
- `generateDocuments()` → `INSERT INTO generated_documents`
- Keep Zustand as UI state layer only (no more persistence)

**Files to create:**
```
src/lib/supabase.ts           — Supabase client singleton
src/lib/db/projects.ts        — Project CRUD functions
src/lib/db/responses.ts       — Wizard response CRUD
src/lib/db/documents.ts       — Document CRUD + export tracking
src/app/auth/login/page.tsx   — Login page
src/app/auth/signup/page.tsx  — Signup page
src/app/api/auth/callback/route.ts — OAuth callback
```

---

### Phase 1 — AI Document Generation (Week 3-4)
*Replace static templates with real LLM-powered generation.*

**Step 4: Add LLM integration**
- Install `openai` or `@anthropic-ai/sdk`
- Store API key in `.env.local` as `OPENAI_API_KEY`
- Create server-side API route for generation (never expose key to client)

**Step 5: Build the prompt engine**
- Create one prompt template per document type
- Inject wizard answers as structured context
- Add system prompt with persona + output format instructions

**Step 6: Add generation API route**
```
src/app/api/generate/route.ts     — POST handler for document generation
src/lib/prompts/prd.ts            — PRD prompt template
src/lib/prompts/architecture.ts   — Architecture prompt template
src/lib/prompts/user_stories.ts   — User Stories prompt template
src/lib/prompts/api_spec.ts       — API Spec prompt template
src/lib/prompts/roadmap.ts        — Roadmap prompt template
src/lib/prompts/index.ts          — Prompt registry
```

**Example prompt structure (PRD):**
```
SYSTEM:
You are a senior product manager with 10 years experience writing PRDs.
You write clear, actionable, developer-ready product requirement documents.
Always use Markdown. Never use placeholder text like [Feature 1].
Be specific based on the inputs provided.

USER:
Generate a complete Product Requirements Document for the following product:

Project Name: {projectTitle}

Step 1 - The Idea:
{step_1_answer}

Step 2 - Target Users:
{step_2_answer}

Step 3 - Core Problem:
{step_3_answer}

Step 4 - Key Features:
{step_4_answer}

Step 5 - Platform:
{step_5_answer}

Step 6 - Timeline & Team:
{step_6_answer}

Step 7 - Success Metrics:
{step_7_answer}

{similar_projects_context}

Generate a complete PRD with sections: Executive Summary, Problem Statement,
Target Users & Personas, Core Features (with acceptance criteria), Technical
Constraints, Success Metrics, and Out of Scope.
```

---

### Phase 2 — Knowledge Base & RAG (Week 5-6)
*Enable the system to learn from past projects.*

**Step 7: Embed wizard answers on save**
- After each wizard step save, generate embedding via OpenAI `text-embedding-3-small`
- Store vector in `wizard_responses.embedding` column
- Create HNSW index: `CREATE INDEX ON wizard_responses USING hnsw (embedding vector_cosine_ops);`

**Step 8: Build similarity search**
```
src/lib/knowledge/search.ts    — Vector similarity search functions
src/lib/knowledge/retrieval.ts — RAG context builder
src/lib/knowledge/patterns.ts  — Cross-project pattern detection
```

**Step 9: Inject RAG context into prompts**
- Before each document generation, run similarity search
- Retrieve top-3 similar projects' highest-rated documents
- Inject as few-shot examples in system prompt

---

### Phase 3 — Feedback Loops (Week 7-8)
*Capture signals to drive improvement.*

**Step 10: Add feedback UI components**
```
src/components/ui/DocRating.tsx       — Per-document star rating
src/components/ui/SectionFeedback.tsx — Per-section thumbs up/down
src/components/ui/EditTracker.tsx     — Detects user edits to generated content
```

**Step 11: Build analytics event pipeline**
```
src/lib/analytics/events.ts     — Event type definitions
src/lib/analytics/capture.ts    — PostHog event capture wrapper
src/app/api/feedback/route.ts   — POST handler to store feedback_events
```

**Step 12: Wire feedback events to existing UI**
- Track copy button clicks → `feedback_events` insert
- Track download button clicks → `feedback_events` insert
- Track assumption confirm/dismiss → `feedback_events` insert
- Track time spent on document page → PostHog automatic capture

---

### Phase 4 — Evaluation & Improvement Pipeline (Week 9-10)
*Close the learning loop.*

**Step 13: Build document quality scorer**
```
src/lib/evaluation/scorer.ts          — Quality scoring functions
src/lib/evaluation/coherence.ts       — LLM-as-judge coherence checker
src/lib/evaluation/completeness.ts    — Section completeness detector
src/app/api/evaluate/route.ts         — POST handler for scoring
```

**Step 14: Build improvement jobs**
```
src/jobs/nightly-analysis.ts         — Aggregate feedback, identify patterns
src/jobs/prompt-optimizer.ts         — Suggest prompt improvements
src/jobs/knowledge-refresh.ts        — Update knowledge_patterns table
src/jobs/degradation-watchdog.ts     — Alert on quality drops
```

**Step 15: Prompt versioning dashboard**
```
src/app/admin/prompts/page.tsx        — View/edit/A-B test prompts
src/app/admin/analytics/page.tsx      — Quality metrics over time
src/app/admin/knowledge/page.tsx      — Explore knowledge patterns
```

---

### Suggested Libraries & Tools

| Purpose | Library | Install |
|---|---|---|
| LLM calls | `openai` | `npm install openai` |
| Alternative LLM | `@anthropic-ai/sdk` | `npm install @anthropic-ai/sdk` |
| LLM orchestration | `langchain` | `npm install langchain` |
| Embeddings pipeline | `@langchain/openai` | `npm install @langchain/openai` |
| Supabase client | `@supabase/supabase-js` | `npm install @supabase/supabase-js` |
| Supabase SSR | `@supabase/ssr` | `npm install @supabase/ssr` |
| Background jobs | `inngest` | `npm install inngest` |
| Analytics | `posthog-js` | `npm install posthog-js` |
| Rate limiting | `@upstash/ratelimit` | `npm install @upstash/ratelimit` |
| Validation | `zod` | `npm install zod` |
| Diff tracking | `diff` | `npm install diff` |
| Prompt optimization | `dspy-ai` (Python sidecar) | — |

---

## 7. Autonomous Learning Mode

### 7.1 How the System Automatically Captures New Data

**Every user interaction becomes a learning signal without manual intervention:**

```
User Types in Wizard → Auto-embed on blur / step-complete event
                     → Entity extraction runs asynchronously
                     → Tags stored alongside raw text

User Generates Docs  → Store prompt hash + model version with each doc
                     → Run quality scorer automatically post-generation
                     → Embed generated content for future similarity matching

User Reads Docs      → PostHog captures time-on-section (scroll tracking)
                     → Copy events captured via onClick listeners
                     → Download triggers exportCount increment + feedback event

User Edits Docs      → Diff computed between original and edited content
                     → Diff stored as structured learning signal
                     → Edited version becomes a "golden example" candidate
```

### 7.2 How New Data Becomes Structured Knowledge

**Nightly batch pipeline (runs via Inngest cron job):**

```
STEP 1 — Collect events from last 24 hours
  SELECT * FROM feedback_events WHERE created_at > now() - interval '24 hours'

STEP 2 — Compute quality deltas per prompt version
  SELECT prompt_version, doc_type, AVG(quality_score), COUNT(*)
  FROM generated_documents JOIN feedback_events USING (doc_id)
  GROUP BY prompt_version, doc_type

STEP 3 — Identify patterns in high-quality projects
  - Find projects with quality_score > 0.85 AND export_count > 2
  - Extract their wizard answer patterns (app_category, platform, feature_density)
  - Upsert into knowledge_patterns with updated confidence scores

STEP 4 — Identify failure patterns in low-quality projects
  - Find projects with quality_score < 0.4 OR regeneration_count > 1
  - Extract common failure patterns
  - Flag associated prompt versions for review

STEP 5 — Refresh embeddings index
  - Reindex any new wizard_responses added since last run
  - Prune low-quality examples from RAG candidate pool

STEP 6 — Generate improvement report
  - Post summary to Slack webhook or email
  - Log to analytics dashboard
```

### 7.3 How Responses Improve Without Manual Retraining

**Mechanism: Prompt-Level Adaptation (No Fine-Tuning Required)**

The system improves at the **prompt level** rather than requiring expensive model fine-tuning, making it practical and fast:

```
Quality Signal Detected (avg rating drops below threshold)
          │
          ▼
Identify lowest-rated sections across last 100 docs of that type
          │
          ▼
Auto-prompt optimizer runs (DSPy or manual review queue):
  Input:  [bad example section + user feedback/edit]
  Goal:   Rewrite prompt instruction for that section
  Output: Candidate new prompt
          │
          ▼
Shadow deployment (10% traffic to new prompt)
  Monitor quality scores for 48 hours
          │
          ▼
If new_avg_quality > old_avg_quality + 0.05:
  Promote new prompt to 100% traffic
  Archive old prompt version
Else:
  Roll back, flag for human review
```

### 7.4 How the System Avoids Degradation and Hallucination

**Anti-Hallucination Measures:**

| Mechanism | Implementation |
|---|---|
| Grounding in user input | Prompts explicitly instruct: "Only use information provided. Do not invent features, timelines, or team sizes not mentioned." |
| Output validation | After generation, a secondary LLM call checks: "Does this document contradict any of the wizard answers?" |
| Placeholder detector | Regex scan for patterns like `[Feature X]`, `TBD`, `placeholder` — regenerate if found |
| Confidence thresholds | If LLM confidence (via logprob or secondary scorer) is below threshold, show warning to user |
| Human-in-the-loop | Any doc with quality_score < 0.5 shows "This document may need review" banner |

**Anti-Degradation Measures:**

| Mechanism | Implementation |
|---|---|
| Quality baseline | Store rolling 30-day average quality score per doc_type per prompt_version |
| Degradation watchdog | Alert if quality drops > 10% vs. 7-day moving average |
| Canary deployments | New prompt versions start at 5% traffic with automatic rollback |
| Frozen golden set | Maintain 50 hand-curated examples that all prompt versions must score well on |
| Model version pinning | Pin specific LLM model versions (e.g., `gpt-4o-2024-08-06`) to prevent drift from model updates |

---

## 8. Summary & Output

### 8.1 Current State Maturity

| Dimension | Current State | Maturity |
|---|---|---|
| Core Functionality | 7-step wizard + template doc generation | ✅ Functional |
| UI/UX | Clean, polished Next.js + Tailwind UI | ✅ Good |
| Data Persistence | Browser localStorage only | 🔴 Minimal |
| Backend | None (pure frontend) | 🔴 Missing |
| AI Integration | None (string templates only) | 🔴 Missing |
| Knowledge Base | None (no structured storage) | 🔴 Missing |
| Learning Capability | None (no feedback loops) | 🔴 Missing |
| Evaluation System | None (no quality metrics) | 🔴 Missing |

**Overall Maturity: 🔴 LOW (2/10)**  
The product has a well-designed UX shell and correct data model, but zero AI capability, zero learning, and no persistent server-side infrastructure.

---

### 8.2 Missing Components Checklist

#### Must Have (Blockers for Self-Learning)
- [ ] Backend API (Next.js API routes or separate service)
- [ ] Persistent database (PostgreSQL / Supabase)
- [ ] User authentication (Supabase Auth)
- [ ] LLM integration (OpenAI / Anthropic)
- [ ] Vector embeddings for wizard answers (pgvector)
- [ ] Feedback event collection
- [ ] Document quality scoring

#### Should Have (Core Learning Capabilities)
- [ ] RAG pipeline with similarity search
- [ ] Prompt versioning registry
- [ ] Nightly analysis batch jobs
- [ ] Prompt A/B testing framework
- [ ] Knowledge patterns table
- [ ] Edit diff tracking

#### Nice to Have (Advanced Learning)
- [ ] Admin analytics dashboard
- [ ] LLM-as-judge evaluation
- [ ] Fine-tuning data pipeline
- [ ] Degradation alerting
- [ ] Knowledge graph visualization
- [ ] Cross-project trend analysis

---

### 8.3 Proposed Architecture Diagram (Text-Based)

```
╔══════════════════════════════════════════════════════════════════════════╗
║                    BRAINSTORMER SELF-LEARNING ARCHITECTURE               ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  ┌─────────────────────────────────────────────────────┐                ║
║  │                  FRONTEND (Next.js)                  │                ║
║  │                                                      │                ║
║  │  Dashboard → Wizard → Review → Generate → Documents  │                ║
║  │                                                      │                ║
║  │  [Feedback UI] [Edit Tracker] [Rating Components]    │                ║
║  └────────────────────────┬─────────────────────────────┘                ║
║                           │ HTTP / Supabase Realtime                     ║
║  ┌────────────────────────▼─────────────────────────────┐                ║
║  │              BACKEND API LAYER (Next.js Routes)       │                ║
║  │                                                      │                ║
║  │  /api/projects    /api/generate    /api/feedback      │                ║
║  │  /api/evaluate    /api/search      /api/prompts       │                ║
║  └──────┬──────────────────┬──────────────────┬─────────┘                ║
║         │                  │                  │                          ║
║  ┌──────▼──────┐   ┌───────▼──────┐   ┌──────▼──────────┐               ║
║  │  SUPABASE   │   │   LLM API    │   │   VECTOR STORE  │               ║
║  │             │   │              │   │                 │               ║
║  │ PostgreSQL  │   │ GPT-4o /     │   │ pgvector OR     │               ║
║  │ Auth        │   │ Claude       │   │ Pinecone        │               ║
║  │ Storage     │   │ Sonnet       │   │                 │               ║
║  │ Realtime    │   │              │   │ Similarity      │               ║
║  └──────┬──────┘   └───────┬──────┘   │ Search          │               ║
║         │                  │          └──────┬──────────┘               ║
║         │                  │                 │                          ║
║  ┌──────▼──────────────────▼─────────────────▼─────────┐                ║
║  │              KNOWLEDGE & LEARNING LAYER              │                ║
║  │                                                      │                ║
║  │  ┌────────────┐  ┌────────────┐  ┌────────────────┐ │                ║
║  │  │  RAG       │  │  Feedback  │  │  Prompt        │ │                ║
║  │  │  Pipeline  │  │  Collector │  │  Versioning    │ │                ║
║  │  └────────────┘  └────────────┘  └────────────────┘ │                ║
║  │                                                      │                ║
║  │  ┌────────────┐  ┌────────────┐  ┌────────────────┐ │                ║
║  │  │  Quality   │  │  Nightly   │  │  Degradation   │ │                ║
║  │  │  Scorer    │  │  Jobs      │  │  Watchdog      │ │                ║
║  │  └────────────┘  └────────────┘  └────────────────┘ │                ║
║  └──────────────────────────────────────────────────────┘                ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

---

### 8.4 Step-by-Step Implementation Plan (Prioritized)

| Priority | Phase | Action | Estimated Effort |
|---|---|---|---|
| P0 | Foundation | Set up Supabase (DB + Auth) | 2 days |
| P0 | Foundation | Migrate state from localStorage to Supabase | 3 days |
| P0 | Foundation | Add user authentication | 2 days |
| P1 | AI Core | Integrate OpenAI API (server-side route) | 1 day |
| P1 | AI Core | Build prompt templates per doc type | 3 days |
| P1 | AI Core | Replace `generateDocumentContent()` with LLM call | 2 days |
| P1 | Knowledge | Add pgvector + embed wizard answers | 2 days |
| P1 | Knowledge | Build similarity search function | 2 days |
| P2 | Feedback | Add explicit feedback UI (ratings, section feedback) | 3 days |
| P2 | Feedback | Capture implicit signals (copy, export, time) | 2 days |
| P2 | Feedback | Build `feedback_events` write pipeline | 1 day |
| P3 | Learning | Build nightly analysis batch job | 3 days |
| P3 | Learning | Add prompt versioning + A/B testing | 3 days |
| P3 | Learning | Build quality scorer + evaluation runner | 3 days |
| P4 | Advanced | Admin analytics dashboard | 4 days |
| P4 | Advanced | Degradation watchdog + alerting | 2 days |
| P4 | Advanced | Knowledge graph pattern detection | 5 days |

**Total estimated effort to reach a fully self-learning system: ~40 developer-days**

---

### 8.5 Quick Wins (Can Be Done This Week)

These improvements can be made immediately without a full backend rewrite, providing immediate value and building toward the larger architecture:

1. **Capture export events** — The `exportCount` field already exists. Wire it to a feedback event table (even localStorage for now) to start capturing the signal.

2. **Add section ratings to Documents page** — A simple thumbs up/down per document section requires only frontend UI + localStorage storage to start.

3. **Replace at least ONE static template with an LLM call** — Start with the PRD template. Add a single API route that calls OpenAI and uses the exact same wizard answers as context. This proves the value immediately and is reversible.

4. **Extract tags from wizard answers** — Run a simple keyword extraction on wizard answers (no embedding needed) to start tagging projects with `app_category`, `platform`, and `feature_count`. This is the foundation of pattern detection.

5. **Version the generation** — Store which template version (or future: prompt version) was used to generate each document. This costs nothing now and enables A/B analysis later.

---

*End of Knowledge Base Document*

---

> **Document maintained by:** AI Systems Architecture Analysis  
> **Last updated:** Based on codebase scan of `brainstormer-framework` v0.1.0  
> **Next review:** After Phase 1 implementation complete