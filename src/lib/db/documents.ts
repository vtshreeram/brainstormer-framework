import { query } from '../db';
import { GeneratedDocument, DocumentType } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export interface CreateDocumentParams {
  projectId: string;
  docType: DocumentType;
  title: string;
  content: string;
  promptVersion?: string;
  modelId?: string;
}

export async function createGeneratedDocument(
  params: CreateDocumentParams
): Promise<GeneratedDocument> {
  const { projectId, docType, title, content, promptVersion, modelId } = params;
  const id = uuidv4();

  await query(
    `INSERT INTO generated_documents (id, project_id, doc_type, title, content, prompt_version, model_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [id, projectId, docType, title, content, promptVersion || null, modelId || null]
  );

  return {
    id,
    type: docType,
    title,
    content,
    generatedAt: new Date().toISOString(),
    exportCount: 0,
  };
}

export async function updateDocumentContent(
  docId: string,
  content: string
): Promise<void> {
  await query(
    `UPDATE generated_documents SET content = $1 WHERE id = $2`,
    [content, docId]
  );
}

export async function incrementExportCount(docId: string): Promise<void> {
  await query(
    `UPDATE generated_documents SET export_count = export_count + 1 WHERE id = $1`,
    [docId]
  );
}

export async function getDocumentsByProjectId(
  projectId: string
): Promise<GeneratedDocument[]> {
  const { rows } = await query<{
    id: string;
    doc_type: string;
    title: string;
    content: string;
    generated_at: string;
    export_count: number;
  }>(`SELECT * FROM generated_documents WHERE project_id = $1`, [projectId]);

  return rows.map(r => ({
    id: r.id,
    type: r.doc_type as DocumentType,
    title: r.title,
    content: r.content,
    generatedAt: r.generated_at,
    exportCount: r.export_count,
  }));
}

export async function deleteDocument(docId: string): Promise<void> {
  await query(`DELETE FROM generated_documents WHERE id = $1`, [docId]);
}