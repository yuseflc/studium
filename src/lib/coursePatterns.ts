import type { CSSProperties } from "react";

// Cada patrón se identifica por un ID string que se almacena en la BD.
// El `style` es CSS inline que React aplica directamente al elemento.
export interface CoursePattern {
  id: string;
  label: string;
  style: CSSProperties;
}

// Genera un data URI con el SVG de panal de abeja para usarlo como background-image.
// Se codifica con encodeURIComponent para que sea válido dentro de una URL CSS.
function hexBg(strokeColor: string): string {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='56' height='100'><path d='M28 66L0 50V16L28 0l28 16v34L28 66zM28 100L0 84V50l28-16 28 16v34L28 100z' fill='none' stroke='${strokeColor}' stroke-width='1.5'/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

// Catálogo de patrones de portada. Orden = orden de aparición en el picker.
// Cada `background` usa capas CSS separadas por coma: [patrón], [color de fondo].
// Fondos claros usan rgba(0,0,0,…) para el patrón; oscuros usan rgba(255,255,255,…).
export const COURSE_PATTERNS: CoursePattern[] = [
  // ── Amarillos (color principal) ────────────────────────────────────────────
  {
    id: "grid-yellow",
    label: "Cuadrícula Amarillo",
    style: {
      background:
        "linear-gradient(rgba(0,0,0,0.12) 1px, transparent 1px) 0 0 / 20px 20px, linear-gradient(90deg, rgba(0,0,0,0.12) 1px, transparent 1px) 0 0 / 20px 20px, #fde047",
    },
  },
  {
    id: "dots-yellow",
    label: "Puntos Amarillo",
    style: {
      background:
        "radial-gradient(circle, rgba(0,0,0,0.18) 12%, transparent 12%) 0 0 / 18px 18px, #eab308",
    },
  },
  {
    id: "hexagons-yellow",
    label: "Hexágonos Amarillo",
    style: {
      background: `${hexBg("rgba(0,0,0,0.18)")} center / 56px 100px, #facc15`,
    },
  },
  {
    id: "diagonal-yellow",
    label: "Diagonales Amarillo",
    style: {
      background:
        "repeating-linear-gradient(45deg, rgba(0,0,0,0.1), rgba(0,0,0,0.1) 2px, transparent 2px, transparent 14px), #fbbf24",
    },
  },
  {
    id: "diagonal-amber",
    label: "Diagonales Ámbar",
    style: {
      background:
        "repeating-linear-gradient(45deg, rgba(255,255,255,0.15), rgba(255,255,255,0.15) 2px, transparent 2px, transparent 14px), #d97706",
    },
  },

  // ── Grises / Blancos / Negros ──────────────────────────────────────────────
  {
    id: "grid-white",
    label: "Cuadrícula Blanco",
    style: {
      background:
        "linear-gradient(rgba(0,0,0,0.08) 1px, transparent 1px) 0 0 / 20px 20px, linear-gradient(90deg, rgba(0,0,0,0.08) 1px, transparent 1px) 0 0 / 20px 20px, #f8fafc",
    },
  },
  {
    id: "hexagons-white",
    label: "Hexágonos Blanco",
    style: {
      background: `${hexBg("rgba(0,0,0,0.12)")} center / 56px 100px, #f1f5f9`,
    },
  },
  {
    id: "dots-white",
    label: "Puntos Blanco",
    style: {
      background:
        "radial-gradient(circle, rgba(0,0,0,0.12) 12%, transparent 12%) 0 0 / 18px 18px, #f8fafc",
    },
  },
  {
    id: "dots-gray",
    label: "Puntos Gris",
    style: {
      background:
        "radial-gradient(circle, rgba(255,255,255,0.35) 12%, transparent 12%) 0 0 / 18px 18px, #94a3b8",
    },
  },
  {
    id: "grid-dark",
    label: "Cuadrícula Negro",
    style: {
      background:
        "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px) 0 0 / 20px 20px, linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px) 0 0 / 20px 20px, #0f172a",
    },
  },
  {
    id: "diagonal-dark",
    label: "Diagonales Negro",
    style: {
      background:
        "repeating-linear-gradient(45deg, rgba(255,255,255,0.06), rgba(255,255,255,0.06) 2px, transparent 2px, transparent 14px), #111827",
    },
  },
  {
    id: "hexagons-dark",
    label: "Hexágonos Negro",
    style: {
      background: `${hexBg("rgba(255,255,255,0.15)")} center / 56px 100px, #1e293b`,
    },
  },
];

// Patrón que se aplica a cursos nuevos o a los que no tengan coverImage en BD.
export const DEFAULT_PATTERN_ID = "circles-yellow";

// Devuelve el patrón por ID; si no existe o es null, devuelve el primero de la lista.
export function getPatternById(id?: string | null): CoursePattern {
  return COURSE_PATTERNS.find((p) => p.id === id) ?? COURSE_PATTERNS[0];
}
