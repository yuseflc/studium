// Muestra la pagina de cursos segun el slug (busca en seed por los cursos)

import { CURSOS } from "@/seed/data";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/config/auth.config";
import { connectDB, User } from "@/lib/database";
import { notFound } from "next/navigation";
import CourseView from "@/components/ui/CourseView";


export const dynamic = "force-dynamic"; // Forzar que esta página sea renderizada en cada solicitud


export default async function MyCoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const curso: any = CURSOS.find((c) => c.id === slug);

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