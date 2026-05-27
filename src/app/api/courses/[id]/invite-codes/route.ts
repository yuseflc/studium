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

// Función helper para generar código alfanumérico único de 6 caracteres
function generateRandomCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * POST /api/courses/[id]/invite-codes
 * Generar un nuevo código de invitación para un curso
 *
 * Requisitos:
 * - Usuario autenticado
 * - Usuario es owner o teacher del curso
 *
 * Respuestas:
 * - 200: Código generado exitosamente
 * - 401: No autenticado
 * - 403: Sin permisos
 * - 404: Curso no encontrado
 * - 500: Error del servidor
 */
export const POST = withErrorHandlingParams<{ id: string }>(
  async (request: NextRequest, context, requestId) => {
    const { id } = await context.params;

    // Validar ObjectId del curso (cheap sync check)
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return validationErrorResponse({ id: ['ID de curso inválido'] }, requestId);
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

    // Verificar permisos: solo owner y teacher pueden generar códigos
    const isOwner = course.ownerId.toString() === userId;
    const isTeacher = course.teachers.some(
      (t: mongoose.Types.ObjectId) => t.toString() === userId
    );

    if (!isOwner && !isTeacher) {
      return forbiddenResponse(requestId);
    }

    try {
      // Generar código único que no exista ya en el curso
      let code: string;
      let attempts = 0;
      const maxAttempts = 100;

      do {
        code = generateRandomCode();
        attempts++;
      } while (
        course.invitationCodes.some((ic: IInviteCode) => ic.code === code) &&
        attempts < maxAttempts
      );

      if (attempts >= maxAttempts) {
        return internalErrorResponse(
          'No se pudo generar un código único',
          requestId
        );
      }

      // FIFO rotation: si ya hay 10 códigos, elimina el más antiguo
      if (course.invitationCodes.length >= 10) {
        course.invitationCodes.shift();
      }

      // Agregar nuevo código
      course.invitationCodes.push({
        code,
        createdAt: new Date(),
        active: true,
      });

      await course.save();

      LOGGER.info({ courseId: id, code }, "Invitation code generated via API");

      return successResponse(
        {
          code,
          createdAt: new Date().toISOString(),
          active: true,
        },
        requestId
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al generar código';
      LOGGER.error({ error, courseId: id }, 'Error generating invite code via API');
      return internalErrorResponse(message, requestId);
    }
  }
);

/**
 * GET /api/courses/[id]/invite-codes
 * Listar códigos de invitación de un curso
 *
 * Requisitos:
 * - Usuario autenticado
 * - Usuario es owner o teacher del curso
 *
 * Respuestas:
 * - 200: Lista de códigos
 * - 401: No autenticado
 * - 403: Sin permisos
 * - 404: Curso no encontrado
 * - 500: Error del servidor
 */
export const GET = withErrorHandlingParams<{ id: string }>(
  async (request: NextRequest, context, requestId) => {
    const { id } = await context.params;

    // Validar ObjectId del curso
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return validationErrorResponse({ id: ['ID de curso inválido'] }, requestId);
    }

    const userId = await extractUserId(request);
    if (!userId) {
      return unauthorizedResponse(requestId);
    }

    await connectDB();

    const course = await Course.findById(id).lean();
    if (!course) {
      return notFoundResponse('Curso', requestId);
    }

    // Verificar permisos: solo owner y teacher pueden ver códigos
    const isOwner = course.ownerId.toString() === userId;
    const isTeacher = course.teachers.some(
      (t: mongoose.Types.ObjectId) => t.toString() === userId
    );

    if (!isOwner && !isTeacher) {
      return forbiddenResponse(requestId);
    }

    try {
      const codes = course.invitationCodes.map((ic: IInviteCode) => ({
        code: ic.code,
        createdAt: ic.createdAt.toISOString(),
        lastUsedAt: ic.lastUsedAt?.toISOString() || null,
        active: ic.active,
      }));

      return successResponse({ codes }, requestId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al listar códigos';
      LOGGER.error({ error, courseId: id }, 'Error listing invite codes via API');
      return internalErrorResponse(message, requestId);
    }
  }
);
