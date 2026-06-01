/* Archivo: src/components/ui/Navbars/CourseNavbarDrawerContent.tsx */
"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { ChevronRight, FileText, ClipboardList, BookOpen, Eye } from "lucide-react";
import { useCourseStructure } from "@/hooks/useCourseStructure";

const scrollToElement = (id: string) => {
  const target = document.getElementById(id);
  if (target) {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    // Cerrar drawer en móvil después de navegar
    const drawerCheckbox = document.getElementById("mobile-menu-drawer") as HTMLInputElement;
    if (drawerCheckbox && window.innerWidth < 640) {
      setTimeout(() => drawerCheckbox.checked = false, 300);
    }
  }
};

export default function CourseNavbarDrawerContent() {
  const pathname = usePathname();
  
  // Extraer courseId de la URL actual
  const courseId = useMemo(() => {
    const match = pathname?.match(/^\/course\/([^\/]+)/);
    return match?.[1] || null;
  }, [pathname]);

  const { structure, loading, error } = useCourseStructure(courseId);

  if (!courseId) return null;

  return (
    <div className="py-3 border-b border-base-200">
      <div className="collapse collapse-arrow">
        <input type="checkbox" defaultChecked />
        <div className="collapse-title font-extrabold text-sm uppercase">
          CONTENIDO DEL CURSO
        </div>
        
        <div className="collapse-content p-0">
          {loading ? (
            <div className="py-8 text-center">
              <span className="loading loading-spinner loading-md"></span>
              <p className="text-sm mt-2">Cargando contenido...</p>
            </div>
          ) : error ? (
            <div className="py-6 text-center text-error text-sm">{error}</div>
          ) : structure?.units?.length ? (
            <ul className="space-y-3 mt-2">
              {structure.units.map((unit, idx) => (
                <li key={unit._id} className="border border-base-200 rounded-xl overflow-hidden">
                  <details className="collapse" open={idx === 0}>
                    <summary className="collapse-title px-4 py-3 text-sm font-semibold flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-2">
                        <ChevronRight size={16} />
                        {unit.title}
                      </div>
                      <span className="badge badge-sm">
                        {(unit.tasks?.length || 0) + (unit.resources?.length || 0)}
                      </span>
                    </summary>
                    
                    <div className="collapse-content p-0">
                      {/* Acciones principales */}
                      <div className="px-2 pb-2 space-y-1">
                        <button
                          onClick={() => scrollToElement(`unit-${unit._id}`)}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm rounded-lg hover:bg-base-200"
                        >
                          <Eye size={14} /> Ver unidad completa
                        </button>
                        {(unit.resources?.length || 0) > 0 && (
                          <button
                            onClick={() => scrollToElement(`unit-${unit._id}-resources`)}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm rounded-lg hover:bg-base-200"
                          >
                            <BookOpen size={14} /> Ver recursos ({unit.resources?.length})
                          </button>
                        )}
                        {(unit.tasks?.length || 0) > 0 && (
                          <button
                            onClick={() => scrollToElement(`unit-${unit._id}-tasks`)}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm rounded-lg hover:bg-base-200"
                          >
                            <ClipboardList size={14} /> Ver tareas ({unit.tasks?.length})
                          </button>
                        )}
                      </div>

                      {/* Tareas */}
                      {(unit.tasks?.length || 0) > 0 && (
                        <div className="border-t px-4 py-2">
                          <p className="text-xs uppercase tracking-wider text-base-content/50 mb-2">Tareas</p>
                          <ul className="space-y-1">
                            {unit.tasks?.map(task => (
                              <li key={task._id}>
                                <button
                                  onClick={() => scrollToElement(`task-${task._id}`)}
                                  className="w-full text-left px-3 py-1.5 text-sm rounded-lg hover:bg-base-200"
                                >
                                  {task.type === 'quiz' ? '📝' : '✏️'} {task.title}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Recursos */}
                      {(unit.resources?.length || 0) > 0 && (
                        <div className="border-t px-4 py-2">
                          <p className="text-xs uppercase tracking-wider text-base-content/50 mb-2">Recursos</p>
                          <ul className="space-y-1">
                            {unit.resources?.map(resource => (
                              <li key={resource._id}>
                                <button
                                  onClick={() => scrollToElement(`resource-${resource._id}`)}
                                  className="w-full text-left px-3 py-1.5 text-sm rounded-lg hover:bg-base-200"
                                >
                                  {resource.type === 'video' && '🎥'}
                                  {resource.type === 'pdf' && '📄'}
                                  {resource.type === 'image' && '🖼️'}
                                  {resource.type === 'link' && '🔗'}
                                  {!['video', 'pdf', 'image', 'link'].includes(resource.type ?? '') && '📎'}
                                  {' '}{resource.title}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </details>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-base-content/60 py-4">No hay contenido disponible</p>
          )}
        </div>
      </div>
    </div>
  );
}