import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function truncateText(text?: string | null, maxChars = 120) {
  if (!text) return "";
  const normalized = String(text);
  if (normalized.length <= maxChars) return normalized;
  return normalized.slice(0, maxChars - 3) + "...";
}