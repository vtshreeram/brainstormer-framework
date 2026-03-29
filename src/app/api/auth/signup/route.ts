import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { createSession, setSessionCookie, hashPassword } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    const { rows: existingUsers } = await query<{ id: string }>(
      `SELECT id FROM neon_auth.user WHERE email = $1`,
      [email]
    );

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    const userId = uuidv4();
    const hashedPassword = await hashPassword(password);
    const now = new Date().toISOString();

    await query(
      `INSERT INTO neon_auth.user (id, name, email, "emailVerified", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, false, $4, $5)`,
      [userId, name, email, now, now]
    );

    await query(
      `INSERT INTO neon_auth.account (id, "userId", "providerId", "accountId", password, "createdAt", "updatedAt")
       VALUES ($1, $2, 'email', $3, $4, $5, $6)`,
      [uuidv4(), userId, email, hashedPassword, now, now]
    );

    const sessionId = await createSession(userId);
    await setSessionCookie(sessionId);

    return NextResponse.json({
      user: {
        id: userId,
        email,
        name,
      },
    }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[auth/signup] Error:', message);
    return NextResponse.json(
      { error: 'Signup failed' },
      { status: 500 }
    );
  }
}