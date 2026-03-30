import { Pool } from 'pg';

if (!process.env.NEXT_PUBLIC_DB_HOST) throw new Error('NEXT_PUBLIC_DB_HOST is not set');
if (!process.env.NEXT_PUBLIC_DB_USER) throw new Error('NEXT_PUBLIC_DB_USER is not set');
if (!process.env.NEXT_PUBLIC_DB_PASSWORD) throw new Error('NEXT_PUBLIC_DB_PASSWORD is not set');
if (!process.env.NEXT_PUBLIC_DB_NAME) throw new Error('NEXT_PUBLIC_DB_NAME is not set');

const pool = new Pool({
  host: process.env.NEXT_PUBLIC_DB_HOST,
  port: parseInt(process.env.NEXT_PUBLIC_DB_PORT || '5432'),
  user: process.env.NEXT_PUBLIC_DB_USER,
  password: process.env.NEXT_PUBLIC_DB_PASSWORD,
  database: process.env.NEXT_PUBLIC_DB_NAME,
  ssl: { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
});

export async function query<T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<{ rows: T[]; rowCount: number }> {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    if (duration > 1000) {
      console.warn(`Slow query (${duration}ms):`, text.substring(0, 100));
    }
    return { rows: result.rows as T[], rowCount: result.rowCount ?? 0 };
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

export async function getClient() {
  const client = await pool.connect();
  return client;
}

export type DatabaseClient = ReturnType<typeof pool.connect> extends Promise<infer T> ? T : never;