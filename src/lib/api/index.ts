/**
 * Exports centralizados para utilidades de API
 * 
 * Uso:
 * import {
 *   successResponse,
 *   createdResponse,
 *   validationErrorResponse,
 *   withErrorHandling
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
    databaseErrorResponse
} from './response-handler';

// Types
export type {
    ApiSuccessResponse,
    ApiErrorResponse,
    PaginatedData,
    ValidationErrorDetail
} from './types';

export { ErrorType, HTTP_STATUS } from './types';

// Middleware & utilities
export {
    withErrorHandling,
    generateRequestId,
    extractAuthToken,
    isValidJson
} from './middleware';

export type { RouteHandler } from './middleware';

// Auth helpers
export {
    getAuthSession,
    getAuthUserId,
    requireAuth,
    extractUserId,
    requireAuthMiddleware
} from './auth-helpers';
