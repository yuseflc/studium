"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import {
    BookOpen,
    Users,
    GraduationCap,
    Settings
} from "lucide-react";
import CourseSidebar from "./Navbars/CourseSidebar";
import CourseContent from "./CourseContent";
import CourseParticipants from "./CourseParticipants";
import GradesView from "./grades/GradesView";
import CourseFAB from "./CourseFAB";
import { PARTICIPANTES } from "@/seed/data";
import { ICourse } from "@/models/Course";
import { ISubject } from "@/models/Subject";
import { CourseStructureGeneric } from "@/lib/api/types";

interface CourseViewProps {
    courseData: ICourse | null;
    courseStructure: CourseStructureGeneric | null;
    isTeacher: boolean;
}

export default function CourseView({ courseData, isTeacher }: CourseViewProps) {
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = useState<"content" | "participants" | "grades" | "settings">("content");
    const [deletedItems, setDeletedItems] = useState<string[]>([]);

    const subjects = courseData?.subjects || [];

    const handleAddTask = (task: any) => {
        window.location.reload();
    };

    const handleDeleteItem = async (id: string) => {
        setDeletedItems((prev) => [...prev, id]);

        try {
            await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row">
            <CourseSidebar isTeacher={isTeacher} subjects={subjects} />

            <main className="flex-1 p-4 sm:p-6 lg:p-8">
                <div className="max-w-8xl mx-auto">
                    {/* Header */}
                    <div className="mb-6 sm:mb-8">
                        <h1 className="text-2xl sm:text-3xl font-bold mb-2 break-words">
                            {courseData?.title || "Cargando curso..."}
                            {courseData?.status === "draft" && (
                                <span className="badge bg-secondary text-base-content ml-2 align-middle">BORRADOR</span>
                            )}
                        </h1>
                    </div>

                    <div className="flex border-b border-base-300 mb-6 overflow-x-auto relative z-10">
                        <button
                            type="button"
                            onClick={() => setActiveTab("content")}
                            className={`pb-3 px-3 sm:px-4 flex items-center gap-1.5 sm:gap-2 border-b-2 transition-colors shrink-0 whitespace-nowrap ${activeTab === "content"
                                ? "border-primary text-primary font-semibold"
                                : "border-transparent text-base-content/60 hover:text-base-content"
                                }`}
                        >
                            <BookOpen size={18} />
                            <span className="text-sm sm:text-base">Curso</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("participants")}
                            className={`pb-3 px-3 sm:px-4 flex items-center gap-1.5 sm:gap-2 border-b-2 transition-colors shrink-0 whitespace-nowrap ${activeTab === "participants"
                                ? "border-primary text-primary font-semibold"
                                : "border-transparent text-base-content/60 hover:text-base-content"
                                }`}
                        >
                            <Users size={18} />
                            <span className="text-sm sm:text-base">Participantes</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("grades")}
                            className={`pb-3 px-3 sm:px-4 flex items-center gap-1.5 sm:gap-2 border-b-2 transition-colors shrink-0 whitespace-nowrap ${activeTab === "grades"
                                ? "border-primary text-primary font-semibold"
                                : "border-transparent text-base-content/60 hover:text-base-content"
                                }`}
                        >
                            <GraduationCap size={18} />
                            <span className="text-sm sm:text-base">Calificaciones</span>
                        </button>
                        {isTeacher && (
                            <button
                                type="button"
                                onClick={() => setActiveTab("settings")}
                                className={`pb-3 px-3 sm:px-4 flex items-center gap-1.5 sm:gap-2 border-b-2 transition-colors shrink-0 whitespace-nowrap ${activeTab === "settings"
                                    ? "border-primary text-primary font-semibold"
                                    : "border-transparent text-base-content/60 hover:text-base-content"
                                    }`}
                            >
                                <Settings size={18} />
                                <span className="text-sm sm:text-base">Ajustes</span>
                            </button>
                        )}
                    </div>

                    {/* Vistas Renderizadas */}
                    <div className="space-y-6">
                        {activeTab === "content" && (
                            <CourseContent
                                subjects={subjects}
                                deletedItems={deletedItems}
                                onDeleteItem={handleDeleteItem}
                                isTeacher={isTeacher}
                            />
                        )}

                        {activeTab === "participants" && (
                            <CourseParticipants participants={PARTICIPANTES} />
                        )}

                        {activeTab === "grades" && (
                            <GradesView
                                participants={PARTICIPANTES}
                                subjects={subjects}
                                isTeacher={isTeacher}
                                currentUserEmail={session?.user?.email || ""}
                            />
                        )}

                        {activeTab === "settings" && isTeacher && (
                            <div className="space-y-6 max-w-3xl mx-auto w-full">
                                {/* Información General */}
                                <div className="card bg-base-100 border border-base-300">
                                    <div className="card-body p-4 sm:p-6">
                                        <h2 className="card-title text-lg sm:text-xl mb-4 sm:mb-6">Información General</h2>
                                        <form className="space-y-4 sm:space-y-6">
                                            <div className="form-control flex flex-col items-start">
                                                <label htmlFor="course-title" className="label p-0">
                                                    <span className="label-text font-medium mb-2">Título del Curso</span>
                                                </label>
                                                <input
                                                    id="course-title"
                                                    type="text"
                                                    defaultValue={courseData?.title || ""}
                                                    className="input input-bordered mt-2 w-full"
                                                    placeholder="Ej: Desarrollo Web Avanzado"
                                                />
                                            </div>

                                            <div className="form-control flex flex-col items-start">
                                                <label htmlFor="course-description" className="label p-0">
                                                    <span className="label-text font-medium mb-2">Descripción</span>
                                                </label>
                                                <textarea
                                                    id="course-description"
                                                    className="textarea textarea-bordered h-24 mt-2 w-full"
                                                    defaultValue={courseData?.description || ""}
                                                    placeholder="Describe el contenido y objetivos del curso..."
                                                ></textarea>
                                            </div>

                                            <div className="form-control flex flex-col items-start">
                                                <label htmlFor="course-status" className="label p-0">
                                                    <span className="label-text font-medium mb-2">Estado del Curso</span>
                                                </label>
                                                <select id="course-status" className="select select-bordered mt-2 w-full" defaultValue={courseData?.status || "draft"}>
                                                    <option value="draft">Borrador</option>
                                                    <option value="published">Publicado</option>
                                                    <option value="archived">Archivado</option>
                                                </select>
                                            </div>

                                            <div className="card-actions justify-end">
                                                <button className="btn btn-primary w-full sm:w-auto">Guardar Cambios</button>
                                            </div>
                                        </form>
                                    </div>
                                </div>

                                {/* Configuración de Visualización - Mejorado para móvil */}
                                <div className="card bg-base-100 border border-base-300">
                                    <div className="card-body p-4 sm:p-6">
                                        <h2 className="card-title text-lg sm:text-xl mb-4 sm:mb-6">Configuración de Visualización</h2>
                                        <div className="space-y-6">
                                            <div className="form-control">
                                                <label className="flex flex-col gap-3">
                                                    <div className="flex-1">
                                                        <span className="label-text font-medium block mb-1">Mostrar participantes en la barra horizontal</span>
                                                        <p className="text-sm text-base-content/60">Muestra la lista de participantes en la barra de navegación superior</p>
                                                    </div>
                                                    <input type="checkbox" className="toggle toggle-primary self-start" defaultChecked />
                                                </label>
                                            </div>
                                            <div className="form-control">
                                                <label className="flex flex-col gap-3">
                                                    <div className="flex-1">
                                                        <span className="label-text font-medium block mb-1">Permitir comentarios en el contenido</span>
                                                        <p className="text-sm text-base-content/60">Los estudiantes pueden comentar en las lecciones y tareas</p>
                                                    </div>
                                                    <input type="checkbox" className="toggle toggle-primary self-start" defaultChecked />
                                                </label>
                                            </div>
                                            <div className="form-control">
                                                <label className="flex flex-col gap-3">
                                                    <div className="flex-1">
                                                        <span className="label-text font-medium block mb-1">Notificar nuevas tareas por email</span>
                                                        <p className="text-sm text-base-content/60">Envía notificaciones por correo cuando se crean nuevas tareas</p>
                                                    </div>
                                                    <input type="checkbox" className="toggle toggle-primary self-start" />
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Gestión de Participantes - Mejorado para móvil */}
                                <div className="card bg-base-100 border border-base-300">
                                    <div className="card-body p-4 sm:p-6">
                                        <h2 className="card-title text-lg sm:text-xl mb-4 sm:mb-6">Gestión de Participantes</h2>
                                        <div className="space-y-6">
                                            <div className="form-control">
                                                <label htmlFor="invite-email" className="label">
                                                    <span className="label-text font-medium mb-2">Invitar por email</span>
                                                </label>
                                                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                                                    <input
                                                        id="invite-email"
                                                        type="email"
                                                        placeholder="email@ejemplo.com"
                                                        className="input input-bordered flex-1"
                                                    />
                                                    <button className="btn btn-outline btn-primary w-full sm:w-auto">Invitar</button>
                                                </div>
                                            </div>

                                            <div className="divider">O</div>

                                            <div className="form-control">
                                                <label htmlFor="invite-code" className="label">
                                                    <span className="label-text font-medium mb-2">Código de invitación</span>
                                                </label>
                                                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                                                    <input
                                                        id="invite-code"
                                                        type="text"
                                                        value="COURSE-2024-ABC123"
                                                        readOnly
                                                        className="input input-bordered flex-1 bg-base-200 text-sm sm:text-base"
                                                    />
                                                    <div className="flex gap-2">
                                                        <button className="btn btn-outline flex-1 sm:flex-none">Copiar</button>
                                                        <button className="btn btn-outline btn-secondary flex-1 sm:flex-none">Regenerar</button>
                                                    </div>
                                                </div>
                                                <p className="text-xs sm:text-sm text-base-content/60 mt-3">
                                                    Comparte este código con tus estudiantes para que se unan al curso
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Danger Zone - Mejorado para móvil */}
                                <div className="border border-red-200 dark:border-red-800/50 rounded-lg overflow-hidden">
                                    <div className="bg-red-50/50 dark:bg-red-950/10 px-4 sm:px-6 py-3 border-b border-red-100 dark:border-red-800/30">
                                        <h2 className="font-semibold text-red-600 dark:text-red-400">Danger Zone</h2>
                                    </div>

                                    <div className="divide-y divide-red-100 dark:divide-red-800/20">
                                        {/* Cambiar visibilidad del curso */}
                                        <div className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                            <div className="flex-1">
                                                <p className="font-medium text-base-content text-sm sm:text-base">
                                                    Cambiar visibilidad del curso
                                                </p>
                                                <p className="text-xs sm:text-sm text-base-content/60 mt-0.5">
                                                    Este curso está actualmente {courseData?.status === "active" ? "público" : "en borrador"}.
                                                </p>
                                            </div>
                                            <button className="btn btn-sm btn-outline w-full sm:w-36">
                                                Cambiar visibilidad
                                            </button>
                                        </div>

                                        {/* Transferir propiedad */}
                                        <div className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                            <div className="flex-1">
                                                <p className="font-medium text-base-content text-sm sm:text-base">
                                                    Transferir propiedad
                                                </p>
                                                <p className="text-xs sm:text-sm text-base-content/60 mt-0.5">
                                                    Transferir este curso a otro usuario u organización donde tengas permisos para crear cursos.
                                                </p>
                                            </div>
                                            <button className="btn btn-sm btn-outline w-full sm:w-36">
                                                Transferir
                                            </button>
                                        </div>

                                        {/* Archivar este curso */}
                                        <div className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                            <div className="flex-1">
                                                <p className="font-medium text-base-content text-sm sm:text-base">
                                                    Archivar este curso
                                                </p>
                                                <p className="text-xs sm:text-sm text-base-content/60 mt-0.5">
                                                    Marcar este curso como archivado y de solo lectura.
                                                </p>
                                            </div>
                                            <button className="btn btn-sm btn-outline btn-warning w-full sm:w-36">
                                                Archivar curso
                                            </button>
                                        </div>

                                        {/* Eliminar este curso */}
                                        <div className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                            <div className="flex-1">
                                                <p className="font-medium text-red-600 dark:text-red-400 text-sm sm:text-base">
                                                    Eliminar este curso
                                                </p>
                                                <p className="text-xs sm:text-sm text-base-content/60 mt-0.5">
                                                    Una vez que eliminas un curso, no hay vuelta atrás. Por favor, asegúrate.
                                                </p>
                                            </div>
                                            <button className="btn btn-sm btn-error w-full sm:w-36">
                                                Eliminar curso
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* FAB Button - Solo visible para profesores */}
            {isTeacher && (
                <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
                    <CourseFAB
                        onAddTask={handleAddTask}
                        courseId={String(courseData?._id)}
                        defaultSubjectId={subjects[0] ? String(subjects[0]._id) : undefined}
                        subjects={subjects}
                    />
                </div>
            )}
        </div>
    );
}