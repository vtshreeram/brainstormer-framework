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
    const { section_heading, section_content, attempt } = body as {
      section_heading?: string;
      section_content?: string;
      attempt?: number;
    };

    if (!section_heading || !section_content) {
      return NextResponse.json(
        { error: 'section_heading and section_content are required.' },
        { status: 400 },
      );
    }

    const prompt = `You are an expert technical writer. Regenerate the following section of a product document with a fresh perspective.

SECTION HEADING: ${section_heading}

ORIGINAL CONTENT:
${section_content}

INSTRUCTION: Regenerate this section with a different structure, framing, and examples while maintaining the same key information and heading. Make it distinctly different from the original in how it presents information.`;

    const config = await getUserAIConfig(userId);

    // Use attempt number to vary temperature slightly for distinct results
    const temperature = Math.min(0.9, 0.6 + ((attempt || 1) - 1) * 0.1);

    const regenerated_content = await aiOrchestrator.runRole(
      'writer',
      [
        {
          role: 'system',
          content: 'You are an expert technical writer. Output ONLY the regenerated section in Markdown format with the same heading. Make it structurally different from the input.',
        },
        { role: 'user', content: prompt },
      ],
      config,
      { temperature, maxTokens: 2048 }
    );

    return NextResponse.json({ regenerated_content: regenerated_content || section_content });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[section-regenerate] Error:', message);
    return NextResponse.json(
      { error: 'Failed to regenerate section. Please try again.' },
      { status: 500 },
    );
  }
}
