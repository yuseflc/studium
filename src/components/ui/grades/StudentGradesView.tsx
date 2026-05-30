"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

// [SSR] Interfaces para entregas reales
interface Submission {
    _id: string;
    taskId: string;
    studentId: string;
    grade?: number;
    feedback?: string;
    submissionStatus: string;
    gradedAt?: string;
}

interface Task {
    _id?: string;
    id?: string;
    title: string;
}

interface Subject {
    _id: string;
    title: string;
    tasks?: Task[];
}

interface StudentGradesViewProps {
    subjects: Subject[];
    submissions: Submission[]; // Entregas reales del estudiante
}

// [SSR] Helper para obtener nota real de una tarea
function getTaskGrade(taskId: string | undefined, submissions: Submission[]) {
    if (!taskId) return null;
    const taskIdStr = String(taskId);
    const submission = submissions.find((s) => s.taskId === taskIdStr);
    return submission?.grade !== undefined ? submission.grade : null;
}

// [SSR] Helper para obtener feedback real de una tarea
function getTaskFeedback(taskId: string | undefined, submissions: Submission[]) {
    if (!taskId) return null;
    const taskIdStr = String(taskId);
    const submission = submissions.find((s) => s.taskId === taskIdStr);
    return submission?.feedback || null;
}

export default function StudentGradesView({
    subjects = [],
    submissions = []
}: StudentGradesViewProps) {
    const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>(
        Object.fromEntries((subjects || []).map(s => [s._id, true]))
    );

    // [Mini Modal] Estado para mostrar comentario del profesor
    const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
    const [selectedFeedback, setSelectedFeedback] = useState<{ title: string; feedback: string } | null>(null);

    const toggleSubject = (id: string) => {
        setExpandedSubjects(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // [Mini Modal] Abrir modal de comentario
    const handleShowFeedback = (taskTitle: string, feedback: string) => {
        setSelectedFeedback({ title: taskTitle, feedback });
        setFeedbackModalOpen(true);
    };

    return (
        <div className="space-y-4">
            <div className="card bg-base-100 border border-base-300 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="table w-full border-collapse">
                        <thead>
                            <tr className="bg-base-200/50">
                                <th className="w-2/3">Actividad / Tema</th>
                                <th className="text-center w-32">Estado</th>
                                <th className="text-center w-24">Nota</th>
                                <th className="text-center w-32">Feedback</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subjects.map((subject) => {
                                const subjectTasks = subject.tasks || [];
                                if (subjectTasks.length === 0) return null;
                                const isExpanded = expandedSubjects[subject._id];

                                return (
                                    <React.Fragment key={subject._id}>
                                        <tr 
                                            className="bg-base-200/50 hover:bg-base-200/70 transition-colors cursor-pointer"
                                            onClick={() => toggleSubject(subject._id)}
                                        >
                                            <td colSpan={4} className="p-0 border-b border-base-300/30">
                                                <div className="flex items-center gap-3 p-4 font-extrabold text-sm uppercase tracking-wide text-base-content/80">
                                                    {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                                    {subject.title}
                                                </div>
                                            </td>
                                        </tr>
                                        {isExpanded && subjectTasks.map((task) => {
                                            // [SSR] Obtener datos reales de la entrega
                                            const taskId = task._id || task.id;
                                            const grade = getTaskGrade(taskId, submissions);
                                            const feedback = getTaskFeedback(taskId, submissions);
                                            
                                            // Estado: si el profesor ha puesto nota, calificado; si no, pendiente
                                            const isGraded = grade !== null;

                                            return (
                                                <tr
                                                    key={taskId}
                                                    className="hover:bg-base-200/20 transition-colors border-b border-base-300/10"
                                                >
                                                    <td className="pl-12 font-medium text-base-content/70">
                                                        {task.title}
                                                    </td>
                                                    <td className="text-center">
                                                        {isGraded ? (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-success/10 text-success border border-success/20 shadow-sm">
                                                                Calificado
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-base-200 text-base-content/50 border border-base-300 shadow-sm">
                                                                Pendiente
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="text-center">
                                                        {isGraded ? (
                                                            <div className="flex flex-col items-center">
                                                                <span
                                                                    className={`font-mono font-bold text-lg ${
                                                                        grade >= 5 ? 'text-success' : 'text-error'
                                                                    }`}
                                                                >
                                                                    {Number(grade).toFixed(1)}
                                                                    <span className="text-xs opacity-50 ml-0.5">
                                                                        /10
                                                                    </span>
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-base-content/30">—</span>
                                                        )}
                                                    </td>
                                                    <td className="text-center">
                                                        {feedback ? (
                                                            <button
                                                                onClick={() => handleShowFeedback(task.title, feedback)}
                                                                className="btn btn-ghost btn-sm text-primary hover:text-primary-focus transition-colors font-bold"
                                                            >
                                                                Leer comentario
                                                            </button>
                                                        ) : (
                                                            <span className="text-base-content/30 text-sm">—</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* [Mini Modal] Mostrar comentario del profesor */}
            {feedbackModalOpen && selectedFeedback && (
                <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => {
                    setFeedbackModalOpen(false);
                    setSelectedFeedback(null);
                }}>
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/50" />
                    
                    {/* Modal Content */}
                    <div 
                        className="relative bg-base-100 rounded-lg shadow-lg p-6 max-w-md w-full mx-4 z-50"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="font-bold text-lg text-base-content mb-3">
                            Comentario: {selectedFeedback.title}
                        </h3>
                        <p className="text-sm text-base-content/70 mb-6 leading-relaxed">
                            {selectedFeedback.feedback}
                        </p>
                        <div className="flex justify-end gap-2">
                            <button
                                className="btn btn-sm btn-primary"
                                onClick={() => {
                                    setFeedbackModalOpen(false);
                                    setSelectedFeedback(null);
                                }}
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}