'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { joinCourseByCode } from '@/app/actions/courseActions';
import { Modal } from '@/components/ui/modals';
import { IconPlus, IconLoader } from '@tabler/icons-react';

/**
 * JoinCourseButton
 * 
 * Componente que muestra el botón de "Unirse a curso" y el modal correspondiente.
 * Sigue el patrón de diseño de CreateCourseModal (DaisyUI + Tabler Icons).
 */
export default function JoinCourseButton({ onCourseJoined }: { onCourseJoined?: () => void | Promise<void> }) {
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

      setTimeout(async () => {
        closeModal();
        // Llamar al callback para refrescar la lista de cursos
        if (onCourseJoined) {
          await onCourseJoined();
        }
        // Refrescar la página desde el servidor
        router.refresh();
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
        type="button"
      >
        <IconPlus size={20} />
        Unirse a curso
      </button>

      {/* Botón flotante (Mobile FAB) */}
      <div className="fab sm:hidden">
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
              autoComplete="off"
            />
            <label className="label">
              <span className="label-text-alt text-xs">6 caracteres alfanuméricos (mayúsculas)</span>
            </label>
          </div>

          {error && (
            <div className="alert alert-error text-sm">
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="alert alert-success text-sm">
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
              {isLoading && <IconLoader size={18} className="animate-spin" />}
              {isLoading ? 'Uniéndose...' : 'Unirse'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

