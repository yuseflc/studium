import { ClipboardList, GraduationCap, FileText, Plus, X, CheckCircle, Upload } from 'lucide-react';
import { useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface CourseFABProps {
  onAddTask: (task: any) => void;
  courseId?: string;
  defaultSubjectId?: string;
}

type CreationType = 'task' | 'exam' | 'resource' | null;

export default function CourseFAB({ onAddTask, courseId, defaultSubjectId }: CourseFABProps) {
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const handleOpenModal = (type: CreationType) => {
    // Resetear estados al abrir
    setCreationType(type);
    setTitle('');
    setDescription('');
    setDueDate('');
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
    if (!title.trim()) return;

    setIsSubmitting(true);

    try {
      let response;
      if (creationType === 'resource' && selectedFile) {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('courseId', courseId || '');
        if (defaultSubjectId) {
          formData.append('subjectId', defaultSubjectId);
        }
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
          subjectId: defaultSubjectId
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
        <div tabIndex={0} role="button" className="btn btn-circle btn-lg btn-primary shadow-lg" aria-label="Abrir menú de creación">
          <Plus size={24} aria-hidden="true" />
        </div>

        <button className="fab-main-action btn btn-circle btn-lg btn-secondary shadow-lg" aria-label="Cerrar menú">
          <X size={24} aria-hidden="true" />
        </button>

        <button 
          onClick={() => handleOpenModal('task')}
          className="btn btn-circle btn-lg shadow-md hover:bg-base-200" 
          title="Crear Tarea"
          aria-label="Crear Tarea"
        >
          <ClipboardList size={20} className="text-primary" aria-hidden="true" />
        </button>

        <button 
          onClick={() => handleOpenModal('exam')}
          className="btn btn-circle btn-lg shadow-md hover:bg-base-200" 
          title="Crear Examen"
          aria-label="Crear Examen"
        >
          <GraduationCap size={20} className="text-primary" aria-hidden="true" />
        </button>

        <button 
          onClick={() => handleOpenModal('resource')}
          className="btn btn-circle btn-lg shadow-md hover:bg-base-200" 
          title="Añadir Recurso (PDF, Info...)"
          aria-label="Añadir Recurso"
        >
          <FileText size={20} className="text-primary" aria-hidden="true" />
        </button>
      </div>

      <dialog ref={modalRef} className="modal modal-bottom sm:modal-middle">
        <div className="modal-box bg-base-100 border border-base-300">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" disabled={isSubmitting}>✕</button>
          </form>

          {!isSuccess ? (
            <>
              <h3 className="font-bold text-lg text-primary mb-6 flex items-center gap-2">
                {config.icon}
                {config.title}
              </h3>
              
              <form onSubmit={handleSave} className="flex flex-col gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">{config.nameLabel}</span>
                  </label>
                  <input 
                    type="text" 
                    placeholder={config.namePlaceholder} 
                    className="input w-full border border-base-300 focus:border-base-content/30 focus:outline-none focus:ring-2 focus:ring-base-content/5 bg-base-100" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Descripción</span>
                  </label>
                  <input 
                    type="text"
                    className="input w-full border border-base-300 focus:border-base-content/30 focus:outline-none focus:ring-2 focus:ring-base-content/5 bg-base-100" 
                    placeholder="Escribe una breve descripción..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>

                {(creationType === 'task' || creationType === 'exam') && (
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">
                        {creationType === 'task' ? 'Fecha de entrega' : 'Fecha del examen'}
                      </span>
                    </label>
                    <input 
                      type="date" 
                      className="input w-full border border-base-300 focus:border-base-content/30 focus:outline-none focus:ring-2 focus:ring-base-content/5 bg-base-100" 
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
                      <span className="label-text font-semibold flex items-center gap-2">
                        <Upload size={16} /> Subir archivo (Requerido)
                      </span>
                    </label>
                    <input 
                      type="file" 
                      className="file-input w-full border border-base-300 focus:border-base-content/30 focus:outline-none focus:ring-2 focus:ring-base-content/5 bg-base-100" 
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      disabled={isSubmitting}
                      required
                    />
                    {selectedFile && (
                      <span className="text-xs text-base-content/60 mt-1 block truncate">
                        Archivo: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                      </span>
                    )}
                  </div>
                )}

                <div className="modal-action mt-6">
                  <button 
                    type="button" 
                    className="btn btn-ghost" 
                    onClick={() => modalRef.current?.close()}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary min-w-[120px] hover:bg-primary/90 focus:bg-primary focus:border-primary active:bg-primary active:border-primary focus:outline-none" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <span className="loading loading-spinner loading-sm"></span> : config.btnText}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="py-12 flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-success/20 text-success rounded-full flex items-center justify-center mb-4">
                <CheckCircle size={32} />
              </div>
              <h3 className="font-bold text-2xl text-base-content">{config.successText}</h3>
              <p className="text-base-content/70">{config.successDesc}</p>
              <div className="modal-action justify-center mt-8 gap-4 w-full">
                <button type="button" className="btn btn-ghost" onClick={() => modalRef.current?.close()}>
                  Cerrar
                </button>
                <button type="button" className="btn btn-primary" onClick={handleRedirect}>
                  {config.redirectText}
                </button>
              </div>
            </div>
          )}
        </div>
        <form method="dialog" className="modal-backdrop">
          <button disabled={isSubmitting}>close</button>
        </form>
      </dialog>
    </>
  );
}
