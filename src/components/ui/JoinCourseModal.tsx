'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { joinCourseByCode } from '@/app/actions/courseActions';
import { Modal } from '@/components/ui/modals';
import { Button } from '@/components/ui/button';
import { IconPlus, IconLoader } from '@tabler/icons-react';

interface JoinCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Modal para unirse a un curso usando código de invitación
 * Usuario ingresa un código de 6 caracteres alfanuméricos
 */
export default function JoinCourseModal({ isOpen, onClose }: JoinCourseModalProps) {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();

  const openModal = () => {
    dialogRef.current?.showModal();
  };

  const closeModal = () => {
    dialogRef.current?.close();
    setCode('');
    setError('');
    setSuccess('');
    onClose();
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().slice(0, 6);
    setCode(value);
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code || code.length !== 6) {
      setError('El código debe tener exactamente 6 caracteres');
      return;
    }

    if (!/^[A-Z0-9]{6}$/.test(code)) {
      setError('El código debe contener solo letras mayúsculas y números');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await joinCourseByCode(code);

      if (!result.success) {
        setError(result.error || 'Error al unirse al curso');
        return;
      }

      setSuccess(`¡Bienvenido a "${result.courseTitle}"!`);
      setCode('');

      setTimeout(() => {
        closeModal();
        router.push(`/mycourses`);
      }, 1000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error de conexión';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Botón que abre el modal (Desktop) */}
      <button 
        className="btn btn-secondary shadow-lg gap-2 hidden sm:inline-flex"
        onClick={openModal}
      >
        <IconPlus size={20} />
        Unirse a curso
      </button>

      {/* Botón flotante (Mobile FAB) - Solo si no es profesor o si queremos ambos */}
      <div className="fab sm:hidden fixed bottom-6 right-6 z-40">
        <button
          type="button"
          className="btn btn-lg btn-circle btn-secondary shadow-lg"
          onClick={openModal}
          title="Unirse a curso"
        >
          <IconPlus size={24} />
        </button>
      </div>

      <Modal 
        dialogRef={dialogRef} 
        onClose={closeModal}
        className="max-w-md"
        showClose={true}
      >
        <h3 className="font-bold text-lg">Unirse a un curso</h3>
        <p className="text-sm text-base-content/70 my-2">
          Ingresa el código de invitación para unirte a un curso
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Código de invitación</span>
            </label>
            <input
              type="text"
              placeholder="Ej: AB12CD"
              value={code}
              onChange={handleCodeChange}
              disabled={isLoading}
              className="input input-bordered text-center text-lg tracking-widest font-mono"
              maxLength={6}
            />
            <label className="label">
              <span className="label-text-alt text-xs">6 caracteres alfanuméricos (mayúsculas)</span>
            </label>
          </div>

          {error && (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              <span>{success}</span>
            </div>
          )}

          <div className="modal-action gap-2">
            <button
              type="button"
              onClick={closeModal}
              className="btn btn-ghost"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || code.length !== 6}
              className="btn btn-primary gap-2"
            >
              {isLoading && <IconLoader size={16} className="animate-spin" />}
              {isLoading ? 'Uniéndose...' : 'Unirse'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
