"use client";

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ClipboardList, Calendar, ArrowLeft, Upload, CheckCircle2, Pencil, FileText, Users, Edit3, Loader2, Trash2, ChevronLeft, ChevronRight, Save, MessageSquareText, Clock3, BadgeInfo, Files } from 'lucide-react';
import Link from 'next/link';
import HoldConfirmButton from '@/components/ui/HoldConfirmButton';
import { Modal } from '@/components/ui/modals/Modal';
import { submitTask, deleteSubmission, deleteTask } from '@/app/actions/taskActions';
import { saveStudentTaskGrade } from '@/app/actions/participantActions';
import { TASK_SUBMISSION_MAX_FILE_SIZE_BYTES, TASK_SUBMISSION_MAX_FILE_SIZE_LABEL } from '@/lib/upload-limits';

interface TeacherSubmissionView {
  _id: string;
  taskId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentAvatar?: string;
  content: string;
  files: string[];
  grade?: number;
  feedback?: string;
  submissionStatus: string;
  submittedAt?: string;
  gradedAt?: string;
}

interface TaskDetailClientProps {
  taskInfo: {
    _id?: string;
    title: string;
    description: string;
    instructions?: string;
    dueDate?: string | Date | null;
    maxPoints?: number;
    image?: string;
    priority?: string;
    isOptional?: boolean;
    allowLateSubmission?: boolean;
  };
  courseid: string;
  isTeacherView?: boolean;
  deliveredCount?: number;
  totalStudents?: number;
  editTaskHref?: string;
  teacherSubmissions?: TeacherSubmissionView[];
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
export default function TaskDetailClient({ taskInfo, courseid, isTeacherView = false, deliveredCount = 0, totalStudents = 0, editTaskHref, teacherSubmissions = [], existingSubmission }: TaskDetailClientProps) {
  const router = useRouter();
  // Estado local del componente
  const [submissionText, setSubmissionText] = useState(existingSubmission?.content || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(!!existingSubmission);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeletingTask, setIsDeletingTask] = useState(false);
  const [taskDeleteError, setTaskDeleteError] = useState<string | null>(null);
  const [reviewMode, setReviewMode] = useState(false);
  const [reviewSubmissions, setReviewSubmissions] = useState<TeacherSubmissionView[]>(teacherSubmissions);
  const [activeSubmissionIndex, setActiveSubmissionIndex] = useState(0);
  const [reviewGrade, setReviewGrade] = useState('');
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [isReviewSaving, setIsReviewSaving] = useState(false);
  const [reviewMessage, setReviewMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!isTeacherView) {
      setReviewMode(false);
      return;
    }

    setReviewSubmissions(teacherSubmissions);
  }, [isTeacherView, teacherSubmissions]);

  useEffect(() => {
    if (!reviewSubmissions.length) {
      setActiveSubmissionIndex(0);
      setReviewGrade('');
      setReviewFeedback('');
      return;
    }

    if (activeSubmissionIndex >= reviewSubmissions.length) {
      setActiveSubmissionIndex(reviewSubmissions.length - 1);
    }
  }, [activeSubmissionIndex, reviewSubmissions.length]);

  const activeSubmission = useMemo<TeacherSubmissionView | null>(
    () => reviewSubmissions[activeSubmissionIndex] || null,
    [reviewSubmissions, activeSubmissionIndex]
  );

  useEffect(() => {
    if (!activeSubmission) {
      setReviewGrade('');
      setReviewFeedback('');
      return;
    }

    setReviewGrade(activeSubmission.grade !== undefined && activeSubmission.grade !== null ? String(activeSubmission.grade) : '');
    setReviewFeedback(activeSubmission.feedback || '');
  }, [activeSubmission]);

  const hasDueDate = !!taskInfo.dueDate;
  const hasFlexibleDeadline = !!taskInfo.isOptional || !!taskInfo.allowLateSubmission || !hasDueDate;
  const dueDateLabel = hasDueDate
    ? `${new Date(taskInfo.dueDate as string | Date).toLocaleDateString()} a las 23:59`
    : "Sin fecha de entrega";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const form = e.currentTarget as HTMLFormElement;
      const formData = new FormData(form);
      const file = selectedFile;

      if (file && file.size > TASK_SUBMISSION_MAX_FILE_SIZE_BYTES) {
        setError(`El archivo supera el límite de ${TASK_SUBMISSION_MAX_FILE_SIZE_LABEL}.`);
        return;
      }
      
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

  const handleDeleteTask = async () => {
    const currentTaskId = taskInfo._id;

    if (!currentTaskId) {
      setTaskDeleteError('No se pudo identificar la tarea.');
      return;
    }

    setIsDeletingTask(true);
    setTaskDeleteError(null);

    try {
      const result = await deleteTask(currentTaskId);

      if (!result.success) {
        setTaskDeleteError(result.error || 'Error al eliminar la tarea');
        return;
      }

      setIsDeleteModalOpen(false);
      router.push(`/mycourses/${courseid}`);
      router.refresh();
    } catch (err) {
      setTaskDeleteError(err instanceof Error ? err.message : 'Ocurrió un error inesperado');
    } finally {
      setIsDeletingTask(false);
    }
  };

  const handlePreviousSubmission = () => {
    if (!reviewSubmissions.length) return;
    setActiveSubmissionIndex((current) => (current - 1 + reviewSubmissions.length) % reviewSubmissions.length);
  };

  const handleNextSubmission = () => {
    if (!reviewSubmissions.length) return;
    setActiveSubmissionIndex((current) => (current + 1) % reviewSubmissions.length);
  };

  const handleSaveReview = async () => {
    if (!activeSubmission || !taskInfo._id) return;

    const parsedGrade = reviewGrade.trim() === '' ? 0 : Number(reviewGrade);

    if (Number.isNaN(parsedGrade) || parsedGrade < 0 || parsedGrade > 10) {
      setReviewMessage({ type: 'error', text: 'La nota debe estar entre 0 y 10.' });
      return;
    }

    setIsReviewSaving(true);
    setReviewMessage(null);

    try {
      const result = await saveStudentTaskGrade(taskInfo._id, activeSubmission.studentId, parsedGrade, reviewFeedback);

      if (!result.success) {
        setReviewMessage({ type: 'error', text: result.message || 'No se pudo guardar la revisión.' });
        return;
      }

      setReviewSubmissions((current) => current.map((submission) => (
        submission._id === activeSubmission._id
          ? {
              ...submission,
              grade: parsedGrade,
              feedback: reviewFeedback.trim(),
              gradedAt: new Date().toISOString(),
              submissionStatus: 'submitted',
            }
          : submission
      )));

      setReviewMessage({ type: 'success', text: 'Revisión guardada y sincronizada con calificaciones.' });
      router.refresh();
    } catch (error) {
      setReviewMessage({ type: 'error', text: error instanceof Error ? error.message : 'Error inesperado al guardar la revisión.' });
    } finally {
      setIsReviewSaving(false);
    }
  };

  const formatSubmissionDate = (value?: string) => {
    if (!value) return 'Sin fecha de entrega';
    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) return 'Sin fecha de entrega';
    return parsedDate.toLocaleString();
  };

  const leftColumnClass = isTeacherView && reviewMode ? 'lg:col-span-4' : 'lg:col-span-7';
  const rightColumnClass = isTeacherView && reviewMode ? 'lg:col-span-8 lg:self-start lg:h-fit' : 'lg:col-span-5';

  return (
    <div className="w-full min-h-[calc(100vh-64px)] bg-base-200/40 p-4 sm:p-6">
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
              <span>
                Entrega: <strong className="text-base-content">{dueDateLabel}</strong>
              </span>
            </div>
            {hasFlexibleDeadline ? (
              <span className="inline-flex items-center rounded-full border border-base-300 bg-base-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-base-content/60">
                {taskInfo.isOptional ? "Entrega opcional" : taskInfo.allowLateSubmission ? "Entrega tardía permitida" : "Sin plazo fijo"}
              </span>
            ) : null}
          </div>
        </div>

        {/* Vista principal dividida: izquierda -> contenido de la tarea, derecha -> panel de entrega */}
        <div className="w-full flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          {/* Izquierda: contenido de la tarea. Esta columna está pensada para poder scrollear
              independientemente del panel de entrega. */}
          <div className={`${leftColumnClass} flex flex-col min-h-0 h-full`}>
            <div className="card bg-base-100 shadow-md border border-base-300 h-full flex flex-col overflow-hidden">
              <div className="card-body p-5 sm:p-6 flex flex-col min-h-0 h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-full bg-primary/10 text-primary border border-primary/20 shadow-sm">
                    <ClipboardList size={24} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="card-title text-2xl font-bold text-base-content break-words">{taskInfo.title}</h2>
                    <p className="mt-1 text-sm leading-relaxed text-base-content/60 line-clamp-2 whitespace-pre-wrap break-words">
                      {taskInfo.description}
                    </p>
                  </div>
                </div>

                <div className="divider my-0"></div>

                {/* Contenedor scrollable para el contenido; solo este bloque debe hacer scroll */}
                <div className="flex-1 overflow-y-auto pr-2 mt-4 space-y-4 min-h-0">
                  <section className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/50">Instrucciones de la tarea</h3>
                    <div className="prose prose-base-content max-w-none">
                      {taskInfo.instructions ? (
                        taskInfo.instructions.split('\n').map((line, i) => (
                          <p key={i} className="text-base leading-relaxed text-base-content/85 whitespace-pre-wrap break-words break-all max-w-full">
                            {line}
                          </p>
                        ))
                      ) : (
                        <p className="text-base leading-relaxed text-base-content/55 italic">
                          Sin instrucciones adicionales.
                        </p>
                      )}
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </div>

          {/* Derecha: panel de entrega. No debe hacer scroll en escritorio; contiene el formulario
              de entrega cuando está pendiente y el resumen cuando ya se entregó. */}
          <div className={`${rightColumnClass} flex flex-col min-h-0 h-full`}>
            <div className="card bg-base-100 shadow-md border border-base-300 h-full flex flex-col overflow-hidden">
              <div className={`card-body p-5 sm:p-6 flex flex-col h-full min-h-0 ${isTeacherView && reviewMode ? 'justify-start gap-6' : 'justify-between'}`}>
                {isTeacherView ? (
                  reviewMode ? (
                    <div className="flex h-fit flex-col gap-4 pb-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                            <MessageSquareText size={24} />
                          </div>
                          <div>
                            <h2 className="card-title text-xl font-bold text-base-content">Revisión de entregas</h2>
                            <p className="text-sm text-base-content/60">
                              {reviewSubmissions.length > 0
                                ? `Entrega ${activeSubmissionIndex + 1} de ${reviewSubmissions.length}`
                                : 'Sin entregas para revisar'}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setReviewMode(false)}
                          className="btn btn-ghost btn-sm gap-2"
                        >
                          <ArrowLeft size={16} />
                          Volver
                        </button>
                      </div>

                      {reviewSubmissions.length > 0 && activeSubmission ? (
                        <div className="w-full rounded-3xl border border-base-300 bg-base-200/25 p-4 space-y-4">
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-lg font-bold text-base-content truncate">{activeSubmission.studentName}</h3>
                                <span className="badge badge-outline badge-sm">{activeSubmission.studentEmail || 'Sin email'}</span>
                              </div>
                              <p className="text-xs text-base-content/50">Vista individual sincronizada con calificaciones</p>
                            </div>

                            <div className="flex items-center gap-2">
                              <button type="button" className="btn btn-sm btn-circle btn-ghost" onClick={handlePreviousSubmission} disabled={reviewSubmissions.length <= 1} aria-label="Entrega anterior">
                                <ChevronLeft size={16} />
                              </button>
                              <button type="button" className="btn btn-sm btn-circle btn-ghost" onClick={handleNextSubmission} disabled={reviewSubmissions.length <= 1} aria-label="Entrega siguiente">
                                <ChevronRight size={16} />
                              </button>
                            </div>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-2xl border border-base-300 bg-base-100 p-4">
                              <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-base-content/40"><Clock3 size={12} /> Hora de entrega</p>
                              <p className="mt-2 text-sm font-semibold text-base-content">{formatSubmissionDate(activeSubmission.submittedAt)}</p>
                            </div>
                            <div className="rounded-2xl border border-base-300 bg-base-100 p-4">
                              <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-base-content/40"><BadgeInfo size={12} /> Estado / nota</p>
                              <p className="mt-2 text-sm font-semibold text-base-content">
                                {activeSubmission.grade !== undefined && activeSubmission.grade !== null ? `${activeSubmission.grade}/10` : 'Sin calificar'}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-base-content/40">
                              <Files size={12} /> Archivos entregados
                            </div>
                            {activeSubmission.files.length > 0 ? (
                              <div className="space-y-2">
                                {activeSubmission.files.map((file, index) => {
                                  const fileNameParts = file.split('-');
                                  const fileName = fileNameParts.length > 2
                                    ? fileNameParts.slice(2).join('-').split('?')[0]
                                    : file.split('/').pop()?.split('?')[0] || `archivo_${index + 1}`;

                                  return (
                                    <a
                                      key={file}
                                      href={file}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-3 rounded-xl border border-base-300 bg-base-100 px-3 py-2 transition-colors hover:border-primary/30"
                                    >
                                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                        <FileText size={18} />
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-base-content">{decodeURIComponent(fileName)}</p>
                                        <p className="text-[10px] uppercase tracking-wider text-base-content/40">Abrir archivo entregado</p>
                                      </div>
                                    </a>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="rounded-xl border border-dashed border-base-300 bg-base-100/80 px-4 py-6 text-center text-sm text-base-content/45">
                                Sin archivos adjuntos
                              </div>
                            )}
                          </div>

                          <div className="space-y-3">
                            <p className="text-xs font-bold uppercase tracking-[0.24em] text-base-content/40">Respuesta escrita del alumno</p>
                            <div className="rounded-2xl border border-base-300 bg-base-100 p-4 min-h-28 whitespace-pre-wrap text-sm leading-relaxed text-base-content/85">
                              {activeSubmission.content?.trim() ? activeSubmission.content : 'Sin respuesta escrita.'}
                            </div>
                          </div>

                          <div className="grid w-full gap-4 lg:grid-cols-2">
                            <label className="form-control w-full">
                              <span className="label-text font-semibold text-sm">Feedback del profesor</span>
                              <textarea
                                value={reviewFeedback}
                                onChange={(event) => setReviewFeedback(event.target.value)}
                                className="textarea textarea-bordered mt-2 min-h-36 w-full bg-base-100"
                                placeholder="Escribe la retroalimentación para esta entrega..."
                              />
                            </label>
                            <label className="form-control w-full max-w-40">
                              <span className="label-text font-semibold text-sm">Nota</span>
                              <input
                                type="number"
                                min="0"
                                max="10"
                                step="0.1"
                                value={reviewGrade}
                                onChange={(event) => setReviewGrade(event.target.value)}
                                className="input input-bordered mt-2 w-full bg-base-100 font-mono"
                                placeholder="0"
                              />
                            </label>
                          </div>

                          <div className="mt-auto border-t border-base-300 pt-4 space-y-3">
                            {reviewMessage ? (
                              <div className={`alert ${reviewMessage.type === 'success' ? 'alert-success' : 'alert-error'} text-sm`}>
                                <span>{reviewMessage.text}</span>
                              </div>
                            ) : null}

                            <button
                              type="button"
                              onClick={handleSaveReview}
                              disabled={isReviewSaving}
                              className="btn btn-primary w-full gap-2"
                            >
                              {isReviewSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                              Guardar revisión
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full rounded-3xl border border-dashed border-base-300 bg-base-200/20 p-6 flex items-center justify-center text-center text-sm text-base-content/50">
                          Aún no hay entregas para revisar.
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex h-full flex-col justify-between min-h-0 gap-6">
                      <div className="space-y-5">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                            <Users size={24} />
                          </div>
                          <div>
                            <h2 className="card-title text-xl font-bold text-base-content">Vista del profesor</h2>
                            <p className="text-sm text-base-content/60">No se muestra la sección de entrega.</p>
                          </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="rounded-2xl border border-base-300 bg-base-200/30 p-4">
                            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-base-content/40">Entregas recibidas</p>
                            <div className="mt-2 flex items-end gap-2">
                              <span className="text-4xl font-semibold text-base-content">{deliveredCount} <small className="text-base-content/50 text-xs">/ {totalStudents}</small></span>
                              <span className="pb-1 text-sm text-base-content/50">alumnos</span>
                            </div>
                          </div>

                          <div className="rounded-2xl border border-base-300 bg-base-200/30 p-4">
                            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-base-content/40">Configuración</p>
                            <p className="mt-2 text-sm font-medium text-base-content">
                              {taskInfo.isOptional
                                ? "Entrega opcional"
                                : taskInfo.allowLateSubmission
                                  ? "Acepta entregas tardías"
                                  : "Plazo cerrado"}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setReviewMode((current) => !current)}
                          className="btn btn-primary btn-block gap-2"
                          disabled={!reviewSubmissions.length}
                        >
                          <MessageSquareText size={16} />
                          {reviewMode ? 'Ocultar revisión' : 'Revisar entregas'}
                        </button>
                      </div>

                      <div className="space-y-3">
                        {editTaskHref ? (
                          <div className="space-y-3">
                            <Link href={editTaskHref} className="btn btn-primary btn-block gap-2 shadow-lg">
                              <Edit3 size={16} />
                              Editar tarea
                            </Link>
                            <button
                              type="button"
                              onClick={() => setIsDeleteModalOpen(true)}
                              className="btn btn-outline btn-error btn-block gap-2"
                            >
                              <Trash2 size={16} />
                              Eliminar tarea
                            </button>
                          </div>
                        ) : null}
                        <p className="text-center text-xs text-base-content/50">
                          Si quieres modificar título, fecha, puntos o activación, abre el editor del curso.
                        </p>
                      </div>
                    </div>
                  )
                ) : (
                  <form onSubmit={handleSubmit} className="flex flex-col h-full justify-between min-h-0">
                    <div className="flex flex-col min-h-0">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                          <Upload size={24} />
                        </div>
                        <h2 className="card-title text-xl font-bold text-base-content">Tu Entrega</h2>
                      </div>

                      <div className="divider my-0"></div>

                      <div className="mt-4 space-y-4">
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
                                  Archivo seleccionado: {selectedFile.name} ({selectedFile.size >= 1024 * 1024 ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB` : `${(selectedFile.size / 1024).toFixed(1)} KB`})
                                </span>
                              )}
                              <p className="text-[11px] text-base-content/45 mt-1">
                                Límite por entrega: {TASK_SUBMISSION_MAX_FILE_SIZE_LABEL}
                              </p>
                            </>
                          )}
                        </div>

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
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          if (!isDeletingTask) {
            setIsDeleteModalOpen(false);
            setTaskDeleteError(null);
          }
        }}
        className="max-w-xl border border-error/20"
      >
        <h3 className="font-bold text-lg text-error">Eliminar tarea</h3>
        <p className="py-4 text-base-content/80">
          Esta acción es irreversible. Se eliminará la tarea y también se retirará de la unidad correspondiente.
        </p>
        {taskDeleteError ? (
          <div className="alert alert-error mb-4 text-sm">
            <span>{taskDeleteError}</span>
          </div>
        ) : null}
        <div className="modal-action">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              if (!isDeletingTask) {
                setIsDeleteModalOpen(false);
                setTaskDeleteError(null);
              }
            }}
            disabled={isDeletingTask}
          >
            Cancelar
          </button>
          <HoldConfirmButton
            className="btn btn-error text-white"
            onConfirm={handleDeleteTask}
            disabled={isDeletingTask || !taskInfo._id}
            holdText="Suelta para eliminar"
          >
            {isDeletingTask ? 'Eliminando...' : 'Eliminar tarea'}
          </HoldConfirmButton>
        </div>
      </Modal>
    </div>
  );
}
