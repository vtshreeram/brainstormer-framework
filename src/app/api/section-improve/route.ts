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

    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert technical writer. Output ONLY the improved section in Markdown format.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.4,
      max_tokens: 2048,
    });

    const improved_content = completion.choices[0]?.message?.content || section_content;

    return NextResponse.json({ improved_content });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[section-improve] Error:', message);

    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        { error: `OpenAI API error: ${error.message}` },
        { status: error.status || 500 },
      );
    }

    return NextResponse.json(
      { error: 'Failed to improve section. Please try again.' },
      { status: 500 },
    );
  }
}