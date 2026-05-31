/* Archivo: src\app\api\units\route.ts
  Descripción: Endpoint API para listar y crear unidades dentro de un curso (GET, POST). */

// API: Endpoints para unidades del curso (listar, crear)
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/database/database';
import Unit from '@/models/Unit';
// Subject removed; units are associated directly to Course
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
  createUnitSchema,
  type CreateUnitInput,
} from '@/lib/validators/validators';
import { withErrorHandling } from '@/lib/api/middleware';
import mongoose from 'mongoose';

/**
 * GET /api/units
 * Obtiene la lista de unidades
 *
 * Query parameters:
 * - courseId?: string - Filtrar por curso (requerido)
 * - limit?: number - Límite de resultados (default: 50, max: 100)
 * - page?: number - Número de página (default: 1)
 *
 * Respuestas:
 * - 200: Lista de unidades obtenida exitosamente
 * - 400: Validación fallida
 * - 500: Error del servidor
 */
export const GET = withErrorHandling(
  async (request: NextRequest, requestId) => {
    const dbPromise = connectDB();
    await requireAuthMiddleware(request);

    await dbPromise;

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
    const skip = (page - 1) * limit;

    // courseId es requerido
    if (!courseId) {
      return validationErrorResponse({ courseId: ['courseId es requerido'] }, requestId);
    }

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return validationErrorResponse({ courseId: ['ID de curso inválido'] }, requestId);
    }

    // Paralelizar count y data query
    const [total, units] = await Promise.all([
      Unit.countDocuments({ courseId }),
      Unit.find({ courseId })
        .select('_id courseId title content order resourceIds createdAt updatedAt')
        .sort({ order: 1 })
        .limit(limit)
        .skip(skip)
        .lean(),
    ]);

    logInfo('Unidades obtenidas', {
      courseId,
      total,
      page,
      limit,
      count: units.length,
      requestId,
    });

    return successResponse(
      {
        items: units,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
      'Unidades obtenidas exitosamente',
      200,
      requestId
    );
  },
  'GET /units'
);

/**
 * POST /api/units
 * Crea una nueva unidad
 *
 * Body esperado:
 * ```
 * {
 *   subjectId: string (ID de MongoDB válido)
 *   courseId: string (ID de MongoDB válido)
 *   title: string (3-200 caracteres)
 *   content: string (requerido)
 *   order?: number (default: 0)
 * }
 * ```
 *
 * Respuestas:
 * - 201: Unidad creada exitosamente
 * - 400: Validación fallida
 * - 401: No autenticado
 * - 403: Sin permisos para crear unidad
 * - 404: Curso o materia no encontrado
 * - 500: Error del servidor
 */
export const POST = withErrorHandling(
  async (request: NextRequest, requestId) => {
    const dbPromise = connectDB();
    const [validationResult, userId] = await Promise.all([
      validateRequest<CreateUnitInput>(request, createUnitSchema, 'createUnit'),
      requireAuthMiddleware(request),
    ]);

    if (!validationResult.success) {
      return validationErrorResponse(validationResult.errors, requestId);
    }

    const { courseId, title, content, order } = validationResult.data;

    await dbPromise;

    // Verificar que el curso existe y el usuario tiene permisos
    const course = await Course.findById(courseId);

    if (!course) {
      return notFoundResponse('Curso', requestId);
    }

    // No Subject check: units are directly under course

    // Solo el propietario o profesores pueden crear unidades
    const isOwner = course.ownerId.toString() === userId;
    const isTeacher = course.teachers.some(
      (teacherId: mongoose.Types.ObjectId) => teacherId.toString() === userId
    );

    if (!isOwner && !isTeacher) {
      return forbiddenResponse(requestId);
    }

    // Crear unidad
    const unit = await Unit.create({
      courseId: new mongoose.Types.ObjectId(courseId),
      title,
      content,
      order: order || 0,
      resourceIds: [],
      taskIds: [],
    });

    // Añadir unidad al curso
    await Course.findByIdAndUpdate(courseId, { $push: { unitIds: unit._id } });

    logInfo('Unidad creada', {
      unitId: unit._id.toString(),
      courseId,
      createdBy: userId,
      requestId,
    });

    return createdResponse(
      {
        id: unit._id.toString(),
        courseId: unit.courseId.toString(),
        title: unit.title,
        content: unit.content,
        order: unit.order,
        resourceIds: unit.resourceIds,
        createdAt: unit.createdAt,
      },
      'Unidad creada exitosamente',
      requestId
    );
  },
  'POST /units'
);
