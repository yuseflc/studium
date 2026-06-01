/* Archivo: src\components\ui\CourseInviteCodesManager.tsx
  Descripción: Administrador UI para crear y revocar códigos de invitación del curso. */

"use client";
// Gestión de códigos de invitación para cursos (generar, desactivar, listar)
import { useState, useEffect } from 'react';
import { generateInviteCode, deactivateInviteCode, listInviteCodes } from '@/app/actions/courseActions';
import { IconCopy, IconTrash, IconLoader, IconPlus, IconCheck, IconInfoCircle } from '@tabler/icons-react';

interface InviteCode {
  code: string;
  createdAt: string;
  lastUsedAt?: string;
  active: boolean;
}

interface CourseInviteCodesManagerProps {
  courseId: string;
  courseStatus?: "draft" | "active" | "archived";
}

/**
 * Gestiona los códigos de invitación del curso:
 * listar, generar, copiar y desactivar.
 * Solo permite generar si el curso está en estado "active".
 */
export default function CourseInviteCodesManager({
  courseId,
  courseStatus = "active",
}: CourseInviteCodesManagerProps) {
  const [codes, setCodes] = useState<InviteCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const fetchCodes = async () => {
      try {
        setIsLoading(true);
        const result = await listInviteCodes(courseId);
        if (!result.success) throw new Error(result.error || 'Error al cargar los códigos');
        setCodes(result.codes || []);
        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCodes();
  }, [courseId]);

  const handleGenerateCode = async () => {
    try {
      setIsGenerating(true);
      const result = await generateInviteCode(courseId);
      if (!result.success || !result.code) throw new Error(result.error || 'Error al generar código');
      setCodes([...codes, { code: result.code, createdAt: new Date().toISOString(), active: true }]);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setError('No se pudo copiar el código');
    }
  };

  const handleDeactivateCode = async (code: string) => {
    try {
      const result = await deactivateInviteCode(courseId, code);
      if (!result.success) throw new Error(result.error || 'Error al desactivar código');
      setCodes(codes.map(c => c.code === code ? { ...c, active: false } : c));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  const activeCodes = codes.filter(c => c.active).length;

  return (
    <div className="space-y-4">

      {/* Cabecera: título + botón generar */}
      <div className="flex justify-between items-start gap-4">
        <div>
          <h3 className="font-semibold">Códigos de invitación</h3>
          <p className="text-sm text-base-content/60 mt-0.5">
            Genera códigos para que los estudiantes se unan al curso
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <button
            onClick={handleGenerateCode}
            disabled={isGenerating || codes.length >= 10 || courseStatus !== "active"}
            className="btn btn-sm btn-primary gap-2"
            title={courseStatus !== "active" ? "El curso debe estar activo para generar códigos" : ""}
          >
            {isGenerating
              ? <IconLoader size={15} className="animate-spin" />
              : <IconPlus size={15} />}
            {isGenerating ? 'Generando…' : 'Generar código'}
          </button>
          {courseStatus !== "active" && (
            <span className="text-xs text-warning">El curso debe estar activo</span>
          )}
        </div>
      </div>

      {/* Nota informativa — sustituye el alert-info azul */}
      <div className="flex items-start gap-2.5 rounded-lg border border-base-300 bg-base-200/60 px-4 py-3 text-sm text-base-content/70">
        <IconInfoCircle size={16} className="mt-0.5 shrink-0 text-base-content/50" />
        <div className="flex flex-col gap-0.5">
          <span>
            Máximo <strong className="text-base-content/80">10 códigos</strong> por curso.
            Al superar el límite, el más antiguo se elimina automáticamente.
          </span>
        </div>
      </div>

      {/* Estado de carga */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <IconLoader className="animate-spin text-base-content/40" size={22} />
        </div>

      ) : error && codes.length === 0 ? (
        <div className="rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
          {error}
        </div>

      ) : codes.length === 0 ? (
        /* Estado vacío — sin códigos generados todavía */
        <div className="rounded-lg border border-dashed border-base-300 py-8 text-center text-sm text-base-content/50">
          No hay códigos generados aún. Pulsa <strong>Generar código</strong> para crear el primero.
        </div>

      ) : (
        <div className="space-y-2">
          {codes.map(code => (
            <div
              key={code.code}
              className={`flex items-center justify-between rounded-lg border px-4 py-3 transition-colors ${
                code.active
                  ? 'border-base-200 hover:bg-base-200/40'
                  : 'border-base-200 opacity-50'
              }`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Código monoespaciado */}
                <code className="font-mono font-bold text-base bg-base-200 px-2.5 py-1 rounded shrink-0">
                  {code.code}
                </code>

                {/* Badge estado */}
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                  code.active
                    ? 'bg-success/15 text-success'
                    : 'bg-base-200 text-base-content/50'
                }`}>
                  {code.active ? 'Activo' : 'Inactivo'}
                </span>

                {/* Fechas */}
                <span className="text-xs text-base-content/50 truncate hidden sm:block">
                  Creado {new Date(code.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                  {code.lastUsedAt && (
                    <> · Usado {new Date(code.lastUsedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</>
                  )}
                </span>
              </div>

              {/* Acciones */}
              <div className="flex gap-1 shrink-0 ml-2">
                <button
                  onClick={() => handleCopyCode(code.code)}
                  className="btn btn-ghost btn-xs gap-1"
                  title="Copiar código"
                >
                  {copied === code.code
                    ? <IconCheck size={14} className="text-success" />
                    : <IconCopy size={14} />}
                </button>
                {code.active && (
                  <button
                    onClick={() => handleDeactivateCode(code.code)}
                    className="btn btn-ghost btn-xs text-error hover:bg-error/10"
                    title="Desactivar código"
                  >
                    <IconTrash size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error inline (distinto del error de carga inicial) */}
      {error && codes.length > 0 && (
        <div className="rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}
    </div>
  );
}
