"use client";
import { Sparkles } from "lucide-react";
import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback,
} from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { fetchProject, saveWizardResponse, saveFollowUp, updateProjectStatus } from "@/lib/api-client";
import { wizardSteps } from "@/data/mockData";
import {
  Button,
  TextArea,
  ProgressBar,
  AssumptionList,
  FollowUpQuestion,
  AiAnswerSuggestion,
} from "@/components/ui";
import { Project, Response } from "@/types";

const FOLLOW_UP_MIN_LENGTH = 20;
const FOLLOW_UP_DEBOUNCE_MS = 1500;

export default function WizardPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const { user } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [responses, setResponses] = useState<Record<string, Response>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoadingProject, setIsLoadingProject] = useState(true);

  const [isLoadingFollowUp, setIsLoadingFollowUp] = useState(false);
  const [isAiAnsweringFollowUp, setIsAiAnsweringFollowUp] = useState(false);
  const [showAiSuggestion, setShowAiSuggestion] = useState(false);
  const [isLoadingAiSuggestion, setIsLoadingAiSuggestion] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState("");

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentStepData = wizardSteps[currentStep];
  const currentResponse = responses[currentStepData?.id];

  const addToast = useCallback((toast: { type: string; message: string }) => {
    console.log("[toast]", toast.type, toast.message);
  }, []);

  useEffect(() => {
    if (!projectId) return;
    setIsLoadingProject(true);
    fetchProject(projectId)
      .then((p) => {
        setProject(p);
        const currentVersion = p.versions.find((v) => v.isCurrent);
        if (currentVersion) {
          setResponses(currentVersion.responses || {});
        }
        setIsLoadingProject(false);
      })
      .catch(() => {
        setIsLoadingProject(false);
      });
  }, [projectId]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setIsLoadingFollowUp(false);
    setIsAiAnsweringFollowUp(false);
    setShowAiSuggestion(false);
    setIsLoadingAiSuggestion(false);
    setAiSuggestion("");
  }, [currentStep]);

  const stepLabels = useMemo(() => wizardSteps.map((s) => s.title), []);

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

  useEffect(() => {
    if (!currentStepData) return;

    const answer = currentResponse?.answer ?? "";

    if (debounceRef.current) clearTimeout(debounceRef.current);

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
          const updated = {
            ...responses,
            [currentStepData.id]: {
              ...responses[currentStepData.id],
              questionId: currentStepData.id,
              question: currentStepData.question,
              answer: responses[currentStepData.id]?.answer || "",
              assumptions: responses[currentStepData.id]?.assumptions || [],
              isComplete: responses[currentStepData.id]?.isComplete || false,
              followUpQuestion: data.follow_up_question,
            },
          };
          setResponses(updated);
          saveFollowUp(projectId, currentStepData.id, {
            followUpQuestion: data.follow_up_question,
          });
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

  const handleAnswerChange = (answer: string) => {
    if (!currentStepData) return;

    const newResponse: Response = {
      questionId: currentStepData.id,
      question: currentStepData.question,
      answer,
      assumptions: currentResponse?.assumptions || [],
      isComplete: answer.trim().length > 0,
      followUpQuestion: currentResponse?.followUpQuestion,
      followUpAnswer: currentResponse?.followUpAnswer,
      followUpSkipped: currentResponse?.followUpSkipped,
    };

    const updated = { ...responses, [currentStepData.id]: newResponse };
    setResponses(updated);
    saveWizardResponse(projectId, currentStepData.id, currentStepData.question, answer, answer.trim().length > 0);

    if (
      answer.trim().length < FOLLOW_UP_MIN_LENGTH &&
      currentResponse?.followUpQuestion &&
      !currentResponse?.followUpAnswer &&
      !currentResponse?.followUpSkipped
    ) {
      const cleared = {
        ...responses,
        [currentStepData.id]: {
          ...newResponse,
          followUpQuestion: undefined,
          followUpAnswer: undefined,
          followUpSkipped: undefined,
        },
      };
      setResponses(cleared);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      setIsLoadingFollowUp(false);
    }
  };

  const handleAssumptionConfirm = (assumptionId: string) => {
    if (!currentStepData) return;
    const resp = responses[currentStepData.id];
    if (!resp) return;
    const updatedAssumptions = resp.assumptions.map((a) =>
      a.id === assumptionId ? { ...a, confirmed: true } : a
    );
    const updated = {
      ...responses,
      [currentStepData.id]: { ...resp, assumptions: updatedAssumptions },
    };
    setResponses(updated);
  };

  const handleLetAiAnswer = async () => {
    setShowAiSuggestion(true);
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

  const handleAiSuggestionEdit = (text: string) => {
    handleAnswerChange(text);
    setShowAiSuggestion(false);
    setAiSuggestion("");
  };

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

  const handleAiSuggestionAccept = () => {
    if (aiSuggestion) {
      handleAnswerChange(aiSuggestion);
      addToast({ type: "success", message: "AI answer accepted!" });
    }
    setShowAiSuggestion(false);
    setAiSuggestion("");
  };

  const handleAiSuggestionDismiss = () => {
    setShowAiSuggestion(false);
    setAiSuggestion("");
  };

  const handleFollowUpAnswer = (answer: string) => {
    if (!currentStepData) return;
    const resp = responses[currentStepData.id];
    if (!resp) return;
    const updated = {
      ...responses,
      [currentStepData.id]: { ...resp, followUpAnswer: answer },
    };
    setResponses(updated);
    saveFollowUp(projectId, currentStepData.id, { followUpAnswer: answer });
    addToast({ type: "success", message: "Follow-up answered!" });
  };

  const handleFollowUpSkip = () => {
    if (!currentStepData) return;
    const resp = responses[currentStepData.id];
    if (!resp) return;
    const updated = {
      ...responses,
      [currentStepData.id]: { ...resp, followUpSkipped: true },
    };
    setResponses(updated);
    saveFollowUp(projectId, currentStepData.id, { followUpSkipped: true });
  };

  const handleFollowUpAiAnswer = async () => {
    if (!currentStepData || !currentResponse?.followUpQuestion) return;

    setIsAiAnsweringFollowUp(true);

    const answer = await callAutoAnswer(currentResponse.followUpQuestion);

    if (answer) {
      const resp = responses[currentStepData.id];
      const updated = {
        ...responses,
        [currentStepData.id]: { ...resp, followUpAnswer: answer },
      };
      setResponses(updated);
      saveFollowUp(projectId, currentStepData.id, { followUpAnswer: answer });
      addToast({
        type: "success",
        message: "AI generated a follow-up answer.",
      });
    }

    setIsAiAnsweringFollowUp(false);
  };

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

  if (isLoadingProject) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!project || !currentStepData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Project not found</p>
      </div>
    );
  }

  const canProceed =
    currentResponse?.isComplete ||
    (currentResponse?.answer?.trim().length ?? 0) > 0;

  const showFollowUpBlock =
    isLoadingFollowUp || !!currentResponse?.followUpQuestion;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
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

      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-8">
          <ProgressBar
            currentStep={currentStep}
            totalSteps={wizardSteps.length}
            stepLabels={stepLabels}
            onStepClick={handleStepClick}
          />
        </div>

        <div className="card p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {currentStepData.title}
            </h2>
            <p className="text-lg text-gray-600">{currentStepData.question}</p>
          </div>

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
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                Let AI Answer
              </button>
            </div>
          )}

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

          {currentResponse?.assumptions &&
            currentResponse.assumptions.length > 0 && (
              <div className="mt-6">
                <AssumptionList
                  assumptions={currentResponse.assumptions}
                  onConfirm={handleAssumptionConfirm}
                />
              </div>
            )}

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