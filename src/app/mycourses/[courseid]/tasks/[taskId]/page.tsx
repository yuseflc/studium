import { connectDB } from '@/lib/database/database';
import Task from '@/models/Task';
import { notFound } from 'next/navigation';
import mongoose from 'mongoose';
import { CALIFICACIONES } from '@/seed/data';
import TaskDetailClient from '@/components/ui/TaskDetailClient';

export const dynamic = "force-dynamic";

export default async function TaskDetailPage({ 
  params 
}: { 
  params: Promise<{ courseid: string; taskId: string }> 
}) {
  const { courseid, taskId } = await params;
  
  let taskInfo: any = null;

  // Buscar en BD si es un ObjectId
  if (mongoose.Types.ObjectId.isValid(taskId)) {
    await connectDB();
    taskInfo = await Task.findById(taskId).lean();
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

  return <TaskDetailClient taskInfo={serializedTask} courseid={courseid} />;
}
