import React from 'react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  stepLabels?: string[];
  onStepClick?: (step: number) => void;
}

export function ProgressBar({
  currentStep,
  totalSteps,
  stepLabels,
  onStepClick
}: ProgressBarProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">
          Step {currentStep + 1} of {totalSteps}
        </span>
        <span className="text-sm text-gray-600">
          {Math.round(progress)}% complete
        </span>
      </div>

      {/* IBM Carbon: flat track, IBM Blue fill, no radius */}
      <div className="relative h-1.5 bg-gray-200 overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full bg-primary-600 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {stepLabels && stepLabels.length > 0 && (
        <div className="flex justify-between mt-3">
          {stepLabels.map((label, index) => (
            <button
              key={index}
              onClick={() => onStepClick?.(index)}
              className={`
                text-xs px-1 py-0.5 transition-colors font-medium
                ${index === currentStep
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : index < currentStep
                    ? 'text-gray-600 hover:text-gray-800 cursor-pointer'
                    : 'text-gray-400 cursor-default'
                }
              `}
              disabled={index > currentStep}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
