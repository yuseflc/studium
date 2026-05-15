/**
 * Tipos estandarizados para respuestas de API
 */

/**
 * Estructura base de respuesta exitosa
 */
export interface ApiSuccessResponse<T = unknown> {
    status: 'success';
    code: number;
    message: string;
    data?: T;
    meta?: {
        timestamp: string;
        requestId?: string;
    };
}

/**
 * Estructura base de respuesta de error
 */
export interface ApiErrorResponse {
    status: 'error';
    code: number;
    message: string;
    error: {
        type: string;
        details?: Record<string, unknown>;
        stack?: string; // Solo en desarrollo
    };
    meta?: {
        timestamp: string;
        requestId?: string;
    };
}

/**
 * Estructura de respuesta paginada
 */
export interface PaginatedData<T> {
    items: T[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}

/**
 * Errores de validación detallados
 */
export interface ValidationErrorDetail {
    [field: string]: string[];
}

/**
 * Tipos de error conocidos
 */
export enum ErrorType {
    VALIDATION = 'VALIDATION_ERROR',
    NOT_FOUND = 'NOT_FOUND',
    UNAUTHORIZED = 'UNAUTHORIZED',
    FORBIDDEN = 'FORBIDDEN',
    CONFLICT = 'CONFLICT',
    INTERNAL = 'INTERNAL_ERROR',
    BAD_REQUEST = 'BAD_REQUEST',
    DATABASE = 'DATABASE_ERROR',
    EXTERNAL_SERVICE = 'EXTERNAL_SERVICE_ERROR'
}

/**
 * Códigos HTTP estándar
 */
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_ERROR: 500,
    SERVICE_UNAVAILABLE: 503
} as const;
