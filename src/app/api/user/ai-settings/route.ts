import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { AISessionConfig } from '@/lib/ai/types';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { rows } = await query(
      `SELECT settings FROM private.user_ai_settings WHERE user_id = $1`,
      [userId]
    );

    return NextResponse.json({ settings: rows[0]?.settings || null });
  } catch (error) {
    console.error('[ai-settings GET] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { settings } = await request.json();

    await query(
      `INSERT INTO private.user_ai_settings (user_id, settings, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (user_id) DO UPDATE SET settings = $2, updated_at = NOW()`,
      [userId, settings]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[ai-settings POST] Error:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
