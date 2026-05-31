import { NextRequest } from 'next/server';
import { uploadToR2 } from '@/lib/r2';
import { connectDB } from '@/lib/database/database';
import { logInfo, logError } from '@/config/logger';
import { requireAuthMiddleware } from '@/lib/api/auth-helpers';
import {
  successResponse,
  validationErrorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
} from '@/lib/api/response-handler';
import { withErrorHandling } from '@/lib/api/middleware';
import Course from '@/models/Course';
import Unit from '@/models/Unit';
import mongoose from 'mongoose';

// Tipos MIME permitidos para documentos, imágenes, video, audio y archivos comprimidos
const ALLOWED_MIME_TYPES = new Set([
  // Documentos de oficina
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
  'application/rtf',
  'application/vnd.oasis.opendocument.text',
  'application/vnd.oasis.opendocument.spreadsheet',
  'application/vnd.oasis.opendocument.presentation',
  // Imágenes (formatos web modernos)
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/bmp',
  'image/tiff',
  // Multimedia
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'audio/webm',
  // Archivos comprimidos
  'application/zip',
  'application/x-zip-compressed',
  'application/x-rar-compressed',
  'application/x-7z-compressed',
  // Fallback común cuando el navegador no identifica tipo
  'application/octet-stream',
]);

// Extensiones permitidas para fallback cuando file.type viene vacío o genérico
const ALLOWED_EXTENSIONS = new Set([
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
  '.txt', '.csv', '.rtf', '.odt', '.ods', '.odp',
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.tif', '.tiff',
  '.mp4', '.webm', '.mov',
  '.mp3', '.wav', '.ogg',
  '.zip', '.rar', '.7z',
]);

function getFileExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf('.');
  if (lastDot < 0) return '';
  return fileName.slice(lastDot).toLowerCase();
}

function isFileTypeAllowed(file: File): boolean {
  const extension = getFileExtension(file.name);
  const hasAllowedExtension = ALLOWED_EXTENSIONS.has(extension);
  const mime = (file.type || '').toLowerCase();

  // 1) MIME permitido directo
  if (mime && ALLOWED_MIME_TYPES.has(mime)) return true;

  // 2) Algunos navegadores mandan vacío o octet-stream para tipos válidos
  if (!mime || mime === 'application/octet-stream') return hasAllowedExtension;

  // 3) Si MIME no está permitido, aún permitimos por extensión conocida
  return hasAllowedExtension;
}

// Límite máximo de tamaño: 50MB (5MB sugerido para mejor performance)
const MAX_FILE_SIZE = 50 * 1024 * 1024;

/**
 * POST /api/resources/upload
 * Sube un archivo a Cloudflare R2 y retorna la URL pública
 *
 * Body esperado:
 * FormData con:
 * - file: File (requerido)
 * - courseId: string (ID de MongoDB válido, requerido)
 * - unitId: string (ID de MongoDB válido, requerido)
 *
 * Respuestas:
 * - 200: Archivo subido exitosamente
 * - 400: Validación fallida
 * - 401: No autenticado
 * - 403: Sin permisos
 * - 404: Curso o unidad no encontrado
 * - 500: Error del servidor
 */
export const POST = withErrorHandling(
  async (request: NextRequest, requestId) => {
    // Obtener ID del usuario autenticado (lanza error 401 si no está autenticado)
    const userId = await requireAuthMiddleware(request);

    /**
     * PASO 1: Parsear FormData
     * El cliente envía un FormData multipart con: file, courseId, unitId
     */
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch (error) {
      logError('Error al parsear FormData', { error: String(error), requestId });
      return validationErrorResponse(
        { file: ['No se pudo procesar el formulario'] },
        requestId
      );
    }

    // Extraer parámetros del FormData
    const file = formData.get('file') as File | null;
    const courseId = formData.get('courseId') as string | null;
    const unitId = formData.get('unitId') as string | null;

    /**
     * PASO 2: Validar archivo
     * - Existe
     * - No está vacío
     * - No excede límite de tamaño (50MB)
     * - Tiene tipo MIME permitido
     */
    const errors: Record<string, string[]> = {};

    if (!file) {
      errors.file = ['El archivo es requerido'];
    } else if (file.size === 0) {
      errors.file = ['El archivo está vacío'];
    } else if (file.size > MAX_FILE_SIZE) {
      errors.file = [
        `El archivo excede el límite de ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
      ];
    } else if (!isFileTypeAllowed(file)) {
      errors.file = [
        `Tipo de archivo no permitido: ${file.type || 'sin MIME'} (${file.name})`,
      ];
    }

    /**
     * PASO 3: Validar IDs de MongoDB
     * - courseId es requerido y debe ser ObjectId válido
     * - unitId es requerido y debe ser ObjectId válido
     */
    if (!courseId) {
      errors.courseId = ['El ID del curso es requerido'];
    } else if (!mongoose.Types.ObjectId.isValid(courseId)) {
      errors.courseId = ['ID de curso inválido'];
    }

    if (!unitId) {
      errors.unitId = ['El ID de la unidad es requerido'];
    } else if (!mongoose.Types.ObjectId.isValid(unitId)) {
      errors.unitId = ['ID de unidad inválido'];
    }

    // Si hay errores de validación, retornar 400 con detalles
    if (Object.keys(errors).length > 0) {
      return validationErrorResponse(errors, requestId);
    }

    // Conectar a la base de datos para verificaciones de permisos
    await connectDB();

    /**
     * PASO 4: Verificar que el curso existe
     * Si no existe, retornar 404
     */
    const course = await Course.findById(courseId);
    if (!course) {
      return notFoundResponse('Curso', requestId);
    }

    /**
     * PASO 5: Verificar que la unidad existe Y pertenece al curso
     * - Si la unidad no existe, retornar 404
     * - Si la unidad no pertenece al curso, retornar 400
     */
    const unit = await Unit.findById(unitId);
    if (!unit) {
      return notFoundResponse('Unidad', requestId);
    }

    if (unit.courseId.toString() !== courseId) {
      return validationErrorResponse(
        { unitId: ['La unidad no pertenece al curso especificado'] },
        requestId
      );
    }

    /**
     * PASO 6: Verificar permisos
     * Solo el dueño del curso o un profesor pueden subir recursos
     * Si no tiene permiso, retornar 403 Forbidden
     */
    const isOwner = course.ownerId.toString() === userId;
    const isTeacher = course.teachers.some(
      (teacherId: mongoose.Types.ObjectId) => teacherId.toString() === userId
    );

    if (!isOwner && !isTeacher) {
      return forbiddenResponse(requestId);
    }

    try {
      /**
       * PASO 7: Preparar archivo para R2
       * 1. Convertir File a Uint8Array (formato que AWS SDK acepta)
       * 2. Generar nombre único para el archivo en R2
       *    Estructura: resources/{courseId}/{unitId}/{timestamp}-{nombreArchivo}
       */
      // Obtener el contenido del archivo en formato binary
      const buffer = await file!.arrayBuffer();
      const uint8Array = new Uint8Array(buffer);

      // Generar nombre único con timestamp para evitar colisiones
      const timestamp = Date.now();
      // Sanitizar nombre del archivo (remove caracteres especiales)
      const sanitizedFileName = file!.name
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .substring(0, 100);
      // Path completo en R2: estructura jerárquica por curso y unidad
      const fileName = `resources/${courseId}/${unitId}/${timestamp}-${sanitizedFileName}`;

      /**
       * PASO 8: Subir archivo a R2
       * Llamar a la función uploadToR2 que usa AWS SDK para S3
       * Retorna URL pública del archivo
       */
      const publicUrl = await uploadToR2(
        uint8Array,
        fileName,
        file!.type || 'application/octet-stream'
      );

      // Registrar en logs para auditoría (quién subió qué archivo y cuándo)
      logInfo('Archivo subido a R2 exitosamente', {
        fileName,
        fileSize: file!.size,
        mimeType: file!.type,
        courseId,
        unitId,
        uploadedBy: userId,
        requestId,
      });

      /**
       * PASO 9: Retornar respuesta exitosa (200)
       * Incluir URL pública y metadatos del archivo
       */
      return successResponse(
        {
          url: publicUrl,  // URL para acceder al archivo desde internet
          fileName: file!.name,  // Nombre original del archivo
          fileSize: file!.size,  // Tamaño en bytes
          mimeType: file!.type,  // Tipo MIME detectado
        },
        'Archivo subido exitosamente',
        200,
        requestId
      );
    } catch (error) {
      /**
       * PASO 10: Manejo de errores
       * Si falla la subida a R2, registrar el error y retornar 400
       */
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido al subir a R2';

      logError('Error al subir archivo a R2', {
        error: String(error),
        fileName: file!.name,
        courseId,
        unitId,
        requestId,
      });

      return validationErrorResponse(
        { file: [errorMessage] },
        requestId
      );
    }
  },
  'POST /resources/upload'
);
