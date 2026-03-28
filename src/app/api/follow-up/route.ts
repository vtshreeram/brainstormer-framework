import { NextRequest, NextResponse } from "next/server";
import { getMockStepData, simulateDelay } from "@/data/mockAiResponses";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { current_step, question, user_answer } = body;

    if (!current_step || !question || !user_answer) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: current_step, question, and user_answer are required.",
        },
        { status: 400 },
      );
    }

    // Mirror the original minimum-length guard — very short answers don't
    // warrant a follow-up question.
    if (user_answer.trim().length < 15) {
      return NextResponse.json({ needs_follow_up: false });
    }

    // Simulate realistic network latency
    await simulateDelay(500, 1000);

    const mockData = getMockStepData(current_step);

    return NextResponse.json({
      needs_follow_up: true,
      follow_up_question: mockData.followUpQuestion,
    });
  } catch (error: any) {
    console.error("[follow-up mock] Error:", error?.message || error);
    // On unexpected errors fall back gracefully — don't block the user
    return NextResponse.json({ needs_follow_up: false });
  }
}
