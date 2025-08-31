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

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}