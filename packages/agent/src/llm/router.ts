import type { 
  LLMProvider, 
  LLMRequest, 
  LLMResponse, 
  LLMStreamChunk,
  AgentConfig 
} from '../types'
import type { AIModel, AIProvider } from '@vibeflow/shared'
import { PuterProvider } from './providers/puter-provider'

/**
 * LLM Router - Manages multiple AI providers with automatic fallback
 * 
 * Priority order:
 * 1. Puter.js (Free Claude API - no keys required)
 * 2. OpenAI API (if key provided)
 * 3. Anthropic API (if key provided)
 * 4. OpenRouter (if key provided)
 */
export class LLMRouter {
  private providers: Map<AIProvider, LLMProvider> = new Map()
  private config: AgentConfig
  private rateLimiter: Map<AIProvider, RateLimitTracker> = new Map()

  constructor(config: AgentConfig) {
    this.config = config
    this.initializeProviders()
  }

  private initializeProviders() {
    // Always include Puter.js as the primary free provider
    const puterProvider = new PuterProvider()
    this.providers.set('local', puterProvider)
    this.rateLimiter.set('local', new RateLimitTracker({
      requestsPerMinute: 100, // Very generous for free service
      requestsPerHour: 1000,
      requestsPerDay: 10000,
      tokensPerMinute: 50000
    }))

    // Initialize other providers based on config
    this.config.providers.forEach(providerConfig => {
      if (providerConfig.enabled && providerConfig.apiKey) {
        switch (providerConfig.name) {
          case 'openai':
            // TODO: Initialize OpenAI provider
            break
          case 'anthropic':
            // TODO: Initialize Anthropic provider
            break
          case 'openrouter':
            // TODO: Initialize OpenRouter provider
            break
        }
      }
    })
  }

  /**
   * Get the best available provider for a given model
   */
  private async getBestProvider(model: AIModel): Promise<LLMProvider | null> {
    // Priority order for providers
    const priorityOrder: AIProvider[] = ['local', 'anthropic', 'openai', 'openrouter']

    for (const providerName of priorityOrder) {
      const provider = this.providers.get(providerName)
      if (!provider) continue

      // Check if provider supports the model
      if (!provider.models.includes(model)) continue

      // Check if provider is available
      if (!await provider.isAvailable()) continue

      // Check rate limits
      const rateLimiter = this.rateLimiter.get(providerName)
      if (rateLimiter && !rateLimiter.canMakeRequest()) {
        console.warn(`Rate limit exceeded for ${providerName}, trying next provider`)
        continue
      }

      return provider
    }

    return null
  }

  /**
   * Send a message using the best available provider
   */
  async sendMessage(request: LLMRequest): Promise<LLMResponse> {
    const provider = await this.getBestProvider(request.model)
    
    if (!provider) {
      throw new Error(`No available provider for model: ${request.model}`)
    }

    try {
      // Track rate limit
      const rateLimiter = this.rateLimiter.get(provider.name)
      if (rateLimiter) {
        rateLimiter.trackRequest()
      }

      const response = await provider.sendMessage(request)

      // Track token usage
      if (rateLimiter && response.tokens) {
        rateLimiter.trackTokens(response.tokens.total)
      }

      return response
    } catch (error) {
      console.error(`Provider ${provider.name} failed:`, error)
      
      // Try fallback provider if available
      const otherProviders = Array.from(this.providers.values())
        .filter(p => p !== provider && p.models.includes(request.model))
      
      if (otherProviders.length > 0) {
        console.log('Trying fallback provider...')
        return otherProviders[0].sendMessage(request)
      }
      
      throw error
    }
  }

  /**
   * Stream a message using the best available provider
   */
  async *streamMessage(request: LLMRequest): AsyncIterable<LLMStreamChunk> {
    const provider = await this.getBestProvider(request.model)
    
    if (!provider) {
      throw new Error(`No available provider for model: ${request.model}`)
    }

    if (!provider.streamMessage) {
      throw new Error(`Provider ${provider.name} does not support streaming`)
    }

    try {
      // Track rate limit
      const rateLimiter = this.rateLimiter.get(provider.name)
      if (rateLimiter) {
        rateLimiter.trackRequest()
      }

      let totalTokens = 0
      for await (const chunk of provider.streamMessage(request)) {
        if (chunk.tokens) {
          totalTokens += chunk.tokens
        }
        yield chunk
      }

      // Track token usage
      if (rateLimiter && totalTokens > 0) {
        rateLimiter.trackTokens(totalTokens)
      }
    } catch (error) {
      console.error(`Streaming failed for provider ${provider.name}:`, error)
      throw error
    }
  }

  /**
   * Get available models from all providers
   */
  async getAvailableModels(): Promise<AIModel[]> {
    const models = new Set<AIModel>()
    
    for (const provider of this.providers.values()) {
      if (await provider.isAvailable()) {
        provider.models.forEach(model => models.add(model))
      }
    }
    
    return Array.from(models)
  }

  /**
   * Get provider status and rate limit info
   */
  async getProviderStatus(): Promise<ProviderStatus[]> {
    const status: ProviderStatus[] = []
    
    for (const [name, provider] of this.providers.entries()) {
      const rateLimiter = this.rateLimiter.get(name)
      const isAvailable = await provider.isAvailable()
      
      status.push({
        name,
        available: isAvailable,
        models: provider.models,
        rateLimits: rateLimiter ? {
          requestsRemaining: rateLimiter.getRequestsRemaining(),
          tokensRemaining: rateLimiter.getTokensRemaining(),
          resetTime: rateLimiter.getResetTime()
        } : null
      })
    }
    
    return status
  }
}

/**
 * Rate limiting tracker for providers
 */
class RateLimitTracker {
  private requests: number[] = []
  private tokens: number[] = []
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.config = config
  }

  canMakeRequest(): boolean {
    this.cleanup()
    
    const now = Date.now()
    const minuteAgo = now - 60 * 1000
    const hourAgo = now - 60 * 60 * 1000
    const dayAgo = now - 24 * 60 * 60 * 1000

    const requestsLastMinute = this.requests.filter(t => t > minuteAgo).length
    const requestsLastHour = this.requests.filter(t => t > hourAgo).length
    const requestsLastDay = this.requests.filter(t => t > dayAgo).length

    return requestsLastMinute < this.config.requestsPerMinute &&
           requestsLastHour < this.config.requestsPerHour &&
           requestsLastDay < this.config.requestsPerDay
  }

  trackRequest(): void {
    this.requests.push(Date.now())
  }

  trackTokens(count: number): void {
    for (let i = 0; i < count; i++) {
      this.tokens.push(Date.now())
    }
  }

  getRequestsRemaining(): number {
    this.cleanup()
    const minuteAgo = Date.now() - 60 * 1000
    const requestsLastMinute = this.requests.filter(t => t > minuteAgo).length
    return Math.max(0, this.config.requestsPerMinute - requestsLastMinute)
  }

  getTokensRemaining(): number {
    this.cleanup()
    const minuteAgo = Date.now() - 60 * 1000
    const tokensLastMinute = this.tokens.filter(t => t > minuteAgo).length
    return Math.max(0, this.config.tokensPerMinute - tokensLastMinute)
  }

  getResetTime(): Date {
    const now = Date.now()
    const minuteAgo = now - 60 * 1000
    const oldestRequest = this.requests.find(t => t > minuteAgo)
    return new Date((oldestRequest || now) + 60 * 1000)
  }

  private cleanup(): void {
    const dayAgo = Date.now() - 24 * 60 * 60 * 1000
    this.requests = this.requests.filter(t => t > dayAgo)
    this.tokens = this.tokens.filter(t => t > dayAgo)
  }
}

// Types
interface RateLimitConfig {
  requestsPerMinute: number
  requestsPerHour: number
  requestsPerDay: number
  tokensPerMinute: number
}

interface ProviderStatus {
  name: AIProvider
  available: boolean
  models: AIModel[]
  rateLimits: {
    requestsRemaining: number
    tokensRemaining: number
    resetTime: Date
  } | null
} 