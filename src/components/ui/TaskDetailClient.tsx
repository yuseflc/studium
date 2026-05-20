"use client";

import { useState } from 'react';
import { ClipboardList, Calendar, ArrowLeft, CheckCircle, Upload, FileText, AlertCircle, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface TaskDetailClientProps {
  taskInfo: {
    _id?: string;
    title: string;
    description: string;
    dueDate: Date;
    maxPoints?: number;
  };
  slug: string;
}

export default function TaskDetailClient({ taskInfo, slug }: TaskDetailClientProps) {
  const [status, setStatus] = useState<'pending' | 'submitted'>('pending');
  const [submissionText, setSubmissionText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedAt, setSubmittedAt] = useState<Date | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionText.trim() && !selectedFile) {
      alert('Por favor escribe una respuesta o adjunta un archivo.');
      return;
    }

    setIsSubmitting(true);

    // Simular retraso de envío de red para realismo
    setTimeout(() => {
      setIsSubmitting(false);
      setStatus('submitted');
      setSubmittedAt(new Date());
    }, 1200);
  };

  const handleCancelSubmission = () => {
    if (confirm('¿Estás seguro de que quieres anular esta entrega? Se borrarán tus archivos enviados.')) {
      setStatus('pending');
      setSubmissionText('');
      setSelectedFile(null);
      setSubmittedAt(null);
    }
  };

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
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className="badge badge-accent badge-outline uppercase font-semibold">Tarea</span>
                  {status === 'submitted' ? (
                    <span className="badge badge-success text-white font-semibold flex items-center gap-1">
                      <CheckCircle size={12} /> Entregado
                    </span>
                  ) : (
                    <span className="badge badge-warning text-white font-semibold flex items-center gap-1">
                      <AlertCircle size={12} /> Pendiente
                    </span>
                  )}
                </div>

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
                  {taskInfo.description.split('\n').map((line, i) => (
                    <p key={i} className="text-lg leading-relaxed text-base-content/80">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {/* Panel de Entregas */}
            <div className="mt-12 pt-8 border-t border-base-200">
              {status === 'pending' ? (
                <form onSubmit={handleSubmit} className="space-y-6 bg-base-200/50 p-6 rounded-2xl border border-base-300">
                  <h3 className="font-bold text-xl text-base-content flex items-center gap-2">
                    <Upload size={20} className="text-primary" />
                    Enviar Entrega
                  </h3>
                  <p className="text-sm text-base-content/60">
                    Escribe tu respuesta a continuación y adjunta cualquier documento necesario para completar la tarea.
                  </p>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-bold">Respuesta Escrita</span>
                    </label>
                    <textarea 
                      placeholder="Escribe aquí tu respuesta o comentarios para el profesor..."
                      className="textarea w-full border border-base-300 focus:border-base-content/30 focus:outline-none focus:ring-2 focus:ring-base-content/5 bg-base-100"
                      rows={5}
                      value={submissionText}
                      onChange={(e) => setSubmissionText(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-bold">Adjuntar Archivo de Trabajo</span>
                    </label>
                    <input 
                      type="file"
                      className="file-input w-full border border-base-300 focus:border-base-content/30 focus:outline-none focus:ring-2 focus:ring-base-content/5 bg-base-100"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      disabled={isSubmitting}
                    />
                    {selectedFile && (
                      <span className="text-xs text-base-content/60 mt-1 block truncate">
                        Archivo seleccionado: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                      </span>
                    )}
                  </div>

                  <div className="flex justify-end pt-4">
                    <button 
                      type="submit" 
                      className="btn btn-primary btn-wide hover:bg-primary/90 focus:bg-primary focus:border-primary active:bg-primary active:border-primary focus:outline-none"
                      disabled={isSubmitting || (!submissionText.trim() && !selectedFile)}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="loading loading-spinner loading-sm"></span>
                          Enviando entrega...
                        </>
                      ) : 'Enviar Entrega'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="bg-success/5 border border-success/20 p-8 rounded-2xl space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-success/10 text-success rounded-full">
                      <CheckCircle size={28} />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-base-content">¡Tarea entregada con éxito!</h3>
                      <p className="text-sm text-base-content/60 mt-1">
                        Entregado el {submittedAt?.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="bg-base-100 p-6 rounded-xl border border-base-200 space-y-4">
                    {submissionText && (
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-base-content/50 mb-1">Tu Respuesta</h4>
                        <p className="text-base-content/85 whitespace-pre-line leading-relaxed">{submissionText}</p>
                      </div>
                    )}

                    {selectedFile && (
                      <div className={submissionText ? 'pt-4 border-t border-base-200' : ''}>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-base-content/50 mb-2">Archivo Adjunto</h4>
                        <div className="flex items-center gap-3 p-3 bg-base-200/50 rounded-lg border border-base-300 w-fit">
                          <FileText size={20} className="text-primary" />
                          <span className="font-medium text-sm text-base-content">{selectedFile.name}</span>
                          <span className="text-xs text-base-content/55">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-success/10">
                    <span className="text-xs text-success font-medium flex items-center gap-1.5">
                      <CheckCircle size={14} /> Tu entrega está guardada y lista para calificación.
                    </span>
                    <button 
                      type="button" 
                      onClick={handleCancelSubmission}
                      className="btn btn-ghost btn-sm text-error hover:bg-error/10 flex items-center gap-2"
                    >
                      <Trash2 size={16} />
                      Anular Entrega
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
