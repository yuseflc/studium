/* Archivo: src\components\ui\grades\GradesView.tsx
    Descripción: Vista consolidada de calificaciones, usada por profesores y alumnos según permisos. */

"use client";
// Punto de entrada para vistas de calificaciones; enruta entre estudiante y profesor
import StudentGradesView from "./StudentGradesView";
import TeacherGradesView from "./TeacherGradesView";
import { useSubmissions } from "@/hooks/useSubmissions";

// [SSR] Interfaz de Submission (entregas reales)
interface Submission {
    _id: string;
    taskId: string;
    studentId: string;
    grade?: number;
    feedback?: string;
    submissionStatus: string;
    gradedAt?: string;
}

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

interface GradesViewProps {
    participants: Participant[];
    subjects: Subject[];
    isTeacher: boolean;
    currentUserEmail?: string;
    courseId: string;
}

export default function GradesView({
    participants,
    subjects,
    isTeacher,
    currentUserEmail,
    courseId
}: GradesViewProps) {
    const { submissions, loading } = useSubmissions(courseId);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <span className="loading loading-spinner loading-md"></span>
                <p className="ml-2 text-base-content/50">Cargando calificaciones...</p>
            </div>
        );
    }

    if (!isTeacher) {
        // [SSR] Vista de estudiante: filtrar sus propias entregas
        const studentId = currentUserEmail
            ? participants.find((p) => p.email === currentUserEmail)?.id
            : undefined;

        const studentSubmissions = studentId
            ? submissions.filter((s) => s.studentId === studentId)
            : [];

        return (
            <StudentGradesView
                subjects={subjects as any}
                submissions={studentSubmissions}
            />
        );
    }

    // Vista de profesor
    return (
        <TeacherGradesView
            participants={participants}
            subjects={subjects as any}
            courseId={courseId}
            initialSubmissions={submissions}
        />
    );
}

