import { RESOURCES } from "@/seed/data";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/config/auth.config";
import { connectDB } from "@/lib/database/database";
import { User } from "@/models/index";
import { notFound } from "next/navigation";
import CourseView from "@/components/ui/CourseView";

export default async function MyCoursePage({ params }: { params: Promise<{ resourceid: string }> }) {
  const { resourceid } = await params;
  const resource: any = RESOURCES.find((r) => r.id === resourceid);

  if (!resource) {
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
        <CourseView courseData={resource} isTeacher={isTeacher} />
      </div>
    </div>
  );

  return (
    <><div className="min-h-[70vh]">
          <div className="max-w-8xl mx-auto">
              <CourseView courseData={resource} isTeacher={isTeacher} />
          </div>
      </div><h1>
              Recurso: {resourceid}
          </h1></>
  )
}