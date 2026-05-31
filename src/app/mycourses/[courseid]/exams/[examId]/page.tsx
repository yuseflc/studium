/* Archivo: src\app\mycourses\[courseid]\exams\[examId]\page.tsx
  Descripción: Página que muestra un examen del curso (instrucciones y estado). */

import { connectDB } from '@/lib/database/database';
import Task from '@/models/Task';
import { notFound } from 'next/navigation';
import { GraduationCap, Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import mongoose from 'mongoose';

export const dynamic = "force-dynamic";

export default async function ExamDetailPage({ 
  params 
}: { 
  params: Promise<{ courseid: string; examId: string }> 
}) {
  const { courseid, examId } = await params;
  
  let examInfo: any = null;

  if (mongoose.Types.ObjectId.isValid(examId)) {
    await connectDB();
    examInfo = await Task.findOne({ _id: examId, type: 'quiz' }).lean();
  }

  if (!examInfo) {
    // Demo fallback si no existe en BD
    examInfo = {
      title: "Examen de Demostración",
      description: "Este es un examen de prueba. Por favor, lee atentamente cada pregunta antes de responder. Tienes 45 minutos para completar el cuestionario.",
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      maxPoints: 100
    };
  }

  return (
    <div className="min-h-screen bg-base-200/50 p-6 lg:p-12">
      <div className="max-w-4xl mx-auto">
        <Link 
          href={`/mycourses/${courseid}`} 
          className="btn btn-ghost btn-sm mb-6 flex items-center gap-2 w-fit text-base-content/70 hover:text-base-content"
        >
          <ArrowLeft size={16} />
          Volver al curso
        </Link>

        <div className="card bg-base-100 shadow-xl border border-base-300">
          <div className="card-body p-8 lg:p-12">
            <div className="flex items-start gap-6">
              <div className="p-4 rounded-2xl flex-shrink-0 bg-primary/10 text-primary hidden sm:flex">
                <GraduationCap size={40} />
              </div>
              
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl lg:text-4xl font-bold text-base-content tracking-tight mb-4">
                  {examInfo.title}
                </h1>
                
                <div className="flex items-center gap-4 text-base-content/70 flex-wrap mb-8">
                  <div className="flex items-center gap-2">
                    <Calendar size={18} />
                    <span>Fecha límite: <strong className="text-base-content">{new Date(examInfo.dueDate).toLocaleDateString()}</strong></span>
                  </div>
                  <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-yellow-100 text-yellow-800 border border-yellow-200 shadow-sm">
                    Puntaje: {examInfo.maxPoints || 100} pts
                  </div>
                </div>

                <div className="divider">Instrucciones</div>
                
                <div className="prose prose-base-content max-w-none mt-6">
                  {examInfo.description.split('\n').map((line: string, i: number) => (
                    <p key={i} className="text-lg leading-relaxed text-base-content/80">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {/* Simulación del Cuestionario interactivo (Client component dummy o estructura básica) */}
            <div className="mt-12 pt-8 border-t border-base-200">
              <h2 className="text-xl font-bold mb-6 text-base-content">Preguntas del Examen</h2>
              
              <div className="space-y-6">
                <div className="p-6 bg-base-200/50 rounded-2xl border border-base-300">
                  <span className="text-sm font-semibold text-primary">Pregunta 1</span>
                  <p className="font-medium text-lg mt-1 mb-4">¿Cuál es el propósito principal del ciclo de vida en componentes de React?</p>
                  <div className="flex flex-col gap-2">
                    <label className="label cursor-pointer justify-start gap-3 bg-base-100 p-3 rounded-lg border border-base-300 hover:bg-base-200">
                      <input type="radio" name="q1" className="radio radio-primary" />
                      <span className="label-text">Manejar efectos secundarios, suscripciones y renderizado de componentes en momentos específicos.</span>
                    </label>
                    <label className="label cursor-pointer justify-start gap-3 bg-base-100 p-3 rounded-lg border border-base-300 hover:bg-base-200">
                      <input type="radio" name="q1" className="radio radio-primary" />
                      <span className="label-text">Dar estilos CSS dinámicos de forma directa.</span>
                    </label>
                  </div>
                </div>

                <div className="p-6 bg-base-200/50 rounded-2xl border border-base-300">
                  <span className="text-sm font-semibold text-primary">Pregunta 2</span>
                  <p className="font-medium text-lg mt-1 mb-4">¿Qué es Next.js Server Components por defecto?</p>
                  <div className="flex flex-col gap-2">
                    <label className="label cursor-pointer justify-start gap-3 bg-base-100 p-3 rounded-lg border border-base-300 hover:bg-base-200">
                      <input type="radio" name="q2" className="radio radio-primary" />
                      <span className="label-text">Componentes que se renderizan exclusivamente en el servidor (RSC).</span>
                    </label>
                    <label className="label cursor-pointer justify-start gap-3 bg-base-100 p-3 rounded-lg border border-base-300 hover:bg-base-200">
                      <input type="radio" name="q2" className="radio radio-primary" />
                      <span className="label-text">Componentes que solo corren en el navegador mediante Javascript.</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-8">
                <button className="btn btn-primary btn-wide">
                  Enviar Respuestas
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
