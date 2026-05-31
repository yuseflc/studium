/* Archivo: src\lib\utils.ts
  Descripción: Utilidades y helpers compartidos (formatos, parsing, utilidades pequeñas). */

// Utilidades pequeñas y genéricas usadas a lo largo de la app (clase, truncado)
// Utilidades genéricas: helpers de clases CSS, truncamiento y utilidades pequeñas
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