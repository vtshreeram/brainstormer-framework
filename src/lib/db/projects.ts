import { query } from '../db';
import { Project, Version, Response, GeneratedDocument, ShareSettings, Assumption } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export interface ProjectRow {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: Project['status'];
  created_at: string;
  updated_at: string;
}

export interface DbProject {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  versions?: VersionRow[];
  generated_documents?: GeneratedDocumentRow[];
  share_settings?: ShareSettingsRow | null;
}

export interface VersionRow {
  id: string;
  project_id: string;
  version_number: string;
  name: string;
  created_at: string;
  is_current: boolean;
}

export interface GeneratedDocumentRow {
  id: string;
  project_id: string;
  doc_type: string;
  title: string;
  content: string;
  generated_at: string;
  export_count: number;
  prompt_version: string | null;
  model_id: string | null;
}

export interface ShareSettingsRow {
  id: string;
  project_id: string;
  is_shared: boolean;
  share_token: string | null;
  allow_comments: boolean;
  created_at: string;
}

export interface WizardResponseRow {
  id: string;
  version_id: string;
  step_id: string;
  question: string;
  answer: string | null;
  is_complete: boolean;
  follow_up_question: string | null;
  follow_up_answer: string | null;
  follow_up_skipped: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface AssumptionRow {
  id: string;
  response_id: string;
  text: string;
  type: 'technical' | 'business' | 'platform' | 'general';
  confirmed: boolean;
  created_at: string;
}

export async function createProject(
  userId: string,
  title: string,
  description?: string | null
): Promise<Project> {
  const projectId = uuidv4();
  const versionId = uuidv4();

  await query(
    `INSERT INTO projects (id, user_id, title, description, status)
     VALUES ($1, $2, $3, $4, 'draft')`,
    [projectId, userId, title, description || null]
  );

  await query(
    `INSERT INTO versions (id, project_id, version_number, name, is_current)
     VALUES ($1, $2, 'v0.1', 'Initial draft', true)`,
    [versionId, projectId]
  );

  await query(
    `INSERT INTO share_settings (project_id) VALUES ($1)`,
    [projectId]
  );

  return {
    id: projectId,
    title,
    description: description || null,
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    versions: [
      {
        id: versionId,
        versionNumber: 'v0.1',
        name: 'Initial draft',
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
}

export async function getProjectsByUserId(userId: string): Promise<Project[]> {
  const { rows: projects } = await query<ProjectRow>(
    `SELECT * FROM projects WHERE user_id = $1 ORDER BY updated_at DESC`,
    [userId]
  );

  const result: Project[] = [];

  for (const row of projects) {
    const project = await enrichProject(row);
    result.push(project);
  }

  return result;
}

export async function getProjectById(projectId: string): Promise<Project | null> {
  const { rows } = await query<ProjectRow>(
    `SELECT * FROM projects WHERE id = $1`,
    [projectId]
  );

  if (rows.length === 0) return null;

  return enrichProject(rows[0]);
}

async function enrichProject(row: ProjectRow): Promise<Project> {
  const { rows: versions } = await query<VersionRow>(
    `SELECT * FROM versions WHERE project_id = $1 ORDER BY created_at DESC`,
    [row.id]
  );

  const enrichedVersions: Version[] = [];

  for (const v of versions) {
    const { rows: responses } = await query<WizardResponseRow>(
      `SELECT * FROM wizard_responses WHERE version_id = $1`,
      [v.id]
    );

    const { rows: assumptions } = await query<AssumptionRow>(
      `SELECT a.* FROM assumptions a
       JOIN wizard_responses wr ON a.response_id = wr.id
       WHERE wr.version_id = $1`,
      [v.id]
    );

    const responsesMap: Record<string, Response> = {};

    for (const resp of responses) {
      const assumptionsForResponse = assumptions
        .filter((a: AssumptionRow) => a.response_id === resp.id)
        .map((a: AssumptionRow): Assumption => ({
          id: a.id,
          text: a.text,
          type: a.type,
          confirmed: a.confirmed,
        }));
      responsesMap[resp.step_id] = {
        questionId: resp.step_id,
        question: resp.question,
        answer: resp.answer || '',
        assumptions: assumptionsForResponse,
        isComplete: resp.is_complete,
        followUpQuestion: resp.follow_up_question || undefined,
        followUpAnswer: resp.follow_up_answer || undefined,
        followUpSkipped: resp.follow_up_skipped || undefined,
      };
    }

    enrichedVersions.push({
      id: v.id,
      versionNumber: v.version_number,
      name: v.name,
      createdAt: v.created_at,
      isCurrent: v.is_current,
      responses: responsesMap,
    });
  }

  const { rows: docs } = await query<GeneratedDocumentRow>(
    `SELECT * FROM generated_documents WHERE project_id = $1 ORDER BY generated_at DESC`,
    [row.id]
  );

  const { rows: shareRow } = await query<ShareSettingsRow>(
    `SELECT * FROM share_settings WHERE project_id = $1`,
    [row.id]
  );

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status as Project['status'],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    versions: enrichedVersions,
    generatedDocuments: docs.map((d: GeneratedDocumentRow): GeneratedDocument => ({
      id: d.id,
      type: d.doc_type as GeneratedDocument['type'],
      title: d.title,
      content: d.content,
      generatedAt: d.generated_at,
      exportCount: d.export_count,
    })),
    shareSettings: shareRow[0]
      ? {
          isShared: shareRow[0].is_shared,
          shareToken: shareRow[0].share_token,
          allowComments: shareRow[0].allow_comments,
        }
      : { isShared: false, shareToken: null, allowComments: false },
  };
}

export async function updateProject(
  projectId: string,
  fields: { title?: string; description?: string }
): Promise<void> {
  const updates: string[] = [];
  const values: unknown[] = [];
  let paramCount = 1;

  if (fields.title !== undefined) {
    updates.push(`title = $${paramCount++}`);
    values.push(fields.title);
  }
  if (fields.description !== undefined) {
    updates.push(`description = $${paramCount++}`);
    values.push(fields.description);
  }

  if (updates.length === 0) return;

  values.push(projectId);
  await query(
    `UPDATE projects SET ${updates.join(', ')} WHERE id = $${paramCount}`,
    values
  );
}

export async function deleteProject(projectId: string): Promise<void> {
  await query(`DELETE FROM projects WHERE id = $1`, [projectId]);
}

export async function updateProjectStatus(
  projectId: string,
  status: Project['status']
): Promise<void> {
  await query(
    `UPDATE projects SET status = $1 WHERE id = $2`,
    [status, projectId]
  );
}

export async function setVersionCurrent(
  projectId: string,
  versionId: string
): Promise<void> {
  await query(
    `UPDATE versions SET is_current = false WHERE project_id = $1`,
    [projectId]
  );
  await query(
    `UPDATE versions SET is_current = true WHERE id = $1`,
    [versionId]
  );
}

export async function incrementExportCount(
  projectId: string,
  docId: string
): Promise<void> {
  await query(
    `UPDATE generated_documents SET export_count = export_count + 1 WHERE id = $1 AND project_id = $2`,
    [docId, projectId]
  );
}

export async function generateShareToken(projectId: string): Promise<string> {
  const token = Math.random().toString(36).substring(2, 15);
  await query(
    `UPDATE share_settings SET is_shared = true, share_token = $1 WHERE project_id = $2`,
    [token, projectId]
  );
  return token;
}