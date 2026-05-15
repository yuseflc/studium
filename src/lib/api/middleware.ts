import { NextRequest, NextResponse } from 'next/server';
import { internalErrorResponse } from './response-handler';
import { logError } from '@/config/logger';

/**
 * Tipo para funciones manejadoras de rutas sin params dinámicos
 */
export type RouteHandler = (
    request: NextRequest,
    requestId: string
) => Promise<NextResponse>;

/**
 * Tipo para funciones manejadoras de rutas con params dinámicos
 */
export type RouteHandlerWithParams<P extends Record<string, string> = Record<string, string>> = (
    request: NextRequest,
    context: { params: Promise<P> },
    requestId: string
) => Promise<NextResponse>;

/**
 * Envuelve un manejador de ruta (sin params) con manejo centralizado de errores y requestId.
 *
 * @param handler - Función manejadora de la ruta
 * @param method  - Nombre del método para logging (ej: "GET /courses")
 */
export function withErrorHandling(
    handler: RouteHandler,
    method: string = 'API'
): (request: NextRequest) => Promise<NextResponse> {
    return async (request: NextRequest) => {
        const requestId = generateRequestId();
        try {
            return await handler(request, requestId);
        } catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            logError(`Error en ${method}`, err, { requestId });
            return internalErrorResponse(`Error en la operación: ${err.message}`, err, requestId);
        }
    };
}

/**
 * Envuelve un manejador de ruta con params dinámicos (ej: [id]) con manejo centralizado
 * de errores y requestId.
 *
 * @param handler - Función manejadora de la ruta
 * @param method  - Nombre del método para logging (ej: "GET /courses/[id]")
 */
export function withErrorHandlingParams<P extends Record<string, string> = Record<string, string>>(
    handler: RouteHandlerWithParams<P>,
    method: string = 'API'
): (request: NextRequest, context: { params: Promise<P> }) => Promise<NextResponse> {
    return async (request: NextRequest, context: { params: Promise<P> }) => {
        const requestId = generateRequestId();
        try {
            return await handler(request, context, requestId);
        } catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            logError(`Error en ${method}`, err, { requestId });
            return internalErrorResponse(`Error en la operación: ${err.message}`, err, requestId);
        }
    };
}

/**
 * Genera un ID único para el request (para trazabilidad)
 */
export function generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
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
 * Valida que el request tenga Content-Type application/json
 */
export function isValidJson(request: NextRequest): boolean {
    const contentType = request.headers.get('content-type');
    return contentType?.includes('application/json') ?? false;
}
