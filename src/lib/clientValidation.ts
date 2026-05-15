/**
 * Validación en cliente usando Zod
 * Pre-valida campos antes de enviar al servidor
 */

import { z } from 'zod';
import {
  nameSchema,
  emailSchema,
  passwordSchema,
} from './validators/validators';

/**
 * Valida un campo específico contra su esquema
 */
export function validateField(
  fieldName: string,
  value: string
): { isValid: boolean; error?: string } {
  try {
    switch (fieldName) {
      case 'firstName':
        nameSchema.parse(value);
        return { isValid: true };

      case 'email':
        emailSchema.parse(value);
        return { isValid: true };

      case 'password':
        passwordSchema.parse(value);
        return { isValid: true };

      default:
        return { isValid: true };
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.issues[0]?.message || 'Error de validación';
      return { isValid: false, error: message };
    }
    return { isValid: false, error: 'Error de validación' };
  }
}

/**
 * Valida que dos contraseñas coincidan
 */
export function validatePasswordMatch(
  password: string,
  confirmPassword: string
): { isValid: boolean; error?: string } {
  if (password !== confirmPassword) {
    return {
      isValid: false,
      error: 'Las contraseñas no coinciden',
    };
  }
  return { isValid: true };
}
