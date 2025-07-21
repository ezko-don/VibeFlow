import type { AIModel, Language } from './types';
export declare const APP_NAME = "VibeFlow";
export declare const APP_VERSION = "1.0.0";
export declare const APP_DESCRIPTION = "AI-powered code editor with free Claude & GPT integration";
export declare const MAX_FILE_SIZE: number;
export declare const MAX_FILES_IN_PROJECT = 10000;
export declare const SUPPORTED_EXTENSIONS: readonly [".ts", ".tsx", ".js", ".jsx", ".json", ".md", ".css", ".scss", ".html", ".py", ".rs", ".go", ".java", ".c", ".cpp", ".vue", ".svelte"];
export declare const BINARY_EXTENSIONS: readonly [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".ico", ".svg", ".mp4", ".avi", ".mov", ".mp3", ".wav", ".ogg", ".pdf", ".zip", ".tar", ".gz", ".exe", ".dmg", ".deb"];
export declare const DEFAULT_FONT_SIZE = 14;
export declare const MIN_FONT_SIZE = 8;
export declare const MAX_FONT_SIZE = 72;
export declare const DEFAULT_TAB_SIZE = 2;
export declare const MIN_TAB_SIZE = 1;
export declare const MAX_TAB_SIZE = 8;
export declare const EDITOR_THEMES: readonly ["dark", "light", "system"];
export declare const SUPPORTED_LANGUAGES: Language[];
export declare const AI_MODELS: AIModel[];
export declare const AI_PROVIDERS: readonly ["anthropic", "openai", "openrouter", "local"];
export declare const DEFAULT_AI_MODEL: AIModel;
export declare const DEFAULT_TEMPERATURE = 0.7;
export declare const DEFAULT_MAX_TOKENS = 4000;
export declare const DEFAULT_CONTEXT_WINDOW = 200000;
export declare const AI_MODEL_LIMITS: {
    readonly 'claude-3.5-sonnet': {
        readonly maxTokens: 200000;
        readonly contextWindow: 200000;
        readonly costPer1kTokens: 0.003;
    };
    readonly 'gpt-4o': {
        readonly maxTokens: 128000;
        readonly contextWindow: 128000;
        readonly costPer1kTokens: 0.005;
    };
    readonly 'gpt-4-turbo': {
        readonly maxTokens: 128000;
        readonly contextWindow: 128000;
        readonly costPer1kTokens: 0.01;
    };
    readonly 'local-llama': {
        readonly maxTokens: 4096;
        readonly contextWindow: 4096;
        readonly costPer1kTokens: 0;
    };
};
export declare const API_ENDPOINTS: {
    readonly ANTHROPIC: "https://api.anthropic.com/v1";
    readonly OPENAI: "https://api.openai.com/v1";
    readonly OPENROUTER: "https://openrouter.ai/api/v1";
};
export declare const RATE_LIMITS: {
    readonly CLAUDE_FREE: {
        readonly requestsPerDay: 50;
        readonly requestsPerMinute: 5;
    };
    readonly GPT_FREE: {
        readonly requestsPerDay: 200;
        readonly requestsPerMinute: 20;
    };
    readonly LOCAL: {
        readonly requestsPerDay: number;
        readonly requestsPerMinute: number;
    };
};
export declare const TERMINAL_COMMANDS: readonly ["help", "clear", "ls", "dir", "pwd", "cd", "mkdir", "touch", "rm", "cp", "mv", "cat", "grep", "find", "git", "npm", "yarn", "node", "python", "cargo", "go"];
export declare const TERMINAL_COLORS: {
    readonly DEFAULT: "#ffffff";
    readonly SUCCESS: "#22c55e";
    readonly ERROR: "#ef4444";
    readonly WARNING: "#f59e0b";
    readonly INFO: "#3b82f6";
    readonly PROMPT: "#fbbf24";
};
export declare const THEME_COLORS: {
    readonly PRIMARY: "#22c55e";
    readonly SECONDARY: "#f97316";
    readonly ACCENT: "#2563eb";
    readonly SUCCESS: "#22c55e";
    readonly WARNING: "#f59e0b";
    readonly ERROR: "#ef4444";
    readonly INFO: "#3b82f6";
};
export declare const ANIMATION_DURATIONS: {
    readonly FAST: 150;
    readonly NORMAL: 300;
    readonly SLOW: 500;
};
export declare const BREAKPOINTS: {
    readonly SM: 640;
    readonly MD: 768;
    readonly LG: 1024;
    readonly XL: 1280;
    readonly '2XL': 1536;
};
export declare const DEFAULT_KEYBINDINGS: {
    readonly 'cmd+n': "file.new";
    readonly 'cmd+o': "file.open";
    readonly 'cmd+s': "file.save";
    readonly 'cmd+shift+s': "file.saveAs";
    readonly 'cmd+w': "file.close";
    readonly 'cmd+z': "edit.undo";
    readonly 'cmd+shift+z': "edit.redo";
    readonly 'cmd+x': "edit.cut";
    readonly 'cmd+c': "edit.copy";
    readonly 'cmd+v': "edit.paste";
    readonly 'cmd+a': "edit.selectAll";
    readonly 'cmd+f': "edit.find";
    readonly 'cmd+shift+f': "edit.findInFiles";
    readonly 'cmd+h': "edit.replace";
    readonly 'cmd+shift+e': "view.explorer";
    readonly 'cmd+shift+c': "view.chat";
    readonly 'cmd+shift+t': "view.terminal";
    readonly 'cmd+shift+p': "view.commandPalette";
    readonly 'cmd+shift+l': "view.toggleTheme";
    readonly 'cmd+plus': "view.zoomIn";
    readonly 'cmd+minus': "view.zoomOut";
    readonly 'cmd+0': "view.resetZoom";
    readonly 'cmd+p': "nav.quickOpen";
    readonly 'cmd+shift+o': "nav.goToSymbol";
    readonly 'cmd+g': "nav.goToLine";
    readonly 'cmd+b': "nav.toggleSidebar";
    readonly 'cmd+j': "nav.togglePanel";
    readonly 'cmd+k': "ai.chat";
    readonly 'cmd+shift+a': "ai.assistant";
    readonly 'cmd+i': "ai.inlineChat";
};
export declare const VALIDATION_RULES: {
    readonly PROJECT_NAME: {
        readonly minLength: 1;
        readonly maxLength: 50;
        readonly pattern: RegExp;
    };
    readonly FILE_NAME: {
        readonly minLength: 1;
        readonly maxLength: 100;
        readonly pattern: RegExp;
    };
    readonly AI_MESSAGE: {
        readonly minLength: 1;
        readonly maxLength: 10000;
    };
    readonly TEMPERATURE: {
        readonly min: 0;
        readonly max: 2;
    };
    readonly MAX_TOKENS: {
        readonly min: 1;
        readonly max: 200000;
    };
};
export declare const ERROR_MESSAGES: {
    readonly FILE_NOT_FOUND: "File not found";
    readonly FILE_TOO_LARGE: "File is too large";
    readonly INVALID_FILE_TYPE: "Invalid file type";
    readonly PERMISSION_DENIED: "Permission denied";
    readonly NETWORK_ERROR: "Network error";
    readonly AI_REQUEST_FAILED: "AI request failed";
    readonly RATE_LIMIT_EXCEEDED: "Rate limit exceeded";
    readonly INVALID_API_KEY: "Invalid API key";
    readonly CONTEXT_TOO_LARGE: "Context is too large";
    readonly INVALID_MODEL: "Invalid AI model";
};
export declare const SUCCESS_MESSAGES: {
    readonly FILE_SAVED: "File saved successfully";
    readonly PROJECT_CREATED: "Project created successfully";
    readonly AI_RESPONSE_RECEIVED: "AI response received";
    readonly SETTINGS_UPDATED: "Settings updated successfully";
    readonly THEME_CHANGED: "Theme changed successfully";
};
//# sourceMappingURL=constants.d.ts.map