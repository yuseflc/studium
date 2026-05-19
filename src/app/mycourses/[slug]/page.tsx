// Muestra la pagina de cursos segun el slug (busca en MongoDB y en seed como fallback)

import { CURSOS } from "@/seed/data";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/config/auth.config";
import { connectDB } from "@/lib/database/database";
import { User, Course } from "@/models/index";
import { notFound, redirect } from "next/navigation";
import CourseView from "@/components/ui/CourseView";
import { ICourse } from "@/models/Course";


export const dynamic = "force-dynamic"; // Forzar que esta página sea renderizada en cada solicitud


export default async function MyCoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;


  try {
    await connectDB();
    // Busca por _id (si el slug es un ObjectId de MongoDB)
    var curso : ICourse | null = await Course.findById(slug).lean();
    
    // Si no encuentra en DB, intenta buscar en el seed por ID
    if (!curso) {
      const seedCourse = CURSOS.find(c => String(c._id) === slug);
      if (seedCourse) {
        curso = seedCourse;
      }
    }

    if (!curso) {
      redirect("/mycourses");
    }

  } catch (error) {
    console.error("Error fetching course from MongoDB:", error);
    redirect("/mycourses");
  }

  let isTeacher : boolean = false;

  try {
    const session = await getServerSession(authOptions);
    // Si hay sesión conecta a la bd y busca el user
    if (session?.user?.id) {
      await connectDB();
      const user = await User.findOne({ _id: session.user.id });
      if (user) {
        isTeacher = user.role === "teacher";
      }
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
  }

  return (
    <div className="min-h-[70vh]">
      <div className="max-w-8xl mx-auto">
        <CourseView courseData={curso} isTeacher={isTeacher} />
      </div>
    </div>
  );
}