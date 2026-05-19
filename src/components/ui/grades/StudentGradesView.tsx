"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface Task {
    id: string;
    title: string;
}

interface Subject {
    _id: string;
    title: string;
    tasks?: Task[];
}

interface StudentGradesViewProps {
    subjects: Subject[];
}

export default function StudentGradesView({ subjects }: StudentGradesViewProps) {
    const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>(
        Object.fromEntries(subjects.map(s => [s._id, true]))
    );

    const toggleSubject = (id: string) => {
        setExpandedSubjects(prev => ({ ...prev, [id]: !prev[id] }));
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
                                            const gradeVal = Math.random() * 10;
                                            return (
                                                <tr key={task.id} className="hover:bg-base-200/20 transition-colors border-b border-base-300/10">
                                                    <td className="pl-12 font-medium text-base-content/70">{task.title}</td>
                                                    <td className="text-center">
                                                        <span className="text-success text-sm font-semibold">Entregado</span>
                                                    </td>
                                                    <td className="text-center">
                                                        <div className="flex flex-col items-center">
                                                            <span className={`font-mono font-bold text-lg ${gradeVal >= 5 ? 'text-success' : 'text-error'}`}>
                                                                {gradeVal.toFixed(1)}
                                                                <span className="text-xs opacity-50 ml-0.5">/10</span>
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="text-center">
                                                        <button className="btn btn-ghost btn-sm text-base-content/50 hover:text-base-content transition-colors font-bold">
                                                            Leer comentario
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
