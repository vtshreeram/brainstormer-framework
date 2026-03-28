'use client';

import React, { useRef, useEffect } from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  showCount?: boolean;
  maxLength?: number;
}

export function TextArea({
  label,
  hint,
  error,
  showCount = false,
  maxLength = 500,
  value,
  className = '',
  ...props
}: TextAreaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(textarea.scrollHeight, 120)}px`;
    }
  }, [value]);

  const charCount = typeof value === 'string' ? value.length : 0;

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <div className="relative">
        {/* IBM Carbon input: flat bg, bottom-border-only focus indicator */}
        <textarea
          ref={textareaRef}
          value={value}
          maxLength={maxLength}
          className={`
            w-full px-4 py-3 text-gray-900 bg-gray-50
            border-0 border-b-2
            placeholder-gray-500
            transition-colors duration-150
            focus:outline-none focus:bg-white
            resize-none
            ${error
              ? 'border-b-red-500'
              : 'border-b-gray-400 focus:border-b-primary-600'
            }
          `}
          style={{ minHeight: '120px' }}
          {...props}
        />
      </div>

      <div className="flex justify-between items-center">
        <div>
          {hint && !error && (
            <p className="text-sm text-gray-600">{hint}</p>
          )}
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
        </div>

        {showCount && (
          <p className={`text-sm ${charCount > maxLength * 0.9 ? 'text-orange-500' : 'text-gray-500'}`}>
            {charCount}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
}
