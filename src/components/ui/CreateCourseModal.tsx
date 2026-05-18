'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { IconPlus, IconX, IconBook, IconCheck } from '@tabler/icons-react';

export default function CreateCourseModal({ onCourseCreated }: { onCourseCreated?: () => void }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [courseId, setCourseId] = useState<string>("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
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
    });
    setError("");
    setSuccess(false);
    setCourseId("");
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNavigateToCourse = () => {
    if (courseId) {
      closeModal();
      router.push(`/mycourses/${courseId}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!formData.title || !formData.description) {
        setError("Por favor completa todos los campos requeridos");
        setLoading(false);
        return;
      }

      const response = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || data.message || "Error al crear el curso");
        setLoading(false);
        return;
      }

      // Éxito: mostrar mensaje y guardar el ID del curso
      setSuccess(true);
      setCourseId(data.data?.id);
      setLoading(false);
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
        className="btn btn-primary shadow-lg gap-2"
        onClick={openModal}
      >
        <IconPlus size={20} />
        Nuevo Curso
      </button>

      {/* Modal */}
      <dialog ref={dialogRef} className="modal modal-bottom sm:modal-middle">
        <div className="modal-box bg-base-100 border border-base-300 max-w-2xl">
          
          {/* Cabecera */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-2xl">
              {success ? "¡Curso creado!" : "Crear clase"}
            </h3>
            <button 
              onClick={closeModal}
              className="btn btn-sm btn-circle btn-ghost"
            >
              <IconX size={20} />
            </button>
          </div>

          {/* Estado: Éxito */}
          {success ? (
            <div className="space-y-6 py-4">
              <div className="flex flex-col items-center gap-4">
                <div className="rounded-full bg-success/20 p-4">
                  <IconCheck size={40} className="text-success" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold">¡Curso creado correctamente!</p>
                  <p className="text-sm text-base-content/70 mt-1">
                    Ahora puedes comenzar a agregar contenido a tu curso
                  </p>
                </div>
              </div>

              {/* Acciones - Éxito */}
              <div className="modal-action gap-2">
                <button 
                  type="button"
                  onClick={closeModal}
                  className="btn btn-ghost"
                >
                  Cerrar
                </button>
                <button 
                  type="button"
                  onClick={handleNavigateToCourse}
                  className="btn btn-primary gap-2"
                >
                  <IconBook size={18} />
                  Ir al curso ahora
                </button>
              </div>
            </div>
          ) : (
            /* Estado: Formulario */
            <>
              {/* Error Message */}
              {error && (
                <div className="alert alert-error mb-6">
                  <span>{error}</span>
                </div>
              )}

              {/* Formulario */}
              <form onSubmit={handleSubmit} className="space-y-4">
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-bold">Nombre de la clase<span className="text-error"> *</span></span>
                  </label>
                  <input 
                    name="title" 
                    type="text" 
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Nombre de la clase" 
                    className="input w-full border-2 border-primary-200 focus:border-primary-300 focus:outline-none" 
                    required 
                    disabled={loading}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-bold">Descripción<span className="text-error"> *</span></span>
                  </label>
                  <textarea
                    name="description" 
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Descripción del curso" 
                    className="textarea w-full border-2 border-primary-200 focus:border-primary-300 focus:outline-none"
                    rows={3}
                    required
                    disabled={loading}
                  />
                </div>

                {/* Acciones del Modal */}
                <div className="modal-action mt-8">
                  <button 
                    type="button"
                    onClick={closeModal}
                    className="btn btn-ghost"
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="btn btn-primary px-8"
                  >
                    {loading ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Creando...
                      </>
                    ) : (
                      "Crear"
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>

        {/* Clic fuera para cerrar */}
        <form method="dialog" className="modal-backdrop">
          <button onClick={closeModal}>cerrar</button>
        </form>
      </dialog>
    </>
  );
}