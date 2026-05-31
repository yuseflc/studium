/* Archivo: src\app\api\signout\route.ts
    Descripción: Endpoint para cerrar sesión y limpiar la sesión de NextAuth. */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database/database';
import Session from '@/models/Session';
import { logError, logInfo } from '@/config/logger';

/**
 * POST /api/signout
 * Elimina la sesión actual de la BD y cierra la sesión de forma segura
 */
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        // Obtener el sessionToken de la cookie
        const cookies = request.cookies;
        const sessionToken = cookies.get('next-auth.session-token')?.value;

        if (sessionToken) {
            // Eliminar la sesión de la BD
            const result = await Session.deleteOne({ sessionToken });
            
            if (result.deletedCount > 0) {
                logInfo('Sesión eliminada de la BD al cerrar sesión', { sessionToken });
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
 * GET /api/signout
 * También soportar GET para compatibilidad
 */
export async function GET(request: NextRequest) {
    return POST(request);
}
