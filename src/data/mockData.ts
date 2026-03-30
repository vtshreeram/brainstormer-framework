import { Project, WizardStep, DocumentOption } from '@/types';

export const wizardSteps: WizardStep[] = [
  {
    id: 'step_1',
    title: 'The Idea',
    question: 'Describe your app in 1-2 sentences. What\'s the single most important thing it does?',
    hint: 'Think of the core value—why would someone download this? What problem does it solve that nothing else does?',
    placeholder: 'A mobile app that helps...'
  },
  {
    id: 'step_2',
    title: 'Target Users',
    question: 'Who will use this app? What are they trying to accomplish? What\'s their context?',
    hint: 'Consider age, tech savviness, motivation, and constraints. Are they professionals, casual users, or a specific niche?',
    placeholder: 'Primary: Adults aged 25-45 who...'
  },
  {
    id: 'step_3',
    title: 'Core Problem',
    question: 'What pain point does it solve? How do users solve this problem today (if at all)?',
    hint: 'Get specific—what\'s broken about existing solutions? Why is the current approach failing users?',
    placeholder: 'Current problem: Users struggle with...'
  },
  {
    id: 'step_4',
    title: 'Key Features',
    question: 'What are the 3-5 primary features? Walk me through a typical user flow from opening the app.',
    hint: 'Start from when they open the app—what\'s the first action? How do features connect?',
    placeholder: '1. User authentication with OAuth...\n2. Dashboard showing...'
  },
  {
    id: 'step_5',
    title: 'Platform',
    question: 'Web, mobile (iOS/Android), or all? Any specific platform requirements or technical constraints?',
    hint: 'This affects everything—be honest about your resources. Cross-platform (React Native/Flutter) vs native?',
    placeholder: 'iOS and Android using React Native...'
  },
  {
    id: 'step_6',
    title: 'Timeline & Team',
    question: 'What\'s realistic? How many developers? What\'s your budget? Any dependencies?',
    hint: 'MVP scope should be 4-8 weeks for 1-2 developers. What must ship vs what can wait?',
    placeholder: '2 developers, 3-month timeline...'
  },
  {
    id: 'step_7',
    title: 'Success Metrics',
    question: 'How will you know it\'s working? What would "good" look like at launch, month 1, and month 3?',
    hint: 'Think: acquisition (downloads, sign-ups), engagement (DAU, retention), revenue. What\'s your north star?',
    placeholder: 'Month 1: 1000 downloads, 40% D7 retention...'
  }
];

export const documentOptions: DocumentOption[] = [
  {
    type: 'prd',
    title: 'Product Requirements Document (PRD)',
    description: 'Problem statement, personas, feature specs, success metrics',
    selected: true
  },
  {
    type: 'architecture',
    title: 'Technical Architecture',
    description: 'Stack recommendations, data model, system diagram',
    selected: true
  },
  {
    type: 'user_stories',
    title: 'User Stories & Acceptance Criteria',
    description: 'Prioritized stories with clear acceptance criteria',
    selected: false
  },
  {
    type: 'api_spec',
    title: 'API Specifications',
    description: 'Endpoints, authentication, rate limiting',
    selected: false
  },
  {
    type: 'roadmap',
    title: 'Implementation Roadmap',
    description: 'MVP phase, secondary features, sequencing rationale',
    selected: false
  }
];

export function getStatusLabel(status: Project['status']): string {
  switch (status) {
    case 'draft':
      return 'Draft';
    case 'in_progress':
      return 'In Progress';
    case 'discovery_complete':
      return 'Discovery Complete';
    case 'documents_generated':
      return 'Documents Ready';
    default:
      return status;
  }
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) {
    return 'Just now';
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
