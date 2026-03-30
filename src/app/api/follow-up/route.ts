import { NextRequest, NextResponse } from 'next/server';
import { aiOrchestrator } from '@/lib/ai/orchestrator';
import { getUserAIConfig } from '@/lib/ai/getUserConfig';

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { current_step, question, user_answer } = body;

    if (!current_step || !question || !user_answer) {
      return NextResponse.json(
        { error: 'Missing required fields: current_step, question, and user_answer are required.' },
        { status: 400 }
      );
    }

    // Very short answers don't warrant a follow-up question
    if (user_answer.trim().length < 15) {
      return NextResponse.json({ needs_follow_up: false });
    }

    const config = await getUserAIConfig(userId);

    const prompt = `You are a product discovery coach helping a founder clarify their app idea.

The user is answering the following question in a product discovery wizard:
STEP: "${current_step}"
QUESTION: "${question}"
USER'S ANSWER: "${user_answer}"

Decide if a single, focused follow-up question would meaningfully deepen this answer.
Only ask a follow-up if the answer is vague, missing a key dimension, or could be significantly improved with one more question.

Respond in JSON:
{
  "needs_follow_up": true | false,
  "follow_up_question": "..." // only if needs_follow_up is true
}`;

    const response = await aiOrchestrator.runRole(
      'pm',
      [{ role: 'user', content: prompt }],
      config,
      { responseFormat: 'json', temperature: 0.4 }
    );

    const parsed = JSON.parse(response || '{}');

    return NextResponse.json({
      needs_follow_up: parsed.needs_follow_up ?? false,
      follow_up_question: parsed.follow_up_question ?? null,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[follow-up] Error:', message);
    // Fail gracefully — don't block the user
    return NextResponse.json({ needs_follow_up: false });
  }
}
