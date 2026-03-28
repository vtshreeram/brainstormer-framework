import { NextRequest, NextResponse } from "next/server";
import { simulateDelay } from "@/data/mockAiResponses";
import { AiSuggestionsResult } from "@/types";

// ─────────────────────────────────────────────────────────────────────────────
// Keyword → suggestion bucket map
// We scan the PRD content for these keyword groups and pick the most relevant
// mock suggestion set. Falls back to a solid general-purpose set.
// ─────────────────────────────────────────────────────────────────────────────

interface SuggestionBucket {
  keywords: string[];
  result: AiSuggestionsResult;
}

const suggestionBuckets: SuggestionBucket[] = [
  // ── Fitness / Health ────────────────────────────────────────────────────────
  {
    keywords: ["fitness", "workout", "exercise", "health", "gym", "training", "calories", "steps"],
    result: {
      metrics: [
        "Day-7 retention rate (target ≥ 40%) — measures early habit formation",
        "Weekly active users (WAU) as a share of total installs",
        "Average workouts logged per active user per week",
        "Premium subscription conversion rate at 30 days (target ≥ 5%)",
        "Crash-free session rate (target ≥ 99.5%)",
      ],
      suggestions: [
        {
          title: "Add a streak & habit loop",
          description:
            "A daily-streak counter with a subtle break-streak recovery flow (e.g. 'use a streak freeze') can measurably increase D30 retention. Users who hit a 7-day streak are ~3× more likely to reach 30 days.",
        },
        {
          title: "Onboarding equipment scan",
          description:
            "Ask users to photograph or tap their available equipment during onboarding rather than relying on manual selection. Reduces drop-off at the first AI-generation step and improves workout relevance immediately.",
        },
        {
          title: "Offline-first workout cache",
          description:
            "Cache the user's last 5 generated workouts and all exercise videos for offline access. A large portion of gym-alternative users work out in basements or areas with poor signal — offline support removes a critical blocker.",
        },
        {
          title: "Social accountability via share cards",
          description:
            "Auto-generate branded workout-summary share cards (time, exercises, calories). Shareable images drive organic installs at near-zero cost and create a built-in growth loop.",
        },
        {
          title: "Progressive overload tracking",
          description:
            "Track weight/reps over time per exercise and surface a 'You lifted more than last time!' micro-win notification. This closes the feedback loop that existing solutions miss and directly addresses the stated pain point.",
        },
      ],
    },
  },

  // ── Social / Community ──────────────────────────────────────────────────────
  {
    keywords: ["social", "community", "feed", "post", "follow", "messaging", "chat", "friends"],
    result: {
      metrics: [
        "Day-1 activation rate — % of new users who complete core action within 24 h",
        "Monthly active users (MAU) with ≥ 3 sessions per week",
        "Content creation rate — posts per DAU per day",
        "Connection graph density — average connections per active user",
        "Notification opt-in rate (target ≥ 60%)",
      ],
      suggestions: [
        {
          title: "Guided first-post flow",
          description:
            "New users who publish their first piece of content within the first session are significantly more likely to return. Add a prompted 'Your first post' card on the home screen that lowers the blank-page barrier.",
        },
        {
          title: "Interest-based onboarding topics",
          description:
            "Let users pick 3–5 interest tags during sign-up to seed their initial feed with relevant content. A personalised feed from day one dramatically reduces the empty-state problem that kills early retention.",
        },
        {
          title: "Reply threading to deepen engagement",
          description:
            "Flat comment lists plateau engagement quickly. Threaded replies create longer conversations and increase session depth, which is a strong leading indicator of long-term retention.",
        },
        {
          title: "Creator analytics dashboard",
          description:
            "Show post creators simple reach and engagement metrics. Creators who can see their impact publish 2–4× more frequently, increasing overall content supply for other users.",
        },
        {
          title: "Digest push notification (weekly summary)",
          description:
            "A weekly 'Here's what you missed' notification with 3 relevant content items re-engages churned users with minimal effort and keeps notification fatigue low compared to daily pings.",
        },
      ],
    },
  },

  // ── E-commerce / Marketplace ─────────────────────────────────────────────────
  {
    keywords: ["shop", "store", "buy", "sell", "product", "cart", "checkout", "payment", "marketplace", "order"],
    result: {
      metrics: [
        "Cart-to-purchase conversion rate (target ≥ 3% for new marketplaces)",
        "Average order value (AOV) tracked weekly",
        "Seller listing activation rate — sellers who publish ≥ 1 item within 7 days",
        "Return / refund rate (keep below 5% to maintain payment processor trust)",
        "Repeat purchase rate at 60 days (target ≥ 20%)",
      ],
      suggestions: [
        {
          title: "Guest checkout option",
          description:
            "Requiring account creation before purchase is the single highest-friction drop-off point. A guest checkout with optional account creation post-purchase can recover 15–30% of abandoned carts.",
        },
        {
          title: "Trust signals on product pages",
          description:
            "Add verified-purchase badges, seller response-time indicators, and a visible returns policy on every product page. Trust signals directly correlate with first-purchase conversion, especially for new marketplaces.",
        },
        {
          title: "Saved search & restock alerts",
          description:
            "Users who save searches or enable restock notifications have 4× higher 30-day retention than those who don't. Add this to the MVP as a lightweight engagement hook.",
        },
        {
          title: "Seller onboarding checklist",
          description:
            "Guide new sellers through a 5-step checklist (photo tips, pricing, description, shipping policy, first listing). Structured onboarding increases listing activation rates and improves buyer-facing quality.",
        },
        {
          title: "Lightweight recommendation engine",
          description:
            "Even rule-based recommendations ('Customers also viewed') can lift AOV by 10–15%. Start with a simple co-purchase or same-category algorithm before investing in ML-based personalisation.",
        },
      ],
    },
  },

  // ── Productivity / SaaS / B2B ────────────────────────────────────────────────
  {
    keywords: ["task", "project", "team", "collaboration", "productivity", "workflow", "dashboard", "b2b", "saas", "workspace"],
    result: {
      metrics: [
        "Time-to-first-value — minutes from sign-up to completing the core action",
        "Team adoption rate — % of invited members who activate within 7 days",
        "Weekly active teams (WAT) as the primary engagement north star",
        "Feature adoption breadth — average number of distinct features used per active team",
        "Net Promoter Score (NPS) at day 30 (target ≥ 30 for B2B SaaS)",
      ],
      suggestions: [
        {
          title: "Interactive product tour on first login",
          description:
            "B2B tools with an interactive (not video) guided tour see 2× higher trial-to-paid conversion. Walk users through their first real action — not a feature showcase — within 90 seconds of sign-up.",
        },
        {
          title: "Team invite as a core onboarding step",
          description:
            "Collaboration tools only become sticky when more than one person uses them. Make sending a team invite a required or heavily prompted step during onboarding; teams of 3+ churn at half the rate of solo users.",
        },
        {
          title: "Email digest for async awareness",
          description:
            "A daily or weekly digest of team activity keeps users engaged without requiring them to log in proactively. This is especially effective for remote or async teams and extends the reach of your notification strategy.",
        },
        {
          title: "Template library for faster activation",
          description:
            "Offering 10–20 pre-built templates (project plans, meeting notes, sprints) reduces time-to-first-value and is one of the highest-ROI features for B2B productivity tools at launch.",
        },
        {
          title: "Granular permission roles",
          description:
            "Enterprise and mid-market buyers consistently list role-based access control (RBAC) as a procurement requirement. Adding at least Admin / Member / Viewer roles pre-launch avoids losing deals to this gap.",
        },
      ],
    },
  },

  // ── Finance / Fintech ────────────────────────────────────────────────────────
  {
    keywords: ["finance", "money", "budget", "expense", "bank", "payment", "invest", "saving", "transaction", "wallet"],
    result: {
      metrics: [
        "Account linking completion rate — % of users who connect ≥ 1 financial account",
        "Monthly active users (MAU) who perform ≥ 1 financial action",
        "Budget adherence rate — % of users staying within self-set budget categories",
        "Average sessions per week among retained users",
        "Push notification opt-in rate for alerts (target ≥ 70% for fintech)",
      ],
      suggestions: [
        {
          title: "Instant spending insight on first sync",
          description:
            "Show users a simple 'You spent X on Y this month' insight immediately after connecting their first account. An instant aha-moment is the strongest driver of fintech app retention in the first 48 hours.",
        },
        {
          title: "Biometric authentication from day one",
          description:
            "Finance apps without Face ID / fingerprint unlock lose a significant portion of users at the password step. Prioritise biometric auth in the MVP — it also reduces anxiety about storing sensitive data.",
        },
        {
          title: "Spending anomaly alerts",
          description:
            "Proactive push alerts ('You've spent 80% of your dining budget') create re-engagement without requiring users to open the app. This closes the core value loop and builds daily habit around the product.",
        },
        {
          title: "Contextual educational micro-content",
          description:
            "Short, in-context tips (e.g. '20% in savings is a common starting goal') increase trust and perceived value without requiring a full content strategy. Embed them at key decision points, not as standalone articles.",
        },
        {
          title: "Export to CSV / PDF for power users",
          description:
            "Finance power users (who have the highest lifetime value) need to export data for taxes or analysis. Providing a simple export in MVP prevents churn of your highest-value segment before a full data layer is built.",
        },
      ],
    },
  },

  // ── Education / Learning ─────────────────────────────────────────────────────
  {
    keywords: ["learn", "course", "quiz", "lesson", "study", "education", "student", "tutor", "skill", "certificate"],
    result: {
      metrics: [
        "Course completion rate (target ≥ 25% — above industry average of 15%)",
        "Average lesson engagement time vs. total lesson length",
        "Day-7 and Day-30 learner retention rates",
        "Learner-to-paying-user conversion rate for premium content",
        "Knowledge check pass rate as a proxy for learning effectiveness",
      ],
      suggestions: [
        {
          title: "Bite-sized lesson format (≤ 10 min)",
          description:
            "Completion rates for lessons under 10 minutes are 3–5× higher than for lessons over 20 minutes. Restructure content into micro-lessons with a clear single outcome each, even if the overall curriculum is long.",
        },
        {
          title: "Spaced repetition for retention",
          description:
            "Add an automated review queue based on spaced-repetition scheduling (SM-2 algorithm). Users who revisit content on an optimised schedule retain 80%+ vs. 20% for a single pass — and it drives daily return visits.",
        },
        {
          title: "Progress milestone celebrations",
          description:
            "Visual milestone markers (25%, 50%, 75%, 100%) with a shareable completion badge dramatically improve course completion and generate organic social proof at zero cost.",
        },
        {
          title: "Peer discussion per lesson",
          description:
            "A simple per-lesson comment thread increases perceived value, surfaces real-world examples, and creates a community that competes with other platforms on dimension beyond content quality.",
        },
        {
          title: "Offline lesson downloads",
          description:
            "Commuters and learners in low-connectivity environments represent a large segment. Enabling offline lesson access removes a hard blocker to daily engagement and is a strong differentiator vs. web-only competitors.",
        },
      ],
    },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// General-purpose fallback bucket
// ─────────────────────────────────────────────────────────────────────────────

const fallbackResult: AiSuggestionsResult = {
  metrics: [
    "Day-7 retention rate — early leading indicator of product-market fit",
    "Time-to-first-value (TTFV) — minutes from sign-up to completing the core action",
    "Monthly active users (MAU) with ≥ 2 sessions per week",
    "Feature adoption rate — % of active users who used the primary feature this week",
    "Net Promoter Score (NPS) measured at day 30",
  ],
  suggestions: [
    {
      title: "Shorten the path to the aha-moment",
      description:
        "Map every step between sign-up and the first core action. Each additional screen or form field reduces activation by ~10%. Aim for the aha-moment in under 60 seconds.",
    },
    {
      title: "Add smart empty states",
      description:
        "Replace blank screens with contextual prompts that guide the user toward their first meaningful action. A well-designed empty state is a growth lever, not just a UX nicety.",
    },
    {
      title: "Implement re-engagement push notifications",
      description:
        "Users who lapse after day 3 rarely return without a prompt. A personalised re-engagement notification at the 48-hour inactivity mark can recover 15–25% of at-risk users at launch scale.",
    },
    {
      title: "Instrument key funnel events on day one",
      description:
        "Define and track 5–7 funnel events (sign-up, first action, return visit, invite, upgrade) before launch. Without this baseline, post-launch iterations are guesswork.",
    },
    {
      title: "Build a lightweight referral loop",
      description:
        "Even a simple 'invite a friend' prompt at the moment of highest delight (post-completion of the core action) can deliver k-factor > 0.2, meaningfully reducing CAC from the first week.",
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Picks the most contextually relevant suggestion bucket by counting keyword
 * matches in the lowercased PRD content. Returns the fallback if no bucket
 * scores above zero.
 */
// ─── Doc-type specific suggestion sets ───────────────────────────────────────

const architectureSuggestions: AiSuggestionsResult = {
  metrics: [
    "API p95 response time < 200ms under expected peak load",
    "Service uptime target ≥ 99.9% (measured monthly)",
    "Database query time < 50ms for primary read paths",
    "Cold start time < 1s for serverless functions",
    "Error rate < 0.1% across all API endpoints",
  ],
  suggestions: [
    {
      title: "Add a caching layer",
      description: "Introduce Redis or an in-memory cache for frequently read data to reduce database load and improve response times.",
      impact: "high",
      effort: "medium",
      category: "Performance",
    },
    {
      title: "Define a clear API versioning strategy",
      description: "Use URL-based versioning (/api/v1/) from day one to avoid breaking changes as the API evolves.",
      impact: "high",
      effort: "low",
      category: "Architecture",
    },
    {
      title: "Add structured logging and tracing",
      description: "Implement correlation IDs and structured JSON logs from the start. Retrofitting observability is expensive.",
      impact: "medium",
      effort: "low",
      category: "Observability",
    },
    {
      title: "Plan for horizontal scaling",
      description: "Ensure stateless service design so instances can be scaled horizontally without session affinity issues.",
      impact: "high",
      effort: "medium",
      category: "Scalability",
    },
  ],
};

const userStoriesSuggestions: AiSuggestionsResult = {
  metrics: [
    "Story coverage: all core features have at least one user story",
    "Acceptance criteria completeness: each story has ≥ 2 testable AC items",
    "Edge case coverage: error states and empty states are documented",
    "Priority distribution: ≥ 60% of stories are P0 or P1",
    "Story size: no story exceeds 5 story points without being split",
  ],
  suggestions: [
    {
      title: "Add empty state stories",
      description: "Every list or data view needs a story for the empty state — what does the user see when there is no data yet?",
      impact: "medium",
      effort: "low",
      category: "UX",
    },
    {
      title: "Add error state stories",
      description: "Document what happens when API calls fail, network is unavailable, or validation fails. These are often missed until QA.",
      impact: "high",
      effort: "low",
      category: "Resilience",
    },
    {
      title: "Add permission/role-based stories",
      description: "If the product has multiple user roles, add stories that explicitly test what each role can and cannot do.",
      impact: "high",
      effort: "medium",
      category: "Access Control",
    },
    {
      title: "Split large stories",
      description: "Any story that touches more than one screen or requires more than one API call should be split into smaller, independently deliverable stories.",
      impact: "medium",
      effort: "low",
      category: "Agile",
    },
  ],
};

const apiSpecSuggestions: AiSuggestionsResult = {
  metrics: [
    "API documentation coverage: 100% of endpoints documented",
    "Error code coverage: all error states have defined response schemas",
    "Authentication coverage: all protected endpoints specify auth requirements",
    "Rate limit documentation: limits defined for all public endpoints",
    "Schema validation: all request/response bodies have JSON schemas",
  ],
  suggestions: [
    {
      title: "Add a health check endpoint",
      description: "Implement GET /health returning service status, version, and dependency health. Required for load balancers and monitoring.",
      impact: "high",
      effort: "low",
      category: "Operations",
    },
    {
      title: "Define a standard error envelope",
      description: "All error responses should use a consistent shape: { error: { code, message, details? } }. Document it once and reference it everywhere.",
      impact: "high",
      effort: "low",
      category: "Consistency",
    },
    {
      title: "Add pagination to all list endpoints",
      description: "Any endpoint returning a collection should support cursor or offset pagination from day one. Retrofitting pagination breaks clients.",
      impact: "high",
      effort: "medium",
      category: "Scalability",
    },
    {
      title: "Document rate limits explicitly",
      description: "Specify rate limits per endpoint and return Retry-After headers when limits are hit. Clients need this to implement backoff.",
      impact: "medium",
      effort: "low",
      category: "API Design",
    },
  ],
};

const roadmapSuggestions: AiSuggestionsResult = {
  metrics: [
    "Phase 1 completion: all MVP features shipped within planned timeline",
    "Scope creep rate: < 20% of stories added after phase kickoff",
    "Milestone hit rate: ≥ 80% of milestones delivered on time",
    "Technical debt ratio: < 15% of sprint capacity spent on debt each phase",
    "User feedback loop: at least one user interview per phase",
  ],
  suggestions: [
    {
      title: "Add a feedback collection milestone",
      description: "Schedule a dedicated user feedback sprint after Phase 1 ships. Insights from real users should shape Phase 2 scope.",
      impact: "high",
      effort: "low",
      category: "Product",
    },
    {
      title: "Define phase exit criteria",
      description: "Each phase should have explicit, measurable exit criteria (not just 'features done'). Include performance, quality, and user metrics.",
      impact: "high",
      effort: "low",
      category: "Planning",
    },
    {
      title: "Reserve 20% capacity for technical debt",
      description: "Explicitly allocate time for refactoring and debt reduction in each phase. Unplanned debt accumulates and slows future phases.",
      impact: "medium",
      effort: "low",
      category: "Engineering",
    },
    {
      title: "Add a rollback plan per phase",
      description: "Document what happens if a phase milestone is missed by more than 2 weeks. Having a pre-agreed plan avoids reactive decisions.",
      impact: "medium",
      effort: "low",
      category: "Risk",
    },
  ],
};

function pickSuggestions(
  prdContent: string,
  userMetrics?: string,
  docType?: string,
): AiSuggestionsResult {
  // Return doc-type-specific suggestions for non-PRD documents
  if (docType === "architecture") return architectureSuggestions;
  if (docType === "user_stories") return userStoriesSuggestions;
  if (docType === "api_spec") return apiSpecSuggestions;
  if (docType === "roadmap") return roadmapSuggestions;

  // PRD: keyword-based selection (existing behaviour)
  const haystack = (prdContent + " " + (userMetrics ?? "")).toLowerCase();

  let bestBucket: SuggestionBucket | null = null;
  let bestScore = 0;

  for (const bucket of suggestionBuckets) {
    const score = bucket.keywords.reduce(
      (acc, kw) => acc + (haystack.includes(kw) ? 1 : 0),
      0,
    );
    if (score > bestScore) {
      bestScore = score;
      bestBucket = bucket;
    }
  }

  const base = bestBucket ? bestBucket.result : fallbackResult;

  if (userMetrics && userMetrics.trim().length > 20) {
    const refinedMetrics = [
      `Refined from your input: ${userMetrics.trim().slice(0, 120)}${userMetrics.trim().length > 120 ? "…" : ""}`,
      ...base.metrics.slice(0, 4),
    ];
    return { ...base, metrics: refinedMetrics };
  }

  return base;
}

// ─────────────────────────────────────────────────────────────────────────────
// Route handler
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prd_content, user_metrics, doc_type } = body as {
      prd_content?: string;
      user_metrics?: string;
      doc_type?: string;
    };

    // For non-PRD doc types, content is optional (we use doc_type to pick suggestions)
    const isNonPrd = doc_type && doc_type !== "prd";
    if (!isNonPrd && (!prd_content || prd_content.trim().length < 10)) {
      return NextResponse.json(
        {
          error:
            "Missing required field: prd_content must be a non-empty string.",
        },
        { status: 400 },
      );
    }

    // Simulate realistic AI processing latency (600 ms – 1.4 s)
    await simulateDelay(600, 1400);

    const result = pickSuggestions(prd_content ?? "", user_metrics, doc_type);

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[ai-suggestions mock] Error:", message);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 },
    );
  }
}
