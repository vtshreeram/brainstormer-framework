import { NextRequest, NextResponse } from 'next/server';
import { getProjectById } from '@/lib/db/projects';
import { FactExtractionResult } from '@/types/facts';
import { aiOrchestrator } from '@/lib/ai/orchestrator';
import { getUserAIConfig } from '@/lib/ai/getUserConfig';

const SYSTEM_PROMPT = `
You are a "Panel of AI Experts" (Product Manager, Solutions Architect, and Security Lead) for the Brainstormer Framework. 
Your goal is to extract a "Product Fact Graph" and provide strategic guidance.

EXPERTISE ROLES:
1. Product Manager (PM): Focuses on value, user personas, and core features.
2. Solutions Architect: Focuses on infrastructure, data flow, and technical feasibility.
3. Security Lead: Focuses on risks, compliance (GDPR/HIPAA), and authentication.

FACT TYPES:
- persona: Who uses the product.
- feature: What the product does.
- constraint: Limitations (budget, tech stack, compliance).
- metric: How success is measured.
- infrastructure: Backend/Frontend technologies.
- risk: Potential blockers or unknowns.

YOUR TASK:
1. Extract FACTS from the user input. Be proactive: if they mention payments, infer 'Stripe' (infrastructure) and 'PCI Compliance' (constraint) as 'ai_inferred'.
2. Identify RELATIONSHIPS (Fact A solves Fact B, or Fact A implies Fact B).
3. Identify LOGIC GAPS: Points where the PM, Architect, or Security Lead would have questions.
4. Suggest 3 DEEP QUESTIONS:
   - One from the PM (Value/Users)
   - One from the Architect (Tech/Scale)
   - One from the Security Lead (Risk/Safety)

OUTPUT FORMAT (Strict JSON):
{
  "facts": [
    { "type": "persona|feature|...", "title": "short title", "description": "...", "properties": {}, "source": "user|ai_inferred", "confidence": 0.9 }
  ],
  "relationships": [
    { "sourceFactTitle": "...", "targetFactTitle": "...", "type": "requires|solves|...", "description": "..." }
  ],
  "logicGaps": ["..."],
  "suggestedQuestions": ["Question from PM...", "Question from Architect...", "Question from Security Lead..."]
}
`;

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId, userInput, currentGraph } = await request.json();

    if (!userInput) {
      return NextResponse.json({ error: 'userInput is required' }, { status: 400 });
    }

    if (projectId) {
      const project = await getProjectById(projectId);
      if (!project || project.userId !== userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const userPrompt = `
    CURRENT GRAPH STATE: ${JSON.stringify(currentGraph || {})}
    NEW USER INPUT: "${userInput}"

    Analyze the input, update the graph, identify logic gaps, and suggest 2-3 deep-thinking follow-up questions.
    `;

    const config = await getUserAIConfig(userId);

    const responseContent = await aiOrchestrator.runRole(
      'synthesizer',
      [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      config,
      { responseFormat: 'json', temperature: 0.2 }
    );

    const result = JSON.parse(responseContent || '{}') as FactExtractionResult;

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[facts/extract] Error:', message);
    return NextResponse.json({ error: 'Failed to extract facts' }, { status: 500 });
  }
}
