"use client";

import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import Link from "next/link";
import { FileText, LayoutTemplate, PenTool, Link2, Map } from "lucide-react";
import { useParams } from "next/navigation";
import {
  fetchProject,
  updateDocumentContent,
  recordExport,
  generateDocumentWithAI,
  createDocument,
} from "@/lib/api-client";
import {
  Button,
  AiSuggestionsPanel,
  PRDSectionView,
  SectionAskPanel,
  MarkdownRenderer,
} from "@/components/ui";
import { formatMarkdownString } from "@/utils/documentFormatter";
import { DocumentType, Project, GeneratedDocument } from "@/types";

interface ParsedSection {
  id: string;
  heading: string;
  content: string;
  startIndex: number;
  endIndex: number;
}

interface ParsedDocument {
  preamble: string;
  sections: ParsedSection[];
}

interface AiSuggestion {
  title: string;
  description: string;
  impact?: string;
  effort?: string;
  category?: string;
}

interface AiSuggestionsResult {
  metrics: string[];
  suggestions: AiSuggestion[];
}

function parseDocumentSections(content: string): ParsedDocument {
  const parts = content.split(/(?=^##\s)/m);
  const preamble = parts[0] ?? "";
  const sections: ParsedSection[] = [];
  let offset = preamble.length;

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    const firstLine = part.split("\n")[0];
    const heading = firstLine.replace(/^##\s+/, "").trim();
    const sanitized = heading
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

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

export default function DocumentsPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [isLoadingProject, setIsLoadingProject] = useState(true);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<Record<string, AiSuggestionsResult>>({});
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [generatingTypes, setGeneratingTypes] = useState<Set<DocumentType>>(new Set());
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);

  const autoTriggeredRef = useRef<Set<string>>(new Set());

  const fetchProjectData = useCallback(() => {
    if (!projectId) return;
    setIsLoadingProject(true);
    fetchProject(projectId)
      .then((p) => {
        setProject(p);
        if (p.generatedDocuments.length > 0 && !selectedDocId) {
          setSelectedDocId(p.generatedDocuments[0].id);
        }
        setIsLoadingProject(false);
      })
      .catch(() => {
        setIsLoadingProject(false);
      });
  }, [projectId, selectedDocId]);

  useEffect(() => {
    fetchProjectData();
  }, [fetchProjectData]);

  useEffect(() => {
    if (selectedDocId && project && !autoTriggeredRef.current.has(selectedDocId)) {
      const doc = project.generatedDocuments.find((d) => d.id === selectedDocId);
      if (doc) {
        autoTriggeredRef.current.add(selectedDocId);
        const currentVersion = project.versions.find((v) => v.isCurrent);
        const userMetrics = currentVersion?.responses?.["step_7"]?.answer;
        loadAiSuggestions(selectedDocId, doc.content, userMetrics, doc.type);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDocId, project?.generatedDocuments]);

  const loadAiSuggestions = useCallback(
    async (docId: string, content: string, userMetrics?: string, docType?: string) => {
      setIsLoadingSuggestions(true);
      try {
        const res = await fetch("/api/ai-suggestions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prd_content: content,
            user_metrics: userMetrics,
            doc_type: docType,
          }),
        });
        if (res.ok) {
          const result: AiSuggestionsResult = await res.json();
          setAiSuggestions((prev) => ({ ...prev, [docId]: result }));
        }
      } catch (e) {
        console.error("Failed to load AI suggestions:", e);
      } finally {
        setIsLoadingSuggestions(false);
      }
    },
    [],
  );

  const allDocumentTypes: { type: DocumentType; icon: React.ReactNode; label: string }[] = [
    { type: "prd", icon: <FileText className="w-4 h-4" />, label: "Product Requirements Document" },
    { type: "architecture", icon: <LayoutTemplate className="w-4 h-4" />, label: "Technical Architecture" },
    { type: "user_stories", icon: <PenTool className="w-4 h-4" />, label: "User Stories & Acceptance Criteria" },
    { type: "api_spec", icon: <Link2 className="w-4 h-4" />, label: "API Specifications" },
    { type: "roadmap", icon: <Map className="w-4 h-4" />, label: "Implementation Roadmap" },
  ];

  const generatedTypes = useMemo(
    () => new Set<DocumentType>(project?.generatedDocuments.map((d) => d.type as DocumentType) ?? []),
    [project?.generatedDocuments],
  );

  const availableDocTypes = useMemo(
    () => allDocumentTypes.filter((dt) => !generatedTypes.has(dt.type)),
    [generatedTypes],
  );

  const handleGenerateSingle = useCallback(
    async (docType: DocumentType) => {
      if (!project) return;
      setGeneratingTypes((prev) => new Set(prev).add(docType));

      try {
        const currentVersion = project.versions.find((v) => v.isCurrent);
        const result = await generateDocumentWithAI(
          projectId,
          docType,
          project.title,
          currentVersion?.responses || {},
        );
        await createDocument(projectId, docType, result.title, result.content, result.promptVersion, result.modelId);
        await fetchProjectData();
        const newDoc = project.generatedDocuments.find((d) => d.type === docType);
        if (newDoc) {
          setSelectedDocId(newDoc.id);
        }
      } catch (e) {
        console.error("Failed to generate document:", e);
      } finally {
        setGeneratingTypes((prev) => {
          const next = new Set(prev);
          next.delete(docType);
          return next;
        });
      }
    },
    [project, projectId, fetchProjectData],
  );

  const handleGenerateAll = useCallback(async () => {
    if (availableDocTypes.length === 0 || !project) return;
    setIsGeneratingAll(true);

    for (const dt of availableDocTypes) {
      setGeneratingTypes((prev) => new Set(prev).add(dt.type));
      try {
        const currentVersion = project.versions.find((v) => v.isCurrent);
        const result = await generateDocumentWithAI(
          projectId,
          dt.type,
          project.title,
          currentVersion?.responses || {},
        );
        await createDocument(projectId, dt.type, result.title, result.content, result.promptVersion, result.modelId);
        await fetchProjectData();
      } catch (e) {
        console.error(`Failed to generate ${dt.type}:`, e);
      }
      setGeneratingTypes((prev) => {
        const next = new Set(prev);
        next.delete(dt.type);
        return next;
      });
    }

    setIsGeneratingAll(false);
  }, [availableDocTypes, project, projectId, fetchProjectData]);

  const [askPanel, setAskPanel] = useState<{
    sectionId: string;
    heading: string;
    content: string;
  } | null>(null);

  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  const selectedDoc = project?.generatedDocuments.find((d) => d.id === selectedDocId);

  const typeLabels: Record<string, string> = {
    prd: "Product Requirements Document",
    architecture: "Technical Architecture",
    user_stories: "User Stories",
    api_spec: "API Specifications",
    roadmap: "Implementation Roadmap",
  };

  const typeIcons: Record<string, React.ReactNode> = {
    prd: <FileText className="w-4 h-4" />,
    architecture: <LayoutTemplate className="w-4 h-4" />,
    user_stories: <PenTool className="w-4 h-4" />,
    api_spec: <Link2 className="w-4 h-4" />,
    roadmap: <Map className="w-4 h-4" />,
  };

  const parsedSections = useMemo<ParsedDocument | null>(() => {
    if (!selectedDoc) return null;
    return parseDocumentSections(selectedDoc.content);
  }, [selectedDoc?.id, selectedDoc?.content]);

  const handleCopyMarkdown = useCallback(
    async (docId: string, content: string) => {
      await navigator.clipboard.writeText(formatMarkdownString(content));
      setCopiedId(docId);
      setTimeout(() => setCopiedId(null), 2000);
      try {
        await recordExport(projectId, selectedDoc?.type as DocumentType);
        setProject((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            generatedDocuments: prev.generatedDocuments.map((d) =>
              d.id === docId ? { ...d, exportCount: d.exportCount + 1 } : d,
            ),
          };
        });
      } catch (e) {
        console.error("Failed to record export:", e);
      }
    },
    [projectId, selectedDoc?.type],
  );

  const handleDownload = useCallback(
    async (filename: string, content: string, docId: string) => {
      const formattedContent = formatMarkdownString(content);
      const blob = new Blob([formattedContent], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}.md`;
      a.click();
      URL.revokeObjectURL(url);
      try {
        await recordExport(projectId, selectedDoc?.type as DocumentType);
        setProject((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            generatedDocuments: prev.generatedDocuments.map((d) =>
              d.id === docId ? { ...d, exportCount: d.exportCount + 1 } : d,
            ),
          };
        });
      } catch (e) {
        console.error("Failed to record export:", e);
      }
    },
    [projectId, selectedDoc?.type],
  );

  const handleGetSuggestions = useCallback(() => {
    if (!selectedDoc || !project) return;
    setShowSuggestions(true);
    const currentVersion = project.versions.find((v) => v.isCurrent);
    const userMetrics = currentVersion?.responses?.["step_7"]?.answer;
    loadAiSuggestions(selectedDoc.id, selectedDoc.content, userMetrics, selectedDoc.type);
  }, [selectedDoc, project, loadAiSuggestions]);

  const handleDismissSuggestions = () => {
    setShowSuggestions(false);
  };

  const handleRefetch = useCallback(() => {
    if (!selectedDoc || !project) return;
    const currentVersion = project.versions.find((v) => v.isCurrent);
    const userMetrics = currentVersion?.responses?.["step_7"]?.answer;
    loadAiSuggestions(selectedDoc.id, selectedDoc.content, userMetrics, selectedDoc.type);
  }, [selectedDoc, project, loadAiSuggestions]);

  const handleAddSuggestionToDoc = useCallback(
    async (suggestion: { title: string; description: string }) => {
      if (!selectedDoc || !project) return;
      const insertion = `\n- **${suggestion.title}**: ${suggestion.description}\n`;
      const updatedContent = selectedDoc.content + insertion;
      try {
        await updateDocumentContent(projectId, selectedDoc.id, updatedContent);
        setProject((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            generatedDocuments: prev.generatedDocuments.map((d) =>
              d.id === selectedDoc.id ? { ...d, content: updatedContent } : d,
            ),
          };
        });
      } catch (e) {
        console.error("Failed to update document:", e);
      }
    },
    [selectedDoc, project, projectId],
  );

  const handleAcceptMetrics = useCallback(
    async (metrics: string[]) => {
      if (!selectedDoc || !project) return;
      const formatted = metrics.map((m) => `- ${m}`).join("\n");
      const metricsRegex = /(##\s+Success Metrics)([\s\S]*?)(?=\n##\s|\n#\s|$)/;
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

      try {
        await updateDocumentContent(projectId, selectedDoc.id, updatedContent);
        setProject((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            generatedDocuments: prev.generatedDocuments.map((d) =>
              d.id === selectedDoc.id ? { ...d, content: updatedContent } : d,
            ),
          };
        });
      } catch (e) {
        console.error("Failed to update document:", e);
      }
    },
    [selectedDoc, project, projectId],
  );

  const handleAskAI = useCallback(
    (sectionId: string, heading: string, content: string) => {
      setAskPanel((prev) =>
        prev?.sectionId === sectionId
          ? null
          : { sectionId, heading, content },
      );
    },
    [],
  );

  const handleSectionReplace = useCallback(
    async (sectionId: string, newContent: string) => {
      if (!selectedDoc || !parsedSections) return;
      const section = parsedSections.sections.find((s) => s.id === sectionId);
      if (!section) return;

      const updatedContent =
        selectedDoc.content.slice(0, section.startIndex) +
        newContent +
        selectedDoc.content.slice(section.endIndex);

      try {
        await updateDocumentContent(projectId, selectedDoc.id, updatedContent);
        setProject((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            generatedDocuments: prev.generatedDocuments.map((d) =>
              d.id === selectedDoc.id ? { ...d, content: updatedContent } : d,
            ),
          };
        });
      } catch (e) {
        console.error("Failed to update section:", e);
      }
    },
    [selectedDoc, parsedSections, projectId],
  );

  const handleSectionToast = useCallback(
    (message: string, type: "success" | "info" | "error") => {
      console.log(`[toast ${type}]`, message);
    },
    [],
  );

  const handleSectionActionStart = useCallback((sectionId: string | null) => {
    setActiveSectionId(sectionId);
  }, []);

  const hasAvailableDocs = availableDocTypes.length > 0;

  if (isLoadingProject) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading documents…</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Project not found</p>
      </div>
    );
  }

  const currentDocSuggestions = selectedDocId ? (aiSuggestions[selectedDocId] ?? null) : null;
  const suggestionsVisible = showSuggestions;

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <header className="bg-white border-b flex-shrink-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              href={`/project/${projectId}`}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Documents</h1>
              <p className="text-sm text-gray-500">{project.title}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 w-full max-w-7xl mx-auto px-6 pt-6 overflow-hidden">
        <div className="grid grid-cols-12 gap-6 h-full">
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
                        setShowSuggestions(false);
                      }
                    }}
                    className={`w-full p-3 text-left transition-colors border-l-2 ${
                      selectedDocId === doc.id
                        ? "bg-white border-l-primary-600 text-primary-700"
                        : "border-l-transparent hover:bg-gray-100 hover:border-l-gray-300"
                    }`}
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
                    {aiSuggestions[doc.id] && (
                      <span className="inline-flex items-center gap-1 mt-1.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-violet-100 text-violet-700 border border-violet-200">
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

              {hasAvailableDocs ? (
                <div className="mt-5 pt-4 border-t">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold text-gray-700">
                      Available Documents
                    </h2>
                    {availableDocTypes.length > 1 && (
                      <button
                        onClick={handleGenerateAll}
                        disabled={isGeneratingAll}
                        className="text-xs font-medium text-primary-600 hover:text-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isGeneratingAll ? "Generating…" : "Generate All"}
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    {availableDocTypes.map(({ type, icon, label }) => {
                      const isLoading = generatingTypes.has(type);
                      return (
                        <div
                          key={type}
                          className="w-full p-3 border border-dashed border-gray-300 bg-gray-50"
                        >
                          <div className="flex items-center gap-2">
                            <span className="opacity-60">{icon}</span>
                            <span className="text-sm font-medium text-gray-500 truncate flex-1">
                              {label}
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-400">
                              Not Generated
                            </span>
                            <button
                              onClick={() => handleGenerateSingle(type)}
                              disabled={isLoading || isGeneratingAll}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                              {isLoading ? (
                                <>
                                  <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Generating…
                                </>
                              ) : (
                                <>
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                  </svg>
                                  Generate
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : project.generatedDocuments.length > 0 ? (
                <div className="mt-5 pt-4 border-t">
                  <p className="text-xs text-gray-400 text-center py-2 flex items-center justify-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    All documents generated
                  </p>
                </div>
              ) : null}
            </div>

            <div className="mt-4 p-3 bg-primary-10 border-l-4 border-l-primary-600">
              <p className="text-xs text-primary-700 font-medium mb-1 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                AI suggestions available
              </p>
              <p className="text-xs text-primary-600 leading-relaxed">
                Get AI-powered insights tailored to this document.
              </p>
              <button
                onClick={() => {
                  if (!currentDocSuggestions) {
                    handleGetSuggestions();
                  } else {
                    setShowSuggestions(true);
                  }
                }}
                className="mt-2 text-xs font-medium text-primary-700 underline underline-offset-2 hover:text-primary-900 transition-colors"
              >
                View suggestions →
              </button>
            </div>

            {parsedSections && parsedSections.sections.length > 0 && (
              <div className="mt-4 p-3 bg-gray-100 border-l-4 border-l-gray-500">
                <p className="text-xs text-gray-700 font-medium mb-1 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Section AI actions
                </p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Hover over any section to <strong>Ask AI</strong>,{" "}
                  <strong>Improve</strong>, or <strong>Regenerate</strong> it individually.
                </p>
              </div>
            )}
          </div>

          <div className="col-span-9 h-full overflow-y-auto pb-6 pr-2 space-y-5">
            {selectedDoc ? (
              <>
                <div className="card">
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
                          Generated{" "}
                          {new Date(selectedDoc.generatedAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
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
                        className="!bg-violet-600 !text-white hover:!bg-violet-700 focus:!ring-violet-500"
                      >
                        {!isLoadingSuggestions && (
                          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                          </svg>
                        )}
                        {isLoadingSuggestions
                          ? "Analysing Document…"
                          : currentDocSuggestions
                            ? "View AI Suggestions"
                            : "Get AI Suggestions"}
                      </Button>

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleCopyMarkdown(selectedDoc.id, selectedDoc.content)}
                      >
                        {copiedId === selectedDoc.id ? (
                          <>
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Copied!
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Copy Markdown
                          </>
                        )}
                      </Button>

                      <Button
                        size="sm"
                        onClick={() =>
                          handleDownload(
                            selectedDoc.title.toLowerCase().replace(/\s+/g, "-"),
                            selectedDoc.content,
                            selectedDoc.id,
                          )
                        }
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download
                      </Button>
                    </div>
                  </div>

                  {parsedSections ? (
                    <div className="px-6 pb-6 pt-4">
                      {parsedSections.preamble.trim() && (
                        <div className="mb-4 pb-4 border-b border-gray-100">
                          <MarkdownRenderer>
                            {parsedSections.preamble}
                          </MarkdownRenderer>
                        </div>
                      )}

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
                              activeSectionId={activeSectionId}
                              onActionStart={handleSectionActionStart}
                              disableRegenerate={selectedDoc?.type !== "prd"}
                            />
                          ))}
                        </div>
                      ) : (
                        <div>
                          <MarkdownRenderer>
                            {selectedDoc.content}
                          </MarkdownRenderer>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-6">
                      <MarkdownRenderer>{selectedDoc.content}</MarkdownRenderer>
                    </div>
                  )}
                </div>

                {suggestionsVisible && (
                  <AiSuggestionsPanel
                    suggestions={currentDocSuggestions}
                    isLoading={isLoadingSuggestions}
                    onDismiss={handleDismissSuggestions}
                    onRefetch={handleRefetch}
                    onAddToDocument={handleAddSuggestionToDoc}
                    docTypeLabel={selectedDoc ? (typeLabels[selectedDoc.type] ?? "Document") : "Document"}
                  />
                )}
              </>
            ) : (
              <div className="card p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  No documents yet
                </h2>
                <p className="text-gray-500 mb-6">
                  Complete the discovery wizard and generate your first documents
                </p>
                <Link href={`/project/${projectId}/wizard`}>
                  <Button>Start Discovery</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

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