'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { joinCourseByCode } from '@/app/actions/courseActions';
import { ModalForm } from '@/components/ui/modals';
import { IconPlus } from '@tabler/icons-react';

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
        className="btn btn-outline btn-secondary gap-2 hidden sm:inline-flex"
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
          className="btn btn-lg btn-circle btn-outline btn-secondary shadow-lg"
          onClick={openModal}
          title="Unirse a curso"
        >
          <IconPlus size={24} />
        </button>
      </div>

      <ModalForm
        dialogRef={dialogRef}
        onClose={closeModal}
        title="Unirse a un curso"
        confirmLabel="Unirse"
        onConfirm={handleSubmit}
        isLoading={isLoading}
        error={error || null}
        success={!!success}
        successMessage={success}
        className="max-w-sm"
      >
        <div className="space-y-6">
          <p className="text-base-content/60 text-sm">
            Ingresa el código de invitación para unirte a un curso
          </p>

          <label className="form-control w-full">
            <span className="label-text font-medium mb-2 text-base dark:text-warning">Código de invitación</span>
            <input
              type="text"
              placeholder="Ej: AB12CD"
              value={code}
              onChange={handleCodeChange}
              disabled={isLoading}
              className="input input-bordered input-lg text-center font-mono text-2xl tracking-[0.5em] uppercase w-full focus:border-warning focus:outline-none transition-all"
              maxLength={6}
              minLength={6}
              required
              autoComplete="off"
              autoFocus
            />
            <span className="label-text-alt text-xs mt-1 text-base-content/50">6 caracteres alfanuméricos (mayúsculas)</span>
          </label>
        </div>
      </ModalForm>
    </>
  );
}

