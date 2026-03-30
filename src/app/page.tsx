"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useStore } from "@/store/useStore";
import { fetchProjects, createProject as apiCreateProject, deleteProject as apiDeleteProject } from "@/lib/api-client";
import { formatDate } from "@/data/mockData";
import { Button, Modal } from "@/components/ui";
import { Project } from "@/types";

const TOTAL_DOCS = 5;

const SearchBar = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) => (
  <div className="relative w-full md:w-96">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>
    <input
      type="text"
      placeholder="Search projects..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full pl-10 pr-4 py-2 border-0 border-b-2 border-b-gray-300 bg-gray-50 focus:outline-none focus:border-b-primary-600 focus:bg-white transition-all text-sm text-gray-900 placeholder-gray-500"
    />
  </div>
);

const FilterTabs = ({
  activeFilter,
  onFilterChange,
}: {
  activeFilter: string;
  onFilterChange: (f: string) => void;
}) => {
  const filters = ["All", "Recently Edited", "In Progress", "Completed"];
  return (
    <div className="flex items-center space-x-1 overflow-x-auto hide-scrollbar border-b border-gray-200 w-full md:w-auto">
      {filters.map((filter) => (
        <button
          key={filter}
          onClick={() => onFilterChange(filter)}
          className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors duration-200 ${
            activeFilter === filter
              ? "border-primary-600 text-primary-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          {filter}
        </button>
      ))}
    </div>
  );
};

const ProjectCard = ({
  project,
  isMostRecent,
  onOpenProject,
  onDeleteProject,
}: {
  project: Project;
  isMostRecent: boolean;
  onOpenProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
}) => {
  const generatedDocsCount = project.generatedDocuments?.length || 0;
  const isCompleted = project.status === "documents_generated" || generatedDocsCount === TOTAL_DOCS;
  const statusLabel = isCompleted ? "Completed" : "In Progress";
  const progressPercentage = Math.min((generatedDocsCount / TOTAL_DOCS) * 100, 100);

  const handleAction = (e: React.MouseEvent, path: string) => {
    e.stopPropagation();
    window.location.href = path;
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this project?")) {
      onDeleteProject(project.id);
    }
  };

  return (
    <div
      onClick={() => onOpenProject(project.id)}
      className={`group relative bg-white p-5 cursor-pointer transition-colors duration-150 border ${
        isMostRecent ? "border-primary-600 border-l-4 border-l-primary-600" : "border-gray-200 hover:border-primary-600"
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 bg-primary-10 flex items-center justify-center flex-shrink-0 border border-primary-20">
            <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div className="min-w-0 pr-4">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-700 transition-colors truncate">
              {project.title}
            </h3>
            {project.description && (
              <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{project.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-gray-200 p-0.5 z-10" onClick={(e) => e.stopPropagation()}>
          <button title="View Dashboard" onClick={(e) => handleAction(e, `/project/${project.id}`)} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button title="Edit Wizard" onClick={(e) => handleAction(e, `/project/${project.id}/wizard`)} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button title="Open PRD" onClick={(e) => handleAction(e, `/project/${project.id}/documents?type=prd`)} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
          <button title="Settings" onClick={(e) => handleAction(e, `/project/${project.id}/settings`)} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <div className="w-px h-4 bg-gray-200 mx-1"></div>
          <button title="Delete" onClick={handleDelete} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <span className={`text-xs font-semibold px-2 py-0.5 border ${isCompleted ? "bg-green-50 text-green-700 border-green-200" : "bg-blue-50 text-blue-700 border-blue-200"}`}>
          {statusLabel}
        </span>
        <div className="flex items-center text-xs text-gray-400 font-medium">
          <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Edited {formatDate(project.updatedAt)}
        </div>
        <div className="flex items-center text-xs text-gray-400 font-medium bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
          {project.versions.find((v) => v.isCurrent)?.versionNumber || "v0.1"}
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center text-xs mb-1.5">
          <span className="text-gray-500 font-medium">Document Progress</span>
          <span className="text-gray-600 font-medium bg-gray-100 px-2 py-0.5">{generatedDocsCount}/{TOTAL_DOCS} Generated</span>
        </div>
        <div className="w-full bg-gray-200 h-1 overflow-hidden">
          <div className={`h-full transition-all duration-500 ${isCompleted ? "bg-green-500" : "bg-primary-600"}`} style={{ width: `${progressPercentage}%` }} />
        </div>
      </div>

      <div className="pt-2 border-t border-gray-100 flex justify-end" onClick={(e) => e.stopPropagation()}>
        <Button
          variant={isCompleted ? "secondary" : "primary"}
          size="sm"
          className={isCompleted ? "w-full sm:w-auto shadow-none" : "w-full sm:w-auto shadow-none hover:shadow"}
          onClick={(e) => handleAction(e, isCompleted ? `/project/${project.id}/documents` : `/project/${project.id}/wizard`)}
        >
          {isCompleted ? "View Documents" : "Continue Project"}
        </Button>
      </div>
    </div>
  );
};

function AuthPrompt() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md px-6">
        <div className="w-16 h-16 bg-primary-10 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Brainstormer</h1>
        <p className="text-gray-500 mb-8">Sign in to access your projects and generate developer documentation with AI.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/auth/login">
            <Button variant="secondary">Sign In</Button>
          </Link>
          <Link href="/auth/signup">
            <Button>Create Account</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const { projects, setProjects } = useStore();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [isNewProjectModalOpen, setNewProjectModalOpen] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const loadProjects = useCallback(async () => {
    if (!user) return;
    try {
      const data = await fetchProjects(user.id);
      setProjects(data);
    } catch (err) {
      console.error("Failed to load projects:", err);
    }
  }, [user, setProjects]);

  useEffect(() => {
    if (!isLoading && !user) {
    } else if (user) {
      loadProjects();
    }
  }, [user, isLoading, loadProjects]);

  const handleCreateProject = async () => {
    if (!newProjectTitle.trim() || !user) return;
    setIsCreating(true);
    try {
      const project = await apiCreateProject(user.id, newProjectTitle.trim());
      setProjects([project, ...projects]);
      setNewProjectModalOpen(false);
      setNewProjectTitle("");
      router.push(`/project/${project.id}/wizard`);
    } catch (err) {
      console.error("Failed to create project:", err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await apiDeleteProject(projectId);
      setProjects(projects.filter(p => p.id !== projectId));
    } catch (err) {
      console.error("Failed to delete project:", err);
    }
  };

  const handleOpenProject = (projectId: string) => {
    router.push(`/project/${projectId}`);
  };

  const isRecentlyEdited = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = (now.getTime() - date.getTime()) / (1000 * 3600 * 24);
    return diffDays <= 7;
  };

  const filteredAndSortedProjects = useMemo(() => {
    let result = [...projects];
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) => p.title.toLowerCase().includes(query) || (p.description && p.description.toLowerCase().includes(query)),
      );
    }
    if (activeFilter === "Recently Edited") {
      result = result.filter((p) => isRecentlyEdited(p.updatedAt));
    } else if (activeFilter === "Completed") {
      result = result.filter((p) => p.status === "documents_generated" || p.generatedDocuments.length >= 5);
    } else if (activeFilter === "In Progress") {
      result = result.filter((p) => p.status !== "documents_generated" && p.generatedDocuments.length < 5);
    }
    result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return result;
  }, [projects, searchQuery, activeFilter]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPrompt />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 bg-primary-600 flex items-center justify-center group-hover:bg-primary-700 transition-colors">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <span className="text-lg font-semibold text-gray-900 tracking-tight">Brainstormer</span>
            </Link>
          </div>
          <Button onClick={() => setNewProjectModalOpen(true)} className="shadow-none">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Project
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8 flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Your Projects</h1>
            <p className="text-gray-500">Manage and track your brainstorming sessions and generated documents.</p>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-2 border border-gray-200">
            <FilterTabs activeFilter={activeFilter} onFilterChange={setActiveFilter} />
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="bg-white rounded-none border border-dashed border-gray-300 p-16 text-center max-w-2xl mx-auto mt-12 shadow-none">
            <div className="w-20 h-20 bg-primary-10 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">No projects yet</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto text-lg">Start your first brainstorming session to generate product requirements, user stories, and technical architecture.</p>
            <Button size="lg" onClick={() => setNewProjectModalOpen(true)} className="shadow-none">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Project
            </Button>
          </div>
        ) : filteredAndSortedProjects.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-lg font-medium text-gray-900 mb-1">No projects found</h3>
            <p className="text-gray-500">We couldn&apos;t find anything matching your search and filter criteria.</p>
            <Button variant="ghost" className="mt-4" onClick={() => { setSearchQuery(""); setActiveFilter("All"); }}>
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedProjects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                isMostRecent={index === 0 && activeFilter === "All" && searchQuery === ""}
                onOpenProject={handleOpenProject}
                onDeleteProject={handleDeleteProject}
              />
            ))}
          </div>
        )}
      </main>

      <Modal isOpen={isNewProjectModalOpen} onClose={() => setNewProjectModalOpen(false)} title="Create New Project">
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Project Title</label>
            <input
              type="text"
              value={newProjectTitle}
              onChange={(e) => setNewProjectTitle(e.target.value)}
              placeholder="e.g., Mobile Fitness Tracker"
              className="w-full px-4 py-2.5 border-0 border-b-2 border-b-gray-300 bg-gray-50 focus:outline-none focus:border-b-primary-600 focus:bg-white transition-colors text-base text-gray-900"
              autoFocus
              onKeyDown={(e) => { if (e.key === "Enter") handleCreateProject(); }}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button variant="ghost" onClick={() => setNewProjectModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateProject} disabled={!newProjectTitle.trim() || isCreating} className="shadow-none" isLoading={isCreating}>
              Create Project
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}