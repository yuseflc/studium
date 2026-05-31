/* Archivo: src\lib\api\auth-helpers.ts
    Descripción: Helpers para autenticación y verificación de sesiones en rutas API. */

// Helpers de autenticación para rutas API (session + roles)
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/config/auth.config';
import { NextRequest } from 'next/server';
import { unauthorizedResponse, internalErrorResponse } from './response-handler';
import { connectDB } from '@/lib/database/database';
import Session from '@/models/Session';
import crypto from 'crypto';

/**
 * Error personalizado para fallos de autenticación
 */
export class AuthenticationError extends Error {
    constructor(message: string = 'No autenticado') {
        super(message);
        this.name = 'AuthenticationError';
    }
}

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
 * Valida que la sesión actual del usuario no haya sido revocada
 * Chequea contra la BD usando el userId de la sesión autenticada
 * 
 * @param request - NextRequest
 * @returns true si la sesión es válida y no revocada, false si está revocada
 */
export async function isSessionActive(request: NextRequest): Promise<boolean> {
    try {
        // Primero obtener el userId del JWT/sesión autenticada de NextAuth
        const userId = await getAuthUserId();
        
        if (!userId) {
            return false;
        }

        await connectDB();
        
        // Buscar sesión activa (no revocada) para este usuario
        const session = await Session.findOne({ 
            userId,
            revokedAt: null // Solo aceptar sesiones no revocadas
        });

        if (!session) {
            const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

            await Session.create({
                sessionToken: crypto.randomBytes(32).toString('hex'),
                userId,
                expires,
            });

            return true;
        }

        // Chequear si la sesión ha expirado
        if (session.expires < new Date()) {
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error validando sesión:', error);
        return false;
    }
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
 * Valida que la sesión sea activa (no revocada)
 * Retorna el userId o lanza AuthenticationError
 * 
 * @param request - NextRequest
 * @returns userId si autenticado, sino lanza AuthenticationError
 */
export async function requireAuthMiddleware(
    request: NextRequest
): Promise<string> {
    const userId = await extractUserId(request);

    if (!userId) {
        throw new AuthenticationError('No autenticado');
    }

    // Validar que la sesión no está revocada
    const sessionActive = await isSessionActive(request);
    if (!sessionActive) {
        throw new AuthenticationError('Sesión revocada o inválida');
    }

    return userId;
}
