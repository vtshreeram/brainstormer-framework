export type AIProviderName = 'openai' | 'anthropic' | 'gemini' | 'ollama';

export type AIRole = 'pm' | 'architect' | 'security' | 'synthesizer' | 'writer';

export interface AIModelConfig {
  provider: AIProviderName;
  model: string;
  apiKey?: string;
  baseUrl?: string;
}

export interface AISessionConfig {
  roles: Record<AIRole, AIModelConfig>;
}

export interface AIChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AICompletionOptions {
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'json' | 'text';
}

export interface AIProvider {
  name: AIProviderName;
  complete(
    messages: AIChatMessage[],
    config: AIModelConfig,
    options?: AICompletionOptions
  ): Promise<string>;
}
