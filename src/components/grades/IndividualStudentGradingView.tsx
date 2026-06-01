/* Archivo: src\components\ui\grades\IndividualStudentGradingView.tsx
    Descripción: Vista para que el profesor califique a un estudiante individualmente. */

"use client";
// Interfaz de calificación individual: editar notas y feedback de un estudiante
import React from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, Save, ArrowLeft, Loader2, Check, MessageSquare, ExternalLink } from "lucide-react";
import { FeedbackModal } from "@/components/modals/FeedbackModal";
import { useStudentGrading } from "@/hooks/useStudentGrading";
// Tipos mínimos locales para evitar problemas de resolución de módulos
type Task = { _id?: string; id?: string; title: string };
type Subject = { _id: string; title: string; tasks?: Task[] };
type Submission = { _id?: string; taskId: string; grade?: number | null; feedback?: string | null };

interface IndividualStudentGradingViewProps {
    student: {
        id: string;
        nombre: string;
        apellidos: string;
        avatar: string;
    };
    subjects: Subject[];
    courseId: string;
    initialSubmissions: Submission[];
    onBack: () => void;
    onGradesSaved?: () => Promise<void>; // [SSR] Callback para refrescar datos al guardar
}

export default function IndividualStudentGradingView({
    student,
    subjects = [],
    courseId,
    initialSubmissions,
    onBack,
    onGradesSaved
}: IndividualStudentGradingViewProps) {
    const {
        expandedSubjects,
        toggleSubject,
        gradesState,
        handleFieldChange,
        isSaving,
        saveStatus,
        feedbackModalOpen,
        setFeedbackModalOpen,
        selectedTaskForFeedback,
        feedbackModalRef,
        handleOpenFeedbackModal,
        handleSaveFeedback,
        handleSaveAll,
    } = useStudentGrading(student, subjects, initialSubmissions, onGradesSaved);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center justify-between bg-base-100 p-4 rounded-xl border border-base-300 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="btn btn-ghost btn-sm gap-2">
                        <ArrowLeft size={18} />
                        Volver
                    </button>
                    <div className="divider divider-horizontal m-0"></div>
                    <div className="flex items-center gap-3">
                        <div className="avatar">
                            <div className="rounded-full w-10 h-10">
                                <img src={student.avatar} alt={student.nombre} />
                            </div>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">{student.nombre} {student.apellidos}</h3>
                            <p className="text-xs opacity-50">Calificando entregas individuales</p>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    {saveStatus === "success" && (
                        <span className="text-sm text-success flex items-center gap-1">
                            <Check size={16} /> Guardado
                        </span>
                    )}
                    {saveStatus === "error" && (
                        <span className="text-sm text-error">Error al guardar</span>
                    )}
                    <button 
                        onClick={handleSaveAll} 
                        disabled={isSaving}
                        className="btn btn-primary btn-sm gap-2"
                    >
                        {isSaving ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <Save size={16} />
                        )}
                        Guardar Cambios
                    </button>
                </div>
            </div>

            <div className="card bg-base-100 border border-base-300 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="table w-full border-collapse">
                        <thead>
                            <tr className="bg-base-200/50">
                                <th className="w-2/5">Actividad / Tema</th>
                                <th className="text-center w-24">Estado</th>
                                <th className="text-center w-28">Nota</th>
                                <th className="text-center w-2/5">Calificar / Feedback</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subjects.map((subject, subjectIndex) => {
                                const subjectTasks = subject.tasks || [];
                                if (subjectTasks.length === 0) return null;
                                const isExpanded = expandedSubjects[subject._id];

                                return (
                                    <React.Fragment key={subject._id}>
                                        <tr
                                            className="bg-base-200/50"
                                            onClick={() => toggleSubject(subject._id)}
                                        >
                                            <td colSpan={4} className="p-0 border-b border-base-300/30">
                                                <div className="flex items-center gap-3 p-4 font-extrabold text-sm uppercase tracking-wide text-base-content/80">
                                                    {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                                    {subject.title}
                                                </div>
                                            </td>
                                        </tr>
                                        {isExpanded && subjectTasks.map((task: Task, taskIndex: number) => {
                                            const stateKey = `${subjectIndex}-${taskIndex}`;
                                            const state = gradesState[stateKey] || { grade: "", feedback: "", taskId: "" };
                                            const gradeVal = parseFloat(state.grade);
                                            
                                            // Saber si esta entregado o no (asumir entregado si hay nota o feedback)
                                            const hasSubmission = state.grade !== "" || state.feedback !== "";

                                            return (
                                                <tr key={stateKey} className="hover:bg-base-200/30 transition-colors border-b border-base-300/10 group">
                                                    <td className="pl-12">
                                                        <Link 
                                                            href={`/mycourses/${courseId}/tasks/${state.taskId}`}
                                                            className="inline-flex items-center gap-2 font-medium text-base-content/70 hover:text-yellow-400 transition-colors py-1.5 px-3 -ml-3 rounded-lg"
                                                        >
                                                            {task.title}
                                                            <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        </Link>
                                                    </td>
                                                    <td className="text-center">
                                                        {hasSubmission ? (
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
                                                        <div className="flex items-center justify-center gap-1">
                                                            <span className={`font-mono font-bold text-lg ${state.grade === '' ? 'text-base-content/30' : !isNaN(gradeVal) && gradeVal >= 5 ? 'text-success' : 'text-error'}`}>
                                                                {state.grade === '' ? '—' : state.grade}
                                                            </span>
                                                            {state.grade !== '' && <span className="text-xs opacity-40">/10</span>}
                                                        </div>
                                                    </td>
                                                    <td className="text-center">
                                                        <button
                                                            onClick={() => handleOpenFeedbackModal(stateKey, task.title)}
                                                            className="btn btn-sm btn-outline btn-primary gap-2"
                                                        >
                                                            <MessageSquare size={16} />
                                                            {state.grade || state.feedback ? "Editar" : "Calificar"}
                                                        </button>
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

            {/* Modal de Feedback */}
            {selectedTaskForFeedback && (
                <FeedbackModal
                    dialogRef={feedbackModalRef}
                    isOpen={feedbackModalOpen}
                    onClose={() => {
                        setFeedbackModalOpen(false);
                        setSelectedTaskForFeedback(null);
                    }}
                    taskTitle={selectedTaskForFeedback.title}
                    studentName={`${student.nombre} ${student.apellidos}`}
                    initialGrade={gradesState[selectedTaskForFeedback.stateKey]?.grade || ""}
                    initialFeedback={gradesState[selectedTaskForFeedback.stateKey]?.feedback || ""}
                    onSubmit={handleSaveFeedback}
                />
            )}
        </div>
    );
}