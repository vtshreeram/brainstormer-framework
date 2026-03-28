'use client';

import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { TextArea } from './TextArea';

interface FollowUpQuestionProps {
  /** The AI-generated follow-up question text */
  question: string;
  /** True while waiting for the follow-up question to be fetched from the API */
  isLoading: boolean;
  /** True while the AI is generating an answer for the follow-up */
  isAiAnswering: boolean;
  /** Previously saved follow-up answer (from user or AI) */
  savedAnswer?: string;
  /** Whether the user has chosen to skip this follow-up */
  isSkipped?: boolean;
  /** Called when the user (or AI) submits a follow-up answer */
  onAnswer: (answer: string) => void;
  /** Called when the user clicks "Skip" */
  onSkip: () => void;
  /** Called when the user clicks "Let AI answer" */
  onRequestAiAnswer: () => void;
  className?: string;
}

type InternalMode = 'idle' | 'answering' | 'editing';

export function FollowUpQuestion({
  question,
  isLoading,
  isAiAnswering,
  savedAnswer,
  isSkipped,
  onAnswer,
  onSkip,
  onRequestAiAnswer,
  className = '',
}: FollowUpQuestionProps) {
  const [mode, setMode] = useState<InternalMode>('idle');
  const [localAnswer, setLocalAnswer] = useState('');

  // Reset internal mode whenever the question itself changes (new step)
  useEffect(() => {
    setMode('idle');
    setLocalAnswer('');
  }, [question]);

  const handleSubmitAnswer = () => {
    const trimmed = localAnswer.trim();
    if (!trimmed) return;
    onAnswer(trimmed);
    setMode('idle');
    setLocalAnswer('');
  };

  const handleCancelAnswering = () => {
    setMode('idle');
    setLocalAnswer('');
  };

  const handleEditClick = () => {
    setLocalAnswer(savedAnswer ?? '');
    setMode('editing');
  };

  // ─── 1. Loading — waiting for AI to generate the follow-up question ───────
  if (isLoading) {
    return (
      <div className={`mt-4 ${className}`}>
        <div className="flex items-center gap-2.5 px-4 py-3 bg-gray-50 border border-gray-200">
          <svg
            className="animate-spin w-4 h-4 text-indigo-400 flex-shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="text-sm text-gray-500">Analyzing your answer…</span>
        </div>
      </div>
    );
  }

  // ─── Nothing to show (no question yet) ───────────────────────────────────
  if (!question) return null;

  // ─── 2. Skipped ───────────────────────────────────────────────────────────
  if (isSkipped) {
    return (
      <div className={`mt-4 ${className}`}>
        <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-dashed border-gray-300">
          <svg
            className="w-4 h-4 text-gray-400 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 5l7 7-7 7M5 5l7 7-7 7"
            />
          </svg>
          <span className="text-sm text-gray-400">Follow-up skipped</span>
        </div>
      </div>
    );
  }

  // ─── 3. Answered — show saved answer (unless user is editing it) ──────────
  if (savedAnswer && mode !== 'editing') {
    return (
      <div className={`mt-4 ${className}`}>
        <div className="p-4 bg-emerald-50 border border-emerald-200">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5 min-w-0">
              <div className="w-5 h-5 bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-1">
                  Follow-up answered
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">{savedAnswer}</p>
              </div>
            </div>
            <button
              onClick={handleEditClick}
              className="flex-shrink-0 text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors"
            >
              Edit
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── 4. AI is generating an answer ───────────────────────────────────────
  if (isAiAnswering) {
    return (
      <div className={`mt-4 ${className}`}>
        <div className="p-4 bg-primary-10 border border-primary-20">
          {/* Question context */}
          <div className="flex items-start gap-2.5 mb-3">
            <div className="w-5 h-5 bg-primary-10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-3 h-3 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-sm text-gray-700">{question}</p>
          </div>
          {/* Spinner */}
          <div className="flex items-center gap-2 pt-2 border-t border-violet-200">
            <svg
              className="animate-spin w-4 h-4 text-violet-500 flex-shrink-0"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <p className="text-sm font-medium text-violet-700">AI is writing an answer…</p>
          </div>
        </div>
      </div>
    );
  }

  // ─── 5. Answering / Editing — textarea is visible ────────────────────────
  if (mode === 'answering' || mode === 'editing') {
    return (
      <div className={`mt-4 ${className}`}>
        <div className="p-4 bg-blue-50 border border-blue-200 space-y-3">
          {/* Question header */}
          <div className="flex items-start gap-2.5">
            <div className="w-5 h-5 bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-blue-900">{question}</p>
          </div>

          {/* Textarea */}
          <TextArea
            value={localAnswer}
            onChange={(e) => setLocalAnswer(e.target.value)}
            placeholder="Type your answer here…"
            showCount
            maxLength={500}
            autoFocus
          />

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleSubmitAnswer}
              disabled={localAnswer.trim().length === 0}
            >
              <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Submit Answer
            </Button>
            <Button size="sm" variant="ghost" onClick={handleCancelAnswering}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ─── 6. Idle — question shown with the three primary action buttons ───────
  return (
    <div className={`mt-4 ${className}`}>
      <div className="p-4 bg-amber-50 border border-amber-200">
        {/* Label + Question */}
        <div className="flex items-start gap-2.5">
          <div className="w-6 h-6 bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">
              Follow-up Question
            </p>
            <p className="text-sm text-gray-800 leading-relaxed">{question}</p>
          </div>
        </div>

        {/* Divider + Action buttons */}
        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-amber-200">
          {/* Answer */}
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setLocalAnswer('');
              setMode('answering');
            }}
          >
            <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
            Answer
          </Button>

          {/* Skip */}
          <Button size="sm" variant="ghost" onClick={onSkip}>
            <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 5l7 7-7 7M5 5l7 7-7 7"
              />
            </svg>
            Skip
          </Button>

          {/* Let AI answer */}
          <Button
            size="sm"
            variant="ghost"
            onClick={onRequestAiAnswer}
            className="!text-violet-600 hover:!text-violet-700 hover:!bg-violet-50"
          >
            <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            Let AI answer
          </Button>
        </div>
      </div>
    </div>
  );
}
