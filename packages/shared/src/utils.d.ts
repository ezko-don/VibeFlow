import type { Language } from './types';
/**
 * Generate a unique ID
 */
export declare function generateId(): string;
/**
 * Get file extension from filename
 */
export declare function getFileExtension(filename: string): string;
/**
 * Determine language from file extension
 */
export declare function getLanguageFromExtension(filename: string): Language;
/**
 * Format file size in human readable format
 */
export declare function formatFileSize(bytes: number): string;
/**
 * Debounce function
 */
export declare function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void;
/**
 * Throttle function
 */
export declare function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void;
/**
 * Deep clone an object
 */
export declare function deepClone<T>(obj: T): T;
/**
 * Check if a path is a directory
 */
export declare function isDirectory(path: string): boolean;
/**
 * Get parent directory from path
 */
export declare function getParentDirectory(path: string): string;
/**
 * Join paths
 */
export declare function joinPaths(...paths: string[]): string;
/**
 * Normalize path
 */
export declare function normalizePath(path: string): string;
/**
 * Extract filename from path
 */
export declare function getFilename(path: string): string;
/**
 * Check if string is valid JSON
 */
export declare function isValidJSON(str: string): boolean;
/**
 * Format timestamp for display
 */
export declare function formatTimestamp(date: Date): string;
/**
 * Escape HTML entities
 */
export declare function escapeHtml(text: string): string;
/**
 * Calculate text similarity using Levenshtein distance
 */
export declare function calculateSimilarity(str1: string, str2: string): number;
//# sourceMappingURL=utils.d.ts.map