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
  internalErrorResponse,
  unauthorizedResponse,
} from '@/lib/api/response-handler';
import { updateCourseSchema, type UpdateCourseInput } from '@/lib/validators/validators';
import { extractUserId } from '@/lib/api/auth-helpers';
import mongoose from 'mongoose';

/**
 * GET /api/courses/[id]
 * Obtiene los detalles completos de un curso específico
 * 
 * Respuestas:
 * - 200: Curso obtenido exitosamente
 * - 404: Curso no encontrado
 * - 500: Error del servidor
 */
async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const { id } = await Promise.resolve(params);

    // Validar que sea un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return validationErrorResponse({ id: ['ID de curso inválido'] });
    }

    await connectDB();

    const course = await Course.findById(id)
      .populate('ownerId', 'email firstName')
      .populate('teachers', 'email firstName')
      .populate('enrolledStudents', 'email firstName');

    if (!course) {
      return notFoundResponse('Curso');
    }

    logInfo('Curso obtenido', { courseId: id });

    return successResponse(
      {
        id: course._id.toString(),
        title: course.title,
        description: course.description,
        status: course.status,
        owner: course.ownerId,
        teachers: course.teachers,
        enrolledStudents: course.enrolledStudents,
        subjects: course.subjects,
        enrollmentCount: course.enrolledStudents?.length || 0,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
      },
      'Curso obtenido exitosamente'
    );

  } catch (error) {
    return internalErrorResponse('Error obteniendo el curso', error);
  }
}

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
 * - 403: No tienes permisos para actualizar este curso
 * - 404: Curso no encontrado
 * - 500: Error del servidor
 */
async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const { id } = await Promise.resolve(params);

    // Validar ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return validationErrorResponse({ id: ['ID de curso inválido'] });
    }

    // Validar datos
    const validationResult = await validateRequest<UpdateCourseInput>(
      request,
      updateCourseSchema,
      'updateCourse'
    );

    if (!validationResult.success) {
      return validateErrorResponse(validationResult.errors);
    }

    const updateData = validationResult.data;
    const userId = await extractUserId(request);

    if (!userId) {
      return unauthorizedResponse();
    }

    await connectDB();

    // Obtener curso actual
    const course = await Course.findById(id);

    if (!course) {
      return notFoundResponse('Curso');
    }

    // Verificar permisos: solo el propietario o un profesor pueden editar
    const isOwner = course.ownerId.toString() === userId;
    const isTeacher = course.teachers.some(
      (teacherId: mongoose.Types.ObjectId) => teacherId.toString() === userId
    );

    if (!isOwner && !isTeacher) {
      return forbiddenResponse();
    }

    // Actualizar campos
    if (updateData.title) course.title = updateData.title;
    if (updateData.description !== undefined) course.description = updateData.description;
    if (updateData.status) course.status = updateData.status;

    course.updatedAt = new Date();
    await course.save();

    logInfo('Curso actualizado', { courseId: id, updatedBy: userId });

    return successResponse(
      {
        id: course._id.toString(),
        title: course.title,
        description: course.description,
        status: course.status,
        updatedAt: course.updatedAt,
      },
      'Curso actualizado exitosamente'
    );

  } catch (error) {
    return internalErrorResponse('Error actualizando el curso', error);
  }
}

/**
 * DELETE /api/courses/[id]
 * Elimina un curso
 * 
 * Respuestas:
 * - 200: Curso eliminado exitosamente
 * - 403: No tienes permisos para eliminar este curso
 * - 404: Curso no encontrado
 * - 500: Error del servidor
 */
async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const { id } = await Promise.resolve(params);

    // Validar ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return validationErrorResponse({ id: ['ID de curso inválido'] });
    }

    const userId = await extractUserId(request);

    if (!userId) {
      return unauthorizedResponse();
    }

    await connectDB();

    // Obtener curso
    const course = await Course.findById(id);

    if (!course) {
      return notFoundResponse('Curso');
    }

    // Solo el propietario puede eliminar el curso
    if (course.ownerId.toString() !== userId) {
      return forbiddenResponse();
    }

    // Eliminar el curso
    await Course.findByIdAndDelete(id);

    logInfo('Curso eliminado', { courseId: id, deletedBy: userId });

    return successResponse(
      null,
      'Curso eliminado exitosamente'
    );

  } catch (error) {
    return internalErrorResponse('Error eliminando el curso', error);
  }
}

export { GET, PATCH, DELETE };
