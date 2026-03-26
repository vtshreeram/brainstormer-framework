'use client';

import React, { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { wizardSteps } from '@/data/mockData';
import { Button, TextArea, ProgressBar, AssumptionList } from '@/components/ui';
import { v4 as uuidv4 } from 'uuid';

export default function WizardPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  
  const {
    projects,
    currentStep,
    responses,
    setCurrentProject,
    setCurrentStep,
    setResponse,
    updateResponse,
    confirmAssumption,
    updateProjectStatus,
    addToast
  } = useStore();
  
  const project = projects.find(p => p.id === projectId);
  const currentStepData = wizardSteps[currentStep];
  const currentResponse = responses[currentStepData?.id];
  
  useEffect(() => {
    if (projectId) {
      setCurrentProject(projectId);
    }
  }, [projectId, setCurrentProject]);
  
  const stepLabels = useMemo(() => wizardSteps.map(s => s.title), []);
  
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      router.push(`/project/${projectId}`);
    }
  };
  
  const handleContinue = () => {
    if (currentStep < wizardSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      updateProjectStatus(projectId, 'discovery_complete');
      addToast({ type: 'success', message: 'Discovery complete! Review your responses.' });
      router.push(`/project/${projectId}/review`);
    }
  };
  
  const handleAnswerChange = (answer: string) => {
    updateResponse(currentStepData.id, answer);
  };
  
  const handleAssumptionConfirm = (assumptionId: string) => {
    confirmAssumption(currentStepData.id, assumptionId);
  };
  
  const handleStepClick = (step: number) => {
    if (step <= currentStep) {
      setCurrentStep(step);
    }
  };
  
  if (!project || !currentStepData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }
  
  const canProceed = currentResponse?.isComplete || currentResponse?.answer?.trim().length > 0;
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/project/${projectId}`} className="text-gray-500 hover:text-gray-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{project.title}</h1>
                <p className="text-sm text-gray-500">Discovery Wizard</p>
              </div>
            </div>
            
            <button 
              onClick={() => {
                updateProjectStatus(projectId, 'in_progress');
                addToast({ type: 'info', message: 'Progress saved' });
                router.push(`/project/${projectId}`);
              }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Save & Exit
            </button>
          </div>
        </div>
      </header>
      
      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-8">
          <ProgressBar
            currentStep={currentStep}
            totalSteps={wizardSteps.length}
            stepLabels={stepLabels}
            onStepClick={handleStepClick}
          />
        </div>
        
        <div className="card p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentStepData.title}</h2>
            <p className="text-lg text-gray-600">{currentStepData.question}</p>
          </div>
          
          <div className="mb-6">
            <TextArea
              value={currentResponse?.answer || ''}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder={currentStepData.placeholder}
              hint={currentStepData.hint}
              showCount
              maxLength={1000}
            />
          </div>
          
          {currentResponse?.assumptions && currentResponse.assumptions.length > 0 && (
            <div className="mb-6">
              <AssumptionList
                assumptions={currentResponse.assumptions}
                onConfirm={handleAssumptionConfirm}
              />
            </div>
          )}
          
          <div className="flex items-center justify-between pt-6 border-t">
            <Button variant="secondary" onClick={handleBack}>
              {currentStep > 0 ? 'Back' : 'Exit'}
            </Button>
            
            <div className="flex items-center gap-3">
              {currentStep === wizardSteps.length - 1 ? (
                <Button onClick={handleContinue} disabled={!canProceed}>
                  Review & Finish
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </Button>
              ) : (
                <Button onClick={handleContinue} disabled={!canProceed}>
                  Continue
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex items-center justify-between text-sm text-gray-500">
          <span>
            {Object.values(responses).filter(r => r?.isComplete).length} of {wizardSteps.length} steps completed
          </span>
          <span>
            Press Enter to continue
          </span>
        </div>
      </main>
    </div>
  );
}
