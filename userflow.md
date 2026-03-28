# Brainstormer — User Flow Document

> **Document Type:** User Flow & Interaction Specification
> **Project:** Brainstormer Framework
> **Based On:** Knowledge Base v1.0.0
> **Scope:** Current system (v0.1.0) + Future state (AI-powered)

---

## Table of Contents

1. [Overview](#1-overview)
2. [User Roles & Actors](#2-user-roles--actors)
3. [Application Entry Points](#3-application-entry-points)
4. [High-Level Journey Map](#4-high-level-journey-map)
5. [Page-by-Page User Flow](#5-page-by-page-user-flow)
   - 5.1 [Dashboard — Project List](#51-dashboard--project-list)
   - 5.2 [Project Creation](#52-project-creation)
   - 5.3 [Wizard — 7-Step Discovery](#53-wizard--7-step-discovery)
   - 5.4 [Review — Answers & Assumptions](#54-review--answers--assumptions)
   - 5.5 [Generate — Document Selection](#55-generate--document-selection)
   - 5.6 [Documents — View & Export](#56-documents--view--export)
   - 5.7 [Settings — Project Management](#57-settings--project-management)
6. [Project Status State Machine](#6-project-status-state-machine)
7. [Data Flow Per Interaction](#7-data-flow-per-interaction)
8. [UI Components Per Step](#8-ui-components-per-step)
9. [Complete Happy Path (End-to-End)](#9-complete-happy-path-end-to-end)
10. [Alternative Paths & Edge Cases](#10-alternative-paths--edge-cases)
11. [Current System Limitations](#11-current-system-limitations)
12. [Future State User Flow (AI-Powered)](#12-future-state-user-flow-ai-powered)

---

## 1. Overview

Brainstormer is a **guided product discovery and documentation generation tool**. It takes a user through a structured 7-step discovery wizard and produces a suite of developer-ready documents — including PRD, Architecture Spec, User Stories, API Spec, and a Roadmap — based on their answers.

**Core user promise:**
> "Answer 7 questions about your product idea → Receive a complete, structured product spec package."

**Current implementation:** Pure frontend Next.js 14 application with no backend, no AI, and no authentication. All data is stored in browser `localStorage` via Zustand state management.

---

## 2. User Roles & Actors

| Role | Description | Primary Goal |
|---|---|---|
| **Product Manager** | Someone formalizing a product idea into documentation | Generate a PRD and roadmap quickly |
| **Founder** | Early-stage builder who needs a spec to share with developers | Get a full spec package from an idea |
| **Developer** | Technical person who wants structured docs before building | Get architecture spec and API definitions |
| **Solo Builder** | Individual working across all roles | Get end-to-end product documentation |

> **Note (v0.1.0):** There is no authentication system. All users are anonymous and their data is local to their browser session. There is no concept of user accounts, teams, or shared workspaces in the current implementation.

---

## 3. Application Entry Points

| Entry Point | Route | Description |
|---|---|---|
| **Dashboard** | `/` | Default landing page; shows all projects |
| **Project Overview** | `/project/[id]` | Direct link to a specific project |
| **Wizard** | `/project/[id]/wizard` | Jump directly into the discovery wizard |
| **Review** | `/project/[id]/review` | Review answers for a specific project |
| **Generate** | `/project/[id]/generate` | Document generation selection screen |
| **Documents** | `/project/[id]/documents` | View all generated documents |
| **Settings** | `/project/[id]/settings` | Manage project settings |

> Since there is no authentication or server-side routing, all routes are accessible via direct URL. State is restored from `localStorage` on page load.

---

## 4. High-Level Journey Map

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER JOURNEY (HAPPY PATH)                    │
└─────────────────────────────────────────────────────────────────┘

   [LAND ON DASHBOARD]
           │
           ▼
   [CREATE NEW PROJECT]
     Enter project title
           │
           ▼
   [7-STEP WIZARD]
     Answer guided discovery questions
     (steps 1 through 7, one at a time)
           │
           ▼
   [REVIEW & ASSUMPTIONS]
     Read back all answers
     Confirm or dismiss auto-generated assumptions
           │
           ▼
   [SELECT DOCUMENT TYPES]
     Toggle which of 5 doc types to generate
           │
           ▼
   [DOCUMENT GENERATION]
     System generates selected documents
           │
           ▼
   [VIEW DOCUMENTS]
     Read, copy, or download generated Markdown docs
           │
           ▼
   [SETTINGS (optional)]
     Rename project, manage versions, adjust settings
```

---

## 5. Page-by-Page User Flow

---

### 5.1 Dashboard — Project List

**Route:** `/`
**File:** `src/app/page.tsx`

#### What the User Sees
- A list of all previously created projects
- Each project card displays: title, status badge, creation date, completion percentage
- A **"Create New Project"** button (primary CTA)
- Empty state message if no projects exist yet

#### User Actions

| Action | Trigger | Result |
|---|---|---|
| **Create new project** | Click "Create New Project" button | Opens project creation modal |
| **Open existing project** | Click on a project card | Navigates to `/project/[id]` |
| **Delete a project** | Click delete icon on a project card | Calls `deleteProject()`, removes from list |

#### System Behaviour
- On page load, Zustand restores all projects from `localStorage`
- `getCompletionPercentage()` is called per project to display progress
- Projects are displayed in creation order (most recent or oldest first)

#### Exit Points
- → Project Creation flow (via modal)
- → Project Overview page (via project card click)

---

### 5.2 Project Creation

**Triggered from:** Dashboard
**State change:** New `Project` object created, status set to `draft`

#### What the User Sees
- A modal dialog prompting for a **project title**
- An optional description field
- A **"Create"** / **"Start"** confirm button
- A **"Cancel"** option to dismiss

#### User Actions

| Action | Trigger | Result |
|---|---|---|
| **Enter title** | Type in title input | Stores value in local modal state |
| **Confirm creation** | Click "Create" | Calls `createProject()`, navigates to wizard |
| **Cancel** | Click "Cancel" or close modal | Modal closes, no project created |

#### System Behaviour
- `createProject()` in `useStore.ts`:
  - Generates a unique UUID for the project
  - Creates a new `Project` object with status `draft`
  - Creates an initial version (`v0.1`)
  - Persists to `localStorage` via Zustand
  - Sets `currentProjectId` in store
  - Navigates user to `/project/[id]/wizard`

#### Data Created
```
Project {
  id:          uuid
  title:       [user input]
  description: [optional user input]
  status:      "draft"
  createdAt:   timestamp
  versions:    [ Version { id, label: "v0.1", responses: [], documents: [] } ]
}
```

#### Exit Points
- → Wizard (on successful creation)
- → Dashboard (on cancel)

---

### 5.3 Wizard — 7-Step Discovery

**Route:** `/project/[id]/wizard`
**File:** `src/app/project/[id]/wizard/page.tsx`
**State change:** `draft` → `in_progress`

#### What the User Sees
- A **progress bar** at the top showing current step out of 7
- The current step's **question prompt** (from `mockData.ts`)
- A **text area** for the user's answer (auto-resizing, with character count)
- **"Back"** and **"Next"** navigation buttons
- A **"Save & Continue"** or equivalent action

#### The 7 Wizard Steps

| Step ID | Discovery Area | What the User Answers |
|---|---|---|
| `step_1` | **The Idea** | What is your product idea? Core concept. |
| `step_2` | **Target Users** | Who are your users? Who is this built for? |
| `step_3` | **Core Problem** | What problem does this solve? Why does it matter? |
| `step_4` | **Key Features** | What are the must-have features for the MVP? |
| `step_5` | **Platform** | What platform(s) will this run on? (web, mobile, etc.) |
| `step_6` | **Timeline & Team** | What is the timeline and who is building it? |
| `step_7` | **Success Metrics** | How will you measure success? KPIs? |

#### User Actions Per Step

| Action | Trigger | Result |
|---|---|---|
| **Type answer** | Keystrokes in TextArea | Local state updates; character count updates |
| **Advance to next step** | Click "Next" | Calls `setResponse()` or `updateResponse()`, advances step counter |
| **Go back to previous step** | Click "Back" | Navigates to prior step; existing answer is preserved |
| **Skip a step** | Click "Next" without typing | Step recorded as incomplete (`isComplete: false`) |
| **Return to a completed step** | Navigate back | Existing answer pre-populated in TextArea |
| **Edit a previous answer** | Modify text in TextArea | Calls `updateResponse()`, re-evaluates `isComplete` |

#### System Behaviour
- `setResponse()` — creates a new response record for a step
- `updateResponse()` — updates an existing response; sets `isComplete: true` if the answer is non-empty
- Progress bar reflects `getCompletionPercentage()` — the percentage of 7 steps with non-empty answers
- The wizard does **not** enforce mandatory completion; users can navigate freely between steps
- On completing step 7 (or navigating away), the user is prompted to proceed to Review

#### State Transitions
```
Project.status: "draft" → "in_progress"  (on first answer saved)
Response.isComplete: false → true         (when answer is non-empty)
```

#### Exit Points
- → Review page (after step 7 or via explicit "Review Answers" action)
- → Dashboard (via navigation/breadcrumb)

---

### 5.4 Review — Answers & Assumptions

**Route:** `/project/[id]/review`
**File:** `src/app/project/[id]/review/page.tsx`
**State change:** `in_progress` → `discovery_complete`

#### What the User Sees
- A **read-back of all 7 answers**, displayed in a structured list
- Each answer shows the original question and the user's response
- **Assumption badges** — system-inferred assumptions shown as dismissible chips
- **Edit** links next to each answer to jump back to that wizard step
- A **"Confirm & Generate"** CTA button to proceed
- An indicator of overall completion (e.g., "6/7 steps completed")

#### What Are Assumptions?
The system generates assumptions based on wizard answers — for example, inferring a likely tech stack or target device from the user's description. These are displayed as `AssumptionBadge` components.

#### User Actions

| Action | Trigger | Result |
|---|---|---|
| **Confirm an assumption** | Click "Confirm" on AssumptionBadge | Calls `confirmAssumption()`, badge marked confirmed |
| **Dismiss an assumption** | Click "Dismiss" on AssumptionBadge | Assumption flagged as dismissed, removed from active set |
| **Edit an answer** | Click "Edit" next to a step | Navigates back to that step in the wizard |
| **Proceed to generation** | Click "Confirm & Generate" | Calls `updateProjectStatus("discovery_complete")`, navigates to `/generate` |
| **Go back** | Click "Back" / breadcrumb | Returns to wizard at last step |

#### System Behaviour
- `confirmAssumption(id)` — marks assumption `confirmed: true` in store
- Confirmed assumptions are injected as context into document generation templates
- `updateProjectStatus()` transitions the project state to `discovery_complete`
- Dismissed assumptions are excluded from generation context

#### State Transitions
```
Project.status: "in_progress" → "discovery_complete"
Assumption.confirmed: false → true   (on user confirmation)
Assumption.dismissed: false → true   (on user dismissal)
```

#### Exit Points
- → Generate page (on "Confirm & Generate")
- → Wizard (on "Edit" for a specific step)
- → Dashboard (via navigation)

---

### 5.5 Generate — Document Selection

**Route:** `/project/[id]/generate`
**File:** `src/app/project/[id]/generate/page.tsx`

#### What the User Sees
- A list of **5 document type options**, each with a toggle/checkbox:
  - Product Requirements Document (PRD)
  - Architecture Specification
  - User Stories
  - API Specification
  - Roadmap
- Brief description of each document type
- A **"Generate Selected Documents"** button
- Visual indicator of which documents are selected (min 1 required)

#### User Actions

| Action | Trigger | Result |
|---|---|---|
| **Toggle a document type** | Click toggle/checkbox | Adds or removes doc type from selection |
| **Select all** | Click "Select All" (if present) | All 5 types selected |
| **Trigger generation** | Click "Generate" | Calls `generateDocuments()` for selected types |
| **Go back** | Click "Back" | Returns to Review page |

#### System Behaviour
- `generateDocuments()` in `useStore.ts`:
  - Iterates over each selected `DocumentType`
  - Calls `generateDocumentContent(docType, responses, projectTitle)` for each
  - This function maps wizard answers into hardcoded Markdown templates
  - Returns completed Markdown strings
  - Saves all generated documents to the project in state
  - Updates project status to `documents_generated`
  - Navigates to `/project/[id]/documents`

#### Document Types & Content Source

| Document | Content Source |
|---|---|
| **PRD** | Pulls from `step_1`, `step_2`, `step_3`, `step_4`, `step_5`, `step_6`, `step_7` |
| **Architecture Spec** | Partially from wizard; contains hardcoded stack (React Native, Supabase, AWS S3) |
| **User Stories** | Generic template with placeholder brackets — not wizard-driven |
| **API Specification** | Generic REST table with placeholder routes — not wizard-driven |
| **Roadmap** | Pulls timeline from `step_6`; 3-phase structure is hardcoded |

#### State Transitions
```
Project.status: "discovery_complete" → "documents_generated"
GeneratedDocument objects created and attached to project version
```

#### Exit Points
- → Documents page (on generation success)
- → Review page (on back)

---

### 5.6 Documents — View & Export

**Route:** `/project/[id]/documents`
**File:** `src/app/project/[id]/documents/page.tsx`

#### What the User Sees
- A **tab or list** of all generated documents (one tab per doc type generated)
- Each document rendered as **formatted Markdown** (via `react-markdown`)
- A **"Copy"** button per document
- A **"Download"** button to export the document as a `.md` file
- Document metadata: generation timestamp, document type label
- Export count indicator per document

#### User Actions

| Action | Trigger | Result |
|---|---|---|
| **Switch document tab** | Click on a doc type tab | Renders that document's Markdown content |
| **Copy document** | Click "Copy" button | Full Markdown string copied to clipboard; Toast notification shown |
| **Download document** | Click "Download" button | Browser downloads file as `[doc-type].md`; `exportCount` incremented |
| **Regenerate (future)** | Click "Regenerate" (if present) | Would re-run generation for that doc type |
| **Navigate to Settings** | Click "Settings" link | Goes to `/project/[id]/settings` |

#### System Behaviour
- Documents are read from Zustand store (`project.versions[active].documents`)
- `react-markdown` renders the stored Markdown string with proper formatting
- Copy action uses the browser Clipboard API
- Download action creates a Blob from the Markdown string and triggers a browser download
- `exportCount` field is incremented per download (stored in state, displayed in UI)
- Toast notification (5-second auto-dismiss) confirms copy/download actions

#### Exit Points
- → Settings page (via navigation)
- → Dashboard (via breadcrumb/navigation)
- → Wizard (via breadcrumb, to edit answers and regenerate)

---

### 5.7 Settings — Project Management

**Route:** `/project/[id]/settings`
**File:** `src/app/project/[id]/settings/page.tsx`

#### What the User Sees
- **Project title** — editable
- **Project description** — editable text field
- **Version management** — list of versions, ability to create new versions
- **Project status** — current status displayed
- **Danger zone** — option to delete the project

#### User Actions

| Action | Trigger | Result |
|---|---|---|
| **Edit project title** | Modify title field | Updates `project.title` in store |
| **Edit description** | Modify description field | Updates `project.description` in store |
| **Create new version** | Click "New Version" | Creates a new version node under the project |
| **Switch active version** | Select from version list | Sets `currentVersionId` in store |
| **Delete project** | Click "Delete Project" | Calls `deleteProject()`, navigates to Dashboard |
| **Share project** | Click "Share" (if present) | Likely copies a local URL (no server-side sharing in v0.1.0) |

#### System Behaviour
- All changes written immediately to Zustand store and persisted to `localStorage`
- Version creation creates a new empty version that the wizard can be run against
- Deleting a project removes it entirely from state and `localStorage`

#### Exit Points
- → Dashboard (via navigation or after project deletion)
- → Documents page (via navigation)

---

## 6. Project Status State Machine

The project progresses through a defined set of statuses. Each status unlocks the next stage of the flow.

```
┌──────────┐     create project     ┌─────────────┐
│          │ ─────────────────────▶ │             │
│ [START]  │                        │    draft    │
│          │                        │             │
└──────────┘                        └──────┬──────┘
                                           │
                              first answer saved
                                           │
                                           ▼
                                   ┌───────────────┐
                                   │               │
                                   │  in_progress  │
                                   │               │
                                   └──────┬────────┘
                                          │
                           user confirms on Review page
                                          │
                                          ▼
                                ┌──────────────────────┐
                                │                      │
                                │  discovery_complete  │
                                │                      │
                                └──────────┬───────────┘
                                           │
                              user triggers generation
                                           │
                                           ▼
                               ┌───────────────────────┐
                               │                       │
                               │  documents_generated  │
                               │                       │
                               └───────────────────────┘
```

| Status | Meaning | Accessible Pages |
|---|---|---|
| `draft` | Project created, no wizard answers yet | Dashboard, Wizard, Settings |
| `in_progress` | Wizard partially or fully completed | All pages |
| `discovery_complete` | User confirmed answers on Review page | All pages |
| `documents_generated` | At least one document has been generated | All pages; Documents is primary |

---

## 7. Data Flow Per Interaction

### Creating a Project
```
User Input (title)
      │
      ▼
createProject() [useStore.ts]
      │
      ▼
New Project object constructed (UUID, title, status: "draft", version v0.1)
      │
      ▼
Zustand state updated
      │
      ▼
localStorage updated (via persist middleware)
      │
      ▼
Router navigates to /project/[id]/wizard
```

### Saving a Wizard Answer
```
User types in TextArea
      │
      ▼
setResponse() / updateResponse() [useStore.ts]
      │
      ▼
Response object updated:
  { stepId, question, answer, isComplete: true }
      │
      ▼
Zustand state updated
      │
      ▼
localStorage updated
      │
      ▼
ProgressBar re-renders with updated getCompletionPercentage()
```

### Generating Documents
```
User selects doc types + clicks Generate
      │
      ▼
generateDocuments([docTypes]) [useStore.ts]
      │
      ├─ For each selected doc type:
      │       │
      │       ▼
      │  generateDocumentContent(docType, responses, projectTitle)
      │       │
      │       ▼
      │  Hardcoded Markdown template string
      │  + wizard answers injected by step ID
      │       │
      │       ▼
      │  GeneratedDocument object created:
      │    { id, docType, title, content, generatedAt, exportCount: 0 }
      │
      ▼
All documents saved to project.versions[active].documents[]
      │
      ▼
Project status updated to "documents_generated"
      │
      ▼
localStorage updated
      │
      ▼
Router navigates to /project/[id]/documents
```

### Exporting a Document
```
User clicks "Download" on a document
      │
      ▼
Markdown string retrieved from store
      │
      ▼
Blob created from string (type: text/markdown)
      │
      ▼
Browser download triggered ([doc-type].md)
      │
      ▼
exportCount incremented in store
      │
      ▼
localStorage updated
      │
      ▼
Toast notification shown ("Downloaded successfully")
```

---

## 8. UI Components Per Step

| Page / Step | Components Used |
|---|---|
| Dashboard | `Button`, `Toast`, project card elements |
| Project Creation | `Modal`, `Button`, text input |
| Wizard (all steps) | `ProgressBar`, `TextArea`, `Button`, `Toast` |
| Review | `AssumptionBadge`, `Button`, `Toast` |
| Generate | `Button`, toggle/checkbox inputs, `Toast` |
| Documents | `react-markdown` renderer, `Button`, `Toast` |
| Settings | `Button`, `Modal`, text inputs, `Toast` |

### Component Roles

| Component | Purpose |
|---|---|
| `Button.tsx` | 4 variants (primary, secondary, danger, ghost); used for all CTAs |
| `TextArea.tsx` | Auto-resizing input with character count; used in wizard and settings |
| `ProgressBar.tsx` | Visual tracker for wizard step completion (e.g., Step 3 of 7) |
| `Modal.tsx` | Overlay dialog for project creation and confirmations |
| `Toast.tsx` | Non-blocking notification; auto-dismisses after 5 seconds |
| `AssumptionBadge.tsx` | Displays a single inferred assumption with Confirm / Dismiss actions |

---

## 9. Complete Happy Path (End-to-End)

Below is the ideal, uninterrupted user journey from first load to final document export.

```
Step 1 ── Open the app
           └── User lands on Dashboard (/)
               └── Empty state shown ("No projects yet")

Step 2 ── Create a project
           └── Click "Create New Project"
               └── Modal appears
                   └── User types: "FitTrack — Fitness Tracker App"
                       └── Click "Create"
                           └── Project created, navigated to /project/[id]/wizard

Step 3 ── Complete the 7-step wizard
           └── Step 1: "A mobile app that helps users track daily workouts..."
               └── Step 2: "Fitness enthusiasts aged 20–40..."
                   └── Step 3: "People struggle to stay consistent without..."
                       └── Step 4: "Workout logging, progress charts, reminders..."
                           └── Step 5: "iOS and Android (React Native)"
                               └── Step 6: "3-month timeline, solo developer"
                                   └── Step 7: "10,000 active users by month 3..."
                                       └── Wizard complete, progress bar = 100%

Step 4 ── Review answers
           └── Navigated to /project/[id]/review
               └── All 7 answers displayed
                   └── Assumption shown: "Likely uses push notifications"
                       └── User clicks "Confirm" on assumption
                           └── Click "Confirm & Generate"
                               └── Project status → discovery_complete
                                   └── Navigated to /project/[id]/generate

Step 5 ── Select documents and generate
           └── User toggles ON: PRD, Architecture, Roadmap
               └── User leaves OFF: User Stories, API Spec
                   └── Click "Generate Selected Documents"
                       └── generateDocuments() runs
                           └── 3 documents generated
                               └── Project status → documents_generated
                                   └── Navigated to /project/[id]/documents

Step 6 ── Read and export
           └── PRD tab active by default
               └── User reads the generated PRD (rendered Markdown)
                   └── User clicks "Copy" → clipboard populated, Toast shown
                       └── User switches to Roadmap tab
                           └── User clicks "Download" → roadmap.md saved
                               └── exportCount incremented to 1
```

**Total time for happy path:** Approximately 5–15 minutes depending on answer depth.

---

## 10. Alternative Paths & Edge Cases

### 10.1 Partial Wizard Completion
- The user does not need to complete all 7 steps before proceeding.
- `getCompletionPercentage()` reflects how many of the 7 steps have a non-empty answer.
- On the Review page, incomplete steps are shown with a visual indicator.
- Document generation proceeds with whatever answers are available; unanswered steps result in empty or template-default sections in the output.

### 10.2 Editing Answers After Review
- User can navigate from Review back to any wizard step via the "Edit" link.
- Updating an answer calls `updateResponse()`, which overwrites the previous value.
- If documents have already been generated, they are **not automatically regenerated**. The user must manually return to the Generate page to regenerate.

### 10.3 Regenerating Documents
- A user may want to regenerate after editing answers.
- They must navigate back to `/project/[id]/generate`, re-select document types, and click "Generate" again.
- Each generation overwrites the previously generated document of that type.

### 10.4 Multiple Projects
- Users can have multiple projects simultaneously.
- Switching between projects is done via the Dashboard.
- `currentProjectId` is updated in the Zustand store on project selection.
- All projects persist independently in `localStorage`.

### 10.5 Browser Storage Cleared
- If the user clears browser data or `localStorage`, **all projects are permanently lost**.
- There is no recovery mechanism in v0.1.0 (no cloud sync, no export-and-reimport).
- Toast notifications do not warn the user about this risk.

### 10.6 Dismissing All Assumptions
- User can dismiss every auto-generated assumption on the Review page.
- This does not block them from proceeding; it simply reduces context injected into document templates.

### 10.7 Generating Only One Document
- Users can select a single document type (e.g., only the PRD).
- Generation runs only for that type; other document slots remain empty.
- The Documents page will only show tabs for generated documents.

### 10.8 Page Refresh Mid-Wizard
- Because Zustand persists to `localStorage`, a page refresh restores the wizard state.
- The user will return to the same step they were on, with their previous answers intact.
- Current step position may reset to step 1 depending on navigation state implementation.

### 10.9 Accessing a Non-Existent Project URL
- If a user navigates to `/project/[invalid-id]`, the project will not be found in state.
- Behaviour is undefined in v0.1.0 (likely a blank or error render).

---

## 11. Current System Limitations

These limitations are documented here to clarify where the current user flow has gaps that affect the experience.

| Limitation | User Impact |
|---|---|
| **No user accounts** | Data is device-local only; cannot be shared, backed up, or accessed from another device |
| **No AI generation** | Documents use static string templates; Architecture and User Stories are not meaningfully tailored to user inputs |
| **No feedback mechanism** | Users cannot rate, edit, or flag generated content — all output is final |
| **No real-time collaboration** | Only one person can work on a project at a time, on one browser |
| **No document editing in-app** | Users must copy/download and edit externally; edits are not stored |
| **No search or filter** | On the Dashboard, there is no way to search or filter projects |
| **No undo** | Deleted projects cannot be recovered |
| **No onboarding** | New users arrive at a blank Dashboard with no guidance |
| **localStorage cap** | Browser storage has a ~5MB limit; many large projects could exceed this |
| **No version diffing** | Multiple versions exist in the data model, but there is no UI to compare them |

---

## 12. Future State User Flow (AI-Powered)

The following describes the intended user flow once the self-learning AI architecture (described in the knowledge base) is implemented across Phases 0–4.

### 12.1 Authentication Flow (Phase 0)

```
User visits app
      │
      ├── [Returning user] → Login page (/auth/login)
      │         └── Enter email + password (or OAuth)
      │               └── Session established
      │                     └── Redirect to Dashboard
      │
      └── [New user] → Signup page (/auth/signup)
                └── Enter email + password
                      └── Account created
                            └── Redirect to Dashboard (empty state)
```

- Projects will be stored in **Supabase (PostgreSQL)**, not `localStorage`.
- Data will sync across devices in real time via Supabase Realtime.
- User identity enables cross-device access and future team collaboration.

### 12.2 AI-Powered Document Generation (Phase 1)

```
User completes wizard
      │
      ▼
Wizard answers embedded (OpenAI text-embedding-3-small)
      │
      ▼
Vector similarity search runs:
  "Find top-5 most similar past projects"
      │
      ▼
RAG context built:
  [Example 1: similar project PRD (high quality score)]
  [Example 2: similar project Architecture]
      │
      ▼
Dynamic prompt constructed:
  System: "You are a senior product manager..."
  User: [wizard answers] + [similar project examples]
      │
      ▼
LLM call (GPT-4o / Claude Sonnet, temp: 0.3)
      │
      ▼
Output validation:
  - Placeholder text scan
  - Section completeness check
  - Coherence score via secondary LLM call
      │
      ▼
Document stored with:
  { content, prompt_hash, model_id, quality_score }
      │
      ▼
User views AI-generated document
```

### 12.3 Feedback Collection Flow (Phase 3)

After viewing generated documents, users will be able to:

```
View generated document
      │
      ├── Rate the full document (1–5 stars)
      │         └── Stored as feedback_event { event_type: "doc_rating" }
      │
      ├── Rate individual sections (thumbs up / thumbs down)
      │         └── Stored as feedback_event { event_type: "section_rating" }
      │
      ├── Edit document content in-app
      │         └── Diff between original and edited computed + stored
      │               └── Stored as feedback_event { event_type: "edit" }
      │
      ├── Copy a section
      │         └── Stored as feedback_event { event_type: "copy" }
      │
      └── Export document
                └── Stored as feedback_event { event_type: "export" }
                      └── exportCount incremented
```

### 12.4 Continuous Improvement (Background — User-Invisible)

```
Every night (automated cron job):
  1. Aggregate feedback_events from last 24 hours
  2. Compute average quality score per document type + prompt version
  3. Identify lowest-rated sections
  4. Extract high-rated docs as golden samples
  5. Run prompt optimizer on underperforming sections
  6. A/B test new prompt at 50% traffic
  7. If new prompt quality > old + threshold → promote
  8. If quality drops > 10% → trigger degradation alert
  9. Refresh knowledge patterns table
  10. Rebuild embeddings index for new projects
```

This background process improves document quality over time without any user action.

### 12.5 Future Admin Flow (Phase 4)

Internal users (admins/developers) will have access to:

```
/admin/analytics   → Quality score trends by doc type, over time
/admin/prompts     → View, edit, and A/B test prompt versions
/admin/knowledge   → Explore detected patterns across all projects
```

---

## Summary

| Phase | User Experience |
|---|---|
| **v0.1.0 (Now)** | Answer 7 questions → receive static template documents → copy or download |
| **Phase 1 (AI Core)** | Answer 7 questions → receive LLM-generated documents tailored to your inputs |
| **Phase 2 (RAG)** | Generation is informed by similar past projects → higher quality, more relevant output |
| **Phase 3 (Feedback)** | Users can rate, edit, and signal quality → system learns from every interaction |
| **Phase 4 (Full Learning)** | Every generation is better than the last → self-improving documentation engine |

---

> **Document maintained by:** Brainstormer Product Team
> **Based on:** `knowledge_base.md` v1.0.0
> **Next update:** After Phase 1 implementation is complete
