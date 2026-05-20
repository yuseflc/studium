import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/database/database';
import Subject from '@/models/Subject';
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
  createSubjectSchema,
  type CreateSubjectInput,
} from '@/lib/validators/validators';
import { withErrorHandling } from '@/lib/api/middleware';
import mongoose from 'mongoose';

/**
 * GET /api/subjects
 * Obtiene la lista de materias
 *
 * Query parameters:
 * - courseId?: string - Filtrar por curso (requerido)
 * - limit?: number - Límite de resultados (default: 50, max: 100)
 * - page?: number - Número de página (default: 1)
 *
 * Respuestas:
 * - 200: Lista de materias obtenida exitosamente
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
    const [total, subjects] = await Promise.all([
      Subject.countDocuments({ courseId }),
      Subject.find({ courseId })
        .select('_id courseId title description order unitIds taskIds createdAt updatedAt')
        .sort({ order: 1 })
        .limit(limit)
        .skip(skip)
        .lean(),
    ]);

    logInfo('Materias obtenidas', {
      courseId,
      total,
      page,
      limit,
      count: subjects.length,
      requestId,
    });

    return successResponse(
      {
        items: subjects,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
      'Materias obtenidas exitosamente',
      200,
      requestId
    );
  },
  'GET /subjects'
);

/**
 * POST /api/subjects
 * Crea una nueva materia
 *
 * Body esperado:
 * ```
 * {
 *   courseId: string (ID de MongoDB válido)
 *   title: string (3-200 caracteres)
 *   description?: string (máx 1000 caracteres)
 *   order?: number (default: 0)
 * }
 * ```
 *
 * Respuestas:
 * - 201: Materia creada exitosamente
 * - 400: Validación fallida
 * - 401: No autenticado
 * - 403: Sin permisos para crear materia
 * - 404: Curso no encontrado
 * - 500: Error del servidor
 */
export const POST = withErrorHandling(
  async (request: NextRequest, requestId) => {
    const dbPromise = connectDB();
    const [validationResult, userId] = await Promise.all([
      validateRequest<CreateSubjectInput>(request, createSubjectSchema, 'createSubject'),
      requireAuthMiddleware(request),
    ]);

    if (!validationResult.success) {
      return validationErrorResponse(validationResult.errors, requestId);
    }

    const { courseId, title, description, order } = validationResult.data;

    await dbPromise;

    // Verificar que el curso existe y el usuario tiene permisos
    const course = await Course.findById(courseId);

    if (!course) {
      return notFoundResponse('Curso', requestId);
    }

    // Solo el propietario o profesores pueden crear materias
    const isOwner = course.ownerId.toString() === userId;
    const isTeacher = course.teachers.some(
      (teacherId: mongoose.Types.ObjectId) => teacherId.toString() === userId
    );

    if (!isOwner && !isTeacher) {
      return forbiddenResponse(requestId);
    }

    // Crear materia
    const subject = await Subject.create({
      courseId: new mongoose.Types.ObjectId(courseId),
      title,
      description,
      order: order || 0,
      unitIds: [],
      taskIds: [],
    });

    logInfo('Materia creada', {
      subjectId: subject._id.toString(),
      courseId,
      createdBy: userId,
      requestId,
    });

    return createdResponse(
      {
        id: subject._id.toString(),
        courseId: subject.courseId.toString(),
        title: subject.title,
        description: subject.description,
        order: subject.order,
        unitIds: subject.unitIds,
        taskIds: subject.taskIds,
        createdAt: subject.createdAt,
      },
      'Materia creada exitosamente',
      requestId
    );
  },
  'POST /subjects'
);
