import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge class names with Tailwind CSS class deduplication
 * 
 * @param inputs - Class names to merge
 * @returns Merged class names string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
} 