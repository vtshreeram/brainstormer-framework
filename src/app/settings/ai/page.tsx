"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { useStore } from "@/store/useStore";
import { Button, TextArea } from "@/components/ui";
import { ChevronLeft, Save, Shield, Cpu, Sparkles, Globe, Server } from "lucide-react";
import { AISessionConfig, AIRole, AIProviderName } from "@/lib/ai/types";
import { AIOrchestrator } from "@/lib/ai/orchestrator";

const roles: { id: AIRole; label: string; desc: string }[] = [
  { id: "synthesizer", label: "Discovery Synthesizer", desc: "Extracts facts from chat and builds the graph." },
  { id: "pm", label: "Product Manager", desc: "Analyzes value proposition and user personas." },
  { id: "architect", label: "Solutions Architect", desc: "Designs technical infrastructure and data flow." },
  { id: "security", label: "Security Lead", desc: "Identifies risks and compliance requirements." },
  { id: "writer", label: "Document Writer", desc: "Generates the final Markdown artifacts." },
];

const providers: { id: AIProviderName; label: string; icon: any }[] = [
  { id: "openai", label: "OpenAI", icon: Sparkles },
  { id: "anthropic", label: "Anthropic", icon: Shield },
  { id: "gemini", label: "Google Gemini", icon: Globe },
  { id: "ollama", label: "Local (Ollama)", icon: Server },
];

export default function AiSettingsPage() {
  const { user } = useAuth();
  const { addToast } = useStore();
  const [config, setConfig] = useState<AISessionConfig>(AIOrchestrator.getDefaultConfig());
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetch("/api/user/ai-settings", {
      headers: { "x-user-id": user.id }
    })
      .then(res => res.json())
      .then(data => {
        if (data.settings) setConfig(data.settings);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/user/ai-settings", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-user-id": user.id 
        },
        body: JSON.stringify({ settings: config })
      });
      if (res.ok) {
        addToast({ message: "AI Settings saved successfully", type: "success" });
      } else {
        throw new Error();
      }
    } catch (e) {
      addToast({ message: "Failed to save AI settings", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const updateRole = (role: AIRole, field: string, value: string) => {
    setConfig(prev => ({
      ...prev,
      roles: {
        ...prev.roles,
        [role]: {
          ...prev.roles[role],
          [field]: value
        }
      }
    }));
  };

  if (isLoading) return <div className="p-12 text-center text-gray-500">Loading AI configuration...</div>;

  return (
    <div className="min-h-screen bg-[#f4f4f4]">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 hover:bg-gray-100 transition-colors">
              <ChevronLeft className="w-5 h-5 text-gray-500" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-[#161616]">AI Master Settings</h1>
              <p className="text-xs text-gray-500 font-medium">Personal BYOK configuration</p>
            </div>
          </div>
          <Button onClick={handleSave} isLoading={isSaving} className="gap-2">
            <Save className="w-4 h-4" />
            Save Configuration
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-12 gap-8">
        {/* Sidebar Navigation */}
        <div className="col-span-3 space-y-1">
          <nav className="space-y-1">
            <button className="w-full text-left px-4 py-2 bg-white border-l-2 border-primary-600 text-sm font-bold text-primary-700">
              Role Mappings
            </button>
            <button className="w-full text-left px-4 py-2 hover:bg-gray-200 text-sm font-medium text-gray-600">
              Provider Keys
            </button>
            <button className="w-full text-left px-4 py-2 hover:bg-gray-200 text-sm font-medium text-gray-600">
              Advanced Usage
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="col-span-9 space-y-8">
          <section className="bg-white border border-gray-200 p-6 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
              <Cpu className="w-5 h-5 text-primary-600" />
              <h2 className="font-bold text-[#161616]">Orchestration Logic</h2>
            </div>

            <div className="space-y-8">
              {roles.map((role) => (
                <div key={role.id} className="grid grid-cols-12 gap-4 items-start">
                  <div className="col-span-4">
                    <h3 className="text-sm font-bold text-gray-900">{role.label}</h3>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{role.desc}</p>
                  </div>
                  
                  <div className="col-span-8 grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Provider</label>
                      <select 
                        value={config.roles[role.id]?.provider}
                        onChange={(e) => updateRole(role.id, "provider", e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border-0 border-b-2 border-gray-200 text-sm focus:border-primary-600 outline-none transition-colors"
                      >
                        {providers.map(p => (
                          <option key={p.id} value={p.id}>{p.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Model ID</label>
                      <input 
                        type="text" 
                        value={config.roles[role.id]?.model}
                        onChange={(e) => updateRole(role.id, "model", e.target.value)}
                        placeholder="e.g. gpt-4o"
                        className="w-full px-3 py-2 bg-gray-50 border-0 border-b-2 border-gray-200 text-sm focus:border-primary-600 outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white border border-gray-200 p-6 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
              <Shield className="w-5 h-5 text-primary-600" />
              <h2 className="font-bold text-[#161616]">Provider Configuration</h2>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {providers.map((p) => {
                // Find a role that uses this provider to get/set the API key
                // Note: In a true multi-key setup, we'd have a separate keys table.
                // For now, we'll store the key inside the first model config that uses it.
                const firstRoleUsingThis = Object.values(config.roles).find(r => r.provider === p.id);
                
                return (
                  <div key={p.id} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-gray-900">{p.label}</p>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      <input 
                        type="password"
                        placeholder={`${p.label} API Key`}
                        value={firstRoleUsingThis?.apiKey || ""}
                        onChange={(e) => {
                          // Update API key for ALL roles using this provider
                          const newRoles = { ...config.roles };
                          Object.keys(newRoles).forEach(roleKey => {
                            const r = roleKey as AIRole;
                            if (newRoles[r].provider === p.id) {
                              newRoles[r].apiKey = e.target.value;
                            }
                          });
                          setConfig({ ...config, roles: newRoles });
                        }}
                        className="w-full px-3 py-2 bg-gray-50 border-0 border-b-2 border-gray-200 text-sm focus:border-primary-600 outline-none transition-colors font-mono"
                      />
                      {p.id === 'ollama' && (
                        <input 
                          type="text"
                          placeholder="Local Endpoint (e.g. http://localhost:11434)"
                          value={firstRoleUsingThis?.baseUrl || ""}
                          onChange={(e) => {
                            const newRoles = { ...config.roles };
                            Object.keys(newRoles).forEach(roleKey => {
                              const r = roleKey as AIRole;
                              if (newRoles[r].provider === p.id) {
                                newRoles[r].baseUrl = e.target.value;
                              }
                            });
                            setConfig({ ...config, roles: newRoles });
                          }}
                          className="w-full px-3 py-2 bg-gray-50 border-0 border-b-2 border-gray-200 text-sm focus:border-primary-600 outline-none transition-colors"
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
