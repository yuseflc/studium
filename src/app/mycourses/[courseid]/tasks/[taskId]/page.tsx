import { connectDB } from '@/lib/database/database';
import Task from '@/models/Task';
import Submission from '@/models/Submission';
import User from '@/models/User';
import { notFound } from 'next/navigation';
import mongoose from 'mongoose';
import { CALIFICACIONES } from '@/seed/data';
import TaskDetailClient from '@/components/ui/TaskDetailClient';
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

  await connectDB();

  // Buscar en BD si es un ObjectId
  if (mongoose.Types.ObjectId.isValid(taskId)) {
    taskInfo = await Task.findById(taskId).lean();
    
    if (taskInfo && session?.user?.email) {
      const user = await User.findOne({ email: session.user.email }).lean();
      if (user) {
        existingSubmission = await Submission.findOne({ 
          taskId: taskInfo._id, 
          studentId: user._id 
        }).lean();
      }
    }
  } else {
    // Fallback temporal para las tareas que vienen de CALIFICACIONES u otras pruebas
    const seedTask = CALIFICACIONES.find(t => String(t.id) === taskId);
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

  // Serializar campos no serializables de Mongoose a objetos limpios
  const serializedTask = {
    _id: taskInfo._id ? String(taskInfo._id) : undefined,
    title: taskInfo.title,
    description: taskInfo.description,
    dueDate: taskInfo.dueDate,
    maxPoints: taskInfo.maxPoints
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
      existingSubmission={serializedSubmission}
    />
  );
}
