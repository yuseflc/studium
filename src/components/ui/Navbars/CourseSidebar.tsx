"use client";
import { CheckSquare, ChevronRight, Circle } from "lucide-react";
import { motion } from "framer-motion";
import { ISubject } from "@/models/Subject";
import { IUnit } from "@/models/Unit";
import { IResource } from "@/models/Resource";

/**
 * Tipo para Subject con units pobladas
 */
interface ISubjectWithUnits extends Omit<ISubject, 'unitIds'> {
  units?: (IUnit & { resources?: IResource[] })[];
  unitIds?: any[];
}

/**
 * Props del componente Sidebar
 */
interface CourseSidebarProps {
    isTeacher: boolean; // Indica si el usuario actual es profesor
    subjects: ISubjectWithUnits[]; // Lista de materias a mostrar
}

export default function CourseSidebar({ isTeacher, subjects }: CourseSidebarProps) {
    // Variantes motion para contenedor
    const containerVariants = {
        hidden: {
            x: "-100%",
            opacity: 0
        },
        visible: {
            x: 0,
            opacity: 1,
            transition: {
                duration: 0.1,
                when: "beforeChildren",
                delayChildren: 0.2,
                staggerChildren: 0.1,
            },
        }
    };

    // Variantes para cada materia (Hijo)
    const itemVariants = {
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                y: { stiffness: 1000, velocity: -100 },
            },
        },
        hidden: {
            y: -50,
            opacity: 0,
            transition: {
                y: { stiffness: 1000 },
            },
        },
    };

    return (
        <motion.aside
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full lg:w-72 border-r border-base-300 bg-base-100/30 lg:h-[calc(100vh-64px)] lg:overflow-y-auto lg:sticky lg:top-16"
        >
            <div className="p-4 border-b border-base-300 bg-base-100/50">
                <h3 className="font-bold text-sm uppercase tracking-wider text-base-content/50">Contenido del Curso</h3>
            </div>

            <div className="flex flex-col p-2 gap-1 relative">
                {subjects && subjects.length > 0 ? (
                    subjects
                        .sort((a, b) => a.order - b.order) // Ordenar materias por prioridad
                        .map((subject) => (
                            <motion.div
                                key={subject._id?.toString()}
                                variants={itemVariants}
                                className="relative"
                            >
                                {/* Componente de acordeón nativo de HTML */}
                                <details className="group relative">
                                    <summary className="flex items-center justify-between p-3 cursor-pointer hover:bg-primary/10 hover:text-primary rounded-xl transition-all list-none relative">
                                        <div className="flex items-center gap-3">
                                            {/* Icono que rota cuando el elemento está abierto */}
                                            <ChevronRight size={16} className="group-open:rotate-90 transition-transform text-base-content/40 group-hover:text-primary" />
                                            <span className="font-bold text-sm truncate max-w-[200px]">
                                                {subject.title}
                                            </span>
                                        </div>
                                    </summary>
                                    <div className="pb-2">
                                        <ul className="space-y-1 mt-1">
                                            {subject.units && subject.units.length > 0 ? (
                                                subject.units
                                                    .sort((a, b) => a.order - b.order)
                                                    .flatMap(u => u.resources || [])
                                                    .map((resource) => (
                                                        <li
                                                            key={resource._id?.toString()}
                                                            onClick={() => {
                                                                const element = document.getElementById(subject._id?.toString() || "");
                                                                if (element) {
                                                                    element.scrollIntoView({ behavior: 'smooth' });
                                                                }
                                                            }}
                                                            className="flex items-center gap-3 px-8 py-2 hover:bg-base-200 cursor-pointer text-sm text-base-content/70 rounded-lg transition-colors mx-2"
                                                        >
                                                            <CheckSquare size={14} className="text-base-content/30" />
                                                            <span className="truncate">{resource.title}</span>
                                                        </li>
                                                    ))
                                            ) : (
                                                <li className="px-8 py-2 text-xs italic text-base-content/40">Sin unidades</li>
                                            )}
                                        </ul>
                                    </div>
                                </details>
                            </motion.div>
                        ))
                ) : (
                    <div className="p-4 text-center text-sm text-base-content/40 italic">
                        No hay contenido disponible
                    </div>
                )}
            </div>

            {/* Sección exclusiva para profesores */}
            {isTeacher && (
                <div className="p-4">
                    <button className="btn btn-outline btn-primary btn-sm w-full gap-2">
                        <CheckSquare size={14} />
                        Gestionar Temas
                    </button>
                </div>
            )}
        </motion.aside>
    );
}