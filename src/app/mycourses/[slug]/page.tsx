// Muestra la pagina de cursos segun el slug (busca en MongoDB y en seed como fallback)

import { CURSOS } from "@/seed/data";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/config/auth.config";
import { connectDB } from "@/lib/database/database";
import { User, Course } from "@/models/index";
import { notFound } from "next/navigation";
import CourseView from "@/components/ui/CourseView";


export const dynamic = "force-dynamic"; // Forzar que esta página sea renderizada en cada solicitud


export default async function MyCoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Primero intenta buscar en MongoDB
  let curso: any = null;

  try {
    await connectDB();
    // Busca por _id (si el slug es un ObjectId de MongoDB)
    curso = await Course.findById(slug).lean();
    
    // Si no encuentra, intenta buscar en el seed
    if (!curso) {
      curso = CURSOS.find((c) => c.id === slug);
    }

    // Si encuentra en MongoDB, lo adapta al formato esperado
    if (curso) {
      curso = {
        id: curso._id?.toString() || curso.id,
        nombre: curso.title || curso.nombre,
        descripcion: curso.description || curso.descripcion,
        imagen: curso.imagen || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=60",
        subjects: curso.subjects || [],
      };
    }
  } catch (error) {
    console.error("Error fetching course from MongoDB:", error);
    // Si hay error en BD, intenta seed
    curso = CURSOS.find((c) => c.id === slug);
  }

  if (!curso) {
    notFound();
  }

  let isTeacher = false;

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