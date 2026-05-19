"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, 
  FileText, 
  StickyNote,
  Bookmark,
  GraduationCap,
  ChevronDown,
  ClipboardList
} from "lucide-react";
import { ISubject } from "@/models/Subject";
import { IUnit } from "@/models/Unit";
import { IResource } from "@/models/Resource";
import { ITask } from "@/models/Task";

/**
 * Tipo para Subject con units pobladas (estructura retornada por getCourseFullStructure)
 */
interface ISubjectWithUnits extends Omit<ISubject, 'unitIds'> {
  units: (IUnit & { resources?: IResource[] })[];
  tasks?: ITask[];
}

/**
 * Propiedades del componente CourseContent
 */
interface CourseContentProps {
  subjects: ISubjectWithUnits[];
}

export default function CourseContent({ subjects }: CourseContentProps) {
  const [openSubjects, setOpenSubjects] = useState<Record<string, boolean>>({});

  const toggleSubject = (subjectId: string) => {
    setOpenSubjects((prev) => ({
      ...prev,
      [subjectId]: !prev[subjectId],
    }));
  };

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
        .map((subject) => {
          const subjectId = subject._id || subject.title;
          const isOpen = openSubjects[subjectId.toString()] !== false; // Abierto por defecto

          return (
            <div
              key={subjectId.toString()}
              id={subjectId.toString()}
              className="scroll-mt-24"
            >
              {/* Cabecera del Tema (Título y Línea Larga) */}
              <div
                className="mb-6 flex flex-col gap-2 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-2xl text-base-content/90 tracking-tight">
                      {subject.title}
                    </h3>
                    <motion.button
                      type="button"
                      onClick={() => toggleSubject(subjectId.toString())}
                      animate={{ rotate: isOpen ? 0 : -90 }}
                      transition={{ duration: 0.2 }}
                      className="text-base-content/30 hover:text-primary hover:bg-base-200 p-1 rounded-full transition-colors cursor-pointer flex items-center justify-center"
                    >
                      <ChevronDown size={20} />
                    </motion.button>
                  </div>
                </div>
                <div className="h-0.5 w-full bg-base-200 rounded-full" />

                {subject.description && (
                  <p className="text-sm text-base-content/50 mt-1 pl-1">
                    {subject.description}
                  </p>
                )}
              </div>

              {/* Lista vertical de tareas directamente debajo */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    {(subject.units.length > 0 || (subject.tasks && subject.tasks.length > 0)) ? (
                      <div className="flex flex-col gap-3 ml-2 lg:ml-4 pb-4">
                        {/* Renderizar Tareas del Subject si existen */}
                        {subject.tasks?.map((task: ITask) => {
                          if (!task._id) return null;
                          return (
                          <div
                            key={task._id.toString()}
                            className="flex items-center gap-4 p-4 rounded-2xl border border-base-200 bg-base-100 shadow-sm transition-all hover:shadow-md cursor-pointer group"
                          >
                            {/* Icono de Tarea - Estilo igual a otros recursos */}
                            <div className="p-2.5 rounded-full flex-shrink-0 bg-yellow-100 text-yellow-600 shadow-sm">
                              <ClipboardList size={18} className="fill-yellow-600/10" />
                            </div>

                            {/* Detalle de la tarea */}
                            <div className="flex flex-col min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-base text-base-content/90 group-hover:text-primary transition-colors truncate">
                                  {task.title}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-base-content/50 truncate">
                                  {task.dueDate instanceof Date 
                                    ? `Fecha de entrega: ${task.dueDate.toLocaleDateString()}` 
                                    : (task.description || "Nueva tarea publicada")}
                                </span>
                              </div>
                            </div>

                            {/* Botón de opciones a la derecha */}
                            <div className="text-base-content/30 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-more-vertical"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                            </div>
                          </div>
                          );
                        })}

                        {/* Renderizar Recursos de Unidades */}
                        {subject.units
                          .sort((a, b) => a.order - b.order)
                          .flatMap((unit) => unit.resources || [])
                          .map((resource : IResource) => (
                            <div
                              key={resource._id?.toString()}
                              className="flex items-center gap-4 p-4 rounded-2xl border border-base-200 bg-base-100 shadow-sm transition-all hover:shadow-md cursor-pointer group"
                            >
                              {/* Icono circular a la izquierda - Color Amarillo del proyecto */}
                              <div className="p-2.5 rounded-full flex-shrink-0 bg-yellow-100 text-yellow-600 shadow-sm">
                                {resource.type === "link" && (
                                  <StickyNote size={18} className="fill-yellow-600/10" />
                                )}
                                {resource.type === "file" && (
                                  <Bookmark size={18} className="fill-yellow-600/10" />
                                )}
                                {resource.type === "text" && (
                                  <GraduationCap size={18} />
                                )}
                                {resource.type !== "link" && resource.type !== "file" && resource.type !== "text" && (
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
                      <div className="ml-4 py-4 text-sm text-base-content/40 italic pb-4">
                        Sin recursos en este tema
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
    </div>
  );
}
