'use client';

import React from 'react';
import { Button } from './Button';

interface AiAnswerSuggestionProps {
  /** The AI-generated suggestion text */
  suggestion: string;
  /** True while the API call is in progress */
  isLoading: boolean;
  /** Called with the suggestion text when the user clicks "Edit" — fills the main textarea */
  onEdit: (text: string) => void;
  /** Called when the user clicks "Regenerate" — re-triggers the API */
  onRegenerate: () => void;
  /** Called when the user clicks "Accept" — saves suggestion as the final answer */
  onAccept: () => void;
  /** Called when the user clicks [×] to dismiss the card without acting */
  onDismiss: () => void;
  className?: string;
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
function Spinner({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962
           7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

// ─── Sparkles icon ─────────────────────────────────────────────────────────────
function SparklesIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
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
           12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0
           117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0
           11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
      />
    </svg>
  );
}

// ─── Edit icon ─────────────────────────────────────────────────────────────────
function EditIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0
           113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
      />
    </svg>
  );
}

// ─── Refresh / Regenerate icon ─────────────────────────────────────────────────
function RefreshIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0
           0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357
           2H15"
      />
    </svg>
  );
}

// ─── Check / Accept icon ───────────────────────────────────────────────────────
function CheckIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.5}
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}

// ─── Close icon ────────────────────────────────────────────────────────────────
function CloseIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export function AiAnswerSuggestion({
  suggestion,
  isLoading,
  onEdit,
  onRegenerate,
  onAccept,
  onDismiss,
  className = '',
}: AiAnswerSuggestionProps) {

  // ── 1. Loading ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className={`mt-3 ${className}`}>
        <div
          className="
            flex items-center gap-3 px-4 py-3
            bg-violet-50 border border-violet-200 rounded-none
            animate-in fade-in
          "
        >
          <Spinner className="w-4 h-4 text-violet-500 flex-shrink-0" />
          <span className="text-sm font-medium text-violet-700">
            AI is writing your answer…
          </span>
        </div>
      </div>
    );
  }

  // ── Nothing to show ─────────────────────────────────────────────────────────
  if (!suggestion) return null;

  // ── 2. Suggestion card ──────────────────────────────────────────────────────
  return (
    <div className={`mt-3 ${className}`}>
      <div
        className="
          bg-violet-50 border border-violet-200 rounded-none
          overflow-hidden animate-in fade-in
        "
      >
        {/* ── Header ── */}
        <div
          className="
            flex items-center justify-between
            px-4 py-2.5
            bg-violet-100/60 border-b border-violet-200
          "
        >
          <div className="flex items-center gap-2">
            <SparklesIcon className="w-4 h-4 text-violet-600" />
            <span className="text-xs font-semibold text-violet-700 uppercase tracking-wide">
              AI Suggestion
            </span>
          </div>

          {/* Dismiss */}
          <button
            onClick={onDismiss}
            title="Dismiss suggestion"
            className="
              p-0.5 rounded-none text-violet-400
              hover:text-violet-600 hover:bg-violet-200/60
              transition-colors duration-150
              focus:outline-none focus:ring-2 focus:ring-violet-400
            "
          >
            <CloseIcon className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ── Body — suggestion text ── */}
        <div className="px-4 py-3.5">
          <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
            {suggestion}
          </p>
        </div>

        {/* ── Footer — action buttons ── */}
        <div
          className="
            flex flex-wrap items-center gap-2
            px-4 py-2.5
            bg-violet-100/40 border-t border-violet-200
          "
        >
          {/* Edit — loads text into the textarea for manual editing */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEdit(suggestion)}
            className="!text-gray-600 hover:!text-gray-800 hover:!bg-violet-200/50"
          >
            <EditIcon className="w-3 h-3 mr-1.5" />
            Edit
          </Button>

          {/* Regenerate — calls the API again for a fresh suggestion */}
          <Button
            size="sm"
            variant="ghost"
            onClick={onRegenerate}
            className="!text-gray-600 hover:!text-gray-800 hover:!bg-violet-200/50"
          >
            <RefreshIcon className="w-3 h-3 mr-1.5" />
            Regenerate
          </Button>

          {/* Spacer to push Accept to the right */}
          <span className="flex-1" />

          {/* Accept — saves suggestion directly as the step answer */}
          <Button
            size="sm"
            onClick={onAccept}
            className="
              !bg-violet-600 !text-white
              hover:!bg-violet-700
              focus:!ring-violet-500
            "
          >
            <CheckIcon className="w-3 h-3 mr-1.5" />
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
