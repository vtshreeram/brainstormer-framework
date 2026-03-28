"use client";
import { Sparkles, RefreshCw } from "lucide-react";
import React, { useState, useCallback, useRef, useEffect } from "react";
import { MarkdownRenderer as ReactMarkdown } from "./MarkdownRenderer";

// ─── Types ────────────────────────────────────────────────────────────────────

type InlineAction = "improve_options" | "improve_preview" | "regenerate" | null;

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
  onToast: (message: string, type: "success" | "info" | "error") => void;
  /** Whether the Ask AI panel is currently open for this section */
  isAskActive?: boolean;
  /** ID of the section that currently has an active inline panel (for single-panel rule) */
  activeSectionId?: string | null;
  /** Called when this section opens/closes an inline action */
  onActionStart?: (sectionId: string | null) => void;
  /** When true, hides the Regenerate button (for non-PRD doc types) */
  disableRegenerate?: boolean;
}

// ─── Small icon components ─────────────────────────────────────────────────

function AskIcon() {
  return (
    <svg
      className="w-3.5 h-3.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
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
    <svg
      className="w-3.5 h-3.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
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
    <svg
      className="w-3.5 h-3.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  );
}

function Spinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-8 h-8" };
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
    <svg
      className="w-3.5 h-3.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  ) : (
    <svg
      className="w-3.5 h-3.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
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

function Tooltip({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
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
  disableRegenerate?: boolean;
}

function ActionBar({
  onAskAI,
  onImprove,
  onRegenerate,
  isAskActive,
  disableRegenerate = false,
}: ActionBarProps) {
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
                ? "bg-blue-100 text-blue-700"
                : "text-gray-500 hover:bg-blue-50 hover:text-blue-600"
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

      {/* Regenerate — hidden for non-PRD doc types */}
      {!disableRegenerate && (
        <>
          <div className="w-px h-4 bg-gray-200" />
          <Tooltip label="Regenerate this section">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onRegenerate();
              }}
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
        </>
      )}
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

// ─── Improve Options View ──────────────────────────────────────────────────

function ImproveOptionsView({
  onGenerate,
  onCancel,
}: {
  onGenerate: (instruction: string | null) => void;
  onCancel: () => void;
}) {
  const [instruction, setInstruction] = useState("");

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mt-4 animate-in slide-in-from-top-1 fade-in duration-200">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <ImproveIcon />
          </div>
          <span className="text-sm font-semibold text-gray-700">
            Improve this section
          </span>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onCancel();
          }}
          className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-200 rounded"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className="p-4 space-y-5">
        {/* Quick Improve */}
        <div>
          <button
            onClick={() => onGenerate(null)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-medium hover:from-emerald-600 hover:to-teal-600 transition-all shadow-sm focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            Improve Automatically
          </button>
          <p className="text-xs text-gray-500 text-center mt-2">
            AI will automatically enhance clarity, structure, and readability.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-px bg-gray-200 flex-1" />
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            OR CHOOSE
          </span>
          <div className="h-px bg-gray-200 flex-1" />
        </div>

        {/* Guided Improve */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onGenerate("Improve clarity")}
            className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors border border-gray-200"
          >
            Improve clarity
          </button>
          <button
            onClick={() => onGenerate("Make it concise")}
            className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors border border-gray-200"
          >
            Make it concise
          </button>
          <button
            onClick={() => onGenerate("Add more details")}
            className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors border border-gray-200"
          >
            Add more details
          </button>
          <button
            onClick={() => onGenerate("Make it more professional")}
            className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors border border-gray-200"
          >
            Make it professional
          </button>
        </div>

        {/* Custom Input */}
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="What would you like to improve?"
            className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            onKeyDown={(e) =>
              e.key === "Enter" &&
              instruction.trim() &&
              onGenerate(instruction.trim())
            }
          />
          <button
            onClick={() => onGenerate(instruction.trim())}
            disabled={!instruction.trim()}
            className="px-4 py-2.5 bg-emerald-100 text-emerald-700 font-semibold rounded-lg hover:bg-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Generate
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Improve Preview View ──────────────────────────────────────────────────

interface ImprovePreviewViewProps {
  originalContent: string;
  improvedContent: string | null;
  isLoading: boolean;
  onAccept: (content: string) => void;
  onRegenerate: () => void;
  onCancel: () => void;
}

function ImprovePreviewView({
  originalContent,
  improvedContent,
  isLoading,
  onAccept,
  onRegenerate,
  onCancel,
}: ImprovePreviewViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Update editedContent when improvedContent changes
  React.useEffect(() => {
    if (improvedContent) {
      setEditedContent(improvedContent);
      setIsEditing(false);
      setIsRegenerating(false);
    }
  }, [improvedContent]);

  if (isLoading && !isRegenerating) {
    return <LoadingOverlay message="Generating improved version…" />;
  }

  if (!improvedContent) return null;

  return (
    <div className="mt-3 space-y-4 animate-in slide-in-from-top-1 fade-in duration-200">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Original version */}
        <div className="rounded-lg border border-gray-200 overflow-hidden flex flex-col shadow-sm bg-white">
          <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200 flex-shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gray-400" />
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                Original
              </span>
            </div>
          </div>
          <div className="p-5 opacity-75 overflow-y-auto max-h-[400px] flex-1 prose-sm prose-gray">
            <ReactMarkdown>{originalContent}</ReactMarkdown>
          </div>
        </div>

        {/* Improved version */}
        <div className="rounded-lg border border-emerald-200 overflow-hidden flex flex-col shadow-md bg-white relative">
          <div className="px-4 py-2.5 bg-emerald-50 border-b border-emerald-200 flex-shrink-0 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                Improved Version
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded text-emerald-600 bg-emerald-100 border border-emerald-200 font-bold ml-1">
                AI Generated
              </span>
            </div>
            {isEditing && (
              <span className="text-[10px] px-2 py-0.5 rounded text-gray-500 bg-white border border-gray-200 font-bold shadow-sm">
                Editing manually
              </span>
            )}
          </div>
          <div className="p-0 overflow-y-auto max-h-[400px] flex-1 flex flex-col relative">
            {isRegenerating && isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Spinner size="md" />
                <span className="ml-2 text-sm text-gray-500">
                  Regenerating…
                </span>
              </div>
            ) : isEditing ? (
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full flex-1 p-5 text-sm font-mono text-gray-800 focus:outline-none resize-none min-h-[300px] bg-emerald-50/30"
                spellCheck={false}
              />
            ) : (
              <div className="p-5 bg-emerald-50/10 h-full prose-sm prose-emerald">
                <ReactMarkdown>{editedContent}</ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-2">
        <button
          type="button"
          onClick={() => {
            onCancel();
          }}
          disabled={isRegenerating}
          className="px-4 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setIsEditing((prev) => !prev);
            }}
            disabled={isRegenerating}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors border border-gray-200 bg-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEditing ? "Done Editing" : "Edit Manually"}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsRegenerating(true);
              onRegenerate();
            }}
            disabled={isRegenerating}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-emerald-700 hover:bg-emerald-100 border border-emerald-200 bg-emerald-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRegenerating ? (
              <Spinner size="sm" />
            ) : (
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            )}
            Regenerate
          </button>

          <button
            type="button"
            onClick={() => {
              onAccept(editedContent);
            }}
            disabled={isRegenerating}
            className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            Accept Changes
          </button>
        </div>
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
              <RefreshCw className="w-4 h-4 mr-1 inline" /> Regenerated
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
            {copied ? "Copied!" : "Copy"}
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
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
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
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onCancel();
          }}
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
  activeSectionId,
  onActionStart,
  disableRegenerate = false,
}: PRDSectionViewProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [action, setAction] = useState<InlineAction>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [improvedContent, setImprovedContent] = useState<string | null>(null);
  const [regeneratedContent, setRegeneratedContent] = useState<string | null>(
    null,
  );
  const regenAttemptRef = useRef(0);
  const panelRef = useRef<HTMLDivElement>(null);

  const showBar = isHovered || action !== null || isAskActive;

  // ── Split content into heading line and body ────────────────────────────────
  const headingLineEnd = content.indexOf("\n");
  const headingMarkdown =
    headingLineEnd !== -1 ? content.slice(0, headingLineEnd + 1) : content;
  const bodyMarkdown =
    headingLineEnd !== -1 ? content.slice(headingLineEnd + 1) : "";

  // ── Single active panel rule ────────────────────────────────────────────────
  useEffect(() => {
    if (
      activeSectionId !== undefined &&
      activeSectionId !== null &&
      activeSectionId !== sectionId &&
      action !== null
    ) {
      setAction(null);
      setImprovedContent(null);
      setRegeneratedContent(null);
      setIsLoading(false);
      regenAttemptRef.current = 0;
    }
  }, [activeSectionId, sectionId]); // intentionally minimal deps to avoid loops

  // ── Scroll panel into view when it opens ────────────────────────────────────
  useEffect(() => {
    if (action !== null && panelRef.current) {
      // Small delay to let the DOM render the panel first
      const timer = setTimeout(() => {
        panelRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [action]);

  // ── Improve ─────────────────────────────────────────────────────────────────

  const lastInstructionRef = useRef<string | null>(null);

  const handleImproveOptions = useCallback(() => {
    onActionStart?.(sectionId);
    setAction("improve_options");
    setImprovedContent(null);
  }, [sectionId, onActionStart]);

  const handleGenerateImprove = useCallback(
    async (instruction: string | null) => {
      setAction("improve_preview");
      setIsLoading(true);
      setImprovedContent(null);
      lastInstructionRef.current = instruction;

      try {
        const res = await fetch("/api/section-improve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            section_heading: heading,
            section_content: content,
            instruction: instruction,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `Request failed: ${res.status}`);
        }

        const data = await res.json();
        setImprovedContent(data.improved_content ?? null);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("[PRDSectionView] improve error:", message);
        onToast("Failed to improve section. Please try again.", "error");
        setAction("improve_options");
      } finally {
        setIsLoading(false);
      }
    },
    [heading, content, onToast],
  );

  // ── Regenerate ──────────────────────────────────────────────────────────────

  const callRegenerate = useCallback(
    async (attempt: number) => {
      setIsLoading(true);
      setRegeneratedContent(null);

      try {
        const res = await fetch("/api/section-regenerate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("[PRDSectionView] regenerate error:", message);
        onToast("Failed to regenerate section. Please try again.", "error");
        if (attempt === 0) setAction(null);
      } finally {
        setIsLoading(false);
      }
    },
    [heading, content, onToast],
  );

  const handleRegenerate = useCallback(() => {
    onActionStart?.(sectionId);
    regenAttemptRef.current = 0;
    setAction("regenerate");
    callRegenerate(0);
  }, [callRegenerate, sectionId, onActionStart]);

  const handleRegenerateAgain = useCallback(() => {
    regenAttemptRef.current += 1;
    callRegenerate(regenAttemptRef.current);
  }, [callRegenerate]);

  // ── Confirm actions ─────────────────────────────────────────────────────────

  const handleReplaceImproved = useCallback(
    (editedContent: string) => {
      if (!editedContent) return;
      onReplace(sectionId, editedContent);
      onToast("Changes applied successfully", "success");
      setAction(null);
      setImprovedContent(null);
      onActionStart?.(null);
    },
    [improvedContent, sectionId, onReplace, onToast, onActionStart],
  );

  const handleAcceptRegenerated = useCallback(() => {
    if (!regeneratedContent) return;
    onReplace(sectionId, regeneratedContent);
    onToast("New version generated", "success");
    setAction(null);
    setRegeneratedContent(null);
    regenAttemptRef.current = 0;
    onActionStart?.(null);
  }, [regeneratedContent, sectionId, onReplace, onToast, onActionStart]);

  const handleCancel = useCallback(() => {
    setAction(null);
    setImprovedContent(null);
    setRegeneratedContent(null);
    setIsLoading(false);
    regenAttemptRef.current = 0;
    onActionStart?.(null);
  }, [onActionStart]);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div
      className={`
        relative rounded-xl transition-all duration-200
        ${
          action !== null
            ? action === "improve_preview" || action === "improve_options"
              ? "ring-1 ring-emerald-200 bg-emerald-50/10"
              : "ring-1 ring-violet-200 bg-violet-50/10"
            : isAskActive
              ? "ring-1 ring-blue-200 bg-blue-50/10"
              : isHovered
                ? "ring-1 ring-gray-200 bg-gray-50/60"
                : ""
        }
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── Heading area with action bar ────────────────────────────────────── */}
      <div className="relative">
        <div className="px-5 pt-5 pb-1">
          <ReactMarkdown>{headingMarkdown}</ReactMarkdown>
        </div>

        {/* Action bar (hover-visible, near heading) */}
        <div
          className={`
            absolute top-3 right-3 z-10 transition-all duration-200
            ${showBar && action === null ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1 pointer-events-none"}
          `}
        >
          <ActionBar
            onAskAI={() => onAskAI(sectionId, heading, content)}
            onImprove={handleImproveOptions}
            onRegenerate={handleRegenerate}
            isAskActive={isAskActive}
            disableRegenerate={disableRegenerate}
          />
        </div>
      </div>

      {/* ── Active action label bar ─────────────────────────────────────────── */}
      {action !== null && action !== "improve_options" && (
        <div
          className={`
            flex items-center justify-between px-4 py-2 mx-5 rounded-lg mb-2
            ${action === "improve_preview" ? "bg-emerald-100/80 border border-emerald-200" : "bg-violet-100/80 border border-violet-200"}
          `}
        >
          <div
            className={`flex items-center gap-2 text-xs font-semibold ${action === "improve_preview" ? "text-emerald-700" : "text-violet-700"}`}
          >
            {action === "improve_preview" ? (
              <ImproveIcon />
            ) : (
              <RegenerateIcon />
            )}
            <span>
              {action === "improve_preview"
                ? "Improving section…"
                : "Regenerating section…"}
            </span>
          </div>
          {!isLoading && (
            <button
              onClick={handleCancel}
              className={`
                text-xs font-medium underline underline-offset-2
                transition-colors
                ${action === "improve_preview" ? "text-emerald-600 hover:text-emerald-800" : "text-violet-600 hover:text-violet-800"}
              `}
            >
              Cancel
            </button>
          )}
        </div>
      )}

      {/* ── Inline panel area (rendered between heading and body) ───────────── */}
      {action !== null && (
        <div
          ref={panelRef}
          className="px-5 transition-all duration-200 ease-in-out"
        >
          {action === "improve_options" && (
            <ImproveOptionsView
              onGenerate={handleGenerateImprove}
              onCancel={handleCancel}
            />
          )}

          {action === "improve_preview" && (
            <ImprovePreviewView
              originalContent={content}
              improvedContent={improvedContent}
              isLoading={isLoading}
              onAccept={handleReplaceImproved}
              onRegenerate={() =>
                handleGenerateImprove(lastInstructionRef.current)
              }
              onCancel={handleCancel}
            />
          )}

          {action === "regenerate" && (
            <RegenerateView
              regeneratedContent={regeneratedContent}
              isLoading={isLoading}
              onAccept={handleAcceptRegenerated}
              onRegenerateAgain={handleRegenerateAgain}
              onCancel={handleCancel}
            />
          )}
        </div>
      )}

      {/* ── Body content ────────────────────────────────────────────────────── */}
      {(action === null || action === "improve_options") &&
        bodyMarkdown.trim() && (
          <div
            className={`
            px-5 pb-5
            ${action === "improve_options" ? "pt-3 opacity-60" : "pt-1"}
            transition-opacity duration-200
          `}
          >
            <ReactMarkdown>{bodyMarkdown}</ReactMarkdown>
          </div>
        )}

      {/* Bottom padding when panel is active and body is hidden */}
      {action !== null && action !== "improve_options" && (
        <div className="pb-5" />
      )}
    </div>
  );
}
