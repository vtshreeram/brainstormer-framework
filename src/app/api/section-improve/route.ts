import { NextRequest, NextResponse } from 'next/server';

async function simulateDelay(min = 900, max = 1800) {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  await new Promise((r) => setTimeout(r, ms));
}

// ─── Improvement templates keyed by section keyword groups ───────────────────

const IMPROVE_TEMPLATES: Array<{
  keywords: string[];
  generate: (heading: string) => string;
}> = [
  {
    keywords: ['problem', 'challenge', 'pain', 'statement', 'overview'],
    generate: (heading) => `## ${heading}

### Summary
Users today face a critical gap between their expectations and what existing tools deliver. This section defines the problem with precision, grounded in user research and market analysis.

### Current State vs Desired State

| Dimension | Current State | Desired State |
|-----------|--------------|---------------|
| Time spent | 3–5 hours/week on manual workarounds | Under 30 minutes/week |
| Error rate | ~23% of outputs require correction | <3% error rate |
| User sentiment | NPS of −12 with existing tools | NPS of +45 or above |

### Root Cause Analysis
The problem is not a lack of tools — it's a lack of tools that **adapt to context**. Existing solutions are rigid and generic, forcing users to conform to the tool rather than the tool serving the user's workflow.

Key contributing factors:
- **Fragmentation**: Users rely on 3–5 disconnected tools to complete a single workflow
- **Manual overhead**: No automation for repetitive decision-making steps
- **Poor feedback loops**: Users receive no actionable insight on their mistakes

### Impact
- **On users**: Reduced productivity, increased cognitive load, frequent context-switching
- **On businesses**: Higher operational costs, slower time-to-value, increased churn risk
- **On teams**: Misalignment due to lack of a shared source of truth

### Scope
**In scope**: Core workflow inefficiencies experienced by the primary user segment on a weekly basis.
**Out of scope**: Edge-case workflows, enterprise-specific compliance requirements (addressed in a later phase).`,
  },
  {
    keywords: ['goal', 'objective', 'success', 'metric', 'kpi', 'outcome'],
    generate: (heading) => `## ${heading}

### North Star Metric
**Primary KPI**: Percentage of users who complete their core workflow within 10 minutes of onboarding — target **60% within 30 days of launch**.

### Business Objectives

| Goal | Baseline | Target | Timeline |
|------|----------|--------|----------|
| Monthly Active Users | 0 | 10,000 | Q2 2025 |
| D30 Retention | — | 65% | Q3 2025 |
| Revenue (ARR) | £0 | £500K | Q4 2025 |
| NPS | — | ≥ 45 | Q3 2025 |

### User Outcomes
Users will experience measurable improvements in three areas:

1. **Speed**: Complete core task in under 15 minutes (vs. 45+ minutes today)
2. **Confidence**: Self-reported task confidence score of ≥ 4.2/5.0
3. **Consistency**: 70% of active users engage with the product at least 3× per week

### Success Metrics by Phase

**Phase 1 — MVP (Months 1–3)**
- Activation rate ≥ 50% (users completing first meaningful action)
- Day-7 retention ≥ 40%
- Critical bug rate < 1 per 100 sessions

**Phase 2 — Growth (Months 4–6)**
- WAU growth of 15% month-over-month
- Support ticket volume < 5% of MAU
- Feature adoption rate ≥ 35% for P1 features

### Anti-Goals
To maintain focus, the following are explicitly **not** success metrics for this phase:
- Revenue per user (optimise for adoption first)
- Enterprise contract value (out of scope for v1)`,
  },
  {
    keywords: ['feature', 'requirement', 'functionality', 'capability', 'scope of work'],
    generate: (heading) => `## ${heading}

### Prioritisation Framework
Features are classified using the **MoSCoW method**. Only P0 items block launch.

---

### P0 — Must Have (MVP Blockers)

**1. Core Workflow Engine**
- Users can complete the primary task end-to-end without leaving the product
- Acceptance criteria: Task completion rate ≥ 85% in usability testing
- Edge cases: Graceful handling of incomplete inputs; auto-save every 30 seconds

**2. User Authentication & Onboarding**
- Secure sign-up/login with email and OAuth (Google, GitHub)
- Onboarding flow: ≤ 5 steps, skippable after step 2
- Acceptance criteria: 80% of test users reach first value moment without support

**3. Export & Share**
- Export output as PDF, Markdown, and plain text
- Shareable read-only link with optional password protection

---

### P1 — Should Have (Post-MVP Sprint 1)

**4. Version History**
- Store last 10 versions per document with one-click restore

**5. Collaboration (View-only)**
- Invite teammates via email; they can view and comment

**6. Search**
- Full-text search across all user documents

---

### P2 — Nice to Have (Backlog)

- AI-powered auto-completion suggestions inline
- Slack / Notion integration via webhooks
- Custom branding for exported documents

---

### Explicitly Out of Scope (v1)
- Real-time multi-user co-editing
- Mobile native app (web-responsive only)
- SAML/SSO (enterprise tier)`,
  },
  {
    keywords: ['user', 'persona', 'audience', 'target', 'segment', 'customer'],
    generate: (heading) => `## ${heading}

### Persona 1 — The Pragmatic Builder
**Role**: Product Manager / Startup Founder
**Age**: 28–40 | **Tech comfort**: High

**Jobs to be done**:
- Quickly translate a product idea into a structured, shareable document
- Align engineering and design teams without lengthy meetings

**Pain points with current tools**:
- Confluence/Notion require too much setup and free-form writing
- Templates feel generic and require heavy customisation every time
- No AI assistance — all thinking must come from the user

**Usage pattern**: 2–4 times per week, primarily during sprint planning and roadmap reviews

**Success looks like**: Opens the product, inputs a rough idea, and has a shareable PRD draft within 20 minutes.

---

### Persona 2 — The Structured Thinker
**Role**: Senior Engineer / Tech Lead
**Age**: 25–38 | **Tech comfort**: Very High

**Jobs to be done**:
- Review and challenge product requirements before implementation begins
- Understand the "why" behind each feature to make better technical decisions

**Pain points**:
- PRDs are often too vague to act on
- Requirements change without clear version history or rationale

**Usage pattern**: Consumer primarily — reads documents created by Persona 1, adds comments

**Success looks like**: Can read a generated document and immediately understand scope, priority, and open questions.

---

### Shared Characteristics
- Both users value **speed over perfection** in early stages
- Both are comfortable with Markdown and structured text
- Both have tried and abandoned at least 2 other tools in this space
- Neither wants to spend more than 5 minutes learning a new tool`,
  },
  {
    keywords: ['technical', 'architecture', 'infrastructure', 'stack', 'system', 'non-functional'],
    generate: (heading) => `## ${heading}

### Performance Requirements

| Metric | Target | Measurement Method |
|--------|--------|--------------------|
| Page load time (LCP) | < 2.5 seconds | Core Web Vitals |
| API response time (p95) | < 400ms | Server-side logging |
| Uptime SLA | 99.5% | Uptime monitoring |
| Concurrent users (MVP) | 500 without degradation | Load testing |

### Security & Compliance
- **Authentication**: OAuth 2.0 + JWT with 7-day refresh token rotation
- **Data at rest**: AES-256 encryption for all user documents
- **Data in transit**: TLS 1.3 minimum
- **GDPR**: Right to deletion, data portability export within 30 days of request
- **Secrets management**: Environment variables via Vault; no secrets in source control

### Scalability Plan
- **Storage**: Document data stored in PostgreSQL; binary assets in S3-compatible object storage
- **Scaling trigger**: Introduce read replicas when DAU exceeds 5,000
- **Caching**: Redis for session data and frequently accessed documents (TTL: 15 minutes)

### Integration Requirements
- **Third-party**: OpenAI API (GPT-4o) for AI features — fallback to mock responses if rate-limited
- **Analytics**: PostHog for product analytics (self-hosted)
- **Error monitoring**: Sentry with PII scrubbing enabled

### Constraints & Decisions
- **Framework**: Next.js 14 (App Router) — locked; no migration planned for v1
- **Deployment**: Vercel for frontend; Railway for backend services
- **Team constraint**: 2 engineers for MVP; architecture must minimise operational overhead`,
  },
  {
    keywords: ['risk', 'assumption', 'dependency', 'constraint', 'mitigation', 'issue'],
    generate: (heading) => `## ${heading}

### Risk Register

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|-----------|--------|------------|
| R1 | OpenAI API rate limits causing degraded AI features | Medium | High | Implement queue with fallback to mock responses; cache common requests |
| R2 | Low initial user adoption due to market noise | High | High | Focus on a tight ICP; leverage founder network for first 100 users |
| R3 | Scope creep extending MVP timeline by >4 weeks | Medium | Medium | Weekly scope review; strict P0/P1 gate before adding features |
| R4 | Key engineer unavailability mid-sprint | Low | High | Document architecture decisions; use mob programming for critical paths |
| R5 | Data privacy regulation changes (UK/EU) | Low | Medium | Architect for GDPR-first; monitor ICO updates quarterly |

### Assumptions
The following assumptions underpin this product plan. Each will be validated by the date noted.

| Assumption | Validation Method | Validation Date |
|------------|-------------------|-----------------|
| Users will pay for AI-assisted document creation | 20 pre-sales interviews | 2025-02-28 |
| Markdown output is acceptable to target users | Usability test with 10 users | 2025-03-15 |
| OpenAI GPT-4o quality is sufficient for PRD generation | Internal quality assessment | 2025-02-15 |
| Team can ship MVP in 8 weeks | Sprint planning estimation | 2025-02-01 |

### External Dependencies
- **OpenAI API**: Core AI functionality — monitor service status; have fallback plan
- **Vercel / Railway**: Hosting — evaluate multi-cloud strategy before Series A
- **Stripe**: Payment processing (Phase 2) — procurement in Q2`,
  },
  {
    keywords: ['timeline', 'roadmap', 'milestone', 'phase', 'sprint', 'delivery', 'schedule'],
    generate: (heading) => `## ${heading}

### Phased Delivery Plan

#### Phase 0 — Foundation (Weeks 1–2)
**Goal**: Unblock all parallel workstreams
- Finalise PRD and get stakeholder sign-off
- Set up CI/CD pipeline, environments (dev/staging/prod)
- Complete design system setup and component library
- **Gate**: All P0 features have acceptance criteria written

#### Phase 1 — MVP Build (Weeks 3–8)
**Goal**: Shippable product with core workflow complete
- Week 3–4: Auth, onboarding, and document creation flow
- Week 5–6: AI generation pipeline and document viewer
- Week 7: Export, sharing, and polish
- Week 8: Internal QA, bug fixes, performance audit
- **Gate**: Usability test with 5 users; task completion ≥ 80%

#### Phase 2 — Soft Launch (Weeks 9–10)
**Goal**: Controlled launch to first 100 users
- Invite-only access via waitlist
- Daily monitoring of error rates and user feedback
- Iterate on highest-friction points
- **Gate**: D7 retention ≥ 35%; critical bug rate < 0.5%

#### Phase 3 — Public Launch (Week 11+)
**Goal**: Open access with growth loop active
- Product Hunt launch
- Enable referral programme
- Begin content marketing

### Key Milestones

| Milestone | Target Date | Owner |
|-----------|------------|-------|
| PRD approved | 2025-02-07 | Product |
| Design handoff complete | 2025-02-21 | Design |
| Feature-complete MVP | 2025-03-28 | Engineering |
| Soft launch (100 users) | 2025-04-04 | Product |
| Public launch | 2025-04-18 | All |

### Critical Path
Auth → Document creation → AI generation → Export → Launch`,
  },
];

// ─── Generic fallback ─────────────────────────────────────────────────────────

function genericImprovement(heading: string): string {
  return `## ${heading}

### Revised Summary
This section has been restructured for clarity, completeness, and actionability. Key improvements include more precise language, explicit success criteria, and better alignment with the overall product vision.

### Context & Rationale
Understanding the "why" behind this section helps stakeholders make faster decisions. This area of the PRD directly influences how the team prioritises work and measures success.

### Detailed Breakdown

**What this covers**
A clear, scoped definition of what this section addresses — including explicit boundaries to prevent scope creep.

**Key decisions made**
- Decision 1: [Chosen approach] — rationale: minimises risk while maximising learning speed
- Decision 2: [Constraint accepted] — rationale: aligns with current team capacity and timeline
- Decision 3: [Trade-off acknowledged] — will be revisited in Phase 2

**Open questions**
The following items require stakeholder input before this section is finalised:
1. Confirmation of the primary success metric and how it will be tracked
2. Agreement on the definition of "done" for this section's scope
3. Sign-off from at least one engineer and one designer on feasibility

### Acceptance Criteria
This section is considered complete when:
- [ ] All key decisions are documented with rationale
- [ ] Open questions have owners and due dates
- [ ] At least two stakeholders have reviewed and approved`;
}

// ─── Match section to template ────────────────────────────────────────────────

function getImprovedContent(heading: string): string {
  const h = heading.toLowerCase();

  for (const template of IMPROVE_TEMPLATES) {
    if (template.keywords.some((kw) => h.includes(kw))) {
      return template.generate(heading);
    }
  }

  return genericImprovement(heading);
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { section_heading, section_content } = body as {
      section_heading?: string;
      section_content?: string;
    };

    if (!section_heading || !section_content) {
      return NextResponse.json(
        { error: 'section_heading and section_content are required.' },
        { status: 400 },
      );
    }

    // Simulate realistic AI processing time
    await simulateDelay(900, 1800);

    const improved_content = getImprovedContent(section_heading);

    return NextResponse.json({ improved_content });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[section-improve mock] Error:', message);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 },
    );
  }
}
