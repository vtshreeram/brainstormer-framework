'use client';

import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { AiProductSuggestion, AiSuggestionsResult } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface AiSuggestionsPanelProps {
  /** The result returned from /api/ai-suggestions, or null if not yet fetched */
  suggestions: AiSuggestionsResult | null;
  /** True while the API call is in-flight */
  isLoading: boolean;
  /** Called when the user clicks the dismiss [×] button */
  onDismiss: () => void;
  /** Called when the user clicks the Refresh button to re-fetch */
  onRefetch: () => void;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Icon components
// ─────────────────────────────────────────────────────────────────────────────

function SparklesIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
      />
    </svg>
  );
}

function BulbIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
      />
    </svg>
  );
}

function CheckIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function CopyIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
      />
    </svg>
  );
}

function RefreshIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  );
}

function CloseIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function Spinner({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton loader
// ─────────────────────────────────────────────────────────────────────────────

function SkeletonBar({ width = 'w-full', height = 'h-3' }: { width?: string; height?: string }) {
  return <div className={`${width} ${height} bg-gray-200 rounded animate-pulse`} />;
}

function LoadingSkeleton() {
  return (
    <div className="divide-y divide-gray-100">
      {/* Suggestions skeleton */}
      <div className="px-5 py-5 space-y-5">
        <div className="flex items-center gap-2">
          <SkeletonBar width="w-3" height="h-3" />
          <SkeletonBar width="w-48" height="h-4" />
        </div>
        {[0, 1, 2].map((i) => (
          <div key={i} className="pl-4 border-l-[3px] border-gray-200 py-2 space-y-2 pr-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <SkeletonBar width="w-36" height="h-4" />
                <SkeletonBar width="w-12" height="h-4" />
              </div>
              <SkeletonBar width="w-6" height="h-6" />
            </div>
            <SkeletonBar width="w-full" height="h-3" />
            <SkeletonBar width="w-4/5" height="h-3" />
            <SkeletonBar width="w-12" height="h-3" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Suggestion card — left-border accent, icon-only copy, line-clamp + expand
// ─────────────────────────────────────────────────────────────────────────────

interface SuggestionCardProps {
  suggestion: AiProductSuggestion;
  index: number;
}

function SuggestionCard({ suggestion, index }: SuggestionCardProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleCopy = () => {
    const text = `${suggestion.title}\n\n${suggestion.description}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Rotating accent colours for left border
  const accentBorders = [
    'border-blue-400',
    'border-emerald-400',
    'border-amber-400',
    'border-rose-400',
    'border-violet-400',
  ];

  // Rotating tags since AiProductSuggestion has no type field
  const tags: { label: string; color: string }[] = [
    { label: 'UX',          color: 'bg-blue-50 text-blue-700' },
    { label: 'Growth',      color: 'bg-emerald-50 text-emerald-700' },
    { label: 'Engagement',  color: 'bg-amber-50 text-amber-700' },
    { label: 'Retention',   color: 'bg-rose-50 text-rose-700' },
    { label: 'Performance', color: 'bg-violet-50 text-violet-700' },
  ];

  const accentBorder = accentBorders[index % accentBorders.length];
  const tag = tags[index % tags.length];

  return (
    <div
      className={`
        group relative pl-4 pr-3 py-3
        border-l-[3px] ${accentBorder}
        rounded-r-md
        transition-colors duration-150
        hover:bg-gray-50/80
      `}
    >
      {/* Row: title + tag + icon-only copy */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            <h4 className="text-sm font-semibold text-gray-900 leading-snug">
              {suggestion.title}
            </h4>
            <span
              className={`
                inline-flex items-center px-1.5 py-0.5 rounded
                text-[10px] font-semibold leading-none
                ${tag.color}
              `}
            >
              {tag.label}
            </span>
          </div>
        </div>

        {/* Icon-only copy button with tooltip via title attr */}
        <button
          onClick={handleCopy}
          title="Copy suggestion"
          aria-label="Copy suggestion"
          className={`
            flex-shrink-0 mt-0.5 p-1.5 rounded-md
            transition-colors duration-150
            ${copied
              ? 'text-green-600 bg-green-50'
              : 'text-gray-400 hover:text-violet-600 hover:bg-violet-50'
            }
          `}
        >
          {copied
            ? <CheckIcon className="w-3.5 h-3.5" />
            : <CopyIcon className="w-3.5 h-3.5" />
          }
        </button>
      </div>

      {/* Description — 2-line clamp with expand toggle */}
      <p
        className={`
          text-sm text-gray-500 leading-relaxed
          ${!expanded ? 'line-clamp-2' : ''}
        `}
      >
        {suggestion.description}
      </p>

      <button
        onClick={() => setExpanded((v) => !v)}
        className="mt-1 text-xs font-medium text-violet-600 hover:text-violet-800 transition-colors"
      >
        {expanded ? '↑ Collapse' : '↓ Expand'}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main panel component
// ─────────────────────────────────────────────────────────────────────────────

export function AiSuggestionsPanel({
  suggestions,
  isLoading,
  onDismiss,
  onRefetch,
  className = '',
}: AiSuggestionsPanelProps) {

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Slide-in Drawer Overlay ── */}
      <div className={`fixed inset-0 z-40 flex justify-end bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${className || ''}`}>
        {/* Backdrop clickable area to dismiss */}
        <div className="absolute inset-0" onClick={onDismiss} aria-hidden="true" />

        {/* Drawer panel */}
        <div className="relative w-full max-w-[400px] bg-white shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300 border-l border-gray-200">

          {/* ── Panel header ── */}
          <div className="flex flex-col px-5 py-5 border-b border-gray-100 bg-white flex-shrink-0 z-10 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                  <SparklesIcon className="w-5 h-5 text-violet-600" />
                  AI Suggestions
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Based on your PRD
                </p>
              </div>

              <button
                onClick={onDismiss}
                title="Close suggestions"
                className="
                  p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100
                  transition-colors duration-150
                "
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={onRefetch}
              disabled={isLoading}
              className="
                flex items-center justify-center gap-1.5 w-full py-2 rounded-md
                text-sm font-medium text-violet-700 bg-violet-50
                border border-violet-200
                hover:bg-violet-100 hover:border-violet-300
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors duration-150
              "
            >
              {isLoading ? <Spinner className="w-4 h-4" /> : <RefreshIcon className="w-4 h-4" />}
              {isLoading ? 'Analysing PRD…' : 'Refresh Suggestions'}
            </button>
          </div>

          {/* ── Body ── */}
          <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <LoadingSkeleton />
          ) : suggestions ? (
            <div className="pb-8">

              {/* ── Product Suggestions section — clean list ── */}
              <div className="px-5 py-5">

                {/* Section header */}
                <div className="flex items-center gap-2 mb-1">
                  <BulbIcon className="w-4 h-4 text-violet-500 flex-shrink-0" />
                  <h3 className="text-sm font-semibold text-gray-800">
                    Product Improvement Ideas
                  </h3>
                  <span className="text-[11px] font-semibold text-violet-600 bg-violet-100 px-1.5 py-0.5 rounded-full leading-none">
                    {suggestions.suggestions.length}
                  </span>
                </div>

                <p className="text-xs text-gray-400 mb-4 ml-6 leading-relaxed">
                  Actionable improvements identified from your PRD goals, user context, and feature set.
                </p>

                {/* Suggestion list */}
                <div className="space-y-4">
                  {suggestions.suggestions.map((s, i) => (
                    <SuggestionCard key={i} suggestion={s} index={i} />
                  ))}
                </div>
              </div>

            </div>
          ) : (
            /* ── Empty / error state ── */
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center mb-3">
                <SparklesIcon className="w-6 h-6 text-violet-400" />
              </div>
              <p className="text-sm font-medium text-gray-700 mb-1">No suggestions yet</p>
              <p className="text-xs text-gray-500 mb-4">
                Something went wrong fetching suggestions. Try again below.
              </p>
              <Button
                size="sm"
                onClick={onRefetch}
                className="!bg-violet-600 !text-white hover:!bg-violet-700"
              >
                <RefreshIcon className="w-3.5 h-3.5 mr-1.5" />
                Try Again
              </Button>
            </div>
          )}
          </div>

          {/* ── Panel footer ── */}
          {!isLoading && suggestions && (
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex-shrink-0">
              <p className="text-xs text-gray-400 flex items-center gap-1.5">
                <SparklesIcon className="w-3 h-3 flex-shrink-0 text-violet-400" />
                AI suggestions are based on your PRD content and common product patterns. Always validate with user research.
              </p>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
