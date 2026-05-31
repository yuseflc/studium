/* Archivo: src\app\api\courses\[id]\route.ts
  Descripción: Endpoint para obtener, actualizar o eliminar un curso por su id. */

// API: Operaciones sobre un curso específico (GET, PATCH, etc.)
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database/database';
import Course from '@/models/Course';
import User from '@/models/User';
import { logInfo } from '@/config/logger';
import { validateRequest } from '@/lib/validators/api-validation';
import {
  successResponse,
  validationErrorResponse,
  notFoundResponse,
  forbiddenResponse,
  internalErrorResponse,
  unauthorizedResponse,
} from '@/lib/api/response-handler';
import { updateCourseSchema, type UpdateCourseInput } from '@/lib/validators/validators';
import { extractUserId, requireAuthMiddleware } from '@/lib/api/auth-helpers';
import { withErrorHandlingParams } from '@/lib/api/middleware';
import { getCourseFullStructure } from '@/lib/api/course-helpers';
import mongoose from 'mongoose';

/**
 * GET /api/courses/[id]
 * Obtiene los detalles completos de un curso específico
 *
 * Respuestas:
 * - 200: Curso obtenido exitosamente
 * - 400: ID inválido
 * - 404: Curso no encontrado
 * - 500: Error del servidor
 */
export const GET = withErrorHandlingParams<{ id: string }>(
  async (request: NextRequest, context, requestId) => {
    await requireAuthMiddleware(request);
    const { id } = await context.params;

    // Validar ObjectId (sync check antes de cualquier await)
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return validationErrorResponse({ id: ['ID de curso inválido'] }, requestId);
    }

    await connectDB();

    // Obtener curso con estructura completa (materias, unidades, recursos)
    const courseFullStructure = await getCourseFullStructure(id);

    if (!courseFullStructure) {
      return notFoundResponse('Curso', requestId);
    }

    // También obtener datos del propietario y otros detalles
    const course = await Course.findById(id)
      .populate('ownerId', 'email firstName')
      .populate('teachers', 'email firstName')
      .populate('enrolledStudents', 'email firstName');

    if (!course) {
      return notFoundResponse('Curso', requestId);
    }

    logInfo('Curso obtenido', { courseId: id, requestId });

    return successResponse(
      {
        id: course._id.toString(),
        title: course.title,
        description: course.description,
        status: course.status,
        owner: course.ownerId,
        teachers: course.teachers,
        enrolledStudents: course.enrolledStudents,
        structure: courseFullStructure,
        enrollmentCount: course.enrolledStudents?.length || 0,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
      },
      'Curso obtenido exitosamente',
      200,
      requestId
    );
  },
  'GET /courses/[id]'
);

/**
 * PATCH /api/courses/[id]
 * Actualiza un curso existente
 *
 * Body esperado:
 * ```
 * {
 *   title?: string (3-200 caracteres)
 *   description?: string (máx 1000 caracteres)
 *   status?: "draft" | "active" | "archived"
 * }
 * ```
 *
 * Respuestas:
 * - 200: Curso actualizado exitosamente
 * - 400: Validación fallida
 * - 401: No autenticado
 * - 403: No tienes permisos para actualizar este curso
 * - 404: Curso no encontrado
 * - 500: Error del servidor
 */
export const PATCH = withErrorHandlingParams<{ id: string }>(
  async (request: NextRequest, context, requestId) => {
    const { id } = await context.params;

    // Sync check barato primero
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return validationErrorResponse({ id: ['ID de curso inválido'] }, requestId);
    }

    // Lanzar operaciones independientes en paralelo
    const dbPromise = connectDB();
    const [validationResult, userId] = await Promise.all([
      validateRequest<UpdateCourseInput>(request, updateCourseSchema, 'updateCourse'),
      extractUserId(request),
    ]);

    if (!validationResult.success) {
      return validationErrorResponse(validationResult.errors, requestId);
    }

    if (!userId) {
      return unauthorizedResponse(requestId);
    }

    const updateData = validationResult.data;

    await dbPromise;

    // Obtener curso actual
    const course = await Course.findById(id);

    if (!course) {
      return notFoundResponse('Curso', requestId);
    }

    // Verificar permisos: solo el propietario o un profesor pueden editar
    const isOwner = course.ownerId.toString() === userId;
    const isTeacher = course.teachers.some(
      (teacherId: mongoose.Types.ObjectId) => teacherId.toString() === userId
    );

    if (!isOwner && !isTeacher) {
      return forbiddenResponse(requestId);
    }

    // Actualizar campos
    if (updateData.title) course.title = updateData.title;
    if (updateData.description !== undefined) course.description = updateData.description;
    if (updateData.status) course.status = updateData.status;

    course.updatedAt = new Date();
    await course.save();

    logInfo('Curso actualizado', { courseId: id, updatedBy: userId, requestId });

    return successResponse(
      {
        id: course._id.toString(),
        title: course.title,
        description: course.description,
        status: course.status,
        updatedAt: course.updatedAt,
      },
      'Curso actualizado exitosamente',
      200,
      requestId
    );
  },
  'PATCH /courses/[id]'
);

/**
 * DELETE /api/courses/[id]
 * Elimina un curso
 *
 * Respuestas:
 * - 200: Curso eliminado exitosamente
 * - 400: ID inválido
 * - 401: No autenticado
 * - 403: No tienes permisos para eliminar este curso
 * - 404: Curso no encontrado
 * - 500: Error del servidor
 */
export const DELETE = withErrorHandlingParams<{ id: string }>(
  async (request: NextRequest, context, requestId) => {
    const { id } = await context.params;

    // Sync check barato primero
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return validationErrorResponse({ id: ['ID de curso inválido'] }, requestId);
    }

    // Auth + DB en paralelo
    const [userId] = await Promise.all([
      extractUserId(request),
      connectDB(),
    ]);

    if (!userId) {
      return unauthorizedResponse(requestId);
    }

    // Obtener curso
    const course = await Course.findById(id);

    if (!course) {
      return notFoundResponse('Curso', requestId);
    }

    // Solo el propietario puede eliminar el curso
    if (course.ownerId.toString() !== userId) {
      return forbiddenResponse(requestId);
    }

    // Eliminar el curso
    await Course.findByIdAndDelete(id);

    logInfo('Curso eliminado', { courseId: id, deletedBy: userId, requestId });

    return successResponse(
      null,
      'Curso eliminado exitosamente',
      200,
      requestId
    );
  },
  'DELETE /courses/[id]'
);
