"use client";

import { useState } from 'react';
import { ClipboardList, Calendar, ArrowLeft, Upload, Loader2, CheckCircle2, Pencil, Trash2, FileText } from 'lucide-react';
import Link from 'next/link';
import { submitTask, deleteSubmission } from '@/app/actions/taskActions';

interface TaskDetailClientProps {
  taskInfo: {
    _id?: string;
    title: string;
    description: string;
    dueDate: Date;
    maxPoints?: number;
    image?: string;
    priority?: string;
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

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que quieres borrar tu entrega?')) return;
    
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await deleteSubmission(taskInfo._id || '');

      if (result.success) {
        setIsSubmitted(false);
        setSubmissionText('');
        setSelectedFile(null);
      } else {
        setError(result.error || 'Error al borrar la entrega');
      }
    } catch (err) {
      setError('Ocurrió un error inesperado');
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
                        <Upload size={24} />
                      </div>
                      <h2 className="card-title text-xl font-bold text-base-content">
                        Tu Entrega
                      </h2>
                    </div>

                    <div className="divider my-0"></div>

                    {/* Contenido compacto con instrucciones y controles */}
                    <div className="mt-4 space-y-4">
                      {/* Sección de Archivo */}
                      <div className="form-control w-full">
                        <label className="label py-1">
                          <span className="label-text font-semibold text-sm">
                            {isSubmitted ? "Archivo Entregado" : "Adjuntar Archivo de Trabajo"}
                          </span>
                        </label>
                        
                        {isSubmitted ? (
                          <div className="flex flex-col gap-2">
                            {existingSubmission?.files && existingSubmission.files.length > 0 ? (
                              existingSubmission.files.map((file, idx) => {
                                // Extraer el nombre del archivo de la URL (después del timestamp)
                                const fileNameParts = file.split('-');
                                const fileName = fileNameParts.length > 2 
                                  ? fileNameParts.slice(2).join('-').split('?')[0] 
                                  : file.split('/').pop()?.split('?')[0] || `archivo_${idx + 1}`;
                                
                                return (
                                  <a 
                                    key={idx} 
                                    href={file} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center w-full p-3 rounded-lg border border-base-300 bg-base-100 transition-all gap-3 shadow-sm cursor-pointer"
                                  >
                                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                      <FileText size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-base-content truncate">
                                        {decodeURIComponent(fileName)}
                                      </p>
                                      <p className="text-[10px] text-base-content/50 uppercase font-bold tracking-wider">
                                        Archivo guardado
                                      </p>
                                    </div>
                                  </a>
                                );
                              })
                            ) : (
                              <div className="flex items-center w-full p-4 rounded-lg border border-dashed border-base-300 bg-base-200/50 justify-center text-sm italic text-base-content/40">
                                Sin archivo adjunto
                              </div>
                            )}
                          </div>
                        ) : (
                          <>
                            <input
                              type="file"
                              name="file"
                              className="file-input file-input-bordered file-input-primary w-full text-sm bg-base-100 text-base-content"
                              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                              disabled={isSubmitting}
                            />
                            {selectedFile && (
                              <span className="text-xs text-success font-medium mt-1.5 block truncate">
                                Archivo seleccionado: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                              </span>
                            )}
                          </>
                        )}
                      </div>

                      {/* Textarea para la respuesta escrita */}
                      <div className="form-control w-full">
                        <label className="label py-1 flex justify-between">
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

                      {error && (
                        <div className="alert alert-error text-xs p-2 rounded-lg">
                          <span>{error}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pie del formulario con botones de acción */}
                  <div className="pt-4 border-t border-base-300 mt-4 flex gap-3 flex-shrink-0">
                    {isSubmitted ? (
                      <>
                        <button
                          type="button"
                          onClick={handleDelete}
                          disabled={isSubmitting}
                          className="btn btn-outline btn-error flex-1 gap-2"
                        >
                          {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                          <span>Borrar Entrega</span>
                        </button>
                        
                        <button
                          type="submit"
                          disabled={isSubmitting || (!submissionText.trim() && !selectedFile)}
                          className="btn btn-primary flex-1 hover:bg-primary/95 transition-all duration-200 gap-2"
                        >
                          {isSubmitting ? (
                            <><Loader2 size={18} className="animate-spin" /> Guardando...</>
                          ) : (
                            <><Pencil size={18} /> Editar Entrega</>
                          )}
                        </button>
                      </>
                    ) : (
                      <button
                        type="submit"
                        disabled={isSubmitting || (!submissionText.trim() && !selectedFile)}
                        className="btn btn-primary w-full hover:bg-primary/95 transition-all duration-200 gap-2"
                      >
                        {isSubmitting ? (
                          <><Loader2 size={18} className="animate-spin" /> Entregando...</>
                        ) : (
                          <><Upload size={18} /> Entregar Tarea</>
                        )}
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
