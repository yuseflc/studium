'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  IconTrash,
  IconEdit,
  IconDots,
  IconMail,
} from '@tabler/icons-react';
import { deleteParticipant } from '@/app/actions/participantActions';

interface ParticipantData {
  _id: string;
  firstName: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  enrolledAt?: Date;
  grade?: number;
  submissions?: number;
  lastActive?: Date;
}

interface ParticipantsTableProps {
  participants: ParticipantData[];
  isTeacher: boolean;
  courseId: string;
}

/**
 * ParticipantsTable: Tabla interactiva de participantes con acciones
 * 
 * Características:
 * - Visualización por rol (profesor vs estudiante)
 * - Acciones según permisos (eliminar, editar calificaciones)
 * - Menú contextual
 * - Responsive en dispositivos móviles
 */
export default function ParticipantsTable({
  participants,
  isTeacher,
  courseId,
}: ParticipantsTableProps) {
  const router = useRouter();
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [selectedParticipants, setSelectedParticipants] = useState<Set<string>>(
    new Set()
  );
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Alterna la selección de un participante
   */
  const toggleParticipant = (id: string) => {
    const newSelected = new Set(selectedParticipants);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedParticipants(newSelected);
  };

  /**
   * Alterna todos los participantes
   */
  const toggleAllParticipants = () => {
    if (selectedParticipants.size === participants.length) {
      setSelectedParticipants(new Set());
    } else {
      setSelectedParticipants(
        new Set(participants.map((p) => p._id))
      );
    }
  };

  /**
   * Formato seguro de fechas
   */
  const formatDate = (date?: Date) => {
    if (!date) return '—';
    try {
      const d = new Date(date);
      return new Intl.DateTimeFormat('es-ES', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
      }).format(d);
    } catch {
      return '—';
    }
  };

  /**
   * Elimina un participante del curso
   */
  const handleDelete = async (participantId: string, participantName: string) => {
    const confirmed = window.confirm(
      `¿Estás seguro de que deseas eliminar a ${participantName} del curso?`
    );
    
    if (!confirmed) return;

    setIsLoading(true);
    try {
      const result = await deleteParticipant(courseId, participantId);
      
      if (result.success) {
        // Refrescar la página para actualizar la lista
        router.refresh();
        alert(`${participantName} ha sido eliminado del curso`);
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error('Error al eliminar participante:', error);
      alert('Error al eliminar el participante');
    } finally {
      setIsLoading(false);
      setExpandedRow(null);
    }
  };

  return (
    <div>
      {/* Desktop View: Tabla — oculta en mobile */}
      <div className="hidden md:block overflow-x-auto rounded-lg bg-base-100 shadow-md">
      <table className="w-full text-sm">
        <thead className="border-b border-base-300 bg-base-200">
          <tr>
            {isTeacher && (
              <th className="w-12 p-3 text-left">
                <label htmlFor="select-all" className="sr-only">
                  Seleccionar todos
                </label>
                <input
                  id="select-all"
                  type="checkbox"
                  className="checkbox checkbox-sm"
                  checked={selectedParticipants.size === participants.length && participants.length > 0}
                  onChange={toggleAllParticipants}
                  aria-label="Seleccionar todos los participantes"
                />
              </th>
            )}
            <th className="px-4 py-3 text-left font-semibold text-base-content">
              Nombre
            </th>
            <th className="px-4 py-3 text-left font-semibold text-base-content">
              Email
            </th>
            <th className="px-4 py-3 text-left font-semibold text-base-content">
              Rol
            </th>
            <th className="px-4 py-3 text-left font-semibold text-base-content">
              Inscrito el
            </th>
            {isTeacher && (
              <>
                <th className="px-4 py-3 text-center font-semibold text-base-content">
                  Calificación
                </th>
                <th className="w-12 p-3 text-center"></th>
              </>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-base-300">
          {participants.map((participant) => (
            <tr
              key={participant._id}
              className="transition hover:bg-base-200/50"
            >
              {isTeacher && (
                <td className="p-3">
                  <label htmlFor={`select-${participant._id}`} className="sr-only">
                    Seleccionar {participant.firstName}
                  </label>
                  <input
                    id={`select-${participant._id}`}
                    type="checkbox"
                    className="checkbox checkbox-sm"
                    checked={selectedParticipants.has(participant._id)}
                    onChange={() => toggleParticipant(participant._id)}
                    aria-label={`Seleccionar ${participant.firstName}`}
                  />
                </td>
              )}
              <td className="px-4 py-3">
                <Link
                  href={`/account/profile?id=${participant._id}&courseId=${courseId}`}
                  className="flex items-center gap-3 hover:text-primary transition-colors cursor-pointer group"
                >
                  <div className="avatar placeholder">
                    <div className="w-8 rounded-full bg-primary text-white">
                      <span className="text-xs font-bold">
                        {participant.firstName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <span className="font-medium text-base-content group-hover:underline">
                    {participant.firstName}
                  </span>
                </Link>
              </td>
              <td className="px-4 py-3 text-base-content/70">
                <a
                  href={`mailto:${participant.email}`}
                  className="hover:link link-primary"
                >
                  {participant.email}
                </a>
              </td>
              <td className="px-4 py-3">
                <span
                  className={`badge badge-sm font-medium ${
                    participant.role === 'teacher'
                      ? 'badge-primary'
                      : 'badge-secondary'
                  }`}
                >
                  {participant.role === 'teacher' ? '👨‍🏫 Profesor' : '👨‍🎓 Estudiante'}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-base-content/70">
                {formatDate(participant.enrolledAt)}
              </td>
              {isTeacher && (
                <>
                  <td className="px-4 py-3 text-center">
                    {participant.role === 'student' ? (
                      <span className="font-semibold text-base-content">
                        {participant.grade !== undefined ? participant.grade : '—'}
                      </span>
                    ) : (
                      <span className="text-base-content/50">—</span>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="dropdown dropdown-end">
                      <button
                        aria-label={`Opciones para ${participant.firstName}`}
                        title={`Opciones para ${participant.firstName}`}
                        className="btn btn-ghost btn-sm btn-circle"
                        onClick={() =>
                          setExpandedRow(
                            expandedRow === participant._id ? null : participant._id
                          )
                        }
                      >
                        <IconDots size={16} />
                      </button>
                      {expandedRow === participant._id && (
                        <ul className="dropdown-content z-50 flex w-52 flex-col gap-1 rounded-md bg-base-100 p-2 shadow-lg">
                          <li>
                            <button className="btn btn-ghost btn-sm justify-start gap-2">
                              <IconEdit size={16} />
                              Editar Calificación
                            </button>
                          </li>
                          <li>
                            <button className="btn btn-ghost btn-sm justify-start gap-2">
                              <IconMail size={16} />
                              Enviar Mensaje
                            </button>
                          </li>
                          {participant.role === 'student' && (
                            <li>
                              <button
                                className="btn btn-ghost btn-sm justify-start gap-2 text-error"
                                onClick={() =>
                                  handleDelete(participant._id, participant.firstName)
                                }
                                disabled={isLoading}
                              >
                                <IconTrash size={16} />
                                Eliminar del Curso
                              </button>
                            </li>
                          )}
                        </ul>
                      )}
                    </div>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      {/* Mobile View: Cards — oculta en desktop */}
      <div className="block md:hidden space-y-3 p-4 rounded-lg bg-base-100 shadow-md">
        {participants.map((participant) => (
          <div
            key={participant._id}
            className="rounded-lg border border-base-300 bg-base-100 p-4"
          >
            <div className="mb-3 flex items-start justify-between">
              <Link
                href={`/account/profile?id=${participant._id}&courseId=${courseId}`}
                className="flex items-center gap-3 hover:text-primary transition-colors cursor-pointer group"
              >
                <div className="avatar placeholder">
                  <div className="w-10 rounded-full bg-primary text-white">
                    <span className="text-sm font-bold">
                      {participant.firstName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-base-content group-hover:underline">
                    {participant.firstName}
                  </p>
                  <p className="text-xs text-base-content/70">
                    {participant.email}
                  </p>
                </div>
              </Link>
              <span
                className={`badge badge-sm font-medium ${
                  participant.role === 'teacher'
                    ? 'badge-primary'
                    : 'badge-secondary'
                }`}
              >
                {participant.role === 'teacher' ? 'Prof.' : 'Est.'}
              </span>
            </div>

            <div className="mb-3 border-t border-base-300 pt-3 text-xs text-base-content/70">
              <p>
                <span className="font-medium">Inscrito:</span>{' '}
                {formatDate(participant.enrolledAt)}
              </p>
              {isTeacher && participant.role === 'student' && (
                <p className="mt-1">
                  <span className="font-medium">Calificación:</span>{' '}
                  {participant.grade !== undefined ? participant.grade : '—'}
                </p>
              )}
            </div>

            {isTeacher && (
              <div className="flex gap-2">
                <button className="btn btn-outline btn-sm flex-1 gap-1 text-xs">
                  <IconEdit size={14} />
                  Editar
                </button>
                {participant.role === 'student' && (
                  <button
                    className="btn btn-ghost btn-sm flex-1 gap-1 text-xs text-error"
                    onClick={() =>
                      handleDelete(participant._id, participant.firstName)
                    }
                    disabled={isLoading}
                  >
                    <IconTrash size={14} />
                    Eliminar
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
