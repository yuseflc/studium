import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/database/database';
import Subject from '@/models/Subject';
import Unit from '@/models/Unit';
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
  updateSubjectSchema,
  type UpdateSubjectInput,
} from '@/lib/validators/validators';
import { withErrorHandlingParams } from '@/lib/api/middleware';
import mongoose from 'mongoose';

/**
 * GET /api/subjects/[id]
 * Obtiene los detalles de una materia específica
 *
 * Respuestas:
 * - 200: Materia obtenida exitosamente
 * - 400: ID inválido
 * - 404: Materia no encontrada
 * - 500: Error del servidor
 */
export const GET = withErrorHandlingParams<{ id: string }>(
  async (request: NextRequest, context, requestId) => {
    await requireAuthMiddleware(request);
    const { id } = await context.params;

    // Validar ObjectId (sync check antes de cualquier await)
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return validationErrorResponse({ id: ['ID de materia inválido'] }, requestId);
    }

    await connectDB();

    // Try legacy Subject first. If not found, fallback to Unit and return unit as subject-shaped object.
    const subject = await Subject.findById(id)
      .populate('unitIds', '_id title order')
      .populate('taskIds', '_id title type')
      .lean();

    if (subject) {
      logInfo('Materia obtenida (legacy)', { subjectId: id, requestId });

      return successResponse(
        {
          id: subject._id.toString(),
          courseId: subject.courseId.toString(),
          title: subject.title,
          description: subject.description,
          order: subject.order,
          units: subject.unitIds || [],
          tasks: subject.taskIds || [],
          createdAt: subject.createdAt,
          updatedAt: subject.updatedAt,
        },
        'Materia obtenida exitosamente',
        200,
        requestId
      );
    }

    // Not a Subject -> try Unit
    const unit = await Unit.findById(id).populate('taskIds', '_id title type').lean();

    if (!unit) {
      return notFoundResponse('Materia/Unidad', requestId);
    }

    logInfo('Unidad obtenida (compat subject)', { unitId: id, requestId });

    return successResponse(
      {
        id: unit._id.toString(),
        courseId: unit.courseId.toString(),
        title: unit.title,
        description: unit.content || '',
        order: unit.order,
        units: [
          {
            _id: unit._id,
            title: unit.title,
            order: unit.order,
          },
        ],
        tasks: unit.taskIds || [],
        createdAt: unit.createdAt,
        updatedAt: unit.updatedAt,
      },
      'Materia obtenida (desde unidad) exitosamente',
      200,
      requestId
    );
  },
  'GET /subjects/[id]'
);

/**
 * PATCH /api/subjects/[id]
 * Actualiza una materia existente
 *
 * Body esperado:
 * ```
 * {
 *   title?: string (3-200 caracteres)
 *   description?: string (máx 1000 caracteres)
 *   order?: number
 * }
 * ```
 *
 * Respuestas:
 * - 200: Materia actualizada exitosamente
 * - 400: Validación fallida
 * - 401: No autenticado
 * - 403: Sin permisos para actualizar
 * - 404: Materia no encontrada
 * - 500: Error del servidor
 */
export const PATCH = withErrorHandlingParams<{ id: string }>(
  async (request: NextRequest, context, requestId) => {
    const { id } = await context.params;

    // Sync check barato primero
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return validationErrorResponse({ id: ['ID de materia inválido'] }, requestId);
    }

    // Lanzar operaciones independientes en paralelo
    const dbPromise = connectDB();
    const [validationResult, userId] = await Promise.all([
      validateRequest<UpdateSubjectInput>(request, updateSubjectSchema, 'updateSubject'),
      requireAuthMiddleware(request),
    ]);

    if (!validationResult.success) {
      return validationErrorResponse(validationResult.errors, requestId);
    }

    const updateData = validationResult.data;

    await dbPromise;

    // Try to update legacy Subject first
    const subject = await Subject.findById(id);
    if (subject) {
      // Verificar permisos: owner o teacher del curso
      const course = await Course.findById(subject.courseId);
      if (!course) return notFoundResponse('Curso', requestId);

      const isOwner = course.ownerId.toString() === userId;
      const isTeacher = course.teachers.some(
        (teacherId: mongoose.Types.ObjectId) => teacherId.toString() === userId
      );

      if (!isOwner && !isTeacher) return forbiddenResponse(requestId);

      // Actualizar campos
      if (updateData.title) subject.title = updateData.title;
      if (updateData.description !== undefined) subject.description = updateData.description;
      if (updateData.order !== undefined) subject.order = updateData.order;

      subject.updatedAt = new Date();
      await subject.save();

      logInfo('Materia actualizada', {
        subjectId: id,
        courseId: subject.courseId.toString(),
        updatedBy: userId,
        requestId,
      });

      return successResponse(
        {
          id: subject._id.toString(),
          courseId: subject.courseId.toString(),
          title: subject.title,
          description: subject.description,
          order: subject.order,
          updatedAt: subject.updatedAt,
        },
        'Materia actualizada exitosamente',
        200,
        requestId
      );
    }

    // If no Subject, try Unit and apply same shape
    const unit = await Unit.findById(id);
    if (unit) {
      const course = await Course.findById(unit.courseId);
      if (!course) return notFoundResponse('Curso', requestId);

      const isOwner = course.ownerId.toString() === userId;
      const isTeacher = course.teachers.some(
        (teacherId: mongoose.Types.ObjectId) => teacherId.toString() === userId
      );

      if (!isOwner && !isTeacher) return forbiddenResponse(requestId);

      if (updateData.title) unit.title = updateData.title;
      if (updateData.description !== undefined) unit.content = updateData.description;
      if (updateData.order !== undefined) unit.order = updateData.order;

      unit.updatedAt = new Date();
      await unit.save();

      logInfo('Unidad actualizada (compat subject)', {
        unitId: id,
        courseId: unit.courseId.toString(),
        updatedBy: userId,
        requestId,
      });

      return successResponse(
        {
          id: unit._id.toString(),
          courseId: unit.courseId.toString(),
          title: unit.title,
          description: unit.content,
          order: unit.order,
          updatedAt: unit.updatedAt,
        },
        'Unidad actualizada (compat) exitosamente',
        200,
        requestId
      );
    }

    return notFoundResponse('Materia', requestId);
  },
  'PATCH /subjects/[id]'
);

/**
 * DELETE /api/subjects/[id]
 * Elimina una materia
 *
 * Respuestas:
 * - 200: Materia eliminada exitosamente
 * - 400: ID inválido
 * - 401: No autenticado
 * - 403: Sin permisos para eliminar
 * - 404: Materia no encontrada
 * - 500: Error del servidor
 */
export const DELETE = withErrorHandlingParams<{ id: string }>(
  async (request: NextRequest, context, requestId) => {
    const { id } = await context.params;

    // Sync check barato primero
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return validationErrorResponse({ id: ['ID de materia inválido'] }, requestId);
    }

    // Auth + DB en paralelo
    const [userId] = await Promise.all([
      requireAuthMiddleware(request),
      connectDB(),
    ]);

    // Try delete legacy Subject first
    const subject = await Subject.findById(id);
    if (subject) {
      // Verificar permisos
      const course = await Course.findById(subject.courseId);
      if (!course) return notFoundResponse('Curso', requestId);

      const isOwner = course.ownerId.toString() === userId;
      const isTeacher = course.teachers.some(
        (teacherId: mongoose.Types.ObjectId) => teacherId.toString() === userId
      );

      if (!isOwner && !isTeacher) return forbiddenResponse(requestId);

      // Delete subject and remove from course.subjectIds
      await Subject.findByIdAndDelete(id);
      await Course.findByIdAndUpdate(subject.courseId, { $pull: { subjectIds: new mongoose.Types.ObjectId(id) } });

      logInfo('Materia eliminada', {
        subjectId: id,
        courseId: subject.courseId.toString(),
        deletedBy: userId,
        requestId,
      });

      return successResponse(null, 'Materia eliminada exitosamente', 200, requestId);
    }

    // If not a Subject, treat id as Unit and delete Unit (compat)
    const unit = await Unit.findById(id);
    if (!unit) return notFoundResponse('Materia/Unidad', requestId);

    const courseOfUnit = await Course.findById(unit.courseId);
    if (!courseOfUnit) return notFoundResponse('Curso', requestId);

    const isOwner = courseOfUnit.ownerId.toString() === userId;
    const isTeacher = courseOfUnit.teachers.some(
      (teacherId: mongoose.Types.ObjectId) => teacherId.toString() === userId
    );

    if (!isOwner && !isTeacher) return forbiddenResponse(requestId);

    // Delete tasks belonging to unit
    await mongoose.model('Task').deleteMany({ unitId: unit._id });
    // Remove unit from course.unitIds
    await Course.findByIdAndUpdate(unit.courseId, { $pull: { unitIds: unit._id } });
    // Delete unit
    await Unit.findByIdAndDelete(unit._id);

    logInfo('Unidad eliminada (compat subject)', {
      unitId: id,
      courseId: unit.courseId.toString(),
      deletedBy: userId,
      requestId,
    });

    return successResponse(null, 'Unidad eliminada exitosamente', 200, requestId);
  },
  'DELETE /subjects/[id]'
);
