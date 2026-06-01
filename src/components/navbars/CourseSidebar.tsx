/* Archivo: src\components\ui\Navbars\CourseSidebar.tsx
    Descripción: Sidebar lateral con navegación específica del curso (unidades, recursos). */

// Componente: CourseSidebar — barra lateral que muestra unidades, recursos y navegación del curso
"use client";
import { ChevronRight, ClipboardList } from "lucide-react";
import { motion } from "framer-motion";
import { IUnit } from "@/models/Unit";
import { IResource } from "@/models/Resource";
import { ITask } from "@/models/Task";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";

interface IUnitWithContent extends IUnit {
        resources?: IResource[];
        tasks?: ITask[];
}

interface ISubjectWithUnits {
                _id: string;
                courseId?: string;
                title: string;
                description?: string;
                order?: number;
                units?: IUnitWithContent[];
        unitIds?: string[];
    tasks?: ITask[];
}

interface CourseSidebarProps {
    isTeacher: boolean;
    subjects: ISubjectWithUnits[];
    courseData?: any;
}

export default function CourseSidebar({ isTeacher, subjects, courseData }: CourseSidebarProps) {
    const router = useRouter();
    const params = useParams();
    const courseid = (params?.courseid as string) || "course-1";

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

    const handleScrollToSubject = (subjectId: string) => {
        const element = document.getElementById(`subject-${subjectId}`);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    const handleScrollToUnit = (unitId: string) => {
        const element = document.getElementById(`unit-${unitId}`);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    const getUnitTasks = (subject: ISubjectWithUnits, unit: IUnitWithContent) => {
        const unitTasks = subject.tasks || [];
        const nestedTasks = unit.tasks || [];
        return [...unitTasks, ...nestedTasks];
    };

    const hasUnitResources = (unit: IUnitWithContent) => (unit.resources?.length || 0) > 0;

    const hasUnitAssignments = (subject: ISubjectWithUnits, unit: IUnitWithContent) =>
        getUnitTasks(subject, unit).length > 0;

    const sortedSubjects = [...subjects].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    const isMappedUnitSubject = (subject: ISubjectWithUnits) =>
        !!subject.units && subject.units.length === 1 && String(subject._id) === String(subject.units[0]._id);

    const getUnitMenuEntries = (subject: ISubjectWithUnits, unit: IUnitWithContent) => {
        const entries: Array<{ label: string; onClick: () => void }> = [
            {
                label: "Ver unidad",
                onClick: () => handleScrollToUnit(unit._id?.toString() || ""),
            },
        ];

        if (hasUnitResources(unit)) {
            entries.push({
                label: "Ver recursos",
                onClick: () => handleScrollToUnit(unit._id?.toString() || ""),
            });
        }

        if (hasUnitAssignments(subject, unit)) {
            entries.push({
                label: "Ver Tareas",
                onClick: () => handleScrollToUnit(unit._id?.toString() || ""),
            });
        }

        return entries;
    };

    return (
        <>
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
                        sortedSubjects.map((subject) => {
                            if (isMappedUnitSubject(subject)) {
                                const unit = subject.units?.[0];

                                if (!unit) {
                                    return null;
                                }

                                const unitMenuEntries = getUnitMenuEntries(subject, unit);

                                return (
                                    <motion.div
                                        key={subject._id?.toString()}
                                        variants={itemVariants}
                                        className="relative"
                                    >
                                        <details className="group relative rounded-xl border border-base-200 bg-base-100/50">
                                            <summary className="flex items-center justify-between p-3 cursor-pointer hover:bg-primary/10 hover:text-primary rounded-xl transition-all list-none relative">
                                                <div className="flex items-center gap-3">
                                                    <ChevronRight size={16} className="group-open:rotate-90 transition-transform text-base-content/40 group-hover:text-primary" />
                                                    <span className="font-bold text-sm truncate max-w-[200px]">
                                                        {unit.title}
                                                    </span>
                                                </div>
                                                <span className="inline-flex items-center justify-center px-1.5 min-w-[1.25rem] h-5 rounded-full text-[10px] font-bold bg-base-200 text-base-content/60 border border-base-300 shadow-sm">{unitMenuEntries.length}</span>
                                            </summary>
                                            <div className="pb-2">
                                                <ul className="space-y-1 mt-1 px-2 pb-2">
                                                    {unitMenuEntries.map((entry) => (
                                                        <li key={`${unit._id?.toString()}-${entry.label}`}>
                                                            <button
                                                                type="button"
                                                                onClick={entry.onClick}
                                                                className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-left text-sm text-base-content/70 transition-colors hover:bg-base-200 hover:text-base-content"
                                                            >
                                                                <ClipboardList size={14} className="text-base-content/30" />
                                                                <span className="truncate">{entry.label}</span>
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </details>
                                    </motion.div>
                                );
                            }

                            return (
                                <motion.div
                                    key={subject._id?.toString()}
                                    variants={itemVariants}
                                    className="relative"
                                >
                                    <details className="group relative rounded-xl border border-base-200 bg-base-100/50">
                                        <summary className="flex items-center justify-between p-3 cursor-pointer hover:bg-primary/10 hover:text-primary rounded-xl transition-all list-none relative">
                                            <div className="flex items-center gap-3">
                                                <ChevronRight size={16} className="group-open:rotate-90 transition-transform text-base-content/40 group-hover:text-primary" />
                                                <span className="font-bold text-sm truncate max-w-[200px]">
                                                    {subject.title}
                                                </span>
                                            </div>
                                            <span className="inline-flex items-center justify-center px-1.5 min-w-[1.25rem] h-5 rounded-full text-[10px] font-bold bg-base-200 text-base-content/60 border border-base-300 shadow-sm">{subject.units?.length || 0}</span>
                                        </summary>
                                        <div className="pb-2">
                                            <ul className="space-y-1 mt-1 px-2 pb-2">
                                                <li>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleScrollToSubject(subject._id?.toString() || "")}
                                                        className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-left text-sm text-base-content/70 transition-colors hover:bg-base-200 hover:text-base-content"
                                                    >
                                                        <ClipboardList size={14} className="text-base-content/30" />
                                                        <span className="truncate">Ver materia</span>
                                                    </button>
                                                </li>
                                                {subject.units && subject.units.length > 0 ? (
                                                    subject.units.map((unit, unitIndex) => (
                                                        <li key={unit._id?.toString() || `${subject._id}-${unitIndex}`}>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleScrollToUnit(unit._id?.toString() || "")}
                                                                className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-left text-sm text-base-content/70 transition-colors hover:bg-base-200 hover:text-base-content"
                                                            >
                                                                <span className="inline-flex items-center justify-center px-1.5 min-w-[1.25rem] h-5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 shadow-sm">
                                                                    {unitIndex + 1}
                                                                </span>
                                                                <span className="truncate">{unit.title}</span>
                                                            </button>
                                                        </li>
                                                    ))
                                                ) : (
                                                    <li className="px-4 py-2 text-xs italic text-base-content/40">Sin unidades</li>
                                                )}
                                            </ul>
                                        </div>
                                    </details>
                                </motion.div>
                            );
                        })
                    ) : (
                        <div className="p-4 text-center text-sm text-base-content/40 italic">
                            No hay contenido disponible
                        </div>
                    )}
                </div>
            </motion.aside>
        </>
    );
}