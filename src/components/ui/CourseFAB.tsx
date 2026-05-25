import { ClipboardList, GraduationCap, FileText, Plus, CheckCircle, Upload, X } from 'lucide-react';
import { useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ModalForm } from './modals';
import { createTask } from '@/app/actions/taskActions';
import { createResource } from '@/app/actions/resourceActions';
import { createSubject } from '@/app/actions/courseActions';

interface CourseFABProps {
  onAddTask: (task: any) => void;
  onAddSubject?: (subject: any) => void;
  onAddResource?: (resource: any) => void;
  courseId?: string;
  defaultSubjectId?: string;
  subjects?: any[];
}

type CreationType = 'task' | 'exam' | 'resource' | 'subject' | null;

export default function CourseFAB({ onAddTask, onAddSubject, onAddResource, courseId, defaultSubjectId, subjects = [] }: CourseFABProps) {
  const router = useRouter();
  const params = useParams();
  const courseid = params?.courseid || 'course-1';

  const modalRef = useRef<HTMLDialogElement>(null);
  
  // Flow states
  const [creationType, setCreationType] = useState<CreationType>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdItemId, setCreatedItemId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState(defaultSubjectId || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isOpenSubjectDropdown, setIsOpenSubjectDropdown] = useState(false);
  
  const handleOpenModal = (type: CreationType) => {
    // Resetear estados al abrir
    setCreationType(type);
    setTitle('');
    setDescription('');
    setDueDate('');
    setSelectedSubjectId(defaultSubjectId || '');
    setSelectedFile(null);
    setIsOpenSubjectDropdown(false);
    setIsSubmitting(false);
    setIsSuccess(false);
    setCreatedItemId(null);
    setErrorMessage(null);

    if (modalRef.current) {
      modalRef.current.showModal();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (creationType !== 'subject' && !selectedSubjectId) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const isTaskCreation = creationType === 'task';
      const isExamCreation = creationType === 'exam';

      if (isTaskCreation || isExamCreation) {
        const result = await createTask({
          title,
          description,
          courseId: courseId || '',
          subjectId: selectedSubjectId,
          dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
          startDate: new Date().toISOString(),
          type: isExamCreation ? 'quiz' : 'assignment',
          maxPoints: 100,
          allowLateSubmission: false,
          active: true,
        });

        if (!result.success) {
          throw new Error(result.error || 'Error al guardar');
        }

        const createdItem = { task: result.task };

        if (isTaskCreation) {
          router.refresh();
        }

        setIsSubmitting(false);
        setIsSuccess(true);

        const itemId = createdItem.task?._id;
        setCreatedItemId(itemId || null);

        return;
      }

      if (creationType === 'subject') {
        const result = await createSubject({
          courseId: courseId || '',
          title,
          description,
        });

        if (!result.success) {
          throw new Error(result.error || 'Error al guardar');
        }

        if (onAddSubject && result.subject) {
          onAddSubject(result.subject);
        }

        setIsSubmitting(false);
        setIsSuccess(true);
        setCreatedItemId(result.subject?._id || null);
        return;
      }

      if (creationType === 'resource' && selectedFile) {
        const result = await createResource({
          title,
          description,
          courseId: courseId || '',
          subjectId: selectedSubjectId,
          fileName: selectedFile.name,
        });

        if (!result.success) {
          throw new Error(result.error || 'Error al guardar');
        }

        const createdItem = { resource: result.resource };

        if (onAddResource && createdItem.resource) {
          onAddResource(createdItem.resource);
        }

        setIsSubmitting(false);
        setIsSuccess(true);

        setCreatedItemId(createdItem.resource?._id || null);
        return;
      }

      throw new Error('Tipo de creación no soportado');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al guardar';
      setErrorMessage(message);
      setIsSubmitting(false);
      // Aquí se podría mostrar un toast de error
    }
  };

  const handleRedirect = () => {
    if (createdItemId) {
      if (modalRef.current) modalRef.current.close();
      if (creationType === 'task') {
        router.push(`/mycourses/${courseid}/tasks/${createdItemId}`);
      } else if (creationType === 'exam') {
        router.push(`/mycourses/${courseid}/exams/${createdItemId}`);
      } else if (creationType === 'resource') {
        router.push(`/mycourses/${courseid}/resources/${createdItemId}`);
      } else if (creationType === 'subject') {
        modalRef.current?.close();
      }
    }
  };

  const getModalConfig = () => {
    switch (creationType) {
      case 'subject':
        return {
          icon: <CheckCircle size={20} />,
          title: 'Crear Nueva Materia',
          successText: '¡Materia creada con éxito!',
          successDesc: 'La materia se ha añadido al curso correctamente.',
          btnText: 'Crear Materia',
          redirectText: 'Cerrar',
          nameLabel: 'Nombre de la materia',
          namePlaceholder: 'Ej: Matemáticas Aplicadas'
        };
      case 'exam':
        return {
          icon: <GraduationCap size={20} />,
          title: 'Crear Nuevo Examen',
          successText: '¡Examen creado con éxito!',
          successDesc: 'El examen se ha añadido al curso correctamente.',
          btnText: 'Crear Examen',
          redirectText: 'Ir al Examen',
          nameLabel: 'Nombre del examen',
          namePlaceholder: 'Ej: Examen parcial de matemáticas'
        };
      case 'resource':
        return {
          icon: <FileText size={20} />,
          title: 'Añadir Nuevo Recurso',
          successText: '¡Recurso añadido con éxito!',
          successDesc: 'El recurso se ha subido al curso correctamente.',
          btnText: 'Añadir Recurso',
          redirectText: 'Ir al Recurso',
          nameLabel: 'Nombre del recurso',
          namePlaceholder: 'Ej: Presentación tema 1'
        };
      case 'task':
      default:
        return {
          icon: <ClipboardList size={20} />,
          title: 'Crear Nueva Tarea',
          successText: '¡Tarea creada con éxito!',
          successDesc: 'La tarea se ha añadido al curso correctamente.',
          btnText: 'Crear Tarea',
          redirectText: 'Ir a la Tarea',
          nameLabel: 'Nombre de la tarea',
          namePlaceholder: 'Ej: Ensayo sobre el tema 1'
        };
    }
  };

  const config = getModalConfig();

  return (
    <>
      <div className="fab fab-flower fixed bottom-8 right-8 z-50">
        <div tabIndex={0} role="button" className="btn btn-circle btn-lg btn-primary shadow-lg border-none hover:bg-primary active:bg-primary focus:bg-primary" aria-label="Abrir menú de creación">
          <Plus size={24} aria-hidden="true" />
        </div>

        <button className="fab-main-action btn btn-circle btn-lg btn-primary shadow-lg border-none hover:bg-primary active:bg-primary focus:bg-primary" aria-label="Cerrar menú" onClick={() => (document.activeElement instanceof HTMLElement) && document.activeElement.blur()}>
          <X size={24} aria-hidden="true" />
        </button>

        {/* Crear Tarea: Tooltip en desktop, Icono+Texto en mobile */}
        <div 
          className="md:tooltip md:tooltip-hover md:tooltip-left md:tooltip-primary relative" 
          data-tip="Tarea"
        >
          <button 
            onClick={() => {
              handleOpenModal('task');
              if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
            }}
            className="btn btn-circle btn-lg shadow-md hover:bg-base-200" 
            aria-label="Crear Tarea"
          >
            <ClipboardList size={20} className="text-primary" aria-hidden="true" />
          </button>
          <span className="absolute left-14 top-1/2 -translate-y-1/2 text-sm whitespace-nowrap md:hidden font-medium">Tarea</span>
        </div>

        {/* Crear Examen: Tooltip en desktop, Icono+Texto en mobile */}
        <div 
          className="md:tooltip md:tooltip-hover md:tooltip-left md:tooltip-secondary relative" 
          data-tip="Examen"
        >
          <button 
            onClick={() => {
              handleOpenModal('exam');
              if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
            }}
            className="btn btn-circle btn-lg shadow-md hover:bg-base-200" 
            aria-label="Crear Examen"
          >
            <GraduationCap size={20} className="text-primary" aria-hidden="true" />
          </button>
          <span className="absolute left-14 top-1/2 -translate-y-1/2 text-sm whitespace-nowrap md:hidden font-medium">Examen</span>
        </div>

        {/* Añadir Recurso: Tooltip en desktop, Icono+Texto en mobile */}
        <div 
          className="md:tooltip md:tooltip-hover md:tooltip-left md:tooltip-accent relative" 
          data-tip="Recurso"
        >
          <button 
            onClick={() => {
              handleOpenModal('resource');
              if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
            }}
            className="btn btn-circle btn-lg shadow-md hover:bg-base-200" 
            aria-label="Añadir Recurso"
          >
            <FileText size={20} className="text-primary" aria-hidden="true" />
          </button>
          <span className="absolute left-14 top-1/2 -translate-y-1/2 text-sm whitespace-nowrap md:hidden font-medium">Recurso</span>
        </div>

        {/* Crear Materia: Tooltip en desktop, Icono+Texto en mobile */}
        <div
          className="md:tooltip md:tooltip-hover md:tooltip-left md:tooltip-info relative"
          data-tip="Materia"
        >
          <button
            onClick={() => {
              handleOpenModal('subject');
              if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
            }}
            className="btn btn-circle btn-lg shadow-md hover:bg-base-200"
            aria-label="Crear Materia"
          >
            <CheckCircle size={20} className="text-primary" aria-hidden="true" />
          </button>
          <span className="absolute left-14 top-1/2 -translate-y-1/2 text-sm whitespace-nowrap md:hidden font-medium">Materia</span>
        </div>
      </div>

      <ModalForm
        dialogRef={modalRef}
        title={config.title}
        onClose={() => modalRef.current?.close()}
        onConfirm={handleSave}
        confirmLabel={config.btnText}
        isLoading={isSubmitting}
        error={errorMessage}
        success={isSuccess}
        successMessage={config.successText}
        className="max-w-2xl"
      >
        {!isSuccess ? (
          <>
            <div className="flex items-center gap-2 mb-2 text-primary">
              {config.icon}
              <span className="font-semibold text-base-content">Nuevo Registro</span>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold text-base-content/90">{config.nameLabel}</span>
              </label>
              <input
                type="text"
                placeholder={config.namePlaceholder}
                className="input input-bordered w-full bg-base-100 text-base-content placeholder:text-base-content/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-medium rounded-xl shadow-sm"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>

            {creationType !== 'subject' && (
              <div className="form-control relative">
                <label className="label">
                  <span className="label-text font-semibold text-base-content/90">Tema / Materia <span className="text-error">*</span></span>
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsOpenSubjectDropdown(!isOpenSubjectDropdown)}
                    className="input input-bordered w-full flex items-center justify-between bg-base-100 text-base-content border-base-300 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all font-medium cursor-pointer"
                    disabled={isSubmitting}
                  >
                    <span>
                      {subjects.find(s => (s._id?.toString() || s.id) === selectedSubjectId)?.title || "Selecciona un tema..."}
                    </span>
                    <span className="pointer-events-none flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${isOpenSubjectDropdown ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6"/></svg>
                    </span>
                  </button>
                  
                  {isOpenSubjectDropdown && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsOpenSubjectDropdown(false)} />
                      <ul className="absolute left-0 w-full mt-1.5 p-1 bg-base-100 border border-base-300 dark:border-white/10 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
                        <li className="px-3 py-2 text-xs font-semibold text-base-content/40 uppercase tracking-wider border-b border-base-200/50 mb-1">
                          Selecciona un tema
                        </li>
                        {subjects.map((subject: any) => {
                          const id = subject._id?.toString() || subject.id;
                          const isSelected = id === selectedSubjectId;
                          return (
                            <li key={id}>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedSubjectId(id);
                                  setIsOpenSubjectDropdown(false);
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors text-left cursor-pointer ${
                                  isSelected
                                    ? "bg-primary/10 text-primary font-bold"
                                    : "hover:bg-base-200 text-base-content/85"
                                }`}
                              >
                                <span className="truncate">{subject.title}</span>
                                {isSelected && (
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary flex-shrink-0"><path d="M20 6 9 17l-5-5"/></svg>
                                )}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold text-base-content/90">Descripción</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full bg-base-100 text-base-content placeholder:text-base-content/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-medium rounded-xl shadow-sm"
                placeholder="Escribe una breve descripción..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            {(creationType === 'task' || creationType === 'exam') && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold text-base-content/90">
                    {creationType === 'task' ? 'Fecha de entrega' : 'Fecha del examen'}
                  </span>
                </label>
                <input
                  type="date"
                  className="input input-bordered w-full bg-base-100 text-base-content focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-medium rounded-xl shadow-sm"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required={creationType === 'exam'}
                  disabled={isSubmitting}
                  title={creationType === 'task' ? 'Fecha de entrega' : 'Fecha del examen'}
                />
              </div>
            )}

            {creationType === 'resource' && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold text-base-content/90 flex items-center gap-2">
                    <Upload size={16} /> Subir archivo
                  </span>
                </label>
                <input
                  type="file"
                  className="file-input file-input-bordered w-full bg-base-100 text-base-content focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-medium"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  disabled={isSubmitting}
                  required
                  title="Sube un archivo"
                />
                {selectedFile && (
                  <span className="text-xs text-base-content/50 mt-1 block truncate">
                    Archivo: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </span>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="py-6 flex flex-col items-center text-center space-y-4">
            <p className="text-base-content/70">{config.successDesc}</p>
            <div className="modal-action justify-center mt-4 w-full">
              <button type="button" className="btn btn-primary" onClick={handleRedirect}>
                {config.redirectText}
              </button>
            </div>
          </div>
        )}
      </ModalForm>
    </>
  );
}
