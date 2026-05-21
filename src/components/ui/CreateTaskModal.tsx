'use client';

import { useRef, useState } from 'react';
import { IconPlus } from '@tabler/icons-react';
import { ModalForm } from './modals';

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

      <ModalForm
        dialogRef={dialogRef}
        title={`Crear tarea${courseName ? ` en ${courseName}` : ''}`}
        onClose={closeModal}
        onConfirm={() => handleSubmit({ preventDefault: () => {} } as any)}
        isLoading={loading}
        error={error}
        success={success}
        successMessage="¡Tarea creada correctamente!"
      >
        <div className="form-control">
          <label className="label">
            <span className="label-text font-bold text-warning/80">Título de la tarea<span className="text-error"> *</span></span>
          </label>
          <input
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            placeholder="Nombre de la tarea"
            className="input w-full border border-warning/20 bg-warning/5 focus:border-warning/50 focus:outline-none focus:ring-1 focus:ring-warning/30 transition-all"
            required
            disabled={loading}
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text font-bold text-warning/80">Descripción<span className="text-error"> *</span></span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Descripción de la tarea"
            className="textarea w-full border border-warning/20 bg-warning/5 focus:border-warning/50 focus:outline-none focus:ring-1 focus:ring-warning/30 transition-all"
            rows={4}
            required
            disabled={loading}
          />
        </div>
      </ModalForm>
    </>
  );
}
