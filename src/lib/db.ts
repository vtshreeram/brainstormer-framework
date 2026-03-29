import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.NEXT_PUBLIC_DB_HOST || 'ep-blue-art-a1ym0ofn-pooler.ap-southeast-1.aws.neon.tech',
  port: parseInt(process.env.NEXT_PUBLIC_DB_PORT || '5432'),
  user: process.env.NEXT_PUBLIC_DB_USER || 'neondb_owner',
  password: process.env.NEXT_PUBLIC_DB_PASSWORD || 'npg_7EMRCyNBQz4l',
  database: process.env.NEXT_PUBLIC_DB_NAME || 'neondb',
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