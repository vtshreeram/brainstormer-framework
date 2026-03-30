'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { fetchProject, generateDocumentWithAI, createDocument } from '@/lib/api-client';
import { Button } from '@/components/ui';
import { DocumentType } from '@/types';
import { FileText, LayoutTemplate, PenTool, Link2, Map } from 'lucide-react';
import { Project } from '@/types';

const allDocumentTypes: { type: DocumentType; icon: React.ReactNode; label: string; desc: string }[] = [
  { type: 'prd', icon: <FileText className="w-5 h-5 text-gray-700" />, label: 'Product Requirements Document', desc: 'Problem statement, personas, feature specs, success metrics' },
  { type: 'architecture', icon: <LayoutTemplate className="w-5 h-5 text-gray-700" />, label: 'Technical Architecture', desc: 'Stack recommendations, data model, system diagram' },
  { type: 'user_stories', icon: <PenTool className="w-5 h-5 text-gray-700" />, label: 'User Stories & Acceptance Criteria', desc: 'Prioritized stories with clear acceptance criteria' },
  { type: 'api_spec', icon: <Link2 className="w-5 h-5 text-gray-700" />, label: 'API Specifications', desc: 'Endpoints, authentication, rate limiting' },
  { type: 'roadmap', icon: <Map className="w-5 h-5 text-gray-700" />, label: 'Implementation Roadmap', desc: 'MVP phase, secondary features, sequencing rationale' },
];

export default function GeneratePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTypes, setSelectedTypes] = useState<Set<DocumentType>>(new Set<DocumentType>(['prd' as DocumentType]));
  const [generatingTypes, setGeneratingTypes] = useState<Set<DocumentType>>(new Set());
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);

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

  const toggleType = (type: DocumentType) => {
    setSelectedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  const handleGenerate = async () => {
    if (selectedTypes.size === 0) return;
    setIsGeneratingAll(true);

    const currentVersion = project?.versions.find((v) => v.isCurrent);

    for (const docType of Array.from(selectedTypes)) {
      setGeneratingTypes((prev) => new Set(prev).add(docType));
      try {
        const result = await generateDocumentWithAI(
          projectId,
          docType,
          project?.title || '',
          currentVersion?.responses || {},
        );
        await createDocument(projectId, docType, result.title, result.content, result.promptVersion, result.modelId);
      } catch (e) {
        console.error(`Failed to generate ${docType}:`, e);
      }
      setGeneratingTypes((prev) => {
        const next = new Set(prev);
        next.delete(docType);
        return next;
      });
    }

    setIsGeneratingAll(false);
    router.push(`/project/${projectId}/documents`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Project not found</p>
      </div>
    );
  }

  const selectedCount = selectedTypes.size;
  const generatedTypes = new Set<DocumentType>(project.generatedDocuments.map((d) => d.type as DocumentType));

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
            {allDocumentTypes.map(({ type, icon, label, desc }) => {
              const isSelected = selectedTypes.has(type);
              const isGenerated = generatedTypes.has(type);
              const isLoading = generatingTypes.has(type);

              return (
                <button
                  key={type}
                  onClick={() => !isGenerated && toggleType(type)}
                  disabled={isGenerated}
                  className={`
                    w-full p-4 border-2 text-left transition-all
                    ${isGenerated ? 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed' : isSelected ? 'border-primary-600 bg-primary-10' : 'border-gray-200 hover:border-gray-300'}
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
                        {isGenerated && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Generated</span>
                        )}
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
            disabled={selectedCount === 0 || isGeneratingAll}
            isLoading={isGeneratingAll}
          >
            {isGeneratingAll ? 'Generating...' : `Generate ${selectedCount > 0 ? `${selectedCount} ` : ''}Document${selectedCount !== 1 ? 's' : ''}`}
            {!isGeneratingAll && (
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