import { NextRequest, NextResponse } from 'next/server';

async function simulateDelay(min = 900, max = 2000) {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  await new Promise((r) => setTimeout(r, ms));
}

// ─── Regeneration templates ────────────────────────────────────────────────
// Each entry provides an alternative structure/framing for that section type.
// The regenerated version intentionally differs in structure and perspective
// from the improve templates so repeated calls feel distinct.

interface RegenTemplate {
  keywords: string[];
  regen: (heading: string, attempt: number) => string;
}

const REGEN_TEMPLATES: RegenTemplate[] = [
  // ── Problem Statement ──────────────────────────────────────────────────
  {
    keywords: ['problem', 'challenge', 'pain', 'statement'],
    regen: (heading, attempt) =>
      attempt % 2 === 0
        ? `## ${heading}

### The Situation Today
Most professionals encounter a recurring obstacle that disrupts their flow, increases manual effort, and ultimately degrades the quality of their output. Despite the availability of multiple tools in this space, none adequately address the root cause — they treat symptoms rather than the underlying structural issue.

### Who Feels This Pain
The problem is most acutely experienced by:
- **Individual contributors** who lose 4–6 hours per week to fragmented, repetitive tasks
- **Team leads** who spend significant time reconciling inconsistent outputs across their team
- **Organisations** that absorb compounding costs as these inefficiencies scale across departments

### The Real Cost
Beyond time loss, the downstream effects include:
- Reduced confidence in deliverables, leading to over-review cycles
- Missed deadlines driven by last-minute manual corrections
- High cognitive load that crowds out higher-value strategic thinking

### The Opportunity
A focused, well-scoped solution that eliminates friction at the source — rather than layering more tools on top — has the potential to reclaim hundreds of hours annually per team and meaningfully improve output quality at scale.`
        : `## ${heading}

### Context
The way people currently approach this problem is fundamentally broken. Existing tools were built for a different era of work, and they show it: clunky interfaces, no intelligent assistance, and zero adaptation to how modern teams actually operate.

### The Gap
There is a measurable and growing gap between what users need and what the market provides:

| Dimension | Current Reality | What Users Need |
|-----------|----------------|-----------------|
| Automation | Mostly manual | Intelligent, context-aware |
| Time investment | 3–5 hrs/week | Under 30 minutes |
| Error rate | ~20% require rework | Near zero |
| Learning curve | Steep | Immediate value |

### Why Now
Three converging trends make this the right moment to solve this problem:
1. **User expectations have risen** — AI-native tools have reset what "good" looks like
2. **Remote work amplified the pain** — distributed teams suffer more from fragmentation
3. **Existing vendors are stagnant** — incumbents haven't shipped meaningful innovation in 18+ months

### Our Hypothesis
By addressing the core workflow friction — not just adding another feature layer — we can deliver a 10x improvement in user productivity within the first month of adoption.`,
  },

  // ── Goals / Objectives / Metrics ──────────────────────────────────────
  {
    keywords: ['goal', 'objective', 'success', 'metric', 'kpi', 'outcome'],
    regen: (heading, attempt) =>
      attempt % 2 === 0
        ? `## ${heading}

### North Star Metric
**Time-to-value** — the elapsed time between a user's first session and their first meaningful, shareable output. Target: ≤ 20 minutes.

This single metric encapsulates acquisition quality, onboarding effectiveness, and core product value delivery.

### Tiered Goal Framework

#### Tier 1 — Launch Success (Month 1–3)
- 500 activated users (completed core workflow at least once)
- 40% Week-1 retention
- Average session duration ≥ 12 minutes (signals genuine engagement)

#### Tier 2 — Product-Market Fit Signal (Month 3–6)
- 2,500 monthly active users
- D30 retention ≥ 55%
- NPS ≥ 40
- Organic referral rate ≥ 15% of new signups

#### Tier 3 — Scale Readiness (Month 6–12)
- 10,000 MAU
- Revenue: £50K MRR
- Support ticket rate < 4% of active users
- Feature adoption breadth: avg user engages with ≥ 3 distinct features

### Anti-Goals
We will explicitly *not* optimise for:
- Raw signup volume without activation
- Vanity engagement (sessions with no meaningful output)
- Enterprise revenue before SMB-market fit is proven`
        : `## ${heading}

### Strategic Intent
This product exists to move users from a state of friction and uncertainty to one of confidence and speed. Every goal below maps directly to that transformation.

### Primary Goals

**1. Activation**
Users experience value within their first session. We define activation as: completing the core workflow and exporting or sharing a result.
- Baseline: 0% (new product)
- Target: 60% activation rate within 7 days of signup
- Owner: Product + Growth

**2. Retention**
Users return because the product consistently delivers value.
- D7 retention target: 45%
- D30 retention target: 60%
- D90 retention target: 40%

**3. Satisfaction**
Users would recommend this product.
- NPS target: ≥ 45 by end of Q2
- CSAT target: 4.3/5.0 in post-session surveys

**4. Business Viability**
The product generates sustainable revenue.
- Month 6 MRR: £25,000
- Month 12 MRR: £75,000
- CAC payback period: ≤ 4 months

### Measurement Cadence
- Weekly: Activation rate, DAU/WAU ratio
- Monthly: Retention curves, NPS pulse
- Quarterly: Revenue, market share, churn analysis`,
  },

  // ── Features / Requirements ───────────────────────────────────────────
  {
    keywords: ['feature', 'requirement', 'capability', 'functionality', 'spec', 'must', 'should'],
    regen: (heading, attempt) =>
      attempt % 2 === 0
        ? `## ${heading}

### Feature Philosophy
Every feature must pass a two-part test: (1) Does it directly reduce friction in the user's primary workflow? (2) Can it be adopted without reading documentation?

### Core Experience (MVP Scope)

#### F1 — Guided Creation Flow *(P0)*
A step-by-step wizard that takes users from a blank slate to a structured, complete output in a single session. No prior expertise required.
- **Acceptance criteria**: A first-time user completes the full flow in under 15 minutes
- **Edge cases**: Partial completion is auto-saved; users can resume from any step

#### F2 — Intelligent Content Generation *(P0)*
AI-assisted drafting that produces context-aware suggestions based on user inputs. Users can accept, edit, or reject each suggestion individually.
- **Acceptance criteria**: Generated content is coherent and requires minimal editing in ≥ 80% of sessions
- **Edge cases**: Graceful degradation to manual input if AI is unavailable

#### F3 — Export & Share *(P0)*
One-click export to Markdown, PDF, and shareable link. No account required to view a shared link.
- **Acceptance criteria**: Export completes in < 3 seconds; shared link is accessible without login
- **Edge cases**: PDF rendering handles Unicode and code blocks correctly

### Extended Features (Post-MVP)

#### F4 — Inline Editing & AI Refinement *(P1)*
Section-level editing with AI suggestions for improvement, regeneration, and Q&A.

#### F5 — Version History *(P1)*
Named snapshots of document state with one-click restore.

#### F6 — Team Collaboration *(P2)*
Multi-user editing with comment threads and change tracking.

### Explicitly Out of Scope
- Real-time multiplayer editing (conflicts with MVP simplicity goal)
- Native mobile app (web-responsive is sufficient for Phase 1)
- Custom AI model fine-tuning`
        : `## ${heading}

### Requirement Categories

#### Must Have — MVP Blockers
These requirements gate the initial launch. The product cannot ship without them.

| ID | Requirement | Rationale |
|----|-------------|-----------|
| R-01 | Users can complete the primary workflow end-to-end | Core value delivery |
| R-02 | All user data is persisted between sessions | Prevents frustration and data loss |
| R-03 | Output can be exported in at least one format | Enables real-world usage |
| R-04 | System handles errors gracefully with user-friendly messages | Trust and reliability |
| R-05 | Page load time < 2s on standard broadband | Baseline performance |

#### Should Have — High Priority
Strong impact on retention and satisfaction. Target: included in v1.1.

| ID | Requirement | Rationale |
|----|-------------|-----------|
| R-06 | AI-powered content suggestions | Core differentiator |
| R-07 | Undo / redo for all editing actions | Reduces anxiety about mistakes |
| R-08 | Search and filter across saved documents | Usability at scale |

#### Could Have — Backlog
Valuable but not critical. Evaluate based on post-launch feedback.

| ID | Requirement | Rationale |
|----|-------------|-----------|
| R-09 | Email notifications for shared document activity | Collaboration convenience |
| R-10 | Dark mode | User preference, low engineering cost |
| R-11 | Keyboard shortcuts for power users | Efficiency for frequent users |

#### Won't Have (This Version)
- Offline mode
- Native desktop application
- Enterprise SSO integration`,
  },

  // ── Users / Personas ──────────────────────────────────────────────────
  {
    keywords: ['user', 'persona', 'audience', 'target', 'segment', 'customer'],
    regen: (heading, attempt) =>
      attempt % 2 === 0
        ? `## ${heading}

### Market Segmentation

#### Segment A — The Solo Builder (Primary, 60% of TAM)
Independent founders, freelancers, and solopreneurs who wear every hat and need to produce professional-grade outputs without a team behind them.

- **Role**: Founder / Freelance Consultant / Independent PM
- **Company size**: 1–5 people
- **Core job to be done**: Create structured, stakeholder-ready documents quickly and confidently
- **Frustration with status quo**: "I spend more time formatting and structuring than thinking"
- **Willingness to pay**: £15–40/month for clear time savings
- **Tech comfort**: High — early adopter of AI and productivity tools

#### Segment B — The Team Lead (Secondary, 30% of TAM)
Mid-level managers at growth-stage startups who need consistent quality across their team's outputs.

- **Role**: Product Manager / Engineering Lead / Head of Design
- **Company size**: 20–200 people
- **Core job to be done**: Align team around a shared, accurate source of truth
- **Frustration with status quo**: "Every team member's doc looks different, and mine are the ones that get questioned"
- **Willingness to pay**: £40–100/month per seat (expense-accountable)
- **Tech comfort**: Medium-high — adopts tools when a clear ROI case exists

#### Segment C — The Enterprise Contributor (Tertiary, 10% of TAM)
Individual contributors at large companies who want personal productivity gains within an enterprise environment.

- **Note**: Deprioritised for v1 due to longer sales cycles and compliance requirements

### Jobs To Be Done
1. "When I need to present a new initiative, I want to quickly produce a polished doc, so I can get stakeholder buy-in without spending a week writing."
2. "When I join a new project, I want to understand the scope instantly, so I can contribute meaningfully from day one."
3. "When a project pivots, I want to update my documentation efficiently, so the team always has an accurate reference."`
        : `## ${heading}

### Primary Persona: Alex — The Ambitious PM

**Background**: Senior Product Manager at a Series B startup, 4 years in role, managing a team of 2 engineers and 1 designer. Alex is accountable for product strategy and must keep stakeholders aligned across a fast-moving roadmap.

**Goals**:
- Ship features that demonstrably move the needle on North Star metrics
- Reduce time spent in alignment meetings by improving documentation clarity
- Build a reputation for structured, data-driven decision-making

**Frustrations**:
- Existing doc tools require too much manual formatting
- Generating first drafts from scratch is time-consuming and cognitively draining
- Stakeholders often skim or misread dense documents — needs better visual structure

**Behaviours**:
- Works primarily in browser, switches between 8–12 tabs regularly
- Writes documents in the morning during deep-work blocks
- Shares everything via link rather than email attachments

**Quote**: *"If I could get from 'blank page' to 'ready to share' in 20 minutes instead of 3 hours, I'd use that tool every single week."*

---

### Secondary Persona: Jordan — The Startup Founder

**Background**: Technical co-founder, 2 years post-launch, scaling from 5 to 20 employees. Jordan is moving from "doing everything" to "enabling a team", which requires more structured communication.

**Goals**:
- Communicate product vision clearly without being a professional writer
- Onboard new hires with accurate, up-to-date documentation
- Maintain investor confidence through professional output quality

**Frustrations**:
- No time to learn complex documentation tools
- Inconsistent quality when the team writes docs independently
- Templates feel generic and require heavy customisation

**Quote**: *"I know what I want to build. I just need a tool that helps me explain it to everyone else as clearly as it's in my head."*`,
  },

  // ── Technical / Architecture ───────────────────────────────────────────
  {
    keywords: ['technical', 'architecture', 'infra', 'system', 'stack', 'technology', 'engineering'],
    regen: (heading, attempt) =>
      attempt % 2 === 0
        ? `## ${heading}

### Guiding Principles
1. **Simplicity over cleverness** — choose the boring, proven solution
2. **Observability first** — every service emits structured logs and metrics from day one
3. **Stateless where possible** — enables horizontal scaling without coordination overhead

### System Architecture Overview

\`\`\`
Browser Client (Next.js)
       │
       ▼
  API Layer (Next.js Route Handlers)
       │
  ┌────┴─────────────────────┐
  │                          │
  ▼                          ▼
AI Service                Database
(OpenAI / mock)          (PostgreSQL)
\`\`\`

### Non-Functional Requirements

#### Performance
| Metric | Target | Measurement Method |
|--------|--------|--------------------|
| Initial page load | < 2s (LCP) | Core Web Vitals |
| API response (p50) | < 800ms | Server-side logging |
| API response (p99) | < 3s | Server-side logging |
| AI generation time | < 8s | Client-perceived |

#### Reliability
- Uptime SLA: 99.5% monthly
- Graceful degradation: AI features fall back to manual mode if LLM is unavailable
- Data durability: All user content persisted with daily backups

#### Security
- Authentication: JWT with 24-hour expiry + refresh token rotation
- Data encryption: AES-256 at rest, TLS 1.3 in transit
- Input sanitisation: All user inputs validated and escaped server-side
- Rate limiting: 100 requests/minute per authenticated user

#### Scalability Targets
- Designed to support 50,000 MAU without architectural changes
- Stateless API layer allows horizontal scaling via container replication`
        : `## ${heading}

### Technology Decisions

#### Frontend
- **Framework**: Next.js 14 (App Router) — chosen for SSR capabilities, file-based routing, and API route co-location
- **Styling**: Tailwind CSS — utility-first approach eliminates CSS file maintenance overhead
- **State management**: Zustand — lightweight, TypeScript-native, avoids Redux boilerplate
- **Rationale**: All three are industry-standard for 2024 React applications with strong long-term support

#### Backend
- **Runtime**: Node.js via Next.js API Routes — reduces infrastructure complexity for Phase 1
- **AI integration**: OpenAI API (GPT-4o) with mock fallback for development
- **Database**: PostgreSQL via Prisma ORM — type-safe queries, excellent migration tooling

#### Infrastructure
- **Hosting**: Vercel (frontend + API) — zero-config deploys, global CDN, built-in analytics
- **Database**: Railway (PostgreSQL) — managed, auto-backups, low ops overhead
- **Estimated monthly cost at launch**: £40–80/month

### Constraints & Decisions Log

| Constraint | Decision | Trade-off |
|------------|----------|-----------|
| Small team (2 engineers) | Serverless-first architecture | Less control over long-running jobs |
| Budget-conscious Phase 1 | Vercel + Railway over AWS | Potential vendor lock-in at scale |
| AI latency tolerance | Stream responses where possible | Increased UI complexity |
| GDPR compliance | EU data residency required | Slightly higher infrastructure cost |

### Risks & Mitigations
- **OpenAI rate limits**: Implement request queuing and user-facing loading states
- **Database connection pooling**: Use PgBouncer at scale to prevent connection exhaustion
- **Cold starts on serverless**: Warm-up pings for critical routes`,
  },

  // ── Risks / Assumptions ───────────────────────────────────────────────
  {
    keywords: ['risk', 'assumption', 'dependency', 'constraint', 'mitigation', 'concern'],
    regen: (heading, attempt) =>
      attempt % 2 === 0
        ? `## ${heading}

### Risk Taxonomy

We categorise risks across four dimensions: Market, Technical, Execution, and External.

#### Market Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Lower-than-expected demand | Medium | High | Validate with 20+ user interviews before engineering investment |
| Competitor ships similar feature | Medium | Medium | Accelerate core differentiator; focus on distribution moat |
| Users unwilling to pay target price | Low | High | Test pricing with a/b experiments pre-launch |

#### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| AI output quality below user expectations | High | High | Human review layer + user feedback loop for low-confidence outputs |
| API latency spikes during peak usage | Medium | Medium | Response streaming + skeleton loading states |
| Data loss due to infrastructure failure | Low | Critical | Multi-region backups, tested restore procedure |

#### Execution Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Scope creep delaying launch | High | Medium | Strict MVP definition with locked feature list |
| Key team member unavailability | Low | High | Document critical systems; cross-train on all areas |

### Assumptions Log

| # | Assumption | Validation Status | Owner |
|---|-----------|-------------------|-------|
| A1 | Users will pay £20+/month for time savings ≥ 3 hrs/week | Unvalidated | Product |
| A2 | Target users have tried ≥ 2 existing tools and found them lacking | Partially validated | Research |
| A3 | OpenAI API pricing remains stable for 12 months | Unvalidated | Engineering |
| A4 | Core workflow can be completed in a single session | Unvalidated | Design |`
        : `## ${heading}

### Strategic Assumptions

Before committing to this product, we are making the following bets. Each carries risk and must be validated:

**Assumption 1 — Problem Severity**
We assume this problem is severe enough that users will actively seek and adopt a dedicated solution. *Validation method: 15+ user interviews; acceptance threshold: 70% rate it 4+/5 severity.*

**Assumption 2 — Willingness to Pay**
We assume users will pay a monthly subscription for measurable time savings. *Validation method: Landing page with pricing test + email signups.*

**Assumption 3 — AI Quality Threshold**
We assume AI-generated content will be "good enough" (requiring < 20% editing) to deliver value. *Validation method: Internal testing + closed beta feedback.*

**Assumption 4 — Market Timing**
We assume the market is ready for an AI-native solution in this space today. *Validation method: Competitor analysis + early adopter outreach.*

### Dependencies

#### Internal Dependencies
- Design system must be complete before feature development begins (blocks: all UI work)
- Authentication service must be live before document persistence (blocks: core flow)

#### External Dependencies
- OpenAI API availability and pricing stability (HIGH risk — no viable open-source alternative at equal quality)
- Vercel/Railway infrastructure uptime (MEDIUM risk — SLAs in place but single-vendor dependency)

### Known Constraints
- **Timeline**: Must reach feature completeness within 3 months to maintain momentum
- **Budget**: Infrastructure costs capped at £200/month for Phase 1
- **Team size**: 2 engineers limits parallel development tracks
- **Compliance**: GDPR compliance required from day one (EU users)`,
  },

  // ── Timeline / Roadmap ────────────────────────────────────────────────
  {
    keywords: ['timeline', 'roadmap', 'milestone', 'phase', 'sprint', 'delivery', 'schedule', 'plan'],
    regen: (heading, attempt) =>
      attempt % 2 === 0
        ? `## ${heading}

### Delivery Philosophy
We operate in 6-week cycles. Each cycle ships a usable slice of value rather than accumulating unreleased work. This keeps feedback loops short and ensures we're building what users actually need.

### Phase 0 — Foundation (Weeks 1–2)
**Goal**: Establish project infrastructure, design system, and core data models.

Deliverables:
- [ ] Repository setup, CI/CD pipeline live
- [ ] Design system tokens and component library scaffolded
- [ ] Database schema v1 migrated and tested
- [ ] Authentication flow (signup, login, session management)

### Phase 1 — MVP (Weeks 3–8)
**Goal**: A working end-to-end flow that can be shared with closed beta users.

Deliverables:
- [ ] Core creation wizard (all steps, AI-assisted)
- [ ] Document generation and persistence
- [ ] Export (Markdown + shareable link)
- [ ] Basic user dashboard

**Exit criteria**: 10 beta users complete the full flow without assistance

### Phase 2 — Quality & Retention (Weeks 9–14)
**Goal**: Address beta feedback; improve polish and retention mechanics.

Deliverables:
- [ ] Version history with named snapshots
- [ ] Inline section-level AI editing (improve / regenerate / ask)
- [ ] Onboarding improvements based on beta drop-off data
- [ ] Performance optimisation (sub-2s load time across all pages)

### Phase 3 — Growth (Weeks 15–22)
**Goal**: Enable viral growth and monetisation.

Deliverables:
- [ ] Paywall + Stripe billing integration
- [ ] Public sharing with attribution (growth loop)
- [ ] Team workspace (invitations, shared documents)
- [ ] Analytics dashboard for power users`
        : `## ${heading}

### High-Level Timeline

| Quarter | Focus | Key Milestone |
|---------|-------|---------------|
| Q1 2025 | Build MVP | Closed beta with 50 users |
| Q2 2025 | Iterate & Retain | Open beta, NPS ≥ 35 |
| Q3 2025 | Monetise | Paying customers, £10K MRR |
| Q4 2025 | Scale | £50K MRR, team hiring |

### Milestone Breakdown

#### M1 — Internal Alpha *(Target: Week 6)*
The product works end-to-end in a controlled environment. Internal team uses it daily for real work.
- Success criteria: Zero critical bugs, all P0 requirements met

#### M2 — Closed Beta *(Target: Week 10)*
50 hand-picked users with access. Concierge onboarding, weekly feedback sessions.
- Success criteria: 60% activation rate, 3 NPS responses ≥ 4/5

#### M3 — Open Beta *(Target: Week 16)*
Public waitlist opens. Self-serve onboarding. No payment yet.
- Success criteria: 500 signups, 40% activate within 7 days

#### M4 — Paid Launch *(Target: Week 22)*
Paywall active. Free tier with meaningful but limited functionality.
- Success criteria: 100 paid conversions, < 10% immediate churn

### Resource Plan

| Phase | Engineering | Design | Product |
|-------|------------|--------|---------|
| Phase 0–1 | 2 FTE | 0.5 FTE | 0.5 FTE |
| Phase 2–3 | 2 FTE | 1 FTE | 1 FTE |

### What Could Slip
If timeline pressure increases, Phase 2 features (version history, team workspace) will be deferred. The core creation-to-export flow is non-negotiable.`,
  },

  // ── Executive Summary / Overview ──────────────────────────────────────
  {
    keywords: ['executive', 'summary', 'overview', 'introduction', 'background', 'context', 'abstract'],
    regen: (heading, attempt) =>
      attempt % 2 === 0
        ? `## ${heading}

### The Opportunity in One Paragraph
There is a clear and growing gap between the quality of output that modern professionals are expected to produce and the tools they have available to produce it. Existing solutions are either too generic (word processors), too complex (enterprise platforms), or too shallow (single-purpose templates) to close this gap. We are building the product that lives in the white space: intelligent, opinionated, and fast.

### Why We're Building This
Three things are true simultaneously:
1. The volume of structured documentation required per person has increased significantly in the last 5 years
2. AI has reached a quality threshold where it can meaningfully assist — not just autocomplete — knowledge work
3. No existing product has combined the two well enough to earn sustained user loyalty

This PRD defines the product that exploits this intersection.

### What We're Building
A focused, AI-assisted creation tool that helps professionals produce high-quality, structured outputs in a fraction of the time it currently takes. The first version targets product documentation; the platform will expand to adjacent use cases once core product-market fit is established.

### Scope of This Document
This PRD covers the MVP and v1 roadmap. It defines:
- The problem we are solving and for whom
- The features we will build and why
- The success metrics by which we will measure impact
- The risks we have identified and how we plan to mitigate them

This document does not cover: marketing strategy, hiring plans, or technical architecture in depth (see the Architecture Document for the latter).`
        : `## ${heading}

### Product Vision
*Empower anyone to produce expert-quality structured documents — in the time it currently takes to open a blank page.*

### The Problem We're Solving
Knowledge workers collectively waste billions of hours per year on the same problem: translating clear thinking into clear writing. The bottleneck is not intelligence — it is structure, tooling, and the blank-page effect.

### Our Solution
An AI-native creation platform that guides users from raw idea to polished, stakeholder-ready output through a structured, intelligent workflow. The product does the heavy lifting of structure and formatting, leaving users free to focus on what they actually know.

### Target Market
- **Primary**: Product Managers and startup founders who produce multiple documents per month
- **Secondary**: Team leads and consultants who set quality standards for their team's documentation

### Business Model
SaaS subscription: £19/month individual, £49/month team (up to 5 seats). Enterprise pricing available from Year 2.

### Competitive Position
We are not building a better word processor. We are building a guided, intelligent workflow tool that makes the right output the path of least resistance. Our moat is the workflow design, not the underlying AI model.

### Success in 12 Months
- 10,000 Monthly Active Users
- Net Promoter Score ≥ 45
- £75,000 Monthly Recurring Revenue
- Customer acquisition cost paid back within 4 months`,
  },
];

// ── Fallback template ──────────────────────────────────────────────────────
function fallbackRegen(heading: string, attempt: number): string {
  return attempt % 2 === 0
    ? `## ${heading}

### Strategic Context
This section has been re-examined from first principles. The following represents an alternative framing that prioritises clarity, actionability, and alignment with the product's core goals.

### Core Content

The fundamental value of this section lies in its ability to orient the reader quickly. With that in mind, the content below has been restructured to lead with the most important information and progressively reveal supporting detail.

**What matters most**: A clear, unambiguous statement of intent that any stakeholder — technical or non-technical — can read and act upon.

**What supports it**: Evidence, context, and constraints that inform decision-making without overwhelming the primary message.

### Key Points

1. **Clarity over completeness** — This section should be readable in under 2 minutes. If it isn't, it will be skimmed and misunderstood.

2. **Decisions, not descriptions** — Every sentence should either communicate a decision that has been made or a constraint that bounds decisions. Descriptive prose that doesn't aid decision-making should be cut.

3. **Living document** — This section should be reviewed at each major project milestone. Outdated information is worse than no information.

### Action Items
- [ ] Validate this content with at least one engineer and one non-technical stakeholder
- [ ] Ensure all claims are either evidenced or explicitly labelled as assumptions
- [ ] Schedule a review date for this section (recommended: 4 weeks from last update)`
    : `## ${heading}

### Reimagined Approach

Rather than extending what was already here, this version starts from the question: *"What decision does a reader need to make after reading this section?"*

The answer to that question should be the organising principle of every sentence that follows.

### Primary Content

**The essential message**: What is the single most important thing a new reader should understand from this section? Start there. Everything else is supporting detail.

**The evidence base**: What data, research, or validated assumptions support the claims in this section? List them explicitly — it builds trust and makes the document easier to update as you learn more.

**The constraints**: What boundaries does this section define or operate within? Constraints are as important as possibilities — they prevent wasted effort and misaligned expectations.

### Structured Summary

| Dimension | Detail |
|-----------|--------|
| Purpose of this section | Define and communicate a core aspect of the product |
| Primary audience | Product team, engineering leads, business stakeholders |
| Update frequency | Review at each major milestone or when assumptions change |
| Dependencies | Should be consistent with all other sections in this document |

### What Changed in This Version
This regenerated version prioritises structure and readability over completeness. It uses a framework-first approach that makes it easier to update incrementally rather than requiring a full rewrite when circumstances change.`;
}

// ── Main resolver ──────────────────────────────────────────────────────────
function resolveTemplate(heading: string, attempt: number): string {
  const h = heading.toLowerCase();

  for (const template of REGEN_TEMPLATES) {
    if (template.keywords.some((kw) => h.includes(kw))) {
      return template.regen(heading, attempt);
    }
  }

  return fallbackRegen(heading, attempt);
}

// ── Route handler ──────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { section_heading, section_content, attempt } = body as {
      section_heading?: string;
      section_content?: string;
      attempt?: number;
    };

    if (!section_heading || !section_heading.trim()) {
      return NextResponse.json(
        { error: 'section_heading is required.' },
        { status: 400 },
      );
    }

    if (!section_content || section_content.trim().length < 5) {
      return NextResponse.json(
        { error: 'section_content must be a non-empty string.' },
        { status: 400 },
      );
    }

    await simulateDelay(900, 2000);

    const regeneratedContent = resolveTemplate(
      section_heading.trim(),
      typeof attempt === 'number' ? attempt : 0,
    );

    return NextResponse.json({ regenerated_content: regeneratedContent });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[section-regenerate mock] Error:', message);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 },
    );
  }
}
