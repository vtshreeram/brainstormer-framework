"use client";

import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback,
} from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { wizardSteps } from "@/data/mockData";
import {
  Button,
  TextArea,
  ProgressBar,
  AssumptionList,
  FollowUpQuestion,
  AiAnswerSuggestion,
} from "@/components/ui";

// Minimum answer length (chars) before triggering the follow-up AI call
const FOLLOW_UP_MIN_LENGTH = 20;
// How long to wait after the user stops typing before calling the API (ms)
const FOLLOW_UP_DEBOUNCE_MS = 1500;

export default function WizardPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const {
    projects,
    currentStep,
    responses,
    setCurrentProject,
    setCurrentStep,
    setResponse,
    updateResponse,
    confirmAssumption,
    updateProjectStatus,
    addToast,
    setFollowUpQuestion,
    setFollowUpAnswer,
    skipFollowUp,
    clearFollowUp,
  } = useStore();

  const project = projects.find((p) => p.id === projectId);
  const currentStepData = wizardSteps[currentStep];
  const currentResponse = responses[currentStepData?.id];

  // ─── Local UI state ────────────────────────────────────────────────────────

  /** True while waiting for /api/follow-up to return a follow-up question */
  const [isLoadingFollowUp, setIsLoadingFollowUp] = useState(false);

  /** True while /api/auto-answer is running for a follow-up "Let AI answer" */
  const [isAiAnsweringFollowUp, setIsAiAnsweringFollowUp] = useState(false);

  /**
   * AI suggestion panel for the MAIN step answer.
   * showAiSuggestion — controls panel visibility (stays true during loading too)
   * isLoadingAiSuggestion — true while the API call is in-flight
   * aiSuggestion — the text returned by the API
   */
  const [showAiSuggestion, setShowAiSuggestion] = useState(false);
  const [isLoadingAiSuggestion, setIsLoadingAiSuggestion] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState("");

  // Ref holds the follow-up debounce timer without triggering re-renders
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Project bootstrap ────────────────────────────────────────────────────

  useEffect(() => {
    if (projectId) {
      setCurrentProject(projectId);
    }
  }, [projectId, setCurrentProject]);

  // ─── Reset ALL transient UI state whenever the step changes ──────────────

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setIsLoadingFollowUp(false);
    setIsAiAnsweringFollowUp(false);
    setShowAiSuggestion(false);
    setIsLoadingAiSuggestion(false);
    setAiSuggestion("");
  }, [currentStep]);

  const stepLabels = useMemo(() => wizardSteps.map((s) => s.title), []);

  // ─── Helper: build previous-step answers for AI context ──────────────────

  const buildPreviousAnswers = useCallback(() => {
    const prev: Record<string, { question: string; answer: string }> = {};
    wizardSteps.forEach((step, index) => {
      if (index < currentStep && responses[step.id]?.answer) {
        prev[step.id] = {
          question: step.question,
          answer: responses[step.id].answer,
        };
      }
    });
    return prev;
  }, [currentStep, responses]);

  // ─── Helper: call /api/auto-answer ───────────────────────────────────────
  /**
   * Calls /api/auto-answer with the current step's question.
   * When followUpQuestion is supplied the API will answer ONLY that question.
   * Returns the answer string on success, or null on failure.
   */
  const callAutoAnswer = useCallback(
    async (followUpQuestion?: string): Promise<string | null> => {
      if (!currentStepData) return null;

      try {
        const res = await fetch("/api/auto-answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: currentStepData.question,
            current_step: currentStepData.title,
            previous_answers: buildPreviousAnswers(),
            ...(followUpQuestion
              ? { follow_up_question: followUpQuestion }
              : {}),
          }),
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          addToast({
            type: "error",
            message:
              errorData?.error ??
              "Failed to generate AI answer. Please try again.",
          });
          return null;
        }

        const data = await res.json();

        if (typeof data.answer === "string" && data.answer.trim().length > 0) {
          return data.answer.trim();
        }

        addToast({
          type: "error",
          message:
            data.error ?? "AI returned an empty answer. Please try again.",
        });
        return null;
      } catch (err) {
        console.error("[auto-answer] Network error:", err);
        addToast({
          type: "error",
          message: "Network error. Please check your connection and try again.",
        });
        return null;
      }
    },
    [currentStepData, buildPreviousAnswers, addToast],
  );

  // ─── Follow-up: debounced trigger ─────────────────────────────────────────

  useEffect(() => {
    if (!currentStepData) return;

    const answer = currentResponse?.answer ?? "";

    // Cancel any in-flight debounce
    if (debounceRef.current) clearTimeout(debounceRef.current);

    // Don't trigger when:
    // • answer is too short to be meaningful
    // • a follow-up question is already stored for this step
    // • we're already loading one
    if (
      answer.trim().length < FOLLOW_UP_MIN_LENGTH ||
      currentResponse?.followUpQuestion ||
      isLoadingFollowUp
    ) {
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoadingFollowUp(true);

      try {
        const res = await fetch("/api/follow-up", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            current_step: currentStepData.title,
            question: currentStepData.question,
            user_answer: answer,
            previous_answers: buildPreviousAnswers(),
          }),
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          console.error(
            "[follow-up] API error:",
            errorData?.error ?? res.statusText,
          );
          return;
        }

        const data = await res.json();

        if (
          data.needs_follow_up === true &&
          typeof data.follow_up_question === "string"
        ) {
          setFollowUpQuestion(currentStepData.id, data.follow_up_question);
        }
      } catch (err) {
        console.error("[follow-up] Network error:", err);
      } finally {
        setIsLoadingFollowUp(false);
      }
    }, FOLLOW_UP_DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentResponse?.answer]);

  // ─── Handlers: main answer textarea ──────────────────────────────────────

  const handleAnswerChange = (answer: string) => {
    if (!currentStepData) return;

    if (!currentResponse) {
      // First visit to this step for a brand-new project — initialise the record
      setResponse(currentStepData.id, {
        questionId: currentStepData.id,
        question: currentStepData.question,
        answer,
        assumptions: [],
        isComplete: answer.trim().length > 0,
      });
    } else {
      updateResponse(currentStepData.id, answer);

      // If the user clears their answer below the threshold, remove any
      // pending (not yet answered / skipped) follow-up so it can regenerate.
      if (
        answer.trim().length < FOLLOW_UP_MIN_LENGTH &&
        currentResponse.followUpQuestion &&
        !currentResponse.followUpAnswer &&
        !currentResponse.followUpSkipped
      ) {
        clearFollowUp(currentStepData.id);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        setIsLoadingFollowUp(false);
      }
    }
  };

  const handleAssumptionConfirm = (assumptionId: string) => {
    confirmAssumption(currentStepData.id, assumptionId);
  };

  // ─── Handlers: main-step AI suggestion ───────────────────────────────────

  /** Triggered by the "✨ Let AI Answer" button */
  const handleLetAiAnswer = async () => {
    setShowAiSuggestion(true);
    setIsLoadingAiSuggestion(true);
    setAiSuggestion("");

    const answer = await callAutoAnswer();

    if (answer) {
      setAiSuggestion(answer);
    } else {
      // If the call failed hide the panel so the error toast is the feedback
      setShowAiSuggestion(false);
    }

    setIsLoadingAiSuggestion(false);
  };

  /** "Edit" — puts the suggestion text into the textarea for the user to refine */
  const handleAiSuggestionEdit = (text: string) => {
    handleAnswerChange(text);
    setShowAiSuggestion(false);
    setAiSuggestion("");
  };

  /** "Regenerate" — discards current suggestion and requests a fresh one */
  const handleAiSuggestionRegenerate = async () => {
    setIsLoadingAiSuggestion(true);
    setAiSuggestion("");

    const answer = await callAutoAnswer();

    if (answer) {
      setAiSuggestion(answer);
    } else {
      setShowAiSuggestion(false);
    }

    setIsLoadingAiSuggestion(false);
  };

  /** "Accept" — saves the suggestion as the step's answer, closes the panel */
  const handleAiSuggestionAccept = () => {
    if (aiSuggestion) {
      handleAnswerChange(aiSuggestion);
      addToast({ type: "success", message: "AI answer accepted!" });
    }
    setShowAiSuggestion(false);
    setAiSuggestion("");
  };

  /** [×] — dismisses the panel without changing anything */
  const handleAiSuggestionDismiss = () => {
    setShowAiSuggestion(false);
    setAiSuggestion("");
  };

  // ─── Handlers: follow-up question ────────────────────────────────────────

  const handleFollowUpAnswer = (answer: string) => {
    if (!currentStepData) return;
    setFollowUpAnswer(currentStepData.id, answer);
    addToast({ type: "success", message: "Follow-up answered!" });
  };

  const handleFollowUpSkip = () => {
    if (!currentStepData) return;
    skipFollowUp(currentStepData.id);
  };

  /** "Let AI answer" inside the follow-up card — uses /api/auto-answer with the follow-up question */
  const handleFollowUpAiAnswer = async () => {
    if (!currentStepData || !currentResponse?.followUpQuestion) return;

    setIsAiAnsweringFollowUp(true);

    const answer = await callAutoAnswer(currentResponse.followUpQuestion);

    if (answer) {
      setFollowUpAnswer(currentStepData.id, answer);
      addToast({
        type: "success",
        message: "AI generated a follow-up answer.",
      });
    }

    setIsAiAnsweringFollowUp(false);
  };

  // ─── Handlers: navigation ────────────────────────────────────────────────

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      router.push(`/project/${projectId}`);
    }
  };

  const handleContinue = () => {
    if (currentStep < wizardSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      updateProjectStatus(projectId, "discovery_complete");
      addToast({
        type: "success",
        message: "Discovery complete! Review your responses.",
      });
      router.push(`/project/${projectId}/review`);
    }
  };

  const handleStepClick = (step: number) => {
    if (step <= currentStep) {
      setCurrentStep(step);
    }
  };

  // ─── Guard ────────────────────────────────────────────────────────────────

  if (!project || !currentStepData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading…</p>
      </div>
    );
  }

  const canProceed =
    currentResponse?.isComplete ||
    (currentResponse?.answer?.trim().length ?? 0) > 0;

  const showFollowUpBlock =
    isLoadingFollowUp || !!currentResponse?.followUpQuestion;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ── */}
      <header className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={`/project/${projectId}`}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </Link>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {project.title}
                </h1>
                <p className="text-sm text-gray-500">Discovery Wizard</p>
              </div>
            </div>

            <button
              onClick={() => {
                updateProjectStatus(projectId, "in_progress");
                addToast({ type: "info", message: "Progress saved" });
                router.push(`/project/${projectId}`);
              }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Save & Exit
            </button>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* Progress bar */}
        <div className="mb-8">
          <ProgressBar
            currentStep={currentStep}
            totalSteps={wizardSteps.length}
            stepLabels={stepLabels}
            onStepClick={handleStepClick}
          />
        </div>

        {/* Card */}
        <div className="card p-8">
          {/* Step title + question */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {currentStepData.title}
            </h2>
            <p className="text-lg text-gray-600">{currentStepData.question}</p>
          </div>

          {/* ── Main answer textarea ── */}
          <div className="mb-1">
            <TextArea
              value={currentResponse?.answer || ""}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder={currentStepData.placeholder}
              hint={currentStepData.hint}
              showCount
              maxLength={1000}
            />
          </div>

          {/* ── "Let AI Answer" trigger button ──
               Visible when: no suggestion panel is open and we are not already loading one.
               Positioned flush-right, small and unobtrusive. */}
          {!showAiSuggestion && !isLoadingAiSuggestion && (
            <div className="flex items-center justify-end mt-2 mb-1">
              <button
                type="button"
                onClick={handleLetAiAnswer}
                className="
                  inline-flex items-center gap-1.5
                  text-sm font-medium text-violet-600
                  hover:text-violet-800
                  transition-colors duration-150
                  focus:outline-none focus:underline
                "
              >
                {/* Lightbulb / sparkles icon */}
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.75}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21
                       12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5
                       5 0 117.072 0l-.548.547A3.374 3.374 0 0014
                       18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754
                       -.988-2.386l-.548-.547z"
                  />
                </svg>
                Let AI Answer
              </button>
            </div>
          )}

          {/* ── AI suggestion card (loading or suggestion shown) ── */}
          {(showAiSuggestion || isLoadingAiSuggestion) && (
            <AiAnswerSuggestion
              suggestion={aiSuggestion}
              isLoading={isLoadingAiSuggestion}
              onEdit={handleAiSuggestionEdit}
              onRegenerate={handleAiSuggestionRegenerate}
              onAccept={handleAiSuggestionAccept}
              onDismiss={handleAiSuggestionDismiss}
            />
          )}

          {/* ── Follow-up question block ── */}
          {showFollowUpBlock && (
            <FollowUpQuestion
              question={currentResponse?.followUpQuestion ?? ""}
              isLoading={isLoadingFollowUp}
              isAiAnswering={isAiAnsweringFollowUp}
              savedAnswer={currentResponse?.followUpAnswer}
              isSkipped={currentResponse?.followUpSkipped}
              onAnswer={handleFollowUpAnswer}
              onSkip={handleFollowUpSkip}
              onRequestAiAnswer={handleFollowUpAiAnswer}
            />
          )}

          {/* ── Assumptions ── */}
          {currentResponse?.assumptions &&
            currentResponse.assumptions.length > 0 && (
              <div className="mt-6">
                <AssumptionList
                  assumptions={currentResponse.assumptions}
                  onConfirm={handleAssumptionConfirm}
                />
              </div>
            )}

          {/* ── Footer: navigation ── */}
          <div className="flex items-center justify-between pt-6 mt-6 border-t">
            <Button variant="secondary" onClick={handleBack}>
              {currentStep > 0 ? "Back" : "Exit"}
            </Button>

            <div className="flex items-center gap-3">
              {currentStep === wizardSteps.length - 1 ? (
                <Button onClick={handleContinue} disabled={!canProceed}>
                  Review & Finish
                  <svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </Button>
              ) : (
                <Button onClick={handleContinue} disabled={!canProceed}>
                  Continue
                  <svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Footer meta */}
        <div className="mt-6 flex items-center justify-between text-sm text-gray-500">
          <span>
            {Object.values(responses).filter((r) => r?.isComplete).length} of{" "}
            {wizardSteps.length} steps completed
          </span>
          <span>Press Enter to continue</span>
        </div>
      </main>
    </div>
  );
}
