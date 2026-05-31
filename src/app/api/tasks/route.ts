/* Archivo: src\app\api\tasks\route.ts
  Descripción: Endpoint API para listar y crear tareas (búsqueda y paginación). */

// API: Endpoints para tareas (listar, crear y operaciones relacionadas)
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/database/database';
import Task from '@/models/Task';
import Unit from '@/models/Unit';
import Course from '@/models/Course';
import User from '@/models/User';
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
  createTaskSchema,
  type CreateTaskInput,
} from '@/lib/validators/validators';
import { withErrorHandling } from '@/lib/api/middleware';
import mongoose from 'mongoose';

/**
 * GET /api/tasks
 * Obtiene la lista de tareas
 *
 * Query parameters:
 * - courseId?: string - Filtrar por curso (requerido)
 * - limit?: number - Límite de resultados (default: 50, max: 100)
 * - page?: number - Número de página (default: 1)
 *
 * Respuestas:
 * - 200: Lista de tareas obtenida exitosamente
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
    const [total, tasks] = await Promise.all([
      Task.countDocuments({ unitId }),
      Task.find({ unitId })
        .select('_id unitId courseId title type maxPoints startDate dueDate active createdAt updatedAt')
        .populate('createdById', 'email firstName')
        .sort({ dueDate: 1 })
        .limit(limit)
        .skip(skip)
        .lean(),
    ]);

    logInfo('Tareas obtenidas', {
      unitId,
      total,
      page,
      limit,
      count: tasks.length,
      requestId,
    });

    return successResponse(
      {
        items: tasks,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
      'Tareas obtenidas exitosamente',
      200,
      requestId
    );
  },
  'GET /tasks'
);

/**
 * POST /api/tasks
 * Crea una nueva tarea
 *
 * Body esperado:
 * ```
 * {
 *   courseId: string (ID de MongoDB válido)
 *   subjectId: string (ID de MongoDB válido)
 *   title: string (3-200 caracteres)
 *   description: string (requerido)
 *   type?: "assignment" | "quiz" | "forum" | "project" (default: "assignment")
 *   maxPoints?: number (default: 100)
 *   startDate: string (ISO datetime)
 *   dueDate: string (ISO datetime)
 *   allowLateSubmission?: boolean (default: false)
 *   active?: boolean (default: true)
 *   image?: string
 *   priority?: "low" | "medium" | "high"
 * }
 * ```
 *
 * Respuestas:
 * - 201: Tarea creada exitosamente
 * - 400: Validación fallida
 * - 401: No autenticado
 * - 403: Sin permisos para crear tarea
 * - 404: Curso o materia no encontrado
 * - 500: Error del servidor
 */
export const POST = withErrorHandling(
  async (request: NextRequest, requestId) => {
    const dbPromise = connectDB();
    const [validationResult, userId] = await Promise.all([
      validateRequest<CreateTaskInput>(request, createTaskSchema, 'createTask'),
      requireAuthMiddleware(request),
    ]);

    if (!validationResult.success) {
      return validationErrorResponse(validationResult.errors, requestId);
    }

    const {
      courseId,
      unitId,
      title,
      description,
      type,
      maxPoints,
      startDate,
      dueDate,
      allowLateSubmission,
      active,
      image,
      priority,
    } = validationResult.data;

    await dbPromise;

    // Verificar que el curso existe y el usuario tiene permisos
    const [course, unit, creator] = await Promise.all([
      Course.findById(courseId),
      Unit.findById(unitId),
      User.findById(userId).lean(),
    ]);

    if (!course) {
      return notFoundResponse('Curso', requestId);
    }

    if (!unit) {
      return notFoundResponse('Unidad', requestId);
    }

    if (!creator) {
      return notFoundResponse('Usuario creador', requestId);
    }

    // Solo el propietario o profesores pueden crear tareas
    const isOwner = course.ownerId.toString() === userId;
    const isTeacher = course.teachers.some(
      (teacherId: mongoose.Types.ObjectId) => teacherId.toString() === userId
    );

    if (!isOwner && !isTeacher) {
      return forbiddenResponse(requestId);
    }

    // Crear tarea
    const task = await Task.create({
      courseId: new mongoose.Types.ObjectId(courseId),
      unitId: new mongoose.Types.ObjectId(unitId),
      createdById: new mongoose.Types.ObjectId(userId),
      title,
      description,
      type: type || 'assignment',
      maxPoints: maxPoints || 100,
      startDate,
      dueDate,
      allowLateSubmission: allowLateSubmission || false,
      active: active !== false,
      image,
      priority: priority || 'medium',
      criteria: [],
    });

    // Actualizar subject: agregar tarea a taskIds
    await Unit.findByIdAndUpdate(
      unitId,
      { $push: { taskIds: task._id } }
    );

    logInfo('Tarea creada', {
      taskId: task._id.toString(),
      unitId,
      courseId,
      createdBy: userId,
      requestId,
    });

    return createdResponse(
      {
        id: task._id.toString(),
        courseId: task.courseId.toString(),
        unitId: task.unitId ? task.unitId.toString() : undefined,
        title: task.title,
        description: task.description,
        type: task.type,
        maxPoints: task.maxPoints,
        startDate: task.startDate,
        dueDate: task.dueDate,
        allowLateSubmission: task.allowLateSubmission,
        active: task.active,
        image: task.image,
        priority: task.priority,
        createdAt: task.createdAt,
      },
      'Tarea creada exitosamente',
      requestId
    );
  },
  'POST /tasks'
);
