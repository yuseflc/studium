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

// ============ ESQUEMAS DE MATERIAS ============

/**
 * Validación para crear una materia
 */
export const createSubjectSchema = z.object({
  courseId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "ID de curso inválido"),
  title: z
    .string()
    .min(3, "El título de la materia debe tener al menos 3 caracteres")
    .max(200, "El título no puede exceder 200 caracteres")
    .transform((val) => val.trim()),
  description: z
    .string()
    .max(1000, "La descripción no puede exceder 1000 caracteres")
    .optional()
    .transform((val) => val?.trim()),
  order: z
    .number()
    .int("El orden debe ser un número entero")
    .min(0, "El orden no puede ser negativo")
    .default(0),
});

export type CreateSubjectInput = z.infer<typeof createSubjectSchema>;

/**
 * Validación para actualizar una materia
 */
export const updateSubjectSchema = z.object({
  title: z
    .string()
    .min(3, "El título de la materia debe tener al menos 3 caracteres")
    .max(200, "El título no puede exceder 200 caracteres")
    .transform((val) => val.trim())
    .optional(),
  description: z
    .string()
    .max(1000, "La descripción no puede exceder 1000 caracteres")
    .optional()
    .transform((val) => val?.trim()),
  order: z
    .number()
    .int("El orden debe ser un número entero")
    .min(0, "El orden no puede ser negativo")
    .optional(),
});

export type UpdateSubjectInput = z.infer<typeof updateSubjectSchema>;

// ============ ESQUEMAS DE UNIDADES ============

/**
 * Validación para crear una unidad
 */
export const createUnitSchema = z.object({
  subjectId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "ID de materia inválido"),
  courseId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "ID de curso inválido"),
  title: z
    .string()
    .min(3, "El título de la unidad debe tener al menos 3 caracteres")
    .max(200, "El título no puede exceder 200 caracteres")
    .transform((val) => val.trim()),
  content: z
    .string()
    .min(1, "El contenido es requerido")
    .transform((val) => val.trim()),
  order: z
    .number()
    .int("El orden debe ser un número entero")
    .min(0, "El orden no puede ser negativo")
    .default(0),
});

export type CreateUnitInput = z.infer<typeof createUnitSchema>;

/**
 * Validación para actualizar una unidad
 */
export const updateUnitSchema = z.object({
  title: z
    .string()
    .min(3, "El título de la unidad debe tener al menos 3 caracteres")
    .max(200, "El título no puede exceder 200 caracteres")
    .transform((val) => val.trim())
    .optional(),
  content: z
    .string()
    .min(1, "El contenido es requerido")
    .transform((val) => val.trim())
    .optional(),
  order: z
    .number()
    .int("El orden debe ser un número entero")
    .min(0, "El orden no puede ser negativo")
    .optional(),
});

export type UpdateUnitInput = z.infer<typeof updateUnitSchema>;

// ============ ESQUEMAS DE RECURSOS ============

/**
 * Validación para crear un recurso
 */
export const createResourceSchema = z.object({
  unitId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "ID de unidad inválido"),
  courseId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "ID de curso inválido"),
  title: z
    .string()
    .min(3, "El título del recurso debe tener al menos 3 caracteres")
    .max(200, "El título no puede exceder 200 caracteres")
    .transform((val) => val.trim()),
  type: z
    .enum(["link", "file", "text"], { message: "El tipo debe ser link, file o text" }),
  url: z
    .string()
    .url("URL debe ser válida")
    .optional(),
  description: z
    .string()
    .max(500, "La descripción no puede exceder 500 caracteres")
    .optional()
    .transform((val) => val?.trim()),
});

export type CreateResourceInput = z.infer<typeof createResourceSchema>;

/**
 * Validación para actualizar un recurso
 */
export const updateResourceSchema = z.object({
  title: z
    .string()
    .min(3, "El título del recurso debe tener al menos 3 caracteres")
    .max(200, "El título no puede exceder 200 caracteres")
    .transform((val) => val.trim())
    .optional(),
  type: z
    .enum(["link", "file", "text"], { message: "El tipo debe ser link, file o text" })
    .optional(),
  url: z
    .string()
    .url("URL debe ser válida")
    .optional(),
  description: z
    .string()
    .max(500, "La descripción no puede exceder 500 caracteres")
    .optional()
    .transform((val) => val?.trim()),
});

export type UpdateResourceInput = z.infer<typeof updateResourceSchema>;

// ============ ESQUEMAS DE TAREAS ============

/**
 * Validación para crear una tarea
 */
export const createTaskSchema = z.object({
  courseId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "ID de curso inválido"),
  subjectId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "ID de materia inválido"),
  title: z
    .string()
    .min(3, "El título de la tarea debe tener al menos 3 caracteres")
    .max(200, "El título no puede exceder 200 caracteres")
    .transform((val) => val.trim()),
  description: z
    .string()
    .min(1, "La descripción es requerida")
    .transform((val) => val.trim()),
  type: z
    .enum(["assignment", "quiz", "forum", "project"])
    .default("assignment"),
  maxPoints: z
    .number()
    .int("Los puntos deben ser un número entero")
    .min(0, "Los puntos no pueden ser negativos")
    .default(100),
  startDate: z
    .string()
    .datetime({ message: "Fecha de inicio inválida" })
    .transform((val) => new Date(val)),
  dueDate: z
    .string()
    .datetime({ message: "Fecha de entrega inválida" })
    .transform((val) => new Date(val)),
  allowLateSubmission: z
    .boolean()
    .default(false),
  active: z
    .boolean()
    .default(true),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

/**
 * Validación para actualizar una tarea
 */
export const updateTaskSchema = z.object({
  title: z
    .string()
    .min(3, "El título de la tarea debe tener al menos 3 caracteres")
    .max(200, "El título no puede exceder 200 caracteres")
    .transform((val) => val.trim())
    .optional(),
  description: z
    .string()
    .min(1, "La descripción es requerida")
    .transform((val) => val.trim())
    .optional(),
  type: z
    .enum(["assignment", "quiz", "forum", "project"])
    .optional(),
  maxPoints: z
    .number()
    .int("Los puntos deben ser un número entero")
    .min(0, "Los puntos no pueden ser negativos")
    .optional(),
  startDate: z
    .string()
    .datetime({ message: "Fecha de inicio inválida" })
    .transform((val) => new Date(val))
    .optional(),
  dueDate: z
    .string()
    .datetime({ message: "Fecha de entrega inválida" })
    .transform((val) => new Date(val))
    .optional(),
  allowLateSubmission: z
    .boolean()
    .optional(),
  active: z
    .boolean()
    .optional(),
});

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
