# Brainstormer — Bug Fixes + IBM-Inspired Design System Spec

> **Version:** 4.0.0  
> **Status:** Ready for implementation  
> **Scope:** 10 confirmed bug fixes + IBM Carbon-inspired visual redesign  
> **Build order:** Bugs first (Phase 1), then design system (Phase 2)

---

## Decisions Made

| Decision | Choice | Rationale |
|---|---|---|
| IBM adherence | IBM-inspired, not strict | Keep Tailwind as implementation; adopt IBM visual language |
| Primary color | IBM Blue `#0f62fe` | Replace current sky-blue; IBM's signature interactive color |
| Build order | Bugs first, then design | Stable foundation before visual overhaul |
| Non-PRD AI actions | Improve + Ask AI only | Regenerate too destructive for structured docs |
| Version restore | Full restore | View-only version history is confusing UX |

---

# Phase 1 — Bug Fixes

## Bug 1 — Settings Page Cannot Save Title or Description

### Problem
`settings/page.tsx` has title and description inputs wired to local state but no Save button and no `updateProject` store action. Changes are silently lost on navigation.

### Requirements
1. Add `updateProject(projectId, { title, description })` action to `useStore.ts`
2. Add Save button to the Project Details card
3. On save: call `updateProject`, show success toast, update `updatedAt`
4. Disable Save when title is empty or values are unchanged
5. Show inline validation error if title is cleared

### Acceptance Criteria
- [ ] Changing title + clicking Save persists across navigation
- [ ] Changing description + clicking Save persists it
- [ ] Save is disabled when nothing has changed
- [ ] Empty title shows inline error and blocks save
- [ ] Success toast appears after save

---

## Bug 2 — Export Count Never Increments

### Problem
`GeneratedDocument.exportCount` is displayed as "Exported X times" but `handleDownload` and `handleCopyMarkdown` never increment it. Always shows 0.

### Requirements
1. Add `incrementExportCount(projectId, documentId)` action to `useStore.ts`
2. Call in `handleDownload` after file download triggers
3. Call in `handleCopyMarkdown` after clipboard write

### Acceptance Criteria
- [ ] Downloading increments export count by 1
- [ ] Copying markdown increments export count by 1
- [ ] Count updates immediately in the sidebar
- [ ] Persists across page refreshes

---

## Bug 3 — Review Page Hides Follow-up Answers

### Problem
`review/page.tsx` renders only `response.answer`. `followUpQuestion` and `followUpAnswer` are never shown.

### Requirements
1. After each main answer, conditionally render follow-up block if `response.followUpQuestion` exists:
   - `followUpSkipped === true`: show "Follow-up skipped" in muted text
   - `followUpAnswer` exists: show question as label + answer below
   - Neither: show nothing
2. Style as indented, smaller text — visually subordinate to main answer

### Acceptance Criteria
- [ ] Step with follow-up answer shows both question and answer
- [ ] Skipped follow-up shows "Follow-up skipped"
- [ ] No follow-up triggered shows nothing extra
- [ ] Follow-up block is visually distinct but associated with the same step

---

## Bug 4 + Bug 5 — Non-PRD Documents Have No Per-Section AI Actions

### Problem
Only PRD gets `PRDSectionView`. Architecture, User Stories, API Spec, and Roadmap render as plain `MarkdownRenderer` with no per-section AI actions.

### Requirements
1. Rename `parsePRDSections` to `parseDocumentSections` in `documents/page.tsx`
2. Apply `parseDocumentSections` to all 5 document types
3. Add `disableRegenerate?: boolean` prop to `PRDSectionView`
4. When `disableRegenerate` is true, hide Regenerate button in `ActionBar`
5. Pass `disableRegenerate={selectedDoc.type !== 'prd'}` to all `PRDSectionView` instances

### Acceptance Criteria
- [ ] Architecture, User Stories, API Spec, Roadmap render sections with Improve + Ask AI
- [ ] PRD retains Improve + Ask AI + Regenerate
- [ ] Non-PRD sections have no Regenerate button

---

## Bug 6 — Document Headings Are Styled Yellow

### Problem
`MarkdownRenderer.tsx` styles `h1`–`h4` as `text-yellow-600` — a leftover from a theme experiment.

### Requirements
- `h1`–`h4`: `text-yellow-600` → `text-primary-700`
- `ul`/`ol` markers: `marker:text-yellow-600` → `marker:text-primary-500`
- Blockquote border: `border-yellow-500` → `border-primary-400`
- Blockquote background: `bg-yellow-50/50` → `bg-primary-50/50`

### Acceptance Criteria
- [ ] All headings render in primary blue
- [ ] List markers render in primary blue
- [ ] Blockquote uses primary blue tones
- [ ] No yellow styling remains in `MarkdownRenderer.tsx`

---

## Bug 7 — MarkdownRenderer `inline` Prop Deprecation Warning

### Problem
`MarkdownRenderer.tsx` uses `({ node, inline, ...props }: any)` for the `code` component. The `inline` prop was removed in react-markdown v9, producing a console warning.

### Requirements
1. Replace `inline` prop check with v9 pattern using `node` parent check
2. Remove `: any` cast — use proper `Components` typing

### Acceptance Criteria
- [ ] No React warning about unknown `inline` prop in console
- [ ] Inline code and block code still render with correct styles
- [ ] No `any` cast on the code component

---

## Feature 8 — Version Restore Does Not Work

### Problem
`settings/page.tsx` shows version history as display-only. No way to switch to a previous version.

### Requirements
1. Add `restoreVersion(projectId, versionId)` action to `useStore.ts`:
   - Set `isCurrent: false` on all versions
   - Set `isCurrent: true` on target version
   - Load target version's `responses` into Zustand state
2. Add Restore button next to each non-current version
3. On click: show confirmation modal
4. On confirm: call `restoreVersion`, show success toast, navigate to `/project/[id]`
5. Current version shows "Current" badge only — no Restore button

### Acceptance Criteria
- [ ] Non-current versions show Restore button
- [ ] Clicking Restore shows confirmation modal
- [ ] Confirming restores responses + flips `isCurrent`
- [ ] Wizard shows restored version's answers after restore
- [ ] Restored version marked "Current" in list

---

## Feature 9 — AI Suggestions Only Available for PRD

### Problem
The AI Suggestions panel is gated to PRD only. Other doc types have no suggestions.

### Requirements
1. Remove PRD-only gate on suggestions button in `documents/page.tsx`
2. Pass current document's `type` to `fetchAiSuggestions`
3. Update `/api/ai-suggestions/route.ts` to accept `doc_type` and adjust framing:
   - `architecture`: technical improvements, stack decisions, scalability
   - `user_stories`: missing stories, edge cases, AC gaps
   - `api_spec`: missing endpoints, auth improvements, error handling
   - `roadmap`: phasing improvements, risk mitigation, milestone clarity
   - `prd`: existing behavior unchanged
4. Update "Add to PRD" → "Add to Document" in `AiSuggestionsPanel`

### Acceptance Criteria
- [ ] Suggestions button appears for all 5 document types
- [ ] Architecture doc returns architecture-relevant suggestions
- [ ] Add button label reflects current document type
- [ ] Suggestions panel works identically for all doc types

---

# Phase 2 — IBM-Inspired Design System

## Design Principles

IBM Carbon characteristics to adopt using Tailwind (no `@carbon/react` package):

| Principle | IBM Carbon | Implementation |
|---|---|---|
| Color | Cool grays + IBM Blue `#0f62fe` | Replace sky-blue primary with IBM Blue scale |
| Typography | IBM Plex Sans | Add via Google Fonts in `layout.tsx` |
| Corners | Sharp / minimal (0–4px) | Replace `rounded-xl`, `rounded-lg` with `rounded-none` or `rounded` |
| Borders | Subtle 1px cool gray | `border-gray-200` → `border-gray-300` (IBM Gray 20) |
| Shadows | Minimal — flat design | Remove heavy shadows; border-defined surfaces |
| Density | Compact, information-dense | Tighten card padding |
| Buttons | Rectangular | `rounded-none` for all buttons |
| Background | IBM Gray 10 `#f4f4f4` | Replace `bg-gray-50` |

## IBM Color Palette

### Primary Scale (replaces current sky-blue)
```
primary-10:  #edf5ff   IBM Blue 10
primary-20:  #d0e2ff   IBM Blue 20
primary-30:  #a6c8ff   IBM Blue 30
primary-40:  #78a9ff   IBM Blue 40
primary-50:  #4589ff   IBM Blue 50
primary-60:  #0f62fe   IBM Blue 60 — main interactive
primary-70:  #0043ce   IBM Blue 70
primary-80:  #002d9c   IBM Blue 80
primary-90:  #001d6c   IBM Blue 90
primary-100: #001141   IBM Blue 100
```

### Gray Scale (IBM Cool Gray — replaces Tailwind default gray)
```
gray-10:  #f4f4f4   page background
gray-20:  #e0e0e0   borders, dividers
gray-30:  #c6c6c6
gray-40:  #a8a8a8
gray-50:  #8d8d8d   placeholder text
gray-60:  #6f6f6f
gray-70:  #525252   secondary text
gray-80:  #393939   primary text
gray-90:  #262626   headings
gray-100: #161616   max contrast
```

## Component Changes

### `tailwind.config.js`
- Replace `primary` scale with IBM Blue values above
- Extend `colors.gray` with IBM Cool Gray values above
- Add `fontFamily: { sans: ['IBM Plex Sans', 'system-ui', 'sans-serif'] }`

### `globals.css`
- Page background: `bg-gray-50` → `bg-[#f4f4f4]`
- `.card`: `rounded-xl` → `rounded-none`, `shadow-sm` → `shadow-none`, border `border-gray-200` → `border-gray-300`
- Add `@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap')` at top

### `layout.tsx`
- Add `font-sans` class to `<body>`
- Update `<html lang="en">` metadata

### `Button.tsx`
- All variants: `rounded-lg` → `rounded-none`
- Primary: `bg-primary-600` → `bg-primary-60`, hover `bg-primary-70`, focus ring `ring-primary-60`
- Secondary: `border-gray-300 bg-white text-gray-700` → `border-primary-60 text-primary-60 bg-transparent` hover `bg-primary-10`
- Ghost: `text-gray-600 hover:bg-gray-100` → `text-primary-60 hover:bg-primary-10`
- Danger: keep red, apply `rounded-none`

### `TextArea.tsx`
- Remove `rounded-lg`, add `rounded-none`
- Border: `border border-gray-300` → `border-0 border-b-2 border-b-gray-400`
- Background: `bg-white` → `bg-[#f4f4f4]`
- Focus: `focus:ring-2 focus:ring-primary-500` → `focus:border-b-primary-60 focus:outline-none`

### `Modal.tsx`
- Container: `rounded-xl` → `rounded-none`
- Header: add `bg-[#161616] text-white` (IBM modal dark header pattern)
- Remove drop shadow, use border

### `Toast.tsx`
- Container: `rounded-lg` → `rounded-none`
- Replace background tint with left-border accent:
  - Success: `border-l-4 border-l-green-500 bg-white text-gray-800`
  - Error: `border-l-4 border-l-red-600 bg-white text-gray-800`
  - Warning: `border-l-4 border-l-yellow-500 bg-white text-gray-800`
  - Info: `border-l-4 border-l-primary-60 bg-white text-gray-800`

### `ProgressBar.tsx`
- Track: `bg-gray-200` → `bg-[#e0e0e0]`
- Fill: `bg-primary-500` → `bg-[#0f62fe]`
- Active step label: `text-primary-700` → `text-[#0f62fe]`

### `MarkdownRenderer.tsx`
- Headings: already being fixed in Phase 1 to `text-primary-700` — Phase 2 updates to `text-[#161616]`
- Code block header: keep `bg-gray-800` (already dark)

### `PRDSectionView.tsx` Action Bar
- Action bar: `rounded-full` → `rounded-none`
- Active button states: IBM Blue

### `AiSuggestionsPanel.tsx`
- Drawer header: `bg-white` → `bg-[#f4f4f4]`
- Border: `border-l border-gray-200` → `border-l border-[#e0e0e0]`

### `SectionAskPanel.tsx`
- User message bubbles: `rounded-lg` → `rounded-none`, `bg-primary-600` → `bg-[#0f62fe]`
- Assistant message bubbles: `rounded-lg` → `rounded-none`, `bg-gray-100` → `bg-[#f4f4f4]`

### Page-level changes

**Dashboard (`page.tsx`)**
- Filter tabs: replace pill buttons with IBM tab bar — `border-b-2 border-b-[#0f62fe]` for active, no background fill
- Project cards: `rounded-xl` → `rounded-none`, hover `border-[#0f62fe]`
- Status badges: `rounded-full` → `rounded-none px-2 py-0.5`

**Documents page (`documents/page.tsx`)**
- Sidebar: `bg-gray-50` → `bg-[#f4f4f4]`, `border-r border-gray-200` → `border-r border-[#e0e0e0]`
- Selected doc item: add `border-l-2 border-l-[#0f62fe] bg-white` (IBM left-border selection)
- Unselected: `hover:bg-[#e0e0e0]`

**Wizard page (`wizard/page.tsx`)**
- Step indicator: IBM-style numbered steps with connecting line
- Input area: IBM form field style (bottom border only via TextArea changes)

**All page headers**
- `bg-white border-b border-gray-200` → `bg-white border-b border-[#e0e0e0]`
- Page titles: `text-gray-900` → `text-[#161616]` font-semibold
- Back/nav links: `text-gray-500` → `text-[#0f62fe]`

---

## Implementation Order

### Phase 1 — Bug Fixes

**Step 1 — Bugs 6 + 7: MarkdownRenderer (zero risk)**
1. Fix heading colors: `text-yellow-600` → `text-primary-700` on h1–h4
2. Fix list markers and blockquote colors
3. Fix `inline` prop deprecation in code component

**Step 2 — Bug 1: Settings save**
4. Add `updateProject(projectId, fields)` to `useStore.ts`
5. Add Save button with disabled state + validation to `settings/page.tsx`

**Step 3 — Bug 2: Export count**
6. Add `incrementExportCount(projectId, documentId)` to `useStore.ts`
7. Call in `handleDownload` and `handleCopyMarkdown`

**Step 4 — Bug 3: Review page follow-ups**
8. Render `followUpQuestion` + `followUpAnswer` below each main answer
9. Handle skipped state

**Step 5 — Bugs 4 + 5: Non-PRD section AI actions**
10. Rename `parsePRDSections` → `parseDocumentSections`
11. Apply to all 5 doc types
12. Add `disableRegenerate` prop to `PRDSectionView`
13. Pass `disableRegenerate={selectedDoc.type !== 'prd'}` everywhere

**Step 6 — Feature 8: Version restore**
14. Add `restoreVersion(projectId, versionId)` to `useStore.ts`
15. Add Restore button + confirmation modal to `settings/page.tsx`

**Step 7 — Feature 9: AI suggestions for all doc types**
16. Remove PRD-only gate on suggestions button
17. Pass `doc_type` through to API route
18. Update API route with per-type suggestion framing
19. Update "Add to PRD" → "Add to Document"

### Phase 2 — IBM Design System

**Step 8 — Design tokens**
20. Update `tailwind.config.js`: IBM Blue primary scale, IBM Cool Gray, IBM Plex Sans font family
21. Update `globals.css`: IBM Gray 10 background, Google Fonts import, card component

**Step 9 — Core components**
22. Update `Button.tsx`: `rounded-none`, IBM Blue colors
23. Update `TextArea.tsx`: bottom-border style, IBM input background
24. Update `Modal.tsx`: `rounded-none`, dark header
25. Update `Toast.tsx`: left-border notification style
26. Update `ProgressBar.tsx`: IBM Gray track, IBM Blue fill

**Step 10 — Layout + pages**
27. Update `layout.tsx`: IBM Plex Sans font, body class
28. Update dashboard `page.tsx`: IBM tab filters, flat cards, rectangular badges
29. Update all page headers across all routes

**Step 11 — Feature pages**
30. Update `documents/page.tsx`: IBM sidebar, left-border selection
31. Update `PRDSectionView.tsx`: rectangular action bar
32. Update `AiSuggestionsPanel.tsx`: IBM drawer style
33. Update `SectionAskPanel.tsx`: IBM chat bubble style
34. Update `wizard/page.tsx`: IBM form style
35. Update `review/page.tsx`: IBM list style
36. Update `settings/page.tsx`: IBM form inputs

**Step 12 — Final audit**
37. Search all files for `rounded-xl`, `rounded-lg` → replace with `rounded-none` or `rounded`
38. Search for `shadow-lg`, `shadow-md` → replace with `shadow-none` or `shadow-sm`
39. Search for `text-gray-*` → update to IBM Gray equivalents where appropriate
40. Run dev server, verify visual consistency across all pages

---

## Files Changed

### Phase 1
| File | Change |
|---|---|
| `src/components/ui/MarkdownRenderer.tsx` | Fix heading colors, fix inline prop |
| `src/store/useStore.ts` | Add `updateProject`, `incrementExportCount`, `restoreVersion` |
| `src/app/project/[id]/settings/page.tsx` | Save button, Restore version button + modal |
| `src/app/project/[id]/review/page.tsx` | Show follow-up Q&A |
| `src/app/project/[id]/documents/page.tsx` | Rename parseSections, all-doc AI actions, suggestions gate |
| `src/components/ui/PRDSectionView.tsx` | Add `disableRegenerate` prop |
| `src/components/ui/AiSuggestionsPanel.tsx` | "Add to Document" label |
| `src/app/api/ai-suggestions/route.ts` | Accept `doc_type`, per-type framing |

### Phase 2
| File | Change |
|---|---|
| `tailwind.config.js` | IBM Blue primary, IBM Cool Gray, IBM Plex Sans |
| `src/app/globals.css` | IBM Gray 10 background, font import, card component |
| `src/app/layout.tsx` | Font class on body |
| `src/components/ui/Button.tsx` | `rounded-none`, IBM Blue |
| `src/components/ui/TextArea.tsx` | Bottom-border style |
| `src/components/ui/Modal.tsx` | `rounded-none`, dark header |
| `src/components/ui/Toast.tsx` | Left-border notification style |
| `src/components/ui/ProgressBar.tsx` | IBM Gray + Blue |
| `src/app/page.tsx` | IBM tab filters, flat cards |
| `src/app/project/[id]/documents/page.tsx` | IBM sidebar, left-border selection |
| `src/app/project/[id]/wizard/page.tsx` | IBM form style |
| `src/app/project/[id]/review/page.tsx` | IBM list style |
| `src/app/project/[id]/settings/page.tsx` | IBM form inputs |
| `src/components/ui/PRDSectionView.tsx` | Rectangular action bar |
| `src/components/ui/AiSuggestionsPanel.tsx` | IBM drawer style |
| `src/components/ui/SectionAskPanel.tsx` | IBM chat style |

---

## Out of Scope

- Installing `@carbon/react` npm package
- Real AI integration (separate spec)
- Supabase / authentication (separate spec)
- New document types (separate spec)
- Mobile responsive overhaul
