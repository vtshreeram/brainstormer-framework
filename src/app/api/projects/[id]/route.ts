import { NextRequest, NextResponse } from 'next/server';
import {
  getProjectById,
  updateProject,
  deleteProject,
  updateProjectStatus,
  setVersionCurrent,
} from '@/lib/db/projects';
import { Project } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const project = await getProjectById(id);

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (project.userId && project.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ project });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[project GET] Error:', message);
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    
    // Check ownership first
    const project = await getProjectById(id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    if (project.userId && project.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'updateDetails': {
        const { title, description } = data;
        if (title !== undefined && title.trim().length === 0) {
          return NextResponse.json({ error: 'Title cannot be empty' }, { status: 400 });
        }
        await updateProject(id, {
          title: title?.trim(),
          description: description?.trim(),
        });
        const updatedProject = await getProjectById(id);
        return NextResponse.json({ project: updatedProject });
      }

      case 'updateStatus': {
        const { status } = data as { status: Project['status'] };
        const validStatuses: Project['status'][] = ['draft', 'in_progress', 'discovery_complete', 'documents_generated'];
        if (!validStatuses.includes(status)) {
          return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }
        await updateProjectStatus(id, status);
        const updatedProject = await getProjectById(id);
        return NextResponse.json({ project: updatedProject });
      }

      case 'restoreVersion': {
        const { versionId } = data as { versionId: string };
        if (!versionId) {
          return NextResponse.json({ error: 'versionId is required' }, { status: 400 });
        }
        await setVersionCurrent(id, versionId);
        const updatedProject = await getProjectById(id);
        return NextResponse.json({ project: updatedProject });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[project PATCH] Error:', message);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check ownership first
    const project = await getProjectById(id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    if (project.userId && project.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await deleteProject(id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[project DELETE] Error:', message);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}