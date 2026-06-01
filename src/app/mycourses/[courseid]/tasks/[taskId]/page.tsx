/* Archivo: src\app\mycourses\[courseid]\tasks\[taskId]\page.tsx
  Descripción: Página de detalle de una tarea dentro del curso: instrucciones y entregas. */

// Página server: detalle de tarea dentro de un curso (muestra entregas y calificaciones)
import { connectDB } from '@/lib/database/database';
import Course from '@/models/Course';
import Task from '@/models/Task';
import Submission from '@/models/Submission';
import User from '@/models/User';
import { notFound } from 'next/navigation';
import mongoose from 'mongoose';
import TaskDetailClient from '@/components/tasks/TaskDetailClient';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/config/auth.config';

export const dynamic = "force-dynamic";

export default async function TaskDetailPage({ 
  params 
}: { 
  params: Promise<{ courseid: string; taskId: string }> 
}) {
  const { courseid, taskId } = await params;
  const session = await getServerSession(authOptions);
  
  let taskInfo: any = null;
  let existingSubmission: any = null;
  let teacherSubmissions: any[] = [];

  await connectDB();

  const currentUser = session?.user?.email
    ? await User.findOne({ email: session.user.email }).lean()
    : null;

  const course = await Course.findById(courseid).select('ownerId teachers enrolledStudents').lean();
  const isTeacherView = !!currentUser && !!course && (
    course.ownerId?.toString() === currentUser._id.toString() ||
    Array.isArray(course.teachers) && course.teachers.some((teacherId: any) => teacherId.toString() === currentUser._id.toString())
  );

  // Buscar en BD si es un ObjectId
  if (mongoose.Types.ObjectId.isValid(taskId)) {
    taskInfo = await Task.findById(taskId).lean();

    // Control de acceso para estudiantes:
    // - Las tareas borrador (active=false) solo las ve el profesor
    // - Las tareas con assignmentMode!="all" solo las ven los estudiantes asignados
    if (taskInfo && !isTeacherView && currentUser) {
      if (!taskInfo.active) {
        taskInfo = null;
      } else if (taskInfo.assignmentMode && taskInfo.assignmentMode !== 'all') {
        const isAssigned = Array.isArray(taskInfo.assignedStudentIds) &&
          taskInfo.assignedStudentIds.some(
            (id: any) => id.toString() === currentUser._id.toString()
          );
        if (!isAssigned) taskInfo = null;
      }
    }

    if (taskInfo && currentUser) {
        existingSubmission = await Submission.findOne({
          taskId: taskInfo._id,
          studentId: currentUser._id
        }).lean();
    }

    if (taskInfo && isTeacherView) {
      const rawTeacherSubmissions = await Submission.find({
        taskId: taskInfo._id,
        submissionStatus: { $in: ["submitted", "late"] },
      })
        .populate({
          path: 'studentId',
          select: 'firstName profile.lastName profile.profilePicture email',
        })
        .sort({ submittedAt: -1, createdAt: -1 })
        .lean();

      teacherSubmissions = rawTeacherSubmissions.map((submission: any) => ({
        _id: String(submission._id),
        taskId: String(submission.taskId),
        studentId: String(submission.studentId?._id || submission.studentId),
        studentName: [submission.studentId?.firstName, submission.studentId?.profile?.lastName]
          .filter(Boolean)
          .join(' ') || submission.studentId?.email || 'Estudiante',
        studentEmail: submission.studentId?.email || '',
        studentAvatar: submission.studentId?.profile?.profilePicture || '',
        content: submission.content || '',
        files: Array.isArray(submission.files) ? submission.files : [],
        grade: submission.grade,
        feedback: submission.feedback || '',
        submissionStatus: submission.submissionStatus,
        submittedAt: submission.submittedAt ? String(submission.submittedAt) : undefined,
        gradedAt: submission.gradedAt ? String(submission.gradedAt) : undefined,
      }));
    }
  } else {
    // Fallback: si no hay tarea en BD, retornar 404
    notFound();
  }

  if (!taskInfo) {
    notFound();
  }

  const deliveredCount = taskInfo._id
    ? await Submission.countDocuments({
        taskId: taskInfo._id,
        submissionStatus: { $in: ["submitted", "late"] },
      })
    : 0;

  // Serializar campos no serializables de Mongoose a objetos limpios
  const serializedTask = {
    _id: taskInfo._id ? String(taskInfo._id) : undefined,
    title: taskInfo.title,
    description: taskInfo.description,
    instructions: taskInfo.instructions,
    dueDate: taskInfo.dueDate ? String(taskInfo.dueDate) : undefined,
    maxPoints: taskInfo.maxPoints,
    isOptional: taskInfo.isOptional,
    allowLateSubmission: taskInfo.allowLateSubmission,
  };

  const serializedSubmission = existingSubmission ? {
    content: (existingSubmission as any).content,
    files: (existingSubmission as any).files,
    submittedAt: (existingSubmission as any).submittedAt,
    grade: (existingSubmission as any).grade,
    feedback: (existingSubmission as any).feedback,
    gradedAt: (existingSubmission as any).gradedAt ? String((existingSubmission as any).gradedAt) : undefined,
    submissionStatus: (existingSubmission as any).submissionStatus,
  } : undefined;

  const totalStudents = (() => {
    if (!course) return 0;
    if (taskInfo.assignmentMode === 'manual') {
      return Array.isArray(taskInfo.assignedStudentIds) ? taskInfo.assignedStudentIds.length : 0;
    }
    return course.enrolledStudents?.length || 0;
  })();

  return (
    <TaskDetailClient
      taskInfo={serializedTask}
      courseid={courseid}
      isTeacherView={isTeacherView}
      deliveredCount={deliveredCount}
      totalStudents={totalStudents}
      editTaskHref={`/mycourses/${courseid}/tasks/${taskId}/edit`}
      existingSubmission={serializedSubmission}
      teacherSubmissions={teacherSubmissions}
    />
  );
}
