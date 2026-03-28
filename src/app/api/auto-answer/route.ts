import { NextRequest, NextResponse } from "next/server";
import { getMockStepData, simulateDelay } from "@/data/mockAiResponses";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, current_step, follow_up_question } = body;

    if (!question || !current_step) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: question and current_step are required.",
        },
        { status: 400 },
      );
    }

    // Simulate realistic network latency
    await simulateDelay(400, 900);

    const mockData = getMockStepData(current_step);

    // If a follow-up question was passed, answer that instead of the main question
    const answer = follow_up_question
      ? mockData.followUpAnswer
      : mockData.mainAnswer;

    return NextResponse.json({ answer });
  } catch (error: any) {
    console.error("[auto-answer mock] Error:", error?.message || error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 },
    );
  }
}
