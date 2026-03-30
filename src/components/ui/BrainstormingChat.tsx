import React, { useState, useRef, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { Button, TextArea } from "@/components/ui";
import { Send, Sparkles, AlertCircle, Plus, Check } from "lucide-react";
import { FactType } from "@/types/facts";

const typeIcons: Record<FactType, string> = {
  persona: "👤",
  feature: "✨",
  constraint: "⛓️",
  metric: "📊",
  infrastructure: "🏗️",
  risk: "⚠️",
};

export function BrainstormingChat() {
  const { 
    chatMessages, 
    processUserBrainstorm, 
    isProcessingBrainstorm,
    addFact
  } = useStore();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSend = async () => {
    if (!input.trim() || isProcessingBrainstorm) return;
    const currentInput = input;
    setInput("");
    await processUserBrainstorm(currentInput);
  };

  return (
    <div className="flex flex-col h-full bg-white border border-gray-200">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary-600" />
          <h2 className="text-sm font-semibold text-[#161616]">Strategic Discovery</h2>
        </div>
        {isProcessingBrainstorm && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary-600 rounded-full animate-pulse" />
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Synthesizing...</span>
          </div>
        )}
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth"
      >
        {chatMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-xs mx-auto space-y-4">
            <div className="w-12 h-12 bg-primary-10 flex items-center justify-center text-primary-600">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Start your brainstorm</h3>
              <p className="text-xs text-gray-500 mt-1">
                Tell me what you&apos;re building. I&apos;ll help you extract facts, identify risks, and map out the architecture.
              </p>
            </div>
          </div>
        )}

        {chatMessages.map((msg) => (
          <div 
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] space-y-2`}>
              <div className={`px-4 py-3 text-sm shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-primary-600 text-white border-primary-700' 
                  : 'bg-gray-100 text-gray-800 border border-gray-200'
              }`}>
                {msg.content}
              </div>

              {/* Actionable Chips */}
              {msg.suggestions && msg.suggestions.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {msg.suggestions.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInput(s)}
                      className="px-3 py-1.5 bg-white border border-primary-200 text-primary-700 text-xs hover:bg-primary-50 transition-colors flex items-center gap-1.5"
                    >
                      <Plus className="w-3 h-3" />
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {/* Suggested Facts */}
              {msg.suggestedFacts && msg.suggestedFacts.length > 0 && (
                <div className="bg-primary-50/50 border border-primary-100 p-3 mt-2 space-y-3">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary-700 uppercase tracking-wider">
                    <Sparkles className="w-3 h-3" />
                    Detected Fact Nodes
                  </div>
                  <div className="space-y-2">
                    {msg.suggestedFacts.map((f, idx) => (
                      <div key={idx} className="flex items-start justify-between bg-white p-2 border border-primary-100 group">
                        <div className="flex gap-2">
                          <span className="text-base">{typeIcons[f.type as FactType]}</span>
                          <div>
                            <p className="text-xs font-bold text-gray-900">{f.title}</p>
                            <p className="text-[10px] text-gray-500 line-clamp-1">{f.description}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => addFact(f as any)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-primary-600 hover:bg-primary-50 transition-all"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="relative">
          <TextArea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your ideas or architectural choices..."
            rows={2}
            className="pr-12"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isProcessingBrainstorm}
            className="absolute right-2 bottom-2 p-2 bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-gray-400 mt-2 text-center italic">
          Press Enter to send. Your Peer agent will analyze and suggest next steps.
        </p>
      </div>
    </div>
  );
}
