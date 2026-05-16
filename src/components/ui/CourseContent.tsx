"use client";

import { 
  BookOpen, 
  FileText, 
  StickyNote,
  Bookmark,
  GraduationCap
} from "lucide-react";

/**
 * Representa un recurso individual dentro de una unidad (enlace, archivo, texto o tarea)
 */
interface Resource {
  _id?: string;
  title: string;
  type: "link" | "file" | "text" | "task" | "exam" | "doc";
  url?: string;
  description?: string;
  status?: "pending" | "late" | "completed";
}

/**
 * Representa una unidad de aprendizaje con su contenido y recursos adicionales
 */
interface Unit {
  _id?: string;
  title: string;
  content: string;
  order: number;
  resources?: Resource[];
}

/**
 * Representa una materia o tema principal que agrupa varias unidades
 */
interface Subject {
  _id?: string;
  title: string;
  description?: string;
  order: number;
  units: Unit[];
}

/**
 * Propiedades del componente CourseContent
 */
interface CourseContentProps {
  subjects: Subject[];
}

export default function CourseContent({ subjects }: CourseContentProps) {
  // Renderizado defensivo si no hay materias
  if (!subjects || subjects.length === 0) {
    return (
      <div className="card bg-base-100 border border-base-300 p-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <BookOpen size={48} className="text-base-content/20" />
          <p className="text-xl font-semibold">Aún no hay contenido disponible</p>
          <p className="text-base-content/60">El profesor aún no ha añadido materias o unidades a este curso.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 py-4">
      {/* Ordenar y mapear materias */}
      {subjects
        .sort((a, b) => a.order - b.order)
        .map((subject) => (
          <div 
            key={subject._id || subject.title} 
            id={subject._id || subject.title} 
            className="scroll-mt-24"
          >
            {/* Cabecera del Tema (Título y Línea Larga) */}
            <div className="mb-6 flex flex-col gap-2">
              <h3 className="font-bold text-2xl text-base-content/90 tracking-tight">
                {subject.title}
              </h3>
              <div className="h-0.5 w-full bg-base-200 rounded-full" />
              
              {subject.description && (
                <p className="text-sm text-base-content/50 mt-1 pl-1">
                  {subject.description}
                </p>
              )}
            </div>

            {/* Lista vertical de tareas directamente debajo */}
            {subject.units && subject.units.length > 0 ? (
              <div className="flex flex-col gap-3 ml-2 lg:ml-4">
                {subject.units
                  .sort((a, b) => a.order - b.order)
                  .flatMap((unit) => unit.resources || [])
                  .map((resource) => (
                    <div
                      key={resource._id || resource.title}
                      className="flex items-center gap-4 p-4 rounded-2xl border border-base-200 bg-base-100 shadow-sm transition-all hover:shadow-md cursor-pointer group"
                    >
                      {/* Icono circular a la izquierda - Color Amarillo del proyecto */}
                      <div className="p-2.5 rounded-full flex-shrink-0 bg-yellow-100 text-yellow-600 shadow-sm">
                        {resource.type === "task" && (
                          <StickyNote size={18} className="fill-yellow-600/10" />
                        )}
                        {resource.type === "doc" && (
                          <Bookmark size={18} className="fill-yellow-600/10" />
                        )}
                        {resource.type === "exam" && (
                          <GraduationCap size={18} />
                        )}
                        {resource.type !== "task" && resource.type !== "doc" && resource.type !== "exam" && (
                          <FileText size={18} />
                        )}
                      </div>

                      {/* Detalle del recurso */}
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-base text-base-content/90 group-hover:text-primary transition-colors truncate">
                            {resource.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-base-content/50 truncate">
                            {resource.description || "Nueva tarea publicada"}
                          </span>
                        </div>
                      </div>

                      {/* Botón de opciones a la derecha */}
                      <div className="text-base-content/30 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-more-vertical"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="p-8 text-center text-base-content/50 italic">
                Sin tareas disponibles en esta materia.
              </div>
            )}
          </div>
        ))}
    </div>
  );
}
