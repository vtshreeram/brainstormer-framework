'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { fetchProject } from '@/lib/api-client';
import { wizardSteps } from '@/data/mockData';
import { Button, AssumptionList } from '@/components/ui';
import { Project, Response } from '@/types';

export default function ReviewPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [responses, setResponses] = useState<Record<string, Response>>({});

  useEffect(() => {
    if (!projectId) return;
    setIsLoading(true);
    fetchProject(projectId)
      .then((p) => {
        setProject(p);
        const currentVersion = p.versions.find((v) => v.isCurrent);
        setResponses(currentVersion?.responses || {});
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent animate-spin" />
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

  const handleEdit = (stepIndex: number) => {
    router.push(`/project/${projectId}/wizard?step=${stepIndex}`);
  };

  const handleGenerate = () => {
    router.push(`/project/${projectId}/generate`);
  };

  const handleConfirmAssumption = (assumptionId: string) => {
    const updatedResponses = { ...responses };
    for (const stepId of Object.keys(updatedResponses)) {
      const resp = updatedResponses[stepId];
      if (resp?.assumptions) {
        updatedResponses[stepId] = {
          ...resp,
          assumptions: resp.assumptions.map((a) =>
            a.id === assumptionId ? { ...a, confirmed: true } : a
          ),
        };
      }
    }
    setResponses(updatedResponses);
  };

  const allAssumptions = Object.entries(responses)
    .flatMap(([stepId, response]) =>
      (response?.assumptions || []).map((a) => ({ ...a, stepId }))
    );

  const unconfirmedAssumptions = allAssumptions.filter((a) => !a.confirmed);
  const hasIncompleteSteps = wizardSteps.some(
    (step) => !responses[step.id]?.isComplete
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href={`/project/${projectId}/wizard`} aria-label="Back to wizard" className="p-2 -ml-2 text-gray-500 hover:text-gray-700">
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
              assumptions={unconfirmedAssumptions.map((a) => ({
                ...a,
                confirmed: false,
              }))}
              onConfirm={handleConfirmAssumption}
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
            const hasUnconfirmed = hasAssumptions && response.assumptions.some((a) => !a.confirmed);

            return (
              <div key={step.id} className="card p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 flex items-center justify-center text-sm font-medium ${
                        isComplete ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
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
                        {response.assumptions.filter((a) => !a.confirmed).length} assumption
                        {response.assumptions.filter((a) => !a.confirmed).length > 1 ? 's' : ''}
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

                <div className="ml-11 space-y-3">
                  {response?.answer ? (
                    <p className="text-gray-600 whitespace-pre-wrap">{response.answer}</p>
                  ) : (
                    <p className="text-gray-400 italic">No answer provided</p>
                  )}

                  {response?.followUpQuestion && (
                    <div className="pl-4 border-l-2 border-primary-200 mt-3">
                      <p className="text-xs font-medium text-primary-600 mb-1">
                        Follow-up
                      </p>
                      <p className="text-sm text-gray-500 italic mb-1">
                        {response.followUpQuestion}
                      </p>
                      {response.followUpSkipped ? (
                        <p className="text-sm text-gray-400 italic">Follow-up skipped</p>
                      ) : response.followUpAnswer ? (
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">
                          {response.followUpAnswer}
                        </p>
                      ) : null}
                    </div>
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