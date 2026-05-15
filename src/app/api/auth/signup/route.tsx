import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/database/database";
import { User } from "@/models/index";
import { logError, logInfo } from "@/config/logger";
import { signupSchema, type SignupInput } from "@/lib/validators/validators";
import { validateRequest, validationErrorResponse } from "@/lib/validators/api-validation";

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
export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        // 1. Validar y parsear datos de entrada
        const validationResult = await validateRequest<SignupInput>(
            request,
            signupSchema,
            "signup"
        );

        if (!validationResult.success) {
            return validationErrorResponse(validationResult.errors);
        }

        const { email, firstName, password, captchaToken } = validationResult.data;

        // 2. TODO: Validar captcha cuando esté configurado
        // if (captchaToken) {
        //     const captchaIsValid = await validateCaptcha(captchaToken);
        //     if (!captchaIsValid) {
        //         logInfo("Captcha inválido en signup", { email });
        //         return NextResponse.json(
        //             { error: "Captcha inválido o expirado" },
        //             { status: 400 }
        //         );
        //     }
        // }

        // 3. Conectar a la base de datos
        await connectDB();

        // 4. Verificar que el email no exista ya
        const existingUser = await User.findOne({ email }).lean();

        if (existingUser) {
            logInfo("Intento de registro con email existente", { email });
            return NextResponse.json(
                {
                    error: "Validación fallida",
                    details: {
                        email: ["Este email ya está registrado"]
                    }
                },
                { status: 409 }
            );
        }

        // 5. Crear nuevo usuario
        const newUser = new User({
            email,
            firstName: firstName.trim().split(" ")[0], // Guardar solo el primer nombre
            password,
            role: "student", // Rol por defecto
            active: true,
            profile: {
                lastName: firstName.trim().split(" ").slice(1).join(" ") || "",
            },
            enrolledCourses: [],
            createdCourses: []
        });

        // Guardar usuario (el pre-hook de Mongoose encriptará la contraseña)
        await newUser.save();

        logInfo("Usuario registrado exitosamente", {
            userId: newUser._id.toString(),
            email: newUser.email
        });

        // 6. Retornar respuesta exitosa (sin incluir contraseña)
        return NextResponse.json(
            {
                message: "Usuario registrado exitosamente",
                user: {
                    id: newUser._id.toString(),
                    email: newUser.email,
                    firstName: newUser.firstName,
                    role: newUser.role
                }
            },
            { status: 201 }
        );

    } catch (error) {
        logError("Error en ruta de signup", error as Error, {
            endpoint: "/api/auth/signup"
        });

        return NextResponse.json(
            { error: "Error interno del servidor. Por favor intenta de nuevo más tarde." },
            { status: 500 }
        );
    }
}

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