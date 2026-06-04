/* Archivo: src\lib\validators\validators.ts
  Descripción: Validadores y esquemas reutilizables para formularios y rutas API. */

// Validadores Zod reutilizables para request bodies y formularios
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
  coverImage: z.string().optional(),
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
  coverImage: z.string().optional(),
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
// Subject eliminado: usar Units como agrupación principal dentro de un Course

// ============ ESQUEMAS DE UNIDADES ============

/**
 * Validación para crear una unidad
 */
export const createUnitSchema = z.object({
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

export const reorderUnitsSchema = z.object({
  courseId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "ID de curso inválido"),
  unitIds: z
    .array(z.string().regex(/^[0-9a-fA-F]{24}$/, "ID de unidad inválido"))
    .min(1, "Debe existir al menos una unidad"),
});

export type ReorderUnitsInput = z.infer<typeof reorderUnitsSchema>;

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
    .max(5000, "El texto del recurso no puede exceder 5000 caracteres")
    .optional()
    .transform((val) => val?.trim()),
  content: z
    .string()
    .max(5000, "El contenido del recurso no puede exceder 5000 caracteres")
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
    .max(5000, "El texto del recurso no puede exceder 5000 caracteres")
    .optional()
    .transform((val) => val?.trim()),
  content: z
    .string()
    .max(5000, "El contenido del recurso no puede exceder 5000 caracteres")
    .optional()
    .transform((val) => val?.trim()),
});

export type UpdateResourceInput = z.infer<typeof updateResourceSchema>;

export const reorderResourcesSchema = z.object({
  unitId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "ID de unidad inválido"),
  resourceIds: z
    .array(z.string().regex(/^[0-9a-fA-F]{24}$/, "ID de recurso inválido"))
    .min(1, "Debe existir al menos un recurso"),
});

export type ReorderResourcesInput = z.infer<typeof reorderResourcesSchema>;

// ============ ESQUEMAS DE TAREAS ============

/**
 * Validación para crear una tarea
 */
export const createTaskSchema = z.object({
  courseId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "ID de curso inválido"),
  unitId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "ID de unidad inválido"),
  title: z
    .string()
    .min(3, "El título de la tarea debe tener al menos 3 caracteres")
    .max(200, "El título no puede exceder 200 caracteres")
    .transform((val) => val.trim()),
  description: z
    .string()
    .min(1, "La descripción es requerida")
    .transform((val) => val.trim()),
  instructions: z
    .string()
    .max(5000, "Las instrucciones no pueden exceder 5000 caracteres")
    .optional()
    .transform((val) => val?.trim()),
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
    .transform((val) => new Date(val))
    .optional(),
  allowLateSubmission: z
    .boolean()
    .default(false),
  active: z
    .boolean()
    .default(true),
  image: z
    .string()
    .url("La URL de la imagen debe ser válida")
    .optional(),
  priority: z
    .enum(["low", "medium", "high"])
    .default("medium"),
  isOptional: z
    .boolean()
    .default(false),
  countsTowardAverage: z
    .boolean()
    .default(true),
  assignmentMode: z
    .enum(["all", "manual", "filtered"])
    .default("all"),
  assignedStudentIds: z
    .array(z.string().regex(/^[0-9a-fA-F]{24}$/, "ID de estudiante inválido"))
    .default([]),
  assignmentFilterKind: z
    .enum(["failing_average", "below_threshold", "failed_task"])
    .optional(),
  assignmentThreshold: z
    .number()
    .min(0, "El umbral no puede ser negativo")
    .max(10, "El umbral no puede superar 10")
    .optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const createTaskWithAssignmentSchema = createTaskSchema.extend({
  instructions: z
    .string()
    .min(1, "Las instrucciones son requeridas")
    .max(5000, "Las instrucciones no pueden exceder 5000 caracteres")
    .transform((val) => val.trim()),
  assignmentMode: z.enum(["all", "manual", "filtered"]),
  assignedStudentIds: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, "ID de estudiante inválido")),
}).superRefine((value, context) => {
  if (value.assignmentMode === "manual" && value.assignedStudentIds.length === 0) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["assignedStudentIds"],
      message: "Selecciona al menos un alumno para la asignación manual",
    });
  }

  if (value.assignmentMode === "filtered") {
    if (!value.assignmentFilterKind) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["assignmentFilterKind"],
        message: "Selecciona un filtro para la asignación",
      });
    }

    if (value.assignmentFilterKind === "below_threshold" && typeof value.assignmentThreshold !== "number") {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["assignmentThreshold"],
        message: "Define una nota umbral para el filtro",
      });
    }
  }
});

export type CreateTaskWithAssignmentInput = z.infer<typeof createTaskWithAssignmentSchema>;

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
  image: z
    .string()
    .url("La URL de la imagen debe ser válida")
    .optional(),
  priority: z
    .enum(["low", "medium", "high"])
    .optional(),
});

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

export const reorderUnitTasksSchema = z.object({
  unitId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "ID de unidad inválido"),
  taskIds: z
    .array(z.string().regex(/^[0-9a-fA-F]{24}$/, "ID de tarea inválido"))
    .min(1, "Debe existir al menos una tarea"),
});

export type ReorderUnitTasksInput = z.infer<typeof reorderUnitTasksSchema>;

// Esquemas de compatibilidad hacia atrás para APIs basadas en Subject (deprecado)
export const createSubjectSchema = z.object({
  courseId: z.string().regex(/^[0-9a-fA-F]{24}$/, "ID de curso inválido"),
  title: z.string().min(3).max(200).transform((v) => v.trim()),
  description: z.string().max(1000).optional().transform((v) => v?.trim()),
  order: z.number().int().min(0).optional().default(0),
});

export type CreateSubjectInput = z.infer<typeof createSubjectSchema>;

export const updateSubjectSchema = z.object({
  title: z.string().min(3).max(200).transform((v) => v.trim()).optional(),
  description: z.string().max(1000).optional().transform((v) => v?.trim()),
  order: z.number().int().min(0).optional(),
});

export type UpdateSubjectInput = z.infer<typeof updateSubjectSchema>;

export const reorderSubjectsSchema = z.object({
  courseId: z.string().regex(/^[0-9a-fA-F]{24}$/, "ID de curso inválido"),
  subjectIds: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, "ID de materia inválido")).min(1),
});

export type ReorderSubjectsInput = z.infer<typeof reorderSubjectsSchema>;

// Mapear el reordenamiento de tareas por subject al de units por compatibilidad
export const reorderSubjectTasksSchema = reorderUnitTasksSchema;
export type ReorderSubjectTasksInput = ReorderUnitTasksInput;

// Nuevo esquema: `unitIds` — se añade para soportar operaciones 'unit-first'.
// Mantener `subjectIds` es compatible, pero las nuevas APIs deberían preferir `unitIds`.
export const unitIdsSchema = z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, "ID de unidad inválido")).min(1);
export type UnitIdsInput = z.infer<typeof unitIdsSchema>;
