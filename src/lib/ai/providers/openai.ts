import OpenAI from 'openai';
import { AIProvider, AIChatMessage, AIModelConfig, AICompletionOptions } from '../types';

export class OpenAIProvider implements AIProvider {
  name: 'openai' = 'openai';

  async complete(
    messages: AIChatMessage[],
    config: AIModelConfig,
    options?: AICompletionOptions
  ): Promise<string> {
    const apiKey = config.apiKey || process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OpenAI API Key is missing');

    const openai = new OpenAI({
      apiKey,
      baseURL: config.baseUrl,
    });

    const response = await openai.chat.completions.create({
      model: config.model,
      messages: messages as any,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens,
      response_format: options?.responseFormat === 'json' ? { type: 'json_object' } : undefined,
    });

    return response.choices[0]?.message?.content || '';
  }
}
