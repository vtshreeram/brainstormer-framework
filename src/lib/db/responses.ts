import { query } from '../db';
import { Response, Assumption } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export interface SaveResponseParams {
  versionId: string;
  stepId: string;
  question: string;
  answer: string;
  isComplete: boolean;
}

export async function saveWizardResponse(params: SaveResponseParams): Promise<void> {
  const { versionId, stepId, question, answer, isComplete } = params;

  await query(
    `INSERT INTO wizard_responses (id, version_id, step_id, question, answer, is_complete)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (version_id, step_id)
     DO UPDATE SET
       question = EXCLUDED.question,
       answer = EXCLUDED.answer,
       is_complete = EXCLUDED.is_complete`,
    [uuidv4(), versionId, stepId, question, answer, isComplete]
  );
}

export async function saveFollowUp(
  versionId: string,
  stepId: string,
  data: {
    followUpQuestion?: string;
    followUpAnswer?: string;
    followUpSkipped?: boolean;
  }
): Promise<void> {
  const { followUpQuestion, followUpAnswer, followUpSkipped } = data;

  const updates: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (followUpQuestion !== undefined) {
    updates.push(`follow_up_question = $${idx++}`);
    values.push(followUpQuestion);
  }
  if (followUpAnswer !== undefined) {
    updates.push(`follow_up_answer = $${idx++}`);
    values.push(followUpAnswer);
  }
  if (followUpSkipped !== undefined) {
    updates.push(`follow_up_skipped = $${idx++}`);
    values.push(followUpSkipped);
  }

  if (updates.length === 0) return;

  values.push(versionId, stepId);
  await query(
    `UPDATE wizard_responses SET ${updates.join(', ')}
     WHERE version_id = $${idx++} AND step_id = $${idx}`,
    values
  );
}

export async function confirmAssumption(
  responseId: string,
  assumptionId: string
): Promise<void> {
  await query(
    `UPDATE assumptions SET confirmed = true WHERE id = $1 AND response_id = $2`,
    [assumptionId, responseId]
  );
}

export async function addAssumption(
  responseId: string,
  assumption: Omit<Assumption, 'id' | 'createdAt'>
): Promise<string> {
  const id = uuidv4();
  await query(
    `INSERT INTO assumptions (id, response_id, text, type, confirmed)
     VALUES ($1, $2, $3, $4, $5)`,
    [id, responseId, assumption.text, assumption.type, assumption.confirmed]
  );
  return id;
}

export async function getResponseByStepId(
  versionId: string,
  stepId: string
): Promise<{ id: string } | null> {
  const { rows } = await query<{ id: string }>(
    `SELECT id FROM wizard_responses WHERE version_id = $1 AND step_id = $2`,
    [versionId, stepId]
  );
  return rows[0] || null;
}