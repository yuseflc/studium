/* Archivo: src\components\ui\CourseContent.tsx
  Descripción: Renderiza el contenido del curso: unidades, recursos y tareas en el orden del temario. */

"use client";
// Contenido de la unidad / curso: despliegue de recursos y navegación interna
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  FileText,
  ChevronDown,
  ClipboardList
} from "lucide-react";
import { IUnit } from "@/models/Unit";
import { IResource } from "@/models/Resource";
import { ITask } from "@/models/Task";
import TasksView from "@/components/tasks/TasksView";

/**
 * Tipo para Subject con units pobladas (estructura retornada por getCourseFullStructure)
 */
interface ISubjectWithUnits {
  _id: string;
  courseId: string;
  title: string;
  description?: string;
  order: number;
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

  // Recopilar todas las tareas de todos los subjects.
  // Compat: las tareas pueden vivir en `subject.tasks` (legacy) o dentro de cada unidad `unit.tasks`.
  const allTasks = subjects.flatMap((s) => {
    const subjectTasks = (s as any).tasks || [];
    const unitTasks = (s as any).units ? (s as any).units.flatMap((u: any) => u.tasks || []) : [];
    return [...subjectTasks, ...unitTasks];
  });

  /**
   * Toggle de expansión de una materia.
   * No muta el estado anterior, solo invierte el valor actual.
   */
  const toggleSubject = (subjectId: string) => {
    setOpenSubjects((prev) => {
      const currentValue = prev[subjectId];
      return {
        ...prev,
        [subjectId]: currentValue === undefined ? false : !currentValue,
      };
    });
  };

  // A partir de las materias recibidas, construir la lista canónica de unidades
  // flatten: cada unidad lleva metadatos de su materia padre para preservar orden y contexto
  const units = subjects.flatMap((s) => (s.units || []).map((u) => ({
    ...u,
    _subjectId: (s as any)._id,
    _subjectTitle: s.title,
    _subjectOrder: s.order ?? 0,
  })));

  // Ordenar las unidades primero por el orden de la materia y luego por su propio orden
  const sortedUnits = [...units].sort((a, b) => (a._subjectOrder - b._subjectOrder) || (a.order - b.order));


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
      {/* Mapear cada unidad como nivel superior en la vista de contenido del curso */}
      {sortedUnits.map((unit, idx) => {
        const unitId = unit._id || unit.title || idx;
        const unitKey = `unit-${String(unitId)}`;
        const isOpen = openSubjects[unitKey] !== false; // Abierto por defecto

        return (
          <div key={unitKey} id={unitKey} className="scroll-mt-24">
            <div className="mb-6 flex flex-col gap-2 group border border-base-200 rounded-lg p-4 hover:bg-base-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-2xl text-base-content/90 tracking-tight">
                    {/* Indicador de unidad (usar order cuando esté presente) */}
                    {typeof unit.order === 'number' ? `Unidad ${unit.order}` : `Unidad ${idx + 1}`} - {unit.title}
                  </h3>
                  <motion.button
                    type="button"
                    onClick={() => toggleSubject(unitKey)}
                    animate={{ rotate: isOpen ? 0 : -90 }}
                    transition={{ duration: 0.2 }}
                    className="text-base-content/30 hover:text-primary hover:bg-base-200 p-1 rounded-full transition-colors cursor-pointer flex items-center justify-center"
                    aria-label={isOpen ? 'Contraer unidad' : 'Expandir unidad'}
                    aria-expanded={isOpen}
                  >
                    <ChevronDown size={20} />
                  </motion.button>
                </div>
              </div>
              <div className="h-0.5 w-full bg-base-200 rounded-full" />

              {unit.content && (
                <p className="text-sm text-base-content/50 mt-1 pl-1">
                  {unit.content}
                </p>
              )}
            </div>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-col gap-4 ml-2 lg:ml-4 pb-4">
                    {/* Recursos */}
                    {unit.resources && unit.resources.length > 0 ? (
                      <div className="flex flex-col gap-2">
                        <div className="text-sm font-medium">Recursos</div>
                        <ul className="list-disc pl-5 text-sm text-base-content/80">
                          {unit.resources.map((r: any) => (
                            <li key={String(r._id || r.title)} className="truncate">{r.title}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {/* Tareas */}
                    {((unit as any).tasks && (unit as any).tasks.length > 0) ? (
                      <div className="flex flex-col gap-3">
                        <TasksView
                          tasks={(unit as any).tasks}
                          deletedItems={deletedItems}
                          onDeleteItem={onDeleteItem}
                          isTeacher={isTeacher}
                        />
                      </div>
                    ) : (
                      <div className="ml-4 py-4 text-sm text-base-content/40 italic pb-4">
                        Sin tareas en esta unidad
                      </div>
                    )}
                  </div>
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
        <div className="mb-6 flex flex-col gap-2 group border border-base-200 rounded-lg p-4 hover:bg-base-50 transition-colors">
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
