import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

function getOpenAIClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export async function POST(request: NextRequest) {
  try {
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

    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert technical writer. Output ONLY the regenerated section in Markdown format with the same heading. Make it structurally different from the input.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.6,
      max_tokens: 2048,
    });

    const regenerated_content = completion.choices[0]?.message?.content || section_content;

    return NextResponse.json({ regenerated_content });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[section-regenerate] Error:', message);

    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        { error: `OpenAI API error: ${error.message}` },
        { status: error.status || 500 },
      );
    }

    return NextResponse.json(
      { error: 'Failed to regenerate section. Please try again.' },
      { status: 500 },
    );
  }
}