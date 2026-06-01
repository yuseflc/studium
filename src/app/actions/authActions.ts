"use server";

import { connectDB } from "@/lib/database/database";
import User from "@/models/User";
import { signupSchema, emailSchema } from "@/lib/validators/validators";
import { LOGGER } from "@/config/logger";

export interface SignupResult {
  success: boolean;
  data?: {
    id: string;
    email: string;
    firstName: string;
    role: string;
  };
  error?: string;
  details?: Record<string, string[]>;
}

export async function signupUser(input: {
  firstName: string;
  email: string;
  password: string;
}): Promise<SignupResult> {
  try {
    const validationResult = signupSchema.safeParse(input);
    if (!validationResult.success) {
      const details: Record<string, string[]> = {};
      for (const issue of validationResult.error.issues) {
        const field = String(issue.path[0] || "general");
        details[field] = details[field] ?? [];
        details[field].push(issue.message);
      }
      return { success: false, details };
    }

    const { email, firstName, password } = validationResult.data;

    await connectDB();

    const existingUser = await User.findOne({ email }).lean();
    if (existingUser) {
      return {
        success: false,
        details: { email: ["Este email ya está registrado"] },
      };
    }

    const newUser = new User({
      email,
      firstName: firstName.trim().split(" ")[0],
      password,
      role: "student",
      active: true,
      profile: {
        lastName: firstName.trim().split(" ").slice(1).join(" ") || "",
      },
      enrolledCourses: [],
      createdCourses: [],
    });

    await newUser.save();

    LOGGER.info(
      { userId: newUser._id.toString(), email: newUser.email },
      "Usuario registrado exitosamente"
    );

    return {
      success: true,
      data: {
        id: newUser._id.toString(),
        email: newUser.email,
        firstName: newUser.firstName,
        role: newUser.role,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al registrar usuario";
    LOGGER.error({ error }, "Error en signupUser action");
    return { success: false, error: message };
  }
}

export interface ForgotPasswordResult {
  success: boolean;
  message?: string;
}

export async function forgotPassword(email: string): Promise<ForgotPasswordResult> {
  try {
    const parsedEmail = emailSchema.safeParse(email);
    if (!parsedEmail.success) {
      return { success: false, message: "Email inválido" };
    }

    await connectDB();

    // No revelar si el email existe o no (seguridad contra enumeración)
    const user = await User.findOne({ email: parsedEmail.data }).lean();

    if (user) {
      // TODO: enviar email de recuperación con token temporal
      // await sendPasswordResetEmail(parsedEmail.data, resetToken);
      LOGGER.info({ email: parsedEmail.data }, "Solicitud de recuperación de contraseña");
    }

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al procesar la solicitud";
    LOGGER.error({ error }, "Error en forgotPassword action");
    return { success: false, message };
  }
}
