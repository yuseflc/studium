import { useState, useCallback } from 'react';

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

interface UploadResult {
  success: boolean;
  url?: string;
  fileName?: string;
  error?: string;
}

interface UseFileUploadOptions {
  courseId: string;
  unitId: string;
}

/**
 * Hook personalizado para manejar la subida de archivos a Cloudflare R2
 * Proporciona:
 * - Validación de archivos (tamaño, tipo MIME)
 * - Seguimiento del progreso de carga
 * - Manejo de errores
 * - Estados de carga
 *
 * @param options Configuración con courseId (ID del curso) y unitId (ID de la unidad)
 * @returns Objeto con función de upload, estados, progress y resetProgress
 */
export function useFileUpload(options: UseFileUploadOptions) {
  // Estado de carga
  const [isLoading, setIsLoading] = useState(false);
  // Progreso de la subida (loaded, total bytes, porcentaje)
  const [progress, setProgress] = useState<UploadProgress>({
    loaded: 0,
    total: 0,
    percentage: 0,
  });
  // Mensaje de error si la carga falla
  const [error, setError] = useState<string | null>(null);

  // useCallback asegura que la función solo se recrea si los dependientes cambian
  const upload = useCallback(
    async (file: File): Promise<UploadResult> => {
      // Validar que courseId y unitId están disponibles
      if (!options.courseId || !options.unitId) {
        return {
          success: false,
          error: 'Curso y unidad son requeridos',
        };
      }

      // Inicializar estados antes de la carga
      setIsLoading(true);
      setError(null);
      setProgress({ loaded: 0, total: file.size, percentage: 0 });

      try {
        // Crear FormData con el archivo y metadata
        const formData = new FormData();
        formData.append('file', file);
        formData.append('courseId', options.courseId);
        formData.append('unitId', options.unitId);

        // Enviar solicitud POST al endpoint de subida de recursos
        // El servidor manejará la validación y subida a R2
        const response = await fetch('/api/resources/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        // Verificar si la respuesta es exitosa (status 200)
        if (!response.ok) {
          // Extraer mensaje de error de la respuesta del servidor
          const validationDetails = data?.error?.details as Record<string, unknown> | undefined;

          const firstValidationError = validationDetails
            ? Object.values(validationDetails).find(
                (value): value is string[] => Array.isArray(value) && value.length > 0
              )?.[0]
            : undefined;

          const errorMessage =
            firstValidationError ||
            (Array.isArray(validationDetails?.file) ? (validationDetails.file as string[])[0] : undefined) ||
            data?.message ||
            'Error al subir el archivo';
          setError(errorMessage);
          return {
            success: false,
            error: errorMessage,
          };
        }

        // Actualizar progreso a 100% cuando la carga es exitosa
        setProgress({ loaded: file.size, total: file.size, percentage: 100 });

        // Retornar la URL del archivo y metadatos
        return {
          success: true,
          url: data.data.url,  // URL pública del archivo en R2
          fileName: data.data.fileName,
        };
      } catch (err) {
        // Capturar errores de red o parsing
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        setError(errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        // Siempre detener el loading, incluso si hay error
        setIsLoading(false);
      }
    },
    // Dependencias: se recrea si courseId o unitId cambian
    [options.courseId, options.unitId]
  );

  // Función para resetear el progreso y errores (útil para cambiar archivo)
  const resetProgress = useCallback(() => {
    setProgress({ loaded: 0, total: 0, percentage: 0 });
    setError(null);
  }, []);

  return {
    upload,
    isLoading,
    progress,
    error,
    resetProgress,
  };
}
