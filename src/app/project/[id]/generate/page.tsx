'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui';
import { DocumentType } from '@/types';
import { FileText, LayoutTemplate, PenTool, Link2, Map } from 'lucide-react';

export default function GeneratePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  
  const {
    projects,
    selectedDocuments,
    toggleDocumentSelection,
    generateDocuments,
    setCurrentProject,
    isGenerating,
    addToast
  } = useStore();
  
  const project = projects.find(p => p.id === projectId);
  const [isGeneratingLocal, setIsGeneratingLocal] = useState(false);
  
  useEffect(() => {
    if (projectId) {
      setCurrentProject(projectId);
    }
  }, [projectId, setCurrentProject]);
  
  if (!project) {
    return <div>Loading...</div>;
  }
  
  const handleGenerate = async () => {
    setIsGeneratingLocal(true);
    
    // Removed artificial delay
    
    generateDocuments();
    
    addToast({ type: 'success', message: 'Documents generated successfully!' });
    router.push(`/project/${projectId}/documents`);
  };
  
  const documentTypes = [
    { type: 'prd' as DocumentType, icon: <FileText className="w-5 h-5 text-gray-700" />, label: 'Product Requirements Document', desc: 'Problem statement, personas, feature specs, success metrics' },
    { type: 'architecture' as DocumentType, icon: <LayoutTemplate className="w-5 h-5 text-gray-700" />, label: 'Technical Architecture', desc: 'Stack recommendations, data model, system diagram' },
    { type: 'user_stories' as DocumentType, icon: <PenTool className="w-5 h-5 text-gray-700" />, label: 'User Stories & Acceptance Criteria', desc: 'Prioritized stories with clear acceptance criteria' },
    { type: 'api_spec' as DocumentType, icon: <Link2 className="w-5 h-5 text-gray-700" />, label: 'API Specifications', desc: 'Endpoints, authentication, rate limiting' },
    { type: 'roadmap' as DocumentType, icon: <Map className="w-5 h-5 text-gray-700" />, label: 'Implementation Roadmap', desc: 'MVP phase, secondary features, sequencing rationale' }
  ];
  
  const selectedCount = selectedDocuments.filter(d => d.selected).length;
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href={`/project/${projectId}/review`} className="text-gray-500 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Generate Documents</h1>
              <p className="text-sm text-gray-500">Select documents to create from your responses</p>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="card p-6 mb-6">
          <p className="text-gray-600 mb-4">
            Based on your discovery responses, we can generate the following documents. 
            Select the ones you need for your project.
          </p>
          
          <div className="space-y-3">
            {documentTypes.map(({ type, icon, label, desc }) => {
              const isSelected = selectedDocuments.find(d => d.type === type)?.selected;
              
              return (
                <button
                  key={type}
                  onClick={() => toggleDocumentSelection(type)}
                  className={`
                    w-full p-4 border-2 text-left transition-all
                    ${isSelected 
                      ? 'border-primary-600 bg-primary-10' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <div className="flex items-start gap-4">
                    <div className={`
                      w-6 h-6 rounded flex items-center justify-center flex-shrink-0 mt-0.5
                      ${isSelected ? 'bg-primary-600 text-white' : 'bg-gray-200'}
                    `}>
                      {isSelected && (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{icon}</span>
                        <span className="font-semibold text-gray-900">{label}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{desc}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <Link href={`/project/${projectId}/review`}>
            <Button variant="secondary">Back to Review</Button>
          </Link>
          
          <Button 
            onClick={handleGenerate} 
            disabled={selectedCount === 0}
            isLoading={isGeneratingLocal}
          >
            {isGeneratingLocal ? 'Generating...' : `Generate ${selectedCount > 0 ? `${selectedCount} ` : ''}Document${selectedCount !== 1 ? 's' : ''}`}
            {!isGeneratingLocal && (
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            )}
          </Button>
        </div>
      </main>
    </div>
  );
}
