/* Archivo: src\app\api\courses\[id]\teachers\route.ts
  Descripción: Endpoint para gestionar la lista de profesores de un curso (añadir/quitar). */

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
  conflictResponse,
  internalErrorResponse,
  unauthorizedResponse,
} from '@/lib/api/response-handler';
import { addTeacherSchema, type AddTeacherInput } from '@/lib/validators/validators';
import mongoose from 'mongoose';
import { extractUserId, requireAuthMiddleware } from '@/lib/api/auth-helpers';
import { withErrorHandlingParams } from '@/lib/api/middleware';

/**
 * GET /api/courses/[id]/teachers
 * Obtiene la lista de profesores del curso
 *
 * Respuestas:
 * - 200: Lista de profesores obtenida exitosamente
 * - 400: ID de curso inválido
 * - 404: Curso no encontrado
 * - 500: Error del servidor
 */
export const GET = withErrorHandlingParams<{ id: string }>(
  async (request: NextRequest, context, requestId) => {
    await requireAuthMiddleware(request);
    const { id } = await context.params;

    // Validar ObjectId del curso (sync check antes de cualquier await)
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return validationErrorResponse({ id: ['ID de curso inválido'] }, requestId);
    }

    await connectDB();

    // Obtener curso con profesores poblados
    const course = await Course.findById(id)
      .populate('teachers', 'email firstName profile.lastName role active')
      .select('_id title teachers ownerId')
      .lean();

    if (!course) {
      return notFoundResponse('Curso', requestId);
    }

    logInfo('Profesores del curso obtenidos', {
      courseId: id,
      teachersCount: course.teachers?.length || 0,
      requestId,
    });

    return successResponse(
      {
        courseId: course._id.toString(),
        title: course.title,
        teachers: course.teachers || [],
        teachersCount: (course.teachers as any[])?.length || 0,
      },
      'Profesores obtenidos exitosamente',
      200,
      requestId
    );
  },
  'GET /courses/[id]/teachers'
);

/**
 * POST /api/courses/[id]/teachers
 * Añade un profesor al curso
 *
 * Body esperado:
 * ```
 * {
 *   teacherId: string (ID de MongoDB válido)
 * }
 * ```
 *
 * Respuestas:
 * - 200: Profesor añadido exitosamente
 * - 400: Validación fallida
 * - 401: No autenticado
 * - 403: No tienes permisos para añadir profesores
 * - 404: Curso o profesor no encontrado
 * - 409: El profesor ya está asignado
 * - 500: Error del servidor
 */
export const POST = withErrorHandlingParams<{ id: string }>(
  async (request: NextRequest, context, requestId) => {
    const { id } = await context.params;

    // Validar ObjectId del curso (sync check antes de cualquier await)
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return validationErrorResponse({ id: ['ID de curso inválido'] }, requestId);
    }

    // Lanzar operaciones independientes en paralelo
    const dbPromise = connectDB();
    const [validationResult, userId] = await Promise.all([
      validateRequest<AddTeacherInput>(request, addTeacherSchema, 'addTeacher'),
      extractUserId(request),
    ]);

    if (!validationResult.success) {
      return validationErrorResponse(validationResult.errors, requestId);
    }

    if (!userId) {
      return unauthorizedResponse(requestId);
    }

    const { teacherId } = validationResult.data;

    await dbPromise;

    // Paralelizar queries de curso y profesor (son independientes)
    const [course, teacher] = await Promise.all([
      Course.findById(id),
      User.findById(teacherId).lean(),
    ]);

    if (!course) {
      return notFoundResponse('Curso', requestId);
    }

    // Solo el propietario puede añadir profesores
    if (course.ownerId.toString() !== userId) {
      return forbiddenResponse(requestId);
    }

    if (!teacher) {
      return notFoundResponse('Profesor', requestId);
    }

    // Verificar que el profesor no esté ya asignado
    if (course.teachers.some(
      (t: mongoose.Types.ObjectId) => t.toString() === teacherId
    )) {
      return conflictResponse(
        'El profesor ya está asignado a este curso',
        { teacherId },
        requestId
      );
    }

    // Verificar que no sea el propietario
    if (course.ownerId.toString() === teacherId) {
      return conflictResponse(
        'El propietario del curso no puede ser añadido como profesor adicional',
        { teacherId },
        requestId
      );
    }

    // Añadir profesor
    course.teachers.push(new mongoose.Types.ObjectId(teacherId));
    course.updatedAt = new Date();
    await course.save();

    logInfo('Profesor añadido al curso', {
      courseId: id,
      teacherId,
      addedBy: userId,
      requestId,
    });

    return successResponse(
      {
        courseId: course._id.toString(),
        teacherId,
        teachersCount: course.teachers.length,
      },
      'Profesor añadido exitosamente',
      200,
      requestId
    );
  },
  'POST /courses/[id]/teachers'
);

/**
 * DELETE /api/courses/[id]/teachers
 * Elimina un profesor del curso
 *
 * Query parameters:
 * - teacherId: string (ID del profesor a eliminar)
 *
 * Respuestas:
 * - 200: Profesor eliminado exitosamente
 * - 400: Validación fallida
 * - 401: No autenticado
 * - 403: No tienes permisos
 * - 404: Curso o profesor no encontrado
 * - 500: Error del servidor
 */
export const DELETE = withErrorHandlingParams<{ id: string }>(
  async (request: NextRequest, context, requestId) => {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');

    // Validaciones sync baratas primero
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return validationErrorResponse({ id: ['ID de curso inválido'] }, requestId);
    }

    if (!teacherId) {
      return validationErrorResponse({ teacherId: ['ID del profesor requerido'] }, requestId);
    }

    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      return validationErrorResponse({ teacherId: ['ID del profesor inválido'] }, requestId);
    }

    // Auth + DB en paralelo
    const [userId] = await Promise.all([
      extractUserId(request),
      connectDB(),
    ]);

    if (!userId) {
      return unauthorizedResponse(requestId);
    }

    const course = await Course.findById(id);

    if (!course) {
      return notFoundResponse('Curso', requestId);
    }

    // Solo el propietario puede eliminar profesores
    if (course.ownerId.toString() !== userId) {
      return forbiddenResponse(requestId);
    }

    // Verificar que el profesor está en la lista
    const teacherIndex = course.teachers.findIndex(
      (t: mongoose.Types.ObjectId) => t.toString() === teacherId
    );

    if (teacherIndex === -1) {
      return notFoundResponse('Profesor en este curso', requestId);
    }

    // Eliminar profesor
    course.teachers.splice(teacherIndex, 1);
    course.updatedAt = new Date();
    await course.save();

    logInfo('Profesor eliminado del curso', {
      courseId: id,
      teacherId,
      removedBy: userId,
      requestId,
    });

    return successResponse(
      {
        courseId: course._id.toString(),
        teacherId,
        teachersCount: course.teachers.length,
      },
      'Profesor eliminado exitosamente',
      200,
      requestId
    );
  },
  'DELETE /courses/[id]/teachers'
);
