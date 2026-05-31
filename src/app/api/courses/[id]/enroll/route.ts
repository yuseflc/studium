/* Archivo: src\app\api\courses\[id]\enroll\route.ts
  Descripción: Endpoint para inscribir a un usuario en un curso (matrícula/enroll). */

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
  conflictResponse,
  internalErrorResponse,
  unauthorizedResponse,
  forbiddenResponse,
} from '@/lib/api/response-handler';
import { enrollStudentSchema, type EnrollStudentInput } from '@/lib/validators/validators';
import mongoose from 'mongoose';
import { extractUserId } from '@/lib/api/auth-helpers';
import { withErrorHandlingParams } from '@/lib/api/middleware';

/**
 * POST /api/courses/[id]/enroll
 * Matricula un estudiante en un curso
 *
 * Body esperado:
 * ```
 * {
 *   studentId: string (ID de MongoDB válido)
 * }
 * ```
 *
 * Respuestas:
 * - 200: Estudiante matriculado exitosamente
 * - 400: Validación fallida
 * - 401: No autenticado
 * - 403: Sin permisos para matricular
 * - 404: Curso o estudiante no encontrado
 * - 409: El estudiante ya está matriculado
 * - 500: Error del servidor
 */
export const POST = withErrorHandlingParams<{ id: string }>(
  async (request: NextRequest, context, requestId) => {
    const { id } = await context.params;

    // Validar ObjectId del curso (cheap sync check antes de cualquier await)
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return validationErrorResponse({ id: ['ID de curso inválido'] }, requestId);
    }

    // Lanzar operaciones independientes en paralelo
    const dbPromise = connectDB();
    const [validationResult, userId] = await Promise.all([
      validateRequest<EnrollStudentInput>(request, enrollStudentSchema, 'enrollStudent'),
      extractUserId(request),
    ]);

    if (!validationResult.success) {
      return validationErrorResponse(validationResult.errors, requestId);
    }

    if (!userId) {
      return unauthorizedResponse(requestId);
    }

    const { studentId } = validationResult.data;

    await dbPromise;

    // Paralelizar queries de curso y estudiante (son independientes)
    const [course, student] = await Promise.all([
      Course.findById(id),
      User.findById(studentId).lean(),
    ]);

    if (!course) {
      return notFoundResponse('Curso', requestId);
    }

    if (!student) {
      return notFoundResponse('Estudiante', requestId);
    }

    // Verificar permisos: owner, teacher, o auto-matrícula
    const isOwner = course.ownerId.toString() === userId;
    const isTeacher = course.teachers.some(
      (t: mongoose.Types.ObjectId) => t.toString() === userId
    );
    const isSelfEnroll = studentId === userId;

    if (!isOwner && !isTeacher && !isSelfEnroll) {
      return forbiddenResponse(requestId);
    }

    // Verificar que el estudiante no está ya matriculado
    if (course.enrolledStudents.some(
      (s: mongoose.Types.ObjectId) => s.toString() === studentId
    )) {
      return conflictResponse(
        'El estudiante ya está matriculado en este curso',
        { studentId },
        requestId
      );
    }

    // Matricular al estudiante
    course.enrolledStudents.push(new mongoose.Types.ObjectId(studentId));
    course.updatedAt = new Date();
    await course.save();

    logInfo('Estudiante matriculado en curso', {
      courseId: id,
      studentId,
      enrolledBy: userId,
      requestId,
    });

    return successResponse(
      {
        courseId: course._id.toString(),
        studentId,
        enrollmentCount: course.enrolledStudents.length,
      },
      'Estudiante matriculado exitosamente',
      200,
      requestId
    );
  },
  'POST /courses/[id]/enroll'
);
