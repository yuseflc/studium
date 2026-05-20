import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/database/database';
import Resource from '@/models/Resource';
import Unit from '@/models/Unit';
import Course from '@/models/Course';
import { logInfo } from '@/config/logger';
import { validateRequest } from '@/lib/validators/api-validation';
import {
  successResponse,
  createdResponse,
  validationErrorResponse,
  notFoundResponse,
  unauthorizedResponse,
  forbiddenResponse,
} from '@/lib/api/response-handler';
import { requireAuthMiddleware } from '@/lib/api/auth-helpers';
import {
  createResourceSchema,
  type CreateResourceInput,
} from '@/lib/validators/validators';
import { withErrorHandling } from '@/lib/api/middleware';
import mongoose from 'mongoose';

/**
 * GET /api/resources
 * Obtiene la lista de recursos
 *
 * Query parameters:
 * - unitId?: string - Filtrar por unidad (requerido)
 * - limit?: number - Límite de resultados (default: 50, max: 100)
 * - page?: number - Número de página (default: 1)
 *
 * Respuestas:
 * - 200: Lista de recursos obtenida exitosamente
 * - 400: Validación fallida
 * - 500: Error del servidor
 */
export const GET = withErrorHandling(
  async (request: NextRequest, requestId) => {
    const dbPromise = connectDB();
    await requireAuthMiddleware(request);

    await dbPromise;

    const { searchParams } = new URL(request.url);
    const unitId = searchParams.get('unitId');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
    const skip = (page - 1) * limit;

    // unitId es requerido
    if (!unitId) {
      return validationErrorResponse({ unitId: ['unitId es requerido'] }, requestId);
    }

    if (!mongoose.Types.ObjectId.isValid(unitId)) {
      return validationErrorResponse({ unitId: ['ID de unidad inválido'] }, requestId);
    }

    // Paralelizar count y data query
    const [total, resources] = await Promise.all([
      Resource.countDocuments({ unitId }),
      Resource.find({ unitId })
        .select('_id unitId courseId title type url description createdAt updatedAt')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean(),
    ]);

    logInfo('Recursos obtenidos', {
      unitId,
      total,
      page,
      limit,
      count: resources.length,
      requestId,
    });

    return successResponse(
      {
        items: resources,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
      'Recursos obtenidos exitosamente',
      200,
      requestId
    );
  },
  'GET /resources'
);

/**
 * POST /api/resources
 * Crea un nuevo recurso
 *
 * Body esperado:
 * ```
 * {
 *   unitId: string (ID de MongoDB válido)
 *   courseId: string (ID de MongoDB válido)
 *   title: string (3-200 caracteres)
 *   type: "link" | "file" | "text" (requerido)
 *   url?: string (requerido si type es "link")
 *   description?: string (máx 500 caracteres)
 * }
 * ```
 *
 * Respuestas:
 * - 201: Recurso creado exitosamente
 * - 400: Validación fallida
 * - 401: No autenticado
 * - 403: Sin permisos para crear recurso
 * - 404: Curso o unidad no encontrado
 * - 500: Error del servidor
 */
export const POST = withErrorHandling(
  async (request: NextRequest, requestId) => {
    const dbPromise = connectDB();
    const [validationResult, userId] = await Promise.all([
      validateRequest<CreateResourceInput>(request, createResourceSchema, 'createResource'),
      requireAuthMiddleware(request),
    ]);

    if (!validationResult.success) {
      return validationErrorResponse(validationResult.errors, requestId);
    }

    const { unitId, courseId, title, type, url, description } = validationResult.data;

    await dbPromise;

    // Verificar que el curso existe y el usuario tiene permisos
    const [course, unit] = await Promise.all([
      Course.findById(courseId),
      Unit.findById(unitId),
    ]);

    if (!course) {
      return notFoundResponse('Curso', requestId);
    }

    if (!unit) {
      return notFoundResponse('Unidad', requestId);
    }

    // Solo el propietario o profesores pueden crear recursos
    const isOwner = course.ownerId.toString() === userId;
    const isTeacher = course.teachers.some(
      (teacherId: mongoose.Types.ObjectId) => teacherId.toString() === userId
    );

    if (!isOwner && !isTeacher) {
      return forbiddenResponse(requestId);
    }

    // Crear recurso
    const resource = await Resource.create({
      unitId: new mongoose.Types.ObjectId(unitId),
      courseId: new mongoose.Types.ObjectId(courseId),
      title,
      type,
      url,
      description,
    });

    // Actualizar unit: agregar recurso a resourceIds
    await Unit.findByIdAndUpdate(
      unitId,
      { $push: { resourceIds: resource._id } }
    );

    logInfo('Recurso creado', {
      resourceId: resource._id.toString(),
      unitId,
      courseId,
      createdBy: userId,
      requestId,
    });

    return createdResponse(
      {
        id: resource._id.toString(),
        unitId: resource.unitId.toString(),
        courseId: resource.courseId.toString(),
        title: resource.title,
        type: resource.type,
        url: resource.url,
        description: resource.description,
        createdAt: resource.createdAt,
      },
      'Recurso creado exitosamente',
      requestId
    );
  },
  'POST /resources'
);
