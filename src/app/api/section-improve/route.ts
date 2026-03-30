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
    const { section_heading, section_content, instruction } = body as {
      section_heading?: string;
      section_content?: string;
      instruction?: string | null;
    };

    if (!section_heading || !section_content) {
      return NextResponse.json(
        { error: 'section_heading and section_content are required.' },
        { status: 400 },
      );
    }

    const improvementInstruction = instruction
      ? `User requested improvement: "${instruction}"`
      : 'Improve clarity, structure, and completeness.';

    const prompt = `You are an expert technical writer. Improve the following section of a product document.

SECTION HEADING: ${section_heading}

ORIGINAL CONTENT:
${section_content}

INSTRUCTION: ${improvementInstruction}

Output ONLY the improved section content in Markdown format. Keep the same heading. Do not add preamble or explanation.`;

    const config = await getUserAIConfig(userId);

    const improved_content = await aiOrchestrator.runRole(
      'writer',
      [
        {
          role: 'system',
          content: 'You are an expert technical writer. Output ONLY the improved section in Markdown format.',
        },
        { role: 'user', content: prompt },
      ],
      config,
      { temperature: 0.4, maxTokens: 2048 }
    );

    return NextResponse.json({ improved_content: improved_content || section_content });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[section-improve] Error:', message);
    return NextResponse.json(
      { error: 'Failed to improve section. Please try again.' },
      { status: 500 },
    );
  }
}
