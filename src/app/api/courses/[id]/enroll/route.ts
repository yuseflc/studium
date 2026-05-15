import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database/database';
import { Course, User } from '@/models/index';
import { logInfo } from '@/config/logger';
import { validateRequest, validationErrorResponse } from '@/lib/validators/api-validation';
import {
  successResponse,
  validationErrorResponse as validateErrorResponse,
  notFoundResponse,
  forbiddenResponse,
  conflictResponse,
  internalErrorResponse,
  unauthorizedResponse,
} from '@/lib/api/response-handler';
import { enrollStudentSchema, type EnrollStudentInput } from '@/lib/validators/validators';
import mongoose from 'mongoose';
import { extractUserId } from '@/lib/api/auth-helpers';

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
 * - 404: Curso o estudiante no encontrado
 * - 409: El estudiante ya está matriculado
 * - 500: Error del servidor
 */
async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const { id } = await Promise.resolve(params);

    // Validar ObjectId del curso
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return validationErrorResponse({ id: ['ID de curso inválido'] });
    }

    // Validar datos
    const validationResult = await validateRequest<EnrollStudentInput>(
      request,
      enrollStudentSchema,
      'enrollStudent'
    );

    if (!validationResult.success) {
      return validateErrorResponse(validationResult.errors);
    }

    const { studentId } = validationResult.data;

    await connectDB();

    // 1. Verificar que el curso existe
    const course = await Course.findById(id);

    if (!course) {
      return notFoundResponse('Curso');
    }

    // 2. Verificar que el estudiante existe
    const student = await User.findById(studentId).lean();

    if (!student) {
      return notFoundResponse('Estudiante');
    }

    // 3. Verificar que el estudiante no está ya matriculado
    if (course.enrolledStudents.some((s: mongoose.Types.ObjectId) => s.toString() === studentId)) {
      return conflictResponse(
        'El estudiante ya está matriculado en este curso',
        { studentId }
      );
    }

    // 4. Matricular al estudiante
    course.enrolledStudents.push(new mongoose.Types.ObjectId(studentId));
    course.updatedAt = new Date();
    await course.save();

    logInfo('Estudiante matriculado en curso', {
      courseId: id,
      studentId,
    });

    return successResponse(
      {
        courseId: course._id.toString(),
        studentId,
        enrollmentCount: course.enrolledStudents.length,
      },
      'Estudiante matriculado exitosamente'
    );

  } catch (error) {
    return internalErrorResponse('Error matriculando al estudiante', error);
  }
}

export { POST };
