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
    const [newTasks, setNewTasks] = useState<any[]>([]);
    const [deletedItems, setDeletedItems] = useState<string[]>([]);

    const subjects = courseData?.subjects || [];

    const handleAddTask = (task: any) => {
        setNewTasks((prev) => [...prev, task]);
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

            <main className="flex-1 p-6 lg:p-8">
                <div className="max-w-8xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold mb-2">{courseData?.title || "Cargando curso..."}  {courseData?.status === "draft" && <span className="badge bg-secondary text-base-content">BORRADOR</span>}</h1>
                        {(courseData?.description ? <p className="text-base-content/70">{courseData.description}</p> : <p className="text-base-content/60 italic">Sin descripción disponible.</p>)}
                    </div>

                    <div className="flex border-b border-base-300 mb-6 overflow-x-auto relative z-10">
                        <button
                            type="button"
                            onClick={() => setActiveTab("content")}
                            className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors shrink-0 ${activeTab === "content"
                                ? "border-primary text-primary font-semibold"
                                : "border-transparent text-base-content/60 hover:text-base-content"
                                }`}
                        >
                            <BookOpen size={18} />
                            Curso
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("participants")}
                            className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors shrink-0 ${activeTab === "participants"
                                ? "border-primary text-primary font-semibold"
                                : "border-transparent text-base-content/60 hover:text-base-content"
                                }`}
                        >
                            <Users size={18} />
                            Participantes
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("grades")}
                            className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors shrink-0 ${activeTab === "grades"
                                ? "border-primary text-primary font-semibold"
                                : "border-transparent text-base-content/60 hover:text-base-content"
                                }`}
                        >
                            <GraduationCap size={18} />
                            Calificaciones
                        </button>
                        {isTeacher && (
                            <button
                                type="button"
                                onClick={() => setActiveTab("settings")}
                                className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors shrink-0 ${activeTab === "settings"
                                    ? "border-primary text-primary font-semibold"
                                    : "border-transparent text-base-content/60 hover:text-base-content"
                                    }`}
                            >
                                <Settings size={18} />
                                Ajustes
                            </button>
                        )}
                    </div>

                    {/* Vistas Renderizadas */}
                    <div className="space-y-6">
                        {activeTab === "content" && (
                            <CourseContent 
                                subjects={subjects} 
                                newTasks={newTasks} 
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
                                    <div className="card-body">
                                        <h2 className="card-title text-xl mb-6">Información General</h2>
                                        <form className="space-y-6">
                                            <div className="form-control flex flex-col items-start">
                                                <label htmlFor="course-title" className="label p-0">
                                                    <span className="label-text font-medium mb-2">Título del Curso</span>
                                                </label>
                                                <input
                                                    id="course-title"
                                                    type="text"
                                                    defaultValue={courseData?.title || ""}
                                                    className="input input-bordered mt-2 w-full mb-5"
                                                    placeholder="Ej: Desarrollo Web Avanzado"
                                                />
                                            </div>

                                            <div className="form-control flex flex-col items-start">
                                                <label htmlFor="course-description" className="label p-0">
                                                    <span className="label-text font-medium mb-2">Descripción</span>
                                                </label>
                                                <textarea
                                                    id="course-description"
                                                    className="textarea textarea-bordered h-24 mt-2 w-full mb-5"
                                                    defaultValue={courseData?.description || ""}
                                                    placeholder="Describe el contenido y objetivos del curso..."
                                                ></textarea>
                                            </div>

                                            <div className="form-control flex flex-col items-start">
                                                <label htmlFor="course-status" className="label p-0">
                                                    <span className="label-text font-medium mb-2">Estado del Curso</span>
                                                </label>
                                                <select id="course-status" className="select select-bordered mt-2 w-full mb-5" defaultValue={courseData?.status || "draft"}>
                                                    <option value="draft">Borrador</option>
                                                    <option value="published">Publicado</option>
                                                    <option value="archived">Archivado</option>
                                                </select>
                                            </div>

                                            <div className="card-actions justify-end">
                                                <button className="btn btn-primary">Guardar Cambios</button>
                                            </div>
                                        </form>
                                    </div>
                                </div>

                                {/* Configuración de Visualización */}
                                <div className="card bg-base-100 border border-base-300">
                                    <div className="card-body">
                                        <h2 className="card-title text-xl mb-6">Configuración de Visualización</h2>
                                        <div className="space-y-4">
                                            <div className="form-control">
                                                <label className="cursor-pointer label">
                                                    <div>
                                                        <span className="label-text font-medium">Mostrar participantes en la barra horizontal</span>
                                                        <p className="text-sm text-base-content/60 mt-1 mb-4">Muestra la lista de participantes en la barra de navegación superior</p>
                                                    </div>
                                                    <input type="checkbox" className="toggle toggle-primary ml-55" defaultChecked />
                                                </label>
                                            </div>
                                            <div className="form-control">
                                                <label className="cursor-pointer label">
                                                    <div>
                                                        <span className="label-text font-medium">Permitir comentarios en el contenido</span>
                                                        <p className="text-sm text-base-content/60 mt-1 mb-4">Los estudiantes pueden comentar en las lecciones y tareas</p>
                                                    </div>
                                                    <input type="checkbox" className="toggle toggle-primary ml-67" defaultChecked />
                                                </label>
                                            </div>
                                            <div className="form-control">
                                                <label className="cursor-pointer label">
                                                    <div>
                                                        <span className="label-text font-medium">Notificar nuevas tareas por email</span>
                                                        <p className="text-sm text-base-content/60 mt-1 mb-4">Envía notificaciones por correo cuando se crean nuevas tareas</p>
                                                    </div>
                                                    <input type="checkbox" className="toggle toggle-primary ml-62" />
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Gestión de Participantes */}
                                <div className="card bg-base-100 border border-base-300">
                                    <div className="card-body">
                                        <h2 className="card-title text-xl mb-6">Gestión de Participantes</h2>
                                        <div className="space-y-6">
                                            <div className="form-control">
                                                <label htmlFor="invite-email" className="label">
                                                    <span className="label-text font-medium mb-2">Invitar por email</span>
                                                </label>
                                                <div className="flex gap-2 mt-2">
                                                    <input
                                                        id="invite-email"
                                                        type="email"
                                                        placeholder="email@ejemplo.com"
                                                        className="input input-bordered flex-1"
                                                    />
                                                    <button className="btn btn-outline btn-primary">Invitar</button>
                                                </div>
                                            </div>

                                            <div className="divider">O</div>

                                            <div className="form-control">
                                                <label htmlFor="invite-code" className="label">
                                                    <span className="label-text font-medium mb-2">Código de invitación</span>
                                                </label>
                                                <div className="flex gap-2 mt-2">
                                                    <input
                                                        id="invite-code"
                                                        type="text"
                                                        value="COURSE-2024-ABC123"
                                                        readOnly
                                                        className="input input-bordered flex-1 bg-base-200"
                                                    />
                                                    <button className="btn btn-outline">Copiar</button>
                                                    <button className="btn btn-outline btn-secondary">Regenerar</button>
                                                </div>
                                                <label className="label">
                                                    <span className="label-text-alt text-base-content/60 mt-2">
                                                        Comparte este código con tus estudiantes para que se unan al curso
                                                    </span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Peligro - Zona Roja */}
                                <div className="card bg-base-100 border border-error/30">
                                    <div className="card-body">
                                        <h2 className="card-title text-error text-xl mb-6">Zona de Peligro</h2>
                                        <div className="space-y-4">
                                            <div className="alert alert-warning py-2 px-3 items-center gap-3 w-full max-w-xl mx-auto mb-8">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                </svg>
                                                
                                            </div>

                                            <div className="flex gap-3 flex-wrap">
                                                <button className="btn btn-outline btn-warning ml-50">
                                                    Archivar Curso
                                                </button>
                                                <button className="btn btn-outline btn-error ml-4">
                                                    Eliminar Curso
                                                </button>
                                            </div>
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
                <CourseFAB 
                    onAddTask={handleAddTask} 
                    courseId={String(courseData?._id)} 
                    defaultSubjectId={subjects[0] ? String(subjects[0]._id) : undefined}
                />
            )}
        </div>
    );
}