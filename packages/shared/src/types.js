import { z } from 'zod';
// ============================================================================
// File System Types
// ============================================================================
export const FileTypeSchema = z.enum(['file', 'folder']);
export const FileNodeSchema = z.lazy(() => z.object({
    id: z.string(),
    name: z.string(),
    type: FileTypeSchema,
    path: z.string(),
    size: z.number().optional(),
    lastModified: z.date().optional(),
    children: z.array(FileNodeSchema).optional(),
    isOpen: z.boolean().optional(),
    content: z.string().optional(),
}));
// ============================================================================
// AI Types
// ============================================================================
export const AIModelSchema = z.enum(['claude-3.5-sonnet', 'gpt-4o', 'gpt-4-turbo', 'local-llama']);
export const AIProviderSchema = z.enum(['anthropic', 'openai', 'openrouter', 'local']);
export const MessageRoleSchema = z.enum(['user', 'assistant', 'system']);
export const MessageSchema = z.object({
    id: z.string(),
    role: MessageRoleSchema,
    content: z.string(),
    timestamp: z.date(),
    model: AIModelSchema.optional(),
    tokens: z.number().optional(),
    metadata: z.record(z.any()).optional(),
});
export const ConversationSchema = z.object({
    id: z.string(),
    title: z.string(),
    messages: z.array(MessageSchema),
    createdAt: z.date(),
    updatedAt: z.date(),
    metadata: z.record(z.any()).optional(),
});
export const AIRequestSchema = z.object({
    message: z.string(),
    model: AIModelSchema,
    context: z.string().optional(),
    maxTokens: z.number().optional(),
    temperature: z.number().min(0).max(2).optional(),
    conversationId: z.string().optional(),
});
export const AIResponseSchema = z.object({
    id: z.string(),
    content: z.string(),
    model: AIModelSchema,
    tokens: z.number().optional(),
    finishReason: z.string().optional(),
    metadata: z.record(z.any()).optional(),
});
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
]);
export const EditorThemeSchema = z.enum(['dark', 'light', 'system']);
export const EditorSettingsSchema = z.object({
    fontSize: z.number().min(8).max(72).default(14),
    fontFamily: z.string().default("'JetBrains Mono', monospace"),
    tabSize: z.number().min(1).max(8).default(2),
    insertSpaces: z.boolean().default(true),
    wordWrap: z.boolean().default(true),
    minimap: z.boolean().default(false),
    lineNumbers: z.boolean().default(true),
    theme: EditorThemeSchema.default('dark'),
});
export const PositionSchema = z.object({
    line: z.number(),
    column: z.number(),
});
export const RangeSchema = z.object({
    start: PositionSchema,
    end: PositionSchema,
});
export const EditorSelectionSchema = z.object({
    range: RangeSchema,
    text: z.string(),
});
// ============================================================================
// Terminal Types
// ============================================================================
export const TerminalLineTypeSchema = z.enum(['command', 'output', 'error']);
export const TerminalLineSchema = z.object({
    id: z.string(),
    type: TerminalLineTypeSchema,
    content: z.string(),
    timestamp: z.date(),
    exitCode: z.number().optional(),
});
export const TerminalSessionSchema = z.object({
    id: z.string(),
    name: z.string(),
    workingDirectory: z.string(),
    history: z.array(TerminalLineSchema),
    createdAt: z.date(),
    isActive: z.boolean(),
});
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
]);
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
});
// ============================================================================
// Context Engine Types
// ============================================================================
export const CodeContextSchema = z.object({
    filePath: z.string(),
    language: LanguageSchema,
    content: z.string(),
    functions: z.array(z.string()),
    classes: z.array(z.string()),
    imports: z.array(z.string()),
    exports: z.array(z.string()),
    dependencies: z.array(z.string()),
    symbols: z.array(z.string()),
});
export const ContextChunkSchema = z.object({
    id: z.string(),
    content: z.string(),
    filePath: z.string(),
    startLine: z.number(),
    endLine: z.number(),
    language: LanguageSchema,
    embedding: z.array(z.number()).optional(),
    metadata: z.record(z.any()).optional(),
});
// ============================================================================
// Agent Types
// ============================================================================
export const AgentModeSchema = z.enum(['agent', 'autopilot']);
export const AgentTaskTypeSchema = z.enum([
    'code-generation',
    'code-completion',
    'debugging',
    'refactoring',
    'testing',
    'documentation',
    'explanation',
    'review',
]);
export const AgentTaskSchema = z.object({
    id: z.string(),
    type: AgentTaskTypeSchema,
    description: z.string(),
    context: z.string().optional(),
    files: z.array(z.string()).optional(),
    status: z.enum(['pending', 'in-progress', 'completed', 'failed']),
    result: z.string().optional(),
    error: z.string().optional(),
    createdAt: z.date(),
    completedAt: z.date().optional(),
});
// ============================================================================
// Error Types
// ============================================================================
export const ErrorSeveritySchema = z.enum(['error', 'warning', 'info']);
export const DiagnosticSchema = z.object({
    id: z.string(),
    filePath: z.string(),
    range: RangeSchema,
    message: z.string(),
    severity: ErrorSeveritySchema,
    code: z.string().optional(),
    source: z.string().optional(),
});
// ============================================================================
// Settings Types
// ============================================================================
export const AppSettingsSchema = z.object({
    editor: EditorSettingsSchema,
    ai: z.object({
        defaultModel: AIModelSchema.default('claude-3.5-sonnet'),
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
});
