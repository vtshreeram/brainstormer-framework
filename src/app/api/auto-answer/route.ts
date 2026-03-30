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
    const { question, current_step, follow_up_question } = body;

    if (!question || !current_step) {
      return NextResponse.json(
        { error: 'Missing required fields: question and current_step are required.' },
        { status: 400 }
      );
    }

    const config = await getUserAIConfig(userId);

    const targetQuestion = follow_up_question || question;
    const context = follow_up_question
      ? `The user is answering a follow-up question in the "${current_step}" step of a product discovery wizard.
Original question: "${question}"
Follow-up question: "${follow_up_question}"`
      : `The user is answering the "${current_step}" step of a product discovery wizard.
Question: "${question}"`;

    const prompt = `${context}

Generate a realistic, specific, and thoughtful example answer that a real founder might give.
The answer should be 2-4 sentences, concrete, and directly address the question.
Do not add preamble or explanation — output only the answer text.`;

    const answer = await aiOrchestrator.runRole(
      'pm',
      [{ role: 'user', content: prompt }],
      config,
      { temperature: 0.7 }
    );

    return NextResponse.json({ answer: answer.trim() });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[auto-answer] Error:', message);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
