import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Project, Response, Toast, DocumentOption, DocumentType, GeneratedDocument } from '@/types';
import { mockProjects, documentOptions as defaultDocOptions } from '@/data/mockData';

interface AppState {
  projects: Project[];
  currentProjectId: string | null;
  currentVersionId: string | null;
  currentStep: number;
  responses: Record<string, Response>;
  selectedDocuments: DocumentOption[];
  toasts: Toast[];
  isGenerating: boolean;
  isNewProjectModalOpen: boolean;
  newProjectTitle: string;
  
  setCurrentProject: (projectId: string | null) => void;
  setCurrentVersion: (versionId: string | null) => void;
  setCurrentStep: (step: number) => void;
  
  createProject: (title: string, description?: string) => Project;
  deleteProject: (projectId: string) => void;
  updateProjectStatus: (projectId: string, status: Project['status']) => void;
  
  setResponse: (stepId: string, response: Response) => void;
  updateResponse: (stepId: string, answer: string) => void;
  confirmAssumption: (stepId: string, assumptionId: string) => void;
  
  toggleDocumentSelection: (docType: DocumentType) => void;
  generateDocuments: () => GeneratedDocument[];
  
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  
  setNewProjectModalOpen: (open: boolean) => void;
  setNewProjectTitle: (title: string) => void;
  
  resetWizard: () => void;
  getCurrentProject: () => Project | null;
  getCurrentVersion: () => Project['versions'][0] | null;
  getCompletionPercentage: () => number;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      projects: mockProjects,
      currentProjectId: null,
      currentVersionId: null,
      currentStep: 0,
      responses: {},
      selectedDocuments: defaultDocOptions,
      toasts: [],
      isGenerating: false,
      isNewProjectModalOpen: false,
      newProjectTitle: '',
      
      setCurrentProject: (projectId) => {
        const project = projectId ? get().projects.find(p => p.id === projectId) : null;
        set({ 
          currentProjectId: projectId,
          currentVersionId: project?.versions.find(v => v.isCurrent)?.id || null,
          responses: project?.versions.find(v => v.isCurrent)?.responses || {}
        });
      },
      
      setCurrentVersion: (versionId) => {
        set({ currentVersionId: versionId });
      },
      
      setCurrentStep: (step) => {
        set({ currentStep: step });
      },
      
      createProject: (title, description) => {
        const newProject: Project = {
          id: `proj_${uuidv4().slice(0, 8)}`,
          title,
          description: description || null,
          status: 'draft',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          versions: [
            {
              id: `ver_${uuidv4().slice(0, 8)}`,
              versionNumber: 'v0.1',
              name: 'Initial draft',
              createdAt: new Date().toISOString(),
              isCurrent: true,
              responses: {}
            }
          ],
          generatedDocuments: [],
          shareSettings: {
            isShared: false,
            shareToken: null,
            allowComments: false
          }
        };
        
        set((state) => ({
          projects: [newProject, ...state.projects],
          currentProjectId: newProject.id,
          currentVersionId: newProject.versions[0].id,
          currentStep: 0,
          responses: {},
          isNewProjectModalOpen: false,
          newProjectTitle: ''
        }));
        
        return newProject;
      },
      
      deleteProject: (projectId) => {
        set((state) => ({
          projects: state.projects.filter(p => p.id !== projectId),
          currentProjectId: state.currentProjectId === projectId ? null : state.currentProjectId
        }));
      },
      
      updateProjectStatus: (projectId, status) => {
        set((state) => ({
          projects: state.projects.map(p => 
            p.id === projectId 
              ? { ...p, status, updatedAt: new Date().toISOString() }
              : p
          )
        }));
      },
      
      setResponse: (stepId, response) => {
        set((state) => ({
          responses: { ...state.responses, [stepId]: response }
        }));
      },
      
      updateResponse: (stepId, answer) => {
        const state = get();
        const existingResponse = state.responses[stepId];
        
        if (existingResponse) {
          set((state) => ({
            responses: {
              ...state.responses,
              [stepId]: { ...existingResponse, answer, isComplete: answer.trim().length > 0 }
            }
          }));
        }
      },
      
      confirmAssumption: (stepId, assumptionId) => {
        const state = get();
        const response = state.responses[stepId];
        
        if (response) {
          set((state) => ({
            responses: {
              ...state.responses,
              [stepId]: {
                ...response,
                assumptions: response.assumptions.map(a =>
                  a.id === assumptionId ? { ...a, confirmed: true } : a
                )
              }
            }
          }));
        }
      },
      
      toggleDocumentSelection: (docType) => {
        set((state) => ({
          selectedDocuments: state.selectedDocuments.map(d =>
            d.type === docType ? { ...d, selected: !d.selected } : d
          )
        }));
      },
      
      generateDocuments: () => {
        const state = get();
        const project = state.getCurrentProject();
        
        if (!project) return [];
        
        set({ isGenerating: true });
        
        const selected = state.selectedDocuments.filter(d => d.selected);
        const generatedDocs: GeneratedDocument[] = selected.map((doc, index) => ({
          id: `doc_${uuidv4().slice(0, 8)}`,
          type: doc.type,
          title: doc.title,
          content: generateDocumentContent(doc.type, state.responses, project.title),
          generatedAt: new Date().toISOString(),
          exportCount: 0
        }));
        
        set((state) => ({
          projects: state.projects.map(p =>
            p.id === project.id
              ? { 
                  ...p, 
                  generatedDocuments: generatedDocs,
                  status: 'documents_generated',
                  updatedAt: new Date().toISOString()
                }
              : p
          ),
          isGenerating: false
        }));
        
        return generatedDocs;
      },
      
      addToast: (toast) => {
        const id = uuidv4();
        set((state) => ({
          toasts: [...state.toasts, { ...toast, id }]
        }));
        
        setTimeout(() => {
          get().removeToast(id);
        }, 5000);
      },
      
      removeToast: (id) => {
        set((state) => ({
          toasts: state.toasts.filter(t => t.id !== id)
        }));
      },
      
      setNewProjectModalOpen: (open) => {
        set({ isNewProjectModalOpen: open, newProjectTitle: open ? '' : '' });
      },
      
      setNewProjectTitle: (title) => {
        set({ newProjectTitle: title });
      },
      
      resetWizard: () => {
        set({
          currentStep: 0,
          responses: {},
          selectedDocuments: defaultDocOptions
        });
      },
      
      getCurrentProject: () => {
        const state = get();
        return state.projects.find(p => p.id === state.currentProjectId) || null;
      },
      
      getCurrentVersion: () => {
        const state = get();
        const project = state.getCurrentProject();
        return project?.versions.find(v => v.id === state.currentVersionId) || null;
      },
      
      getCompletionPercentage: () => {
        const state = get();
        const totalSteps = 7;
        const completedSteps = Object.values(state.responses).filter(r => r.isComplete).length;
        return Math.round((completedSteps / totalSteps) * 100);
      }
    }),
    {
      name: 'brainstormer-storage',
      partialize: (state) => ({
        projects: state.projects,
        currentProjectId: state.currentProjectId,
        currentVersionId: state.currentVersionId
      })
    }
  )
);

function generateDocumentContent(
  type: DocumentType, 
  responses: Record<string, Response>,
  projectTitle: string
): string {
  const getAnswer = (stepId: string) => responses[stepId]?.answer || '';
  
  switch (type) {
    case 'prd':
      return `# Product Requirements Document

## Problem Statement

${getAnswer('step_3') || 'Problem statement will be generated based on your inputs.'}

## Target Users

${getAnswer('step_2') || 'Target user description will be generated based on your inputs.'}

## Core Features

${getAnswer('step_4') || 'Core features will be generated based on your inputs.'}

## Success Metrics

${getAnswer('step_7') || 'Success metrics will be generated based on your inputs.'}

## Platform

${getAnswer('step_5') || 'Platform information will be generated based on your inputs.'}

## Timeline & Team

${getAnswer('step_6') || 'Timeline and team information will be generated based on your inputs.'}
`;
    
    case 'architecture':
      return `# Technical Architecture

## Overview

This document outlines the recommended technical architecture for **${projectTitle}**.

## Platform

${getAnswer('step_5') || 'Platform information will be generated based on your inputs.'}

## Recommended Technology Stack

### Frontend
- React Native (for cross-platform mobile)
- TypeScript
- Zustand (state management)

### Backend
- Supabase (auth + database)
- AWS S3 (file storage)
- Firebase (notifications)

## Data Model

### Users
- id (UUID)
- email
- created_at

### Projects
- id (UUID)
- user_id (FK)
- title
- description
- created_at

## Timeline & Team

${getAnswer('step_6') || 'Timeline and team information will be generated based on your inputs.'}
`;
    
    case 'user_stories':
      return `# User Stories & Acceptance Criteria

## Overview

This document outlines user stories for **${projectTitle}** based on the discovery responses.

## User Stories

### As a [user type], I want to [action], so that [benefit]

1. **Story**: As a user, I want to [feature], so that [benefit]
   - **Acceptance Criteria**:
     - [ ] Given [context], when [action], then [result]
     - [ ] Given [context], when [action], then [result]

2. **Story**: As a user, I want to [feature], so that [benefit]
   - **Acceptance Criteria**:
     - [ ] Given [context], when [action], then [result]

## Priority

| Priority | Story | Description |
|----------|-------|-------------|
| P0 | MVP features | Must have for launch |
| P1 | Enhanced features | Should have |
| P2 | Nice to have | Could include later |
`;
    
    case 'api_spec':
      return `# API Specifications

## Overview

This document outlines the API specifications for **${projectTitle}**.

## Authentication

- JWT-based authentication via Supabase
- API key for server-to-server communication

## Endpoints

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/users/me | Get current user |
| PATCH | /api/users/me | Update user profile |

### Projects

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/projects | List user projects |
| POST | /api/projects | Create project |
| GET | /api/projects/:id | Get project |
| PATCH | /api/projects/:id | Update project |
| DELETE | /api/projects/:id | Delete project |

## Rate Limiting

- 100 requests per minute per user
- 1000 requests per minute per API key

## Error Handling

All errors return JSON:
\`\`\`json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
\`\`\`
`;
    
    case 'roadmap':
      return `# Implementation Roadmap

## Overview

This document outlines the implementation roadmap for **${projectTitle}**.

## Timeline

${getAnswer('step_6') || 'Timeline and team information will be generated based on your inputs.'}

## Phase 1: MVP (Weeks 1-4)

### Core Features
- [Feature 1]
- [Feature 2]
- [Feature 3]

### Success Criteria
- [ ] Feature complete
- [ ] Basic testing passed
- [ ] Deployed to production

## Phase 2: Enhanced Features (Weeks 5-8)

### Additional Features
- [Feature 4]
- [Feature 5]

### Improvements
- Performance optimization
- Bug fixes

## Phase 3: Polish & Launch (Weeks 9-12)

### Launch Preparation
- [ ] Marketing materials ready
- [ ] Documentation complete
- [ ] Support channels established

### Post-Launch
- Monitor metrics
- Gather user feedback
- Plan iterations
`;
    
    default:
      return '';
  }
}
