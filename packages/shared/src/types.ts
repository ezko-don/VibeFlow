import { z } from 'zod'

// ============================================================================
// File System Types
// ============================================================================

export const FileTypeSchema = z.enum(['file', 'folder'])
export type FileType = z.infer<typeof FileTypeSchema>

export const FileNodeSchema: z.ZodType<FileNode> = z.lazy(() =>
  z.object({
    id: z.string(),
    name: z.string(),
    type: FileTypeSchema,
    path: z.string(),
    size: z.number().optional(),
    lastModified: z.date().optional(),
    children: z.array(FileNodeSchema).optional(),
    isOpen: z.boolean().optional(),
    content: z.string().optional(),
  })
)

export type FileNode = {
  id: string
  name: string
  type: FileType
  path: string
  size?: number
  lastModified?: Date
  children?: FileNode[]
  isOpen?: boolean
  content?: string
}

// ============================================================================
// AI Types
// ============================================================================

export const AIModelSchema = z.enum([
  'claude-4',
  'claude-3.5',
  'claude-opus',
  'gpt-4.1-nano',
  'gpt-4-vision',
  'dalle-3'
])

export type AIModel = z.infer<typeof AIModelSchema>

export interface AIProviderInterface {
  name: string
  models: AIModel[]
  isAvailable: () => boolean
  sendMessage: (message: string, options?: any) => Promise<any>
}

export type AIProvider = AIProviderInterface

export const AIProviderTypeSchema = z.enum(['anthropic', 'openai', 'openrouter', 'local'])

export type AIProviderType = z.infer<typeof AIProviderTypeSchema>

export const MessageRoleSchema = z.enum(['user', 'assistant', 'system'])
export type MessageRole = z.infer<typeof MessageRoleSchema>

export const MessageSchema = z.object({
  id: z.string(),
  role: MessageRoleSchema,
  content: z.string(),
  timestamp: z.date(),
  model: AIModelSchema.optional(),
  tokens: z.number().optional(),
  metadata: z.record(z.any()).optional(),
})

export type Message = z.infer<typeof MessageSchema>

export const ConversationSchema = z.object({
  id: z.string(),
  title: z.string(),
  messages: z.array(MessageSchema),
  createdAt: z.date(),
  updatedAt: z.date(),
  metadata: z.record(z.any()).optional(),
})

export type Conversation = z.infer<typeof ConversationSchema>

export const AIRequestSchema = z.object({
  message: z.string(),
  model: AIModelSchema,
  context: z.string().optional(),
  maxTokens: z.number().optional(),
  temperature: z.number().min(0).max(2).optional(),
  conversationId: z.string().optional(),
})

export type AIRequest = z.infer<typeof AIRequestSchema>

export const AIResponseSchema = z.object({
  id: z.string(),
  content: z.string(),
  model: AIModelSchema,
  tokens: z.number().optional(),
  finishReason: z.string().optional(),
  metadata: z.record(z.any()).optional(),
})

export type AIResponse = z.infer<typeof AIResponseSchema>

// ============================================================================
// Editor Types
// ============================================================================

export const LanguageSchema = z.enum([
  'typescript',
  'javascript',
  'tsx',
  'jsx',
  'json',
  'markdown',
  'css',
  'scss',
  'html',
  'python',
  'rust',
  'go',
  'java',
  'c',
  'cpp',
  'plaintext',
])

export type Language = z.infer<typeof LanguageSchema>

export const EditorThemeSchema = z.enum(['dark', 'light', 'system'])
export type EditorTheme = z.infer<typeof EditorThemeSchema>

export const EditorSettingsSchema = z.object({
  fontSize: z.number().min(8).max(72).default(14),
  fontFamily: z.string().default("'JetBrains Mono', monospace"),
  tabSize: z.number().min(1).max(8).default(2),
  insertSpaces: z.boolean().default(true),
  wordWrap: z.boolean().default(true),
  minimap: z.boolean().default(false),
  lineNumbers: z.boolean().default(true),
  theme: EditorThemeSchema.default('dark'),
})

export type EditorSettings = z.infer<typeof EditorSettingsSchema>

export const PositionSchema = z.object({
  line: z.number(),
  column: z.number(),
})

export type Position = z.infer<typeof PositionSchema>

export const RangeSchema = z.object({
  start: PositionSchema,
  end: PositionSchema,
})

export type Range = z.infer<typeof RangeSchema>

export const EditorSelectionSchema = z.object({
  range: RangeSchema,
  text: z.string(),
})

export type EditorSelection = z.infer<typeof EditorSelectionSchema>

// ============================================================================
// Terminal Types
// ============================================================================

export const TerminalLineTypeSchema = z.enum(['command', 'output', 'error'])
export type TerminalLineType = z.infer<typeof TerminalLineTypeSchema>

export const TerminalLineSchema = z.object({
  id: z.string(),
  type: TerminalLineTypeSchema,
  content: z.string(),
  timestamp: z.date(),
  exitCode: z.number().optional(),
})

export type TerminalLine = z.infer<typeof TerminalLineSchema>

export const TerminalSessionSchema = z.object({
  id: z.string(),
  name: z.string(),
  workingDirectory: z.string(),
  history: z.array(TerminalLineSchema),
  createdAt: z.date(),
  isActive: z.boolean(),
})

export type TerminalSession = z.infer<typeof TerminalSessionSchema>

// ============================================================================
// Project Types
// ============================================================================

export const ProjectTypeSchema = z.enum([
  'javascript',
  'typescript',
  'react',
  'nextjs',
  'vue',
  'svelte',
  'node',
  'python',
  'rust',
  'go',
  'java',
  'other',
])

export type ProjectType = z.infer<typeof ProjectTypeSchema>

export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  path: z.string(),
  type: ProjectTypeSchema,
  description: z.string().optional(),
  files: z.array(FileNodeSchema),
  settings: z.record(z.any()).optional(),
  createdAt: z.date(),
  lastOpened: z.date().optional(),
})

export type Project = z.infer<typeof ProjectSchema>

// ============================================================================
// Context Engine Types
// ============================================================================

export const CodeContextSchema = z.object({
  filePath: z.string(),
  content: z.string(),
  chunks: z.array(z.any()).optional(),
  language: LanguageSchema.optional(),
  functions: z.array(z.string()),
  classes: z.array(z.string()),
  imports: z.array(z.string()),
  exports: z.array(z.string()),
  variables: z.array(z.string()).optional(),
  dependencies: z.array(z.string()).optional(),
  symbols: z.array(z.string()).optional(),
})

export type CodeContext = z.infer<typeof CodeContextSchema>

export const ContextChunkSchema = z.object({
  id: z.string(),
  content: z.string(),
  startLine: z.number(),
  endLine: z.number(),
  type: z.string(),
  filePath: z.string().optional(),
  language: LanguageSchema.optional(),
  embedding: z.array(z.number()).optional(),
  metadata: z.record(z.any()).optional(),
})

export type ContextChunk = z.infer<typeof ContextChunkSchema>

// ============================================================================
// Agent Types
// ============================================================================

export const AgentModeSchema = z.enum(['agent', 'autopilot'])
export type AgentMode = z.infer<typeof AgentModeSchema>

export const AgentTaskTypeSchema = z.enum([
  'code_generation',
  'code_completion',
  'code_review',
  'debugging',
  'refactoring',
  'testing',
  'documentation',
  'explanation',
  'review',
])

export type AgentTaskType = z.infer<typeof AgentTaskTypeSchema>

export const AgentTaskSchema = z.object({
  id: z.string(),
  type: AgentTaskTypeSchema,
  description: z.string(),
  context: z.any().optional(),
  files: z.array(z.string()).optional(),
  status: z.enum(['pending', 'running', 'completed', 'failed']),
  result: z.string().optional(),
  error: z.string().optional(),
  createdAt: z.date(),
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
})

export type AgentTask = z.infer<typeof AgentTaskSchema>

// ============================================================================
// Error Types
// ============================================================================

export const ErrorSeveritySchema = z.enum(['error', 'warning', 'info'])
export type ErrorSeverity = z.infer<typeof ErrorSeveritySchema>

export const DiagnosticSchema = z.object({
  id: z.string(),
  filePath: z.string(),
  range: RangeSchema,
  message: z.string(),
  severity: ErrorSeveritySchema,
  code: z.string().optional(),
  source: z.string().optional(),
})

export type Diagnostic = z.infer<typeof DiagnosticSchema>

// ============================================================================
// Settings Types
// ============================================================================

export const AppSettingsSchema = z.object({
  editor: EditorSettingsSchema,
  ai: z.object({
    defaultModel: AIModelSchema.default('claude-4'),
    temperature: z.number().min(0).max(2).default(0.7),
    maxTokens: z.number().default(4000),
    contextWindow: z.number().default(200000),
  }),
  terminal: z.object({
    shell: z.string().optional(),
    fontSize: z.number().default(14),
    fontFamily: z.string().default("'JetBrains Mono', monospace"),
  }),
  theme: EditorThemeSchema.default('system'),
  keybindings: z.record(z.string()).optional(),
})

export type AppSettings = z.infer<typeof AppSettingsSchema>