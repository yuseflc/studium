import { NextRequest } from 'next/server';
import { internalErrorResponse } from './response-handler';
import { logError } from '@/config/logger';

/**
 * Tipo para funciones manejadoras de rutas
 */
export type RouteHandler<T = any> = (
    request: NextRequest,
    requestId: string
) => Promise<Response>;

/**
 * Envuelve un manejador de ruta con manejo centralizado de errores
 * 
 * @param handler - Función manejadora de la ruta
 * @param method - Método HTTP (GET, POST, etc.)
 */
export function withErrorHandling(
    handler: RouteHandler,
    method: string = 'API'
): RouteHandler {
    return async (request: NextRequest, requestId: string) => {
        try {
            return await handler(request, requestId);
        } catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            logError(`Error en ${method}`, err, { requestId });

            return internalErrorResponse(
                `Error en la operación: ${err.message}`,
                err,
                requestId
            );
        }
    };
}

/**
 * Genera un ID único para request
 */
export function generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Extrae y valida el token JWT del header Authorization
 */
export function extractAuthToken(request: NextRequest): string | null {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return null;

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
        return null;
    }

    return parts[1];
}

/**
 * Valida que el request sea JSON válido
 */
export async function isValidJson(request: NextRequest): Promise<boolean> {
    const contentType = request.headers.get('content-type');
    return contentType?.includes('application/json') || false;
}
