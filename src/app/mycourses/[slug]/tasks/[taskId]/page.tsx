import { connectDB } from '@/lib/database/database';
import Task from '@/models/Task';
import { notFound } from 'next/navigation';
import { ClipboardList, Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import mongoose from 'mongoose';
import { CALIFICACIONES } from '@/seed/data';

export const dynamic = "force-dynamic";

export default async function TaskDetailPage({ 
  params 
}: { 
  params: Promise<{ slug: string; taskId: string }> 
}) {
  const { slug, taskId } = await params;
  
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
        description: "Esta es una tarea de demostración que proviene de las calificaciones estáticas. No tiene una descripción extendida en la base de datos.",
        dueDate: new Date(),
        maxPoints: seedTask.maxScore
      };
    }
  }

  if (!taskInfo) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-base-200/50 p-6 lg:p-12">
      <div className="max-w-4xl mx-auto">
        <Link 
          href={`/mycourses/${slug}`} 
          className="btn btn-ghost btn-sm mb-6 flex items-center gap-2 w-fit text-base-content/70 hover:text-base-content"
        >
          <ArrowLeft size={16} />
          Volver al curso
        </Link>

        <div className="card bg-base-100 shadow-xl border border-base-300">
          <div className="card-body p-8 lg:p-12">
            <div className="flex items-start gap-6">
              <div className="p-4 rounded-2xl flex-shrink-0 bg-primary/10 text-primary hidden sm:flex">
                <ClipboardList size={40} />
              </div>
              
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl lg:text-4xl font-bold text-base-content tracking-tight mb-4">
                  {taskInfo.title}
                </h1>
                
                <div className="flex items-center gap-4 text-base-content/70 flex-wrap mb-8">
                  <div className="flex items-center gap-2">
                    <Calendar size={18} />
                    <span>Fecha de entrega: <strong className="text-base-content">{new Date(taskInfo.dueDate).toLocaleDateString()}</strong></span>
                  </div>
                  <div className="badge badge-primary badge-outline">
                    Valor: {taskInfo.maxPoints || 100} pts
                  </div>
                </div>

                <div className="divider">Instrucciones</div>
                
                <div className="prose prose-base-content max-w-none mt-6">
                  {taskInfo.description.split('\n').map((line: string, i: number) => (
                    <p key={i} className="text-lg leading-relaxed text-base-content/80">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-base-200">
              <div className="flex flex-col items-center justify-center text-center p-8 bg-base-200 rounded-2xl border border-base-300 border-dashed">
                <h3 className="font-semibold text-lg mb-2">Entregar Tarea</h3>
                <p className="text-base-content/60 mb-6 max-w-md">
                  Para enviar tu resolución de la tarea debes adjuntar los archivos solicitados o escribir en el panel de entrega.
                </p>
                <button className="btn btn-primary btn-wide">
                  Añadir Entrega
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
