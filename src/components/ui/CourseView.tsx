"use client";

import { useState } from "react";
import {
    BookOpen,
    Users,
    GraduationCap,
    Settings
} from "lucide-react";
import CourseSidebar from "./Navbars/CourseSidebar";
import CourseContent from "./CourseContent";
import CourseParticipants from "./CourseParticipants";
import { PARTICIPANTES } from "@/seed/data";
import { ICourse } from "@/models/Course";

interface CourseViewProps {
    courseData: ICourse;
    isTeacher: boolean;
}

export default function CourseView({ courseData , isTeacher }: CourseViewProps) {
    const [activeTab, setActiveTab] = useState<"content" | "participants" | "grades" | "settings">("content");

    return (
        <div className="flex flex-col lg:flex-row">
            <CourseSidebar isTeacher={isTeacher} subjects={courseData.subjects || []} />

            <main className="flex-1 p-6 lg:p-8">
                <div className="max-w-8xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold mb-2">{courseData.title || "Cargando curso..."}  {courseData.status == "draft" && <span className="badge bg-secondary text-base-content">BORRADOR</span>}</h1>
                        {(courseData.description ? <p className="text-base-content/70">{courseData.description}</p> : <p className="text-base-content/60 italic">Sin descripción disponible.</p>)}
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
                            <CourseContent subjects={courseData?.subjects || []} />
                        )}

                        {activeTab === "participants" && (
                            <CourseParticipants participants={PARTICIPANTES} />
                        )}

                        {activeTab === "grades" && (
                            <div className="card bg-base-100 border border-base-300 p-6 text-center">
                                <p className="text-base-content/60">Lista de calificaciones no disponble aun.</p>
                            </div>
                        )}

                        {activeTab === "settings" && isTeacher && (
                            <div className="card bg-base-100 border border-base-300 p-6">
                                <h2 className="text-xl font-bold mb-4">Ajustes del Curso</h2>
                                <p className="text-base-content/60">Configuración del curso por implementar.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
