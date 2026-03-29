import { NextRequest, NextResponse } from 'next/server';
import { saveWizardResponse, saveFollowUp, getResponseByStepId } from '@/lib/db/responses';
import { getProjectById } from '@/lib/db/projects';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const body = await request.json();
    const { action, stepId, question, answer, isComplete, followUpData } = body;

    const project = await getProjectById(projectId);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const currentVersion = project.versions.find(v => v.isCurrent);
    if (!currentVersion) {
      return NextResponse.json({ error: 'No current version found' }, { status: 400 });
    }

    if (action === 'saveResponse') {
      if (!stepId || !question) {
        return NextResponse.json({ error: 'stepId and question are required' }, { status: 400 });
      }

      await saveWizardResponse({
        versionId: currentVersion.id,
        stepId,
        question,
        answer: answer || '',
        isComplete: isComplete || false,
      });

      return NextResponse.json({ success: true });
    }

    if (action === 'saveFollowUp') {
      if (!stepId) {
        return NextResponse.json({ error: 'stepId is required' }, { status: 400 });
      }

      await saveFollowUp(currentVersion.id, stepId, followUpData || {});
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[responses POST] Error:', message);
    return NextResponse.json({ error: 'Failed to save response' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const { searchParams } = new URL(request.url);
    const stepId = searchParams.get('stepId');

    const project = await getProjectById(projectId);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const currentVersion = project.versions.find(v => v.isCurrent);
    if (!currentVersion) {
      return NextResponse.json({ error: 'No current version found' }, { status: 400 });
    }

    if (stepId) {
      const response = await getResponseByStepId(currentVersion.id, stepId);
      return NextResponse.json({ response });
    }

    return NextResponse.json({ responses: currentVersion.responses });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[responses GET] Error:', message);
    return NextResponse.json({ error: 'Failed to fetch responses' }, { status: 500 });
  }
}