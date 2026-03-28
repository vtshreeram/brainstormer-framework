import { NextRequest, NextResponse } from 'next/server';

async function simulateDelay(min = 500, max = 1300) {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  await new Promise((r) => setTimeout(r, ms));
}

// ─── Per-section contextual answers ──────────────────────────────────────────

const SECTION_KNOWLEDGE: Array<{
  keywords: string[];
  answers: {
    why?: string;
    how?: string;
    what?: string;
    default: string;
  };
}> = [
  {
    keywords: ['problem', 'challenge', 'pain', 'statement', 'overview'],
    answers: {
      why: `The **Problem Statement** is the foundation of your entire PRD. Every feature, requirement, and success metric flows from it. A clear, well-evidenced problem statement ensures the team is building for a real user need rather than an internal assumption.\n\nWithout a strong problem statement, stakeholders may question *why* the product exists — and engineering teams may make trade-offs that drift from the actual user pain.`,
      how: `To strengthen this section:\n\n1. **Quantify the pain** — add a concrete data point, e.g. *"Users spend 4+ hours/week on manual workarounds"*\n2. **Use user voice** — include 1–2 direct quotes from discovery interviews\n3. **Frame "current state vs desired state"** — makes the gap immediately visible\n4. **Scope explicitly** — note what the problem is *not* about to prevent scope creep\n5. **Remove solution language** — the problem statement should describe pain, not fixes`,
      what: `A Problem Statement describes the specific difficulty your target users encounter, the context in which it arises, and the cost of leaving it unsolved. It should be:\n\n- **User-centric**: focused on the person experiencing the issue\n- **Specific**: no vague language like "users struggle with existing tools"\n- **Evidence-based**: backed by research, data, or observations\n- **Solution-free**: the problem, not the fix`,
      default: `This section defines the core challenge driving your product.\n\nKey qualities of a strong problem statement:\n\n- **Specific and scoped** — avoids vague or overly broad claims\n- **Grounded in evidence** — references user research or market data\n- **Empathy-driven** — reflects the real experience of your target users\n- **Action-inspiring** — makes any reader immediately understand why this product must exist\n\nRevisit this section regularly as you gather more user research — it should evolve alongside your understanding of the market.`,
    },
  },
  {
    keywords: ['goal', 'objective', 'success', 'metric', 'kpi', 'outcome'],
    answers: {
      why: `Goals & Objectives translate your problem into measurable targets. They create a shared definition of "done" across product, engineering, and business teams — preventing scope creep and misalignment.\n\nWithout clear goals, teams often over-build (adding features no one asked for) or under-deliver (missing the outcomes stakeholders expected).`,
      how: `Improve this section by applying the **SMART framework** to every goal:\n\n- **Specific**: *"Reduce onboarding time"* → *"Reduce time-to-first-value from 7 days to 2 days"*\n- **Measurable**: Attach a number to every goal\n- **Achievable**: Ground targets in historical benchmarks or industry data\n- **Relevant**: Tie each goal back to the problem statement\n- **Time-bound**: Add a target timeframe (e.g. *"by Q3 2025"*)\n\nAlso consider adding a table with: Goal | Baseline | Target | Owner | Date`,
      what: `This section lists the intended outcomes of your product — what success looks like once the product is built and adopted.\n\n- **Business goals**: ROI, revenue, or market impact (e.g. *"Reach £500K ARR by Q4"*)\n- **User goals**: The outcome users experience (e.g. *"Complete task in under 10 min"*)\n- **Success metrics (KPIs)**: Specific, measurable indicators (e.g. *"D30 retention ≥ 60%"*)`,
      default: `Your goals section should directly trace back to the problem statement — every goal should be answerable with *"because users experience [problem]"*.\n\nConsider structuring it as:\n\n1. **Business goal** — impact on the company (revenue, growth, cost reduction)\n2. **User goal** — the improved experience your users will have\n3. **Guardrail metric** — a metric that should *not* worsen (e.g. don't sacrifice NPS for growth)\n\nEach goal should have a clear owner, a measurable baseline, and a realistic target.`,
    },
  },
  {
    keywords: ['feature', 'requirement', 'functionality', 'capability', 'must', 'should', 'spec'],
    answers: {
      why: `The Features section translates goals into buildable requirements. It is the primary reference for engineering and design, so precision here directly reduces rework and misalignment during development.\n\nAmbiguous features lead to different interpretations across teams — designers build one thing, engineers build another, and stakeholders expect a third.`,
      how: `Improve this section by:\n\n1. **Applying MoSCoW prioritisation** — Must Have / Should Have / Could Have / Won't Have\n2. **Adding acceptance criteria** — *"Feature is complete when [specific, testable behaviour]"*\n3. **Linking to user goals** — each feature should map to a user need from your personas\n4. **Covering edge cases** — what happens with invalid inputs, network failures, empty states?\n5. **Avoiding vague verbs** — replace *"support", "handle", "manage"* with concrete behaviour descriptions`,
      what: `Features are the specific capabilities your product will deliver. Each feature should be:\n\n- **Atomic**: small enough to be built and tested independently\n- **User-facing**: described from the user's perspective, not the implementation\n- **Traceable**: linked to a goal or problem from earlier sections\n- **Bounded**: explicit about what's included and what's out of scope`,
      default: `Well-written features include:\n\n- **User-centric framing**: *"Users can filter by date"* not *"Implement date filter"*\n- **Explicit scope**: What's included and what's deliberately excluded\n- **Priority level**: P0 (critical), P1 (important), P2 (nice-to-have)\n- **Dependencies**: Other features or systems this relies on\n- **Acceptance criteria**: A concrete, testable definition of "done"\n\nAvoid listing features without context — readers should understand *why* each feature matters.`,
    },
  },
  {
    keywords: ['user', 'persona', 'audience', 'target', 'segment', 'customer'],
    answers: {
      why: `Defining your target users prevents "building for everyone" — which often results in building for no one. Clear personas help designers make trade-off decisions and help engineers understand who they're optimising for.\n\nEvery feature prioritisation debate benefits from being able to ask: *"Does this serve our primary persona's core job to be done?"*`,
      how: `Enrich your user personas by adding:\n\n- **Jobs to be done (JTBD)**: What is the user trying to accomplish in their own words?\n- **Frustrations**: Current pain points with existing solutions (not yours)\n- **Technology comfort level**: Influences how complex the UI can safely be\n- **Usage context**: Where, when, and how they'll use the product (mobile on the go? Desktop at a desk?)\n- **Success definition**: How does this user know the product is working for them?`,
      what: `This section describes who will use the product — their roles, goals, pain points, and behaviours.\n\nPersonas are representative archetypes, not real individuals. A strong persona includes:\n\n- Name and role (makes them memorable)\n- Primary goal (what they're trying to achieve)\n- Current frustrations (pain with today's solutions)\n- Context of use (when, where, how often)`,
      default: `Strong user personas make trade-off decisions easier for the whole team.\n\nFor each persona, include:\n\n1. **Name & role** — e.g. *"Sarah, a product manager at a mid-size SaaS company"*\n2. **Primary job to be done** — what outcome they're pursuing\n3. **Pain points** — frustrations with how they solve this today\n4. **Technical comfort** — influences UI/UX complexity decisions\n5. **Success metric** — how they'll know the product is working\n\nFor each feature in your PRD, ask: *"Would this genuinely help [persona name]?"*`,
    },
  },
  {
    keywords: ['technical', 'architecture', 'infra', 'infrastructure', 'system', 'stack', 'non-functional'],
    answers: {
      why: `Technical requirements set hard boundaries for engineering decisions. They prevent over-engineering (gold-plating) and under-engineering, and ensure non-functional requirements — performance, security, scalability — are not forgotten until late in delivery when they're most expensive to fix.\n\nNFRs discovered in QA or post-launch are significantly more costly than NFRs defined upfront.`,
      how: `Improve this section by:\n\n1. **Adding concrete NFRs**: response time thresholds, availability SLAs, concurrent user limits\n2. **Defining integration points**: third-party APIs, internal services, data formats\n3. **Including data requirements**: storage volumes, retention policies, privacy constraints (GDPR, HIPAA)\n4. **Listing constraints**: budget limits, timeline pressure, team expertise gaps\n5. **Documenting tech decisions**: key architectural choices and their rationale`,
      what: `Technical requirements define the *how* the system must behave, beyond its functional features:\n\n- **Performance**: Response times, throughput, uptime SLA\n- **Security**: Auth mechanisms, data encryption, compliance standards\n- **Scalability**: How the system must handle growth\n- **Integrations**: APIs, third-party services, existing systems\n- **Constraints**: Technology, budget, team capability limits`,
      default: `This section should cover both explicit technical choices and the non-functional requirements that constrain them:\n\n- **Performance targets**: p95 response time, throughput, concurrent users\n- **Security requirements**: Authentication, authorisation, encryption, compliance\n- **Scalability expectations**: Growth projections and system behaviour under load\n- **Integration requirements**: Internal services, third-party APIs, data pipelines\n- **Known constraints**: Budget ceilings, timeline pressure, team expertise\n\nBe specific — *"fast"* is not a requirement; *"p95 API response under 300ms"* is.`,
    },
  },
  {
    keywords: ['risk', 'assumption', 'dependency', 'constraint', 'mitigation', 'blocker'],
    answers: {
      why: `Surfacing risks early allows the team to plan mitigations *before* they become blockers. Unacknowledged risks are the most dangerous — they surface as surprises during development or launch, causing delays, rework, or cancelled features.\n\nA risk register also signals to stakeholders that the team has thought critically about uncertainty — it builds confidence, not concern.`,
      how: `Strengthen this section by:\n\n1. **Scoring risks** — use a simple Likelihood × Impact matrix (H/M/L for each)\n2. **Assigning owners** — who is responsible for monitoring and mitigating each risk?\n3. **Listing triggers** — what early signals would indicate a risk is materialising?\n4. **Adding fallback plans** — if the risk occurs, what's the contingency?\n5. **Separating risks from assumptions** — risks are things that *might* go wrong; assumptions are things believed true but not yet validated`,
      what: `This section catalogues known uncertainties that could affect the product's success:\n\n- **Risks**: Things that might go wrong (technical, market, resource)\n- **Assumptions**: Things believed to be true but not yet validated\n- **Dependencies**: External factors the product relies on (third-party APIs, other teams, regulatory approvals)\n- **Constraints**: Hard limits that cannot be changed (budget cap, compliance deadline)`,
      default: `A comprehensive risks section covers all categories of uncertainty:\n\n- **Technical risks**: Technology choices, integration unknowns, performance cliffs\n- **Business risks**: Market timing, competitive response, revenue model assumptions\n- **User risks**: Behaviour change required, adoption challenges\n- **Dependency risks**: Third-party services, other team deliverables\n\nFor each risk: **Likelihood** (H/M/L) + **Impact** (H/M/L) + **Mitigation strategy** + **Owner**\n\nReview and update this section at every major milestone.`,
    },
  },
  {
    keywords: ['timeline', 'roadmap', 'milestone', 'phase', 'sprint', 'delivery', 'schedule'],
    answers: {
      why: `A clear timeline creates alignment across stakeholders, helps teams plan resource allocation, and surfaces scheduling conflicts early. It also sets shared expectations for *when* value will be delivered — preventing the common "when will this be ready?" conversation.\n\nTimelines in PRDs are not commitments — they're informed estimates that should be updated as you learn more.`,
      how: `Improve this section by:\n\n1. **Breaking into phases**: MVP → v1 → v2, with clear scope boundaries for each\n2. **Adding dependencies**: What must complete before each milestone can begin?\n3. **Identifying the critical path**: Which tasks block everything else?\n4. **Including buffer**: 20% slack for unknowns is a healthy engineering default\n5. **Defining go/no-go criteria**: What conditions must be met before advancing to the next phase?`,
      what: `The timeline section outlines when different parts of the product will be built and shipped:\n\n- **Phases**: Discovery → Design → Build → Test → Launch\n- **Key milestones**: Alpha, Beta, GA launch dates\n- **Resource allocation**: Which team members are needed at each stage\n- **Dependencies**: What must happen before each milestone\n- **Risks to timeline**: Known uncertainties that could shift dates`,
      default: `A good timeline in a PRD operates at *milestone* granularity (not task-level Gantt charts):\n\n- **Phase breakdown**: Scope and expected duration of each phase\n- **Key dates**: Discovery complete, design sign-off, engineering complete, QA, launch\n- **Critical path**: The sequence of work where any delay causes a launch delay\n- **Contingency buffer**: Explicit slack for the unexpected\n- **Review gates**: Checkpoints where the team evaluates whether to proceed, pivot, or pause\n\nUpdate this section at each phase gate with learnings from the previous phase.`,
    },
  },
  {
    keywords: ['executive', 'summary', 'background', 'context', 'introduction', 'brief'],
    answers: {
      why: `The Executive Summary is often the *only* section read by senior stakeholders and executives. It needs to stand alone — a reader with no prior context should understand what the product is, why it matters, and what success looks like in under 2 minutes.\n\nA weak executive summary leads to misaligned expectations at the leadership level, even when the rest of the PRD is excellent.`,
      how: `A strong executive summary covers five things concisely:\n\n1. **The problem**: One or two sentences on the user pain\n2. **The solution**: What the product does at a high level\n3. **The target users**: Who it's for\n4. **The business value**: Why the company should build this now\n5. **The ask**: What you need (resources, approval, timeline)`,
      what: `The Executive Summary is a brief (typically 3–5 paragraph) overview of the entire PRD that enables stakeholders to understand the product without reading every section.\n\nIt should include:\n- The core problem and who experiences it\n- The proposed solution at a high level\n- The target user segment\n- The expected business impact\n- Key constraints or risks`,
      default: `The Executive Summary should be:\n\n- **Self-contained**: readable without context from the rest of the PRD\n- **Jargon-free**: understandable by non-technical stakeholders\n- **Concise**: ideally under 300 words\n- **Outcome-focused**: emphasise *what success looks like*, not just what will be built\n\nWrite it *last* — after the full PRD is complete — so it accurately reflects the final scope and decisions.`,
    },
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function detectQuestionType(question: string): 'why' | 'how' | 'what' | null {
  const q = question.toLowerCase();
  if (/\bwhy\b|\bimportant\b|\bpurpose\b|\bvalue\b|\bpoint\b/.test(q)) return 'why';
  if (/\bhow\b|\bimprove\b|\bbetter\b|\bstrengthen\b|\bfix\b|\benhance\b/.test(q)) return 'how';
  if (/\bwhat\b|\bmean\b|\bdefine\b|\bexplain\b|\bdescribe\b|\btell me\b/.test(q)) return 'what';
  return null;
}

function findSection(heading: string) {
  const h = heading.toLowerCase();
  for (const entry of SECTION_KNOWLEDGE) {
    if (entry.keywords.some((kw) => h.includes(kw))) return entry;
  }
  return null;
}

function buildAnswer(heading: string, question: string): string {
  const section = findSection(heading);
  const qType = detectQuestionType(question);

  if (section) {
    if (qType && section.answers[qType]) return section.answers[qType]!;
    return section.answers.default;
  }

  // Generic fallback
  const title = heading.replace(/^#+\s*/, '').trim();

  if (qType === 'why') {
    return `The **${title}** section is critical because it provides context that stakeholders, designers, and engineers need to make informed decisions throughout the product lifecycle.\n\nWithout it, teams tend to make conflicting assumptions — especially when trade-offs arise under deadline pressure. A well-written section here prevents those misalignments before they become expensive rework.\n\nRevisit this section regularly as the product evolves and new information surfaces from user research or stakeholder feedback.`;
  }

  if (qType === 'how') {
    return `To improve the **${title}** section:\n\n1. **Add specificity** — replace any vague language with concrete, testable details\n2. **Include evidence** — back claims with data, research findings, or stakeholder quotes\n3. **Review completeness** — check against your acceptance criteria or definition of done\n4. **Simplify language** — aim for clarity over sophistication; a junior engineer should be able to act on it\n5. **Cross-reference** — ensure consistency with related sections (e.g. Goals ↔ Success Metrics ↔ Features)\n6. **Get a peer review** — ask one engineer and one designer whether the content is actionable`;
  }

  if (qType === 'what') {
    return `The **${title}** section covers the key information needed by your team to understand this aspect of the product.\n\nIt should be concise, clear, and immediately actionable — any team member reading it should come away with the same understanding, regardless of their role.\n\nIf you're unsure what belongs here, ask: *"What decisions does this section need to enable?"* Write only what's needed to make those decisions well.`;
  }

  return `Regarding the **${title}** section:\n\nThis part of your PRD communicates a specific dimension of your product to the team and stakeholders. To get the most out of it:\n\n- **Keep it focused** — one clear purpose per section reduces cognitive load\n- **Avoid jargon** — write for the least technical reader who needs to act on it\n- **Connect to the problem** — every section should trace back to why the product exists\n- **Update regularly** — PRDs are living documents; stale sections mislead teams\n\nFeel free to ask a more specific question about this section and I'll give a more targeted answer!`;
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { section_heading, section_content: _content, question } = body as {
      section_heading?: string;
      section_content?: string;
      question?: string;
    };

    if (!section_heading || !question?.trim()) {
      return NextResponse.json(
        { error: 'section_heading and question are required.' },
        { status: 400 },
      );
    }

    await simulateDelay(500, 1300);

    const answer = buildAnswer(section_heading, question.trim());

    return NextResponse.json({ answer });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[section-ask mock] Error:', message);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 },
    );
  }
}
