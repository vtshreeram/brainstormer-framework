'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { getStatusLabel, formatDate } from '@/data/mockData';
import { Button } from '@/components/ui';

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  
  const { 
    projects, 
    setCurrentProject, 
    getCompletionPercentage,
    resetWizard,
    deleteProject 
  } = useStore();
  
  const project = projects.find(p => p.id === projectId);
  
  useEffect(() => {
    if (projectId) {
      setCurrentProject(projectId);
    }
  }, [projectId, setCurrentProject]);
  
  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Project not found</h2>
          <Link href="/" className="text-primary-600 hover:text-primary-700">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }
  
  const completionPercentage = getCompletionPercentage();
  const currentVersion = project.versions.find(v => v.isCurrent);
  
  const handleStartWizard = () => {
    resetWizard();
    router.push(`/project/${projectId}/wizard`);
  };
  
  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this project? This cannot be undone.')) {
      deleteProject(projectId);
      router.push('/');
    }
  };
  
  const getNextAction = () => {
    switch (project.status) {
      case 'draft':
      case 'in_progress':
        return {
          label: 'Continue Discovery',
          onClick: handleStartWizard,
          description: 'Complete the discovery wizard to define your product'
        };
      case 'discovery_complete':
        return {
          label: 'Review & Generate',
          onClick: () => router.push(`/project/${projectId}/review`),
          description: 'Review responses and generate documents'
        };
      case 'documents_generated':
        return {
          label: 'View Documents',
          onClick: () => router.push(`/project/${projectId}/documents`),
          description: 'View and export your generated documentation'
        };
      default:
        return {
          label: 'Continue Discovery',
          onClick: handleStartWizard,
          description: 'Complete the discovery wizard'
        };
    }
  };
  
  const nextAction = getNextAction();
  
  return (
    <div className="min-h-screen">
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-gray-500 hover:text-gray-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{project.title}</h1>
                <p className="text-sm text-gray-500">
                  {currentVersion?.versionNumber || 'v0.1'} · Last edited {formatDate(project.updatedAt)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <span className={`text-xs font-medium px-2.5 py-1 rounded ${
                project.status === 'discovery_complete' ? 'bg-green-100 text-green-700' :
                project.status === 'documents_generated' ? 'bg-purple-100 text-purple-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {getStatusLabel(project.status)}
              </span>
              <Link href={`/project/${projectId}/settings`}>
                <Button variant="ghost" size="sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="card p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Discovery Progress</h2>
              <p className="text-sm text-gray-500">{completionPercentage}% complete</p>
            </div>
            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary-500 rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-2 mb-6">
            {currentVersion && Object.entries(currentVersion.responses).map(([stepId, response], index) => (
              <div 
                key={stepId}
                className={`text-center p-3 rounded-lg ${
                  response.isComplete ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                }`}
              >
                <span className="text-xs font-medium">
                  {response.isComplete ? (
                    <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </span>
              </div>
            ))}
            {(!currentVersion || Object.keys(currentVersion.responses).length === 0) && (
              <>
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="text-center p-3 rounded-lg bg-gray-100 text-gray-400">
                    <span className="text-xs font-medium">{i + 1}</span>
                  </div>
                ))}
              </>
            )}
          </div>
          
          <Button onClick={nextAction.onClick} className="w-full">
            {nextAction.label}
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
          <p className="text-sm text-gray-500 text-center mt-3">{nextAction.description}</p>
        </div>
        
        {project.generatedDocuments.length > 0 && (
          <div className="card p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Generated Documents</h2>
            <div className="space-y-3">
              {project.generatedDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="font-medium text-gray-900">{doc.title}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">
                      Exported {doc.exportCount} times
                    </span>
                    <Link href={`/project/${projectId}/documents`}>
                      <Button variant="secondary" size="sm">View</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {project.description && (
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
            <p className="text-gray-600">{project.description}</p>
          </div>
        )}
        
        <div className="mt-8 pt-6 border-t">
          <button 
            onClick={handleDelete}
            className="text-sm text-red-600 hover:text-red-700"
          >
            Delete Project
          </button>
        </div>
      </main>
    </div>
  );
}
