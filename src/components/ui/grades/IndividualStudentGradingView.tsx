"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight, Save, ArrowLeft } from "lucide-react";

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
    onBack: () => void;
}

export default function IndividualStudentGradingView({ student, subjects = [], onBack }: IndividualStudentGradingViewProps) {
    const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>(
        Object.fromEntries((subjects || []).map(s => [s._id, true]))
    );
    
    // Estado local para simular la edición de notas
    const [grades, setGrades] = useState<Record<string, string>>({});

    const toggleSubject = (id: string) => {
        setExpandedSubjects(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleGradeChange = (taskId: string, value: string) => {
        // Permitir vacío para borrar
        if (value === "") {
            setGrades(prev => ({ ...prev, [taskId]: value }));
            return;
        }

        // Validar que sea un formato numérico válido con hasta 3 decimales
        if (!/^\d*\.?\d{0,3}$/.test(value)) return;

        const num = parseFloat(value);
        if (!isNaN(num) && num >= 0 && num <= 10) {
            setGrades(prev => ({ ...prev, [taskId]: value }));
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
                <button className="btn btn-primary btn-sm gap-2">
                    <Save size={16} />
                    Guardar Cambios
                </button>
            </div>

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
                                            const currentGrade = grades[task.id] || (Math.random() * 10).toFixed(1);
                                            const gradeVal = parseFloat(currentGrade);
                                            return (
                                                <tr key={task.id} className="hover:bg-base-200/20 transition-colors border-b border-base-300/10">
                                                    <td className="pl-12 font-medium text-base-content/70">{task.title}</td>
                                                    <td className="text-center">
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-success/10 text-success border border-success/20 shadow-sm">
                                                            Entregado
                                                        </span>
                                                    </td>
                                                    <td className="text-center">
                                                        <div className="flex flex-col items-center">
                                                            <div className="flex items-center gap-1">
                                                                <input 
                                                                    type="text" 
                                                                    value={currentGrade}
                                                                    onChange={(e) => handleGradeChange(task.id, e.target.value)}
                                                                    className={`w-14 bg-transparent text-right font-mono font-bold text-lg focus:outline-none focus:border-b focus:border-base-content/30 ${gradeVal >= 5 ? 'text-success' : 'text-error'}`}
                                                                />
                                                                <span className="text-xs opacity-50 ml-0.5">/10</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="text-center">
                                                        <button className="btn btn-ghost btn-sm text-base-content/50 hover:text-base-content transition-colors font-bold">
                                                            Añadir feedback
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
        </div>
    );
}