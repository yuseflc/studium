/* Archivo: src\components\sections\Features.tsx
    Descripción: Sección "Herramientas" de la landing. Organismo data-driven que compone
    ToolCard a partir de TOOLS / FEATURED_TOOLS (config/landing). Solo capacidades reales. */

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, CheckSquare, ClipboardList } from "lucide-react";
import {
  TOOLS,
  FEATURED_TOOLS,
  TOOL_ACCENT_CLASSES,
  type Tool,
} from "@/config/landing";

const TEACHER_AVATAR = "https://robohash.org/laroussi-teacher?set=set5";

/** Átomo: badge de capacidad reutilizable. */
function ToolTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="badge badge-warning gap-1 px-3 py-2 font-semibold text-xs text-warning-content">
      {children}
    </span>
  );
}

/** Molécula: tarjeta de herramienta con icono, copy, tags y una ilustración opcional. */
function ToolCard({ tool, illustration }: { tool: Tool; illustration?: React.ReactNode }) {
  const accent = TOOL_ACCENT_CLASSES[tool.accent];
  const Icon = tool.icon;

  return (
    <Card className="bg-base-100 border-none shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden p-6 group">
      <div className={`${accent.wrapperBase} ${accent.wrapperHover} p-3 rounded-2xl w-fit transition-colors`}>
        <Icon className={`size-6 ${accent.iconBase} ${accent.iconHover}`} />
      </div>
      <h3 className="text-base-content mt-6 text-xl font-bold">{tool.title}</h3>
      <p className="text-base-content/70 mt-3 text-balance leading-relaxed">{tool.description}</p>

      {tool.tags && (
        <div className="mt-4 flex flex-wrap gap-2">
          {tool.tags.map((tag) => (
            <ToolTag key={tag}>{tag}</ToolTag>
          ))}
        </div>
      )}

      {illustration && <div className="mt-8">{illustration}</div>}
    </Card>
  );
}

// Ilustraciones decorativas asociadas por id de herramienta (slot opcional de ToolCard).
const TOOL_ILLUSTRATIONS: Record<string, React.ReactNode> = {
  courses: <ClassIllustration />,
  tasks: <TaskIllustration />,
  feedback: <FeedbackIllustration />,
};

export default function FeaturesSection() {
  return (
    <section id="features" className="bg-base-200">
      <div className="py-24">
        <div className="mx-auto w-full max-w-5xl px-6">
          <div className="text-center">
            <h2 className="text-base-content text-balance text-4xl font-bold tracking-tight">
              Todo lo que necesitas para dar clase
            </h2>
            <p className="mt-4 text-lg text-base-content/70">
              Una plataforma integral que conecta a profesores y estudiantes de principio a fin del
              curso.
            </p>
          </div>

          {/* Herramientas principales */}
          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {TOOLS.map((tool) => (
              <ToolCard key={tool.id} tool={tool} illustration={TOOL_ILLUSTRATIONS[tool.id]} />
            ))}
          </div>

          {/* Herramientas destacadas (banda inferior) */}
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            {FEATURED_TOOLS.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Ilustraciones decorativas                                          */
/* ------------------------------------------------------------------ */

function ClassIllustration() {
  return (
  <Card className="bg-base-200 border-none shadow-inner aspect-video p-4 flex flex-col justify-between">
    <div className="flex justify-between items-start">
      <div>
        <div className="text-sm font-bold text-base-content">Matemáticas Avanzadas</div>
        <div className="text-[10px] text-base-content/50 uppercase tracking-wider font-semibold">
          Unidad 3 • Álgebra
        </div>
      </div>
      <div className="badge badge-success badge-sm text-success-content font-bold">Activo</div>
    </div>

    <div className="bg-base-100 rounded-xl p-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-2 text-xs font-medium">
        <Clock size={12} className="text-primary" />
        <span className="text-base-content">Código de acceso: 7K2P9X</span>
      </div>
      <Button size="sm" className="h-7 text-[10px] bg-primary text-primary-content border-none hover:bg-primary/80">
        Entrar
      </Button>
    </div>
  </Card>
  );
}

function TaskIllustration() {
  return (
  <div className="relative group/illust">
    <Card className="bg-base-200 border-none aspect-video w-[85%] translate-y-2 p-4 transition-all duration-500 group-hover:rotate-[-2deg] group-hover:scale-105 shadow-md flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold opacity-50 text-base-content">ENTREGA DE PROYECTO</span>
        <div className="size-2 rounded-full bg-warning animate-pulse" />
      </div>
      <div className="space-y-2">
        <div className="h-2 w-full bg-base-content/10 rounded-full" />
        <div className="h-2 w-3/4 bg-base-content/10 rounded-full" />
      </div>
      <div className="mt-2 p-2 border-2 border-dashed border-base-content/20 rounded-lg flex items-center justify-center gap-2">
        <ClipboardList className="size-4 opacity-30 text-base-content" />
        <span className="text-[10px] font-medium opacity-50 text-base-content">Arrastrar archivo aquí</span>
      </div>
    </Card>
    <Card className="absolute top-2 right-0 w-1/3 aspect-square bg-secondary text-secondary-content flex flex-col items-center justify-center p-2 rounded-2xl shadow-xl transition-all duration-500 group-hover:rotate-[6deg] group-hover:translate-x-2">
      <CheckSquare className="size-6 mb-1" />
      <span className="text-[8px] font-bold">RECIBIDO</span>
    </Card>
  </div>
  );
}

function FeedbackIllustration() {
  return (
  <Card className="bg-base-200 border-none aspect-video translate-y-4 p-4 transition-all duration-500 group-hover:translate-y-0 shadow-md">
    <div className="flex items-center gap-2 mb-3">
      <div className="avatar w-6 h-6 ring ring-accent ring-offset-base-200 ring-offset-2 rounded-full">
        <img src={TEACHER_AVATAR} alt="Profesor" />
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] font-bold text-base-content">Prof. Laroussi</span>
        <span className="text-[8px] opacity-50 text-base-content">Hace 5 minutos</span>
      </div>
    </div>
    <div className="bg-base-100 p-2.5 rounded-xl rounded-tl-none border border-base-300/30 text-[10px] leading-relaxed italic shadow-sm text-base-content">
      "Excelente progreso en este tema. Te sugiero revisar el capítulo 4 para reforzar la base
      teórica."
    </div>
    <div className="mt-3 flex gap-1 items-center justify-end">
      <div className="badge badge-accent badge-xs font-bold p-2">Nota: 9/10</div>
    </div>
  </Card>
  );
}
