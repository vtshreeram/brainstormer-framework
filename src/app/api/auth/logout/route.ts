import { NextRequest, NextResponse } from 'next/server';
import { deleteSession, clearSessionCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('brainstormer_session')?.value;

    if (sessionId) {
      await deleteSession(sessionId);
    }

    await clearSessionCookie();

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[auth/logout] Error:', message);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}