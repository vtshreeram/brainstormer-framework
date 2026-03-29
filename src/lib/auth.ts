import { cookies } from 'next/headers';
import { query } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

const SESSION_COOKIE_NAME = 'brainstormer_session';
const SESSION_DURATION_DAYS = 7;

export interface SessionUser {
  id: string;
  email: string;
  name: string;
}

export interface Session {
  id: string;
  userId: string;
  expiresAt: Date;
  user: SessionUser;
}

export async function createSession(userId: string): Promise<string> {
  const sessionId = uuidv4();
  const token = uuidv4(); // Session often requires a token in this schema
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);
  const now = new Date().toISOString();

  await query(
    `INSERT INTO neon_auth.session (id, "userId", "expiresAt", token, "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [sessionId, userId, expiresAt.toISOString(), token, now, now]
  );

  return sessionId;
}

export async function getSession(sessionId: string): Promise<Session | null> {
  const { rows } = await query<{
    id: string;
    userId: string;
    expiresAt: string;
    email: string;
    name: string;
  }>(
    `SELECT s.id, s."userId", s."expiresAt", u.email, u.name
     FROM neon_auth.session s
     JOIN neon_auth.user u ON s."userId" = u.id
     WHERE s.id = $1 AND s."expiresAt" > NOW()`,
    [sessionId]
  );

  if (rows.length === 0) return null;

  const row = rows[0];
  return {
    id: row.id,
    userId: row.userId,
    expiresAt: new Date(row.expiresAt),
    user: {
      id: row.userId,
      email: row.email,
      name: row.name,
    },
  };
}

export async function deleteSession(sessionId: string): Promise<void> {
  await query(`DELETE FROM neon_auth.session WHERE id = $1`, [sessionId]);
}

export async function setSessionCookie(sessionId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION_DAYS * 24 * 60 * 60,
    path: '/',
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionId) return null;

  const session = await getSession(sessionId);
  return session?.user || null;
}

export async function requireAuth(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}