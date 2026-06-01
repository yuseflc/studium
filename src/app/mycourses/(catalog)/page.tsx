/* Archivo: src\app\mycourses\(catalog)\page.tsx
    Descripción: Página del catálogo de cursos (vista pública o lista interna de cursos). */

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/config/auth.config";
import { connectDB } from "@/lib/database/database";
import { User } from "@/models/index";
import CoursesView from "@/components/courses/CourseMenuView";

export const dynamic = "force-dynamic"; // Forzar que esta página sea renderizada en cada solicitud

export default async function CourseCatalogPage() {
    let isTeacher = false;

    try {
        const session = await getServerSession(authOptions);
        if (session?.user?.id) {
            await connectDB();
            const user = await User.findOne({ _id: session.user.id });
            if (user) {
                isTeacher = user.role === "teacher";
            }
        }
    } catch (error) {
        console.error("Error fetching user:", error);
    }
    // Retorna la vista de los cursos controlando si es profesor o no (para añadir cursos)
    return <CoursesView isTeacher={isTeacher} />;
}

