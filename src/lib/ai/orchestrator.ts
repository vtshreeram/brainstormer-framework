import { 
  AIProvider, 
  AIRole, 
  AIChatMessage, 
  AISessionConfig, 
  AICompletionOptions,
  AIModelConfig
} from './types';
import { OpenAIProvider } from './providers/openai';
import { AnthropicProvider } from './providers/anthropic';
import { GeminiProvider } from './providers/gemini';

export class AIOrchestrator {
  private providers: Map<string, AIProvider> = new Map();

  constructor() {
    this.registerProvider(new OpenAIProvider());
    this.registerProvider(new AnthropicProvider());
    this.registerProvider(new GeminiProvider());
  }

  private registerProvider(provider: AIProvider) {
    this.providers.set(provider.name, provider);
  }

  async runRole(
    role: AIRole,
    messages: AIChatMessage[],
    sessionConfig: AISessionConfig,
    options?: AICompletionOptions
  ): Promise<string> {
    const modelConfig = sessionConfig.roles[role];
    if (!modelConfig) {
      throw new Error(`No model configuration found for role: ${role}`);
    }

    const provider = this.providers.get(modelConfig.provider);
    if (!provider) {
      throw new Error(`AI Provider not found: ${modelConfig.provider}`);
    }

    return provider.complete(messages, modelConfig, options);
  }

  // Helper to create a default personal config if none exists
  static getDefaultConfig(): AISessionConfig {
    return {
      roles: {
        synthesizer: { provider: 'openai', model: 'gpt-4o-mini' },
        pm: { provider: 'gemini', model: 'gemini-1.5-pro' },
        architect: { provider: 'anthropic', model: 'claude-3-5-sonnet-20240620' },
        security: { provider: 'openai', model: 'gpt-4o' },
        writer: { provider: 'openai', model: 'gpt-4o' },
      }
    };
  }
}

export const aiOrchestrator = new AIOrchestrator();
