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

      console.log("✅ Curso creado exitosamente:", data);
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
            <h3 className="font-bold text-2xl flex items-center gap-2">
              <IconBook className="text-primary" />
              Crear Nuevo Curso
            </h3>
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
                <span className="label-text font-bold">Título del curso *</span>
              </label>
              <input 
                name="title" 
                type="text" 
                value={formData.title}
                onChange={handleChange}
                placeholder="Ej: Master en Next.js desde cero" 
                className="input input-bordered w-full" 
                required 
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-bold">Descripción *</span>
              </label>
              <textarea 
                name="description" 
                value={formData.description}
                onChange={handleChange}
                className="textarea textarea-bordered h-24" 
                placeholder="¿De qué trata tu curso?"
                required
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-bold">Categoría *</span>
                </label>
                <select 
                  name="category" 
                  value={formData.category}
                  onChange={handleChange}
                  className="select select-bordered w-full"
                  required
                >
                  <option value="">Selecciona una categoría</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-bold">Precio (€)</span>
                </label>
                <input 
                  name="price" 
                  type="number" 
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0.00" 
                  step="0.01"
                  min="0"
                  className="input input-bordered w-full" 
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-bold">URL de imagen de portada</span>
              </label>
              <input 
                name="imageUrl" 
                type="url" 
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://ejemplo.com/imagen.jpg" 
                className="input input-bordered w-full" 
              />
            </div>

            {/* Preview */}
            {previewImage && (
              <div className="mt-4">
                <p className="text-sm font-semibold mb-2">Vista previa:</p>
                <img 
                  src={previewImage} 
                  alt="preview" 
                  className="w-full h-32 object-cover rounded"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 
                      "https://via.placeholder.com/400x160?text=Imagen+no+válida";
                  }}
                />
              </div>
            )}

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
                  "Publicar Curso"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Clic fuera para cerrar */}
        <form method="dialog" className="modal-backdrop">
          <button onClick={closeModal}>close</button>
        </form>
      </dialog>
    </>
  );
}