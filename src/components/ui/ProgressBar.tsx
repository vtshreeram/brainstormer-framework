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
        <span className="text-sm text-gray-500">
          {Math.round(progress)}% complete
        </span>
      </div>
      
      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full bg-primary-500 rounded-full transition-all duration-500 ease-out"
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
                text-xs px-2 py-1 rounded transition-colors
                ${index === currentStep 
                  ? 'bg-primary-100 text-primary-700 font-medium' 
                  : index < currentStep 
                    ? 'text-gray-500 hover:text-gray-700 cursor-pointer' 
                    : 'text-gray-400'
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
