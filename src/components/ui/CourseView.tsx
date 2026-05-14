"use client";

import { useState } from "react";
import {
    BookOpen,
    Users,
    GraduationCap
} from "lucide-react";
import CourseSidebar from "./CourseSidebar";

interface CourseViewProps {
    courseData: any;
    isTeacher: boolean;
}

export default function CourseView({ courseData, isTeacher }: CourseViewProps) {
    const [activeTab, setActiveTab] = useState<"content" | "participants" | "grades">("content");

    return (
        <div className="flex flex-col lg:flex-row">
            <CourseSidebar isTeacher={isTeacher} />

            <main className="flex-1 p-6 lg:p-8">
                <div className="max-w-8xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold mb-2">{courseData?.nombre || "Cargando curso..."}</h1>
                        <p className="text-base-content/70">{courseData?.descripcion}</p>
                    </div>

                    {/* Navegación por pestañas */}
                    <div className="flex border-b border-base-300 mb-6 overflow-x-auto">
                        <button
                            onClick={() => setActiveTab("content")}
                            className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors ${activeTab === "content"
                                    ? "border-primary text-primary font-semibold"
                                    : "border-transparent text-base-content/60 hover:text-base-content"
                                }`}
                        >
                            <BookOpen size={18} />
                            Curso
                        </button>
                        <button
                            onClick={() => setActiveTab("participants")}
                            className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors ${activeTab === "participants"
                                    ? "border-primary text-primary font-semibold"
                                    : "border-transparent text-base-content/60 hover:text-base-content"
                                }`}
                        >
                            <Users size={18} />
                            Participantes
                        </button>
                        <button
                            onClick={() => setActiveTab("grades")}
                            className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors ${activeTab === "grades"
                                    ? "border-primary text-primary font-semibold"
                                    : "border-transparent text-base-content/60 hover:text-base-content"
                                }`}
                        >
                            <GraduationCap size={18} />
                            Calificaciones
                        </button>
                    </div>

                    {/* Vistas Renderizadas */}
                    <div className="space-y-6">
                        {activeTab === "content" && (
                            <div className="card bg-base-100 border border-base-300 p-6 text-center">
                                <p className="text-base-content/60">Lista de tareas y examenes no disponible aun.</p>
                            </div>
                        )}

                        {activeTab === "participants" && (
                            <div className="card bg-base-100 border border-base-300 p-6 text-center">
                                <p className="text-base-content/60">Lista de participantes no disponible aun.</p>
                            </div>
                        )}

                        {activeTab === "grades" && (
                            <div className="card bg-base-100 border border-base-300 p-6 text-center">
                                <p className="text-base-content/60">Lista de calificaciones no disponble aun.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
