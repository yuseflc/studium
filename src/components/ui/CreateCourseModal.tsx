'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { IconPlus, IconX, IconBook } from '@tabler/icons-react';

const CATEGORIES = [
  { id: "web-design", label: "Diseño Web" },
  { id: "web-dev", label: "Desarrollo Web" },
  { id: "backend", label: "Backend" },
  { id: "frontend", label: "Frontend" },
  { id: "devops", label: "DevOps" },
  { id: "scripts", label: "Scripting" },
  { id: "digital", label: "Digitalización" },
];

export default function CreateCourseModal() {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    imageUrl: "",
    price: "",
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
      category: "",
      imageUrl: "",
      price: "",
    });
    setPreviewImage(null);
    setError("");
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

    if (name === "imageUrl") {
      setPreviewImage(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!formData.title || !formData.description || !formData.category) {
        setError("Por favor completa todos los campos requeridos");
        setLoading(false);
        return;
      }

      const response = await fetch("/api/courses/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Error al crear el curso");
        return;
      }

      console.log("Curso creado exitosamente:", data);
      closeModal();
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Error al crear el curso");
    } finally {
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
            <h3 className="font-bold text-2xl">Crear clase</h3>
            <button 
              onClick={closeModal}
              className="btn btn-sm btn-circle btn-ghost"
            >
              <IconX size={20} />
            </button>
          </div>

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
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-bold">Descripción<span className="text-error"> *</span></span>
              </label>
              <input 
                name="description" 
                type="text" 
                value={formData.description}
                onChange={handleChange}
                placeholder="Descripción del curso" 
                className="input w-full border-2 border-primary-200 focus:border-primary-300 focus:outline-none" 
                required
              />
            </div>


            {/* Acciones del Modal */}
            <div className="modal-action mt-8">
              <button 
                type="button"
                onClick={closeModal}
                className="btn btn-ghost"
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
        </div>

        {/* Clic fuera para cerrar */}
        <form method="dialog" className="modal-backdrop">
          <button onClick={closeModal}>cerrar</button>
        </form>
      </dialog>
    </>
  );
}