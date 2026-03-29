import { NextRequest, NextResponse } from 'next/server';
import { createProject, getProjectsByUserId } from '@/lib/db/projects';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projects = await getProjectsByUserId(userId);
    return NextResponse.json({ projects });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[projects GET] Error:', message);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description } = body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const project = await createProject(userId, title.trim(), description?.trim());
    return NextResponse.json({ project }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[projects POST] Error:', message);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}