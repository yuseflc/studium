'use client';

import { useState, useEffect } from 'react';
import { generateInviteCode, deactivateInviteCode, listInviteCodes } from '@/app/actions/courseActions';
import { IconCopy, IconTrash, IconRefresh, IconLoader } from '@tabler/icons-react';

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
 * Componente para gestionar códigos de invitación de un curso
 * Permite:
 * - Ver códigos generados
 * - Generar nuevos códigos
 * - Copiar código al portapapeles
 * - Desactivar códigos
 * 
 * Se integra en la sección de ajustes del curso
 * 
 * Nota: Los códigos solo pueden generarse si el curso está en estado "activo"
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

  // Cargar códigos al montar el componente
  useEffect(() => {
    const fetchCodes = async () => {
      try {
        setIsLoading(true);
        const result = await listInviteCodes(courseId);

        if (!result.success) {
          throw new Error(result.error || 'Error al cargar los códigos');
        }

        setCodes(result.codes || []);
        setError('');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error desconocido';
        setError(message);
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

      if (!result.success || !result.code) {
        throw new Error(result.error || 'Error al generar código');
      }

      setCodes([...codes, {
        code: result.code,
        createdAt: new Date().toISOString(),
        active: true,
      }]);
      setError('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      setError('No se pudo copiar el código');
    }
  };

  const handleDeactivateCode = async (code: string) => {
    try {
      const result = await deactivateInviteCode(courseId, code);

      if (!result.success) {
        throw new Error(result.error || 'Error al desactivar código');
      }

      setCodes(codes.map(c =>
        c.code === code ? { ...c, active: false } : c
      ));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start gap-4 mb-4">
        <div>
          <h3 className="font-semibold mb-1">Códigos de invitación</h3>
          <p className="text-sm text-base-content/60">
            Genera códigos para que estudiantes se unan al curso
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button
            onClick={handleGenerateCode}
            disabled={isGenerating || codes.length >= 10 || courseStatus !== "active"}
            className="btn btn-sm btn-primary gap-2 flex-shrink-0"
            title={courseStatus !== "active" ? "El curso debe estar en estado activo para generar códigos" : ""}
          >
            {isGenerating && <IconLoader size={16} className="animate-spin" />}
            {isGenerating ? 'Generando...' : 'Generar'}
          </button>
          {courseStatus !== "active" && (
            <span className="text-xs text-warning">
              El curso debe estar activo
            </span>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <IconLoader className="animate-spin" size={24} />
        </div>
      ) : error && codes.length === 0 ? (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      ) : codes.length === 0 ? (
        <div className="alert alert-info">
          <span>No hay códigos generados. Crea uno para empezar.</span>
        </div>
      ) : (
        <div className="space-y-3">
          {codes.map(code => (
            <div
              key={code.code}
              className="flex items-center justify-between rounded-lg border border-base-200 p-4 hover:bg-base-200/30 transition-colors"
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-3">
                  <code className="font-mono font-bold text-lg bg-base-200 px-3 py-1 rounded">
                    {code.code}
                  </code>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      code.active
                        ? 'bg-green-100/50 text-green-700'
                        : 'bg-base-200 text-base-content/60'
                    }`}
                  >
                    {code.active ? 'Activo' : 'Desactivado'}
                  </span>
                </div>
                <div className="text-xs text-base-content/60 space-y-1">
                  <p>
                    Creado:{' '}
                    {new Date(code.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  {code.lastUsedAt && (
                    <p>
                      Último uso:{' '}
                      {new Date(code.lastUsedAt).toLocaleDateString(
                        'es-ES',
                        {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        }
                      )}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleCopyCode(code.code)}
                  className={`btn btn-ghost btn-sm ${
                    copied === code.code ? 'btn-disabled' : ''
                  }`}
                  title="Copiar código"
                >
                  <IconCopy size={16} />
                </button>
                {code.active && (
                  <button
                    onClick={() => handleDeactivateCode(code.code)}
                    className="btn btn-ghost btn-sm btn-error"
                    title="Desactivar código"
                  >
                    <IconTrash size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="alert alert-warning">
          <span>{error}</span>
        </div>
      )}

      <div className="alert alert-info text-sm">
        <span>
          <strong>Nota:</strong> Máximo 10 códigos activos por curso. Los códigos
          más antiguos se remplazarán automáticamente.
        </span>
      </div>
    </div>
  );
}
