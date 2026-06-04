/* Archivo: src\config\landing.ts
  Descripción: Única fuente de verdad para las secciones de Herramientas y Precios de la landing.
  Solo describe capacidades reales del producto (ver modelos en src/models). Añadir una
  herramienta o un plan se reduce a editar estos arrays, sin tocar el JSX (diseño atómico). */

import {
  BookOpen,
  ClipboardList,
  MessageSquareText,
  KeyRound,
  Users,
  Target,
  type LucideIcon,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Herramientas (sección #features)                                   */
/* ------------------------------------------------------------------ */

export type ToolAccent = "primary" | "secondary" | "accent" | "info";

export interface Tool {
  id: string;
  icon: LucideIcon;
  accent: ToolAccent;
  title: string;
  description: string;
  /** Etiquetas cortas de capacidades reales asociadas. */
  tags?: string[];
}

// Mapeo accent -> clases daisyUI (evita interpolar clases dinámicas que Tailwind no purga).
export const TOOL_ACCENT_CLASSES: Record<
  ToolAccent,
  { soft: string; solid: string }
> = {
  primary: { soft: "bg-primary/50", solid: "group-hover:bg-primary group-hover:text-primary-content" },
  secondary: { soft: "bg-secondary/50", solid: "group-hover:bg-secondary group-hover:text-secondary-content" },
  accent: { soft: "bg-accent/50", solid: "group-hover:bg-accent group-hover:text-accent-content" },
  info: { soft: "bg-info/50", solid: "group-hover:bg-info group-hover:text-info-content" },
};

// Cada herramienta refleja una capacidad real del modelo de datos.
export const TOOLS: Tool[] = [
  {
    id: "courses",
    icon: BookOpen,
    accent: "primary",
    title: "Cursos por unidades",
    description:
      "Organiza tu materia en cursos y unidades, con portadas, estados de publicación y co-profesores que gestionan el aula contigo.",
    tags: ["Unidades", "Co-profesores", "Borrador / Activo"],
  },
  {
    id: "tasks",
    icon: ClipboardList,
    accent: "secondary",
    title: "Tareas y entregas",
    description:
      "Crea tareas, cuestionarios, foros o proyectos con criterios de evaluación ponderados y fechas de entrega. Los alumnos entregan archivos y texto en un clic.",
    tags: ["4 tipos", "Criterios ponderados", "Entregas tardías"],
  },
  {
    id: "feedback",
    icon: MessageSquareText,
    accent: "accent",
    title: "Calificación y feedback",
    description:
      "Corrige cada entrega con nota y comentarios personalizados. El alumno ve su progreso y qué reforzar en cada paso.",
    tags: ["Nota + comentarios", "Histórico por alumno"],
  },
];

// Herramientas destacadas en formato ancho (banda inferior).
export interface FeaturedTool extends Tool {}

export const FEATURED_TOOLS: FeaturedTool[] = [
  {
    id: "invite-codes",
    icon: KeyRound,
    accent: "info",
    title: "Códigos de invitación",
    description:
      "Comparte un código de 6 caracteres y tus alumnos se inscriben al instante. Rota y desactiva códigos cuando quieras para mantener el aula segura.",
    tags: ["6 caracteres", "Rotación FIFO", "Activar / desactivar"],
  },
  {
    id: "smart-assign",
    icon: Target,
    accent: "primary",
    title: "Asignación inteligente",
    description:
      "Asigna tareas de refuerzo automáticamente a los alumnos que suspenden la media o quedan por debajo de un umbral. La plataforma identifica a quién ayudar.",
    tags: ["Por media", "Por umbral", "Por tarea suspendida"],
  },
  {
    id: "resources",
    icon: Users,
    accent: "secondary",
    title: "Recursos y materiales",
    description:
      "Adjunta archivos, enlaces o notas de texto a cada unidad. Todo el material del curso queda centralizado y accesible para la clase.",
    tags: ["Archivo", "Enlace", "Texto"],
  },
];

/* ------------------------------------------------------------------ */
/*  Precios (sección #pricing)                                         */
/* ------------------------------------------------------------------ */

export type PlanTone = "neutral" | "primary" | "dark";

export interface PlanFeature {
  /** true = incluido, false = no incluido (se muestra tachado). */
  included: boolean;
  title: string;
  hint?: string;
}

export interface Plan {
  id: "free" | "basic" | "premium";
  name: string;
  /** Precio mensual en euros (0 = gratis). */
  monthly: number;
  badge: string;
  tone: PlanTone;
  highlight?: boolean;
  /** Subtítulo opcional bajo el precio. */
  tagline?: string;
  cta: string;
  features: PlanFeature[];
}

// Planes alineados al enum real UserPlan (free | basic | premium). Las features son
// capacidades reales; los límites numéricos son decisiones de negocio (no enforced en código).
export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Gratuito",
    monthly: 0,
    badge: "Ideal para empezar",
    tone: "neutral",
    cta: "Comenzar gratis",
    features: [
      { included: true, title: "Hasta 3 cursos", hint: "Prueba la plataforma sin coste" },
      { included: true, title: "Hasta 30 alumnos por curso", hint: "Perfecto para una clase" },
      { included: true, title: "Tareas, entregas y calificación", hint: "Con feedback personalizado" },
      { included: true, title: "Recursos: archivo, enlace y texto", hint: "Material centralizado por unidad" },
      { included: true, title: "Subida de archivos hasta 10 MB", hint: "PDFs, imágenes y documentos" },
      { included: false, title: "Co-profesores", hint: "Gestiona el aula en equipo" },
      { included: false, title: "Asignación inteligente de tareas" },
    ],
  },
  {
    id: "basic",
    name: "Básico",
    monthly: 9,
    badge: "Más elegido",
    tone: "primary",
    highlight: true,
    tagline: "Para profesores y creadores",
    cta: "Suscribirse",
    features: [
      { included: true, title: "Hasta 15 cursos", hint: "Crece sin migraciones" },
      { included: true, title: "Hasta 150 alumnos por curso", hint: "Varias clases a la vez" },
      { included: true, title: "Co-profesores en tus cursos", hint: "Comparte la gestión del aula" },
      { included: true, title: "Cuestionarios, foros y proyectos", hint: "Los 4 tipos de tarea" },
      { included: true, title: "Criterios de evaluación ponderados", hint: "Rúbricas con pesos por criterio" },
      { included: true, title: "Subida de archivos hasta 50 MB", hint: "Trabajos y presentaciones" },
      { included: true, title: "Soporte por correo", hint: "Respuesta en 48 h" },
    ],
  },
  {
    id: "premium",
    name: "Premium",
    monthly: 29,
    badge: "Para centros",
    tone: "dark",
    tagline: "Escalabilidad para instituciones",
    cta: "Suscribirse",
    features: [
      { included: true, title: "Cursos y alumnos ilimitados", hint: "Sin límites de capacidad" },
      { included: true, title: "Todo lo del plan Básico", hint: "Incluye co-profesores y rúbricas" },
      { included: true, title: "Asignación inteligente de tareas", hint: "Refuerzo automático a quien suspende" },
      { included: true, title: "Organizaciones educativas", hint: "Agrupa profesores y alumnos por centro" },
      { included: true, title: "Archivado e historial de cursos", hint: "Conserva ediciones anteriores" },
      { included: true, title: "Subida de archivos hasta 100 MB", hint: "Proyectos y archivos grandes" },
      { included: true, title: "Soporte prioritario", hint: "Atención preferente" },
    ],
  },
];
