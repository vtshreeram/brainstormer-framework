'use client';

import React, { useState, useCallback, useRef } from 'react';
import { MarkdownRenderer as ReactMarkdown } from './MarkdownRenderer';

// ─── Types ────────────────────────────────────────────────────────────────────

type InlineAction = 'improve' | 'regenerate' | null;

export interface PRDSectionViewProps {
  sectionId: string;
  heading: string;
  /** Full section markdown, including the ## heading line */
  content: string;
  /** Called when user clicks Ask AI — parent opens the side panel */
  onAskAI: (sectionId: string, heading: string, content: string) => void;
  /** Called after user confirms Replace / Accept */
  onReplace: (sectionId: string, newContent: string) => void;
  /** Fire a toast notification */
  onToast: (message: string, type: 'success' | 'info' | 'error') => void;
  /** Whether the Ask AI panel is currently open for this section */
  isAskActive?: boolean;
}

// ─── Small icon components ─────────────────────────────────────────────────

function AskIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  );
}

function ImproveIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
      />
    </svg>
  );
}

function RegenerateIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  );
}

function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };
  return (
    <svg
      className={`${sizes[size]} animate-spin text-primary-600`}
      fill="none"
      viewBox="0 0 24 24"
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
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

function CopyIcon({ copied }: { copied: boolean }) {
  return copied ? (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ) : (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
      />
    </svg>
  );
}

// ─── Tooltip wrapper ──────────────────────────────────────────────────────────

function Tooltip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="relative group/tip">
      {children}
      <div
        className="
          pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5
          px-2 py-1 rounded text-[11px] font-medium text-white bg-gray-800
          whitespace-nowrap opacity-0 group-hover/tip:opacity-100
          transition-opacity duration-150 z-50
        "
      >
        {label}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
      </div>
    </div>
  );
}

// ─── Action bar ───────────────────────────────────────────────────────────────

interface ActionBarProps {
  onAskAI: () => void;
  onImprove: () => void;
  onRegenerate: () => void;
  isAskActive: boolean;
}

function ActionBar({ onAskAI, onImprove, onRegenerate, isAskActive }: ActionBarProps) {
  return (
    <div
      className="
        flex items-center gap-0.5 bg-white border border-gray-200 rounded-full
        px-1.5 py-1 shadow-md shadow-gray-200/70
      "
      onClick={(e) => e.stopPropagation()}
    >
      {/* Ask AI */}
      <Tooltip label="Ask AI">
        <button
          onClick={onAskAI}
          className={`
            flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
            transition-all duration-150
            ${
              isAskActive
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:bg-blue-50 hover:text-blue-600'
            }
          `}
        >
          <AskIcon />
          <span>Ask AI</span>
        </button>
      </Tooltip>

      <div className="w-px h-4 bg-gray-200" />

      {/* Improve */}
      <Tooltip label="Improve this section with AI">
        <button
          onClick={onImprove}
          className="
            flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
            text-gray-500 hover:bg-amber-50 hover:text-amber-600
            transition-all duration-150
          "
        >
          <ImproveIcon />
          <span>Improve</span>
        </button>
      </Tooltip>

      <div className="w-px h-4 bg-gray-200" />

      {/* Regenerate */}
      <Tooltip label="Regenerate this section">
        <button
          onClick={onRegenerate}
          className="
            flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
            text-gray-500 hover:bg-violet-50 hover:text-violet-600
            transition-all duration-150
          "
        >
          <RegenerateIcon />
          <span>Regenerate</span>
        </button>
      </Tooltip>
    </div>
  );
}

// ─── Loading overlay ──────────────────────────────────────────────────────────

function LoadingOverlay({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <Spinner size="lg" />
      <p className="text-sm text-gray-500 font-medium">{message}</p>
      <p className="text-xs text-gray-400">This takes a few seconds…</p>
    </div>
  );
}

// ─── Improve view ─────────────────────────────────────────────────────────────

interface ImproveViewProps {
  originalContent: string;
  improvedContent: string | null;
  isLoading: boolean;
  onReplace: () => void;
  onKeep: () => void;
}

function ImproveView({
  originalContent,
  improvedContent,
  isLoading,
  onReplace,
  onKeep,
}: ImproveViewProps) {
  const [copiedImproved, setCopiedImproved] = useState(false);

  const handleCopyImproved = () => {
    if (!improvedContent) return;
    navigator.clipboard.writeText(improvedContent);
    setCopiedImproved(true);
    setTimeout(() => setCopiedImproved(false), 2000);
  };

  if (isLoading) {
    return <LoadingOverlay message="Generating improved version…" />;
  }

  if (!improvedContent) return null;

  return (
    <div className="space-y-3">
      {/* Current version */}
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 bg-gray-100 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gray-400" />
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Current Version
            </span>
          </div>
        </div>
        <div className="p-4 bg-gray-50/50 opacity-75">
          <ReactMarkdown>{originalContent}</ReactMarkdown>
        </div>
      </div>

      {/* Arrow */}
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
          AI Improvement
        </div>
      </div>

      {/* Improved version */}
      <div className="rounded-lg border border-emerald-200 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 bg-emerald-50 border-b border-emerald-200">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
              Improved Version
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-600 border border-emerald-200 font-medium">
              ✨ AI Suggested
            </span>
          </div>
          <button
            onClick={handleCopyImproved}
            className="
              flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium
              text-emerald-600 hover:bg-emerald-100 transition-colors
            "
          >
            <CopyIcon copied={copiedImproved} />
            {copiedImproved ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <div className="p-4 bg-emerald-50/30">
          <ReactMarkdown>{improvedContent}</ReactMarkdown>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={onReplace}
          className="
            flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold
            bg-emerald-600 text-white hover:bg-emerald-700
            transition-colors shadow-sm
          "
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          Replace with Improved
        </button>
        <button
          onClick={onKeep}
          className="
            px-4 py-2 rounded-lg text-sm font-medium
            text-gray-600 hover:bg-gray-100
            transition-colors border border-gray-200
          "
        >
          Keep Original
        </button>
      </div>
    </div>
  );
}

// ─── Regenerate view ──────────────────────────────────────────────────────────

interface RegenerateViewProps {
  regeneratedContent: string | null;
  isLoading: boolean;
  onAccept: () => void;
  onRegenerateAgain: () => void;
  onCancel: () => void;
}

function RegenerateView({
  regeneratedContent,
  isLoading,
  onAccept,
  onRegenerateAgain,
  onCancel,
}: RegenerateViewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!regeneratedContent) return;
    navigator.clipboard.writeText(regeneratedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return <LoadingOverlay message="Generating new version…" />;
  }

  if (!regeneratedContent) return null;

  return (
    <div className="space-y-3">
      {/* New version */}
      <div className="rounded-lg border border-violet-200 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 bg-violet-50 border-b border-violet-200">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-violet-500" />
            <span className="text-xs font-semibold text-violet-700 uppercase tracking-wide">
              New Version
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-600 border border-violet-200 font-medium">
              🔄 Regenerated
            </span>
          </div>
          <button
            onClick={handleCopy}
            className="
              flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium
              text-violet-600 hover:bg-violet-100 transition-colors
            "
          >
            <CopyIcon copied={copied} />
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <div className="p-4 bg-violet-50/20">
          <ReactMarkdown>{regeneratedContent}</ReactMarkdown>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3 pt-1 flex-wrap">
        <button
          onClick={onAccept}
          className="
            flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold
            bg-violet-600 text-white hover:bg-violet-700
            transition-colors shadow-sm
          "
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          Accept
        </button>
        <button
          onClick={onRegenerateAgain}
          className="
            flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold
            border border-violet-300 text-violet-700 hover:bg-violet-50
            transition-colors
          "
        >
          <RegenerateIcon />
          Regenerate Again
        </button>
        <button
          onClick={onCancel}
          className="
            px-4 py-2 rounded-lg text-sm font-medium
            text-gray-600 hover:bg-gray-100
            transition-colors border border-gray-200
          "
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function PRDSectionView({
  sectionId,
  heading,
  content,
  onAskAI,
  onReplace,
  onToast,
  isAskActive = false,
}: PRDSectionViewProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [action, setAction] = useState<InlineAction>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [improvedContent, setImprovedContent] = useState<string | null>(null);
  const [regeneratedContent, setRegeneratedContent] = useState<string | null>(null);
  const regenAttemptRef = useRef(0);

  const showBar = isHovered || action !== null || isAskActive;

  // ── Improve ─────────────────────────────────────────────────────────────────

  const handleImprove = useCallback(async () => {
    setAction('improve');
    setIsLoading(true);
    setImprovedContent(null);

    try {
      const res = await fetch('/api/section-improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section_heading: heading,
          section_content: content,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Request failed: ${res.status}`);
      }

      const data = await res.json();
      setImprovedContent(data.improved_content ?? null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('[PRDSectionView] improve error:', message);
      onToast('Failed to improve section. Please try again.', 'error');
      setAction(null);
    } finally {
      setIsLoading(false);
    }
  }, [heading, content, onToast]);

  // ── Regenerate ──────────────────────────────────────────────────────────────

  const callRegenerate = useCallback(
    async (attempt: number) => {
      setIsLoading(true);
      setRegeneratedContent(null);

      try {
        const res = await fetch('/api/section-regenerate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            section_heading: heading,
            section_content: content,
            attempt,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `Request failed: ${res.status}`);
        }

        const data = await res.json();
        setRegeneratedContent(data.regenerated_content ?? null);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('[PRDSectionView] regenerate error:', message);
        onToast('Failed to regenerate section. Please try again.', 'error');
        if (attempt === 0) setAction(null);
      } finally {
        setIsLoading(false);
      }
    },
    [heading, content, onToast],
  );

  const handleRegenerate = useCallback(() => {
    regenAttemptRef.current = 0;
    setAction('regenerate');
    callRegenerate(0);
  }, [callRegenerate]);

  const handleRegenerateAgain = useCallback(() => {
    regenAttemptRef.current += 1;
    callRegenerate(regenAttemptRef.current);
  }, [callRegenerate]);

  // ── Confirm actions ─────────────────────────────────────────────────────────

  const handleReplaceImproved = useCallback(() => {
    if (!improvedContent) return;
    onReplace(sectionId, improvedContent);
    onToast('Section updated successfully', 'success');
    setAction(null);
    setImprovedContent(null);
  }, [improvedContent, sectionId, onReplace, onToast]);

  const handleAcceptRegenerated = useCallback(() => {
    if (!regeneratedContent) return;
    onReplace(sectionId, regeneratedContent);
    onToast('New version generated', 'success');
    setAction(null);
    setRegeneratedContent(null);
    regenAttemptRef.current = 0;
  }, [regeneratedContent, sectionId, onReplace, onToast]);

  const handleCancel = useCallback(() => {
    setAction(null);
    setImprovedContent(null);
    setRegeneratedContent(null);
    setIsLoading(false);
    regenAttemptRef.current = 0;
  }, []);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div
      className={`
        relative rounded-xl transition-all duration-200
        ${
          action !== null
            ? action === 'improve'
              ? 'ring-1 ring-emerald-200 bg-emerald-50/10'
              : 'ring-1 ring-violet-200 bg-violet-50/10'
            : isAskActive
            ? 'ring-1 ring-blue-200 bg-blue-50/10'
            : isHovered
            ? 'ring-1 ring-gray-200 bg-gray-50/60'
            : ''
        }
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── Action bar (hover-visible) ──────────────────────────────────────── */}
      <div
        className={`
          absolute top-3 right-3 z-10 transition-all duration-200
          ${showBar && action === null ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1 pointer-events-none'}
        `}
      >
        <ActionBar
          onAskAI={() => onAskAI(sectionId, heading, content)}
          onImprove={handleImprove}
          onRegenerate={handleRegenerate}
          isAskActive={isAskActive}
        />
      </div>

      {/* ── Active action label bar ─────────────────────────────────────────── */}
      {action !== null && (
        <div
          className={`
            flex items-center justify-between px-4 py-2 rounded-t-xl
            ${action === 'improve' ? 'bg-emerald-100/80 border-b border-emerald-200' : 'bg-violet-100/80 border-b border-violet-200'}
          `}
        >
          <div
            className={`flex items-center gap-2 text-xs font-semibold ${action === 'improve' ? 'text-emerald-700' : 'text-violet-700'}`}
          >
            {action === 'improve' ? <ImproveIcon /> : <RegenerateIcon />}
            <span>{action === 'improve' ? 'Improving section…' : 'Regenerating section…'}</span>
          </div>
          {!isLoading && (
            <button
              onClick={handleCancel}
              className={`
                text-xs font-medium underline underline-offset-2
                transition-colors
                ${action === 'improve' ? 'text-emerald-600 hover:text-emerald-800' : 'text-violet-600 hover:text-violet-800'}
              `}
            >
              Cancel
            </button>
          )}
        </div>
      )}

      {/* ── Content area ────────────────────────────────────────────────────── */}
      <div
        className={`
          p-5
          ${action !== null ? 'pt-4' : 'pt-5'}
        `}
      >
        {action === null && <ReactMarkdown>{content}</ReactMarkdown>}

        {action === 'improve' && (
          <ImproveView
            originalContent={content}
            improvedContent={improvedContent}
            isLoading={isLoading}
            onReplace={handleReplaceImproved}
            onKeep={handleCancel}
          />
        )}

        {action === 'regenerate' && (
          <RegenerateView
            regeneratedContent={regeneratedContent}
            isLoading={isLoading}
            onAccept={handleAcceptRegenerated}
            onRegenerateAgain={handleRegenerateAgain}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
}
