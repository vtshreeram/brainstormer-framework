'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui';

export default function DocumentsPage() {
  const params = useParams();
  const projectId = params.id as string;
  
  const { projects, setCurrentProject } = useStore();
  const project = projects.find(p => p.id === projectId);
  
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  useEffect(() => {
    if (projectId) {
      setCurrentProject(projectId);
    }
  }, [projectId, setCurrentProject]);
  
  useEffect(() => {
    if (project?.generatedDocuments.length && !selectedDocId) {
      setSelectedDocId(project.generatedDocuments[0].id);
    }
  }, [project, selectedDocId]);
  
  if (!project) {
    return <div>Loading...</div>;
  }
  
  const selectedDoc = project.generatedDocuments.find(d => d.id === selectedDocId);
  
  const handleCopyMarkdown = (docId: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(docId);
    setTimeout(() => setCopiedId(null), 2000);
  };
  
  const handleDownload = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const typeLabels: Record<string, string> = {
    prd: 'Product Requirements Document',
    architecture: 'Technical Architecture',
    user_stories: 'User Stories',
    api_spec: 'API Specifications',
    roadmap: 'Implementation Roadmap'
  };
  
  const typeIcons: Record<string, string> = {
    prd: '📋',
    architecture: '🏗️',
    user_stories: '📝',
    api_spec: '🔗',
    roadmap: '🗺️'
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href={`/project/${projectId}`} className="text-gray-500 hover:text-gray-700">
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
      
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-3">
            <div className="card p-4">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Generated Documents</h2>
              <div className="space-y-2">
                {project.generatedDocuments.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDocId(doc.id)}
                    className={`
                      w-full p-3 rounded-lg text-left transition-colors
                      ${selectedDocId === doc.id 
                        ? 'bg-primary-100 text-primary-700' 
                        : 'hover:bg-gray-100'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <span>{typeIcons[doc.type]}</span>
                      <span className="text-sm font-medium truncate">{typeLabels[doc.type]}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Exported {doc.exportCount} times
                    </p>
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
          </div>
          
          <div className="col-span-9">
            {selectedDoc ? (
              <div className="card">
                <div className="px-6 py-4 border-b flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{typeIcons[selectedDoc.type]}</span>
                    <div>
                      <h2 className="font-semibold text-gray-900">{typeLabels[selectedDoc.type]}</h2>
                      <p className="text-sm text-gray-500">
                        Generated {new Date(selectedDoc.generatedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
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
                      onClick={() => handleDownload(selectedDoc.title.toLowerCase().replace(/\s+/g, '-'), selectedDoc.content)}
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download
                    </Button>
                  </div>
                </div>
                
                <div className="p-6 prose prose-sm max-w-none">
                  <ReactMarkdown>{selectedDoc.content}</ReactMarkdown>
                </div>
              </div>
            ) : (
              <div className="card p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">No documents yet</h2>
                <p className="text-gray-500 mb-6">Complete the discovery wizard and generate your first documents</p>
                <Link href={`/project/${projectId}/wizard`}>
                  <Button>Start Discovery</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
