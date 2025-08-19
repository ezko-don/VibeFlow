import type { AIModel, AIProviderInterface } from '@vibeflow/shared'

// Local Message type definition (temporary until shared package is properly set up)
export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  model?: AIModel
  tokens?: number
}

// Simplified Puter.js interface based on current API
interface PuterAPI {
  ai: {
    chat: (prompt: string, options?: {
      model?: string
      stream?: boolean
      temperature?: number
      max_tokens?: number
    }) => Promise<any> // Changed to any to handle different response types
  }
}

declare global {
  interface Window {
    puter: PuterAPI
  }
}

export interface AIStatus {
  available: boolean
  rateLimits?: {
    note: string
  }
}

/**
 * AI Service for VibeFlow Web App
 */
export class AIService implements AIProviderInterface {
  private static instance: AIService | null = null
  name = 'AI Service'
  models: AIModel[] = [
    'claude-4',
    'claude-3.5',
    'claude-opus',
    'gpt-4.1-nano',
    'gpt-4-vision',
    'dalle-3'
  ]

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService()
    }
    return AIService.instance
  }

  isAvailable(): boolean {
    return typeof window !== 'undefined' && 
           'puter' in window && 
           window.puter && 
           window.puter.ai && 
           typeof window.puter.ai.chat === 'function'
  }

  getStatus(): AIStatus {
    return {
      available: this.isAvailable(),
      rateLimits: this.isAvailable() ? { note: 'Ready' } : undefined
    }
  }

  private messagesToPrompt(messages: Message[]): string {
    return messages
      .map(m => `${m.role === 'user' ? 'Human' : 'Assistant'}: ${m.content}`)
      .join('\n\n') + '\n\nAssistant:'
  }

  private extractContent(response: any): string {
    try {
      if (response?.message?.content?.[0]?.text) {
        return response.message.content[0].text
      }
      if (typeof response === 'string') {
        return response
      }
      throw new Error('Unable to extract content from response')
    } catch (error) {
      console.error('Error extracting content:', error)
      throw error
    }
  }

  /**
   * Send a message to AI
   */
  async sendMessage(
    messages: Message[], 
    model: AIModel = 'claude-4',
    options: {
      temperature?: number
      maxTokens?: number
    } = {}
  ): Promise<{
    content: string
    model: AIModel
    tokens?: {
      prompt: number
      completion: number
      total: number
    }
  }> {
    if (!this.isAvailable()) {
      throw new Error('AI service is not available. Please ensure the script is loaded and try again.')
    }

    try {
      // Convert messages to prompt format
      const prompt = this.messagesToPrompt(messages)

      // Map our model names to Puter.js model names
      const modelMap: Record<AIModel, string> = {
        'claude-4': 'claude-sonnet-4',
        'claude-3.5': 'claude-3-5-sonnet',
        'claude-opus': 'claude-opus-4',
        'gpt-4.1-nano': 'gpt-4-nano',
        'gpt-4-vision': 'gpt-4-vision',
        'dalle-3': 'dalle-3'
      }

      const puterModel = modelMap[model] || 'claude-sonnet-4'

      console.log('🤖 Sending request to AI:', {
        model: puterModel,
        promptLength: prompt.length,
        prompt: prompt.substring(0, 100) + '...'
      })

      // Send request using Puter.js API
      const rawResponse = await window.puter.ai.chat(prompt, {
        model: puterModel,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 4000,
        stream: false
      })

      // Extract content from response
      const content = this.extractContent(rawResponse)

      console.log('✅ Processed response:', content.substring(0, 100) + '...')

      return {
        content,
        model: model,
        tokens: undefined // Token counts not available
      }
    } catch (error) {
      console.error('❌ AI request failed:', error)
      
      // Provide helpful error messages
      if (error instanceof Error) {
        if (error.message.includes('network') || error.message.includes('fetch')) {
          throw new Error('Network error: Please check your internet connection.')
        } else if (error.message.includes('rate limit')) {
          throw new Error('Rate limit exceeded. Please wait a moment and try again.')
        } else if (error.message.includes('authentication') || error.message.includes('auth')) {
          throw new Error('Authentication required. Please sign in to use AI features.')
        } else if (error.message.includes('Unable to extract content')) {
          throw new Error('Invalid response format from AI service. Please try again.')
        } else {
          throw new Error(`AI request failed: ${error.message}`)
        }
      }
      
      throw new Error('Unknown error occurred while processing AI request.')
    }
  }

  /**
   * Stream a message response
   */
  async *streamMessage(
    messages: Message[], 
    model: AIModel = 'claude-4',
    options: {
      temperature?: number
      maxTokens?: number
    } = {}
  ): AsyncIterable<{ delta: string; content: string; done: boolean }> {
    if (!this.isAvailable()) {
      throw new Error('AI service is not available. Please ensure the script is loaded and try again.')
    }

    try {
      const prompt = this.messagesToPrompt(messages)
      const modelMap: Record<AIModel, string> = {
        'claude-4': 'claude-sonnet-4',
        'claude-3.5': 'claude-3-5-sonnet',
        'claude-opus': 'claude-opus-4',
        'gpt-4.1-nano': 'gpt-4-nano',
        'gpt-4-vision': 'gpt-4-vision',
        'dalle-3': 'dalle-3'
      }

      const puterModel = modelMap[model] || 'claude-sonnet-4'

      const response = await window.puter.ai.chat(prompt, {
        model: puterModel,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 4000,
        stream: true
      })

      let accumulated = ''
      
      // Handle different streaming response formats
      if (response && typeof response[Symbol.asyncIterator] === 'function') {
        for await (const part of response) {
          if (part && part.text) {
            accumulated += part.text
            yield {
              delta: part.text,
              content: accumulated,
              done: false
            }
          }
        }
      } else {
        // Fallback: use non-streaming if streaming fails
        const content = this.extractContent(response)
        // Simulate streaming by breaking response into chunks
        const words = content.split(' ')
        
        for (let i = 0; i < words.length; i++) {
          const word = words[i]
          const delta = i === 0 ? word : ' ' + word
          accumulated += delta
          
          yield {
            delta,
            content: accumulated,
            done: i === words.length - 1
          }
          
          // Add delay to simulate streaming
          await new Promise(resolve => setTimeout(resolve, 30 + Math.random() * 70))
        }
      }

      yield {
        delta: '',
        content: accumulated,
        done: true
      }
    } catch (error) {
      throw error
    }
  }

  /**
   * Get available models
   */
  getAvailableModels(): Array<{ id: AIModel; name: string; provider: string }> {
    if (!this.isAvailable()) {
      return []
    }

    return [
      {
        id: 'claude-4',
        name: 'Claude 4',
        provider: 'Free'
      },
      {
        id: 'claude-3.5',
        name: 'Claude 3.5',
        provider: 'Free'
      },
      {
        id: 'claude-opus',
        name: 'Claude Opus',
        provider: 'Free'
      },
      {
        id: 'gpt-4.1-nano',
        name: 'GPT-4.1 Nano',
        provider: 'Free'
      },
      {
        id: 'gpt-4-vision',
        name: 'GPT-4 Vision',
        provider: 'Free'
      },
      {
        id: 'dalle-3',
        name: 'DALL·E 3',
        provider: 'Free'
      }
    ]
  }
}

// Export singleton instance
export const aiService = AIService.getInstance()

// Export types for use in components
export type { Message } 