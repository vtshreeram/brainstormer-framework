'use client';

import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { Button, AiSuggestionsPanel, PRDSectionView, SectionAskPanel, MarkdownRenderer } from '@/components/ui';
import { formatMarkdownString } from '@/utils/documentFormatter';

// ─── Section parsing ──────────────────────────────────────────────────────────

interface ParsedSection {
  id: string;
  heading: string;
  /** Full section markdown, including the ## heading line */
  content: string;
  startIndex: number;
  endIndex: number;
}

interface ParsedDocument {
  preamble: string;
  sections: ParsedSection[];
}

function parsePRDSections(content: string): ParsedDocument {
  // Split at each ## heading (lookahead keeps the delimiter in each chunk)
  const parts = content.split(/(?=^##\s)/m);

  const preamble = parts[0] ?? '';
  const sections: ParsedSection[] = [];
  let offset = preamble.length;

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    const firstLine = part.split('\n')[0];
    const heading = firstLine.replace(/^##\s+/, '').trim();
    const sanitized = heading
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    sections.push({
      id: `sec-${i}-${sanitized}`,
      heading,
      content: part,
      startIndex: offset,
      endIndex: offset + part.length,
    });

    offset += part.length;
  }

  return { preamble, sections };
}

// ─── Page component ───────────────────────────────────────────────────────────

export default function DocumentsPage() {
  const params = useParams();
  const projectId = params.id as string;

  const {
    projects,
    setCurrentProject,
    aiSuggestions,
    isLoadingSuggestions,
    fetchAiSuggestions,
    acceptSuggestedMetrics,
    updateGeneratedDocument,
    clearAiSuggestions,
    addToast,
  } = useStore();

  const project = projects.find((p) => p.id === projectId);

  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  /** Tracks which Ask AI panel is open (null = closed) */
  const [askPanel, setAskPanel] = useState<{
    sectionId: string;
    heading: string;
    content: string;
  } | null>(null);

  // Track which doc IDs we've already auto-triggered for, so we don't repeat
  const autoTriggeredRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (projectId) setCurrentProject(projectId);
  }, [projectId, setCurrentProject]);

  useEffect(() => {
    if (project?.generatedDocuments.length && !selectedDocId) {
      setSelectedDocId(project.generatedDocuments[0].id);
    }
  }, [project, selectedDocId]);

  const selectedDoc = project?.generatedDocuments.find(
    (d) => d.id === selectedDocId,
  );

  // Auto-trigger AI suggestions whenever a PRD is opened for the first time
  useEffect(() => {
    if (!selectedDoc || selectedDoc.type !== 'prd') return;
    if (autoTriggeredRef.current.has(selectedDoc.id)) return;

    autoTriggeredRef.current.add(selectedDoc.id);
    setShowSuggestions(false); // Do not auto-open the modal, just fetch in background

    const currentVersion = project?.versions.find((v) => v.isCurrent);
    const userMetrics = currentVersion?.responses?.['step_7']?.answer;

    fetchAiSuggestions(selectedDoc.id, selectedDoc.content, userMetrics);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDoc?.id]);

  // ── Parse sections (only for PRD) ───────────────────────────────────────────
  const parsedSections = useMemo<ParsedDocument | null>(() => {
    if (!selectedDoc || selectedDoc.type !== 'prd') return null;
    return parsePRDSections(selectedDoc.content);
  }, [selectedDoc?.id, selectedDoc?.content]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleCopyMarkdown = (docId: string, content: string) => {
    navigator.clipboard.writeText(formatMarkdownString(content));
    setCopiedId(docId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = (filename: string, content: string) => {
    const formattedContent = formatMarkdownString(content);
    const blob = new Blob([formattedContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleGetSuggestions = useCallback(() => {
    if (!selectedDoc) return;
    setShowSuggestions(true);

    const currentVersion = project?.versions.find((v) => v.isCurrent);
    const userMetrics = currentVersion?.responses?.['step_7']?.answer;

    fetchAiSuggestions(selectedDoc.id, selectedDoc.content, userMetrics);
  }, [selectedDoc, project, fetchAiSuggestions]);

  const handleDismissSuggestions = () => {
    setShowSuggestions(false);
  };

  const handleRefetch = useCallback(() => {
    if (!selectedDoc) return;
    const currentVersion = project?.versions.find((v) => v.isCurrent);
    const userMetrics = currentVersion?.responses?.['step_7']?.answer;
    fetchAiSuggestions(selectedDoc.id, selectedDoc.content, userMetrics);
  }, [selectedDoc, project, fetchAiSuggestions]);

  /**
   * Accept metrics — appends the suggested metrics as a new sub-section
   * so the user's original metrics are preserved alongside the AI ones.
   */
  const handleAcceptMetrics = useCallback(
    (metrics: string[]) => {
      if (!selectedDoc || !project) return;

      const formatted = metrics.map((m) => `- ${m}`).join('\n');

      const metricsRegex =
        /(##\s+Success Metrics)([\s\S]*?)(?=\n##\s|\n#\s|$)/;
      const match = selectedDoc.content.match(metricsRegex);

      let updatedContent: string;

      if (match) {
        updatedContent = selectedDoc.content.replace(
          metricsRegex,
          (_full, heading, body) =>
            `${heading}${body.trimEnd()}\n\n### AI-Suggested Metrics\n\n${formatted}\n`,
        );
      } else {
        updatedContent =
          selectedDoc.content.trimEnd() +
          `\n\n## Success Metrics\n\n### AI-Suggested Metrics\n\n${formatted}\n`;
      }

      updateGeneratedDocument(projectId, selectedDoc.id, updatedContent);
    },
    [selectedDoc, project, projectId, updateGeneratedDocument],
  );

  /**
   * Replace metrics — overwrites the entire Success Metrics section
   * with the selected AI-suggested metrics.
   */
  const handleReplaceMetrics = useCallback(
    (metrics: string[]) => {
      if (!selectedDoc || !project) return;
      acceptSuggestedMetrics(projectId, selectedDoc.id, metrics);
    },
    [selectedDoc, project, projectId, acceptSuggestedMetrics],
  );

  // ── Section-level AI action handlers ────────────────────────────────────────

  /** Opens the Ask AI side panel for a specific section */
  const handleAskAI = useCallback(
    (sectionId: string, heading: string, content: string) => {
      setAskPanel((prev) =>
        prev?.sectionId === sectionId
          ? null // toggle off if same section clicked again
          : { sectionId, heading, content },
      );
    },
    [],
  );

  /** Replaces the content of a single PRD section */
  const handleSectionReplace = useCallback(
    (sectionId: string, newContent: string) => {
      if (!selectedDoc || !parsedSections) return;

      const section = parsedSections.sections.find((s) => s.id === sectionId);
      if (!section) return;

      const updatedContent =
        selectedDoc.content.slice(0, section.startIndex) +
        newContent +
        selectedDoc.content.slice(section.endIndex);

      updateGeneratedDocument(projectId, selectedDoc.id, updatedContent);
    },
    [selectedDoc, parsedSections, projectId, updateGeneratedDocument],
  );

  /** Forwards a toast from a section component to the global toast system */
  const handleSectionToast = useCallback(
    (message: string, type: 'success' | 'info' | 'error') => {
      addToast({ message, type: type === 'info' ? 'info' : type });
    },
    [addToast],
  );

  // ── Labels / icons ────────────────────────────────────────────────────────────

  const typeLabels: Record<string, string> = {
    prd: 'Product Requirements Document',
    architecture: 'Technical Architecture',
    user_stories: 'User Stories',
    api_spec: 'API Specifications',
    roadmap: 'Implementation Roadmap',
  };

  const typeIcons: Record<string, string> = {
    prd: '📋',
    architecture: '🏗️',
    user_stories: '📝',
    api_spec: '🔗',
    roadmap: '🗺️',
  };

  // ── Early return ──────────────────────────────────────────────────────────────

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading documents…</p>
        </div>
      </div>
    );
  }

  const currentDocSuggestions =
    selectedDocId ? (aiSuggestions[selectedDocId] ?? null) : null;

  const isPRD = selectedDoc?.type === 'prd';
  const suggestionsVisible = isPRD && showSuggestions;

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* ── Top bar ── */}
      <header className="bg-white border-b flex-shrink-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              href={`/project/${projectId}`}
              className="text-gray-500 hover:text-gray-700 transition-colors"
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
              <h1 className="text-lg font-semibold text-gray-900">Documents</h1>
              <p className="text-sm text-gray-500">{project.title}</p>
            </div>
          </div>
        </div>
      </header>

      {/* ── Layout ── */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-6 pt-6 overflow-hidden">
        <div className="grid grid-cols-12 gap-6 h-full">

          {/* ── Sidebar ── */}
          <div className="col-span-3 h-full overflow-y-auto pb-6 pr-1">
            <div className="card p-4">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">
                Generated Documents
              </h2>

              <div className="space-y-2">
                {project.generatedDocuments.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => {
                      setSelectedDocId(doc.id);
                      setAskPanel(null);
                      if (doc.id !== selectedDocId) {
                        setShowSuggestions(doc.type === 'prd');
                      }
                    }}
                    className={`
                      w-full p-3 rounded-lg text-left transition-colors
                      ${
                        selectedDocId === doc.id
                          ? 'bg-primary-100 text-primary-700'
                          : 'hover:bg-gray-100'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <span>{typeIcons[doc.type]}</span>
                      <span className="text-sm font-medium truncate">
                        {typeLabels[doc.type]}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Exported {doc.exportCount} times
                    </p>

                    {doc.type === 'prd' && aiSuggestions[doc.id] && (
                      <span className="inline-flex items-center gap-1 mt-1.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-violet-100 text-violet-700 border border-violet-200">
                        <svg
                          className="w-2.5 h-2.5"
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
                        AI insights ready
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t">
                <Link href={`/project/${projectId}/generate`}>
                  <Button variant="secondary" size="sm" className="w-full">
                    Regenerate
                  </Button>
                </Link>
              </div>
            </div>

            {/* ── PRD tip card ── */}
            {isPRD && (
              <div className="mt-4 p-3 rounded-lg bg-violet-50 border border-violet-200">
                <p className="text-xs text-violet-700 font-medium mb-1 flex items-center gap-1">
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
                  AI suggestions available
                </p>
                <p className="text-xs text-violet-600 leading-relaxed">
                  Get AI-powered metrics and product improvement ideas tailored
                  to your PRD.
                </p>
                <button
                  onClick={() => {
                    if (!currentDocSuggestions) {
                      handleGetSuggestions();
                    } else {
                      setShowSuggestions(true);
                    }
                  }}
                  className="mt-2 text-xs font-medium text-violet-700 underline underline-offset-2 hover:text-violet-900 transition-colors"
                >
                  View suggestions →
                </button>
              </div>
            )}

            {/* ── Section AI hint (PRD only) ── */}
            {isPRD && parsedSections && parsedSections.sections.length > 0 && (
              <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
                <p className="text-xs text-blue-700 font-medium mb-1 flex items-center gap-1">
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
                  Section AI actions
                </p>
                <p className="text-xs text-blue-600 leading-relaxed">
                  Hover over any section to{' '}
                  <strong>Ask AI</strong>,{' '}
                  <strong>Improve</strong>, or{' '}
                  <strong>Regenerate</strong> it individually.
                </p>
              </div>
            )}
          </div>

          {/* ── Main content ── */}
          <div className="col-span-9 h-full overflow-y-auto pb-6 pr-2 space-y-5">
            {selectedDoc ? (
              <>
                {/* ── Document viewer card ── */}
                <div className="card">
                  {/* Doc header */}
                  <div className="px-6 py-4 border-b flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {typeIcons[selectedDoc.type]}
                      </span>
                      <div>
                        <h2 className="font-semibold text-gray-900">
                          {typeLabels[selectedDoc.type]}
                        </h2>
                        <p className="text-sm text-gray-500">
                          Generated{' '}
                          {new Date(selectedDoc.generatedAt).toLocaleDateString(
                            'en-US',
                            {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            },
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Get AI Suggestions — only for PRD */}
                      {isPRD && (
                        <Button
                          size="sm"
                          onClick={() => {
                            if (!currentDocSuggestions) {
                              handleGetSuggestions();
                            } else {
                              setShowSuggestions(true);
                            }
                          }}
                          isLoading={isLoadingSuggestions}
                          className="
                            !bg-violet-600 !text-white hover:!bg-violet-700
                            focus:!ring-violet-500
                          "
                        >
                          {!isLoadingSuggestions && (
                            <svg
                              className="w-4 h-4 mr-1.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.75}
                                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                              />
                            </svg>
                          )}
                          {isLoadingSuggestions
                            ? 'Analysing PRD…'
                            : currentDocSuggestions
                            ? 'View AI Suggestions'
                            : 'Get AI Suggestions'}
                        </Button>
                      )}

                      {/* Copy Markdown */}
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          handleCopyMarkdown(
                            selectedDoc.id,
                            selectedDoc.content,
                          )
                        }
                      >
                        {copiedId === selectedDoc.id ? (
                          <>
                            <svg
                              className="w-4 h-4 mr-1"
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
                            Copied!
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                            Copy Markdown
                          </>
                        )}
                      </Button>

                      {/* Download */}
                      <Button
                        size="sm"
                        onClick={() =>
                          handleDownload(
                            selectedDoc.title
                              .toLowerCase()
                              .replace(/\s+/g, '-'),
                            selectedDoc.content,
                          )
                        }
                      >
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                        Download
                      </Button>
                    </div>
                  </div>

                  {/* ── Document content ── */}
                  {isPRD && parsedSections ? (
                    /* PRD: render each ## section with its own AI action bar */
                    <div className="px-6 pb-6 pt-4">
                      {/* Preamble (# title, intro text before first ## section) */}
                      {parsedSections.preamble.trim() && (
                        <div className="mb-4 pb-4 border-b border-gray-100">
                          <MarkdownRenderer>
                            {parsedSections.preamble}
                          </MarkdownRenderer>
                        </div>
                      )}

                      {/* Sections */}
                      {parsedSections.sections.length > 0 ? (
                        <div className="space-y-1">
                          {parsedSections.sections.map((section) => (
                            <PRDSectionView
                              key={section.id}
                              sectionId={section.id}
                              heading={section.heading}
                              content={formatMarkdownString(section.content)}
                              onAskAI={handleAskAI}
                              onReplace={handleSectionReplace}
                              onToast={handleSectionToast}
                              isAskActive={askPanel?.sectionId === section.id}
                            />
                          ))}
                        </div>
                      ) : (
                        /* Fallback if no ## sections found */
                        <div>
                          <MarkdownRenderer>{selectedDoc.content}</MarkdownRenderer>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Non-PRD: plain markdown render */
                    <div className="p-6">
                      <MarkdownRenderer>{selectedDoc.content}</MarkdownRenderer>
                    </div>
                  )}
                </div>

                {/* ── AI Suggestions Panel — only for PRD ── */}
                {suggestionsVisible && (
                  <AiSuggestionsPanel
                    suggestions={currentDocSuggestions}
                    isLoading={isLoadingSuggestions}
                    onDismiss={handleDismissSuggestions}
                    onRefetch={handleRefetch}
                  />
                )}
              </>
            ) : (
              /* ── Empty state ── */
              <div className="card p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  No documents yet
                </h2>
                <p className="text-gray-500 mb-6">
                  Complete the discovery wizard and generate your first
                  documents
                </p>
                <Link href={`/project/${projectId}/wizard`}>
                  <Button>Start Discovery</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Ask AI side panel (rendered at root level, fixed position) ── */}
      {askPanel && (
        <SectionAskPanel
          sectionTitle={askPanel.heading}
          sectionContent={askPanel.content}
          onClose={() => setAskPanel(null)}
        />
      )}
    </div>
  );
}
