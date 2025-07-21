import { nanoid } from 'nanoid';
/**
 * Generate a unique ID
 */
export function generateId() {
    return nanoid();
}
/**
 * Get file extension from filename
 */
export function getFileExtension(filename) {
    const lastDot = filename.lastIndexOf('.');
    return lastDot === -1 ? '' : filename.substring(lastDot + 1).toLowerCase();
}
/**
 * Determine language from file extension
 */
export function getLanguageFromExtension(filename) {
    const ext = getFileExtension(filename);
    const languageMap = {
        ts: 'typescript',
        tsx: 'tsx',
        js: 'javascript',
        jsx: 'jsx',
        json: 'json',
        md: 'markdown',
        markdown: 'markdown',
        css: 'css',
        scss: 'scss',
        sass: 'scss',
        html: 'html',
        htm: 'html',
        py: 'python',
        rs: 'rust',
        go: 'go',
        java: 'java',
        c: 'c',
        cpp: 'cpp',
        cc: 'cpp',
        cxx: 'cpp',
    };
    return languageMap[ext] || 'plaintext';
}
/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes) {
    if (bytes === 0)
        return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
/**
 * Debounce function
 */
export function debounce(func, wait) {
    let timeout = null;
    return (...args) => {
        if (timeout)
            clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}
/**
 * Throttle function
 */
export function throttle(func, limit) {
    let inThrottle;
    return (...args) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}
/**
 * Deep clone an object
 */
export function deepClone(obj) {
    if (obj === null || typeof obj !== 'object')
        return obj;
    if (obj instanceof Date)
        return new Date(obj.getTime());
    if (obj instanceof Array)
        return obj.map(item => deepClone(item));
    if (typeof obj === 'object') {
        const clonedObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = deepClone(obj[key]);
            }
        }
        return clonedObj;
    }
    return obj;
}
/**
 * Check if a path is a directory
 */
export function isDirectory(path) {
    return !path.includes('.') || path.endsWith('/');
}
/**
 * Get parent directory from path
 */
export function getParentDirectory(path) {
    const parts = path.split('/').filter(Boolean);
    if (parts.length <= 1)
        return '/';
    return '/' + parts.slice(0, -1).join('/');
}
/**
 * Join paths
 */
export function joinPaths(...paths) {
    return paths
        .join('/')
        .replace(/\/+/g, '/')
        .replace(/\/$/, '') || '/';
}
/**
 * Normalize path
 */
export function normalizePath(path) {
    return path.replace(/\\/g, '/').replace(/\/+/g, '/');
}
/**
 * Extract filename from path
 */
export function getFilename(path) {
    return path.split('/').pop() || '';
}
/**
 * Check if string is valid JSON
 */
export function isValidJSON(str) {
    try {
        JSON.parse(str);
        return true;
    }
    catch {
        return false;
    }
}
/**
 * Format timestamp for display
 */
export function formatTimestamp(date) {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    // Less than a minute ago
    if (diff < 60000) {
        return 'just now';
    }
    // Less than an hour ago
    if (diff < 3600000) {
        const minutes = Math.floor(diff / 60000);
        return `${minutes}m ago`;
    }
    // Less than a day ago
    if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000);
        return `${hours}h ago`;
    }
    // Less than a week ago
    if (diff < 604800000) {
        const days = Math.floor(diff / 86400000);
        return `${days}d ago`;
    }
    // Older than a week
    return date.toLocaleDateString();
}
/**
 * Escape HTML entities
 */
export function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
/**
 * Calculate text similarity using Levenshtein distance
 */
export function calculateSimilarity(str1, str2) {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    for (let i = 0; i <= str1.length; i += 1) {
        matrix[0][i] = i;
    }
    for (let j = 0; j <= str2.length; j += 1) {
        matrix[j][0] = j;
    }
    for (let j = 1; j <= str2.length; j += 1) {
        for (let i = 1; i <= str1.length; i += 1) {
            const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
            matrix[j][i] = Math.min(matrix[j][i - 1] + 1, matrix[j - 1][i] + 1, matrix[j - 1][i - 1] + indicator);
        }
    }
    const maxLength = Math.max(str1.length, str2.length);
    return maxLength === 0 ? 1 : (maxLength - matrix[str2.length][str1.length]) / maxLength;
}
