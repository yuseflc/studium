import { ClipboardList, GraduationCap, FileText, Plus, X, CheckCircle } from 'lucide-react';
import { useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface CourseFABProps {
  onAddTask: (task: any) => void;
  courseId?: string;
  defaultSubjectId?: string;
}

export default function CourseFAB({ onAddTask, courseId, defaultSubjectId }: CourseFABProps) {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug || 'course-1';

  const modalRef = useRef<HTMLDialogElement>(null);
  
  // Form states
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  
  // Flow states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdTaskId, setCreatedTaskId] = useState<string | null>(null);

  const handleOpenModal = () => {
    // Resetear estados al abrir
    setTaskTitle('');
    setTaskDescription('');
    setDueDate('');
    setIsSubmitting(false);
    setIsSuccess(false);
    setCreatedTaskId(null);

    if (modalRef.current) {
      modalRef.current.showModal();
    }
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: taskTitle,
          description: taskDescription,
          dueDate: dueDate ? new Date(dueDate).toISOString() : new Date().toISOString(),
          courseId: courseId,
          subjectId: defaultSubjectId
        })
      });

      if (!response.ok) {
        throw new Error('Error al guardar la tarea');
      }

      const createdTask = await response.json();
      
      onAddTask(createdTask.task || createdTask);
      
      setIsSubmitting(false);
      setIsSuccess(true);
      setCreatedTaskId(createdTask.task?._id || createdTask._id);
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
      // Aquí se podría mostrar un toast de error
    }
  };

  const handleRedirect = () => {
    if (createdTaskId) {
      if (modalRef.current) modalRef.current.close();
      router.push(`/mycourses/${slug}/tasks/${createdTaskId}`);
    }
  };

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
          onClick={handleOpenModal}
          className="btn btn-circle btn-lg shadow-md hover:bg-base-200" 
          title="Crear Tarea"
          aria-label="Crear Tarea"
        >
          <ClipboardList size={20} className="text-primary" aria-hidden="true" />
        </button>

        <button 
          className="btn btn-circle btn-lg shadow-md hover:bg-base-200" 
          title="Crear Examen"
          aria-label="Crear Examen"
        >
          <GraduationCap size={20} className="text-primary" aria-hidden="true" />
        </button>

        <button 
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
                <ClipboardList size={20} />
                Crear Nueva Tarea
              </h3>
              
              <form onSubmit={handleSaveTask} className="flex flex-col gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Nombre de la tarea</span>
                  </label>
                  <input 
                    type="text" 
                    placeholder="Ej: Ensayo sobre el tema 1" 
                    className="input input-bordered w-full focus:input-primary" 
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
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
                    className="input input-bordered w-full focus:input-primary" 
                    placeholder="Escribe las instrucciones de la tarea..."
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Fecha de entrega</span>
                  </label>
                  <input 
                    type="date" 
                    className="input input-bordered w-full focus:input-primary" 
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="modal-action mt-6">
                  <button 
                    type="button" 
                    className="btn btn-ghost" 
                    onClick={() => modalRef.current?.close()}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary min-w-[120px]" disabled={isSubmitting}>
                    {isSubmitting ? <span className="loading loading-spinner loading-sm"></span> : "Crear Tarea"}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="py-12 flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-success/20 text-success rounded-full flex items-center justify-center mb-4">
                <CheckCircle size={32} />
              </div>
              <h3 className="font-bold text-2xl text-base-content">¡Tarea creada con éxito!</h3>
              <p className="text-base-content/70">La tarea se ha añadido al curso correctamente.</p>
              <div className="modal-action justify-center mt-8 gap-4 w-full">
                <button type="button" className="btn btn-ghost" onClick={() => modalRef.current?.close()}>
                  Cerrar
                </button>
                <button type="button" className="btn btn-primary" onClick={handleRedirect}>
                  Ir a la Tarea
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
