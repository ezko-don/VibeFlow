// Local Message type definition (temporary until shared package is properly set up)
interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  model?: string
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

/**
 * AI Service for VibeFlow Web App
 * Uses Puter.js for free unlimited Claude API access
 */
export class AIService {
  private static instance: AIService | null = null

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService()
    }
    return AIService.instance
  }

  private constructor() {}

  /**
   * Check if Puter.js is available
   */
  isAvailable(): boolean {
    return typeof window !== 'undefined' && 
           typeof window.puter !== 'undefined' && 
           typeof window.puter.ai !== 'undefined' &&
           typeof window.puter.ai.chat === 'function'
  }

  /**
   * Convert messages to a single prompt for Puter.js
   */
  private messagesToPrompt(messages: Message[]): string {
    return messages
      .filter(msg => msg.role !== 'system') // Skip system messages for now
      .map(msg => {
        if (msg.role === 'user') {
          return `Human: ${msg.content}`
        } else {
          return `Assistant: ${msg.content}`
        }
      })
      .join('\n\n') + '\n\nAssistant:'
  }

  /**
   * Extract content from Puter.js response
   */
  private extractContent(response: any): string {
    console.log('🔍 Raw Puter.js response:', response)
    
    // Handle the actual Puter.js format: r.message.content[0].text
    if (response && response.message && response.message.content && Array.isArray(response.message.content)) {
      const content = response.message.content[0]
      if (content && content.text && typeof content.text === 'string') {
        return content.text
      }
    }
    
    // Handle direct string response
    if (typeof response === 'string') {
      return response
    }
    
    // Handle object response with message property (fallback)
    if (response && typeof response === 'object') {
      if (response.message && typeof response.message === 'string') {
        return response.message
      }
      
      // Handle OpenAI-style response (fallback)
      if (response.choices && Array.isArray(response.choices) && response.choices.length > 0) {
        const choice = response.choices[0]
        if (choice.message && choice.message.content) {
          return choice.message.content
        }
        if (choice.text) {
          return choice.text
        }
      }
      
      // Handle direct content property (fallback)
      if (response.content && typeof response.content === 'string') {
        return response.content
      }
      
      // Handle text property (fallback)
      if (response.text && typeof response.text === 'string') {
        return response.text
      }
    }
    
    // If we can't extract content, throw an error with detailed info
    const responseInfo = typeof response === 'object' && response ? {
      keys: Object.keys(response),
      messageKeys: response.message ? Object.keys(response.message) : null,
      contentLength: response.message?.content?.length || null,
      firstContentKeys: response.message?.content?.[0] ? Object.keys(response.message.content[0]) : null
    } : null
    
    throw new Error(`Unable to extract content from response. Response type: ${typeof response}, structure: ${JSON.stringify(responseInfo, null, 2)}`)
  }

  /**
   * Send a message to AI via Puter.js
   */
  async sendMessage(
    messages: Message[], 
    model: 'claude-3.5-sonnet' | 'gpt-4o' = 'claude-3.5-sonnet',
    options: {
      temperature?: number
      maxTokens?: number
    } = {}
  ): Promise<{
    content: string
    model: string
    tokens?: {
      prompt: number
      completion: number
      total: number
    }
  }> {
    if (!this.isAvailable()) {
      throw new Error('Puter.js is not available. Please ensure the script is loaded and try again.')
    }

    try {
      // Convert messages to prompt format
      const prompt = this.messagesToPrompt(messages)

      // Map our model names to Puter.js model names
      const modelMap: Record<string, string> = {
        'claude-3.5-sonnet': 'claude-sonnet-4',
        'gpt-4o': 'gpt-4o'
      }

      const puterModel = modelMap[model] || 'claude-3-5-sonnet'

      console.log('🤖 Sending request to Puter.js:', {
        model: puterModel,
        promptLength: prompt.length,
        prompt: prompt.substring(0, 100) + '...'
      })

      // Send request using simplified Puter.js API
      const rawResponse = await window.puter.ai.chat(prompt, {
        model: puterModel,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 4000,
        stream: false
      })

      // Extract content from response
      const content = this.extractContent(rawResponse)

      console.log('✅ Processed response from Puter.js:', content.substring(0, 100) + '...')

      return {
        content,
        model: model,
        tokens: undefined // Puter.js simplified API doesn't return token counts
      }
    } catch (error) {
      console.error('❌ Puter.js AI request failed:', error)
      
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
    model: 'claude-3.5-sonnet' | 'gpt-4o' = 'claude-3.5-sonnet',
    options: {
      temperature?: number
      maxTokens?: number
    } = {}
  ): AsyncIterable<{ delta: string; content: string; done: boolean }> {
    if (!this.isAvailable()) {
      throw new Error('Puter.js is not available. Please ensure the script is loaded and try again.')
    }

    try {
      const prompt = this.messagesToPrompt(messages)
      const modelMap: Record<string, string> = {
        'claude-3.5-sonnet': 'claude-sonnet-4',
        'gpt-4o': 'gpt-4o'
      }

      const puterModel = modelMap[model] || 'claude-3-5-sonnet'

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
  getAvailableModels(): Array<{ id: string; name: string; provider: string }> {
    if (!this.isAvailable()) {
      return []
    }

    return [
      {
        id: 'claude-3.5-sonnet',
        name: 'Claude Sonnet 4',
        provider: 'Puter.js (Free)'
      },
      {
        id: 'gpt-4o',
        name: 'GPT-4o',
        provider: 'Puter.js (Free)'
      }
    ]
  }

  /**
   * Check service status
   */
  getStatus(): {
    available: boolean
    provider: string
    models: number
    rateLimits?: {
      unlimited: boolean
      note: string
    }
  } {
    const available = this.isAvailable()
    
    return {
      available,
      provider: available ? 'Puter.js' : 'Not loaded',
      models: available ? this.getAvailableModels().length : 0,
      rateLimits: available ? {
        unlimited: true,
        note: 'User pays model - unlimited usage'
      } : undefined
    }
  }
}

// Export singleton instance
export const aiService = AIService.getInstance()

// Export types for use in components
export type { Message } 