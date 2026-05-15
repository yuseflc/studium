import { NextResponse } from 'next/server';
import { ApiSuccessResponse, ApiErrorResponse, ErrorType, HTTP_STATUS } from './types';
import { logError } from '@/config/logger';

/**
 * Generador de ID único para requests (para trazabilidad)
 */
function generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Respuesta exitosa estandarizada
 * 
 * @param data - Datos a retornar
 * @param message - Mensaje descriptivo
 * @param statusCode - Código HTTP (por defecto 200)
 * @param requestId - ID del request para trazabilidad
 */
export function successResponse<T = unknown>(
    data: T,
    message: string = 'Operación exitosa',
    statusCode: number = HTTP_STATUS.OK,
    requestId?: string
): NextResponse<ApiSuccessResponse<T>> {
    const finalRequestId = requestId || generateRequestId();
    const response: ApiSuccessResponse<T> = {
        status: 'success',
        code: statusCode,
        message,
        data,
        meta: {
            timestamp: new Date().toISOString(),
            requestId: finalRequestId,
        },
    };

    return NextResponse.json(response, { status: statusCode });
}

/**
 * Respuesta de recurso creado exitosamente
 * 
 * @param data - Datos del recurso creado
 * @param message - Mensaje descriptivo
 * @param requestId - ID del request para trazabilidad
 */
export function createdResponse<T = unknown>(
    data: T,
    message: string = 'Recurso creado exitosamente',
    requestId?: string
): NextResponse<ApiSuccessResponse<T>> {
    return successResponse(data, message, HTTP_STATUS.CREATED, requestId);
}

/**
 * Respuesta de error estandarizada
 * 
 * @param message - Mensaje de error
 * @param statusCode - Código HTTP
 * @param errorType - Tipo de error
 * @param details - Detalles adicionales del error
 * @param requestId - ID del request para trazabilidad
 */
export function errorResponse(
    message: string,
    statusCode: number = HTTP_STATUS.INTERNAL_ERROR,
    errorType: ErrorType = ErrorType.INTERNAL,
    details?: Record<string, unknown>,
    requestId?: string
): NextResponse<ApiErrorResponse> {
    const id = requestId || generateRequestId();
    const response: ApiErrorResponse = {
        status: 'error',
        code: statusCode,
        message,
        error: {
            type: errorType,
            details,
            ...(process.env.NODE_ENV === 'development' && { stack: new Error().stack }),
        },
        meta: {
            timestamp: new Date().toISOString(),
            requestId: id,
        },
    };

    logError(message, new Error(message), {
        statusCode,
        errorType,
        details,
        requestId: id,
    });

    return NextResponse.json(response, { status: statusCode });
}

/**
 * Respuesta de validación fallida
 * 
 * @param validationErrors - Errores de validación por campo
 * @param requestId - ID del request para trazabilidad
 */
export function validationErrorResponse(
    validationErrors: Record<string, string[]>,
    requestId?: string
): NextResponse<ApiErrorResponse> {
    return errorResponse(
        'Validación de datos fallida',
        HTTP_STATUS.BAD_REQUEST,
        ErrorType.VALIDATION,
        validationErrors,
        requestId
    );
}

/**
 * Respuesta de recurso no encontrado
 * 
 * @param resource - Nombre del recurso (ej: "Usuario", "Curso")
 * @param requestId - ID del request para trazabilidad
 */
export function notFoundResponse(
    resource: string = 'Recurso',
    requestId?: string
): NextResponse<ApiErrorResponse> {
    return errorResponse(
        `${resource} no encontrado`,
        HTTP_STATUS.NOT_FOUND,
        ErrorType.NOT_FOUND,
        { resource },
        requestId
    );
}

/**
 * Respuesta de conflicto (recurso ya existe, etc.)
 * 
 * @param message - Mensaje del conflicto
 * @param details - Detalles adicionales
 * @param requestId - ID del request para trazabilidad
 */
export function conflictResponse(
    message: string = 'El recurso ya existe',
    details?: Record<string, unknown>,
    requestId?: string
): NextResponse<ApiErrorResponse> {
    return errorResponse(
        message,
        HTTP_STATUS.CONFLICT,
        ErrorType.CONFLICT,
        details,
        requestId
    );
}

/**
 * Respuesta de no autorizado
 * 
 * @param requestId - ID del request para trazabilidad
 */
export function unauthorizedResponse(requestId?: string): NextResponse<ApiErrorResponse> {
    return errorResponse(
        'No autorizado',
        HTTP_STATUS.UNAUTHORIZED,
        ErrorType.UNAUTHORIZED,
        undefined,
        requestId
    );
}

/**
 * Respuesta de acceso prohibido
 * 
 * @param requestId - ID del request para trazabilidad
 */
export function forbiddenResponse(requestId?: string): NextResponse<ApiErrorResponse> {
    return errorResponse(
        'Acceso prohibido',
        HTTP_STATUS.FORBIDDEN,
        ErrorType.FORBIDDEN,
        undefined,
        requestId
    );
}

/**
 * Respuesta de error interno del servidor
 * 
 * @param message - Mensaje del error
 * @param error - Error original (para logging)
 * @param requestId - ID del request para trazabilidad
 */
export function internalErrorResponse(
    message: string = 'Error interno del servidor',
    error?: unknown,
    requestId?: string
): NextResponse<ApiErrorResponse> {
    const errorDetails = error instanceof Error ? { message: error.message } : undefined;
    return errorResponse(
        message,
        HTTP_STATUS.INTERNAL_ERROR,
        ErrorType.INTERNAL,
        errorDetails,
        requestId
    );
}

/**
 * Respuesta de error de base de datos
 * 
 * @param requestId - ID del request para trazabilidad
 */
export function databaseErrorResponse(requestId?: string): NextResponse<ApiErrorResponse> {
    return errorResponse(
        'Error en la base de datos',
        HTTP_STATUS.INTERNAL_ERROR,
        ErrorType.DATABASE,
        undefined,
        requestId
    );
}
