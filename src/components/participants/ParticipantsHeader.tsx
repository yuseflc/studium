/* Archivo: src\components\ui\participants\ParticipantsHeader.tsx
  Descripción: Cabecera de la vista de participantes con controles, búsqueda y filtros. */

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useCallback } from 'react';
import {
  IconSearch,
  IconX,
  IconDownload,
  IconUserPlus,
} from '@tabler/icons-react';

interface ParticipantsHeaderProps {
  isTeacher: boolean;
  participantCount: number;
  courseId: string;
  currentSort?: string;
  currentRole?: string;
  currentSearch?: string;
}

/**
 * ParticipantsHeader: Barra de controles para filtrar y buscar participantes
 * 
 * Características:
 * - Campo de búsqueda (nombre/email)
 * - Filtro por rol (estudiantes/profesores)
 * - Ordenamiento
 * - Botones de acción para profesores (agregar, exportar)
 * - Manejo de URL params con Next.js
 */
export default function ParticipantsHeader({
  isTeacher,
  participantCount,
  courseId,
  currentSort = 'recent',
  currentRole = 'all',
  currentSearch = '',
}: ParticipantsHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(currentSearch);

  /**
   * Actualiza los parámetros de búsqueda en la URL
   * Mantiene otros parámetros intactos
   */
  const updateSearchParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams);

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      // Resetear a página 1 cuando se cambian filtros
      params.set('page', '1');

      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  /**
   * Maneja el envío de búsqueda
   */
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateSearchParams({ search: search || null });
  };

  /**
   * Limpia la búsqueda
   */
  const clearSearch = () => {
    setSearch('');
    updateSearchParams({ search: null });
  };

  return (
    <div className="space-y-4 rounded-lg bg-base-200 p-4 md:p-6">
      {/* Fila 1: Búsqueda y Filtros */}
      <div className="flex flex-col gap-4 md:flex-row">
        {/* Campo de búsqueda */}
        <form onSubmit={handleSearch} className="flex-1">
          <label className="input input-bordered input-md flex items-center gap-2 bg-base-100">
            <IconSearch size={18} className="text-base-content/50" />
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              className="flex-1 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Buscar participantes por nombre o email"
            />
            {search && (
              <button
                type="button"
                onClick={clearSearch}
                className="btn btn-ghost btn-sm btn-circle"
                aria-label="Limpiar búsqueda"
                title="Limpiar búsqueda"
              >
                <IconX size={16} />
              </button>
            )}
          </label>
        </form>

        {/* Filtro por rol */}
        <div>
          <label htmlFor="role-filter" className="sr-only">
            Filtrar por rol
          </label>
          <select
            id="role-filter"
            value={currentRole}
            onChange={(e) =>
              updateSearchParams({ role: e.target.value === 'all' ? null : e.target.value })
            }
            className="select select-bordered select-md bg-base-100 text-sm"
            aria-label="Filtrar por rol"
          >
            <option value="all">Todos los roles</option>
            <option value="student">Solo estudiantes</option>
            <option value="teacher">Solo profesores</option>
          </select>
        </div>

        {/* Ordenamiento */}
        <div>
          <label htmlFor="sort-filter" className="sr-only">
            Ordenar por
          </label>
          <select
            id="sort-filter"
            value={currentSort}
            onChange={(e) => updateSearchParams({ sort: e.target.value })}
            className="select select-bordered select-md bg-base-100 text-sm"
            aria-label="Ordenar participantes"
          >
            <option value="recent">Más recientes</option>
            <option value="name-asc">Nombre (A-Z)</option>
            <option value="name-desc">Nombre (Z-A)</option>
            <option value="role">Por rol</option>
          </select>
        </div>
      </div>

      {/* Fila 2: Botones de acción (solo profesores) */}
      {isTeacher && (
        <div className="flex flex-wrap gap-2 border-t border-base-300 pt-4">
          <button className="btn btn-primary btn-sm gap-2">
            <IconUserPlus size={16} />
            Agregar Estudiante
          </button>
          <button className="btn btn-outline btn-sm gap-2">
            <IconDownload size={16} />
            Exportar CSV
          </button>
        </div>
      )}

      {/* Estadísticas */}
      <div className="flex items-center justify-between border-t border-base-300 pt-4 text-sm">
        <p className="text-base-content/70">
          <span className="font-semibold text-base-content">{participantCount}</span>{' '}
          {participantCount === 1 ? 'participante' : 'participantes'} encontrados
        </p>
        {currentSearch && (
          <button
            onClick={clearSearch}
            className="text-primary hover:underline"
          >
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  );
}
