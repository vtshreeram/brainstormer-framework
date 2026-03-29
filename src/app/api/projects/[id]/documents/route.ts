import { NextRequest, NextResponse } from 'next/server';
import {
  getDocumentsByProjectId,
  createGeneratedDocument,
  updateDocumentContent,
  incrementExportCount,
} from '@/lib/db/documents';
import { getProjectById, updateProjectStatus } from '@/lib/db/projects';
import { DocumentType } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const documents = await getDocumentsByProjectId(projectId);
    return NextResponse.json({ documents });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[documents GET] Error:', message);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const body = await request.json();
    const { action, docType, title, content, promptVersion, modelId } = body;

    const project = await getProjectById(projectId);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (action === 'create') {
      if (!docType || !title || !content) {
        return NextResponse.json(
          { error: 'docType, title, and content are required' },
          { status: 400 }
        );
      }

      const doc = await createGeneratedDocument({
        projectId,
        docType: docType as DocumentType,
        title,
        content,
        promptVersion,
        modelId,
      });

      await updateProjectStatus(projectId, 'documents_generated');

      return NextResponse.json({ document: doc }, { status: 201 });
    }

    if (action === 'incrementExport') {
      if (!docType) {
        return NextResponse.json({ error: 'docType is required' }, { status: 400 });
      }

      const documents = await getDocumentsByProjectId(projectId);
      const doc = documents.find(d => d.type === docType);

      if (doc) {
        await incrementExportCount(doc.id);
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[documents POST] Error:', message);
    return NextResponse.json({ error: 'Failed to create document' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const body = await request.json();
    const { docId, content } = body;

    if (!docId || content === undefined) {
      return NextResponse.json({ error: 'docId and content are required' }, { status: 400 });
    }

    await updateDocumentContent(docId, content);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[documents PATCH] Error:', message);
    return NextResponse.json({ error: 'Failed to update document' }, { status: 500 });
  }
}