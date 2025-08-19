import { z } from 'zod';
export declare const FileTypeSchema: z.ZodEnum<["file", "folder"]>;
export type FileType = z.infer<typeof FileTypeSchema>;
export declare const FileNodeSchema: z.ZodType<FileNode>;
export type FileNode = {
    id: string;
    name: string;
    type: FileType;
    path: string;
    size?: number;
    lastModified?: Date;
    children?: FileNode[];
    isOpen?: boolean;
    content?: string;
};
export declare const AIModelSchema: z.ZodEnum<["claude-4", "claude-3.5", "claude-opus", "gpt-4.1-nano", "gpt-4-vision", "dalle-3"]>;
export type AIModel = z.infer<typeof AIModelSchema>;
export interface AIProviderInterface {
    name: string;
    models: AIModel[];
    isAvailable: () => boolean;
    sendMessage: (message: string, options?: any) => Promise<any>;
}
export type AIProvider = AIProviderInterface;
export declare const AIProviderTypeSchema: z.ZodEnum<["anthropic", "openai", "openrouter", "local"]>;
export type AIProviderType = z.infer<typeof AIProviderTypeSchema>;
export declare const MessageRoleSchema: z.ZodEnum<["user", "assistant", "system"]>;
export type MessageRole = z.infer<typeof MessageRoleSchema>;
export declare const MessageSchema: z.ZodObject<{
    id: z.ZodString;
    role: z.ZodEnum<["user", "assistant", "system"]>;
    content: z.ZodString;
    timestamp: z.ZodDate;
    model: z.ZodOptional<z.ZodEnum<["claude-4", "claude-3.5", "claude-opus", "gpt-4.1-nano", "gpt-4-vision", "dalle-3"]>>;
    tokens: z.ZodOptional<z.ZodNumber>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    role: "user" | "assistant" | "system";
    content: string;
    timestamp: Date;
    model?: "claude-4" | "claude-3.5" | "claude-opus" | "gpt-4.1-nano" | "gpt-4-vision" | "dalle-3" | undefined;
    tokens?: number | undefined;
    metadata?: Record<string, any> | undefined;
}, {
    id: string;
    role: "user" | "assistant" | "system";
    content: string;
    timestamp: Date;
    model?: "claude-4" | "claude-3.5" | "claude-opus" | "gpt-4.1-nano" | "gpt-4-vision" | "dalle-3" | undefined;
    tokens?: number | undefined;
    metadata?: Record<string, any> | undefined;
}>;
export type Message = z.infer<typeof MessageSchema>;
export declare const ConversationSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    messages: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        role: z.ZodEnum<["user", "assistant", "system"]>;
        content: z.ZodString;
        timestamp: z.ZodDate;
        model: z.ZodOptional<z.ZodEnum<["claude-4", "claude-3.5", "claude-opus", "gpt-4.1-nano", "gpt-4-vision", "dalle-3"]>>;
        tokens: z.ZodOptional<z.ZodNumber>;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        role: "user" | "assistant" | "system";
        content: string;
        timestamp: Date;
        model?: "claude-4" | "claude-3.5" | "claude-opus" | "gpt-4.1-nano" | "gpt-4-vision" | "dalle-3" | undefined;
        tokens?: number | undefined;
        metadata?: Record<string, any> | undefined;
    }, {
        id: string;
        role: "user" | "assistant" | "system";
        content: string;
        timestamp: Date;
        model?: "claude-4" | "claude-3.5" | "claude-opus" | "gpt-4.1-nano" | "gpt-4-vision" | "dalle-3" | undefined;
        tokens?: number | undefined;
        metadata?: Record<string, any> | undefined;
    }>, "many">;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    title: string;
    messages: {
        id: string;
        role: "user" | "assistant" | "system";
        content: string;
        timestamp: Date;
        model?: "claude-4" | "claude-3.5" | "claude-opus" | "gpt-4.1-nano" | "gpt-4-vision" | "dalle-3" | undefined;
        tokens?: number | undefined;
        metadata?: Record<string, any> | undefined;
    }[];
    createdAt: Date;
    updatedAt: Date;
    metadata?: Record<string, any> | undefined;
}, {
    id: string;
    title: string;
    messages: {
        id: string;
        role: "user" | "assistant" | "system";
        content: string;
        timestamp: Date;
        model?: "claude-4" | "claude-3.5" | "claude-opus" | "gpt-4.1-nano" | "gpt-4-vision" | "dalle-3" | undefined;
        tokens?: number | undefined;
        metadata?: Record<string, any> | undefined;
    }[];
    createdAt: Date;
    updatedAt: Date;
    metadata?: Record<string, any> | undefined;
}>;
export type Conversation = z.infer<typeof ConversationSchema>;
export declare const AIRequestSchema: z.ZodObject<{
    message: z.ZodString;
    model: z.ZodEnum<["claude-4", "claude-3.5", "claude-opus", "gpt-4.1-nano", "gpt-4-vision", "dalle-3"]>;
    context: z.ZodOptional<z.ZodString>;
    maxTokens: z.ZodOptional<z.ZodNumber>;
    temperature: z.ZodOptional<z.ZodNumber>;
    conversationId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    model: "claude-4" | "claude-3.5" | "claude-opus" | "gpt-4.1-nano" | "gpt-4-vision" | "dalle-3";
    message: string;
    context?: string | undefined;
    maxTokens?: number | undefined;
    temperature?: number | undefined;
    conversationId?: string | undefined;
}, {
    model: "claude-4" | "claude-3.5" | "claude-opus" | "gpt-4.1-nano" | "gpt-4-vision" | "dalle-3";
    message: string;
    context?: string | undefined;
    maxTokens?: number | undefined;
    temperature?: number | undefined;
    conversationId?: string | undefined;
}>;
export type AIRequest = z.infer<typeof AIRequestSchema>;
export declare const AIResponseSchema: z.ZodObject<{
    id: z.ZodString;
    content: z.ZodString;
    model: z.ZodEnum<["claude-4", "claude-3.5", "claude-opus", "gpt-4.1-nano", "gpt-4-vision", "dalle-3"]>;
    tokens: z.ZodOptional<z.ZodNumber>;
    finishReason: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    content: string;
    model: "claude-4" | "claude-3.5" | "claude-opus" | "gpt-4.1-nano" | "gpt-4-vision" | "dalle-3";
    tokens?: number | undefined;
    metadata?: Record<string, any> | undefined;
    finishReason?: string | undefined;
}, {
    id: string;
    content: string;
    model: "claude-4" | "claude-3.5" | "claude-opus" | "gpt-4.1-nano" | "gpt-4-vision" | "dalle-3";
    tokens?: number | undefined;
    metadata?: Record<string, any> | undefined;
    finishReason?: string | undefined;
}>;
export type AIResponse = z.infer<typeof AIResponseSchema>;
export declare const LanguageSchema: z.ZodEnum<["typescript", "javascript", "tsx", "jsx", "json", "markdown", "css", "scss", "html", "python", "rust", "go", "java", "c", "cpp", "plaintext"]>;
export type Language = z.infer<typeof LanguageSchema>;
export declare const EditorThemeSchema: z.ZodEnum<["dark", "light", "system"]>;
export type EditorTheme = z.infer<typeof EditorThemeSchema>;
export declare const EditorSettingsSchema: z.ZodObject<{
    fontSize: z.ZodDefault<z.ZodNumber>;
    fontFamily: z.ZodDefault<z.ZodString>;
    tabSize: z.ZodDefault<z.ZodNumber>;
    insertSpaces: z.ZodDefault<z.ZodBoolean>;
    wordWrap: z.ZodDefault<z.ZodBoolean>;
    minimap: z.ZodDefault<z.ZodBoolean>;
    lineNumbers: z.ZodDefault<z.ZodBoolean>;
    theme: z.ZodDefault<z.ZodEnum<["dark", "light", "system"]>>;
}, "strip", z.ZodTypeAny, {
    fontSize: number;
    fontFamily: string;
    tabSize: number;
    insertSpaces: boolean;
    wordWrap: boolean;
    minimap: boolean;
    lineNumbers: boolean;
    theme: "system" | "dark" | "light";
}, {
    fontSize?: number | undefined;
    fontFamily?: string | undefined;
    tabSize?: number | undefined;
    insertSpaces?: boolean | undefined;
    wordWrap?: boolean | undefined;
    minimap?: boolean | undefined;
    lineNumbers?: boolean | undefined;
    theme?: "system" | "dark" | "light" | undefined;
}>;
export type EditorSettings = z.infer<typeof EditorSettingsSchema>;
export declare const PositionSchema: z.ZodObject<{
    line: z.ZodNumber;
    column: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    line: number;
    column: number;
}, {
    line: number;
    column: number;
}>;
export type Position = z.infer<typeof PositionSchema>;
export declare const RangeSchema: z.ZodObject<{
    start: z.ZodObject<{
        line: z.ZodNumber;
        column: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        line: number;
        column: number;
    }, {
        line: number;
        column: number;
    }>;
    end: z.ZodObject<{
        line: z.ZodNumber;
        column: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        line: number;
        column: number;
    }, {
        line: number;
        column: number;
    }>;
}, "strip", z.ZodTypeAny, {
    start: {
        line: number;
        column: number;
    };
    end: {
        line: number;
        column: number;
    };
}, {
    start: {
        line: number;
        column: number;
    };
    end: {
        line: number;
        column: number;
    };
}>;
export type Range = z.infer<typeof RangeSchema>;
export declare const EditorSelectionSchema: z.ZodObject<{
    range: z.ZodObject<{
        start: z.ZodObject<{
            line: z.ZodNumber;
            column: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            line: number;
            column: number;
        }, {
            line: number;
            column: number;
        }>;
        end: z.ZodObject<{
            line: z.ZodNumber;
            column: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            line: number;
            column: number;
        }, {
            line: number;
            column: number;
        }>;
    }, "strip", z.ZodTypeAny, {
        start: {
            line: number;
            column: number;
        };
        end: {
            line: number;
            column: number;
        };
    }, {
        start: {
            line: number;
            column: number;
        };
        end: {
            line: number;
            column: number;
        };
    }>;
    text: z.ZodString;
}, "strip", z.ZodTypeAny, {
    range: {
        start: {
            line: number;
            column: number;
        };
        end: {
            line: number;
            column: number;
        };
    };
    text: string;
}, {
    range: {
        start: {
            line: number;
            column: number;
        };
        end: {
            line: number;
            column: number;
        };
    };
    text: string;
}>;
export type EditorSelection = z.infer<typeof EditorSelectionSchema>;
export declare const TerminalLineTypeSchema: z.ZodEnum<["command", "output", "error"]>;
export type TerminalLineType = z.infer<typeof TerminalLineTypeSchema>;
export declare const TerminalLineSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodEnum<["command", "output", "error"]>;
    content: z.ZodString;
    timestamp: z.ZodDate;
    exitCode: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    id: string;
    content: string;
    timestamp: Date;
    type: "command" | "output" | "error";
    exitCode?: number | undefined;
}, {
    id: string;
    content: string;
    timestamp: Date;
    type: "command" | "output" | "error";
    exitCode?: number | undefined;
}>;
export type TerminalLine = z.infer<typeof TerminalLineSchema>;
export declare const TerminalSessionSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    workingDirectory: z.ZodString;
    history: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodEnum<["command", "output", "error"]>;
        content: z.ZodString;
        timestamp: z.ZodDate;
        exitCode: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        content: string;
        timestamp: Date;
        type: "command" | "output" | "error";
        exitCode?: number | undefined;
    }, {
        id: string;
        content: string;
        timestamp: Date;
        type: "command" | "output" | "error";
        exitCode?: number | undefined;
    }>, "many">;
    createdAt: z.ZodDate;
    isActive: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: Date;
    name: string;
    workingDirectory: string;
    history: {
        id: string;
        content: string;
        timestamp: Date;
        type: "command" | "output" | "error";
        exitCode?: number | undefined;
    }[];
    isActive: boolean;
}, {
    id: string;
    createdAt: Date;
    name: string;
    workingDirectory: string;
    history: {
        id: string;
        content: string;
        timestamp: Date;
        type: "command" | "output" | "error";
        exitCode?: number | undefined;
    }[];
    isActive: boolean;
}>;
export type TerminalSession = z.infer<typeof TerminalSessionSchema>;
export declare const ProjectTypeSchema: z.ZodEnum<["javascript", "typescript", "react", "nextjs", "vue", "svelte", "node", "python", "rust", "go", "java", "other"]>;
export type ProjectType = z.infer<typeof ProjectTypeSchema>;
export declare const ProjectSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    path: z.ZodString;
    type: z.ZodEnum<["javascript", "typescript", "react", "nextjs", "vue", "svelte", "node", "python", "rust", "go", "java", "other"]>;
    description: z.ZodOptional<z.ZodString>;
    files: z.ZodArray<z.ZodType<FileNode, z.ZodTypeDef, FileNode>, "many">;
    settings: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    createdAt: z.ZodDate;
    lastOpened: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    id: string;
    path: string;
    type: "typescript" | "javascript" | "python" | "rust" | "go" | "java" | "react" | "nextjs" | "vue" | "svelte" | "node" | "other";
    createdAt: Date;
    name: string;
    files: FileNode[];
    description?: string | undefined;
    settings?: Record<string, any> | undefined;
    lastOpened?: Date | undefined;
}, {
    id: string;
    path: string;
    type: "typescript" | "javascript" | "python" | "rust" | "go" | "java" | "react" | "nextjs" | "vue" | "svelte" | "node" | "other";
    createdAt: Date;
    name: string;
    files: FileNode[];
    description?: string | undefined;
    settings?: Record<string, any> | undefined;
    lastOpened?: Date | undefined;
}>;
export type Project = z.infer<typeof ProjectSchema>;
export declare const CodeContextSchema: z.ZodObject<{
    filePath: z.ZodString;
    content: z.ZodString;
    chunks: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
    language: z.ZodOptional<z.ZodEnum<["typescript", "javascript", "tsx", "jsx", "json", "markdown", "css", "scss", "html", "python", "rust", "go", "java", "c", "cpp", "plaintext"]>>;
    functions: z.ZodArray<z.ZodString, "many">;
    classes: z.ZodArray<z.ZodString, "many">;
    imports: z.ZodArray<z.ZodString, "many">;
    exports: z.ZodArray<z.ZodString, "many">;
    variables: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    dependencies: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    symbols: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    content: string;
    filePath: string;
    functions: string[];
    classes: string[];
    imports: string[];
    exports: string[];
    chunks?: any[] | undefined;
    language?: "typescript" | "javascript" | "tsx" | "jsx" | "json" | "markdown" | "css" | "scss" | "html" | "python" | "rust" | "go" | "java" | "c" | "cpp" | "plaintext" | undefined;
    variables?: string[] | undefined;
    dependencies?: string[] | undefined;
    symbols?: string[] | undefined;
}, {
    content: string;
    filePath: string;
    functions: string[];
    classes: string[];
    imports: string[];
    exports: string[];
    chunks?: any[] | undefined;
    language?: "typescript" | "javascript" | "tsx" | "jsx" | "json" | "markdown" | "css" | "scss" | "html" | "python" | "rust" | "go" | "java" | "c" | "cpp" | "plaintext" | undefined;
    variables?: string[] | undefined;
    dependencies?: string[] | undefined;
    symbols?: string[] | undefined;
}>;
export type CodeContext = z.infer<typeof CodeContextSchema>;
export declare const ContextChunkSchema: z.ZodObject<{
    id: z.ZodString;
    content: z.ZodString;
    startLine: z.ZodNumber;
    endLine: z.ZodNumber;
    type: z.ZodString;
    filePath: z.ZodOptional<z.ZodString>;
    language: z.ZodOptional<z.ZodEnum<["typescript", "javascript", "tsx", "jsx", "json", "markdown", "css", "scss", "html", "python", "rust", "go", "java", "c", "cpp", "plaintext"]>>;
    embedding: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    content: string;
    type: string;
    startLine: number;
    endLine: number;
    metadata?: Record<string, any> | undefined;
    filePath?: string | undefined;
    language?: "typescript" | "javascript" | "tsx" | "jsx" | "json" | "markdown" | "css" | "scss" | "html" | "python" | "rust" | "go" | "java" | "c" | "cpp" | "plaintext" | undefined;
    embedding?: number[] | undefined;
}, {
    id: string;
    content: string;
    type: string;
    startLine: number;
    endLine: number;
    metadata?: Record<string, any> | undefined;
    filePath?: string | undefined;
    language?: "typescript" | "javascript" | "tsx" | "jsx" | "json" | "markdown" | "css" | "scss" | "html" | "python" | "rust" | "go" | "java" | "c" | "cpp" | "plaintext" | undefined;
    embedding?: number[] | undefined;
}>;
export type ContextChunk = z.infer<typeof ContextChunkSchema>;
export declare const AgentModeSchema: z.ZodEnum<["agent", "autopilot"]>;
export type AgentMode = z.infer<typeof AgentModeSchema>;
export declare const AgentTaskTypeSchema: z.ZodEnum<["code_generation", "code_completion", "code_review", "debugging", "refactoring", "testing", "documentation", "explanation", "review"]>;
export type AgentTaskType = z.infer<typeof AgentTaskTypeSchema>;
export declare const AgentTaskSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodEnum<["code_generation", "code_completion", "code_review", "debugging", "refactoring", "testing", "documentation", "explanation", "review"]>;
    description: z.ZodString;
    context: z.ZodOptional<z.ZodAny>;
    files: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    status: z.ZodEnum<["pending", "running", "completed", "failed"]>;
    result: z.ZodOptional<z.ZodString>;
    error: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodDate;
    startedAt: z.ZodOptional<z.ZodDate>;
    completedAt: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    id: string;
    type: "code_generation" | "code_completion" | "code_review" | "debugging" | "refactoring" | "testing" | "documentation" | "explanation" | "review";
    status: "pending" | "running" | "completed" | "failed";
    createdAt: Date;
    description: string;
    context?: any;
    error?: string | undefined;
    files?: string[] | undefined;
    result?: string | undefined;
    startedAt?: Date | undefined;
    completedAt?: Date | undefined;
}, {
    id: string;
    type: "code_generation" | "code_completion" | "code_review" | "debugging" | "refactoring" | "testing" | "documentation" | "explanation" | "review";
    status: "pending" | "running" | "completed" | "failed";
    createdAt: Date;
    description: string;
    context?: any;
    error?: string | undefined;
    files?: string[] | undefined;
    result?: string | undefined;
    startedAt?: Date | undefined;
    completedAt?: Date | undefined;
}>;
export type AgentTask = z.infer<typeof AgentTaskSchema>;
export declare const ErrorSeveritySchema: z.ZodEnum<["error", "warning", "info"]>;
export type ErrorSeverity = z.infer<typeof ErrorSeveritySchema>;
export declare const DiagnosticSchema: z.ZodObject<{
    id: z.ZodString;
    filePath: z.ZodString;
    range: z.ZodObject<{
        start: z.ZodObject<{
            line: z.ZodNumber;
            column: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            line: number;
            column: number;
        }, {
            line: number;
            column: number;
        }>;
        end: z.ZodObject<{
            line: z.ZodNumber;
            column: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            line: number;
            column: number;
        }, {
            line: number;
            column: number;
        }>;
    }, "strip", z.ZodTypeAny, {
        start: {
            line: number;
            column: number;
        };
        end: {
            line: number;
            column: number;
        };
    }, {
        start: {
            line: number;
            column: number;
        };
        end: {
            line: number;
            column: number;
        };
    }>;
    message: z.ZodString;
    severity: z.ZodEnum<["error", "warning", "info"]>;
    code: z.ZodOptional<z.ZodString>;
    source: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    message: string;
    range: {
        start: {
            line: number;
            column: number;
        };
        end: {
            line: number;
            column: number;
        };
    };
    filePath: string;
    severity: "error" | "warning" | "info";
    code?: string | undefined;
    source?: string | undefined;
}, {
    id: string;
    message: string;
    range: {
        start: {
            line: number;
            column: number;
        };
        end: {
            line: number;
            column: number;
        };
    };
    filePath: string;
    severity: "error" | "warning" | "info";
    code?: string | undefined;
    source?: string | undefined;
}>;
export type Diagnostic = z.infer<typeof DiagnosticSchema>;
export declare const AppSettingsSchema: z.ZodObject<{
    editor: z.ZodObject<{
        fontSize: z.ZodDefault<z.ZodNumber>;
        fontFamily: z.ZodDefault<z.ZodString>;
        tabSize: z.ZodDefault<z.ZodNumber>;
        insertSpaces: z.ZodDefault<z.ZodBoolean>;
        wordWrap: z.ZodDefault<z.ZodBoolean>;
        minimap: z.ZodDefault<z.ZodBoolean>;
        lineNumbers: z.ZodDefault<z.ZodBoolean>;
        theme: z.ZodDefault<z.ZodEnum<["dark", "light", "system"]>>;
    }, "strip", z.ZodTypeAny, {
        fontSize: number;
        fontFamily: string;
        tabSize: number;
        insertSpaces: boolean;
        wordWrap: boolean;
        minimap: boolean;
        lineNumbers: boolean;
        theme: "system" | "dark" | "light";
    }, {
        fontSize?: number | undefined;
        fontFamily?: string | undefined;
        tabSize?: number | undefined;
        insertSpaces?: boolean | undefined;
        wordWrap?: boolean | undefined;
        minimap?: boolean | undefined;
        lineNumbers?: boolean | undefined;
        theme?: "system" | "dark" | "light" | undefined;
    }>;
    ai: z.ZodObject<{
        defaultModel: z.ZodDefault<z.ZodEnum<["claude-4", "claude-3.5", "claude-opus", "gpt-4.1-nano", "gpt-4-vision", "dalle-3"]>>;
        temperature: z.ZodDefault<z.ZodNumber>;
        maxTokens: z.ZodDefault<z.ZodNumber>;
        contextWindow: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        maxTokens: number;
        temperature: number;
        defaultModel: "claude-4" | "claude-3.5" | "claude-opus" | "gpt-4.1-nano" | "gpt-4-vision" | "dalle-3";
        contextWindow: number;
    }, {
        maxTokens?: number | undefined;
        temperature?: number | undefined;
        defaultModel?: "claude-4" | "claude-3.5" | "claude-opus" | "gpt-4.1-nano" | "gpt-4-vision" | "dalle-3" | undefined;
        contextWindow?: number | undefined;
    }>;
    terminal: z.ZodObject<{
        shell: z.ZodOptional<z.ZodString>;
        fontSize: z.ZodDefault<z.ZodNumber>;
        fontFamily: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        fontSize: number;
        fontFamily: string;
        shell?: string | undefined;
    }, {
        fontSize?: number | undefined;
        fontFamily?: string | undefined;
        shell?: string | undefined;
    }>;
    theme: z.ZodDefault<z.ZodEnum<["dark", "light", "system"]>>;
    keybindings: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    theme: "system" | "dark" | "light";
    editor: {
        fontSize: number;
        fontFamily: string;
        tabSize: number;
        insertSpaces: boolean;
        wordWrap: boolean;
        minimap: boolean;
        lineNumbers: boolean;
        theme: "system" | "dark" | "light";
    };
    ai: {
        maxTokens: number;
        temperature: number;
        defaultModel: "claude-4" | "claude-3.5" | "claude-opus" | "gpt-4.1-nano" | "gpt-4-vision" | "dalle-3";
        contextWindow: number;
    };
    terminal: {
        fontSize: number;
        fontFamily: string;
        shell?: string | undefined;
    };
    keybindings?: Record<string, string> | undefined;
}, {
    editor: {
        fontSize?: number | undefined;
        fontFamily?: string | undefined;
        tabSize?: number | undefined;
        insertSpaces?: boolean | undefined;
        wordWrap?: boolean | undefined;
        minimap?: boolean | undefined;
        lineNumbers?: boolean | undefined;
        theme?: "system" | "dark" | "light" | undefined;
    };
    ai: {
        maxTokens?: number | undefined;
        temperature?: number | undefined;
        defaultModel?: "claude-4" | "claude-3.5" | "claude-opus" | "gpt-4.1-nano" | "gpt-4-vision" | "dalle-3" | undefined;
        contextWindow?: number | undefined;
    };
    terminal: {
        fontSize?: number | undefined;
        fontFamily?: string | undefined;
        shell?: string | undefined;
    };
    theme?: "system" | "dark" | "light" | undefined;
    keybindings?: Record<string, string> | undefined;
}>;
export type AppSettings = z.infer<typeof AppSettingsSchema>;
//# sourceMappingURL=types.d.ts.map