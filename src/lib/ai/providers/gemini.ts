import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIProvider, AIChatMessage, AIModelConfig, AICompletionOptions } from '../types';

export class GeminiProvider implements AIProvider {
  name: 'gemini' = 'gemini';

  async complete(
    messages: AIChatMessage[],
    config: AIModelConfig,
    options?: AICompletionOptions
  ): Promise<string> {
    const apiKey = config.apiKey || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) throw new Error('Gemini API Key is missing');

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: config.model,
      generationConfig: {
        temperature: options?.temperature ?? 0.7,
        maxOutputTokens: options?.maxTokens,
        responseMimeType: options?.responseFormat === 'json' ? 'application/json' : 'text/plain',
      }
    });

    const systemMessage = messages.find(m => m.role === 'system');
    const chatHistory = messages
      .filter(m => m.role !== 'system')
      .slice(0, -1)
      .map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      }));
    
    const lastMessage = messages[messages.length - 1];

    const chat = model.startChat({
      history: chatHistory,
      systemInstruction: systemMessage ? { text: systemMessage.content } as any : undefined,
    });

    const result = await chat.sendMessage(lastMessage.content);
    return result.response.text();
  }
}
