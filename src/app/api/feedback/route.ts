import { NextRequest, NextResponse } from 'next/server';
import { createFeedbackEvent, FeedbackEventType } from '@/lib/db/feedback';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, docId, eventType, payload, userId } = body;

    if (!eventType) {
      return NextResponse.json({ error: 'eventType is required' }, { status: 400 });
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