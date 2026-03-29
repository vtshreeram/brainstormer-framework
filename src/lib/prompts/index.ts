import { DocumentType, Response } from '@/types';

export interface PromptContext {
  projectTitle: string;
  responses: Record<string, Response>;
  similarProjects?: {
    title: string;
    content: string;
    qualityScore: number;
  }[];
}

const SYSTEM_PROMPT = `You are a senior product manager with 10 years of experience writing clear, actionable product documentation. You write developer-ready documents with specific details — never vague placeholder text. Always use Markdown format.`;

export function buildPrdPrompt(ctx: PromptContext): string {
  const { projectTitle, responses, similarProjects } = ctx;

  const step1 = responses['step_1']?.answer || '';
  const step2 = responses['step_2']?.answer || '';
  const step3 = responses['step_3']?.answer || '';
  const step4 = responses['step_4']?.answer || '';
  const step5 = responses['step_5']?.answer || '';
  const step6 = responses['step_6']?.answer || '';
  const step7 = responses['step_7']?.answer || '';

  let context = '';
  if (similarProjects && similarProjects.length > 0) {
    context += '\n\n## Similar Projects (for reference)\n';
    for (const proj of similarProjects.slice(0, 2)) {
      context += `\n### ${proj.title} (quality: ${proj.qualityScore})\n${proj.content.substring(0, 500)}...\n`;
    }
  }

  return `${SYSTEM_PROMPT}

Generate a comprehensive Product Requirements Document for:

**Project Name:** ${projectTitle}

**The Idea (Step 1):**
${step1 || '[Not provided]'}

**Target Users (Step 2):**
${step2 || '[Not provided]'}

**Core Problem (Step 3):**
${step3 || '[Not provided]'}

**Key Features (Step 4):**
${step4 || '[Not provided]'}

**Platform (Step 5):**
${step5 || '[Not provided]'}

**Timeline & Team (Step 6):**
${step6 || '[Not provided]'}

**Success Metrics (Step 7):**
${step7 || '[Not provided]'}
${context}

Generate a complete PRD with these sections:
1. Executive Summary
2. Problem Statement
3. Target Users & Personas
4. Core Features (with specific details, no placeholders)
5. User Flows
6. Technical Constraints
7. Success Metrics (measurable, time-bound)
8. Out of Scope (MVP boundaries)

Be specific based on the inputs provided. Do not invent features or details not mentioned.`;
}

export function buildArchitecturePrompt(ctx: PromptContext): string {
  const { projectTitle, responses } = ctx;

  const step1 = responses['step_1']?.answer || '';
  const step4 = responses['step_4']?.answer || '';
  const step5 = responses['step_5']?.answer || '';
  const step6 = responses['step_6']?.answer || '';

  return `${SYSTEM_PROMPT}

Generate a detailed Technical Architecture document for:

**Project Name:** ${projectTitle}

**What it does:**
${step1 || '[Not provided]'}

**Key Features:**
${step4 || '[Not provided]'}

**Platform:**
${step5 || '[Not provided]'}

**Timeline & Team:**
${step6 || '[Not provided]'}

Generate a complete architecture document with:
1. System Overview
2. Technology Stack (specific technologies based on platform requirements)
3. Data Model (with field names and types)
4. API Endpoints (specific routes with methods)
5. Authentication & Security
6. Infrastructure
7. Scalability Considerations

Base stack recommendations on the platform choices. Be specific about technology choices, not vague like "use a database".`;
}

export function buildUserStoriesPrompt(ctx: PromptContext): string {
  const { projectTitle, responses } = ctx;

  const step1 = responses['step_1']?.answer || '';
  const step2 = responses['step_2']?.answer || '';
  const step4 = responses['step_4']?.answer || '';

  return `${SYSTEM_PROMPT}

Generate detailed User Stories with Acceptance Criteria for:

**Project Name:** ${projectTitle}

**What it does:**
${step1 || '[Not provided]'}

**Target Users:**
${step2 || '[Not provided]'}

**Key Features:**
${step4 || '[Not provided]'}

Generate user stories in this format:
1. **As a** [persona], **I want to** [action], **so that** [benefit]
   - **Acceptance Criteria:**
     - Given [context], when [action], then [result]
     - Given [context], when [action], then [result]

Cover the full user journey from onboarding to core actions. Include:
- Onboarding stories
- Core feature stories (at least 3-5)
- Error/edge case stories
- Empty state stories

Prioritize stories as P0 (MVP), P1 (important), P2 (nice-to-have).`;
}

export function buildApiSpecPrompt(ctx: PromptContext): string {
  const { projectTitle, responses } = ctx;

  const step1 = responses['step_1']?.answer || '';
  const step4 = responses['step_4']?.answer || '';
  const step5 = responses['step_5']?.answer || '';

  return `${SYSTEM_PROMPT}

Generate a complete API Specification document for:

**Project Name:** ${projectTitle}

**What it does:**
${step1 || '[Not provided]'}

**Key Features (these define the API scope):**
${step4 || '[Not provided]'}

**Platform:**
${step5 || '[Not provided]'}

Generate a complete API spec with:
1. Authentication (specific method, headers)
2. Endpoints table (Method, Path, Description, Auth required)
3. For each endpoint: request/response schemas
4. Error handling (standard error envelope format)
5. Rate limiting (specific limits)
6. Pagination (if list endpoints exist)

Use REST conventions. Be specific about endpoint paths, HTTP methods, and response shapes.`;
}

export function buildRoadmapPrompt(ctx: PromptContext): string {
  const { projectTitle, responses } = ctx;

  const step1 = responses['step_1']?.answer || '';
  const step4 = responses['step_4']?.answer || '';
  const step6 = responses['step_6']?.answer || '';

  return `${SYSTEM_PROMPT}

Generate an Implementation Roadmap for:

**Project Name:** ${projectTitle}

**What it does:**
${step1 || '[Not provided]'}

**Key Features:**
${step4 || '[Not provided]'}

**Timeline & Team:**
${step6 || '[Not provided]'}

Generate a phased roadmap with:
1. **Phase 1: MVP (Weeks 1-4 or as specified)**
   - Core features for launch
   - Success criteria
2. **Phase 2: Enhanced Features (Weeks 5-8 or next phase)**
   - Secondary features
   - Improvements based on MVP feedback
3. **Phase 3: Polish & Launch (Weeks 9-12 or final phase)**
   - Launch preparation
   - Post-launch monitoring

Include milestone dates, team allocation, and explicit exit criteria for each phase.`;
}

export function buildPrompt(
  docType: DocumentType,
  ctx: PromptContext
): string {
  switch (docType) {
    case 'prd':
      return buildPrdPrompt(ctx);
    case 'architecture':
      return buildArchitecturePrompt(ctx);
    case 'user_stories':
      return buildUserStoriesPrompt(ctx);
    case 'api_spec':
      return buildApiSpecPrompt(ctx);
    case 'roadmap':
      return buildRoadmapPrompt(ctx);
    default:
      throw new Error(`Unknown document type: ${docType}`);
  }
}

export const DOCUMENT_TITLES: Record<DocumentType, string> = {
  prd: 'Product Requirements Document',
  architecture: 'Technical Architecture',
  user_stories: 'User Stories & Acceptance Criteria',
  api_spec: 'API Specifications',
  roadmap: 'Implementation Roadmap',
};