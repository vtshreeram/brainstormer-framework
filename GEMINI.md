# Brainstormer Framework - AI Agent Context

## Project Overview
Brainstormer is a full-stack Next.js 14 web application designed as a structured product discovery and documentation generation tool. It guides users through a discovery wizard and auto-generates developer-ready documents powered by OpenAI.

The application has migrated from a pure frontend/localStorage model to a full-stack architecture utilizing:
- **Next.js API Routes** for backend logic.
- **PostgreSQL (Neon/NeonDB)** for persistent storage of projects, versions, and documents.
- **OpenAI API** for dynamic document generation and AI-assisted improvements.

## Technology Stack
- **Framework:** Next.js 14.2.5 (App Router)
- **UI/Components:** React 18.3.1
- **Language:** TypeScript 5.5.4
- **Styling:** Tailwind CSS 3.4.7 (IBM Carbon-inspired)
- **Database:** PostgreSQL (via `pg` pool)
- **AI:** OpenAI SDK
- **State Management:** Zustand 4.5.4 (used for transient UI state and toast notifications)
- **Markdown Rendering:** `react-markdown` 9.0.1
- **Package Manager:** Bun / npm

## Building and Running

You can use `bun` or `npm` to run the project.

```bash
# Install dependencies
npm install  # or `bun install`

# Start the development server
npm run dev  # or `bun run dev`

# Build for production
npm run build  # or `bun run build`

# Start production server
npm run start  # or `bun run start`

# Run linter
npm run lint  # or `bun run lint`
```

## Workspace Structure
- **`src/app/`**: Next.js App Router pages. Contains the main dashboard, wizard steps, review page, and generated documents views under `project/[id]/`. Also contains API routes (`api/`).
- **`src/components/ui/`**: Reusable UI components (Buttons, Modals, Toasts, TextAreas, etc.).
- **`src/store/useStore.ts`**: The "brain" of the application. Contains **all** business logic, state management, and the static document generation templates (`generateDocumentContent`).
- **`src/types/index.ts`**: Centralized TypeScript interfaces and types.
- **`src/data/mockData.ts`**: Mock content used for initial UI development and testing.
- **`spec.md`**: Contains the active implementation specifications (Phase 1: Bug Fixes, Phase 2: IBM Design System).
- **`knowledge_base.md`**: The architectural design document detailing the transition to a full AI-native and self-learning platform.

## Development Conventions & Current Directives

### State Management
- **Centralized Logic:** All state, business logic, and data updates MUST be routed through the Zustand store (`src/store/useStore.ts`). Do not use local component state for anything that needs to persist or be shared across the wizard/dashboard.

### Styling & Design System
- **Tailwind CSS:** All styling is utility-first.
- **IBM Carbon-inspired Design (Phase 2 Objective):** As defined in `spec.md`, the app is migrating to an IBM-inspired design language. This involves:
  - Replacing rounded corners (`rounded-xl`, `rounded-lg`) with sharp/minimal corners (`rounded-none` or `rounded`).
  - Transitioning the primary "sky-blue" to "IBM Blue" (`#0f62fe`).
  - Using "IBM Cool Gray" for borders and backgrounds.
  - Using the "IBM Plex Sans" font.
  - **Avoid installing `@carbon/react`.** Implement the visual language purely via Tailwind.

### Current Implementation Plan (`spec.md`)
Always refer to `spec.md` for the immediate roadmap. The current priority order is:
1. **Phase 1:** Complete the 10 identified bug fixes and functional feature additions (e.g., version restoring, export counting, AI suggestions for all doc types).
2. **Phase 2:** Execute the visual overhaul to the IBM Carbon-inspired design system.

### Future Architecture (`knowledge_base.md`)
While currently static, keep in mind that the system is designed to eventually integrate:
- **Supabase** for PostgreSQL, Auth, and Storage.
- **pgvector** for similarity search and RAG pipelines.
- **LLMs** (OpenAI / Anthropic) to replace the static string interpolation in `generateDocumentContent`. 
*(Note: Do not implement these backend/AI features until Phase 1 and Phase 2 from `spec.md` are complete and explicitly requested).*
