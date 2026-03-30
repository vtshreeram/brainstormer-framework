import Anthropic from '@anthropic-ai/sdk';
import { AIProvider, AIChatMessage, AIModelConfig, AICompletionOptions } from '../types';

export class AnthropicProvider implements AIProvider {
  name: 'anthropic' = 'anthropic';

  async complete(
    messages: AIChatMessage[],
    config: AIModelConfig,
    options?: AICompletionOptions
  ): Promise<string> {
    const apiKey = config.apiKey || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error('Anthropic API Key is missing');

    const anthropic = new Anthropic({
      apiKey,
    });

    // Extract system message if present (Anthropic uses a separate field)
    const systemMessage = messages.find(m => m.role === 'system');
    const chatMessages = messages.filter(m => m.role !== 'system');

    const response = await anthropic.messages.create({
      model: config.model,
      system: systemMessage?.content,
      messages: chatMessages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens || 4096,
    });

    const content = response.content[0];
    return content.type === 'text' ? content.text : '';
  }
}
