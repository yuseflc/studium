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
import { CALIFICACIONES } from '@/seed/data';
import TaskDetailClient from '../../../../../components/ui/TaskDetailClient';
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
    // Fallback temporal para las tareas que vienen de CALIFICACIONES u otras pruebas
    const seedTask = CALIFICACIONES.find(t => String(t._id) === taskId);
    if (seedTask) {
      taskInfo = {
        title: seedTask.taskTitle,
        description: "Dominio de Flexbox y CSS Grid para layouts complejos.",
        dueDate: new Date(),
        maxPoints: seedTask.maxScore
      };
    }
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
    content: existingSubmission.content,
    files: existingSubmission.files,
    submittedAt: existingSubmission.submittedAt
  } : undefined;

  return (
    <TaskDetailClient 
      taskInfo={serializedTask} 
      courseid={courseid} 
      isTeacherView={isTeacherView}
      deliveredCount={deliveredCount}
      totalStudents={course ? course.enrolledStudents?.length || 0 : 0}
      editTaskHref={`/mycourses/${courseid}/tasks/${taskId}/edit`}
      existingSubmission={serializedSubmission}
      teacherSubmissions={teacherSubmissions}
    />
  );
}
