/* Archivo: src\components\ui\CreateTaskModal.tsx
  Descripción: Modal que contiene el formulario para crear una nueva tarea. */

'use client';
// Modal para crear tareas: formulario UI y validación mínima antes de enviar
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
    image: '',
    dueDate: '',
    priority: 'medium',
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
      image: '',
      dueDate: '',
      priority: 'medium',
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
            aria-label="Título de la tarea"
            className="input w-full border border-base-300 bg-base-100 text-base-content focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all font-medium"
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
            aria-label="Descripción de la tarea"
            className="textarea w-full border border-base-300 bg-base-100 text-base-content focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all font-medium"
            rows={4}
            required
            disabled={loading}
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text font-bold text-warning/80">URL de la imagen</span>
          </label>
          <input
            name="image"
            type="url"
            value={formData.image}
            onChange={handleChange}
            placeholder="https://ejemplo.com/imagen.jpg"
            aria-label="URL de la imagen"
            className="input w-full border border-base-300 bg-base-100 text-base-content focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all font-medium"
            disabled={loading}
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text font-bold text-warning/80">Fecha de entrega</span>
          </label>
          <input
            name="dueDate"
            type="datetime-local"
            value={formData.dueDate}
            onChange={handleChange}
            aria-label="Fecha de entrega"
            className="input w-full border border-base-300 bg-base-100 text-base-content focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all font-medium"
            disabled={loading}
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text font-bold text-warning/80">Prioridad</span>
          </label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            aria-label="Prioridad de la tarea"
            className="select w-full border border-base-300 bg-base-100 text-base-content focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all font-medium"
            disabled={loading}
          >
            <option value="low">Baja</option>
            <option value="medium">Media</option>
            <option value="high">Alta</option>
          </select>
        </div>
      </ModalForm>
    </>
  );
}
