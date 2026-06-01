/* Archivo: src\components\ui\grades\TeacherGradesView.tsx
    Descripción: Vista para profesorado: revisar y editar calificaciones y feedback de estudiantes. */

"use client";
// Vista de profesor: listar estudiantes y abrir grading individual por alumno
import React from "react";
import { GraduationCap } from "lucide-react";
import IndividualStudentGradingView from "./IndividualStudentGradingView";
import { useTeacherGrades } from "@/hooks/useTeacherGrades";

interface Participant {
    id: string;
    nombre: string;
    apellidos: string;
    email: string;
    rol: string;
    avatar: string;
}

interface Task {
    _id?: string;
    title: string;
}

interface Subject {
    _id: string;
    title: string;
    tasks?: Task[];
}

interface TeacherGradesViewProps {
    participants: Participant[];
    subjects: Subject[];
    courseId: string;
    initialSubmissions?: any[];
}

export default function TeacherGradesView({ participants, subjects, courseId, initialSubmissions = [] }: TeacherGradesViewProps) {
    const { selectedStudent, setSelectedStudent, submissions, loading, visibleStudents, loadSubmissions, getStudentAverage } = useTeacherGrades(courseId, participants, initialSubmissions);

    if (selectedStudent) {
        return (
            <IndividualStudentGradingView 
                student={selectedStudent} 
                subjects={subjects} 
                courseId={courseId}
                initialSubmissions={submissions.filter(s => String(s.studentId) === String(selectedStudent.id))}
                onBack={() => {
                    setSelectedStudent(null);
                    loadSubmissions(); // Recargar datos al volver
                }}
                // [SSR] Callback para refrescar datos después de guardar
                onGradesSaved={async () => {
                    console.log('[TeacherGradesView] Refrescando submissions después de guardar...');
                    await loadSubmissions();
                }}
            />
        );
    }

    return (
        <div className="space-y-6">
            <div className="card bg-base-100 border border-base-300 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="table w-full">
                        {/* head */}
                        <thead className="bg-base-200/50">
                            <tr>
                                <th className="bg-transparent pl-6">Estudiante</th>
                                <th className="text-center bg-transparent">Media</th>
                                <th className="text-center bg-transparent">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={3} className="text-center py-12">
                                        <span className="loading loading-spinner loading-md"></span>
                                        <p className="mt-2 text-sm text-base-content/50">Cargando calificaciones...</p>
                                    </td>
                                </tr>
                            ) : visibleStudents.length > 0 ? (
                                visibleStudents.map((student) => {
                                    const average = getStudentAverage(student.id);

                                    return (
                                        <tr key={student.id} className="hover:bg-base-200/30 transition-colors border-b border-base-300/10">
                                            <td className="pl-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="avatar">
                                                        <div className="rounded-full w-10 h-10">
                                                            <img src={student.avatar} alt={student.nombre} />
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold">{student.nombre} {student.apellidos}</span>
                                                        <span className="text-xs opacity-50 lowercase">{student.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="text-center">
                                                {average !== "—" ? (
                                                    <div className={`font-mono font-bold text-lg ${parseFloat(average) >= 5 ? 'text-primary' : 'text-error'}`}>
                                                        {average}
                                                        <span className="text-xs opacity-50 ml-0.5">/10</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-base-content/50">—</span>
                                                )}
                                            </td>
                                            <td className="text-center">
                                                <button 
                                                    onClick={() => setSelectedStudent(student)}
                                                    className="btn btn-ghost btn-sm text-base-content/50 hover:text-base-content transition-colors font-bold"
                                                >
                                                    Revisar tareas
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={3} className="text-center py-12">
                                        <div className="flex flex-col items-center gap-3 text-base-content/40">
                                            <GraduationCap size={48} className="opacity-20" />
                                            <p className="font-medium">No hay estudiantes matriculados en este curso</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
