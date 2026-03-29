"use client";
import { AlertTriangle } from "lucide-react";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { fetchProject, deleteProject as apiDeleteProject } from "@/lib/api-client";
import { getStatusLabel, formatDate } from "@/data/mockData";
import { Button, Modal } from "@/components/ui";
import { Project } from "@/types";

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDiscoveryExpanded, setIsDiscoveryExpanded] = useState(false);
  const [isDangerZoneExpanded, setIsDangerZoneExpanded] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    setIsLoading(true);
    fetchProject(projectId)
      .then((p) => {
        setProject(p);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, [projectId]);

  const handleStartWizard = () => {
    router.push(`/project/${projectId}/wizard`);
  };

  const handleGoToStep = (stepIndex: number) => {
    router.push(`/project/${projectId}/wizard?step=${stepIndex}`);
  };

  const handleDelete = async () => {
    try {
      await apiDeleteProject(projectId);
      router.push("/");
    } catch {
      console.error("Failed to delete project");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-none animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center card p-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Project not found
          </h2>
          <p className="text-gray-500 mb-6">
            This project may have been deleted or doesn&apos;t exist.
          </p>
          <Link href="/">
            <Button>Return to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const totalSteps = 7;
  const currentVersion = project.versions.find((v) => v.isCurrent);
  const completedSteps = currentVersion
    ? Object.values(currentVersion.responses).filter((r) => r.isComplete).length
    : 0;
  const completionPercentage = Math.round((completedSteps / totalSteps) * 100);
  const docsGenerated = project.generatedDocuments.length > 0;
  const allDocsGenerated = project.generatedDocuments.length >= 5;
  const prdDoc = project.generatedDocuments.find((d) => d.type === "prd");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 py-2 flex items-center gap-2 text-xs font-medium text-gray-500">
          <Link href="/" className="hover:text-primary-600 transition-colors">
            Projects
          </Link>
          <svg
            className="w-3.5 h-3.5 text-gray-400"
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
          <span className="text-gray-900 truncate">{project.title}</span>
        </div>
      </div>

      <header className="bg-white border-b border-b border-gray-200 relative z-10">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-1.5 tracking-tight">
                {project.title}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-xs">
                <div className="flex items-center gap-1 font-medium text-gray-600">
                  <svg
                    className="w-3.5 h-3.5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                  {currentVersion?.versionNumber || "v1.0"}
                </div>
                <div className="flex items-center gap-1 text-gray-500">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Edited {formatDate(project.updatedAt)}
                </div>
                <span
                  className={`flex items-center gap-1.5 px-2 py-0.5 rounded-none text-[11px] font-bold border ${
                    project.status === "discovery_complete"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : project.status === "documents_generated"
                        ? "bg-purple-50 text-purple-700 border-purple-200"
                        : "bg-blue-50 text-blue-700 border-blue-200"
                  }`}
                >
                  {getStatusLabel(project.status)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {prdDoc && (
                <Button
                  size="sm"
                  onClick={() =>
                    router.push(`/project/${projectId}/documents?type=prd`)
                  }
                  className=""
                >
                  Open PRD
                </Button>
              )}
              <Link href={`/project/${projectId}/settings`}>
                <Button variant="secondary" size="sm" className="bg-white">
                  Settings
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-6 space-y-6">
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900">
              Generated Documents
            </h2>
            {docsGenerated && !allDocsGenerated && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/project/${projectId}/generate`)}
                className="text-primary-600"
              >
                Generate Remaining Documents
              </Button>
            )}
          </div>

          <div className="card overflow-hidden bg-white">
            {project.generatedDocuments.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {project.generatedDocuments.map((doc) => {
                  const isPRD = doc.type === "prd";
                  return (
                    <div
                      key={doc.id}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 hover:bg-gray-50 transition-colors ${
                        isPRD ? "bg-primary-50/20 border-l-2 border-primary-500" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3 sm:mb-0">
                        <div
                          className={`w-8 h-8 rounded-none flex items-center justify-center flex-shrink-0 ${isPRD ? "bg-primary-100" : "bg-gray-100"}`}
                        >
                          <svg
                            className={`w-4 h-4 ${isPRD ? "text-primary-600" : "text-gray-500"}`}
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
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900 text-sm">
                              {doc.title}
                            </h3>
                            {isPRD && (
                              <span className="text-[10px] uppercase font-bold text-primary-600 bg-primary-100 px-1.5 rounded-none">
                                Primary
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] font-medium text-green-700 bg-green-50 px-1.5 py-0.5 rounded-none border border-green-100">
                              Generated
                            </span>
                            <span className="text-xs text-gray-400 font-medium">
                              Exported {doc.exportCount} times
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-3 text-gray-600"
                          onClick={() =>
                            router.push(`/project/${projectId}/generate`)
                          }
                        >
                          Regenerate
                        </Button>
                        <Button
                          size="sm"
                          className="h-8 px-4"
                          onClick={() =>
                            router.push(
                              `/project/${projectId}/documents?type=${doc.type}`,
                            )
                          }
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center bg-gray-50/50">
                <p className="text-gray-500 mb-4 text-sm">
                  You haven&apos;t generated any documents for this project yet.
                </p>
                <Button
                  size="sm"
                  onClick={() => router.push(`/project/${projectId}/generate`)}
                >
                  Generate First Document
                </Button>
              </div>
            )}
          </div>
        </section>

        <section className="card overflow-hidden bg-white">
          <div
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors select-none"
            onClick={() => setIsDiscoveryExpanded(!isDiscoveryExpanded)}
          >
            <div className="flex items-center gap-3">
              <h2 className="text-base font-bold text-gray-900">
                Discovery Progress
              </h2>
              <span className="text-sm text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded-none">
                {completionPercentage === 100
                  ? "Completed (7/7 steps)"
                  : `${completionPercentage}% complete`}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                className="h-7 px-3 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartWizard();
                }}
              >
                Edit Answers
              </Button>
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isDiscoveryExpanded ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          {isDiscoveryExpanded && currentVersion && (
            <div className="p-4 border-t border-gray-100 bg-gray-50/50">
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {Object.entries(currentVersion.responses).map(
                  ([stepId, response], index) => (
                    <button
                      key={stepId}
                      onClick={() => handleGoToStep(index)}
                      title={`Go to step ${index + 1}`}
                      className={`flex flex-col items-center justify-center py-2.5 px-1 transition-all border ${
                        response.isComplete
                          ? "bg-white text-green-700 hover:bg-green-50 border-green-200"
                          : "bg-gray-50 text-gray-400 hover:bg-gray-100 border-gray-200"
                      }`}
                    >
                      <span className="text-sm font-bold mb-0.5">
                        {response.isComplete ? (
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
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        ) : (
                          <span>{index + 1}</span>
                        )}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider font-semibold opacity-70">
                        Step {index + 1}
                      </span>
                    </button>
                  ),
                )}
              </div>
            </div>
          )}
        </section>

        <section className="card border border-red-200 overflow-hidden">
          <div
            className="flex items-center justify-between p-4 bg-red-50/50 cursor-pointer hover:bg-red-50 transition-colors select-none"
            onClick={() => setIsDangerZoneExpanded(!isDangerZoneExpanded)}
          >
            <span className="font-bold text-red-700 text-sm">
              <AlertTriangle className="w-4 h-4 mr-2" /> Danger Zone
            </span>
            <svg
              className={`w-4 h-4 text-red-500 transition-transform duration-200 ${isDangerZoneExpanded ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>

          {isDangerZoneExpanded && (
            <div className="p-4 bg-white border-t border-red-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">
                  Delete Project
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Permanently remove this project, its history, and all
                  generated documents. This action cannot be undone.
                </p>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setIsDeleteModalOpen(true)}
                className="whitespace-nowrap"
              >
                Delete Project
              </Button>
            </div>
          )}
        </section>
      </main>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Project"
      >
        <div className="space-y-4">
          <p className="text-gray-600 text-sm">
            Are you sure you want to delete <strong>{project.title}</strong>?
            All your discovery answers and generated documents will be
            permanently lost.
          </p>
          <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleDelete}>
              Yes, Delete Project
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}