"use client";

import { Search, Download, Filter, GraduationCap } from "lucide-react";

interface Participant {
    id: string;
    nombre: string;
    apellidos: string;
    email: string;
    rol: string;
    avatar: string;
}

interface Task {
    id: string;
    title: string;
}

interface GradesViewProps {
    participants: Participant[];
    tasks: Task[];
    isTeacher: boolean;
    currentUserEmail?: string;
}

export default function GradesView({ participants, tasks, isTeacher, currentUserEmail }: GradesViewProps) {
    // Solo mostramos estudiantes en la lista de calificaciones
    const students = participants.filter(p => p.rol === "estudiante");

    // Si no es profesor, solo mostramos la fila del usuario actual (basado en el email de la sesión)
    const visibleStudents = isTeacher 
        ? students 
        : students.filter(p => p.email === currentUserEmail);

    if (!isTeacher) {
        const student = visibleStudents[0];
        const grades = tasks.map(() => (Math.random() * 10).toFixed(1));
        const average = (grades.reduce((acc, val) => acc + parseFloat(val), 0) / grades.length).toFixed(1);

        return (
            <div className="space-y-6">


                <div className="card bg-base-100 border border-base-300 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-base-300 flex justify-between items-center bg-base-200/30">
                        <h3 className="font-bold flex items-center gap-2">
                            <GraduationCap size={20} className="text-primary" />
                            Mis Calificaciones
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="table w-full">
                            <thead>
                                <tr className="bg-base-200/50">
                                    <th>Actividad</th>
                                    <th className="text-center">Estado</th>
                                    <th className="text-center">Nota</th>
                                    <th className="text-center">Feedback</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tasks.map((task, idx) => {
                                    const gradeVal = parseFloat(grades[idx]);
                                    return (
                                        <tr key={task.id} className="hover:bg-base-200/20 transition-colors">
                                            <td className="font-medium">{task.title}</td>
                                            <td className="text-center">
                                                <span className="text-success text-sm font-semibold">Entregado</span>
                                            </td>
                                            <td className="text-center">
                                                <span className={`font-mono font-bold text-lg ${gradeVal >= 5 ? 'text-primary' : 'text-error'}`}>
                                                    {gradeVal.toFixed(1)}
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                <button className="btn btn-ghost btn-xs text-primary">Leer comentario</button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar estudiante..."
                        className="input input-bordered w-full pl-10 bg-base-100 focus:input-primary"
                    />
                </div>
                <div className="flex gap-2">
                    <button className="btn btn-outline btn-sm gap-2">
                        <Filter size={16} />
                        Filtrar
                    </button>
                    <button className="btn btn-primary btn-sm gap-2">
                        <Download size={16} />
                        Exportar
                    </button>
                </div>
            </div>

            <div className="card bg-base-100 border border-base-300 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="table table-zebra w-full">
                        {/* head */}
                        <thead className="bg-base-200/50">
                            <tr>
                                <th className="bg-transparent">Estudiante</th>
                                {tasks.map(task => (
                                    <th key={task.id} className="text-center bg-transparent min-w-[120px]">
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="text-xs uppercase opacity-70">Tarea</span>
                                            <span className="max-w-[150px] truncate" title={task.title}>
                                                {task.title}
                                            </span>
                                        </div>
                                    </th>
                                ))}
                                <th className="text-center font-bold text-primary bg-transparent">Media</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visibleStudents.length > 0 ? (
                                visibleStudents.map((student) => {
                                    // Generar calificaciones aleatorias para la demo
                                    const grades = tasks.map(() => (Math.random() * 10).toFixed(1));
                                    const average = (grades.reduce((acc, val) => acc + parseFloat(val), 0) / grades.length).toFixed(1);

                                    return (
                                        <tr key={student.id} className="hover:bg-base-200/30 transition-colors">
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <div className="avatar">
                                                        <div className="mask mask-squircle w-10 h-10">
                                                            <img src={student.avatar} alt={student.nombre} />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="font-bold">{student.nombre} {student.apellidos}</div>
                                                        <div className="text-sm opacity-50">{student.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            {grades.map((grade, idx) => (
                                                <td key={idx} className="text-center">
                                                    <div className={`badge ${parseFloat(grade) >= 5 ? 'badge-ghost' : 'badge-error badge-outline'} font-mono`}>
                                                        {grade}
                                                    </div>
                                                </td>
                                            ))}
                                            <td className="text-center">
                                                <div className={`badge ${parseFloat(average) >= 5 ? 'badge-primary' : 'badge-error'} font-bold`}>
                                                    {average}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={tasks.length + 2} className="text-center py-8">
                                        <div className="flex flex-col items-center gap-2 text-base-content/50">
                                            <GraduationCap size={48} />
                                            <p>No hay estudiantes matriculados</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex justify-end gap-4 text-sm text-base-content/60 px-2">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                    <span>Suficiente / Aprobado</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-error"></div>
                    <span>Suspenso</span>
                </div>
            </div>
        </div>
    );
}
