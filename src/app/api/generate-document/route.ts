import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { buildPrompt, DOCUMENT_TITLES } from '@/lib/prompts';
import { DocumentType, Response } from '@/types';
import { getProjectById } from '@/lib/db/projects';

const MODEL = process.env.OPENAI_MODEL || 'gpt-4o';

export interface GenerateDocumentRequest {
  projectId: string;
  docType: DocumentType;
  projectTitle: string;
  responses: Record<string, Response>;
  promptVersion?: string;
}

function getOpenAIClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: GenerateDocumentRequest = await request.json();
    const { projectId, docType, projectTitle, responses, promptVersion } = body;

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key is missing. Document generation is currently disabled.' },
        { status: 503 }
      );
    }

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

    const prompt = buildPrompt(docType, {
      projectTitle,
      responses,
    });

    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: 'You are an expert technical writer. Output ONLY the document in Markdown format, with no preamble or explanation.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 4096,
    });

    const content = completion.choices[0]?.message?.content || '';

    if (!content || content.trim().length < 50) {
      return NextResponse.json(
        { error: 'Generated content was too short or empty' },
        { status: 500 }
      );
    }

    const title = DOCUMENT_TITLES[docType];

    return NextResponse.json({
      id: `doc_${Date.now()}`,
      type: docType,
      title,
      content,
      generatedAt: new Date().toISOString(),
      exportCount: 0,
      modelId: MODEL,
      promptVersion: promptVersion || 'v1',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[generate-document] Error:', message);

    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        { error: `OpenAI API error: ${error.message}` },
        { status: error.status || 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate document. Please try again.' },
      { status: 500 }
    );
  }
}