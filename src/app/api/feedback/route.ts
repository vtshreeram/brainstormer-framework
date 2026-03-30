import { NextRequest, NextResponse } from 'next/server';
import { createFeedbackEvent, FeedbackEventType } from '@/lib/db/feedback';
import { getProjectById } from '@/lib/db/projects';

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { projectId, docId, eventType, payload } = body;

    if (!eventType) {
      return NextResponse.json({ error: 'eventType is required' }, { status: 400 });
    }

    if (projectId) {
      const project = await getProjectById(projectId);
      if (!project) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }
      if (project.userId !== userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const validEventTypes: FeedbackEventType[] = [
      'rating',
      'edit',
      'copy',
      'export',
      'skip',
      'section_feedback',
    ];

    if (!validEventTypes.includes(eventType)) {
      return NextResponse.json({ error: 'Invalid eventType' }, { status: 400 });
    }

    const id = await createFeedbackEvent({
      projectId,
      docId,
      eventType,
      payload,
      userId,
    });

    return NextResponse.json({ id }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[feedback POST] Error:', message);
    return NextResponse.json({ error: 'Failed to create feedback event' }, { status: 500 });
  }
}