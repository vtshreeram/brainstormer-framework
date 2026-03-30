import { query } from '../db';
import { v4 as uuidv4 } from 'uuid';

export type FeedbackEventType =
  | 'rating'
  | 'edit'
  | 'copy'
  | 'export'
  | 'skip'
  | 'section_feedback';

export interface CreateFeedbackEventParams {
  projectId?: string;
  docId?: string;
  eventType: FeedbackEventType;
  payload?: Record<string, unknown>;
  userId?: string;
}

export async function createFeedbackEvent(
  params: CreateFeedbackEventParams
): Promise<string> {
  const { projectId, docId, eventType, payload, userId } = params;
  const id = uuidv4();

  await query(
    `INSERT INTO feedback_events (id, project_id, doc_id, event_type, payload, user_id)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [id, projectId || null, docId || null, eventType, payload ? JSON.stringify(payload) : null, userId || null]
  );

  return id;
}

export async function getFeedbackEventsByProject(
  projectId: string,
  limit = 100
) {
  const { rows } = await query(
    `SELECT * FROM feedback_events
     WHERE project_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [projectId, limit]
  );
  return rows;
}

export async function getFeedbackEventsByDoc(docId: string, limit = 100) {
  const { rows } = await query(
    `SELECT * FROM feedback_events
     WHERE doc_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [docId, limit]
  );
  return rows;
}

export async function getEventCountsByType(projectId: string) {
  const { rows } = await query<{ event_type: string; count: string }>(
    `SELECT event_type, COUNT(*) as count
     FROM feedback_events
     WHERE project_id = $1
     GROUP BY event_type`,
    [projectId]
  );
  return rows.map(r => ({ eventType: r.event_type, count: parseInt(r.count) }));
}