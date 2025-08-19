import type { 
  LLMProvider, 
  LLMRequest, 
  LLMResponse, 
  LLMStreamChunk 
} from '../../types'
import type { AIModel, AIProvider } from '@vibeflow/shared'

// Puter.js interfaces
interface PuterMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface PuterChatOptions {
  messages: PuterMessage[]
  model?: string
  stream?: boolean
  temperature?: number
  max_tokens?: number
}

interface PuterChatResponse {
  message?: string
  choices?: Array<{
    message: {
      content: string
      role: string
    }
    finish_reason: string
  }>
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

interface PuterAPI {
  ai: {
    chat: (options: PuterChatOptions) => Promise<PuterChatResponse>
  }
}

declare global {
  interface Window {
    puter: PuterAPI
  }
}

/**
 * Puter.js Provider - Free unlimited Claude API access
 * Based on https://developer.puter.com/tutorials/free-unlimited-claude-35-sonnet-api/
 * 
 * Features:
 * - No API keys required
 * - No sign-up needed
 * - Free unlimited access to Claude Sonnet 4 and Claude Opus 4
 * - "User Pays" model - users cover their own usage costs
 */
export class PuterProvider implements LLMProvider {
  name: AIProvider = 'local' // Using 'local' since it's client-side
  models: AIModel[] = [
    'claude-4',
    'claude-3.5',
    'claude-opus',
    'gpt-4.1-nano',
    'gpt-4-vision',
    'dalle-3'
  ]

  private mapModel(model: AIModel): string {
    const modelMap: Record<AIModel, string> = {
      'claude-4': 'claude-sonnet-4',
      'claude-3.5': 'claude-3-5-sonnet',
      'claude-opus': 'claude-opus-4',
      'gpt-4.1-nano': 'gpt-4-nano',
      'gpt-4-vision': 'gpt-4-vision',
      'dalle-3': 'dalle-3'
    }
    return modelMap[model] || 'claude-sonnet-4'
  }

  async isAvailable(): Promise<boolean> {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        return false
      }

      // Check if Puter.js is loaded
      return typeof window.puter !== 'undefined' && 
             typeof window.puter.ai !== 'undefined' &&
             typeof window.puter.ai.chat === 'function'
    } catch (error) {
      console.warn('Puter.js not available:', error)
      return false
    }
  }

  async sendMessage(request: LLMRequest): Promise<LLMResponse> {
    if (!await this.isAvailable()) {
      throw new Error('Puter.js is not available. Make sure the script is loaded.')
    }

    try {
      const puterMessages: PuterMessage[] = request.messages.map(msg => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content
      }))

      const options: PuterChatOptions = {
        messages: puterMessages,
        model: this.mapModel(request.model),
        temperature: request.temperature || 0.7,
        max_tokens: request.maxTokens || 4000,
        stream: false
      }

      const response = await window.puter.ai.chat(options)

      // Extract content from response
      let content = ''
      if (response.message) {
        content = response.message
      } else if (response.choices && response.choices.length > 0) {
        content = response.choices[0].message.content
      }

      const result: LLMResponse = {
        id: `puter-${Date.now()}`,
        content,
        model: request.model,
        tokens: response.usage ? {
          prompt: response.usage.prompt_tokens,
          completion: response.usage.completion_tokens,
          total: response.usage.total_tokens
        } : undefined,
        finishReason: response.choices?.[0]?.finish_reason as any || 'stop',
        metadata: {
          provider: 'puter',
          originalModel: this.mapModel(request.model)
        }
      }

      return result
    } catch (error) {
      console.error('Puter API error:', error)
      throw new Error(`Puter API request failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async *streamMessage(request: LLMRequest): AsyncIterable<LLMStreamChunk> {
    if (!await this.isAvailable()) {
      throw new Error('Puter.js is not available. Make sure the script is loaded.')
    }

    try {
      const puterMessages: PuterMessage[] = request.messages.map(msg => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content
      }))

      const options: PuterChatOptions = {
        messages: puterMessages,
        model: this.mapModel(request.model),
        temperature: request.temperature || 0.7,
        max_tokens: request.maxTokens || 4000,
        stream: true
      }

      // Note: Streaming implementation depends on Puter.js supporting streaming
      // If not supported, fall back to non-streaming response
      const response = await window.puter.ai.chat(options)
      
      let content = ''
      if (response.message) {
        content = response.message
      } else if (response.choices && response.choices.length > 0) {
        content = response.choices[0].message.content
      }

      // Simulate streaming by yielding chunks
      const words = content.split(' ')
      for (let i = 0; i < words.length; i++) {
        const chunk = words.slice(0, i + 1).join(' ')
        const delta = i === 0 ? words[0] : ' ' + words[i]
        
        yield {
          id: `puter-stream-${Date.now()}-${i}`,
          content: chunk,
          delta,
          done: i === words.length - 1,
          tokens: i === words.length - 1 ? response.usage?.total_tokens : undefined
        }

        // Add small delay to simulate streaming
        await new Promise(resolve => setTimeout(resolve, 50))
      }
    } catch (error) {
      console.error('Puter streaming error:', error)
      throw new Error(`Puter streaming request failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
} 