import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database/database';
import User from '@/models/User';
import { logInfo } from '@/config/logger';
import { signupSchema, type SignupInput } from '@/lib/validators/validators';
import { validateRequest } from '@/lib/validators/api-validation';
import {
  createdResponse,
  conflictResponse,
  validationErrorResponse,
} from '@/lib/api/response-handler';
import { withErrorHandling } from '@/lib/api/middleware';

/**
 * POST /api/auth/signup
 * Registra un nuevo usuario en la plataforma
 *
 * Body esperado:
 * {
 *   email: string
 *   firstName: string
 *   password: string
 *   captchaToken?: string (próximamente requerido)
 * }
 *
 * Respuestas:
 * - 201: Usuario creado exitosamente
 * - 400: Validación fallida
 * - 409: Email ya existe
 * - 500: Error del servidor
 */
export const POST = withErrorHandling(
  async (request: NextRequest, requestId) => {
    // Lanzar DB connection en paralelo con la validación
    const dbPromise = connectDB();

    const validationResult = await validateRequest<SignupInput>(
      request,
      signupSchema,
      'signup'
    );

    if (!validationResult.success) {
      return validationErrorResponse(validationResult.errors, requestId);
    }

    const { email, firstName, password, captchaToken } = validationResult.data;

    // TODO: Validar captcha cuando esté configurado
    // if (captchaToken) {
    //     const captchaIsValid = await validateCaptcha(captchaToken);
    //     if (!captchaIsValid) {
    //         logInfo("Captcha inválido en signup", { email });
    //         return validationErrorResponse(
    //             { captcha: ["Captcha inválido o expirado"] },
    //             requestId
    //         );
    //     }
    // }

    await dbPromise;

    // Verificar que el email no exista ya
    const existingUser = await User.findOne({ email }).lean();

    if (existingUser) {
      logInfo('Intento de registro con email existente', { email, requestId });
      return conflictResponse(
        'Este email ya está registrado',
        { email: ['Este email ya está registrado'] },
        requestId
      );
    }

    // Crear nuevo usuario
    const newUser = new User({
      email,
      firstName: firstName.trim().split(' ')[0], // Guardar solo el primer nombre
      password,
      role: 'student', // Rol por defecto
      active: true,
      profile: {
        lastName: firstName.trim().split(' ').slice(1).join(' ') || '',
      },
      enrolledCourses: [],
      createdCourses: [],
    });

    // Guardar usuario (el pre-hook de Mongoose encriptará la contraseña)
    await newUser.save();

    logInfo('Usuario registrado exitosamente', {
      userId: newUser._id.toString(),
      email: newUser.email,
      requestId,
    });

    // Retornar respuesta exitosa (sin incluir contraseña)
    return createdResponse(
      {
        id: newUser._id.toString(),
        email: newUser.email,
        firstName: newUser.firstName,
        role: newUser.role,
      },
      'Usuario registrado exitosamente',
      requestId
    );
  },
  'POST /auth/signup'
);

/**
 * TODO: Implementar validación de captcha
 *
 * Cuando se integre Google reCAPTCHA v3 o similar:
 *
 * async function validateCaptcha(token: string): Promise<boolean> {
 *   try {
 *     const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
 *       method: "POST",
 *       headers: { "Content-Type": "application/x-www-form-urlencoded" },
 *       body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`
 *     });
 *
 *     const data = await response.json();
 *     return data.success && data.score > 0.5; // Ajustar score según necesidad
 *   } catch (error) {
 *     logError("Error validando captcha", error as Error);
 *     return false;
 *   }
 * }
 */