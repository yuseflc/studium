import { CheckSquare, ChevronRight, Circle } from "lucide-react";

interface CourseSidebarProps {
    isTeacher: boolean;
}

export default function CourseSidebar({ isTeacher }: CourseSidebarProps) {
    return (
        <aside className="w-full lg:w-72 border-r border-base-300 bg-base-100/30 lg:h-screen lg:overflow-y-auto lg:sticky lg:top-0">
            <div className="p-4 border-b border-base-300 bg-base-100/50">
                <h3 className="font-bold text-sm uppercase tracking-wider text-base-content/50">Contenido del Curso</h3>
            </div>

            <div className="flex flex-col p-2 gap-1 relative z-50">
                {/* Ejemplo de Unidades */}
                {[1, 2, 3, 4, 5, 6].map((ut) => (
                    <div key={ut} className="relative z-50">
                        <details className="group relative z-50" open={ut >= 5}>
                            <summary className="flex items-center justify-between p-3 cursor-pointer hover:bg-primary/10 hover:text-primary rounded-xl transition-all list-none relative z-50">
                                <div className="flex items-center gap-3">
                                    <ChevronRight size={16} className="group-open:rotate-90 transition-transform text-base-content/40 group-hover:text-primary" />
                                    <span className="font-bold text-sm truncate max-w-[200px]">
                                        UT{ut}: {
                                            "Nombre de la Unidad"
                                        }
                                    </span>
                                </div>
                            </summary>
                            <div className="pb-2">
                                <ul className="space-y-1 mt-1">
                                    <li className="flex items-center gap-3 px-8 py-2 hover:bg-base-200 cursor-pointer text-sm text-base-content/70 rounded-lg transition-colors mx-2">
                                        <Circle size={11} className="text-base-content/30" />
                                        <span>Tema {ut}</span>
                                    </li>
                                    {ut === 6 && (
                                        <li className="flex items-center gap-3 px-8 py-2 hover:bg-base-200 cursor-pointer text-sm text-base-content/70 rounded-lg transition-colors mx-2">
                                            <Circle size={10} className="text-base-content/30" />
                                            <span className="truncate">Actividad 1: Ejercicio JavaScript</span>
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </details>
                    </div>
                ))}
            </div>

            {isTeacher && (
                <div className="p-4">
                    <button className="btn btn-outline btn-primary btn-sm w-full gap-2">
                        <CheckSquare size={14} />
                        Gestionar Temas
                    </button>
                </div>
            )}
        </aside>
    );
}