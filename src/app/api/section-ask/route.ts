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
    const { section_heading, section_content, question } = body as {
      section_heading?: string;
      section_content?: string;
      question?: string;
    };

    if (!section_heading || !section_content || !question) {
      return NextResponse.json(
        { error: 'section_heading, section_content, and question are required.' },
        { status: 400 }
      );
    }

    const config = await getUserAIConfig(userId);

    const prompt = `You are an expert product consultant reviewing a section of a product document.

SECTION: "${section_heading}"

CONTENT:
${section_content.substring(0, 3000)}

USER QUESTION: "${question.trim()}"

Answer the user's question about this section concisely and specifically. Base your answer on the section content.
If the question asks for something not covered in the section, say so and suggest what could be added.
Output only the answer — no preamble.`;

    const answer = await aiOrchestrator.runRole(
      'writer',
      [{ role: 'user', content: prompt }],
      config,
      { temperature: 0.4 }
    );

    return NextResponse.json({ answer: answer.trim() });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[section-ask] Error:', message);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
