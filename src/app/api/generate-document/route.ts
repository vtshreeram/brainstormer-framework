import { NextRequest, NextResponse } from 'next/server';
import { buildPrompt, DOCUMENT_TITLES } from '@/lib/prompts';
import { DocumentType, Response } from '@/types';
import { getProjectById } from '@/lib/db/projects';
import { aiOrchestrator } from '@/lib/ai/orchestrator';
import { getUserAIConfig } from '@/lib/ai/getUserConfig';

export interface GenerateDocumentRequest {
  projectId: string;
  docType: DocumentType;
  projectTitle: string;
  responses: Record<string, Response>;
  promptVersion?: string;
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: GenerateDocumentRequest = await request.json();
    const { projectId, docType, projectTitle, responses, promptVersion } = body;

    if (!projectId || !docType || !projectTitle) {
      return NextResponse.json(
        { error: 'Missing required fields: projectId, docType, projectTitle' },
        { status: 400 }
      );
    }

    // Check ownership
    const project = await getProjectById(projectId);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    if (project.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const prompt = buildPrompt(docType, { projectTitle, responses });
    const config = await getUserAIConfig(userId);

    const content = await aiOrchestrator.runRole(
      'writer',
      [
        {
          role: 'system',
          content: 'You are an expert technical writer. Output ONLY the document in Markdown format, with no preamble or explanation.',
        },
        { role: 'user', content: prompt },
      ],
      config,
      { temperature: 0.3, maxTokens: 4096 }
    );

    if (!content || content.trim().length < 50) {
      return NextResponse.json(
        { error: 'Generated content was too short or empty' },
        { status: 500 }
      );
    }

    const title = DOCUMENT_TITLES[docType];
    const writerConfig = config.roles['writer'];

    return NextResponse.json({
      id: `doc_${Date.now()}`,
      type: docType,
      title,
      content,
      generatedAt: new Date().toISOString(),
      exportCount: 0,
      modelId: writerConfig?.model || 'gemini-1.5-pro',
      promptVersion: promptVersion || 'v1',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[generate-document] Error:', message);
    return NextResponse.json(
      { error: 'Failed to generate document. Please try again.' },
      { status: 500 }
    );
  }
}
