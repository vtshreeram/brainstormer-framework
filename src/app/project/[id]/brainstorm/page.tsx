"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useStore } from "@/store/useStore";
import { useAuth } from "@/components/providers/AuthProvider";
import { fetchProjects } from "@/lib/api-client";
import { BrainstormingChat } from "@/components/ui/BrainstormingChat";
import { FactGraphExplorer } from "@/components/ui/FactGraphExplorer";
import { ChevronLeft, Info, Settings, Layout } from "lucide-react";

export default function BrainstormPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { user } = useAuth();
  const { projects, setProjects, setCurrentProject } = useStore();
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      if (projects.length === 0) {
        const data = await fetchProjects(user.id);
        setProjects(data);
      }
      setCurrentProject(projectId);
    } catch (err) {
      console.error("Failed to load project context:", err);
    } finally {
      setIsInitialLoading(false);
    }
  }, [user, projectId, projects.length, setProjects, setCurrentProject]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, loadData]);

  const project = projects.find((p) => p.id === projectId);

  if (isInitialLoading || !project) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading project context...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      {/* Top Navigation */}
      <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-4 shrink-0 z-20">
        <div className="flex items-center gap-4">
          <Link 
            href={`/project/${projectId}`}
            className="p-2 hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <div className="flex flex-col">
            <h1 className="text-sm font-bold text-[#161616] leading-none">{project.title}</h1>
            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-bold">Strategic Brainstorming</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-green-50 border border-green-200 text-green-700 text-[10px] font-bold uppercase tracking-wider">
            Live Peer Session
          </div>
          <button className="p-2 hover:bg-gray-100 text-gray-400">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left: Actionable Chat */}
        <div className="w-1/2 h-full border-r border-gray-200 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-hidden">
            <BrainstormingChat />
          </div>
        </div>

        {/* Right: Fact Graph Explorer */}
        <div className="w-1/2 h-full bg-[#f4f4f4] overflow-hidden flex flex-col">
          <div className="flex-1 overflow-hidden">
            <FactGraphExplorer />
          </div>
        </div>
      </main>

      {/* Dynamic Status Bar */}
      <footer className="h-8 border-t border-gray-200 bg-gray-50 flex items-center justify-between px-4 shrink-0 text-[10px]">
        <div className="flex items-center gap-4 text-gray-500">
          <div className="flex items-center gap-1">
            <Layout className="w-3 h-3" />
            <span>Fact-First Mode Active</span>
          </div>
          <div className="flex items-center gap-1">
            <Info className="w-3 h-3" />
            <span>AI Peer: GPT-4o</span>
          </div>
        </div>
        <div className="text-primary-600 font-bold uppercase tracking-tighter">
          Synchronized with Project Graph
        </div>
      </footer>
    </div>
  );
}
