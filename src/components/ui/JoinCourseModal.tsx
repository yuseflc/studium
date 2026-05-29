'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { joinCourseByCode } from '@/app/actions/courseActions';
import { JoinCourseModalUI } from '@/components/ui/modals';
import { IconPlus } from '@tabler/icons-react';

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
      <button 
        className="btn btn-secondary shadow-lg gap-2 hidden sm:inline-flex"
        onClick={openModal}
      >
        <IconPlus size={20} />
        Unirse a curso
      </button>

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

      <JoinCourseModalUI
        id="join-course-modal"
        dialogRef={dialogRef}
        onClose={closeModal}
        code={code}
        setCode={setCode}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={error}
        success={success}
      />
    </>
  );
}
