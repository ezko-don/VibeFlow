import type { AIModel, AIProvider, Message, CodeContext } from '@vibeflow/shared'

// ============================================================================
// LLM Provider Types
// ============================================================================

export interface LLMProvider {
  name: AIProvider
  models: AIModel[]
  isAvailable: () => Promise<boolean>
  sendMessage: (request: LLMRequest) => Promise<LLMResponse>
  streamMessage?: (request: LLMRequest) => AsyncIterable<LLMStreamChunk>
}

export interface LLMRequest {
  model: AIModel
  messages: Message[]
  maxTokens?: number
  temperature?: number
  stream?: boolean
  context?: string
}

export interface LLMResponse {
  id: string
  content: string
  model: AIModel
  tokens?: {
    prompt: number
    completion: number
    total: number
  }
  finishReason?: 'stop' | 'length' | 'content_filter' | 'tool_calls'
  metadata?: Record<string, any>
}

export interface LLMStreamChunk {
  id: string
  content: string
  delta: string
  done: boolean
  tokens?: number
}

// ============================================================================
// Context Engine Types
// ============================================================================

export interface ContextEngine {
  indexWorkspace: (workspacePath: string) => Promise<void>
  searchContext: (query: string, limit?: number) => Promise<ContextChunk[]>
  addFile: (filePath: string, content: string) => Promise<void>
  removeFile: (filePath: string) => Promise<void>
  updateFile: (filePath: string, content: string) => Promise<void>
  getFileContext: (filePath: string) => Promise<CodeContext | null>
}

export interface ContextChunk {
  id: string
  filePath: string
  content: string
  startLine: number
  endLine: number
  language: string
  symbols: string[]
  dependencies: string[]
  embedding?: number[]
  score?: number
}

// ============================================================================
// Parser Types
// ============================================================================

export interface CodeParser {
  language: string
  parse: (content: string, filePath: string) => Promise<ParseResult>
}

export interface ParseResult {
  symbols: SymbolInfo[]
  dependencies: string[]
  exports: string[]
  imports: ImportInfo[]
  functions: FunctionInfo[]
  classes: ClassInfo[]
  chunks: ContextChunk[]
}

export interface SymbolInfo {
  name: string
  type: 'function' | 'class' | 'variable' | 'interface' | 'type' | 'enum'
  line: number
  column: number
  scope: string
}

export interface ImportInfo {
  module: string
  imports: string[]
  line: number
  isDefault: boolean
}

export interface FunctionInfo {
  name: string
  parameters: ParameterInfo[]
  returnType?: string
  line: number
  docstring?: string
}

export interface ParameterInfo {
  name: string
  type?: string
  optional: boolean
  defaultValue?: string
}

export interface ClassInfo {
  name: string
  methods: FunctionInfo[]
  properties: PropertyInfo[]
  extends?: string
  implements?: string[]
  line: number
  docstring?: string
}

export interface PropertyInfo {
  name: string
  type?: string
  line: number
  access: 'public' | 'private' | 'protected'
}

// ============================================================================
// Agent Types
// ============================================================================

export interface AgentConfig {
  defaultModel: AIModel
  temperature: number
  maxTokens: number
  contextWindow: number
  rateLimits: RateLimitConfig
  providers: ProviderConfig[]
}

export interface ProviderConfig {
  name: AIProvider
  apiKey?: string
  baseUrl?: string
  enabled: boolean
}

export interface RateLimitConfig {
  requestsPerMinute: number
  requestsPerHour: number
  requestsPerDay: number
  tokensPerMinute: number
}

export interface TaskContext {
  workspacePath: string
  currentFile?: string
  selection?: {
    start: { line: number; column: number }
    end: { line: number; column: number }
    text: string
  }
  relatedFiles: string[]
  projectType?: string
}

export interface AgentResponse {
  content: string
  type: 'text' | 'code' | 'diff' | 'file' | 'command'
  files?: FileChange[]
  commands?: Command[]
  metadata?: Record<string, any>
}

export interface FileChange {
  path: string
  action: 'create' | 'update' | 'delete'
  content?: string
  startLine?: number
  endLine?: number
}

export interface Command {
  command: string
  args: string[]
  workingDirectory?: string
}

// ============================================================================
// Autopilot Types
// ============================================================================

export interface AutopilotConfig {
  enabled: boolean
  model: AIModel
  completionThreshold: number
  maxSuggestions: number
  debounceMs: number
}

export interface CodeCompletion {
  id: string
  text: string
  position: { line: number; column: number }
  kind: 'snippet' | 'text' | 'method' | 'function' | 'variable' | 'class' | 'module'
  insertText: string
  detail?: string
  documentation?: string
  sortText?: string
  filterText?: string
}

export interface InlineEdit {
  id: string
  range: {
    start: { line: number; column: number }
    end: { line: number; column: number }
  }
  newText: string
  reason: string
  confidence: number
}

// ============================================================================
// Embedding Types
// ============================================================================

export interface EmbeddingProvider {
  name: string
  generate: (text: string) => Promise<number[]>
  generateBatch: (texts: string[]) => Promise<number[][]>
  dimensions: number
}

export interface VectorStore {
  add: (id: string, vector: number[], metadata?: Record<string, any>) => Promise<void>
  search: (vector: number[], limit: number) => Promise<SearchResult[]>
  update: (id: string, vector: number[], metadata?: Record<string, any>) => Promise<void>
  delete: (id: string) => Promise<void>
  clear: () => Promise<void>
}

export interface SearchResult {
  id: string
  score: number
  metadata?: Record<string, any>
}

// ============================================================================
// Event Types
// ============================================================================

export interface AgentEvent {
  type: string
  timestamp: Date
  data: any
}

export interface AgentEventListener {
  (event: AgentEvent): void
}

export interface EventEmitter {
  on: (event: string, listener: AgentEventListener) => void
  off: (event: string, listener: AgentEventListener) => void
  emit: (event: string, data: any) => void
} 