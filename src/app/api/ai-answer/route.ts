import { NextRequest, NextResponse } from "next/server";
import { getMockStepData, simulateDelay } from "@/data/mockAiResponses";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      current_step,
      original_question,
      original_answer,
      follow_up_question,
    } = body;

    if (
      !current_step ||
      !original_question ||
      !original_answer ||
      !follow_up_question
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: current_step, original_question, original_answer, and follow_up_question are required.",
        },
        { status: 400 },
      );
    }

    // Simulate realistic network latency
    await simulateDelay(400, 850);

    const mockData = getMockStepData(current_step);

    return NextResponse.json({ answer: mockData.aiAnswer });
  } catch (error: any) {
    console.error("[ai-answer mock] Error:", error?.message || error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 },
    );
  }
}
