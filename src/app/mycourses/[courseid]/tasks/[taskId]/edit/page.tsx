/* Archivo: src\app\mycourses\[courseid]\tasks\[taskId]\edit\page.tsx
  Descripción: Página para editar una tarea existente del curso (formulario y guardado). */

import { getServerSession } from "next-auth/next";
import { notFound, redirect } from "next/navigation";
import mongoose from "mongoose";
import { authOptions } from "@/config/auth.config";
import { connectDB } from "@/lib/database/database";
import { Course, Task, User } from "@/models/index";
import { getTaskCreationContext } from "@/lib/task-assignment";
import TaskCreationForm from "@/components/tasks/TaskCreationForm";

export const dynamic = "force-dynamic";

type TaskEditPageProps = {
  params: Promise<{ courseid: string; taskId: string }>;
};

export default async function TaskEditPage({ params }: TaskEditPageProps) {
  const { courseid, taskId } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/auth/login");
  }

  await connectDB();

  const currentUser = await User.findOne({ email: session.user.email }).lean();
  if (!currentUser) {
    redirect("/auth/login");
  }

  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    notFound();
  }

  const course = await Course.findById(courseid).select("ownerId teachers title description").lean();
  if (!course) {
    notFound();
  }

  const currentUserId = currentUser._id.toString();
  const isOwner = String(course.ownerId) === currentUserId;
  const isTeacher = Array.isArray(course.teachers) && course.teachers.some((teacherId: any) => String(teacherId) === currentUserId);

  if (!isOwner && !isTeacher) {
    redirect(`/mycourses/${courseid}/tasks/${taskId}`);
  }

  const task = await Task.findById(taskId).lean();
  if (!task || task.courseId.toString() !== courseid) {
    notFound();
  }

  const creationContext = await getTaskCreationContext(courseid);
  if (!creationContext) {
    notFound();
  }

  const selectedUnit = creationContext.units.find((unit) => unit._id === String(task.unitId)) || creationContext.units[0] || null;

  return (
    <TaskCreationForm
      mode="edit"
      backHref={`/mycourses/${courseid}/tasks/${taskId}`}
      backLabel="Volver a la tarea"
      courseId={courseid}
      courseTitle={creationContext.course.title}
      courseDescription={creationContext.course.description}
      units={creationContext.units}
      students={creationContext.students}
      initialUnitId={String(task.unitId || creationContext.units[0]?._id || "")}
      selectedUnitTitle={selectedUnit?.title || ""}
      initialTask={{
        taskId: String(task._id),
        title: task.title,
        description: task.description,
        instructions: task.instructions || "",
        dueDate: task.dueDate ? task.dueDate.toISOString() : "",
        startDate: task.startDate ? task.startDate.toISOString() : new Date().toISOString(),
        unitId: task.unitId ? String(task.unitId) : String(creationContext.units[0]?._id || ""),
        type: task.type,
        maxPoints: task.maxPoints,
        allowLateSubmission: Boolean(task.allowLateSubmission),
        priority: task.priority,
        isOptional: Boolean(task.isOptional),
        countsTowardAverage: Boolean(task.countsTowardAverage ?? true),
        assignmentMode: task.assignmentMode,
        assignmentFilterKind: task.assignmentFilterKind,
        assignmentThreshold: task.assignmentThreshold,
        assignedStudentIds: Array.isArray(task.assignedStudentIds)
          ? task.assignedStudentIds.map((studentId: any) => String(studentId))
          : [],
        active: Boolean(task.active),
      }}
    />
  );
}