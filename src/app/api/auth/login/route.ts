import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { createSession, setSessionCookie, hashPassword } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const { rows } = await query<{
      id: string;
      email: string;
      name: string;
    }>(
      `SELECT id, email, name FROM neon_auth.user WHERE LOWER(email) = LOWER($1)`,
      [email]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: `User with email ${email} not found` },
        { status: 401 }
      );
    }

    const user = rows[0];
    const hashedPassword = await hashPassword(password);

    const { rows: accountRows } = await query<{ password: string }>(
      `SELECT password FROM neon_auth.account WHERE "userId" = $1 AND "providerId" = 'email' LIMIT 1`,
      [user.id]
    );

    if (accountRows.length === 0) {
      return NextResponse.json(
        { error: 'Account not found for user' },
        { status: 401 }
      );
    }

    if (accountRows[0].password !== hashedPassword) {
      return NextResponse.json(
        { error: `Password mismatch. Expected: ${accountRows[0].password.substring(0, 8)}..., Got: ${hashedPassword.substring(0, 8)}...` },
        { status: 401 }
      );
    }

    const sessionId = await createSession(user.id);
    await setSessionCookie(sessionId);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[auth/login] Error:', message);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}