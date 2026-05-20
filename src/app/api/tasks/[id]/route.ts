import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/database/database';
import Task from '@/models/Task';
import Subject from '@/models/Subject';
import Course from '@/models/Course';
import { logInfo } from '@/config/logger';
import { validateRequest } from '@/lib/validators/api-validation';
import {
  successResponse,
  validationErrorResponse,
  notFoundResponse,
  unauthorizedResponse,
  forbiddenResponse,
} from '@/lib/api/response-handler';
import { requireAuthMiddleware } from '@/lib/api/auth-helpers';
import {
  updateTaskSchema,
  type UpdateTaskInput,
} from '@/lib/validators/validators';
import { withErrorHandlingParams } from '@/lib/api/middleware';
import mongoose from 'mongoose';

/**
 * GET /api/tasks/[id]
 * Obtiene los detalles de una tarea específica
 *
 * Respuestas:
 * - 200: Tarea obtenida exitosamente
 * - 400: ID inválido
 * - 404: Tarea no encontrada
 * - 500: Error del servidor
 */
export const GET = withErrorHandlingParams<{ id: string }>(
  async (request: NextRequest, context, requestId) => {
    await requireAuthMiddleware(request);
    const { id } = await context.params;

    // Validar ObjectId (sync check antes de cualquier await)
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return validationErrorResponse({ id: ['ID de tarea inválido'] }, requestId);
    }

    await connectDB();

    const task = await Task.findById(id)
      .populate('createdById', 'email firstName profile.lastName')
      .lean();

    if (!task) {
      return notFoundResponse('Tarea', requestId);
    }

    logInfo('Tarea obtenida', { taskId: id, requestId });

    return successResponse(
      {
        id: task._id.toString(),
        courseId: task.courseId.toString(),
        subjectId: task.subjectId.toString(),
        title: task.title,
        description: task.description,
        type: task.type,
        maxPoints: task.maxPoints,
        startDate: task.startDate,
        dueDate: task.dueDate,
        allowLateSubmission: task.allowLateSubmission,
        active: task.active,
        criteria: task.criteria || [],
        createdBy: task.createdById,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      },
      'Tarea obtenida exitosamente',
      200,
      requestId
    );
  },
  'GET /tasks/[id]'
);

/**
 * PATCH /api/tasks/[id]
 * Actualiza una tarea existente
 *
 * Body esperado:
 * ```
 * {
 *   title?: string (3-200 caracteres)
 *   description?: string
 *   type?: "assignment" | "quiz" | "forum" | "project"
 *   maxPoints?: number
 *   startDate?: string (ISO datetime)
 *   dueDate?: string (ISO datetime)
 *   allowLateSubmission?: boolean
 *   active?: boolean
 * }
 * ```
 *
 * Respuestas:
 * - 200: Tarea actualizada exitosamente
 * - 400: Validación fallida
 * - 401: No autenticado
 * - 403: Sin permisos para actualizar
 * - 404: Tarea no encontrada
 * - 500: Error del servidor
 */
export const PATCH = withErrorHandlingParams<{ id: string }>(
  async (request: NextRequest, context, requestId) => {
    const { id } = await context.params;

    // Sync check barato primero
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return validationErrorResponse({ id: ['ID de tarea inválido'] }, requestId);
    }

    // Lanzar operaciones independientes en paralelo
    const dbPromise = connectDB();
    const [validationResult, userId] = await Promise.all([
      validateRequest<UpdateTaskInput>(request, updateTaskSchema, 'updateTask'),
      requireAuthMiddleware(request),
    ]);

    if (!validationResult.success) {
      return validationErrorResponse(validationResult.errors, requestId);
    }

    const updateData = validationResult.data;

    await dbPromise;

    // Obtener tarea y verificar permisos
    const task = await Task.findById(id);

    if (!task) {
      return notFoundResponse('Tarea', requestId);
    }

    // Verificar permisos: owner o teacher del curso, o creador de la tarea
    const course = await Course.findById(task.courseId);

    if (!course) {
      return notFoundResponse('Curso', requestId);
    }

    const isOwner = course.ownerId.toString() === userId;
    const isTeacher = course.teachers.some(
      (teacherId: mongoose.Types.ObjectId) => teacherId.toString() === userId
    );
    const isCreator = task.createdById.toString() === userId;

    if (!isOwner && !isTeacher && !isCreator) {
      return forbiddenResponse(requestId);
    }

    // Actualizar campos
    if (updateData.title) task.title = updateData.title;
    if (updateData.description) task.description = updateData.description;
    if (updateData.type) task.type = updateData.type;
    if (updateData.maxPoints !== undefined) task.maxPoints = updateData.maxPoints;
    if (updateData.startDate) task.startDate = updateData.startDate;
    if (updateData.dueDate) task.dueDate = updateData.dueDate;
    if (updateData.allowLateSubmission !== undefined) task.allowLateSubmission = updateData.allowLateSubmission;
    if (updateData.active !== undefined) task.active = updateData.active;

    task.updatedAt = new Date();
    await task.save();

    logInfo('Tarea actualizada', {
      taskId: id,
      courseId: task.courseId.toString(),
      updatedBy: userId,
      requestId,
    });

    return successResponse(
      {
        id: task._id.toString(),
        courseId: task.courseId.toString(),
        subjectId: task.subjectId.toString(),
        title: task.title,
        description: task.description,
        type: task.type,
        maxPoints: task.maxPoints,
        startDate: task.startDate,
        dueDate: task.dueDate,
        allowLateSubmission: task.allowLateSubmission,
        active: task.active,
        updatedAt: task.updatedAt,
      },
      'Tarea actualizada exitosamente',
      200,
      requestId
    );
  },
  'PATCH /tasks/[id]'
);

/**
 * DELETE /api/tasks/[id]
 * Elimina una tarea
 *
 * Respuestas:
 * - 200: Tarea eliminada exitosamente
 * - 400: ID inválido
 * - 401: No autenticado
 * - 403: Sin permisos para eliminar
 * - 404: Tarea no encontrada
 * - 500: Error del servidor
 */
export const DELETE = withErrorHandlingParams<{ id: string }>(
  async (request: NextRequest, context, requestId) => {
    const { id } = await context.params;

    // Sync check barato primero
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return validationErrorResponse({ id: ['ID de tarea inválido'] }, requestId);
    }

    // Auth + DB en paralelo
    const [userId] = await Promise.all([
      requireAuthMiddleware(request),
      connectDB(),
    ]);

    // Obtener tarea
    const task = await Task.findById(id);

    if (!task) {
      return notFoundResponse('Tarea', requestId);
    }

    // Verificar permisos: owner o teacher del curso, o creador de la tarea
    const course = await Course.findById(task.courseId);

    if (!course) {
      return notFoundResponse('Curso', requestId);
    }

    const isOwner = course.ownerId.toString() === userId;
    const isTeacher = course.teachers.some(
      (teacherId: mongoose.Types.ObjectId) => teacherId.toString() === userId
    );
    const isCreator = task.createdById.toString() === userId;

    if (!isOwner && !isTeacher && !isCreator) {
      return forbiddenResponse(requestId);
    }

    // Eliminar tarea
    await Task.findByIdAndDelete(id);

    // Actualizar subject: remover tarea de taskIds
    await Subject.findByIdAndUpdate(
      task.subjectId,
      { $pull: { taskIds: new mongoose.Types.ObjectId(id) } }
    );

    logInfo('Tarea eliminada', {
      taskId: id,
      courseId: task.courseId.toString(),
      subjectId: task.subjectId.toString(),
      deletedBy: userId,
      requestId,
    });

    return successResponse(
      null,
      'Tarea eliminada exitosamente',
      200,
      requestId
    );
  },
  'DELETE /tasks/[id]'
);
