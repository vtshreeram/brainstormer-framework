// ─────────────────────────────────────────────────────────────────────────────
// Mock AI Responses
// Used in place of real OpenAI calls during development / when no API key is set.
// Each entry is keyed by the WizardStep title (matches currentStepData.title).
// ─────────────────────────────────────────────────────────────────────────────

export interface MockStepData {
  /** Returned by /api/auto-answer for the main step question */
  mainAnswer: string;
  /** Returned by /api/follow-up — the question to ask the user */
  followUpQuestion: string;
  /** Returned by /api/auto-answer when answering the follow-up question */
  followUpAnswer: string;
  /** Returned by /api/ai-answer for any additional follow-up resolution */
  aiAnswer: string;
}

export const mockAiResponses: Record<string, MockStepData> = {
  'The Idea': {
    mainAnswer:
      'A mobile app that helps busy professionals track their daily water intake and receive smart hydration reminders that adapt to their activity level, weather, and calendar — so staying healthy never feels like extra work.',
    followUpQuestion:
      'What makes your solution different from the basic reminder apps already on the market?',
    followUpAnswer:
      'Unlike generic reminder apps, our solution learns from the user\'s daily routine, adjusts reminder frequency based on real-time activity data, and integrates with calendar events — so reminders feel timely rather than intrusive.',
    aiAnswer:
      'The core differentiator is context-awareness: most apps send reminders at fixed intervals, while ours adapts dynamically to what the user is actually doing, making compliance significantly higher.',
  },

  'Target Users': {
    mainAnswer:
      'Primary: Health-conscious adults aged 25–40 who work desk jobs and struggle to stay hydrated throughout the day. They are tech-savvy, motivated by data, and use fitness wearables. Secondary: Fitness enthusiasts who need precise hydration tracking before, during, and after workouts.',
    followUpQuestion:
      'Are your primary users more motivated by health goals, performance metrics, or habit-building streaks?',
    followUpAnswer:
      'Primarily habit-building streaks and visual progress — our research shows desk workers respond best to daily consistency badges and weekly improvement charts rather than raw health metrics.',
    aiAnswer:
      'A mix of both — they want to see measurable health improvements (like energy levels and focus) but they stay engaged through gamified streaks and social accountability features.',
  },

  'Core Problem': {
    mainAnswer:
      'Users consistently forget to drink water during busy workdays. Current solutions — generic timer apps, manual logs, or wearable prompts — don\'t adapt to context, making them easy to dismiss. The result is chronic mild dehydration that impacts focus, energy, and long-term health, yet users have no feedback loop to understand the pattern.',
    followUpQuestion:
      'How do users currently cope with this problem, and what frustrates them most about existing workarounds?',
    followUpAnswer:
      'Most users rely on "drink when thirsty" — which is already a sign of dehydration — or set alarms that they quickly learn to ignore. The biggest frustration is that no existing app ties hydration to their actual day: meetings, exercise, or hot weather go unrecognised.',
    aiAnswer:
      'They either use a basic water-tracking app that requires manual logging every sip, or they ignore hydration entirely and rely on thirst cues. The core frustration is the friction of manual entry and reminders that feel irrelevant to their current activity.',
  },

  'Key Features': {
    mainAnswer:
      '1. One-tap water logging with smart volume defaults based on container type\n2. AI-powered adaptive reminder schedule synced with calendar and activity data\n3. Daily and weekly hydration analytics with trend charts\n4. Apple Health and Google Fit integration for two-way data sync\n5. Streak system and achievement badges to build long-term habits',
    followUpQuestion:
      'If you had to ship only one feature for the MVP launch, which would it be and why?',
    followUpAnswer:
      'The adaptive reminder engine — it\'s the single feature that differentiates us from every existing app. Users can log water manually in a notes app, but no free tool currently offers intelligent, context-aware reminders. That\'s the hook that drives downloads and retention.',
    aiAnswer:
      'The smart reminder engine is non-negotiable for MVP. Without it, we\'re just another manual-logging app with no clear reason for users to switch from what they already use.',
  },

  'Platform': {
    mainAnswer:
      'iOS and Android using React Native (Expo) for a single shared codebase. Targeting iOS 16+ and Android 11+ to cover 90%+ of active devices. No web version in the MVP. Backend: Supabase for authentication and database, push notifications via Expo Notifications, HealthKit and Google Fit via native modules.',
    followUpQuestion:
      'Do you have prior experience with React Native, or will this introduce a learning curve for the team?',
    followUpAnswer:
      'Both developers have shipped two React Native apps previously, so we\'re comfortable with the ecosystem, native module bridging, and App Store / Play Store submission processes. The learning curve is minimal.',
    aiAnswer:
      'The team has solid React Native experience from previous projects. We\'re choosing Expo managed workflow to accelerate development, with the option to eject to bare workflow if we need deeper native access for HealthKit integration.',
  },

  'Timeline & Team': {
    mainAnswer:
      '2 full-stack developers working full-time over a 10-week MVP sprint. Estimated cloud infrastructure budget: $2–3k for the first 6 months (Supabase Pro + Expo push notifications). No hard external dependencies, though Apple HealthKit and Google Fit review processes can add 1–2 weeks to the App Store submission timeline.',
    followUpQuestion:
      'What is the single biggest risk that could delay the MVP beyond the planned 10-week timeline?',
    followUpAnswer:
      'App Store review — particularly for the HealthKit permission justification on iOS. We\'re planning to submit a TestFlight build by week 8 to catch any rejection early, leaving two weeks to address feedback before the public launch date.',
    aiAnswer:
      'The biggest risk is scope creep during development. We\'re applying a strict "cut or defer" rule: any feature that isn\'t core to the adaptive-reminder loop gets moved to a post-MVP backlog and won\'t block the launch.',
  },

  'Success Metrics': {
    mainAnswer:
      'Launch week: 500 downloads via ProductHunt and social media. Month 1: 2,500 downloads, 45% Day-7 retention rate, average 4 app opens per day. Month 3: 10,000 total downloads, 30% weekly active users, 5% conversion to premium tier at $2.99/month — targeting $1.5k MRR. North star metric: Day-30 retention (goal: 25%).',
    followUpQuestion:
      'How do you plan to acquire your first 1,000 users — what is your primary go-to-market channel?',
    followUpAnswer:
      'ProductHunt launch on day one, combined with a pre-launch waitlist built through a simple landing page shared in health and productivity subreddits (r/nutrition, r/getdisciplined, r/productivity). We expect 60% of early users to come from organic community posts and word-of-mouth referrals.',
    aiAnswer:
      'Primary channel: ProductHunt + Twitter/X launch thread targeting productivity and health communities. Secondary: App Store search optimisation (ASO) for keywords like "hydration tracker" and "water reminder". We\'re not budgeting for paid ads in month 1 — organic traction will validate product-market fit first.',
  },
};

/**
 * Returns the mock data for a given step title.
 * Falls back to a generic response if the step title is not found.
 */
export function getMockStepData(stepTitle: string): MockStepData {
  return (
    mockAiResponses[stepTitle] ?? {
      mainAnswer:
        'This is a well-considered approach that balances user needs with technical feasibility. It addresses the core problem directly and sets a clear path for iterative improvement after the initial launch.',
      followUpQuestion:
        'Can you provide a specific example or scenario that illustrates this point in practice?',
      followUpAnswer:
        'A concrete example would be a user who has tried existing solutions and found them lacking in exactly the ways described — this is a common pattern we\'ve validated through informal user interviews.',
      aiAnswer:
        'Based on the context provided, the most practical next step is to validate this assumption with 5–10 potential users before committing to it as a core part of the product strategy.',
    }
  );
}

/**
 * Simulates network latency for a more realistic mock experience.
 * Returns a promise that resolves after a random delay between minMs and maxMs.
 */
export function simulateDelay(minMs = 400, maxMs = 900): Promise<void> {
  const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise((resolve) => setTimeout(resolve, delay));
}
