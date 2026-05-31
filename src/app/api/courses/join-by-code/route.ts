/* Archivo: src\app\api\courses\join-by-code\route.ts
  Descripción: Endpoint para unirse a un curso mediante un código de invitación. */

import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/api/middleware';
import {
  successResponse,
  unauthorizedResponse,
  notFoundResponse,
  internalErrorResponse,
  validationErrorResponse,
  conflictResponse,
} from '@/lib/api/response-handler';
import { extractUserId } from '@/lib/api/auth-helpers';
import { connectDB } from '@/lib/database/database';
import Course, { IInviteCode } from '@/models/Course';
import User from '@/models/User';
import mongoose from 'mongoose';
import { LOGGER } from '@/config/logger';
import { validateRequest } from '@/lib/validators/api-validation';
import { z } from 'zod';

// Schema para validar el request
const joinByCodeSchema = z.object({
  code: z
    .string()
    .length(6, 'El código debe tener 6 caracteres')
    .regex(/^[A-Z0-9]+$/, 'El código debe contener solo letras mayúsculas y números'),
});

type JoinByCodeInput = z.infer<typeof joinByCodeSchema>;

/**
 * POST /api/courses/join-by-code
 * Unirse a un curso usando un código de invitación
 *
 * Body esperado:
 * ```
 * {
 *   code: string (6 caracteres alfanuméricos)
 * }
 * ```
 *
 * Requisitos:
 * - Usuario autenticado
 * - Código válido y activo
 * - Usuario no está ya inscrito
 *
 * Respuestas:
 * - 200: Usuario inscrito exitosamente
 * - 400: Validación fallida
 * - 401: No autenticado
 * - 404: Código no encontrado o inactivo
 * - 409: Usuario ya inscrito
 * - 500: Error del servidor
 */
export const POST = withErrorHandling(
  async (request: NextRequest, requestId) => {
    const userId = await extractUserId(request);
    if (!userId) {
      return unauthorizedResponse(requestId);
    }

    // Validar request body
    const validationResult = await validateRequest<JoinByCodeInput>(
      request,
      joinByCodeSchema,
      'joinByCode'
    );

    if (!validationResult.success) {
      return validationErrorResponse(validationResult.errors, requestId);
    }

    const { code } = validationResult.data;

    await connectDB();

    // Obtener usuario actual
    const currentUser = await User.findById(userId).select('_id email').lean();
    if (!currentUser) {
      return unauthorizedResponse(requestId);
    }

    // Buscar curso con ese código de invitación activo
    const course = await Course.findOne({
      "invitationCodes.code": code,
      "invitationCodes.active": true,
    });

    if (!course) {
      return notFoundResponse('Código de invitación no válido o inactivo', requestId);
    }

    try {
      // Verificar si el usuario ya está inscrito
      if (course.enrolledStudents.some(
        (studentId: mongoose.Types.ObjectId) => studentId.toString() === userId
      )) {
        return successResponse(
          {
            message: 'Ya estás inscrito en este curso',
            courseId: course._id.toString(),
            courseTitle: course.title,
          },
          requestId
        );
      }

      // Actualizar lastUsedAt del código
      const inviteCodeIndex = course.invitationCodes.findIndex((ic: IInviteCode) => ic.code === code);
      if (inviteCodeIndex !== -1) {
        course.invitationCodes[inviteCodeIndex].lastUsedAt = new Date();
      }

      // Actualizar bidireccional: Course + User
      await Promise.all([
        Course.findByIdAndUpdate(
          course._id,
          {
            $addToSet: { enrolledStudents: currentUser._id },
            "invitationCodes": course.invitationCodes, // Guardar los códigos actualizados
          }
        ),
        User.findByIdAndUpdate(
          currentUser._id,
          { $addToSet: { enrolledCourses: course._id } }
        ),
      ]);

      LOGGER.info(
        { courseId: course._id, userId, code },
        'User joined course via invitation code API'
      );

      return successResponse(
        {
          message: `¡Bienvenido a ${course.title}!`,
          courseId: course._id.toString(),
          courseTitle: course.title,
        },
        requestId
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al unirse al curso';
      LOGGER.error({ error, code, userId }, 'Error joining course by code via API');
      return internalErrorResponse(message, requestId);
    }
  }
);
