'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { wizardSteps } from '@/data/mockData';
import { Button, AssumptionList } from '@/components/ui';

export default function ReviewPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  
  const {
    projects,
    responses,
    setCurrentProject,
    setCurrentStep,
    confirmAssumption,
    updateResponse
  } = useStore();
  
  const project = projects.find(p => p.id === projectId);
  
  useEffect(() => {
    if (projectId) {
      setCurrentProject(projectId);
    }
  }, [projectId, setCurrentProject]);
  
  if (!project) {
    return <div>Loading...</div>;
  }
  
  const handleEdit = (stepIndex: number) => {
    setCurrentStep(stepIndex);
    router.push(`/project/${projectId}/wizard`);
  };
  
  const handleAssumptionConfirm = (stepId: string, assumptionId: string) => {
    confirmAssumption(stepId, assumptionId);
  };
  
  const handleGenerate = () => {
    router.push(`/project/${projectId}/generate`);
  };
  
  const allAssumptions = Object.entries(responses)
    .flatMap(([stepId, response]) => 
      (response?.assumptions || []).map(a => ({ ...a, stepId }))
    );
  
  const unconfirmedAssumptions = allAssumptions.filter(a => !a.confirmed);
  const hasIncompleteSteps = wizardSteps.some(
    (step, index) => !responses[step.id]?.isComplete
  );
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href={`/project/${projectId}/wizard`} className="text-gray-500 hover:text-gray-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Review</h1>
              <p className="text-sm text-gray-500">Confirm your answers and assumptions</p>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-3xl mx-auto px-6 py-8">
        {unconfirmedAssumptions.length > 0 && (
          <div className="card p-6 mb-6 border-orange-200 bg-orange-50">
            <h2 className="text-lg font-semibold text-orange-900 mb-4">
              Assumptions to Confirm
            </h2>
            <AssumptionList
              assumptions={unconfirmedAssumptions.map(a => ({
                ...a,
                confirmed: false
              }))}
              onConfirm={(assumptionId) => {
                const stepId = unconfirmedAssumptions.find(a => a.id === assumptionId)?.stepId;
                if (stepId) handleAssumptionConfirm(stepId, assumptionId);
              }}
              showHeader={false}
            />
          </div>
        )}
        
        {hasIncompleteSteps && (
          <div className="card p-6 mb-6 border-yellow-200 bg-yellow-50">
            <p className="text-yellow-800">
              <strong>Note:</strong> Some steps are incomplete. You can still generate documents, but they may have missing content.
            </p>
          </div>
        )}
        
        <div className="space-y-4">
          {wizardSteps.map((step, index) => {
            const response = responses[step.id];
            const isComplete = response?.isComplete;
            const hasAssumptions = response?.assumptions && response.assumptions.length > 0;
            const hasUnconfirmed = hasAssumptions && response.assumptions.some(a => !a.confirmed);
            
            return (
              <div key={step.id} className="card p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                      ${isComplete ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}
                    `}>
                      {isComplete ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        index + 1
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900">{step.title}</h3>
                    {hasUnconfirmed && (
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                        {response.assumptions.filter(a => !a.confirmed).length} assumption{response.assumptions.filter(a => !a.confirmed).length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleEdit(index)}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Edit
                  </button>
                </div>
                
                <div className="ml-11">
                  {response?.answer ? (
                    <p className="text-gray-600 whitespace-pre-wrap">{response.answer}</p>
                  ) : (
                    <p className="text-gray-400 italic">No answer provided</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-8 flex justify-between items-center">
          <Link href={`/project/${projectId}/wizard`}>
            <Button variant="secondary">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Wizard
            </Button>
          </Link>
          
          <Button onClick={handleGenerate}>
            Generate Documents
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </Button>
        </div>
      </main>
    </div>
  );
}
