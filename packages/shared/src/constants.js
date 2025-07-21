// ============================================================================
// App Constants
// ============================================================================
export const APP_NAME = 'VibeFlow';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'AI-powered code editor with free Claude & GPT integration';
// ============================================================================
// File System Constants
// ============================================================================
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_FILES_IN_PROJECT = 10000;
export const SUPPORTED_EXTENSIONS = [
    '.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.css', '.scss', '.html',
    '.py', '.rs', '.go', '.java', '.c', '.cpp', '.vue', '.svelte'
];
export const BINARY_EXTENSIONS = [
    '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.ico', '.svg',
    '.mp4', '.avi', '.mov', '.mp3', '.wav', '.ogg',
    '.pdf', '.zip', '.tar', '.gz', '.exe', '.dmg', '.deb'
];
// ============================================================================
// Editor Constants
// ============================================================================
export const DEFAULT_FONT_SIZE = 14;
export const MIN_FONT_SIZE = 8;
export const MAX_FONT_SIZE = 72;
export const DEFAULT_TAB_SIZE = 2;
export const MIN_TAB_SIZE = 1;
export const MAX_TAB_SIZE = 8;
export const EDITOR_THEMES = ['dark', 'light', 'system'];
export const SUPPORTED_LANGUAGES = [
    'typescript', 'javascript', 'tsx', 'jsx', 'json', 'markdown',
    'css', 'scss', 'html', 'python', 'rust', 'go', 'java', 'c', 'cpp', 'plaintext'
];
// ============================================================================
// AI Constants
// ============================================================================
export const AI_MODELS = [
    'claude-3.5-sonnet',
    'gpt-4o',
    'gpt-4-turbo',
    'local-llama'
];
export const AI_PROVIDERS = ['anthropic', 'openai', 'openrouter', 'local'];
export const DEFAULT_AI_MODEL = 'claude-3.5-sonnet';
export const DEFAULT_TEMPERATURE = 0.7;
export const DEFAULT_MAX_TOKENS = 4000;
export const DEFAULT_CONTEXT_WINDOW = 200000;
export const AI_MODEL_LIMITS = {
    'claude-3.5-sonnet': {
        maxTokens: 200000,
        contextWindow: 200000,
        costPer1kTokens: 0.003,
    },
    'gpt-4o': {
        maxTokens: 128000,
        contextWindow: 128000,
        costPer1kTokens: 0.005,
    },
    'gpt-4-turbo': {
        maxTokens: 128000,
        contextWindow: 128000,
        costPer1kTokens: 0.01,
    },
    'local-llama': {
        maxTokens: 4096,
        contextWindow: 4096,
        costPer1kTokens: 0,
    },
};
// ============================================================================
// API Constants
// ============================================================================
export const API_ENDPOINTS = {
    ANTHROPIC: 'https://api.anthropic.com/v1',
    OPENAI: 'https://api.openai.com/v1',
    OPENROUTER: 'https://openrouter.ai/api/v1',
};
export const RATE_LIMITS = {
    CLAUDE_FREE: {
        requestsPerDay: 50,
        requestsPerMinute: 5,
    },
    GPT_FREE: {
        requestsPerDay: 200,
        requestsPerMinute: 20,
    },
    LOCAL: {
        requestsPerDay: Infinity,
        requestsPerMinute: Infinity,
    },
};
// ============================================================================
// Terminal Constants
// ============================================================================
export const TERMINAL_COMMANDS = [
    'help', 'clear', 'ls', 'dir', 'pwd', 'cd', 'mkdir', 'touch', 'rm', 'cp', 'mv',
    'cat', 'grep', 'find', 'git', 'npm', 'yarn', 'node', 'python', 'cargo', 'go'
];
export const TERMINAL_COLORS = {
    DEFAULT: '#ffffff',
    SUCCESS: '#22c55e',
    ERROR: '#ef4444',
    WARNING: '#f59e0b',
    INFO: '#3b82f6',
    PROMPT: '#fbbf24',
};
// ============================================================================
// UI Constants
// ============================================================================
export const THEME_COLORS = {
    PRIMARY: '#22c55e',
    SECONDARY: '#f97316',
    ACCENT: '#2563eb',
    SUCCESS: '#22c55e',
    WARNING: '#f59e0b',
    ERROR: '#ef4444',
    INFO: '#3b82f6',
};
export const ANIMATION_DURATIONS = {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
};
export const BREAKPOINTS = {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    '2XL': 1536,
};
// ============================================================================
// Keyboard Shortcuts
// ============================================================================
export const DEFAULT_KEYBINDINGS = {
    // File operations
    'cmd+n': 'file.new',
    'cmd+o': 'file.open',
    'cmd+s': 'file.save',
    'cmd+shift+s': 'file.saveAs',
    'cmd+w': 'file.close',
    // Edit operations
    'cmd+z': 'edit.undo',
    'cmd+shift+z': 'edit.redo',
    'cmd+x': 'edit.cut',
    'cmd+c': 'edit.copy',
    'cmd+v': 'edit.paste',
    'cmd+a': 'edit.selectAll',
    'cmd+f': 'edit.find',
    'cmd+shift+f': 'edit.findInFiles',
    'cmd+h': 'edit.replace',
    // View operations
    'cmd+shift+e': 'view.explorer',
    'cmd+shift+c': 'view.chat',
    'cmd+shift+t': 'view.terminal',
    'cmd+shift+p': 'view.commandPalette',
    'cmd+shift+l': 'view.toggleTheme',
    'cmd+plus': 'view.zoomIn',
    'cmd+minus': 'view.zoomOut',
    'cmd+0': 'view.resetZoom',
    // Navigation
    'cmd+p': 'nav.quickOpen',
    'cmd+shift+o': 'nav.goToSymbol',
    'cmd+g': 'nav.goToLine',
    'cmd+b': 'nav.toggleSidebar',
    'cmd+j': 'nav.togglePanel',
    // AI operations
    'cmd+k': 'ai.chat',
    'cmd+shift+a': 'ai.assistant',
    'cmd+i': 'ai.inlineChat',
};
// ============================================================================
// Validation Constants
// ============================================================================
export const VALIDATION_RULES = {
    PROJECT_NAME: {
        minLength: 1,
        maxLength: 50,
        pattern: /^[a-zA-Z0-9\-_\s]+$/,
    },
    FILE_NAME: {
        minLength: 1,
        maxLength: 100,
        pattern: /^[a-zA-Z0-9\-_\.]+$/,
    },
    AI_MESSAGE: {
        minLength: 1,
        maxLength: 10000,
    },
    TEMPERATURE: {
        min: 0,
        max: 2,
    },
    MAX_TOKENS: {
        min: 1,
        max: 200000,
    },
};
// ============================================================================
// Error Messages
// ============================================================================
export const ERROR_MESSAGES = {
    FILE_NOT_FOUND: 'File not found',
    FILE_TOO_LARGE: 'File is too large',
    INVALID_FILE_TYPE: 'Invalid file type',
    PERMISSION_DENIED: 'Permission denied',
    NETWORK_ERROR: 'Network error',
    AI_REQUEST_FAILED: 'AI request failed',
    RATE_LIMIT_EXCEEDED: 'Rate limit exceeded',
    INVALID_API_KEY: 'Invalid API key',
    CONTEXT_TOO_LARGE: 'Context is too large',
    INVALID_MODEL: 'Invalid AI model',
};
// ============================================================================
// Success Messages
// ============================================================================
export const SUCCESS_MESSAGES = {
    FILE_SAVED: 'File saved successfully',
    PROJECT_CREATED: 'Project created successfully',
    AI_RESPONSE_RECEIVED: 'AI response received',
    SETTINGS_UPDATED: 'Settings updated successfully',
    THEME_CHANGED: 'Theme changed successfully',
};
