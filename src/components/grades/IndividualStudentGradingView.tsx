/* Archivo: src\components\ui\grades\IndividualStudentGradingView.tsx
    Descripción: Vista para que el profesor califique a un estudiante individualmente. */

"use client";
// Interfaz de calificación individual: editar notas y feedback de un estudiante
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, Save, ArrowLeft, Loader2, Check, MessageSquare, ExternalLink } from "lucide-react";
import { saveStudentTaskGrade } from "@/app/actions/participantActions";
import { FeedbackModal } from "@/components/modals/FeedbackModal";
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
    const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>(
        Object.fromEntries((subjects || []).map(s => [s._id, true]))
    );
    
    // Estado local para almacenar calificaciones y feedback editados (incluye taskId)
    const [gradesState, setGradesState] = useState<Record<string, { grade: string; feedback: string; taskId: string }>>({});
    const [originalGrades, setOriginalGrades] = useState<Record<string, { grade: string; feedback: string; taskId: string }>>({});
    
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
    
    // Estado para el modal de feedback
    const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
    const [selectedTaskForFeedback, setSelectedTaskForFeedback] = useState<{ stateKey: string; title: string } | null>(null);
    const feedbackModalRef = useRef<HTMLDialogElement>(null);

    // Inicializar el estado local con las entregas iniciales de la base de datos
    useEffect(() => {
        const state: Record<string, { grade: string; feedback: string; taskId: string }> = {};
        
        // Crear un mapa de taskId normalizado -> (subjectIndex, taskIndex) para búsquedas rápidas
        const taskIdMap = new Map<string, string>();
        
        // Asegurar que todas las tareas en los temas tengan un objeto en el estado
        subjects.forEach((subj, subjIndex) => {
            (subj.tasks || []).forEach((task: Task, taskIndex: number) => {
                const uniqueKey = `${subjIndex}-${taskIndex}`;
                // Normalizar: usar _id si existe, sino id, asegurar que es string
                const taskId = String(task._id || "").trim();
                
                if (taskId) {
                    state[uniqueKey] = { grade: "", feedback: "", taskId };
                    taskIdMap.set(taskId, uniqueKey);
                    console.debug(`[Grade Init] Task ${taskIndex} in Subject ${subjIndex}: taskId=${taskId}, stateKey=${uniqueKey}`);
                } else {
                    console.warn(`[Grade Init] Task ${taskIndex} in Subject ${subjIndex} has no ID`, task);
                }
            });
        });

        // Mapear entregas existentes por taskId
        initialSubmissions.forEach((sub: any) => {
            const subTaskId = String(sub.taskId || "").trim();
            
            if (!subTaskId) {
                console.warn(`[Grade Init] Submission has no taskId`, sub);
                return;
            }
            
            const foundKey = taskIdMap.get(subTaskId);
            
            if (foundKey && state[foundKey]) {
                // Actualizar grade y feedback, preservando taskId
                state[foundKey] = {
                    ...state[foundKey],
                    grade: sub.grade !== undefined && sub.grade !== null ? String(sub.grade) : "",
                    feedback: sub.feedback ? String(sub.feedback).trim() : ""
                };
                console.debug(`[Grade Init] Loaded submission for taskId=${subTaskId}: grade=${state[foundKey].grade}, feedback=${state[foundKey].feedback.substring(0, 30)}...`);
            } else {
                console.warn(`[Grade Init] Submission taskId=${subTaskId} not found in subjects`, { foundKey, inState: !!foundKey });
            }
        });

        setGradesState(state);
        setOriginalGrades(JSON.parse(JSON.stringify(state)));
        console.info(`[Grade Init] Initialized ${Object.keys(state).length} tasks, ${initialSubmissions.length} submissions loaded`);
    }, [initialSubmissions, subjects]);

    const toggleSubject = (id: string) => {
        setExpandedSubjects(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleFieldChange = (stateKey: string, field: "grade" | "feedback", value: string) => {
        if (field === "grade") {
            // Permitir vacío
            if (value === "") {
                setGradesState(prev => ({
                    ...prev,
                    [stateKey]: { ...(prev[stateKey] || { grade: "", feedback: "", taskId: "" }), grade: "" }
                }));
                return;
            }
            // Validar que sea un formato numérico con hasta 2 decimales
            if (!/^\d*\.?\d{0,2}$/.test(value)) return;
            
            const num = parseFloat(value);
            if (!isNaN(num) && (num < 0 || num > 10)) return;
        }

        setGradesState(prev => {
            const currentTask = prev[stateKey] || { grade: "", feedback: "", taskId: "" };
            return {
                ...prev,
                [stateKey]: {
                    ...currentTask,
                    [field]: value
                }
            };
        });
    };

    // [FIX] Abrir el modal de feedback - usar isOpen del Modal, sin showModal()
    const handleOpenFeedbackModal = (stateKey: string, taskTitle: string) => {
        setSelectedTaskForFeedback({ stateKey, title: taskTitle });
        setFeedbackModalOpen(true);
    };

    // Guardar nota y feedback desde el modal
    const handleSaveFeedback = async (newGrade: string, newFeedback: string): Promise<boolean> => {
        if (!selectedTaskForFeedback) return false;

        try {
            if (newGrade !== '') {
                if (!/^\d*\.?\d{0,2}$/.test(newGrade)) return false;
                const num = parseFloat(newGrade);
                if (isNaN(num) || num < 0 || num > 10) return false;
            }

            setGradesState(prev => {
                const currentTask = prev[selectedTaskForFeedback.stateKey] || { grade: "", feedback: "", taskId: "" };
                return {
                    ...prev,
                    [selectedTaskForFeedback.stateKey]: {
                        ...currentTask,
                        grade: newGrade,
                        feedback: newFeedback
                    }
                };
            });

            setFeedbackModalOpen(false);
            setSelectedTaskForFeedback(null);

            return true;
        } catch (error) {
            console.error("Error saving feedback:", error);
            return false;
        }
    };

    // Guardar todos los cambios modificados
    const handleSaveAll = async () => {
        setIsSaving(true);
        setSaveStatus("saving");
        try {
            // Identificar tareas que han cambiado
            const tasksToSave = Object.keys(gradesState)
                .filter(stateKey => {
                    const current = gradesState[stateKey];
                    const original = originalGrades[stateKey] || { grade: "", feedback: "", taskId: "" };
                    return current.grade !== original.grade || current.feedback !== original.feedback;
                });

            console.log(`[Save] Iniciando guardado de ${tasksToSave.length} tareas`);

            // Crear promesas para cada tarea a guardar
            const promises = tasksToSave.map(async (stateKey) => {
                const current = gradesState[stateKey];
                
                // Validar que taskId existe y es válido
                const taskId = String((current as any).taskId || "").trim();
                if (!taskId) {
                    console.error(`[Save] taskId vacío para stateKey ${stateKey}`, current);
                    return { success: false, message: 'Error: taskId no encontrado' };
                }
                
                // Convertir grade a número, usar 0 si está vacío
                let gradeVal = 0;
                if (current.grade) {
                    gradeVal = parseFloat(current.grade);
                    if (isNaN(gradeVal)) {
                        console.error(`[Save] Grade inválido para taskId=${taskId}: ${current.grade}`);
                        return { success: false, message: 'Calificación inválida' };
                    }
                }
                
                // Feedback puede ser vacío
                const feedback = (current.feedback || "").trim();
                
                console.log(`[Save] Guardando: taskId=${taskId}, studentId=${student.id}, grade=${gradeVal}, feedback_len=${feedback.length}`);
                
                const result = await saveStudentTaskGrade(taskId, student.id, gradeVal, feedback);
                
                if (!result.success) {
                    console.error(`[Save] Error guardando taskId=${taskId}: ${result.message}`);
                }
                
                return result;
            });

            if (promises.length === 0) {
                console.log(`[Save] No hay cambios para guardar`);
                setSaveStatus("idle");
                setIsSaving(false);
                return;
            }

            // Esperar a que todas las promesas se resuelvan
            const results = await Promise.all(promises);
            const hasError = results.some(r => !r.success);
            const successCount = results.filter(r => r.success).length;

            console.log(`[Save] Resultado: ${successCount}/${results.length} guardadas correctamente`);

            if (hasError) {
                setSaveStatus("error");
                console.error("[Save] Errores encontrados:", results);
            } else {
                // Actualizar originalGrades para reflejar lo guardado
                setOriginalGrades(JSON.parse(JSON.stringify(gradesState)));
                setSaveStatus("success");
                console.log(`[Save] Todas las calificaciones se guardaron correctamente`);
                
                // [SSR] Refrescar datos en el componente padre después de guardar
                if (onGradesSaved) {
                    console.log('[Save] Llamando a onGradesSaved para refrescar datos...');
                    await onGradesSaved();
                }
                
                setTimeout(() => setSaveStatus("idle"), 3000);
            }
        } catch (error) {
            console.error("[Save] Error inesperado:", error);
            setSaveStatus("error");
        } finally {
            setIsSaving(false);
        }
    };

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