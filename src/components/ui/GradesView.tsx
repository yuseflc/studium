"use client";

import { Search, Download, Filter, GraduationCap } from "lucide-react";

/**
 * Interfaz: Participante del curso
 * Usado para representar estudiantes y profesores
 */
interface Participant {
    id: string;
    nombre: string;
    apellidos: string;
    email: string;
    rol: string;
    avatar: string;
}

/**
 * Interfaz: Tarea o actividad
 * Usado para encabezados de columnas en tabla de calificaciones
 */
interface Task {
    id: string;
    title: string;
}

/**
 * Propiedades del componente GradesView
 * Maneja dos vistas: profesores ven todas las calificaciones, estudiantes ven solo las suyas
 */
interface GradesViewProps {
    participants: Participant[];
    tasks: Task[];
    isTeacher: boolean;
    currentUserEmail?: string;
}

export default function GradesView({ participants, tasks, isTeacher, currentUserEmail }: GradesViewProps) {
    // js-combine-iterations: Filtrar estudiantes en una pasada
    const students = participants.filter(p => p.rol === "estudiante");

    // rendering-conditional-render: Derivar lista visible según rol del usuario
    // Si es estudiante, solo muestra su fila. Si es profesor, muestra todos.
    const visibleStudents = isTeacher 
        ? students 
        : students.filter(p => p.email === currentUserEmail);

    // VISTA DE ESTUDIANTE: Mostrar solo mis calificaciones
    if (!isTeacher) {
        // Generamos notas de ejemplo para completar la vista. En producción esto vendría de datos reales.
        const grades = tasks.map(() => (Math.random() * 10).toFixed(1));
        const average = tasks.length > 0 
            ? (grades.reduce((acc, val) => acc + parseFloat(val), 0) / grades.length).toFixed(1)
            : '0.0';

        return (
            <div className="space-y-6">
                {/* Tarjeta principal: Mis Calificaciones */}
                <div className="card bg-base-100 border border-base-300 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-base-300 flex justify-between items-center bg-base-200/30">
                        <h3 className="font-bold flex items-center gap-2">
                            <GraduationCap size={20} className="text-primary" />
                            Mis Calificaciones
                        </h3>
                    </div>
                    {/* Tabla responsiva para vista móvil */}
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
                                    // js-cache-property-access: Cachear valor de calificación
                                    const gradeVal = parseFloat(grades[idx]);
                                    return (
                                        <tr key={task.id} className="hover:bg-base-200/20 transition-colors">
                                            <td className="font-medium">{task.title}</td>
                                            <td className="text-center">
                                                <span className="text-success text-sm font-semibold">Entregado</span>
                                            </td>
                                            <td className="text-center">
                                                {/* rendering-conditional-render: Color dinámico según nota */}
                                                <span className={`font-mono font-bold text-lg ${gradeVal >= 5 ? 'text-primary' : 'text-error'}`}>
                                                    {gradeVal.toFixed(1)}
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                <button className="btn btn-ghost btn-xs text-primary" aria-label="Leer comentario del profesor">
                                                    Leer comentario
                                                </button>
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

    // VISTA DE PROFESOR: Mostrar tabla de calificaciones de todos los estudiantes
    return (
        <div className="space-y-6">
            {/* Barra de herramientas: búsqueda y filtros */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Campo de búsqueda de estudiante (no implementado) */}
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar estudiante..."
                        className="input input-bordered w-full pl-10 bg-base-100 focus:input-primary"
                        aria-label="Buscar estudiante por nombre o email"
                    />
                </div>
                {/* Botones de acciones: Filtrar y Exportar */}
                <div className="flex gap-2">
                    <button className="btn btn-outline btn-sm gap-2" aria-label="Filtrar calificaciones">
                        <Filter size={16} />
                        Filtrar
                    </button>
                    <button className="btn btn-primary btn-sm gap-2" aria-label="Exportar calificaciones a archivo">
                        <Download size={16} />
                        Exportar
                    </button>
                </div>
            </div>

            {/* Tabla principal: Matriz de estudiantes vs tareas */}
            <div className="card bg-base-100 border border-base-300 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="table table-zebra w-full">
                        {/* Encabezado: Estudiante + Tareas + Media */}
                        <thead className="bg-base-200/50">
                            <tr>
                                <th className="bg-transparent">Estudiante</th>
                                {/* Columnas dinámicas para cada tarea */}
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
                                {/* Columna de promedio general */}
                                <th className="text-center font-bold text-primary bg-transparent">Media</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* rendering-conditional-render: Mostrar fila de estudiante o mensaje de vacío */}
                            {visibleStudents.length > 0 ? (
                                visibleStudents.map((student) => {
                                    // Las calificaciones son de ejemplo; sirven para mostrar la tabla de profesor.
                                    const grades = tasks.map(() => (Math.random() * 10).toFixed(1));
                                    const average = tasks.length > 0
                                        ? (grades.reduce((acc, val) => acc + parseFloat(val), 0) / grades.length).toFixed(1)
                                        : '0.0';

                                    return (
                                        <tr key={student.id} className="hover:bg-base-200/30 transition-colors">
                                            {/* Celda de estudiante: avatar + nombre + email */}
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <div className="avatar">
                                                        <div className="mask mask-squircle w-10 h-10">
                                                            <img 
                                                                src={student.avatar} 
                                                                alt={`Avatar de ${student.nombre} ${student.apellidos}`}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="font-bold">{student.nombre} {student.apellidos}</div>
                                                        <div className="text-sm opacity-50">{student.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            {/* Celdas de tareas: badges con color según aprobación */}
                                            {grades.map((grade, idx) => (
                                                <td key={idx} className="text-center">
                                                    {/* rendering-conditional-render: Color badge según nota */}
                                                    <div className={`badge ${parseFloat(grade) >= 5 ? 'badge-ghost' : 'badge-error badge-outline'} font-mono`}>
                                                        {grade}
                                                    </div>
                                                </td>
                                            ))}
                                            {/* Celda de promedio: badge resaltado */}
                                            <td className="text-center">
                                                <div className={`badge ${parseFloat(average) >= 5 ? 'badge-primary' : 'badge-error'} font-bold`}>
                                                    {average}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                // Mensaje cuando no hay estudiantes
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

            {/* Leyenda: Explicar los colores de las notas */}
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
