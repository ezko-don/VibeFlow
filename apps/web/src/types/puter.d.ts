// Type definitions for Puter.js v2
// Based on https://developer.puter.com/tutorials/free-unlimited-claude-35-sonnet-api/

declare global {
  interface Window {
    puter: PuterAPI
  }
}

export interface PuterAPI {
  ai: {
    chat: (options: PuterChatOptions) => Promise<PuterChatResponse>
  }
}

export interface PuterChatOptions {
  messages: PuterMessage[]
  model?: 'claude-3-5-sonnet' | 'claude-3-opus' | 'gpt-4' | 'gpt-3.5-turbo'
  stream?: boolean
  temperature?: number
  max_tokens?: number
}

export interface PuterMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface PuterChatResponse {
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

export interface PuterStreamResponse extends PuterChatResponse {
  done: boolean
  delta?: {
    content?: string
    role?: string
  }
}

// For streaming responses
export type PuterStreamCallback = (chunk: PuterStreamResponse) => void

// Extend the existing window object
declare const puter: PuterAPI 