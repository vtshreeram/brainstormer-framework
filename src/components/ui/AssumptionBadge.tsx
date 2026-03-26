import React from 'react';
import { Assumption } from '@/types';

interface AssumptionBadgeProps {
  assumption: Assumption;
  onConfirm?: (id: string) => void;
  onDismiss?: (id: string) => void;
  compact?: boolean;
}

export function AssumptionBadge({
  assumption,
  onConfirm,
  onDismiss,
  compact = false
}: AssumptionBadgeProps) {
  const typeColors = {
    technical: 'bg-purple-50 border-purple-200 text-purple-700',
    business: 'bg-blue-50 border-blue-200 text-blue-700',
    platform: 'bg-orange-50 border-orange-200 text-orange-700',
    general: 'bg-gray-50 border-gray-200 text-gray-700'
  };
  
  const typeIcons = {
    technical: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    business: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    platform: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    general: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  };
  
  if (compact) {
    return (
      <span className={`
        inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium border
        ${assumption.confirmed ? 'bg-green-50 border-green-200 text-green-700' : typeColors[assumption.type]}
      `}>
        {assumption.confirmed ? (
          <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          typeIcons[assumption.type]
        )}
        {assumption.text}
      </span>
    );
  }
  
  return (
    <div className={`
      p-4 rounded-lg border
      ${assumption.confirmed ? 'bg-green-50 border-green-200' : typeColors[assumption.type]}
    `}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {assumption.confirmed ? (
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            typeIcons[assumption.type]
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">
            {assumption.confirmed ? 'Confirmed Assumption' : 'Assumption Detected'}
          </p>
          <p className="text-sm mt-1">{assumption.text}</p>
        </div>
        
        {!assumption.confirmed && (onConfirm || onDismiss) && (
          <div className="flex gap-2">
            {onDismiss && (
              <button
                onClick={() => onDismiss(assumption.id)}
                className="text-gray-400 hover:text-gray-600 text-sm"
              >
                Dismiss
              </button>
            )}
            {onConfirm && (
              <button
                onClick={() => onConfirm(assumption.id)}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                Confirm
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface AssumptionListProps {
  assumptions: Assumption[];
  onConfirm?: (id: string) => void;
  onDismiss?: (id: string) => void;
  showHeader?: boolean;
}

export function AssumptionList({
  assumptions,
  onConfirm,
  onDismiss,
  showHeader = true
}: AssumptionListProps) {
  if (assumptions.length === 0) return null;
  
  const unconfirmed = assumptions.filter(a => !a.confirmed);
  const confirmed = assumptions.filter(a => a.confirmed);
  
  return (
    <div className="space-y-3">
      {showHeader && unconfirmed.length > 0 && (
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {unconfirmed.length} assumption{unconfirmed.length > 1 ? 's' : ''} to confirm
        </div>
      )}
      
      {unconfirmed.map((assumption) => (
        <AssumptionBadge
          key={assumption.id}
          assumption={assumption}
          onConfirm={onConfirm ? () => onConfirm(assumption.id) : undefined}
          onDismiss={onDismiss ? () => onDismiss(assumption.id) : undefined}
        />
      ))}
      
      {confirmed.length > 0 && (
        <div className="space-y-2 pt-2">
          <p className="text-sm font-medium text-green-700">Confirmed assumptions:</p>
          {confirmed.map((assumption) => (
            <AssumptionBadge key={assumption.id} assumption={assumption} compact />
          ))}
        </div>
      )}
    </div>
  );
}
