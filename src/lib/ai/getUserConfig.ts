import { query } from '@/lib/db';
import { AIOrchestrator } from './orchestrator';
import { AISessionConfig } from './types';

/**
 * Loads the user's personal AI config from the DB.
 * Falls back to the default config (server-side env keys) if none is saved.
 */
export async function getUserAIConfig(userId: string): Promise<AISessionConfig> {
  try {
    const { rows } = await query(
      `SELECT settings FROM private.user_ai_settings WHERE user_id = $1`,
      [userId]
    );
    if (rows[0] && (rows[0] as { settings: AISessionConfig }).settings) {
      return (rows[0] as { settings: AISessionConfig }).settings;
    }
  } catch {
    // Table may not exist yet in dev; fall through to default
  }
  return AIOrchestrator.getDefaultConfig();
}
