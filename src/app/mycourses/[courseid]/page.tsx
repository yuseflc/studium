// Muestra la pagina de cursos segun el courseid (busca en MongoDB)

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/config/auth.config";
import { connectDB } from "@/lib/database/database";
import { User, Course } from "@/models/index";
import { getCourseFullStructure } from "@/lib/api/course-helpers";
import { notFound, redirect } from "next/navigation";
import CourseView from "@/components/courses/CourseView";
import { ICourse } from "@/models/Course";
import { CourseStructureGeneric } from "@/lib/api/types";
import { LOGGER } from "@/config/logger";
import { validateCourseAccess } from "@/app/actions/courseActions";

/**
 * Serializa datos de MongoDB para que sean compatibles con Client Components
 * Convierte ObjectId y otros tipos especiales a valores planos
 */
function serializeForClient<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

export const dynamic = "force-dynamic"; // Forzar que esta página sea renderizada en cada solicitud


export default async function MyCoursePage({ params }: { params: Promise<{ courseid: string }> }) {
  const { courseid } = await params;
  
  // Verificar el acceso del usuario al curso antes de cargar los datos
  const hasAccess = await validateCourseAccess(courseid);
  if (!hasAccess) {
    redirect("/mycourses");
  }

  let curso: ICourse | null = null;
  let courseStructure: CourseStructureGeneric | null = null;

  try {
    await connectDB();
    // Busca por _id (si el courseid es un ObjectId de MongoDB)
    const rawCurso = await Course.findById(courseid)
      .populate({
        path: 'ownerId',
        select: 'firstName email profile.lastName profile.profilePicture role thirdparty.provider thirdparty.profilePicture',
      })
      .populate({
        path: 'teachers',
        select: 'firstName email profile.lastName profile.profilePicture role thirdparty.provider thirdparty.profilePicture',
      })
      .populate({
        path: 'enrolledStudents',
        select: 'firstName email profile.lastName profile.profilePicture role thirdparty.provider thirdparty.profilePicture',
      })
      .lean();
    
    // Si encontró el curso, obtener su estructura completa
    if (rawCurso) {
      // Serializar el curso para hacerlo compatible con Client Components
      curso = serializeForClient(rawCurso);
      const rawStructure = await getCourseFullStructure(courseid);
      courseStructure = serializeForClient(rawStructure);
    }

  } catch (error) {
    LOGGER.error(`Curso ${courseid} no encontrado en MongoDB ${error}`);
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
    LOGGER.error(`Error fetching user data: ${error}`);
  }

  if (!curso) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Curso no encontrado</h1>
          <p className="text-base-content/70">
            El curso que buscas no existe o no tienes permiso para verlo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh]">
      <div className="max-w-8xl mx-auto">
        <CourseView courseData={curso} courseStructure={courseStructure} isTeacher={isTeacher} />
      </div>
    </div>
  );
}