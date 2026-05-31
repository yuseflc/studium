/* Archivo: src\app\mycourses\[courseid]\tasks\new\page.tsx
  Descripción: Página para crear una nueva tarea en el curso (formulario de creación). */

import { getServerSession } from "next-auth/next";
import { notFound, redirect } from "next/navigation";
import { authOptions } from "@/config/auth.config";
import { connectDB } from "@/lib/database/database";
import { Course, User } from "@/models/index";
import { getTaskCreationContext } from "@/lib/task-assignment";
import TaskCreationForm from "@/components/ui/tasks/TaskCreationForm";

export const dynamic = "force-dynamic";

type TaskCreationPageProps = {
  params: Promise<{ courseid: string }>;
  searchParams?: Promise<{ unitId?: string }>;
};

export default async function TaskCreationPage({ params, searchParams }: TaskCreationPageProps) {
  const { courseid } = await params;
  const { unitId } = searchParams ? await searchParams : { unitId: undefined };

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect("/auth/login");
  }

  await connectDB();

  const currentUser = await User.findOne({ email: session.user.email }).lean();
  if (!currentUser) {
    redirect("/auth/login");
  }

  const course = await Course.findById(courseid).select("ownerId teachers title description").lean();
  if (!course) {
    notFound();
  }

  const currentUserId = currentUser._id.toString();
  const isOwner = String(course.ownerId) === currentUserId;
  const isTeacher = Array.isArray(course.teachers) && course.teachers.some((teacherId: any) => String(teacherId) === currentUserId);

  if (!isOwner && !isTeacher) {
    redirect("/mycourses");
  }

  const creationContext = await getTaskCreationContext(courseid);
  if (!creationContext) {
    notFound();
  }

  const selectedUnit = creationContext.units.find((unit) => unit._id === unitId) || creationContext.units[0] || null;

  return (
    <TaskCreationForm
      courseId={courseid}
      courseTitle={creationContext.course.title}
      courseDescription={creationContext.course.description}
      units={creationContext.units}
      students={creationContext.students}
      initialUnitId={unitId || creationContext.units[0]?._id || ""}
      selectedUnitTitle={selectedUnit?.title || ""}
    />
  );
}