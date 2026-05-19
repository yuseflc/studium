'use client';

import { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle, AlertCircle, Clock, FileText, Download, Send } from 'lucide-react';
import { CALIFICACIONES } from '@/seed/data';

// Map de estado de tarea a etiquetas e iconos.
const STATUS_CONFIG = new Map([
  ['graded', { text: 'Calificado', icon: 'check' }],
  ['pending', { text: 'Pendiente', icon: 'clock' }],
  ['late', { text: 'Entregado Tarde', icon: 'alert' }],
]);

// rendering-hoist-jsx: Componentes e iconos estáticos fuera del render
const StatusIconComponent = ({ status }: { status: string }) => {
  const iconType = STATUS_CONFIG.get(status)?.icon || 'file';

  switch (iconType) {
    case 'check':
      return <CheckCircle size={18} className="text-success" />;
    case 'clock':
      return <Clock size={18} className="text-warning" />;
    case 'alert':
      return <AlertCircle size={18} className="text-error" />;
    default:
      return <FileText size={18} className="text-base-content/60" />;
  }
};

const TaskDetailView = () => {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;

  // rerender-memo: Memoizar la búsqueda de tarea
  const task = useMemo(
    () => CALIFICACIONES.find(t => t.id === taskId),
    [taskId]
  );

  // js-cache-property-access: Cachear propiedades para evitar accesos repetidos
  const memoizedTask = useMemo(
    () => task ? {
      id: task.id,
      title: task.taskTitle,
      category: task.category,
      status: task.status,
      score: task.score,
      maxScore: task.maxScore,
      feedback: task.feedback,
      avatar: task.avatar,
      studentName: task.studentName,
      submittedDate: new Date(task.submittedAt).toLocaleDateString(),
      studentFirstName: task.studentName.split(' ')[0],
    } : null,
    [task]
  );

  if (!task || !memoizedTask) {
    return (
      <div className="p-6">
        <button
          onClick={() => router.back()}
          className="btn btn-ghost btn-sm gap-2 mb-4"
          aria-label="Volver a la vista anterior"
        >
          <ArrowLeft size={18} />
          Volver
        </button>
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body text-center">
            <p className="text-base-content/60">Tarea no encontrada</p>
          </div>
        </div>
      </div>
    );
  }

  const statusLabel = STATUS_CONFIG.get(memoizedTask.status) || { text: 'No evaluado', icon: 'file' };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-8">
      {/* Botón de retroceso */}
      <button
        onClick={() => router.back()}
        className="btn btn-ghost btn-sm gap-2 opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Volver a la vista anterior"
      >
        <ArrowLeft size={18} />
        Volver
      </button>

      {/* Contenedor Único Simplificado */}
      <div className="space-y-10">
        {/* Título y Calificación */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-8">
          <div className="space-y-6 flex-1">
            <div className="flex items-center gap-2">
              <StatusIconComponent status={memoizedTask.status} />
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                memoizedTask.status === 'graded' ? 'bg-success/5 border-success/20 text-success' : 
                memoizedTask.status === 'pending' ? 'bg-warning/5 border-warning/20 text-warning' : 
                'bg-base-300 border-base-400 text-base-content/50'
              }`}>
                {statusLabel.text}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-base-content/40">
                {memoizedTask.category}
              </span>
            </div>
            
            <h1 className="text-4xl font-semibold tracking-tight text-base-content">
              {memoizedTask.title}
            </h1>

            <div className="flex items-center gap-6 text-sm text-base-content/60">
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>Entrega: {memoizedTask.submittedDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText size={16} />
                <span>PDF, DOCX (Máx. 10MB)</span>
              </div>
            </div>
          </div>

          {memoizedTask.status === 'graded' && (
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold uppercase tracking-wider text-base-content/30 mb-1">Calificación</span>
              <div className="flex items-baseline gap-1">
                <span className={`text-6xl font-light ${memoizedTask.score >= 5 ? 'text-success' : 'text-error'}`}>
                  {memoizedTask.score}
                </span>
                <span className="text-xl font-medium text-base-content/20">/ {memoizedTask.maxScore}</span>
              </div>
            </div>
          )}
        </div>

        {/* Ejemplo de tarea a entregar / Descripción */}
        <div className="space-y-8">
          <div className="prose prose-slate max-w-none">
            <h3 className="text-lg font-medium text-base-content">Instrucciones del ejercicio</h3>
            <p className="text-base-content/70 leading-relaxed">
              Para esta entrega, debes desarrollar un análisis detallado sobre los componentes del sistema estudiados en la Unidad 3. 
              Asegúrate de incluir diagramas de flujo y una breve conclusión sobre la eficiencia del modelo propuesto.
            </p>
            <ul className="text-sm text-base-content/60 space-y-1 list-disc pl-4">
              <li>Formato de entrega: PDF o enlace a repositorio.</li>
              <li>Fecha límite: 25 de mayo de 2026, 23:59h.</li>
              <li>Criterios: Claridad (40%), Estructura (30%), Innovación (30%).</li>
            </ul>
          </div>

          {/* Área de Entrega */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-base-content/30">Tu entrega</h3>
            
            {/* rendering-conditional-render: Ternario en lugar de && */}
            {memoizedTask.status === 'pending' ? (
              <div className="border-2 border-dashed border-base-300 rounded-xl p-12 flex flex-col items-center justify-center bg-base-200/30 hover:bg-base-200/50 transition-colors cursor-pointer group">
                <div className="w-12 h-12 rounded-full bg-base-100 flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                  <Send size={20} className="text-primary" />
                </div>
                <p className="text-sm font-medium text-base-content">Haz clic para subir o arrastra tu archivo</p>
                <p className="text-xs text-base-content/40 mt-1">Solo archivos permitidos (.pdf, .zip, .docx)</p>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-base-200/50 border border-base-300 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-success/10 flex items-center justify-center text-success">
                    <CheckCircle size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Trabajo_Final_V1.pdf</p>
                    <p className="text-xs text-base-content/40">Subido el {memoizedTask.submittedDate}</p>
                  </div>
                </div>
                <button className="btn btn-ghost btn-sm text-primary">Ver entrega</button>
              </div>
            )}
          </div>
        </div>

        {/* Recursos Adicionales */}
        <div className="pt-8 border-t border-base-300">
          <h3 className="text-sm font-bold uppercase tracking-widest text-base-content/30 mb-4">Recursos de apoyo</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a 
              href="#" 
              className="flex items-center gap-3 p-3 rounded-lg border border-base-300 hover:border-primary/50 hover:bg-primary/5 transition-all"
              aria-label="Descargar Guía de Estilo APA"
            >
              <Download size={18} className="text-base-content/40 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Guía_Estilo_APA.pdf</p>
                <p className="text-[10px] text-base-content/40 uppercase">1.2 MB</p>
              </div>
            </a>
            <a 
              href="#" 
              className="flex items-center gap-3 p-3 rounded-lg border border-base-300 hover:border-primary/50 hover:bg-primary/5 transition-all"
              aria-label="Descargar Plantilla de Entrega"
            >
              <Download size={18} className="text-base-content/40 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Plantilla_Entrega.docx</p>
                <p className="text-[10px] text-base-content/40 uppercase">450 KB</p>
              </div>
            </a>
          </div>
        </div>

        {/* Sección de Comentarios */}
        {(memoizedTask.status === 'graded' && memoizedTask.feedback) && (
          <div className="pt-8 border-t border-base-300 space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-base-content/30">Retroalimentación</h3>
            <div className="flex gap-4">
              <img 
                src={memoizedTask.avatar} 
                alt={`Avatar del profesor`} 
                className="w-10 h-10 rounded-full grayscale opacity-80 flex-shrink-0" 
              />
              <div className="flex-1 bg-base-200/50 p-5 rounded-2xl rounded-tl-none relative">
                <div className="absolute top-0 -left-2 w-0 h-0 border-t-[10px] border-t-transparent border-r-[10px] border-r-base-200/50 border-b-[10px] border-b-transparent"></div>
                <p className="text-sm text-base-content/80 leading-relaxed font-serif italic">
                  "{memoizedTask.feedback}"
                </p>
                <p className="text-[10px] font-bold uppercase tracking-tighter text-base-content/30 mt-4">
                  Revisado por Prof. {memoizedTask.studentFirstName} • Hace 2 días
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDetailView;
