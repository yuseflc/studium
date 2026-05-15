import { z } from "zod";

/**
 * Esquemas de validación reutilizables para diferentes rutas
 * Centralizados en un solo lugar para fácil mantenimiento
 */

// ============ REGEX PATTERNS ============
const EMAIL_REGEX = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
const PASSWORD_MIN_LENGTH = 6;
const NAME_MIN_LENGTH = 2;
const NAME_MAX_LENGTH = 100;

// ============ ESQUEMAS REUTILIZABLES ============

/**
 * Validación de email
 * Usado en: signup, login, forgot-password, etc.
 */
export const emailSchema = z
  .string()
  .min(1, "Email es requerido")
  .email("Email debe tener un formato válido")
  .transform((val) => val.toLowerCase().trim());

/**
 * Validación de nombre
 * Usado en: signup, profile update, etc.
 */
export const nameSchema = z
  .string()
  .min(NAME_MIN_LENGTH, `Nombre debe tener al menos ${NAME_MIN_LENGTH} caracteres`)
  .max(NAME_MAX_LENGTH, `Nombre no puede exceder ${NAME_MAX_LENGTH} caracteres`)
  .transform((val) => val.trim());

/**
 * Validación de contraseña
 * Usado en: signup, login, change-password, etc.
 */
export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`);

/**
 * Token de captcha (placeholder)
 * Próximamente será requerido
 */
export const captchaTokenSchema = z
  .string()
  .optional();

// ============ ESQUEMAS COMPUESTOS ============

/**
 * Validación para registro (signup)
 */
export const signupSchema = z.object({
  email: emailSchema,
  firstName: nameSchema,
  password: passwordSchema,
  captchaToken: captchaTokenSchema,
});

export type SignupInput = z.infer<typeof signupSchema>;

/**
 * Validación para login
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  captchaToken: captchaTokenSchema,
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Validación para forgot password (solicitar reset)
 */
export const forgotPasswordSchema = z.object({
  email: emailSchema,
  captchaToken: captchaTokenSchema,
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

/**
 * Validación para reset de contraseña
 */
export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token es requerido"),
  password: passwordSchema,
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

/**
 * Validación para actualizar perfil
 */
export const updateProfileSchema = z.object({
  firstName: nameSchema.optional(),
  lastName: z
    .string()
    .max(NAME_MAX_LENGTH, `Apellido no puede exceder ${NAME_MAX_LENGTH} caracteres`)
    .optional(),
  bio: z
    .string()
    .max(500, "Biografía no puede exceder 500 caracteres")
    .optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// ============ ESQUEMAS DE CURSOS ============

/**
 * Validación para crear un nuevo curso
 */
export const createCourseSchema = z.object({
  title: z
    .string()
    .min(3, "El título del curso debe tener al menos 3 caracteres")
    .max(200, "El título del curso no puede exceder 200 caracteres")
    .transform((val) => val.trim()),
  description: z
    .string()
    .max(1000, "La descripción no puede exceder 1000 caracteres")
    .optional()
    .transform((val) => val?.trim()),
  status: z
    .enum(["draft", "active", "archived"])
    .optional()
    .default("draft"),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;

/**
 * Validación para actualizar un curso
 */
export const updateCourseSchema = z.object({
  title: z
    .string()
    .min(3, "El título del curso debe tener al menos 3 caracteres")
    .max(200, "El título del curso no puede exceder 200 caracteres")
    .transform((val) => val.trim())
    .optional(),
  description: z
    .string()
    .max(1000, "La descripción no puede exceder 1000 caracteres")
    .optional()
    .transform((val) => val?.trim()),
  status: z
    .enum(["draft", "active", "archived"])
    .optional(),
});

export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;

/**
 * Validación para añadir un profesor al curso
 */
export const addTeacherSchema = z.object({
  teacherId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "ID de profesor inválido"),
});

export type AddTeacherInput = z.infer<typeof addTeacherSchema>;

/**
 * Validación para matricular un estudiante
 */
export const enrollStudentSchema = z.object({
  studentId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "ID de estudiante inválido"),
});

export type EnrollStudentInput = z.infer<typeof enrollStudentSchema>;
