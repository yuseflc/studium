/* Archivo: src\components\ui\CreateCourseModal.tsx
  Descripción: Modal con formulario para crear un curso nuevo (campos y envío). */

"use client";
// Modal para crear cursos (UI y lógica de formulario local)
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { IconPlus, IconBook } from '@tabler/icons-react';
import { CreateCourseModalUI } from '@/components/modals';
import { createCourse } from '@/app/actions/courseActions';

export default function CreateCourseModal({ onCourseCreated }: { onCourseCreated?: () => void | Promise<void> }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [courseId, setCourseId] = useState<string>("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    coverImage: "circles-yellow",
  });

  const openModal = () => {
    dialogRef.current?.showModal();
  };

  const closeModal = () => {
    dialogRef.current?.close();
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      coverImage: "circles-yellow",
    });
    setError("");
    setSuccess(false);
    setCourseId("");
  };

  const handleNavigateToCourse = () => {
    if (courseId) {
      closeModal();
      router.push(`/mycourses/${courseId}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!formData.title || !formData.description) {
        setError("Por favor completa todos los campos requeridos");
        setLoading(false);
        return;
      }

      const result = await createCourse({
        title: formData.title,
        description: formData.description,
        coverImage: formData.coverImage,
      });

      if (!result.success) {
        setError(result.error || "Error al crear el curso");
        setLoading(false);
        return;
      }

      // Éxito: mostrar mensaje y guardar el ID del curso
      setSuccess(true);
      setCourseId(result.data?.id ?? "");
      setLoading(false);
      
      // Actualizar la UI
      setTimeout(async () => {
        // Llamar al callback para refrescar la lista de cursos
        if (onCourseCreated) {
          await onCourseCreated();
        }
        // Refrescar datos del servidor
        router.refresh();
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Error al crear el curso");
      setLoading(false);
    }
  };

  return (
    <>
      {/* Botón que abre el modal */}
      <button 
        data-open-modal
        className="btn btn-primary shadow-lg gap-2 hidden sm:inline-flex"
        onClick={openModal}
      >
        <IconPlus size={20} />
        Nuevo Curso
      </button>

      <div className="fab sm:hidden">
        <button
          type="button"
          className="btn btn-lg btn-circle btn-secondary"
          onClick={openModal}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" aria-label="New" className="size-6" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
        </button>
      </div>

      <CreateCourseModalUI
        id="create-course-modal"
        dialogRef={dialogRef}
        onClose={closeModal}
        titleValue={formData.title}
        setTitleValue={(val) => setFormData(prev => ({ ...prev, title: val }))}
        descriptionValue={formData.description}
        setDescriptionValue={(val) => setFormData(prev => ({ ...prev, description: val }))}
        coverImageValue={formData.coverImage}
        setCoverImageValue={(val) => setFormData(prev => ({ ...prev, coverImage: val }))}
        onConfirm={handleSubmit}
        isLoading={loading}
        error={error}
        success={success}
        successMessage="¡Curso creado correctamente!"
        successAction={
          courseId
            ? {
                label: "Ir al curso",
                onClick: handleNavigateToCourse,
                icon: <IconBook size={18} />
              }
            : undefined
        }
      />
    </>
  );
}
