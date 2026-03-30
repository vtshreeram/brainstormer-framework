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

export const mockProjects: Project[] = [
  {
    id: 'proj_001',
    userId: 'user_001',
    title: 'Mobile Fitness Tracker',
    description: 'Workout tracking app with social features and AI-powered workout suggestions',
    status: 'discovery_complete',
    createdAt: '2026-03-20T10:00:00Z',
    updatedAt: '2026-03-26T06:30:00Z',
    versions: [
      {
        id: 'ver_001',
        versionNumber: 'v1.2',
        name: 'Post-feedback revision',
        createdAt: '2026-03-26T06:30:00Z',
        isCurrent: true,
        responses: {
          'step_1': {
            questionId: 'step_1',
            question: wizardSteps[0].question,
            answer: 'A mobile app that helps fitness enthusiasts track workouts without gym equipment, using AI to suggest modifications based on available gear and goals.',
            assumptions: [],
            isComplete: true
          },
          'step_2': {
            questionId: 'step_2',
            question: wizardSteps[1].question,
            answer: 'Primary: Adults 25-45 who prefer home workouts. Secondary: Personal trainers who want to remotely coach clients. Context: Users are time-constrained, prefer short workouts, and often travel.',
            assumptions: [],
            isComplete: true
          },
          'step_3': {
            questionId: 'step_3',
            question: wizardSteps[2].question,
            answer: 'Current problem: Users either buy expensive equipment or have no way to track progress when traveling. Existing solutions: YouTube videos (no tracking), paper logs (no insights), gym apps (require gym). Pain: No personalization without equipment.',
            assumptions: [],
            isComplete: true
          },
          'step_4': {
            questionId: 'step_4',
            question: wizardSteps[3].question,
            answer: '1. Workout library with 500+ exercises tagged by equipment needed\n2. AI workout generator based on available equipment\n3. Progress tracking with charts and stats\n4. Social sharing for accountability\n5. Video demonstrations for each exercise',
            assumptions: [
              {
                id: 'asm_001',
                text: 'Video storage on cloud (AWS S3), not local',
                type: 'technical',
                confirmed: false
              }
            ],
            isComplete: true
          },
          'step_5': {
            questionId: 'step_5',
            question: wizardSteps[4].question,
            answer: 'iOS and Android using React Native. No web for MVP. Backend: Supabase for auth and database, Firebase for notifications.',
            assumptions: [],
            isComplete: true
          },
          'step_6': {
            questionId: 'step_6',
            question: wizardSteps[5].question,
            answer: '2 developers, 3-month timeline for MVP. Budget: $5k for cloud services initially. No external dependencies.',
            assumptions: [],
            isComplete: true
          },
          'step_7': {
            questionId: 'step_7',
            question: wizardSteps[6].question,
            answer: 'Month 1: 1000 downloads, 40% Day-7 retention. Month 3: 5000 downloads, 25% weekly active. Month 6: Premium subscription at $4.99/month.',
            assumptions: [],
            isComplete: true
          }
        }
      }
    ],
    generatedDocuments: [
      {
        id: 'doc_001',
        type: 'prd',
        title: 'Product Requirements Document',
        content: `# Product Requirements Document

## Problem Statement

Fitness enthusiasts who prefer home workouts lack a way to track progress and get personalized recommendations without expensive gym equipment. Existing solutions like YouTube (no tracking), paper logs (no insights), or gym apps (require gym membership) fail to address this gap.

## Target Users

### Primary Persona
- **Adults 25-45** who prefer home workouts
- Time-constrained, prefer short 20-30 minute sessions
- Often travel and need workout flexibility
- Own minimal equipment (resistance bands, dumbbells)

### Secondary Persona
- **Personal trainers** who want to remotely coach clients
- Need tools to create home-based programs
- Want progress visibility for their clients

## Core Features

### 1. Workout Library
- 500+ exercises tagged by required equipment
- Filter by equipment available, muscle group, difficulty
- Video demonstrations for each exercise
- User can save favorites

### 2. AI Workout Generator
- Input available equipment and goals
- Output personalized workout plans
- Adjust difficulty based on performance
- Suggest modifications for missing equipment

### 3. Progress Tracking
- Track completed workouts, sets, reps
- Visual charts for consistency and strength gains
- Calendar view of workout history
- Body measurements (optional)

### 4. Social Accountability
- Share workouts to social media
- Follow friends' progress
- Leaderboards for motivation

### 5. Video Demonstrations
- Cloud-hosted exercise videos
- Offline capable
- Timer with rest periods

## Success Metrics

| Milestone | Downloads | Retention | Engagement |
|-----------|-----------|-----------|------------|
| Month 1 | 1,000 | 40% D7 | 3 workouts/week avg |
| Month 3 | 5,000 | 25% WAU | 2.5 workouts/week avg |
| Month 6 | 15,000 | $2K MRR | Premium conversion 5% |

## Out of Scope (MVP)
- Web platform
- Wearable integrations
- Meal planning
- Live coaching features

## Assumptions
- Users have smartphones with adequate storage for app
- Cloud video streaming is acceptable (not offline-first)
- Supabase free tier sufficient for MVP user base`,
        generatedAt: '2026-03-26T06:35:00Z',
        exportCount: 3
      },
      {
        id: 'doc_002',
        type: 'architecture',
        title: 'Technical Architecture',
        content: `# Technical Architecture

## Technology Stack

### Mobile (MVP)
- **Framework**: React Native (Expo)
- **Language**: TypeScript
- **State Management**: Zustand
- **Navigation**: React Navigation 6

### Backend
- **Database & Auth**: Supabase
- **File Storage**: AWS S3 (videos)
- **Notifications**: Firebase Cloud Messaging
- **Analytics**: PostHog (self-hosted or cloud)

## Data Model

### User
\`\`\`
id: UUID (Supabase auth)
email: string
display_name: string
created_at: timestamp
profile: JSON (goals, equipment, preferences)
\`\`\`

### Workout
\`\`\`
id: UUID
name: string
description: string
duration_minutes: number
difficulty: enum (beginner, intermediate, advanced)
equipment_needed: string[]
exercises: Exercise[]
created_by: UUID (user or 'system')
is_ai_generated: boolean
\`\`\`

### Exercise
\`\`\`
id: UUID
name: string
description: string
muscle_groups: string[]
equipment_needed: string[]
video_url: string
demo_gif_url: string
instructions: string[]
\`\`\`

### WorkoutSession
\`\`\`
id: UUID
user_id: UUID
workout_id: UUID
started_at: timestamp
completed_at: timestamp
notes: string
\`\`\`

### UserEquipment
\`\`\`
user_id: UUID
equipment: string[]
updated_at: timestamp
\`\`\`

## API Endpoints (Supabase RPC/Functions)

### Workouts
- \`GET /workouts\` - List workouts with filters
- \`GET /workouts/:id\` - Get workout details
- \`POST /workouts/generate\` - AI generate workout

### Progress
- \`GET /progress/:user_id\` - Get user stats
- \`POST /sessions\` - Log completed workout
- \`GET /sessions/:user_id\` - Get workout history

### Social
- \`GET /leaderboard\` - Get weekly leaderboard
- \`POST /share/:session_id\` - Share to social

## Authentication

Supabase Auth with:
- Email/password
- Google OAuth
- Apple Sign-In (iOS)

## Scalability Considerations

- Supabase handles auth DB scaling
- S3 + CloudFront for video CDN
- Redis (Upstash) for leaderboard caching
- Consider Algolia for workout search at scale`,
        generatedAt: '2026-03-26T06:35:00Z',
        exportCount: 1
      }
    ],
    shareSettings: {
      isShared: false,
      shareToken: null,
      allowComments: false
    }
  },
  {
    id: 'proj_002',
    userId: 'user_001',
    title: 'Team Collaboration Tool',
    description: null,
    status: 'draft',
    createdAt: '2026-03-25T14:00:00Z',
    updatedAt: '2026-03-25T14:00:00Z',
    versions: [
      {
        id: 'ver_002',
        versionNumber: 'v0.1',
        name: 'Initial draft',
        createdAt: '2026-03-25T14:00:00Z',
        isCurrent: true,
        responses: {
          'step_1': {
            questionId: 'step_1',
            question: wizardSteps[0].question,
            answer: 'A team communication tool that combines real-time messaging with async video updates.',
            assumptions: [],
            isComplete: true
          },
          'step_2': {
            questionId: 'step_2',
            question: wizardSteps[1].question,
            answer: '',
            assumptions: [],
            isComplete: false
          },
          'step_3': {
            questionId: 'step_3',
            question: wizardSteps[2].question,
            answer: '',
            assumptions: [],
            isComplete: false
          },
          'step_4': {
            questionId: 'step_4',
            question: wizardSteps[3].question,
            answer: '',
            assumptions: [],
            isComplete: false
          },
          'step_5': {
            questionId: 'step_5',
            question: wizardSteps[4].question,
            answer: '',
            assumptions: [],
            isComplete: false
          },
          'step_6': {
            questionId: 'step_6',
            question: wizardSteps[5].question,
            answer: '',
            assumptions: [],
            isComplete: false
          },
          'step_7': {
            questionId: 'step_7',
            question: wizardSteps[6].question,
            answer: '',
            assumptions: [],
            isComplete: false
          }
        }
      }
    ],
    generatedDocuments: [],
    shareSettings: {
      isShared: false,
      shareToken: null,
      allowComments: false
    }
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
