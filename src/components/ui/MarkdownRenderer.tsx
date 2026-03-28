import React from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import { formatMarkdownString } from '@/utils/documentFormatter';

interface MarkdownRendererProps {
  children: string;
  className?: string;
  disableFormatting?: boolean;
}

export function MarkdownRenderer({ children, className = '', disableFormatting = false }: MarkdownRendererProps) {
  const content = disableFormatting ? children : formatMarkdownString(children);

  const components: Components = disableFormatting ? {} : {
    h1: ({ node, ...props }) => (
      <h1 className="text-3xl font-bold text-primary-700 mt-10 mb-6 border-b border-gray-200 pb-3" {...props} />
    ),
    h2: ({ node, ...props }) => (
      <h2 className="text-2xl font-bold text-primary-700 mt-8 mb-5" {...props} />
    ),
    h3: ({ node, ...props }) => (
      <h3 className="text-xl font-semibold text-primary-700 mt-6 mb-4" {...props} />
    ),
    h4: ({ node, ...props }) => (
      <h4 className="text-lg font-medium text-primary-700 mt-5 mb-3" {...props} />
    ),
    p: ({ node, ...props }) => (
      <p className="text-gray-700 leading-relaxed mb-5" {...props} />
    ),
    ul: ({ node, ...props }) => (
      <ul className="list-disc list-outside ml-6 space-y-2.5 mb-6 text-gray-700 marker:text-primary-500" {...props} />
    ),
    ol: ({ node, ...props }) => (
      <ol className="list-decimal list-outside ml-6 space-y-2.5 mb-6 text-gray-700 marker:text-primary-500" {...props} />
    ),
    li: ({ node, ...props }) => (
      <li className="pl-1 leading-relaxed" {...props} />
    ),
    a: ({ node, ...props }) => (
      <a className="text-primary-600 hover:text-primary-800 hover:underline transition-colors font-medium" {...props} />
    ),
    blockquote: ({ node, ...props }) => (
      <blockquote className="border-l-4 border-primary-400 pl-5 italic text-gray-600 my-6 bg-primary-50/50 py-3 pr-4 rounded-r-lg" {...props} />
    ),
    // react-markdown v9: no inline prop — detect inline vs block by className
    code: ({ node, className: codeClassName, children: codeChildren, ...props }) => {
      const isBlock = Boolean(codeClassName && codeClassName.startsWith('language-'));
      if (isBlock) {
        return (
          <div className="my-6 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
            <div className="bg-gray-800 px-4 py-2.5 flex items-center gap-2 border-b border-gray-700">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
            </div>
            <pre className="bg-gray-900 text-gray-100 p-4 overflow-x-auto text-sm font-mono leading-relaxed">
              <code className={codeClassName} {...props}>{codeChildren}</code>
            </pre>
          </div>
        );
      }
      return (
        <code className="bg-gray-100 text-pink-600 px-1.5 py-0.5 rounded text-sm font-mono border border-gray-200" {...props}>
          {codeChildren}
        </code>
      );
    },
    hr: ({ node, ...props }) => (
      <hr className="my-8 border-gray-200" {...props} />
    ),
  };

  return (
    <div className={`markdown-renderer ${className}`}>
      <ReactMarkdown components={components}>{content}</ReactMarkdown>
    </div>
  );
}
