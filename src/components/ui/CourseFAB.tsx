import { ClipboardList, GraduationCap, FileText, Plus, CheckCircle, Upload, X } from 'lucide-react';
import { useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ModalForm } from './modals';

interface CourseFABProps {
  onAddTask: (task: any) => void;
  courseId?: string;
  defaultSubjectId?: string;
  subjects?: any[];
}

type CreationType = 'task' | 'exam' | 'resource' | null;

export default function CourseFAB({ onAddTask, courseId, defaultSubjectId, subjects = [] }: CourseFABProps) {
  const router = useRouter();
  const params = useParams();
  const courseid = params?.courseid || 'course-1';

  const modalRef = useRef<HTMLDialogElement>(null);
  
  // Flow states
  const [creationType, setCreationType] = useState<CreationType>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdItemId, setCreatedItemId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState(defaultSubjectId || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const handleOpenModal = (type: CreationType) => {
    // Resetear estados al abrir
    setCreationType(type);
    setTitle('');
    setDescription('');
    setDueDate('');
    setSelectedSubjectId(defaultSubjectId || '');
    setSelectedFile(null);
    setIsSubmitting(false);
    setIsSuccess(false);
    setCreatedItemId(null);

    if (modalRef.current) {
      modalRef.current.showModal();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedSubjectId) return;

    setIsSubmitting(true);

    try {
      let response;
      if (creationType === 'resource' && selectedFile) {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('courseId', courseId || '');
        formData.append('subjectId', selectedSubjectId);
        formData.append('file', selectedFile);

        response = await fetch('/api/resources', {
          method: 'POST',
          body: formData,
        });
      } else {
        let endpoint = '';
        let bodyData: any = {
          title,
          description,
          courseId,
          subjectId: selectedSubjectId
        };

        if (creationType === 'task') {
          endpoint = '/api/tasks';
          bodyData.dueDate = dueDate ? new Date(dueDate).toISOString() : new Date().toISOString();
        } else if (creationType === 'exam') {
          endpoint = '/api/exams';
          bodyData.dueDate = dueDate ? new Date(dueDate).toISOString() : new Date().toISOString();
        } else if (creationType === 'resource') {
          endpoint = '/api/resources';
        }

        response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyData)
        });
      }

      if (!response.ok) {
        throw new Error('Error al guardar');
      }

      const createdItem = await response.json();
      
      // Si es tarea, se llama a onAddTask
      if (creationType === 'task' && onAddTask) {
        onAddTask(createdItem.task || createdItem);
      }
      
      setIsSubmitting(false);
      setIsSuccess(true);
      
      // Intentar obtener el ID independientemente de la estructura
      const itemId = createdItem.task?._id || createdItem.exam?._id || createdItem.resource?._id || createdItem._id;
      setCreatedItemId(itemId || null);
    } catch (error) {
      console.error(error);
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
      }
    }
  };

  const getModalConfig = () => {
    switch (creationType) {
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

        <button 
          onClick={() => {
            handleOpenModal('task');
            if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
          }}
          className="btn btn-circle btn-lg shadow-md hover:bg-base-200" 
          title="Crear Tarea"
          aria-label="Crear Tarea"
        >
          <ClipboardList size={20} className="text-primary" aria-hidden="true" />
        </button>

        <button 
          onClick={() => {
            handleOpenModal('exam');
            if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
          }}
          className="btn btn-circle btn-lg shadow-md hover:bg-base-200" 
          title="Crear Examen"
          aria-label="Crear Examen"
        >
          <GraduationCap size={20} className="text-primary" aria-hidden="true" />
        </button>

        <button 
          onClick={() => {
            handleOpenModal('resource');
            if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
          }}
          className="btn btn-circle btn-lg shadow-md hover:bg-base-200" 
          title="Añadir Recurso (PDF, Info...)"
          aria-label="Añadir Recurso"
        >
          <FileText size={20} className="text-primary" aria-hidden="true" />
        </button>
      </div>

      <ModalForm
        dialogRef={modalRef}
        title={config.title}
        onClose={() => modalRef.current?.close()}
        onConfirm={() => handleSave({ preventDefault: () => { } } as any)}
        confirmLabel={config.btnText}
        isLoading={isSubmitting}
        success={isSuccess}
        successMessage={config.successText}
        className="max-w-2xl"
      >
        {!isSuccess ? (
          <>
            <div className="flex items-center gap-2 mb-2 text-warning">
              {config.icon}
              <span className="font-semibold">Nuevo Registro</span>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-bold text-warning/80">{config.nameLabel}</span>
              </label>
              <input
                type="text"
                placeholder={config.namePlaceholder}
                className="input w-full border border-warning/20 bg-warning/5 focus:border-warning/50 focus:outline-none focus:ring-1 focus:ring-warning/30 transition-all font-medium"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-bold text-warning/80">Tema / Materia<span className="text-error"> *</span></span>
              </label>
              <select
                className="select w-full border border-warning/20 bg-warning/5 focus:border-warning/50 focus:outline-none focus:ring-1 focus:ring-warning/30 transition-all font-medium"
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                required
                disabled={isSubmitting}
              >
                <option value="" disabled>Selecciona un tema...</option>
                {subjects.map((subject: any) => (
                  <option key={subject._id?.toString() || subject.id} value={subject._id?.toString() || subject.id}>
                    {subject.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-bold text-warning/80">Descripción</span>
              </label>
              <input
                type="text"
                className="input w-full border border-warning/20 bg-warning/5 focus:border-warning/50 focus:outline-none focus:ring-1 focus:ring-warning/30 transition-all font-medium"
                placeholder="Escribe una breve descripción..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            {(creationType === 'task' || creationType === 'exam') && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-bold text-warning/80">
                    {creationType === 'task' ? 'Fecha de entrega' : 'Fecha del examen'}
                  </span>
                </label>
                <input
                  type="date"
                  className="input w-full border border-warning/20 bg-warning/5 focus:border-warning/50 focus:outline-none focus:ring-1 focus:ring-warning/30 transition-all font-medium"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
            )}

            {creationType === 'resource' && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-bold text-warning/80 flex items-center gap-2">
                    <Upload size={16} /> Subir archivo (Requerido)
                  </span>
                </label>
                <input
                  type="file"
                  className="file-input w-full border border-warning/20 bg-warning/5 focus:border-warning/50 focus:outline-none focus:ring-1 focus:ring-warning/30 transition-all font-medium"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  disabled={isSubmitting}
                  required
                />
                {selectedFile && (
                  <span className="text-xs text-warning/70 mt-1 block truncate">
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
