import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/database/database';
import Session from '@/models/Session';
import { logError, logInfo } from '@/config/logger';
import { withErrorHandling } from '@/lib/api/middleware';
import { unauthorizedResponse, successResponse } from '@/lib/api/response-handler';import { getAuthUserId } from '@/lib/api/auth-helpers';
/**
 * POST /api/auth/session/revoke
 * Revoca la sesión actual del usuario (la marca como revocada en la BD)
 * Debe ser llamado ANTES de signOut() de NextAuth
 */
export const POST = withErrorHandling(
  async (request: NextRequest, requestId: string) => {
    await connectDB();

    // Obtener userId de la sesión autenticada
    const userId = await getAuthUserId();

    if (!userId) {
      throw unauthorizedResponse(requestId);
    }

    // Buscar y revocar la sesión activa del usuario en la BD
    const session = await Session.findOne({ userId, revokedAt: null });

    if (!session) {
      throw unauthorizedResponse(requestId);
    }

    // Marcar la sesión como revocada
    session.revokedAt = new Date();
    await session.save();

    logInfo('Sesión revocada exitosamente', { userId, requestId });

    return successResponse(
      { message: 'Sesión revocada' },
      'Sesión revocada exitosamente',
      200,
      requestId
    );
  },
  'POST /api/auth/session/revoke'
);

/**
 * GET /api/auth/session/revoke
 * También soportar GET para compatibilidad
 */
export const GET = withErrorHandling(
  async (request: NextRequest, requestId: string) => {
    await connectDB();

    const userId = await getAuthUserId();

    if (!userId) {
      throw unauthorizedResponse(requestId);
    }

    const session = await Session.findOne({ userId, revokedAt: null });

    if (!session) {
      throw unauthorizedResponse(requestId);
    }

    session.revokedAt = new Date();
    await session.save();

    logInfo('Sesión revocada exitosamente (GET)', { userId, requestId });

    return successResponse(
      { message: 'Sesión revocada' },
      'Sesión revocada exitosamente',
      200,
      requestId
    );
  },
  'GET /api/auth/session/revoke'
);
