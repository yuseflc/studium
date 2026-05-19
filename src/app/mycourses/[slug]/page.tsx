// Muestra la pagina de cursos segun el slug (busca en MongoDB y en seed como fallback)

import { CURSOS, getSeedCourseStructure } from "@/seed/data";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/config/auth.config";
import { connectDB } from "@/lib/database/database";
import { User, Course } from "@/models/index";
import { getCourseFullStructure } from "@/lib/api/course-helpers";
import { notFound, redirect } from "next/navigation";
import CourseView from "@/components/ui/CourseView";
import { ICourse } from "@/models/Course";


export const dynamic = "force-dynamic"; // Forzar que esta página sea renderizada en cada solicitud


export default async function MyCoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  var curso: ICourse | null = null;
  var courseStructure: any = null;

  try {
    await connectDB();
    // Busca por _id (si el slug es un ObjectId de MongoDB)
    curso = await Course.findById(slug).lean();
    
    // Si encontró el curso, obtener su estructura completa
    if (curso) {
      courseStructure = await getCourseFullStructure(slug);
    } else {
      // Si no encuentra en DB, intenta buscar en el seed por ID
      const seedCourse = CURSOS.find(c => String(c._id) == slug);
      if (seedCourse) {
        curso = seedCourse;
        // Para seed data, usar la estructura normalizada con units y resources hidratados
        courseStructure = getSeedCourseStructure(slug);
      }
    }

    if (!curso) {
      redirect("/mycourses");
    }

  } catch (error) {
    console.error(`Curso ${slug} no encontrado en MongoDB ${error}`);
    const seedCourse = CURSOS.find(c => String(c._id) == slug);
    if (seedCourse) {
      curso = seedCourse;
      courseStructure = getSeedCourseStructure(slug);
    }
    //return redirect("/mycourses");
  }

  let isTeacher: boolean = false;

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
        <CourseView courseData={curso} courseStructure={courseStructure} isTeacher={isTeacher} />
      </div>
    </div>
  );
}