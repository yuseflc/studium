"use client";

import { useEffect, useState } from "react";
import StudentGradesView from "./StudentGradesView";
import TeacherGradesView from "./TeacherGradesView";
import { getCourseSubmissions } from "@/app/actions/participantActions";

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
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);

    // [SSR] Cargar submissions reales del curso
    useEffect(() => {
        const loadSubmissions = async () => {
            setLoading(true);
            try {
                const res = await getCourseSubmissions(courseId);
                if (res.success) {
                    setSubmissions(res.submissions);
                    console.log(
                        `[GradesView] Cargadas ${res.submissions.length} entregas reales`
                    );
                }
            } catch (error) {
                console.error("[GradesView] Error:", error);
            } finally {
                setLoading(false);
            }
        };

        loadSubmissions();
    }, [courseId]);

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
                subjects={subjects}
                submissions={studentSubmissions}
            />
        );
    }

    // Vista de profesor
    return (
        <TeacherGradesView
            participants={participants}
            subjects={subjects}
            courseId={courseId}
        />
    );
}

