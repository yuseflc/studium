"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, Save, ArrowLeft, Loader2, Check } from "lucide-react";
import { saveStudentTaskGrade } from "@/app/actions/participantActions";

interface Task {
    id: string;
    title: string;
}

interface Subject {
    _id: string;
    title: string;
    tasks?: Task[];
}

interface IndividualStudentGradingViewProps {
    student: {
        id: string;
        nombre: string;
        apellidos: string;
        avatar: string;
    };
    subjects: Subject[];
    courseId: string;
    initialSubmissions: any[];
    onBack: () => void;
}

export default function IndividualStudentGradingView({ 
    student, 
    subjects = [], 
    courseId,
    initialSubmissions,
    onBack 
}: IndividualStudentGradingViewProps) {
    const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>(
        Object.fromEntries((subjects || []).map(s => [s._id, true]))
    );
    
    // Estado local para almacenar calificaciones y feedback editados
    const [gradesState, setGradesState] = useState<Record<string, { grade: string; feedback: string }>>({});
    const [originalGrades, setOriginalGrades] = useState<Record<string, { grade: string; feedback: string }>>({});
    
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

    // Inicializar el estado local con las entregas iniciales de la base de datos
    useEffect(() => {
        const state: Record<string, { grade: string; feedback: string }> = {};
        
        // Mapear entregas existentes
        initialSubmissions.forEach((sub: any) => {
            const taskIdStr = String(sub.taskId);
            state[taskIdStr] = {
                grade: sub.grade !== undefined ? String(sub.grade) : "",
                feedback: sub.feedback || ""
            };
        });

        // Asegurar que todas las tareas en los temas tengan un objeto en el estado (vacío si no hay entrega)
        subjects.forEach(subj => {
            (subj.tasks || []).forEach(task => {
                if (!state[task.id]) {
                    state[task.id] = { grade: "", feedback: "" };
                }
            });
        });

        setGradesState(state);
        setOriginalGrades(JSON.parse(JSON.stringify(state)));
    }, [initialSubmissions, subjects]);

    const toggleSubject = (id: string) => {
        setExpandedSubjects(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleFieldChange = (taskId: string, field: "grade" | "feedback", value: string) => {
        if (field === "grade") {
            // Permitir vacío
            if (value === "") {
                setGradesState(prev => ({
                    ...prev,
                    [taskId]: { ...prev[taskId], grade: "" }
                }));
                return;
            }
            // Validar que sea un formato numérico con hasta 2 decimales
            if (!/^\d*\.?\d{0,2}$/.test(value)) return;
            
            const num = parseFloat(value);
            if (!isNaN(num) && (num < 0 || num > 10)) return;
        }

        setGradesState(prev => ({
            ...prev,
            [taskId]: {
                ...prev[taskId],
                [field]: value
            }
        }));
    };

    // Guardar todos los cambios modificados
    const handleSaveAll = async () => {
        setIsSaving(true);
        setSaveStatus("saving");
        try {
            // Filtrar cuáles calificaciones o feedbacks cambiaron respecto al original
            const promises = Object.keys(gradesState)
                .filter(taskId => {
                    const current = gradesState[taskId];
                    const original = originalGrades[taskId] || { grade: "", feedback: "" };
                    return current.grade !== original.grade || current.feedback !== original.feedback;
                })
                .map(async (taskId) => {
                    const current = gradesState[taskId];
                    const gradeVal = current.grade === "" ? 0 : parseFloat(current.grade);
                    return saveStudentTaskGrade(taskId, student.id, gradeVal, current.feedback);
                });

            if (promises.length === 0) {
                setSaveStatus("idle");
                setIsSaving(false);
                return;
            }

            const results = await Promise.all(promises);
            const hasError = results.some(r => !r.success);

            if (hasError) {
                setSaveStatus("error");
            } else {
                setSaveStatus("success");
                setOriginalGrades(JSON.parse(JSON.stringify(gradesState)));
                setTimeout(() => setSaveStatus("idle"), 3000);
            }
        } catch (error) {
            console.error("Error saving grades:", error);
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
                            <div className="mask mask-squircle w-10 h-10">
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
                                <th className="text-center w-2/5">Feedback</th>
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
                                            const state = gradesState[task.id] || { grade: "", feedback: "" };
                                            const gradeVal = parseFloat(state.grade);
                                            
                                            // Saber si esta entregado o no (asumir entregado si hay nota o feedback)
                                            const hasSubmission = state.grade !== "" || state.feedback !== "";

                                            return (
                                                <tr key={task.id} className="hover:bg-base-200/20 transition-colors border-b border-base-300/10">
                                                    <td className="pl-12 font-medium text-base-content/70">{task.title}</td>
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
                                                        <div className="flex flex-col items-center">
                                                            <div className="flex items-center gap-1">
                                                                <input 
                                                                    type="text" 
                                                                    value={state.grade}
                                                                    onChange={(e) => handleFieldChange(task.id, "grade", e.target.value)}
                                                                    placeholder="—"
                                                                    className={`w-14 bg-transparent text-right font-mono font-bold text-lg focus:outline-none border-b border-transparent focus:border-base-content/30 ${!isNaN(gradeVal) && gradeVal >= 5 ? 'text-success' : 'text-error'}`}
                                                                />
                                                                <span className="text-xs opacity-50 ml-0.5">/10</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="text-center">
                                                        <input 
                                                            type="text"
                                                            value={state.feedback}
                                                            onChange={(e) => handleFieldChange(task.id, "feedback", e.target.value)}
                                                            className="input input-bordered input-sm w-full font-medium"
                                                            placeholder="Añadir feedback..."
                                                        />
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
        </div>
    );
}