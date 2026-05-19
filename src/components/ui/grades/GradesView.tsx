"use client";

import StudentGradesView from "./StudentGradesView";
import TeacherGradesView from "./TeacherGradesView";

// Este archivo retorna la vsta de calificaciones requerida segun si eres profesor o estudiante

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
}

export default function GradesView({ participants, subjects, isTeacher, currentUserEmail }: GradesViewProps) {
    if (!isTeacher) {
        // La vista de estudiante solo muestra sus propias notas y temas
        return <StudentGradesView subjects={subjects} />;
    }

    // La vista de profesor muestra la tabla comparativa de todos los estudiantes
    return <TeacherGradesView participants={participants} subjects={subjects} />;
}

