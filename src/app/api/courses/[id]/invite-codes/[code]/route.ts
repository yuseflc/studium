import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandlingParams } from '@/lib/api/middleware';
import {
  successResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  internalErrorResponse,
  validationErrorResponse,
} from '@/lib/api/response-handler';
import { extractUserId } from '@/lib/api/auth-helpers';
import { connectDB } from '@/lib/database/database';
import Course, { IInviteCode } from '@/models/Course';
import User from '@/models/User';
import mongoose from 'mongoose';
import { LOGGER } from '@/config/logger';

/**
 * DELETE /api/courses/[id]/invite-codes/[code]
 * Desactivar un código de invitación específico
 *
 * Requisitos:
 * - Usuario autenticado
 * - Usuario es owner o teacher del curso
 *
 * Respuestas:
 * - 200: Código desactivado exitosamente
 * - 401: No autenticado
 * - 403: Sin permisos
 * - 404: Curso o código no encontrado
 * - 500: Error del servidor
 */
export const DELETE = withErrorHandlingParams<{ id: string; code: string }>(
  async (request: NextRequest, context, requestId) => {
    const { id, code } = await context.params;

    // Validar ObjectId del curso (cheap sync check)
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return validationErrorResponse({ id: ['ID de curso inválido'] }, requestId);
    }

    // Validar formato del código (alfanumérico, 6 caracteres)
    if (!code || !/^[A-Z0-9]{6}$/.test(code)) {
      return validationErrorResponse({ code: ['Código de invitación inválido'] }, requestId);
    }

    const userId = await extractUserId(request);
    if (!userId) {
      return unauthorizedResponse(requestId);
    }

    await connectDB();

    const course = await Course.findById(id);
    if (!course) {
      return notFoundResponse('Curso', requestId);
    }

    // Verificar permisos: solo owner y teacher pueden desactivar códigos
    const isOwner = course.ownerId.toString() === userId;
    const isTeacher = course.teachers.some(
      (t: mongoose.Types.ObjectId) => t.toString() === userId
    );

    if (!isOwner && !isTeacher) {
      return forbiddenResponse(requestId);
    }

    try {
      const inviteCodeIndex = course.invitationCodes.findIndex((ic: IInviteCode) => ic.code === code);
      if (inviteCodeIndex === -1) {
        return notFoundResponse('Código de invitación', requestId);
      }

      course.invitationCodes[inviteCodeIndex].active = false;
      await course.save();

      LOGGER.info({ courseId: id, code }, 'Invitation code deactivated via API');

      return successResponse(
        { message: 'Código de invitación desactivado' },
        requestId
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al desactivar código';
      LOGGER.error({ error, courseId: id, code }, 'Error deactivating invite code via API');
      return internalErrorResponse(message, requestId);
    }
  }
);
