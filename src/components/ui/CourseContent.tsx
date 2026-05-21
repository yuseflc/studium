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
import TasksView from "./tasks/TasksView";

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
  deletedItems?: string[];
  onDeleteItem?: (id: string) => void;
  isTeacher?: boolean;
}

export default function CourseContent({ 
  subjects, 
  deletedItems = [],
  onDeleteItem,
  isTeacher = false
}: CourseContentProps) {
  // Controla qué materias están expandidas en la UI.
  const [openSubjects, setOpenSubjects] = useState<Record<string, boolean>>({});

  // Recopilar todas las tareas de todos los subjects
  const allTasks = subjects.flatMap(s => (s as any).tasks || []);

  /**
   * Toggle de expansión de una materia.
   * No muta el estado anterior, solo invierte el valor actual.
   */
  const toggleSubject = (subjectId: string) => {
    setOpenSubjects((prev) => ({
      ...prev,
      [subjectId]: !prev[subjectId],
    }));
  };

  // Ordenar las materias fuera del render principal para no mutar el arreglo de props.
  const sortedSubjects = [...subjects].sort((a, b) => a.order - b.order);


  // rendering-conditional-render: Validación defensiva al inicio (fail-fast pattern)
  // Previene rendering de estructura vacía si no hay materias
  if (!subjects || subjects.length === 0) {
    return (
      <div className="card bg-base-100 border border-base-300 p-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <BookOpen size={48} className="text-base-content/20" />
          <p className="text-xl font-semibold">Aún no hay tareas disponibles</p>
          <p className="text-base-content/60">El profesor aún no ha añadido temas o tareas a este curso.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 py-4">
      {/* Ordenar por propiedad order y mapear cada materia */}
      {sortedSubjects.map((subject) => {
          const subjectId = subject._id || subject.title;
          const isOpen = openSubjects[subjectId.toString()] !== false; // Abierto por defecto
          const sortedUnits = subject.units ? [...subject.units].sort((a, b) => a.order - b.order) : [];

          return (
            <div
              key={subjectId.toString()}
              id={subjectId.toString()}
              className="scroll-mt-24"
            >
              {/* Cabecera: Título, botón de toggle y línea decorativa */}
              <div className="mb-6 flex flex-col gap-2 group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-2xl text-base-content/90 tracking-tight">
                      {subject.title}
                    </h3>
                    {/* Botón de toggle con animación de rotación */}
                    <motion.button
                      type="button"
                      onClick={() => toggleSubject(subjectId.toString())}
                      animate={{ rotate: isOpen ? 0 : -90 }}
                      transition={{ duration: 0.2 }}
                      className="text-base-content/30 hover:text-primary hover:bg-base-200 p-1 rounded-full transition-colors cursor-pointer flex items-center justify-center"
                      aria-label={isOpen ? 'Contraer materia' : 'Expandir materia'}
                      aria-expanded={isOpen}
                    >
                      <ChevronDown size={20} />
                    </motion.button>
                  </div>
                </div>
                {/* Línea decorativa separadora */}
                <div className="h-0.5 w-full bg-base-200 rounded-full" />

                {subject.description && (
                  <p className="text-sm text-base-content/50 mt-1 pl-1">
                    {subject.description}
                  </p>
                )}
              </div>

              {/* AnimatePresence + Motion: Animación suave de expansión/contracción */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    {((subject as any).tasks && (subject as any).tasks.length > 0) ? (
                      <div className="flex flex-col gap-3 ml-2 lg:ml-4 pb-4">
                        <TasksView 
                          tasks={(subject as any).tasks} 
                          deletedItems={deletedItems} 
                          onDeleteItem={onDeleteItem} 
                          isTeacher={isTeacher} 
                        />
                      </div>
                    ) : (
                      // Mensaje cuando no hay contenido en la materia
                      <div className="ml-4 py-4 text-sm text-base-content/40 italic pb-4">
                        Sin tareas en este tema
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

      {/* Sección separada: Listado completo de todas las tareas del curso renderizado como un Subject (Tema) */}
      <div
        id="tasks-global-section"
        className="scroll-mt-24"
      >
        <div className="mb-6 flex flex-col gap-2 group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="font-bold text-2xl text-base-content/90 tracking-tight">
                Tareas
              </h3>
              <motion.button
                type="button"
                onClick={() => toggleSubject('tasks-global-section')}
                animate={{ rotate: openSubjects['tasks-global-section'] !== false ? 0 : -90 }}
                transition={{ duration: 0.2 }}
                className="text-base-content/30 hover:text-primary hover:bg-base-200 p-1 rounded-full transition-colors cursor-pointer flex items-center justify-center"
                aria-label={openSubjects['tasks-global-section'] !== false ? 'Contraer tareas' : 'Expandir tareas'}
                aria-expanded={openSubjects['tasks-global-section'] !== false}
              >
                <ChevronDown size={20} />
              </motion.button>
            </div>
          </div>
          <div className="h-0.5 w-full bg-base-200 rounded-full" />
        </div>

        <AnimatePresence>
          {openSubjects['tasks-global-section'] !== false && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="flex flex-col gap-3 ml-2 lg:ml-4 pb-4">
                <TasksView 
                  tasks={allTasks} 
                  deletedItems={deletedItems} 
                  onDeleteItem={onDeleteItem} 
                  isTeacher={isTeacher} 
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
