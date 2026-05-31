/* Archivo: src\lib\validators\api-validation.ts
    Descripción: Validaciones específicas para peticiones API: parámetros, cuerpos y consultas. */

// Helpers para validar requests en las rutas API usando Zod
import { ZodSchema } from 'zod';
import { NextRequest } from 'next/server';
import { logInfo } from '@/config/logger';

/**
 * Interfaz para resultado de validación exitosa
 */
export interface ValidationSuccessResult<T> {
    success: true;
    data: T;
}

/**
 * Interfaz para resultado de validación fallida
 */
export interface ValidationFailureResult {
    success: false;
    errors: Record<string, string[]>;
}

export type ValidationResult<T> = ValidationSuccessResult<T> | ValidationFailureResult;

/**
 * Valida un request body contra un schema de Zod.
 *
 * Retorna un objeto discriminado {success, data} | {success, errors}.
 * Los route handlers deben convertir los errores a NextResponse usando
 * `validationErrorResponse` de `@/lib/api/response-handler`.
 *
 * @param request    - NextRequest a validar
 * @param schema     - Schema de Zod para validación
 * @param actionName - Nombre de la acción (para logging)
 *
 * @example
 * const result = await validateRequest(request, signupSchema, 'signup');
 * if (!result.success) return validationErrorResponse(result.errors, requestId);
 * const { email } = result.data;
 */
export async function validateRequest<T>(
    request: NextRequest,
    schema: ZodSchema,
    actionName: string
): Promise<ValidationResult<T>> {
    try {
        let body: unknown;
        try {
            body = await request.json();
        } catch {
            logInfo(`Solicitud de ${actionName} con JSON inválido`);
            return {
                success: false,
                errors: { body: ['Formato de solicitud inválido. Se esperaba JSON.'] },
            };
        }

        const validationResult = schema.safeParse(body);

        if (!validationResult.success) {
            const errors: Record<string, string[]> = {};

            for (const issue of validationResult.error.issues) {
                const path = issue.path.join('.') || '_root';
                if (!errors[path]) errors[path] = [];
                errors[path].push(issue.message);
            }

            logInfo(`Validación de ${actionName} fallida`, { errors });

            return { success: false, errors };
        }

        return { success: true, data: validationResult.data as T };
    } catch (error) {
        logInfo(`Error inesperado validando ${actionName}`, {
            error: error instanceof Error ? error.message : 'Unknown error',
        });
        return {
            success: false,
            errors: { server: ['Error interno durante la validación'] },
        };
    }
}
