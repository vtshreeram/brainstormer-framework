import { NextRequest, NextResponse } from 'next/server';
import { aiOrchestrator } from '@/lib/ai/orchestrator';
import { getUserAIConfig } from '@/lib/ai/getUserConfig';
import { AiSuggestionsResult } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { prd_content, user_metrics, doc_type } = body as {
      prd_content?: string;
      user_metrics?: string;
      doc_type?: string;
    };

    if (!prd_content) {
      return NextResponse.json(
        { error: 'prd_content is required.' },
        { status: 400 }
      );
    }

    const config = await getUserAIConfig(userId);

    const docLabel = doc_type || 'product document';

    const prompt = `You are a senior product strategist reviewing a ${docLabel}.

DOCUMENT CONTENT:
${prd_content.substring(0, 6000)}

${user_metrics ? `CURRENT METRICS DEFINED BY USER:\n${user_metrics}\n` : ''}

Analyze this document and provide:
1. 3-5 specific, measurable success metrics the team should track (if not already defined, or improvements to existing ones)
2. 4-6 actionable product suggestions — concrete improvements, missing features, or strategic recommendations

Each suggestion must be specific to this product, not generic advice.

Respond in JSON:
{
  "metrics": ["metric 1", "metric 2", "metric 3"],
  "suggestions": [
    {
      "title": "Short title",
      "description": "Specific, actionable description (2-3 sentences)",
      "impact": "high | medium | low",
      "effort": "high | medium | low",
      "category": "feature | ux | growth | technical | monetization"
    }
  ]
}`;

    const response = await aiOrchestrator.runRole(
      'pm',
      [{ role: 'user', content: prompt }],
      config,
      { responseFormat: 'json', temperature: 0.5 }
    );

    const result = JSON.parse(response || '{}') as AiSuggestionsResult;

    // Ensure shape matches the expected type
    return NextResponse.json({
      metrics: Array.isArray(result.metrics) ? result.metrics : [],
      suggestions: Array.isArray(result.suggestions) ? result.suggestions : [],
    } satisfies AiSuggestionsResult);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[ai-suggestions] Error:', message);
    return NextResponse.json(
      { error: 'Failed to generate suggestions. Please try again.' },
      { status: 500 }
    );
  }
}
