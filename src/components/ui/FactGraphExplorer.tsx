import React from "react";
import { useStore } from "@/store/useStore";
import { FactType } from "@/types/facts";
import { Trash2, Edit3, Link as LinkIcon, Info } from "lucide-react";

const typeLabels: Record<FactType, string> = {
  persona: "Personas",
  feature: "Features",
  constraint: "Constraints",
  metric: "Metrics",
  infrastructure: "Architecture",
  risk: "Risks",
};

const typeColors: Record<FactType, string> = {
  persona: "bg-blue-50 text-blue-700 border-blue-200",
  feature: "bg-green-50 text-green-700 border-green-200",
  constraint: "bg-orange-50 text-orange-700 border-orange-200",
  metric: "bg-purple-50 text-purple-700 border-purple-200",
  infrastructure: "bg-slate-50 text-slate-700 border-slate-200",
  risk: "bg-red-50 text-red-700 border-red-200",
};

export function FactGraphExplorer() {
  const { factGraph, removeFact } = useStore();

  const groupedFacts = factGraph.facts.reduce((acc, fact) => {
    if (!acc[fact.type]) acc[fact.type] = [];
    acc[fact.type].push(fact);
    return acc;
  }, {} as Record<FactType, typeof factGraph.facts>);

  return (
    <div className="flex flex-col h-full bg-[#f4f4f4] border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-gray-500" />
          <h2 className="text-sm font-semibold text-[#161616]">Product Fact Graph</h2>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-gray-400 uppercase">{factGraph.facts.length} Nodes</span>
        </div>
      </div>

      {/* Grid of Facts */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {factGraph.facts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-40 grayscale">
            <div className="w-16 h-16 border-2 border-dashed border-gray-400 flex items-center justify-center mb-4">
              <LinkIcon className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-sm font-medium">No facts extracted yet</p>
            <p className="text-xs mt-1">Chat with your peer to populate the graph</p>
          </div>
        ) : (
          (Object.keys(typeLabels) as FactType[]).map((type) => {
            const facts = groupedFacts[type] || [];
            if (facts.length === 0) return null;

            return (
              <div key={type} className="space-y-2">
                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">
                  {typeLabels[type]}
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {facts.map((fact) => (
                    <div 
                      key={fact.id}
                      className={`group p-3 border border-gray-200 bg-white shadow-none transition-all hover:border-primary-400`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-tighter border ${typeColors[type]}`}>
                          {type}
                        </span>
                        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1 text-gray-400 hover:text-primary-600">
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button 
                            onClick={() => removeFact(fact.id)}
                            className="p-1 text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <h4 className="text-xs font-bold text-[#161616] leading-tight">
                        {fact.title}
                      </h4>
                      <p className="text-[10px] text-gray-500 mt-1 line-clamp-2 leading-normal">
                        {fact.description}
                      </p>
                      
                      {/* Confidence indicator */}
                      <div className="mt-2 w-full bg-gray-100 h-0.5 overflow-hidden">
                        <div 
                          className="h-full bg-primary-500 transition-all duration-1000" 
                          style={{ width: `${fact.confidence * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      {factGraph.facts.length > 0 && (
        <div className="p-3 bg-white border-t border-gray-200">
          <button className="w-full py-2 bg-[#161616] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-colors">
            Generate Documents from Graph
          </button>
        </div>
      )}
    </div>
  );
}
