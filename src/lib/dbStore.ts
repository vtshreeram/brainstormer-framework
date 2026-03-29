import {
  fetchProjects,
  fetchProject,
  fetchResponses,
  createProject as apiCreateProject,
  updateProjectDetails as apiUpdateProjectDetails,
  updateProjectStatus as apiUpdateProjectStatus,
  restoreProjectVersion as apiRestoreProjectVersion,
  deleteProject as apiDeleteProject,
  saveWizardResponse as apiSaveWizardResponse,
  saveFollowUp as apiSaveFollowUp,
  createDocument,
  updateDocumentContent,
  recordExport,
  recordFeedbackEvent,
  generateDocumentWithAI,
} from './api-client';
import { Project, Response, DocumentType } from '@/types';

export interface DbStoreConfig {
  userId: string;
}

export class DbStore {
  private userId: string;
  private projectCache: Map<string, Project> = new Map();
  private onProjectUpdate?: (project: Project) => void;

  constructor(config: DbStoreConfig) {
    this.userId = config.userId;
  }

  setOnProjectUpdate(callback: (project: Project) => void) {
    this.onProjectUpdate = callback;
  }

  private notifyUpdate(project: Project) {
    this.projectCache.set(project.id, project);
    this.onProjectUpdate?.(project);
  }

  async loadProjects(): Promise<Project[]> {
    const projects = await fetchProjects(this.userId);
    for (const p of projects) {
      this.projectCache.set(p.id, p);
    }
    return projects;
  }

  async loadProject(projectId: string): Promise<Project | null> {
    const project = await fetchProject(projectId);
    if (project) {
      this.projectCache.set(project.id, project);
    }
    return project;
  }

  getCachedProject(projectId: string): Project | undefined {
    return this.projectCache.get(projectId);
  }

  async createProject(title: string, description?: string): Promise<Project> {
    const project = await apiCreateProject(this.userId, title, description);
    this.projectCache.set(project.id, project);
    return project;
  }

  async updateProjectDetails(
    projectId: string,
    fields: { title?: string; description?: string }
  ): Promise<Project> {
    const project = await apiUpdateProjectDetails(projectId, fields);
    this.notifyUpdate(project);
    return project;
  }

  async restoreVersion(projectId: string, versionId: string): Promise<Project> {
    const project = await apiRestoreProjectVersion(projectId, versionId);
    this.notifyUpdate(project);
    return project;
  }

  async deleteProject(projectId: string): Promise<void> {
    await apiDeleteProject(projectId);
    this.projectCache.delete(projectId);
  }

  async saveResponse(
    projectId: string,
    stepId: string,
    question: string,
    answer: string,
    isComplete: boolean
  ): Promise<void> {
    await apiSaveWizardResponse(projectId, stepId, question, answer, isComplete);
  }

  async saveFollowUp(
    projectId: string,
    stepId: string,
    data: {
      followUpQuestion?: string;
      followUpAnswer?: string;
      followUpSkipped?: boolean;
    }
  ): Promise<void> {
    await apiSaveFollowUp(projectId, stepId, data);
  }

  async updateStatus(projectId: string, status: Project['status']): Promise<Project> {
    const project = await apiUpdateProjectStatus(projectId, status);
    this.notifyUpdate(project);
    return project;
  }

  async generateDocument(
    projectId: string,
    docType: DocumentType,
    projectTitle: string,
    responses: Record<string, Response>
  ): Promise<{
    id: string;
    type: DocumentType;
    title: string;
    content: string;
    generatedAt: string;
    exportCount: number;
    modelId?: string;
    promptVersion?: string;
  }> {
    const result = await generateDocumentWithAI(projectId, docType, projectTitle, responses as Record<string, Response>);

    await createDocument(projectId, docType, result.title, result.content, result.promptVersion, result.modelId);

    const project = await this.loadProject(projectId);
    if (project) {
      this.notifyUpdate(project);
    }

    return result;
  }

  async updateDocument(
    projectId: string,
    docId: string,
    content: string
  ): Promise<void> {
    await updateDocumentContent(projectId, docId, content);
  }

  async recordExport(projectId: string, docType: DocumentType): Promise<void> {
    await recordExport(projectId, docType);
  }

  async recordFeedback(
    event: {
      projectId?: string;
      docId?: string;
      eventType: string;
      payload?: Record<string, unknown>;
    }
  ): Promise<string> {
    return recordFeedbackEvent(event);
  }
}

let storeInstance: DbStore | null = null;

export function initDbStore(userId: string): DbStore {
  if (!storeInstance) {
    storeInstance = new DbStore({ userId });
  }
  return storeInstance;
}

export function getDbStore(): DbStore | null {
  return storeInstance;
}