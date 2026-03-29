import { Project, DocumentType, Response } from '@/types';

const API_BASE = '/api';

export interface ApiError {
  error: string;
  status?: number;
}

async function handleResponse<T>(res: globalThis.Response): Promise<T> {
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(data.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function fetchProjects(userId: string): Promise<Project[]> {
  const res = await fetch(`${API_BASE}/projects`, {
    headers: { 'x-user-id': userId },
  });
  const data = await handleResponse<{ projects: Project[] }>(res);
  return data.projects;
}

export async function fetchProject(projectId: string): Promise<Project> {
  const res = await fetch(`${API_BASE}/projects/${projectId}`);
  const data = await handleResponse<{ project: Project }>(res);
  return data.project;
}

export async function createProject(
  userId: string,
  title: string,
  description?: string
): Promise<Project> {
  const res = await fetch(`${API_BASE}/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': userId,
    },
    body: JSON.stringify({ title, description }),
  });
  const data = await handleResponse<{ project: Project }>(res);
  return data.project;
}

export async function updateProjectDetails(
  projectId: string,
  fields: { title?: string; description?: string }
): Promise<Project> {
  const res = await fetch(`${API_BASE}/projects/${projectId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'updateDetails', ...fields }),
  });
  const data = await handleResponse<{ project: Project }>(res);
  return data.project;
}

export async function updateProjectStatus(
  projectId: string,
  status: Project['status']
): Promise<Project> {
  const res = await fetch(`${API_BASE}/projects/${projectId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'updateStatus', status }),
  });
  const data = await handleResponse<{ project: Project }>(res);
  return data.project;
}

export async function restoreProjectVersion(
  projectId: string,
  versionId: string
): Promise<Project> {
  const res = await fetch(`${API_BASE}/projects/${projectId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'restoreVersion', versionId }),
  });
  const data = await handleResponse<{ project: Project }>(res);
  return data.project;
}

export async function deleteProject(projectId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/projects/${projectId}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error('Failed to delete project');
  }
}

export async function saveWizardResponse(
  projectId: string,
  stepId: string,
  question: string,
  answer: string,
  isComplete: boolean
): Promise<void> {
  const res = await fetch(`${API_BASE}/projects/${projectId}/responses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'saveResponse',
      stepId,
      question,
      answer,
      isComplete,
    }),
  });
  if (!res.ok) {
    throw new Error('Failed to save response');
  }
}

export async function saveFollowUp(
  projectId: string,
  stepId: string,
  data: {
    followUpQuestion?: string;
    followUpAnswer?: string;
    followUpSkipped?: boolean;
  }
): Promise<void> {
  const res = await fetch(`${API_BASE}/projects/${projectId}/responses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'saveFollowUp',
      stepId,
      followUpData: data,
    }),
  });
  if (!res.ok) {
    throw new Error('Failed to save follow-up');
  }
}

export async function createDocument(
  projectId: string,
  docType: DocumentType,
  title: string,
  content: string,
  promptVersion?: string,
  modelId?: string
): Promise<Project['generatedDocuments'][0]> {
  const res = await fetch(`${API_BASE}/projects/${projectId}/documents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'create',
      docType,
      title,
      content,
      promptVersion,
      modelId,
    }),
  });
  const data = await handleResponse<{ document: Project['generatedDocuments'][0] }>(res);
  return data.document;
}

export async function updateDocumentContent(
  projectId: string,
  docId: string,
  content: string
): Promise<void> {
  const res = await fetch(`${API_BASE}/projects/${projectId}/documents`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ docId, content }),
  });
  if (!res.ok) {
    throw new Error('Failed to update document');
  }
}

export async function recordExport(
  projectId: string,
  docType: DocumentType
): Promise<void> {
  const res = await fetch(`${API_BASE}/projects/${projectId}/documents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'incrementExport',
      docType,
    }),
  });
  if (!res.ok) {
    throw new Error('Failed to record export');
  }
}

export async function fetchResponses(projectId: string): Promise<Record<string, Response>> {
  const res = await fetch(`${API_BASE}/projects/${projectId}/responses`);
  const data = await handleResponse<{ responses: Record<string, Response> }>(res);
  return data.responses;
}

export async function recordFeedbackEvent(
  event: {
    projectId?: string;
    docId?: string;
    eventType: string;
    payload?: Record<string, unknown>;
  }
): Promise<string> {
  const res = await fetch(`${API_BASE}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
  });
  const data = await handleResponse<{ id: string }>(res);
  return data.id;
}

export async function generateDocumentWithAI(
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
  const res = await fetch(`${API_BASE}/generate-document`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      projectId,
      docType,
      projectTitle,
      responses,
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: 'Generation failed' }));
    throw new Error(data.error || 'Failed to generate document');
  }

  return res.json();
}