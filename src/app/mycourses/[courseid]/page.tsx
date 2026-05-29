// Muestra la pagina de cursos segun el courseid (busca en MongoDB y en seed como fallback)

import { CURSOS, getSeedCourseStructure } from "@/seed/data";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/config/auth.config";
import { connectDB } from "@/lib/database/database";
import { User, Course } from "@/models/index";
import { getCourseFullStructure } from "@/lib/api/course-helpers";
import { notFound, redirect } from "next/navigation";
import CourseView from "@/components/ui/CourseView";
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
  
  // Validate user access early before fetching course data
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
        select: 'firstName email profile.lastName profile.profilePicture role',
      })
      .populate({
        path: 'teachers',
        select: 'firstName email profile.lastName profile.profilePicture role',
      })
      .populate({
        path: 'enrolledStudents',
        select: 'firstName email profile.lastName profile.profilePicture role',
      })
      .lean();
    
    // Si encontró el curso, obtener su estructura completa
    if (rawCurso) {
      // Serializar el curso para hacerlo compatible con Client Components
      curso = serializeForClient(rawCurso);
      const rawStructure = await getCourseFullStructure(courseid);
      courseStructure = serializeForClient(rawStructure);
    } else {
      // Si no encuentra en DB, intenta buscar en el seed por ID
      const seedCourse = CURSOS.find(c => String(c._id) == courseid);
      if (seedCourse) {
        curso = seedCourse;
        // Para seed data, usar la estructura normalizada con units y resources hidratados
        courseStructure = getSeedCourseStructure(courseid);
      }
    }

    if (!curso) {
      // No redirigir, se manejará más abajo
    }

  } catch (error) {
    LOGGER.error(`Curso ${courseid} no encontrado en MongoDB ${error}`);
    const seedCourse = CURSOS.find(c => String(c._id) == courseid);
    if (seedCourse) {
      curso = seedCourse;
      courseStructure = getSeedCourseStructure(courseid);
    }
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