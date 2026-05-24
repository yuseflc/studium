"use client";
import { ChevronRight, Search, ClipboardList } from "lucide-react";
import { motion } from "framer-motion";
import { ISubject } from "@/models/Subject";
import { IUnit } from "@/models/Unit";
import { ITask } from "@/models/Task";
import { useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ModalSearch } from "../modals";

interface ISubjectWithUnits extends Omit<ISubject, 'unitIds'> {
    units?: (IUnit & { resources?: unknown[] })[];
  unitIds?: any[];
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

    const searchModalRef = useRef<HTMLDialogElement>(null);
    const [searchTerm, setSearchTerm] = useState("");

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

    // Recopilar todas las tareas de los subjects
    const allTasks = subjects.flatMap(s => s.tasks || []);

    // Filtrar tareas por término de búsqueda (título o descripción)
    const filteredTasks = allTasks.filter(task => {
        const title = task.title || "";
        const description = task.description || "";
        return title.toLowerCase().includes(searchTerm.toLowerCase()) ||
               description.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const handleGoToTask = (taskId: string) => {
        searchModalRef.current?.close();
        router.push(`/mycourses/${courseid}/tasks/${taskId}`);
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

    const sortedSubjects = [...subjects].sort((a, b) => a.order - b.order);

    return (
        <>
            <motion.aside
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="w-full lg:w-72 border-r border-base-300 bg-base-100/30 lg:h-[calc(100vh-64px)] lg:overflow-y-auto lg:sticky lg:top-16 flex flex-col justify-between"
            >
                <div className="flex-1">
                    <div className="p-4 border-b border-base-300 bg-base-100/50">
                        <h3 className="font-bold text-sm uppercase tracking-wider text-base-content/50">Contenido del Curso</h3>
                    </div>

                    <div className="flex flex-col p-2 gap-1 relative">
                        {subjects && subjects.length > 0 ? (
                            sortedSubjects.map((subject) => (
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
                                            <span className="badge badge-ghost badge-sm">{subject.units?.length || 0}</span>
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
                                                                <span className="badge badge-primary badge-sm min-w-10 justify-center">
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
                            ))
                        ) : (
                            <div className="p-4 text-center text-sm text-base-content/40 italic">
                                No hay contenido disponible
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-4 border-t border-base-200 bg-base-100/50">
                    <button 
                        onClick={() => {
                            setSearchTerm("");
                            searchModalRef.current?.showModal();
                        }}
                        className="btn btn-outline btn-primary btn-sm w-full gap-2 hover:bg-primary hover:text-primary-content transition-all rounded-xl font-bold border-2"
                    >
                        <Search size={14} />
                        Buscador de Tareas
                    </button>
                </div>
            </motion.aside>

            {/* Modal para Buscar y Navegar a Tareas */}
            <ModalSearch
                id="search-tasks-dialog"
                dialogRef={searchModalRef}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                filteredTasks={filteredTasks}
                onGoToTask={handleGoToTask}
                onClose={() => searchModalRef.current?.close()}
            />
        </>
    );
}