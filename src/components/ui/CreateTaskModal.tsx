'use client';

import { useRef, useState } from 'react';
import { IconPlus, IconX, IconBook, IconCheck } from '@tabler/icons-react';

interface CreateTaskModalProps {
  courseName?: string;
}

export default function CreateTaskModal({ courseName }: CreateTaskModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
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
      title: '',
      description: '',
    });
    setError('');
    setSuccess(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.title || !formData.description) {
      setError('Por favor completa todos los campos requeridos');
      setLoading(false);
      return;
    }

    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 500);
  };

  const handleOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    openModal();
  };

  return (
    <>
      <button
        type="button"
        className="btn btn-primary shadow-lg gap-2"
        onClick={handleOpen}
      >
        <IconPlus size={18} />
        Crear tarea
      </button>

      <dialog ref={dialogRef} className="modal modal-bottom sm:modal-middle">
        <div className="modal-box bg-base-100 border border-base-300 max-w-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-2xl">
              {success ? '¡Tarea creada!' : `Crear tarea${courseName ? ` en ${courseName}` : ''}`}
            </h3>
            <button onClick={closeModal} className="btn btn-sm btn-circle btn-ghost">
              <IconX size={20} />
            </button>
          </div>

          {success ? (
            <div className="space-y-6 py-4">
              <div className="flex flex-col items-center gap-4">
                <div className="rounded-full bg-success/20 p-4">
                  <IconCheck size={40} className="text-success" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold">¡Tarea creada correctamente!</p>
                  <p className="text-sm text-base-content/70 mt-1">
                    Esta vista es solo de demostración y no guarda datos en el backend.
                  </p>
                </div>
              </div>

              <div className="modal-action gap-2">
                <button type="button" onClick={closeModal} className="btn btn-ghost">
                  Cerrar
                </button>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="alert alert-error mb-6">
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-bold">Título de la tarea<span className="text-error"> *</span></span>
                  </label>
                  <input
                    name="title"
                    type="text"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Nombre de la tarea"
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
                    placeholder="Descripción de la tarea"
                    className="textarea w-full border-2 border-primary-200 focus:border-primary-300 focus:outline-none"
                    rows={4}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="modal-action mt-8">
                  <button type="button" onClick={closeModal} className="btn btn-ghost" disabled={loading}>
                    Cancelar
                  </button>
                  <button type="submit" disabled={loading} className="btn btn-primary px-8">
                    {loading ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Creando...
                      </>
                    ) : (
                      'Crear'
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>

        <form method="dialog" className="modal-backdrop">
          <button onClick={closeModal}>cerrar</button>
        </form>
      </dialog>
    </>
  );
}
