"use client";

import { useState } from 'react';
import { ClipboardList, Calendar, ArrowLeft, Upload, Loader2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { submitTask } from '@/app/actions/taskActions';

interface TaskDetailClientProps {
  taskInfo: {
    _id?: string;
    title: string;
    description: string;
    dueDate: Date;
    maxPoints?: number;
  };
  courseid: string;
  existingSubmission?: {
    content: string;
    files: string[];
    submittedAt: Date;
  };
}

/**
 * TaskDetailClient
 * Componente cliente que muestra los detalles de una tarea y permite al alumno
 * realizar una entrega (texto + archivo). Está diseñado como una vista dividida
 * con la descripción a la izquierda (scroll independiente) y el panel de
 * entrega a la derecha.
 *
*/
export default function TaskDetailClient({ taskInfo, courseid, existingSubmission }: TaskDetailClientProps) {
  // Estado local del componente
  const [submissionText, setSubmissionText] = useState(existingSubmission?.content || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(!!existingSubmission);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const form = e.currentTarget as HTMLFormElement;
      const formData = new FormData(form);
      
      // Aseguramos que el taskId esté presente
      formData.set('taskId', taskInfo._id || '');
      // El content y file ya deberían estar por los nombres de los inputs 'name="content"' y 'name="file"'

      const result = await submitTask(formData);

      if (result.success) {
        setIsSubmitted(true);
      } else {
        setError(result.error || 'Error al entregar la tarea');
      }
    } catch (err) {
      setError('Ocurrió un error inesperado');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-64px)] bg-base-200/40 p-4 sm:p-6 lg:h-[calc(100vh-64px)] lg:overflow-hidden">
      <div className="w-full max-w-6xl mx-auto flex flex-col h-full min-h-0 gap-0">
        {/* Barra superior con metadatos de la tarea y navegación */}
        <div className="w-full flex-shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-base-300">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Link de regreso al curso */}
            <Link
              href={`/mycourses/${courseid}`}
              className="btn btn-ghost btn-sm flex items-center gap-2 text-base-content/70 hover:text-base-content hover:bg-base-200"
            >
              <ArrowLeft size={16} />
              <span>Volver al curso</span>
            </Link>
            <div className="divider divider-horizontal my-1 hidden sm:flex"></div>

            {/* Badge: por ahora mostramos siempre "Pendiente".
                Nota: la funcionalidad de marcar/recuperar el estado real
                (entregado / pendiente) no está implementada y se hará
                en el futuro cuando se integre con el backend. */}
            <div className="flex items-center gap-2 flex-wrap">
              {isSubmitted ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-success/10 text-success border border-success/20 shadow-sm">
                  <CheckCircle2 size={12} /> Entregado
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-warning/10 text-warning border border-warning/20 shadow-sm">
                  <Upload size={12} /> Pendiente
                </span>
              )}
            </div>
          </div>

          {/* Fecha de entrega (formateada localmente) */}
          <div className="flex items-center gap-4 text-sm text-base-content/70 flex-wrap">
            <div className="flex items-center gap-1.5 font-medium">
              <Calendar size={16} className="text-primary" />
              <span>Entrega: <strong className="text-base-content">{new Date(taskInfo.dueDate).toLocaleDateString()} a las 23:59</strong></span>
            </div>
          </div>
        </div>

        {/* Vista principal dividida: izquierda -> descripción (scrollable), derecha -> panel de entrega */}
        <div className="w-full flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          {/* Izquierda: descripción de la tarea. Esta columna está pensada para poder scrollear
              independientemente del panel de entrega. */}
          <div className="lg:col-span-7 flex flex-col min-h-0 h-full">
            <div className="card bg-base-100 shadow-md border border-base-300 h-full flex flex-col overflow-hidden">
              <div className="card-body p-5 sm:p-6 flex flex-col min-h-0 h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-full bg-primary/10 text-primary border border-primary/20 shadow-sm">
                    <ClipboardList size={24} />
                  </div>
                  <h2 className="card-title text-2xl font-bold text-base-content break-words">{taskInfo.title}</h2>
                </div>

                <div className="divider my-0"></div>

                {/* Contenedor scrollable para las instrucciones; solo este bloque debe hacer scroll */}
                <div className="flex-1 overflow-y-auto pr-2 mt-4 space-y-4 min-h-0">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/50">Instrucciones de la tarea</h3>
                  <div className="prose prose-base-content max-w-none">
                    {taskInfo.description.split('\n').map((line, i) => (
                      <p key={i} className="text-base leading-relaxed text-base-content/85 whitespace-pre-wrap">
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Derecha: panel de entrega. No debe hacer scroll en escritorio; contiene el formulario
              de entrega cuando está pendiente y el resumen cuando ya se entregó. */}
          <div className="lg:col-span-5 flex flex-col min-h-0 h-full">
            <div className="card bg-base-100 shadow-md border border-base-300 h-full flex flex-col overflow-hidden">
              <div className="card-body p-5 sm:p-6 flex flex-col justify-between h-full min-h-0">
                {/* Formulario de entrega: textarea + input file */}
                <form onSubmit={handleSubmit} className="flex flex-col h-full justify-between min-h-0">
                  <div className="flex flex-col min-h-0">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                        {isSubmitted ? <CheckCircle2 size={24} className="text-success" /> : <Upload size={24} />}
                      </div>
                      <h2 className="card-title text-xl font-bold text-base-content">
                        {isSubmitted ? "Tarea Entregada" : "Tu Entrega"}
                      </h2>
                    </div>

                    <div className="divider my-0"></div>

                    {/* Contenido compacto con instrucciones y controles */}
                    <div className="mt-4 space-y-4">
                      {isSubmitted ? (
                        <div className="bg-success/5 border border-success/20 rounded-xl p-4 space-y-3">
                          <p className="text-sm text-success font-medium flex items-center gap-2">
                            <CheckCircle2 size={16} /> ¡Tu tarea ha sido enviada con éxito!
                          </p>
                          <div className="text-sm text-base-content/70 italic">
                            "{submissionText}"
                          </div>
                          {existingSubmission?.files && existingSubmission.files.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {existingSubmission.files.map((file, idx) => (
                                <a 
                                  key={idx} 
                                  href={file} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="btn btn-xs btn-outline btn-success"
                                >
                                  Ver archivo {idx + 1}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          <p className="text-sm text-base-content/70">
                            Escribe tu respuesta a continuación y adjunta cualquier documento necesario para completar la tarea.
                          </p>

                          {/* Textarea para la respuesta escrita */}
                          <div className="form-control w-full">
                            <label className="label py-1">
                              <span className="label-text font-semibold text-sm">Respuesta Escrita</span>
                            </label>
                            <textarea
                              placeholder="Escribe aquí tu respuesta o comentarios para el profesor..."
                              className="textarea textarea-bordered w-full border border-base-300 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary bg-base-100 text-sm resize-none h-48"
                              value={submissionText}
                              onChange={(e) => setSubmissionText(e.target.value)}
                              disabled={isSubmitting}
                            />
                          </div>

                          {/* Input para adjuntar archivo; se muestra el nombre y tamaño si existe */}
                          <div className="form-control w-full">
                            <label className="label py-1">
                              <span className="label-text font-semibold text-sm">Adjuntar Archivo de Trabajo</span>
                            </label>
                            <input
                              type="file"
                              name="file"
                              className="file-input file-input-bordered file-input-primary w-full text-sm bg-base-100"
                              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                              disabled={isSubmitting}
                            />
                            {selectedFile && (
                              <span className="text-xs text-success font-medium mt-1.5 block truncate">
                                Archivo: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                              </span>
                            )}
                          </div>
                        </>
                      )}

                      {error && (
                        <div className="alert alert-error text-xs p-2 rounded-lg">
                          <span>{error}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pie del formulario con botón de envío */}
                  {!isSubmitted && (
                    <div className="pt-4 border-t border-base-300 mt-4 flex justify-end flex-shrink-0">
                      <button
                        type="submit"
                        disabled={isSubmitting || (!submissionText.trim() && !selectedFile)}
                        className="btn btn-primary w-full hover:bg-primary/95 transition-all duration-200"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 size={18} className="animate-spin mr-2" />
                            Entregando...
                          </>
                        ) : (
                          'Entregar Tarea'
                        )}
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
