/* Archivo: src\app\api\auth\signout\route.ts
    Descripción: Endpoint alternativo para cerrar sesión y limpiar cookies/estado. */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database/database';
import Session from '@/models/Session';
import { logInfo, logError } from '@/config/logger';
import { getAuthUserId } from '@/lib/api/auth-helpers';

/**
 * POST /api/auth/signout
 * Revoca la sesión actual del usuario y cierra la sesión
 */
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        // Obtener userId de la sesión autenticada
        const userId = await getAuthUserId();

        if (userId) {
            // Revocar la sesión del usuario en la BD (no eliminar)
            const result = await Session.updateOne(
                { userId, revokedAt: null },
                { revokedAt: new Date() }
            );
            
            if (result.modifiedCount > 0) {
                logInfo('Sesión revocada al cerrar sesión', { userId });
            }
        }

        // Crear respuesta con cookies borradas
        const response = NextResponse.json(
            {
                status: 'success',
                message: 'Sesión cerrada exitosamente',
            },
            { status: 200 }
        );

        // Borrar la cookie de sesión de NextAuth
        response.cookies.set('next-auth.session-token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 0, // Borrar inmediatamente
            path: '/',
        });

        // Borrar otras cookies de NextAuth si existen
        response.cookies.set('next-auth.csrf-token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 0,
            path: '/',
        });

        response.cookies.set('next-auth.callback-url', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 0,
            path: '/',
        });

        return response;
    } catch (error: any) {
        logError('Error al cerrar sesión', error, { errorMessage: error.message });

        return NextResponse.json(
            {
                status: 'error',
                message: 'Error al cerrar sesión',
                error: error.message,
            },
            { status: 500 }
        );
    }
}

/**
 * GET /api/auth/signout
 * También soportar GET para compatibilidad
 */
export async function GET(request: NextRequest) {
    return POST(request);
}
