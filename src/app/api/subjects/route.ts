import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/database/database';
import Subject from '@/models/Subject';
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

    // For compatibility: prefer Subjects if they exist, otherwise return Units as subject-shaped items
    const subjectCount = await Subject.countDocuments({ courseId });
    let total = 0;
    let items: any[] = [];

    if (subjectCount > 0) {
      total = subjectCount;
      items = await Subject.find({ courseId })
        .select('_id courseId title description order unitIds taskIds createdAt updatedAt')
        .sort({ order: 1 })
        .limit(limit)
        .skip(skip)
        .lean();
    } else {
      // No subjects: return units as compatibility "subjects"
      total = await Unit.countDocuments({ courseId });
      const units = await Unit.find({ courseId })
        .select('_id courseId title content order taskIds resourceIds createdAt updatedAt')
        .sort({ order: 1 })
        .limit(limit)
        .skip(skip)
        .lean();

      items = units.map((u: any) => ({
        _id: u._id,
        courseId: u.courseId,
        title: u.title,
        description: u.content || '',
        order: u.order,
        unitIds: [u._id],
        taskIds: u.taskIds || [],
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      }));
    }

    logInfo('Materias obtenidas', {
      courseId,
      total,
      page,
      limit,
      count: items.length,
      requestId,
    });

    return successResponse(
      {
        items,
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

    // Compatibility: create a Unit (preferred) and return shape compatible with Subject
    const unit = await Unit.create({
      courseId: new mongoose.Types.ObjectId(courseId),
      title,
      content: description || '',
      order: order || 0,
      resourceIds: [],
      taskIds: [],
    });

    // Ensure course.unitIds includes this unit
    await Course.findByIdAndUpdate(courseId, { $addToSet: { unitIds: unit._id } });

    logInfo('Unidad creada (compat subject)', {
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
        description: unit.content,
        order: unit.order,
        unitIds: [unit._id],
        taskIds: unit.taskIds,
        createdAt: unit.createdAt,
      },
      'Materia (unidad) creada exitosamente',
      requestId
    );
  },
  'POST /subjects'
);
