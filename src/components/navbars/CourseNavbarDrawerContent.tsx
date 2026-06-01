/* Archivo: src\components\ui\Navbars\CourseNavbarDrawerContent.tsx
  Descripción: Contenido interno del drawer del navbar para la vista de curso. */

// Drawer content: lista de elementos del navbar del curso (estructura navegable)
"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getCourseStructure } from "@/app/actions/courseActions";

interface TaskItem {
  _id: string;
  title: string;
  type?: string;
}

interface ResourceItem {
  _id: string;
  title: string;
}

interface UnitItem {
  _id: string;
  title: string;
  resources?: ResourceItem[];
  tasks?: TaskItem[];
}

interface CourseStruct {
  units?: UnitItem[];
}

const scrollToElement = (id: string) => {
  const target = document.getElementById(id);
  if (target) {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

export default function CourseNavbarDrawerContent() {
  const pathname = usePathname();
  const courseId = useMemo(() => {
    const match = pathname?.match(/^\/mycourses\/([^\/]+)/);
    return match?.[1] || null;
  }, [pathname]);

  const [structure, setStructure] = useState<CourseStruct | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasAssignments = (unit: UnitItem) =>
    unit.tasks?.some((task) => task.type !== "quiz");

  const hasExams = (unit: UnitItem) =>
    unit.tasks?.some((task) => task.type === "quiz");

  useEffect(() => {
    if (!courseId) {
      setStructure(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    getCourseStructure(courseId)
      .then((result) => {
        if (result.success) {
          setStructure(result.structure || null);
        } else {
          setError(result.error || "Error cargando curso");
        }
      })
      .catch(() => {
        setError("No se pudo cargar el contenido del curso.");
      })
      .finally(() => setLoading(false));
  }, [courseId]);

  if (!courseId) {
    return null;
  }

  return (
    <div className="animate-[fadeInUp_0.35s_ease-out_0.12s_both]">
      <div className="py-4 border-b border-base-200">
        <div className="collapse collapse-arrow">
          <input type="checkbox" aria-label="Expandir contenido del curso" />
          <div className="collapse-title font-extrabold text-base text-base-content tracking-tight uppercase">
            CONTENIDO DEL CURSO
          </div>

          <div className="collapse-content p-0 text-base">
            {loading ? (
              <div className="py-4 px-4 text-sm text-base-content/70">Cargando contenido...</div>
            ) : error ? (
              <div className="py-4 px-4 text-sm text-error/80">{error}</div>
            ) : structure?.units?.length ? (
              <ul className="menu menu-md w-full gap-1">
                {structure.units.map((unit) => (
                  <li key={unit._id}>
                    <details className="collapse collapse-arrow rounded-xl border border-base-200 bg-base-100/50">
                      <summary className="collapse-title px-4 py-3 text-sm font-semibold text-base-content">
                        <div className="flex items-center gap-2">
                          <ChevronRight size={16} className="text-base-content/40" />
                          {unit.title}
                        </div>
                        <span className="badge badge-sm bg-base-200 text-base-content/70">
                          {(unit.tasks?.length || 0) + (unit.resources?.length || 0)}
                        </span>
                      </summary>

                      <div className="collapse-content p-0">
                        <ul className="menu menu-sm gap-1 px-2 pb-2">
                          <li>
                            <button
                              type="button"
                              onClick={() => scrollToElement(`unit-${unit._id}`)}
                              className="flex w-full items-center justify-between rounded-lg px-4 py-2 text-left text-sm text-base-content/80 transition-colors hover:bg-base-200"
                            >
                              <span>Ver unidad</span>
                            </button>
                          </li>
                          {unit.resources && unit.resources.length > 0 && (
                            <li>
                              <button
                                type="button"
                                onClick={() => scrollToElement(`unit-${unit._id}`)}
                                className="flex w-full items-center justify-between rounded-lg px-4 py-2 text-left text-sm text-base-content/80 transition-colors hover:bg-base-200"
                              >
                                <span>Ver recursos</span>
                              </button>
                            </li>
                          )}
                          {hasAssignments(unit) && (
                            <li>
                              <button
                                type="button"
                                onClick={() => scrollToElement(`unit-${unit._id}`)}
                                className="flex w-full items-center justify-between rounded-lg px-4 py-2 text-left text-sm text-base-content/80 transition-colors hover:bg-base-200"
                              >
                                <span>Ver Tareas</span>
                              </button>
                            </li>
                          )}
                          {hasExams(unit) && (
                            <li>
                              <button
                                type="button"
                                onClick={() => scrollToElement(`unit-${unit._id}`)}
                                className="flex w-full items-center justify-between rounded-lg px-4 py-2 text-left text-sm text-base-content/80 transition-colors hover:bg-base-200"
                              >
                                <span>Ver Examenes</span>
                              </button>
                            </li>
                          )}
                        </ul>

                        {(unit.tasks?.length || 0) > 0 ? (
                          <div className="border-t border-base-200 px-4 pb-3 pt-2">
                            <p className="text-[10px] uppercase tracking-[0.3em] text-base-content/50 mb-2">
                              Tareas asignadas
                            </p>
                            <ul className="space-y-1">
                              {unit.tasks?.map((task) => (
                                <li key={task._id}>
                                  <button
                                    type="button"
                                    onClick={() => scrollToElement(`task-${task._id}`)}
                                    className="block w-full rounded-lg px-4 py-2 text-left text-sm text-base-content/80 transition-colors hover:bg-base-200"
                                  >
                                    {task.title}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : null}

                        {(unit.resources?.length || 0) > 0 ? (
                          <div className="border-t border-base-200 px-4 pb-3 pt-2">
                            <p className="text-[10px] uppercase tracking-[0.3em] text-base-content/50 mb-2">
                              Recursos
                            </p>
                            <ul className="space-y-1">
                              {unit.resources?.map((resource) => (
                                <li key={resource._id}>
                                  <button
                                    type="button"
                                    onClick={() => scrollToElement(`unit-${unit._id}`)}
                                    className="block w-full rounded-lg px-4 py-2 text-left text-sm text-base-content/80 transition-colors hover:bg-base-200"
                                  >
                                    {resource.title}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : null}
                      </div>
                    </details>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-4 px-4 text-sm text-base-content/70">No hay contenido disponible.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
