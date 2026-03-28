'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MarkdownRenderer as ReactMarkdown } from './MarkdownRenderer';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  isLoading?: boolean;
}

interface SectionAskPanelProps {
  sectionTitle: string;
  sectionContent: string;
  onClose: () => void;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function CloseIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className ?? 'w-4 h-4'}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
      />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
      />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

// ─── Suggestion chips ─────────────────────────────────────────────────────────

const SUGGESTION_CHIPS = [
  'Why is this section important?',
  'How can I improve this?',
  'What does this section cover?',
  'What are common mistakes here?',
];

// ─── Message bubble ────────────────────────────────────────────────────────────

function MessageBubble({ message }: { message: Message }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [message.text]);

  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] bg-primary-600 text-white px-4 py-2.5 text-sm leading-relaxed">
          {message.text}
        </div>
      </div>
    );
  }

  // Assistant message
  if (message.isLoading) {
    return (
      <div className="flex items-start gap-2.5">
        <div className="flex-shrink-0 w-7 h-7 bg-primary-10 flex items-center justify-center mt-0.5">
          <SparklesIcon className="w-3.5 h-3.5 text-violet-600" />
        </div>
        <div className="bg-gray-100 px-4 py-3 max-w-[85%]">
          <div className="flex items-center gap-1.5">
            <span
              className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
              style={{ animationDelay: '0ms' }}
            />
            <span
              className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
              style={{ animationDelay: '150ms' }}
            />
            <span
              className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
              style={{ animationDelay: '300ms' }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2.5 group/msg">
      <div className="flex-shrink-0 w-7 h-7 bg-primary-10 flex items-center justify-center mt-0.5">
        <SparklesIcon className="w-3.5 h-3.5 text-violet-600" />
      </div>
      <div className="max-w-[85%]">
        <div className="bg-gray-100 px-4 py-3">
          <div className="prose prose-sm max-w-none text-gray-800 [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_h1]:text-sm [&_h2]:text-sm [&_h3]:text-xs [&_code]:text-xs [&_table]:text-xs">
            <ReactMarkdown disableFormatting>{message.text}</ReactMarkdown>
          </div>
        </div>
        {/* Copy button */}
        <button
          onClick={handleCopy}
          className="
            mt-1 ml-1 flex items-center gap-1 text-[11px] text-gray-400
            hover:text-gray-600 transition-colors opacity-0 group-hover/msg:opacity-100
          "
        >
          {copied ? (
            <>
              <CheckIcon />
              <span>Copied</span>
            </>
          ) : (
            <>
              <CopyIcon />
              <span>Copy response</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export function SectionAskPanel({
  sectionTitle,
  sectionContent,
  onClose,
}: SectionAskPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Slide-in animation on mount
  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on open
  useEffect(() => {
    if (visible) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [visible]);

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, 250);
  }, [onClose]);

  // Close on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleClose]);

  const sendMessage = useCallback(
    async (question: string) => {
      const trimmed = question.trim();
      if (!trimmed || isLoading) return;

      const userMsgId = `user-${Date.now()}`;
      const assistantMsgId = `asst-${Date.now()}`;

      setMessages((prev) => [
        ...prev,
        { id: userMsgId, role: 'user', text: trimmed },
        { id: assistantMsgId, role: 'assistant', text: '', isLoading: true },
      ]);
      setInputValue('');
      setIsLoading(true);

      try {
        const res = await fetch('/api/section-ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            section_heading: sectionTitle,
            section_content: sectionContent,
            question: trimmed,
          }),
        });

        if (!res.ok) throw new Error('Request failed');

        const data = await res.json();
        const answer: string = data.answer ?? 'No response received.';

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? { ...m, text: answer, isLoading: false }
              : m,
          ),
        );
      } catch {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  text: 'Something went wrong. Please try again.',
                  isLoading: false,
                }
              : m,
          ),
        );
      } finally {
        setIsLoading(false);
        inputRef.current?.focus();
      }
    },
    [isLoading, sectionTitle, sectionContent],
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      sendMessage(inputValue);
    },
    [inputValue, sendMessage],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage(inputValue);
      }
    },
    [inputValue, sendMessage],
  );

  const handleChipClick = useCallback(
    (chip: string) => {
      sendMessage(chip);
    },
    [sendMessage],
  );

  const isEmpty = messages.length === 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/10 z-40 transition-opacity duration-200"
        style={{ opacity: visible ? 1 : 0 }}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="
          fixed inset-y-0 right-0 z-50
          w-full max-w-[420px] sm:w-[38%]
          bg-white border-l border-gray-200
          flex flex-col
          transition-transform duration-250 ease-out
        "
        style={{
          transform: visible ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.25s cubic-bezier(0.32, 0.72, 0, 1)',
        }}
        role="dialog"
        aria-label="Ask AI about section"
      >
        {/* ── Header ── */}
        <div className="flex-shrink-0 px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-violet-50 to-blue-50">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-10 flex items-center justify-center mt-0.5">
                <SparklesIcon className="w-4 h-4 text-violet-600" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 leading-tight">
                  Ask AI
                </h3>
                <p className="text-xs text-gray-500 mt-0.5 truncate" title={sectionTitle}>
                  About:{' '}
                  <span className="font-medium text-violet-700">{sectionTitle}</span>
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="
                flex-shrink-0 w-7 h-7 rounded-full
                flex items-center justify-center
                text-gray-400 hover:text-gray-700 hover:bg-gray-100
                transition-colors
              "
              aria-label="Close panel"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        {/* ── Messages ── */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {isEmpty ? (
            /* Empty state */
            <div className="h-full flex flex-col items-center justify-center text-center gap-4 px-2">
              <div className="w-12 h-12 bg-primary-10 flex items-center justify-center">
                <SparklesIcon className="w-6 h-6 text-violet-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Ask anything about this section
                </p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Get explanations, improvement tips, or clarifications about{' '}
                  <span className="font-medium text-violet-600">{sectionTitle}</span>.
                </p>
              </div>

              {/* Suggestion chips */}
              <div className="w-full mt-1">
                <p className="text-[11px] text-gray-400 uppercase tracking-wide font-medium mb-2">
                  Try asking
                </p>
                <div className="flex flex-col gap-1.5">
                  {SUGGESTION_CHIPS.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => handleChipClick(chip)}
                      className="
                        w-full text-left text-xs px-3 py-2
                        bg-gray-50 border border-gray-200
                        text-gray-700 hover:bg-violet-50 hover:border-violet-200
                        hover:text-violet-700 transition-colors
                      "
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Message list */
            <div className="space-y-4">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* ── Suggestion chips (inline, shown when there are messages) ── */}
        {!isEmpty && !isLoading && (
          <div className="flex-shrink-0 px-4 pb-2 flex flex-wrap gap-1.5">
            {SUGGESTION_CHIPS.slice(0, 2).map((chip) => (
              <button
                key={chip}
                onClick={() => handleChipClick(chip)}
                className="
                  text-[11px] px-2 py-0.5
                  bg-gray-100 border border-gray-200
                  text-gray-600 hover:bg-violet-50 hover:border-violet-200
                  hover:text-violet-700 transition-colors
                "
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        {/* ── Input area ── */}
        <div className="flex-shrink-0 border-t border-gray-100 px-4 py-3 bg-white">
          <form onSubmit={handleSubmit}>
            <div
              className="
                flex items-end gap-2 border border-gray-200
                bg-gray-50 focus-within:border-violet-400 focus-within:bg-white
                focus-within:ring-1 focus-within:ring-violet-300
                transition-all px-3 py-2
              "
            >
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about this section… (Enter to send)"
                rows={1}
                disabled={isLoading}
                className="
                  flex-1 resize-none bg-transparent text-sm text-gray-800
                  placeholder:text-gray-400 outline-none
                  leading-relaxed disabled:opacity-50
                  max-h-[120px] overflow-y-auto
                "
                style={{ minHeight: '24px' }}
                onInput={(e) => {
                  const el = e.currentTarget;
                  el.style.height = 'auto';
                  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
                }}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="
                  flex-shrink-0 w-7 h-7
                  flex items-center justify-center
                  bg-violet-600 text-white
                  hover:bg-violet-700
                  disabled:opacity-40 disabled:cursor-not-allowed
                  transition-colors
                "
                aria-label="Send message"
              >
                {isLoading ? (
                  <svg
                    className="w-3.5 h-3.5 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                ) : (
                  <SendIcon />
                )}
              </button>
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5 text-center">
              Shift+Enter for new line · Esc to close
            </p>
          </form>
        </div>
      </div>
    </>
  );
}
