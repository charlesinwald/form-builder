import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normalizes a file URL to ensure it uses the correct public endpoint
 * and hostname format for consistent access.
 */
export function normalizeFileUrl(url: string): string {
  return url
    .replace('/api/v1/files/', '/api/v1/public/files/')
    .replace('localhost:', '127.0.0.1:');
}
