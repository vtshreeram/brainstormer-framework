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
    const { current_step, original_question, original_answer, follow_up_question } = body;

    if (!current_step || !original_question || !original_answer || !follow_up_question) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: current_step, original_question, original_answer, and follow_up_question are required.',
        },
        { status: 400 }
      );
    }

    const config = await getUserAIConfig(userId);

    const prompt = `You are a product discovery coach. A founder is working through the "${current_step}" step of a product discovery wizard.

They answered the main question, and you asked a follow-up. Now generate a thoughtful answer to the follow-up that builds on their original answer.

ORIGINAL QUESTION: "${original_question}"
ORIGINAL ANSWER: "${original_answer}"
FOLLOW-UP QUESTION: "${follow_up_question}"

Generate a realistic, specific answer to the follow-up question that is consistent with and expands on the original answer.
Output only the answer text — no preamble or explanation.`;

    const answer = await aiOrchestrator.runRole(
      'pm',
      [{ role: 'user', content: prompt }],
      config,
      { temperature: 0.6 }
    );

    return NextResponse.json({ answer: answer.trim() });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[ai-answer] Error:', message);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
