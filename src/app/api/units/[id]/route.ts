import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/database/database';
import Unit from '@/models/Unit';
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
  updateUnitSchema,
  type UpdateUnitInput,
} from '@/lib/validators/validators';
import { withErrorHandlingParams } from '@/lib/api/middleware';
import mongoose from 'mongoose';

/**
 * GET /api/units/[id]
 * Obtiene los detalles de una unidad específica
 *
 * Respuestas:
 * - 200: Unidad obtenida exitosamente
 * - 400: ID inválido
 * - 404: Unidad no encontrada
 * - 500: Error del servidor
 */
export const GET = withErrorHandlingParams<{ id: string }>(
  async (request: NextRequest, context, requestId) => {
    await requireAuthMiddleware(request);
    const { id } = await context.params;

    // Validar ObjectId (sync check antes de cualquier await)
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return validationErrorResponse({ id: ['ID de unidad inválido'] }, requestId);
    }

    await connectDB();

    const unit = await Unit.findById(id)
      .populate('resourceIds', '_id title type url description')
      .lean();

    if (!unit) {
      return notFoundResponse('Unidad', requestId);
    }

    logInfo('Unidad obtenida', { unitId: id, requestId });

    return successResponse(
      {
        id: unit._id.toString(),
        subjectId: unit.subjectId.toString(),
        courseId: unit.courseId.toString(),
        title: unit.title,
        content: unit.content,
        order: unit.order,
        resources: unit.resourceIds || [],
        createdAt: unit.createdAt,
        updatedAt: unit.updatedAt,
      },
      'Unidad obtenida exitosamente',
      200,
      requestId
    );
  },
  'GET /units/[id]'
);

/**
 * PATCH /api/units/[id]
 * Actualiza una unidad existente
 *
 * Body esperado:
 * ```
 * {
 *   title?: string (3-200 caracteres)
 *   content?: string (requerido si se incluye)
 *   order?: number
 * }
 * ```
 *
 * Respuestas:
 * - 200: Unidad actualizada exitosamente
 * - 400: Validación fallida
 * - 401: No autenticado
 * - 403: Sin permisos para actualizar
 * - 404: Unidad no encontrada
 * - 500: Error del servidor
 */
export const PATCH = withErrorHandlingParams<{ id: string }>(
  async (request: NextRequest, context, requestId) => {
    const { id } = await context.params;

    // Sync check barato primero
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return validationErrorResponse({ id: ['ID de unidad inválido'] }, requestId);
    }

    // Lanzar operaciones independientes en paralelo
    const dbPromise = connectDB();
    const [validationResult, userId] = await Promise.all([
      validateRequest<UpdateUnitInput>(request, updateUnitSchema, 'updateUnit'),
      requireAuthMiddleware(request),
    ]);

    if (!validationResult.success) {
      return validationErrorResponse(validationResult.errors, requestId);
    }

    const updateData = validationResult.data;

    await dbPromise;

    // Obtener unidad y verificar permisos
    const unit = await Unit.findById(id);

    if (!unit) {
      return notFoundResponse('Unidad', requestId);
    }

    // Verificar permisos: owner o teacher del curso
    const course = await Course.findById(unit.courseId);

    if (!course) {
      return notFoundResponse('Curso', requestId);
    }

    const isOwner = course.ownerId.toString() === userId;
    const isTeacher = course.teachers.some(
      (teacherId: mongoose.Types.ObjectId) => teacherId.toString() === userId
    );

    if (!isOwner && !isTeacher) {
      return forbiddenResponse(requestId);
    }

    // Actualizar campos
    if (updateData.title) unit.title = updateData.title;
    if (updateData.content) unit.content = updateData.content;
    if (updateData.order !== undefined) unit.order = updateData.order;

    unit.updatedAt = new Date();
    await unit.save();

    logInfo('Unidad actualizada', {
      unitId: id,
      courseId: unit.courseId.toString(),
      updatedBy: userId,
      requestId,
    });

    return successResponse(
      {
        id: unit._id.toString(),
        subjectId: unit.subjectId.toString(),
        courseId: unit.courseId.toString(),
        title: unit.title,
        content: unit.content,
        order: unit.order,
        updatedAt: unit.updatedAt,
      },
      'Unidad actualizada exitosamente',
      200,
      requestId
    );
  },
  'PATCH /units/[id]'
);

/**
 * DELETE /api/units/[id]
 * Elimina una unidad
 *
 * Respuestas:
 * - 200: Unidad eliminada exitosamente
 * - 400: ID inválido
 * - 401: No autenticado
 * - 403: Sin permisos para eliminar
 * - 404: Unidad no encontrada
 * - 500: Error del servidor
 */
export const DELETE = withErrorHandlingParams<{ id: string }>(
  async (request: NextRequest, context, requestId) => {
    const { id } = await context.params;

    // Sync check barato primero
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return validationErrorResponse({ id: ['ID de unidad inválido'] }, requestId);
    }

    // Auth + DB en paralelo
    const [userId] = await Promise.all([
      requireAuthMiddleware(request),
      connectDB(),
    ]);

    // Obtener unidad
    const unit = await Unit.findById(id);

    if (!unit) {
      return notFoundResponse('Unidad', requestId);
    }

    // Verificar permisos: owner o teacher del curso
    const course = await Course.findById(unit.courseId);

    if (!course) {
      return notFoundResponse('Curso', requestId);
    }

    const isOwner = course.ownerId.toString() === userId;
    const isTeacher = course.teachers.some(
      (teacherId: mongoose.Types.ObjectId) => teacherId.toString() === userId
    );

    if (!isOwner && !isTeacher) {
      return forbiddenResponse(requestId);
    }

    // Eliminar unidad
    await Unit.findByIdAndDelete(id);

    // Actualizar subject: remover unidad de unitIds
    await Subject.findByIdAndUpdate(
      unit.subjectId,
      { $pull: { unitIds: new mongoose.Types.ObjectId(id) } }
    );

    logInfo('Unidad eliminada', {
      unitId: id,
      courseId: unit.courseId.toString(),
      subjectId: unit.subjectId.toString(),
      deletedBy: userId,
      requestId,
    });

    return successResponse(
      null,
      'Unidad eliminada exitosamente',
      200,
      requestId
    );
  },
  'DELETE /units/[id]'
);
