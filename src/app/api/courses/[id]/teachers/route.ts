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
import { addTeacherSchema, type AddTeacherInput } from '@/lib/validators/validators';
import mongoose from 'mongoose';
import { extractUserId } from '@/lib/api/auth-helpers';

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
 * - 403: No tienes permisos para añadir profesores
 * - 404: Curso o profesor no encontrado
 * - 409: El profesor ya está asignado
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
    const validationResult = await validateRequest<AddTeacherInput>(
      request,
      addTeacherSchema,
      'addTeacher'
    );

    if (!validationResult.success) {
      return validateErrorResponse(validationResult.errors);
    }

    const { teacherId } = validationResult.data;
    const userId = await extractUserId(request);

    if (!userId) {
      return unauthorizedResponse();
    }

    await connectDB();

    // 1. Verificar que el curso existe
    const course = await Course.findById(id);

    if (!course) {
      return notFoundResponse('Curso');
    }

    // 2. Verificar permisos: solo el propietario puede añadir profesores
    if (course.ownerId.toString() !== userId) {
      return forbiddenResponse();
    }

    // 3. Verificar que el profesor existe
    const teacher = await User.findById(teacherId).lean();

    if (!teacher) {
      return notFoundResponse('Profesor');
    }

    // 4. Verificar que el profesor no esté ya asignado
    if (course.teachers.some((t: mongoose.Types.ObjectId) => t.toString() === teacherId)) {
      return conflictResponse(
        'El profesor ya está asignado a este curso',
        { teacherId }
      );
    }

    // 5. Verificar que no sea el propietario
    if (course.ownerId.toString() === teacherId) {
      return conflictResponse(
        'El propietario del curso no puede ser añadido como profesor adicional',
        { teacherId }
      );
    }

    // 6. Añadir profesor
    course.teachers.push(new mongoose.Types.ObjectId(teacherId));
    course.updatedAt = new Date();
    await course.save();

    logInfo('Profesor añadido al curso', {
      courseId: id,
      teacherId,
      addedBy: userId,
    });

    return successResponse(
      {
        courseId: course._id.toString(),
        teacherId,
        teachersCount: course.teachers.length,
      },
      'Profesor añadido exitosamente'
    );

  } catch (error) {
    return internalErrorResponse('Error añadiendo el profesor', error);
  }
}

/**
 * DELETE /api/courses/[id]/teachers
 * Elimina un profesor del curso
 * 
 * Query parameters:
 * - teacherId: string (ID del profesor a eliminar)
 * 
 * Respuestas:
 * - 200: Profesor eliminado exitosamente
 * - 403: No tienes permisos
 * - 404: Curso o profesor no encontrado
 * - 500: Error del servidor
 */
async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const { id } = await Promise.resolve(params);
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');

    if (!teacherId) {
      return validationErrorResponse({ teacherId: ['ID del profesor requerido'] });
    }

    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      return validationErrorResponse({ teacherId: ['ID del profesor inválido'] });
    }

    const userId = await extractUserId(request);

    if (!userId) {
      return unauthorizedResponse();
    }

    await connectDB();

    const course = await Course.findById(id);

    if (!course) {
      return notFoundResponse('Curso');
    }

    // Solo el propietario puede eliminar profesores
    if (course.ownerId.toString() !== userId) {
      return forbiddenResponse();
    }

    // Verificar que el profesor está en la lista
    const teacherIndex = course.teachers.findIndex(
      (t: mongoose.Types.ObjectId) => t.toString() === teacherId
    );

    if (teacherIndex === -1) {
      return notFoundResponse('Profesor en este curso');
    }

    // Eliminar profesor
    course.teachers.splice(teacherIndex, 1);
    course.updatedAt = new Date();
    await course.save();

    logInfo('Profesor eliminado del curso', {
      courseId: id,
      teacherId,
      removedBy: userId,
    });

    return successResponse(
      {
        courseId: course._id.toString(),
        teacherId,
        teachersCount: course.teachers.length,
      },
      'Profesor eliminado exitosamente'
    );

  } catch (error) {
    return internalErrorResponse('Error eliminando el profesor', error);
  }
}

export { POST, DELETE };
