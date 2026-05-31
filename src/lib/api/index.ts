/* Archivo: src\lib\api\index.ts
    Descripción: Punto central de helpers para llamadas API (cliente/servidor) y utilidades comunes. */

/**
 * Exports centralizados para utilidades de API
 *
 * Uso:
 * import {
 *   successResponse,
 *   createdResponse,
 *   validationErrorResponse,
 *   withErrorHandling,
 *   withErrorHandlingParams,
 * } from '@/lib/api';
 */

// Response handlers
export {
    successResponse,
    createdResponse,
    errorResponse,
    validationErrorResponse,
    notFoundResponse,
    conflictResponse,
    unauthorizedResponse,
    forbiddenResponse,
    internalErrorResponse,
    databaseErrorResponse,
} from './response-handler';

// Types
export type {
    ApiSuccessResponse,
    ApiErrorResponse,
    PaginatedData,
    ValidationErrorDetail,
} from './types';

export { ErrorType, HTTP_STATUS } from './types';

// Middleware & utilities
export {
    withErrorHandling,
    withErrorHandlingParams,
    generateRequestId,
    extractAuthToken,
    isValidJson,
} from './middleware';

export type { RouteHandler, RouteHandlerWithParams } from './middleware';

// Auth helpers
export {
    getAuthSession,
    getAuthUserId,
    requireAuth,
    extractUserId,
    requireAuthMiddleware,
} from './auth-helpers';
