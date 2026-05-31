/* Archivo: src\app\api\resources\[id]\route.ts
  Descripción: Endpoint para acceder, actualizar o eliminar un recurso por su id. */

// API: Operaciones sobre un recurso específico (GET, PATCH, DELETE)
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/database/database';
import Resource from '@/models/Resource';
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
  updateResourceSchema,
  type UpdateResourceInput,
} from '@/lib/validators/validators';
import { withErrorHandlingParams } from '@/lib/api/middleware';
import mongoose from 'mongoose';

/**
 * GET /api/resources/[id]
 * Obtiene los detalles de un recurso específico
 *
 * Respuestas:
 * - 200: Recurso obtenido exitosamente
 * - 400: ID inválido
 * - 404: Recurso no encontrado
 * - 500: Error del servidor
 */
export const GET = withErrorHandlingParams<{ id: string }>(
  async (request: NextRequest, context, requestId) => {
    await requireAuthMiddleware(request);
    const { id } = await context.params;

    // Validar ObjectId (sync check antes de cualquier await)
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return validationErrorResponse({ id: ['ID de recurso inválido'] }, requestId);
    }

    await connectDB();

    const resource = await Resource.findById(id).lean();

    if (!resource) {
      return notFoundResponse('Recurso', requestId);
    }

    logInfo('Recurso obtenido', { resourceId: id, requestId });

    return successResponse(
      {
        id: resource._id.toString(),
        unitId: resource.unitId.toString(),
        courseId: resource.courseId.toString(),
        title: resource.title,
        type: resource.type,
        url: resource.url,
        description: resource.description,
        createdAt: resource.createdAt,
        updatedAt: resource.updatedAt,
      },
      'Recurso obtenido exitosamente',
      200,
      requestId
    );
  },
  'GET /resources/[id]'
);

/**
 * PATCH /api/resources/[id]
 * Actualiza un recurso existente
 *
 * Body esperado:
 * ```
 * {
 *   title?: string (3-200 caracteres)
 *   type?: "link" | "file" | "text"
 *   url?: string
 *   description?: string (máx 500 caracteres)
 * }
 * ```
 *
 * Respuestas:
 * - 200: Recurso actualizado exitosamente
 * - 400: Validación fallida
 * - 401: No autenticado
 * - 403: Sin permisos para actualizar
 * - 404: Recurso no encontrado
 * - 500: Error del servidor
 */
export const PATCH = withErrorHandlingParams<{ id: string }>(
  async (request: NextRequest, context, requestId) => {
    const { id } = await context.params;

    // Sync check barato primero
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return validationErrorResponse({ id: ['ID de recurso inválido'] }, requestId);
    }

    // Lanzar operaciones independientes en paralelo
    const dbPromise = connectDB();
    const [validationResult, userId] = await Promise.all([
      validateRequest<UpdateResourceInput>(request, updateResourceSchema, 'updateResource'),
      requireAuthMiddleware(request),
    ]);

    if (!validationResult.success) {
      return validationErrorResponse(validationResult.errors, requestId);
    }

    const updateData = validationResult.data;

    await dbPromise;

    // Obtener recurso y verificar permisos
    const resource = await Resource.findById(id);

    if (!resource) {
      return notFoundResponse('Recurso', requestId);
    }

    // Verificar permisos: owner o teacher del curso
    const course = await Course.findById(resource.courseId);

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
    if (updateData.title) resource.title = updateData.title;
    if (updateData.type) resource.type = updateData.type;
    if (updateData.url !== undefined) resource.url = updateData.url;
    if (updateData.description !== undefined) resource.description = updateData.description;

    resource.updatedAt = new Date();
    await resource.save();

    logInfo('Recurso actualizado', {
      resourceId: id,
      courseId: resource.courseId.toString(),
      updatedBy: userId,
      requestId,
    });

    return successResponse(
      {
        id: resource._id.toString(),
        unitId: resource.unitId.toString(),
        courseId: resource.courseId.toString(),
        title: resource.title,
        type: resource.type,
        url: resource.url,
        description: resource.description,
        updatedAt: resource.updatedAt,
      },
      'Recurso actualizado exitosamente',
      200,
      requestId
    );
  },
  'PATCH /resources/[id]'
);

/**
 * DELETE /api/resources/[id]
 * Elimina un recurso
 *
 * Respuestas:
 * - 200: Recurso eliminado exitosamente
 * - 400: ID inválido
 * - 401: No autenticado
 * - 403: Sin permisos para eliminar
 * - 404: Recurso no encontrado
 * - 500: Error del servidor
 */
export const DELETE = withErrorHandlingParams<{ id: string }>(
  async (request: NextRequest, context, requestId) => {
    const { id } = await context.params;

    // Sync check barato primero
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return validationErrorResponse({ id: ['ID de recurso inválido'] }, requestId);
    }

    // Auth + DB en paralelo
    const [userId] = await Promise.all([
      requireAuthMiddleware(request),
      connectDB(),
    ]);

    // Obtener recurso
    const resource = await Resource.findById(id);

    if (!resource) {
      return notFoundResponse('Recurso', requestId);
    }

    // Verificar permisos: owner o teacher del curso
    const course = await Course.findById(resource.courseId);

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

    // Eliminar recurso
    await Resource.findByIdAndDelete(id);

    // Actualizar unit: remover recurso de resourceIds
    await Unit.findByIdAndUpdate(
      resource.unitId,
      { $pull: { resourceIds: new mongoose.Types.ObjectId(id) } }
    );

    logInfo('Recurso eliminado', {
      resourceId: id,
      courseId: resource.courseId.toString(),
      unitId: resource.unitId.toString(),
      deletedBy: userId,
      requestId,
    });

    return successResponse(
      null,
      'Recurso eliminado exitosamente',
      200,
      requestId
    );
  },
  'DELETE /resources/[id]'
);
