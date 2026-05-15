import { NextRequest, NextResponse } from "next/server";
import { ZodSchema, ZodError } from "zod";
import { logInfo } from "@/config/logger";

/**
 * Interfaz para respuestas de error de validación
 */
export interface ValidationErrorResponse {
  error: string;
  details?: Record<string, string[]>;
}

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
 * Valida un request body contra un schema de Zod
 * 
 * @param request - NextRequest a validar
 * @param schema - Schema de Zod para validación
 * @param actionName - Nombre de la acción (para logging)
 * @returns Resultado de validación con datos o errores
 * 
 * @example
 * const result = await validateRequest(request, signupSchema, "signup");
 * if (!result.success) {
 *   logInfo("Validación fallida", result.errors);
 *   return NextResponse.json({...}, { status: 400 });
 * }
 * const { email, password } = result.data;
 */
export async function validateRequest<T>(
  request: NextRequest,
  schema: ZodSchema,
  actionName: string
): Promise<ValidationResult<T>> {
  try {
    // 1. Parsear JSON del request
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      logInfo(`Solicitud de ${actionName} con JSON inválido`);
      return {
        success: false,
        errors: {
          body: ["Formato de solicitud inválido"],
        },
      };
    }

    // 2. Validar contra el schema
    const validationResult = schema.safeParse(body);

    if (!validationResult.success) {
      // Formatear errores de Zod
      const errors: Record<string, string[]> = {};

      for (const error of validationResult.error.issues) {
        const path = error.path.join(".");
        const message = error.message;

        if (!errors[path]) {
          errors[path] = [];
        }
        errors[path].push(message);
      }

      logInfo(`Validación de ${actionName} fallida`, { errors });

      return {
        success: false,
        errors,
      };
    }

    // 3. Retornar datos validados
    return {
      success: true,
      data: validationResult.data as T,
    };

  } catch (error) {
    logInfo(`Error inesperado validando ${actionName}`, {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return {
      success: false,
      errors: {
        server: ["Error interno durante validación"],
      },
    };
  }
}

/**
 * Convierte errores de validación a respuesta JSON
 * 
 * @param errors - Objeto de errores de validación
 * @param message - Mensaje genérico de error (opcional)
 * @returns NextResponse con errores formateados
 * 
 * @example
 * if (!result.success) {
 *   return validationErrorResponse(result.errors);
 * }
 */
export function validationErrorResponse(
  errors: Record<string, string[]>,
  message: string = "Validación fallida"
): NextResponse<ValidationErrorResponse> {
  return NextResponse.json(
    {
      error: message,
      details: errors,
    },
    { status: 400 }
  );
}
