import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB, User } from "@/lib/database";
import CoursesView from "@/components/ui/CourseMenuView";

export default async function CourseCatalogPage() {
    let isTeacher = false;

    try {
        const session = await getServerSession(authOptions);
        if (session?.user?.email) {
            await connectDB();
            const user = await User.findOne({ email: session.user.email });
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

