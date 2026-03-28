import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import {
  Project,
  Response,
  Toast,
  DocumentOption,
  DocumentType,
  GeneratedDocument,
  AiSuggestionsResult,
} from "@/types";
import {
  mockProjects,
  documentOptions as defaultDocOptions,
} from "@/data/mockData";

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
  updateProjectStatus: (projectId: string, status: Project["status"]) => void;
  updateProject: (projectId: string, fields: { title?: string; description?: string }) => void;
  restoreVersion: (projectId: string, versionId: string) => void;

  setResponse: (stepId: string, response: Response) => void;
  updateResponse: (stepId: string, answer: string) => void;
  confirmAssumption: (stepId: string, assumptionId: string) => void;
  setFollowUpQuestion: (stepId: string, question: string) => void;
  setFollowUpAnswer: (stepId: string, answer: string) => void;
  skipFollowUp: (stepId: string) => void;
  clearFollowUp: (stepId: string) => void;

  toggleDocumentSelection: (docType: DocumentType) => void;
  generateDocuments: () => GeneratedDocument[];
  generateSingleDocument: (
    projectId: string,
    docType: DocumentType,
  ) => GeneratedDocument | null;
  updateGeneratedDocument: (
    projectId: string,
    docId: string,
    content: string,
  ) => void;
  incrementExportCount: (projectId: string, docId: string) => void;

  aiSuggestions: Record<string, AiSuggestionsResult>;
  isLoadingSuggestions: boolean;
  fetchAiSuggestions: (
    docId: string,
    prdContent: string,
    userMetrics?: string,
    docType?: string,
  ) => Promise<void>;
  acceptSuggestedMetrics: (
    projectId: string,
    docId: string,
    metrics: string[],
  ) => void;
  clearAiSuggestions: (docId: string) => void;

  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;

  setNewProjectModalOpen: (open: boolean) => void;
  setNewProjectTitle: (title: string) => void;

  resetWizard: () => void;
  getCurrentProject: () => Project | null;
  getCurrentVersion: () => Project["versions"][0] | null;
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
      newProjectTitle: "",
      aiSuggestions: {},
      isLoadingSuggestions: false,

      setCurrentProject: (projectId) => {
        const project = projectId
          ? get().projects.find((p) => p.id === projectId)
          : null;
        set({
          currentProjectId: projectId,
          currentVersionId:
            project?.versions.find((v) => v.isCurrent)?.id || null,
          responses:
            project?.versions.find((v) => v.isCurrent)?.responses || {},
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
          status: "draft",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          versions: [
            {
              id: `ver_${uuidv4().slice(0, 8)}`,
              versionNumber: "v0.1",
              name: "Initial draft",
              createdAt: new Date().toISOString(),
              isCurrent: true,
              responses: {},
            },
          ],
          generatedDocuments: [],
          shareSettings: {
            isShared: false,
            shareToken: null,
            allowComments: false,
          },
        };

        set((state) => ({
          projects: [newProject, ...state.projects],
          currentProjectId: newProject.id,
          currentVersionId: newProject.versions[0].id,
          currentStep: 0,
          responses: {},
          isNewProjectModalOpen: false,
          newProjectTitle: "",
        }));

        return newProject;
      },

      deleteProject: (projectId) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== projectId),
          currentProjectId:
            state.currentProjectId === projectId
              ? null
              : state.currentProjectId,
        }));
      },

      updateProjectStatus: (projectId, status) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? { ...p, status, updatedAt: new Date().toISOString() }
              : p,
          ),
        }));
      },

      updateProject: (projectId, fields) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? { ...p, ...fields, updatedAt: new Date().toISOString() }
              : p,
          ),
        }));
      },

      restoreVersion: (projectId, versionId) => {
        const project = get().projects.find((p) => p.id === projectId);
        if (!project) return;
        const targetVersion = project.versions.find((v) => v.id === versionId);
        if (!targetVersion) return;

        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  updatedAt: new Date().toISOString(),
                  versions: p.versions.map((v) => ({
                    ...v,
                    isCurrent: v.id === versionId,
                  })),
                }
              : p,
          ),
          currentVersionId: versionId,
          responses: targetVersion.responses,
        }));
      },

      setResponse: (stepId, response) => {
        set((state) => {
          const { currentProjectId, currentVersionId } = state;
          return {
            responses: { ...state.responses, [stepId]: response },
            projects:
              currentProjectId && currentVersionId
                ? state.projects.map((p) =>
                    p.id === currentProjectId
                      ? {
                          ...p,
                          updatedAt: new Date().toISOString(),
                          versions: p.versions.map((v) =>
                            v.id === currentVersionId
                              ? {
                                  ...v,
                                  responses: {
                                    ...v.responses,
                                    [stepId]: response,
                                  },
                                }
                              : v,
                          ),
                        }
                      : p,
                  )
                : state.projects,
          };
        });
      },

      updateResponse: (stepId, answer) => {
        set((state) => {
          const existingResponse = state.responses[stepId];
          if (!existingResponse) return state;

          const updatedResponse = {
            ...existingResponse,
            answer,
            isComplete: answer.trim().length > 0,
          };

          const { currentProjectId, currentVersionId } = state;
          return {
            responses: { ...state.responses, [stepId]: updatedResponse },
            projects:
              currentProjectId && currentVersionId
                ? state.projects.map((p) =>
                    p.id === currentProjectId
                      ? {
                          ...p,
                          updatedAt: new Date().toISOString(),
                          versions: p.versions.map((v) =>
                            v.id === currentVersionId
                              ? {
                                  ...v,
                                  responses: {
                                    ...v.responses,
                                    [stepId]: updatedResponse,
                                  },
                                }
                              : v,
                          ),
                        }
                      : p,
                  )
                : state.projects,
          };
        });
      },

      setFollowUpQuestion: (stepId, question) => {
        set((state) => {
          const existingResponse = state.responses[stepId];
          if (!existingResponse) return state;

          const updatedResponse = {
            ...existingResponse,
            followUpQuestion: question,
            // reset any previous follow-up answer/skip when a new question arrives
            followUpAnswer: undefined as string | undefined,
            followUpSkipped: false,
          };

          const { currentProjectId, currentVersionId } = state;
          return {
            responses: { ...state.responses, [stepId]: updatedResponse },
            projects:
              currentProjectId && currentVersionId
                ? state.projects.map((p) =>
                    p.id === currentProjectId
                      ? {
                          ...p,
                          updatedAt: new Date().toISOString(),
                          versions: p.versions.map((v) =>
                            v.id === currentVersionId
                              ? {
                                  ...v,
                                  responses: {
                                    ...v.responses,
                                    [stepId]: updatedResponse,
                                  },
                                }
                              : v,
                          ),
                        }
                      : p,
                  )
                : state.projects,
          };
        });
      },

      setFollowUpAnswer: (stepId, answer) => {
        set((state) => {
          const existingResponse = state.responses[stepId];
          if (!existingResponse) return state;

          const updatedResponse = {
            ...existingResponse,
            followUpAnswer: answer,
            followUpSkipped: false,
          };

          const { currentProjectId, currentVersionId } = state;
          return {
            responses: { ...state.responses, [stepId]: updatedResponse },
            projects:
              currentProjectId && currentVersionId
                ? state.projects.map((p) =>
                    p.id === currentProjectId
                      ? {
                          ...p,
                          updatedAt: new Date().toISOString(),
                          versions: p.versions.map((v) =>
                            v.id === currentVersionId
                              ? {
                                  ...v,
                                  responses: {
                                    ...v.responses,
                                    [stepId]: updatedResponse,
                                  },
                                }
                              : v,
                          ),
                        }
                      : p,
                  )
                : state.projects,
          };
        });
      },

      skipFollowUp: (stepId) => {
        set((state) => {
          const existingResponse = state.responses[stepId];
          if (!existingResponse) return state;

          const updatedResponse = {
            ...existingResponse,
            followUpSkipped: true,
            followUpAnswer: undefined as string | undefined,
          };

          const { currentProjectId, currentVersionId } = state;
          return {
            responses: { ...state.responses, [stepId]: updatedResponse },
            projects:
              currentProjectId && currentVersionId
                ? state.projects.map((p) =>
                    p.id === currentProjectId
                      ? {
                          ...p,
                          updatedAt: new Date().toISOString(),
                          versions: p.versions.map((v) =>
                            v.id === currentVersionId
                              ? {
                                  ...v,
                                  responses: {
                                    ...v.responses,
                                    [stepId]: updatedResponse,
                                  },
                                }
                              : v,
                          ),
                        }
                      : p,
                  )
                : state.projects,
          };
        });
      },

      clearFollowUp: (stepId) => {
        set((state) => {
          const existingResponse = state.responses[stepId];
          if (!existingResponse) return state;

          const updatedResponse = {
            ...existingResponse,
            followUpQuestion: undefined as string | undefined,
            followUpAnswer: undefined as string | undefined,
            followUpSkipped: false,
          };

          const { currentProjectId, currentVersionId } = state;
          return {
            responses: { ...state.responses, [stepId]: updatedResponse },
            projects:
              currentProjectId && currentVersionId
                ? state.projects.map((p) =>
                    p.id === currentProjectId
                      ? {
                          ...p,
                          updatedAt: new Date().toISOString(),
                          versions: p.versions.map((v) =>
                            v.id === currentVersionId
                              ? {
                                  ...v,
                                  responses: {
                                    ...v.responses,
                                    [stepId]: updatedResponse,
                                  },
                                }
                              : v,
                          ),
                        }
                      : p,
                  )
                : state.projects,
          };
        });
      },

      confirmAssumption: (stepId, assumptionId) => {
        set((state) => {
          const response = state.responses[stepId];
          if (!response) return state;

          const updatedResponse = {
            ...response,
            assumptions: response.assumptions.map((a) =>
              a.id === assumptionId ? { ...a, confirmed: true } : a,
            ),
          };

          const { currentProjectId, currentVersionId } = state;
          return {
            responses: { ...state.responses, [stepId]: updatedResponse },
            projects:
              currentProjectId && currentVersionId
                ? state.projects.map((p) =>
                    p.id === currentProjectId
                      ? {
                          ...p,
                          updatedAt: new Date().toISOString(),
                          versions: p.versions.map((v) =>
                            v.id === currentVersionId
                              ? {
                                  ...v,
                                  responses: {
                                    ...v.responses,
                                    [stepId]: updatedResponse,
                                  },
                                }
                              : v,
                          ),
                        }
                      : p,
                  )
                : state.projects,
          };
        });
      },

      toggleDocumentSelection: (docType) => {
        set((state) => ({
          selectedDocuments: state.selectedDocuments.map((d) =>
            d.type === docType ? { ...d, selected: !d.selected } : d,
          ),
        }));
      },

      updateGeneratedDocument: (projectId, docId, content) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  generatedDocuments: p.generatedDocuments.map((d) =>
                    d.id === docId ? { ...d, content } : d,
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : p,
          ),
        }));
      },

      incrementExportCount: (projectId, docId) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  generatedDocuments: p.generatedDocuments.map((d) =>
                    d.id === docId
                      ? { ...d, exportCount: (d.exportCount || 0) + 1 }
                      : d,
                  ),
                }
              : p,
          ),
        }));
      },

      fetchAiSuggestions: async (docId, prdContent, userMetrics, docType) => {
        set({ isLoadingSuggestions: true });
        try {
          const response = await fetch("/api/ai-suggestions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prd_content: prdContent,
              user_metrics: userMetrics,
              doc_type: docType,
            }),
          });

          if (!response.ok) {
            throw new Error(
              `AI suggestions request failed: ${response.status}`,
            );
          }

          const result: AiSuggestionsResult = await response.json();

          set((state) => ({
            aiSuggestions: { ...state.aiSuggestions, [docId]: result },
            isLoadingSuggestions: false,
          }));
        } catch (error) {
          console.error("[fetchAiSuggestions] Error:", error);
          set({ isLoadingSuggestions: false });
        }
      },

      acceptSuggestedMetrics: (projectId, docId, metrics) => {
        const state = get();
        const project = state.projects.find((p) => p.id === projectId);
        const doc = project?.generatedDocuments.find((d) => d.id === docId);
        if (!doc) return;

        const formattedMetrics = metrics.map((m) => `- ${m}`).join("\n");

        const updatedContent = doc.content.replace(
          /(##\s+Success Metrics\s*\n)([\s\S]*?)(\n##|\n#|$)/,
          (match, heading, _old, tail) =>
            `${heading}\n${formattedMetrics}\n${tail}`,
        );

        const changed = updatedContent !== doc.content;
        state.updateGeneratedDocument(
          projectId,
          docId,
          changed
            ? updatedContent
            : doc.content + `\n\n## Success Metrics\n\n${formattedMetrics}\n`,
        );
      },

      clearAiSuggestions: (docId) => {
        set((state) => {
          const updated = { ...state.aiSuggestions };
          delete updated[docId];
          return { aiSuggestions: updated };
        });
      },

      generateDocuments: () => {
        const state = get();
        const project = state.getCurrentProject();

        if (!project) return [];

        set({ isGenerating: true });

        const selected = state.selectedDocuments.filter((d) => d.selected);
        const generatedDocs: GeneratedDocument[] = selected.map(
          (doc, index) => ({
            id: `doc_${uuidv4().slice(0, 8)}`,
            type: doc.type,
            title: doc.title,
            content: generateDocumentContent(
              doc.type,
              state.responses,
              project.title,
            ),
            generatedAt: new Date().toISOString(),
            exportCount: 0,
          }),
        );

        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === project.id
              ? {
                  ...p,
                  generatedDocuments: generatedDocs,
                  status: "documents_generated",
                  updatedAt: new Date().toISOString(),
                }
              : p,
          ),
          isGenerating: false,
        }));

        return generatedDocs;
      },

      generateSingleDocument: (projectId: string, docType: DocumentType) => {
        const state = get();
        const project = state.projects.find((p) => p.id === projectId);
        if (!project) return null;

        // Check if already generated
        if (project.generatedDocuments.some((d) => d.type === docType))
          return null;

        const titleMap: Record<DocumentType, string> = {
          prd: "Product Requirements Document",
          architecture: "Technical Architecture",
          user_stories: "User Stories & Acceptance Criteria",
          api_spec: "API Specifications",
          roadmap: "Implementation Roadmap",
        };

        // Get responses from the current version
        const currentVersion = project.versions.find((v) => v.isCurrent);
        const responses = currentVersion?.responses || state.responses;

        const newDoc: GeneratedDocument = {
          id: `doc_${uuidv4().slice(0, 8)}`,
          type: docType,
          title: titleMap[docType],
          content: generateDocumentContent(docType, responses, project.title),
          generatedAt: new Date().toISOString(),
          exportCount: 0,
        };

        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  generatedDocuments: [...p.generatedDocuments, newDoc],
                  status: "documents_generated" as const,
                  updatedAt: new Date().toISOString(),
                }
              : p,
          ),
        }));

        return newDoc;
      },

      addToast: (toast) => {
        const id = uuidv4();
        set((state) => ({
          toasts: [...state.toasts, { ...toast, id }],
        }));

        setTimeout(() => {
          get().removeToast(id);
        }, 5000);
      },

      removeToast: (id) => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      },

      setNewProjectModalOpen: (open) => {
        set({ isNewProjectModalOpen: open, newProjectTitle: open ? "" : "" });
      },

      setNewProjectTitle: (title) => {
        set({ newProjectTitle: title });
      },

      resetWizard: () => {
        set({
          currentStep: 0,
          responses: {},
          selectedDocuments: defaultDocOptions,
        });
      },

      getCurrentProject: () => {
        const state = get();
        return (
          state.projects.find((p) => p.id === state.currentProjectId) || null
        );
      },

      getCurrentVersion: () => {
        const state = get();
        const project = state.getCurrentProject();
        return (
          project?.versions.find((v) => v.id === state.currentVersionId) || null
        );
      },

      getCompletionPercentage: () => {
        const state = get();
        const totalSteps = 7;
        const completedSteps = Object.values(state.responses).filter(
          (r) => r.isComplete,
        ).length;
        return Math.round((completedSteps / totalSteps) * 100);
      },
    }),
    {
      name: "brainstormer-storage",
      partialize: (state) => ({
        projects: state.projects,
        currentProjectId: state.currentProjectId,
        currentVersionId: state.currentVersionId,
      }),
    },
  ),
);

function generateDocumentContent(
  type: DocumentType,
  responses: Record<string, Response>,
  projectTitle: string,
): string {
  const getAnswer = (stepId: string) => responses[stepId]?.answer || "";

  switch (type) {
    case "prd":
      return `# Product Requirements Document

## Problem Statement

${getAnswer("step_3") || "Problem statement will be generated based on your inputs."}

## Target Users

${getAnswer("step_2") || "Target user description will be generated based on your inputs."}

## Core Features

${getAnswer("step_4") || "Core features will be generated based on your inputs."}

## Success Metrics

${getAnswer("step_7") || "Success metrics will be generated based on your inputs."}

## Platform

${getAnswer("step_5") || "Platform information will be generated based on your inputs."}

## Timeline & Team

${getAnswer("step_6") || "Timeline and team information will be generated based on your inputs."}
`;

    case "architecture":
      return `# Technical Architecture

## Overview

This document outlines the recommended technical architecture for **${projectTitle}**.

## Platform

${getAnswer("step_5") || "Platform information will be generated based on your inputs."}

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

${getAnswer("step_6") || "Timeline and team information will be generated based on your inputs."}
`;

    case "user_stories":
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

    case "api_spec":
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

    case "roadmap":
      return `# Implementation Roadmap

## Overview

This document outlines the implementation roadmap for **${projectTitle}**.

## Timeline

${getAnswer("step_6") || "Timeline and team information will be generated based on your inputs."}

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
      return "";
  }
}
