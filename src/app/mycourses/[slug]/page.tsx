// Muestra la pagina de cursos segun el slug (busca en seed por los cursos)

import { CURSOS } from "@/seed/data";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB, User } from "@/lib/database";
import { notFound } from "next/navigation";
import CourseView from "@/components/ui/CourseView";

export default async function MyCoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const curso: any = CURSOS.find((c) => c.id === slug);

  if (!curso) {
    notFound();
  }

  let isTeacher = false;

  try {
    const session = await getServerSession(authOptions);
    // Si hay email conecta a la bd y busca el user
    if (session?.user?.email) {
      await connectDB();
      const user = await User.findOne({ email: session.user.email });
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