import { getServerSession } from 'next-auth';
import { authOptions } from '@/config/auth.config';
import { NextRequest } from 'next/server';
import { unauthorizedResponse, internalErrorResponse } from './response-handler';

/**
 * Obtiene la sesión autenticada del request actual
 * Usa NextAuth para verificar autenticación
 * 
 * @returns Session del usuario o null si no autenticado
 */
export async function getAuthSession() {
    try {
        const session = await getServerSession(authOptions);
        return session;
    } catch (error) {
        console.error('Error obteniendo sesión:', error);
        return null;
    }
}

/**
 * Extrae el ID del usuario autenticado de la sesión
 * Retorna el ID o null si el usuario no está autenticado
 * 
 * @returns ID del usuario o null
 */
export async function getAuthUserId(): Promise<string | null> {
    const session = await getAuthSession();
    return session?.user?.id || null;
}

/**
 * Middleware que verifica autenticación y retorna ID de usuario
 * Retorna respuesta 401 si no autenticado
 * 
 * @returns ID del usuario autenticado
 * @throws Retorna NextResponse 401 si no autenticado
 */
export async function requireAuth(): Promise<string> {
    const userId = await getAuthUserId();

    if (!userId) {
        throw unauthorizedResponse();
    }

    return userId;
}

/**
 * Helper para extraer userId desde la sesión autenticada
 * Retorna null si no está autenticado
 * 
 * @param request - NextRequest
 * @returns ID del usuario o null
 */
export async function extractUserId(request: NextRequest): Promise<string | null> {
    // Solo usar sesión autenticada (NextAuth)
    const userId = await getAuthUserId();
    return userId;
}

/**
 * Middleware que requiere autenticación en rutas API
 * Retorna el userId o una respuesta 401
 * 
 * @param request - NextRequest
 * @returns userId si autenticado, sino lanza error
 */
export async function requireAuthMiddleware(
    request: NextRequest
): Promise<string> {
    const userId = await extractUserId(request);

    if (!userId) {
        throw unauthorizedResponse();
    }

    return userId;
}
