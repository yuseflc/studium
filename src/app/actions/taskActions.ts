"use server";

import { getServerSession } from "next-auth/next";
import mongoose from "mongoose";
import { authOptions } from "@/config/auth.config";
import { revalidatePath } from "next/cache";
import { LOGGER } from "@/config/logger";
import { connectDB } from "@/lib/database/database";
import Course from "@/models/Course";
import Unit from "@/models/Unit";
import Task from "@/models/Task";
import User from "@/models/User";
import Submission from "@/models/Submission";
import { uploadToR2 } from "@/lib/r2";
import { getTaskCreationContext, resolveAssignmentRecipients, type AssignmentFilterKind, type AssignmentMode } from "@/lib/task-assignment";
import {
  createTaskSchema,
  updateTaskSchema,
  reorderSubjectTasksSchema,
  createTaskWithAssignmentSchema,
} from "@/lib/validators/validators";

export interface CreateTaskActionInput {
  courseId: string;
  unitId: string;
  title: string;
  description: string;
  instructions?: string;
  dueDate?: string;
  startDate?: string;
  type?: "assignment" | "quiz" | "forum" | "project";
  maxPoints?: number;
  allowLateSubmission?: boolean;
  active?: boolean;
  image?: string;
  priority?: "low" | "medium" | "high";
  isOptional?: boolean;
  countsTowardAverage?: boolean;
  assignmentMode?: AssignmentMode;
  assignedStudentIds?: string[];
  assignmentFilterKind?: AssignmentFilterKind;
  assignmentThreshold?: number;
}

export interface UpdateTaskActionInput {
  taskId: string;
  courseId: string;
  unitId: string;
  title: string;
  description: string;
  instructions?: string;
  dueDate?: string | null;
  startDate?: string;
  type?: "assignment" | "quiz" | "forum" | "project";
  maxPoints?: number;
  allowLateSubmission?: boolean;
  active?: boolean;
  image?: string;
  priority?: "low" | "medium" | "high";
  isOptional?: boolean;
  countsTowardAverage?: boolean;
  assignmentMode?: AssignmentMode;
  assignedStudentIds?: string[];
  assignmentFilterKind?: AssignmentFilterKind;
  assignmentThreshold?: number;
}

export interface TaskActionResult {
  success: boolean;
  error?: string;
  task?: {
    _id: string;
    courseId: string;
    unitId?: string;
    title: string;
    description: string;
    instructions?: string;
    type: "assignment" | "quiz" | "forum" | "project";
    maxPoints: number;
    startDate: string;
    dueDate?: string;
    allowLateSubmission: boolean;
    active: boolean;
    image?: string;
    priority: "low" | "medium" | "high";
    isOptional: boolean;
    countsTowardAverage: boolean;
    assignmentMode: AssignmentMode;
    assignmentFilterKind?: AssignmentFilterKind;
    assignmentThreshold?: number;
    assignedStudentIds: string[];
    createdAt: string;
    updatedAt: string;
  };
}

function serializeTask(task: any): NonNullable<TaskActionResult["task"]> {
  return {
    _id: task._id.toString(),
    courseId: task.courseId.toString(),
    unitId: task.unitId ? task.unitId.toString() : undefined,
    title: task.title,
    description: task.description,
    instructions: task.instructions,
    type: task.type,
    maxPoints: task.maxPoints,
    startDate: task.startDate.toISOString(),
    dueDate: task.dueDate ? task.dueDate.toISOString() : undefined,
    allowLateSubmission: Boolean(task.allowLateSubmission),
    active: Boolean(task.active),
    image: task.image,
    priority: task.priority || "medium",
    isOptional: Boolean(task.isOptional),
    countsTowardAverage: Boolean(task.countsTowardAverage ?? true),
    assignmentMode: task.assignmentMode || "all",
    assignmentFilterKind: task.assignmentFilterKind,
    assignmentThreshold: task.assignmentThreshold,
    assignedStudentIds: Array.isArray(task.assignedStudentIds)
      ? task.assignedStudentIds.map((id: any) => id.toString())
      : [],
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

function parseTaskFormData(formData: FormData) {
  const rawAssignedStudentIds = formData.get("assignedStudentIds") ?? formData.get("selectedStudentIds");
  const parsedAssignedStudentIds = typeof rawAssignedStudentIds === "string" && rawAssignedStudentIds.trim().length > 0
    ? JSON.parse(rawAssignedStudentIds)
    : [];

  const rawAssignmentThreshold = formData.get("assignmentThreshold");
  const parsedAssignmentThreshold = typeof rawAssignmentThreshold === "string" && rawAssignmentThreshold.trim().length > 0
    ? Number(rawAssignmentThreshold)
    : undefined;

  const isActive = formData.get("active") !== "false";

  const rawDueDate = formData.get("dueDate");
  const normalizedDueDate = typeof rawDueDate === "string" && rawDueDate.trim().length > 0
    ? new Date(rawDueDate).toISOString()
    : undefined;

  return {
    courseId: String(formData.get("courseId") || ""),
    unitId: String(formData.get("unitId") || ""),
    title: String(formData.get("title") || ""),
    description: String(formData.get("description") || ""),
    instructions: String(formData.get("instructions") || ""),
    dueDate: normalizedDueDate,
    startDate: String(formData.get("startDate") || new Date().toISOString()),
    type: String(formData.get("type") || "assignment") as CreateTaskActionInput["type"],
    maxPoints: Number(formData.get("maxPoints") || 100),
    allowLateSubmission: formData.get("allowLateSubmission") === "true",
    active: isActive,
    image: String(formData.get("image") || "") || undefined,
    priority: String(formData.get("priority") || "medium") as CreateTaskActionInput["priority"],
    isOptional: formData.get("isOptional") === "true",
    countsTowardAverage: formData.get("countsTowardAverage") !== "false",
    assignmentMode: String(formData.get("assignmentMode") || "all") as AssignmentMode,
    assignedStudentIds: Array.isArray(parsedAssignedStudentIds) ? parsedAssignedStudentIds : [],
    assignmentFilterKind: String(formData.get("assignmentFilterKind") || "") || undefined,
    assignmentThreshold: Number.isFinite(parsedAssignmentThreshold) ? parsedAssignmentThreshold : undefined,
  };
}

export async function createTask(input: CreateTaskActionInput): Promise<TaskActionResult> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: "No autorizado" };
    }

    const serializeDate = (value: string | Date | undefined) => {
      if (!value) {
        return undefined;
      }

      return value instanceof Date ? value.toISOString() : value;
    };

    const normalizedPayload = {
      ...input,
      startDate: serializeDate(input.startDate) ?? new Date().toISOString(),
      dueDate: serializeDate(input.dueDate),
    };

    const validationResult = createTaskSchema.safeParse(normalizedPayload);
    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.issues[0]?.message || "Datos de tarea inválidos",
      };
    }

    await connectDB();

    const currentUser = await User.findOne({ email: session.user.email }).lean();
    if (!currentUser) {
      return { success: false, error: "Usuario no encontrado" };
    }

    const { courseId, unitId, title, description, instructions, type, maxPoints, startDate, dueDate, allowLateSubmission, active, image, priority, isOptional, countsTowardAverage, assignmentMode, assignedStudentIds, assignmentFilterKind, assignmentThreshold } = validationResult.data;

    const [course, unit] = await Promise.all([
      Course.findById(courseId),
      Unit.findById(unitId),
    ]);

    if (!course) {
      return { success: false, error: "Curso no encontrado" };
    }

    if (!unit) {
      return { success: false, error: "Unidad no encontrada" };
    }

    if (unit.courseId.toString() !== course._id.toString()) {
      return { success: false, error: "La unidad no pertenece al curso" };
    }

    const currentUserId = currentUser._id.toString();
    const isOwner = course.ownerId.toString() === currentUserId;
    const isTeacher = course.teachers.some((teacherId: mongoose.Types.ObjectId) => teacherId.toString() === currentUserId);

    if (!isOwner && !isTeacher) {
      return { success: false, error: "No tienes permiso para crear tareas en este curso" };
    }

    const assignmentContext = await getTaskCreationContext(courseId);
    if (!assignmentContext) {
      return { success: false, error: "No se pudo cargar el contexto de asignación" };
    }

    const resolvedRecipients = resolveAssignmentRecipients(assignmentContext.students, {
      assignmentMode: assignmentMode || "all",
      assignedStudentIds,
      assignmentFilterKind,
      assignmentThreshold,
    });

    if (assignmentMode === "manual") {
      const requestedIds = Array.isArray(assignedStudentIds) ? Array.from(new Set(assignedStudentIds)) : [];
      if (requestedIds.length !== resolvedRecipients.studentIds.length) {
        return { success: false, error: "Uno o más alumnos seleccionados no pertenecen al curso" };
      }
    }

    if (assignmentMode === "manual" && resolvedRecipients.studentIds.length === 0) {
      return { success: false, error: "Selecciona al menos un alumno" };
    }

    if (assignmentMode === "filtered" && resolvedRecipients.studentIds.length === 0) {
      return { success: false, error: "El filtro seleccionado no devuelve alumnos" };
    }

    const task = await Task.create({
      courseId: new mongoose.Types.ObjectId(courseId),
      unitId: unitId ? new mongoose.Types.ObjectId(unitId) : undefined,
      createdById: new mongoose.Types.ObjectId(currentUser._id),
      title,
      description,
      instructions: instructions || description,
      type: type || "assignment",
      maxPoints: maxPoints ?? 100,
      startDate,
      dueDate: dueDate ?? undefined,
      allowLateSubmission: allowLateSubmission ?? false,
      active: active !== false,
      image,
      priority: priority || "medium",
      isOptional: isOptional ?? false,
      countsTowardAverage: countsTowardAverage ?? true,
      assignmentMode: assignmentMode || "all",
      assignmentFilterKind,
      assignmentThreshold,
      assignedStudentIds: resolvedRecipients.studentIds.map((studentId) => new mongoose.Types.ObjectId(studentId)),
      criteria: [],
    });

    if (unitId) {
      await Unit.findByIdAndUpdate(unitId, { $push: { taskIds: task._id } });
    }

    LOGGER.info(
      {
        taskId: task._id.toString(),
        courseId,
        unitId,
        createdBy: currentUserId,
      },
      "Task creada"
    );

    return { success: true, task: serializeTask(task) };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al crear la tarea";
    LOGGER.error({ error }, "Error creating task from action");
    return { success: false, error: message };
  }
}

export interface TaskCreationFormState {
  success: boolean;
  message?: string;
  taskId?: string;
  redirectTo?: string;
}

export async function createTaskFromFormData(
  _previousState: TaskCreationFormState,
  formData: FormData
): Promise<TaskCreationFormState> {
  try {
    const payload = parseTaskFormData(formData);

    const validationResult = createTaskWithAssignmentSchema.safeParse({
      ...payload,
      assignmentFilterKind: payload.assignmentFilterKind || undefined,
    });

    if (!validationResult.success) {
      return {
        success: false,
        message: validationResult.error.issues[0]?.message || "Datos inválidos",
      };
    }

    const result = await createTask(validationResult.data);
    if (!result.success || !result.task) {
      return {
        success: false,
        message: result.error || "No se pudo crear la tarea",
      };
    }

    return {
      success: true,
      taskId: result.task._id,
      message: "Tarea creada correctamente",
      redirectTo: payload.active ? `/mycourses/${payload.courseId}/tasks/${result.task._id}` : `/mycourses/${payload.courseId}`,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al crear la tarea";
    return {
      success: false,
      message,
    };
  }
}

export async function updateTaskFromFormData(
  _previousState: TaskCreationFormState,
  formData: FormData
): Promise<TaskCreationFormState> {
  try {
    const taskId = String(formData.get("taskId") || "");
    const payload = parseTaskFormData(formData);

    const validationResult = createTaskWithAssignmentSchema.safeParse({
      ...payload,
      assignmentFilterKind: payload.assignmentFilterKind || undefined,
    });

    if (!validationResult.success) {
      return {
        success: false,
        message: validationResult.error.issues[0]?.message || "Datos inválidos",
      };
    }

    if (!taskId || !mongoose.Types.ObjectId.isValid(taskId)) {
      return {
        success: false,
        message: "ID de tarea inválido",
      };
    }

    const result = await updateTask(taskId, {
      taskId,
      courseId: validationResult.data.courseId,
      unitId: validationResult.data.unitId,
      title: validationResult.data.title,
      description: validationResult.data.description,
      instructions: validationResult.data.instructions,
      dueDate: validationResult.data.dueDate ? validationResult.data.dueDate.toISOString() : null,
      startDate: validationResult.data.startDate.toISOString(),
      type: validationResult.data.type,
      maxPoints: validationResult.data.maxPoints,
      allowLateSubmission: validationResult.data.allowLateSubmission,
      active: validationResult.data.active,
      image: validationResult.data.image,
      priority: validationResult.data.priority,
      isOptional: validationResult.data.isOptional,
      countsTowardAverage: validationResult.data.countsTowardAverage,
      assignmentMode: validationResult.data.assignmentMode,
      assignedStudentIds: validationResult.data.assignedStudentIds,
      assignmentFilterKind: validationResult.data.assignmentFilterKind,
      assignmentThreshold: validationResult.data.assignmentThreshold,
    });

    if (!result.success || !result.task) {
      return {
        success: false,
        message: result.error || "No se pudo actualizar la tarea",
      };
    }

    return {
      success: true,
      taskId: result.task._id,
      message: "Tarea actualizada correctamente",
      redirectTo: `/mycourses/${validationResult.data.courseId}/tasks/${result.task._id}`,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al actualizar la tarea";
    return {
      success: false,
      message,
    };
  }
}

export async function updateTask(
  taskId: string,
  input: {
    taskId?: string;
    courseId?: string;
    unitId?: string;
    title?: string;
    description?: string;
    instructions?: string;
    type?: "assignment" | "quiz" | "forum" | "project";
    maxPoints?: number;
    startDate?: string;
    dueDate?: string | null;
    allowLateSubmission?: boolean;
    active?: boolean;
    image?: string;
    priority?: "low" | "medium" | "high";
    isOptional?: boolean;
    countsTowardAverage?: boolean;
    assignmentMode?: AssignmentMode;
    assignedStudentIds?: string[];
    assignmentFilterKind?: AssignmentFilterKind;
    assignmentThreshold?: number;
  }
): Promise<TaskActionResult> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: "No autorizado" };
    }

    const validationResult = updateTaskSchema.safeParse({
      title: input.title,
      description: input.description,
      type: input.type,
      maxPoints: input.maxPoints,
      startDate: input.startDate,
      dueDate: input.dueDate === null ? undefined : input.dueDate,
      allowLateSubmission: input.allowLateSubmission,
      active: input.active,
      image: input.image,
      priority: input.priority,
    });
    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.issues[0]?.message || "Datos de tarea inválidos",
      };
    }

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return { success: false, error: "ID de tarea inválido" };
    }

    await connectDB();

    const currentUser = await User.findOne({ email: session.user.email }).lean();
    if (!currentUser) {
      return { success: false, error: "Usuario no encontrado" };
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return { success: false, error: "Tarea no encontrada" };
    }

    const course = await Course.findById(task.courseId);
    if (!course) {
      return { success: false, error: "Curso no encontrado" };
    }

    const currentUserId = currentUser._id.toString();
    const isOwner = course.ownerId.toString() === currentUserId;
    const isTeacher = course.teachers.some((teacherId: mongoose.Types.ObjectId) => teacherId.toString() === currentUserId);
    const isCreator = task.createdById.toString() === currentUserId;

    if (!isOwner && !isTeacher && !isCreator) {
      return { success: false, error: "No tienes permiso para actualizar esta tarea" };
    }

    const data = validationResult.data;

    if (input.unitId && task.unitId?.toString() !== input.unitId) {
      const targetUnit = await Unit.findById(input.unitId);
      if (!targetUnit) {
        return { success: false, error: "Unidad no encontrada" };
      }

      if (targetUnit.courseId.toString() !== course._id.toString()) {
        return { success: false, error: "La unidad no pertenece al curso" };
      }

      if (task.unitId) {
        await Unit.findByIdAndUpdate(task.unitId, { $pull: { taskIds: task._id } });
      }

      await Unit.findByIdAndUpdate(targetUnit._id, { $addToSet: { taskIds: task._id } });
      task.unitId = targetUnit._id;
    }

    if (data.title !== undefined) task.title = data.title;
    if (data.description !== undefined) task.description = data.description;
    if (input.instructions !== undefined) task.instructions = input.instructions;
    if (data.type !== undefined) task.type = data.type;
    if (data.maxPoints !== undefined) task.maxPoints = data.maxPoints;
    if (data.startDate !== undefined) task.startDate = data.startDate;
    if (input.dueDate === null) task.dueDate = undefined;
    else if (data.dueDate !== undefined) task.dueDate = data.dueDate;
    if (data.allowLateSubmission !== undefined) task.allowLateSubmission = data.allowLateSubmission;
    if (data.active !== undefined) task.active = data.active;
    if (data.image !== undefined) task.image = data.image;
    if (data.priority !== undefined) task.priority = data.priority;
    if (input.isOptional !== undefined) task.isOptional = input.isOptional;
    if (input.countsTowardAverage !== undefined) task.countsTowardAverage = input.countsTowardAverage;
    if (input.assignmentMode !== undefined) task.assignmentMode = input.assignmentMode;

    if (input.assignmentMode || input.assignedStudentIds || input.assignmentFilterKind || input.assignmentThreshold !== undefined) {
      const assignmentContext = await getTaskCreationContext(task.courseId.toString());
      if (!assignmentContext) {
        return { success: false, error: "No se pudo cargar el contexto de asignación" };
      }

      const resolvedRecipients = resolveAssignmentRecipients(assignmentContext.students, {
        assignmentMode: input.assignmentMode || task.assignmentMode || "all",
        assignedStudentIds: Array.isArray(input.assignedStudentIds) ? input.assignedStudentIds : [],
        assignmentFilterKind: input.assignmentFilterKind,
        assignmentThreshold: input.assignmentThreshold,
      });

      if ((input.assignmentMode || task.assignmentMode) === "manual" && resolvedRecipients.studentIds.length === 0) {
        return { success: false, error: "Selecciona al menos un alumno" };
      }

      if ((input.assignmentMode || task.assignmentMode) === "filtered" && resolvedRecipients.studentIds.length === 0) {
        return { success: false, error: "El filtro seleccionado no devuelve alumnos" };
      }

      task.assignmentMode = input.assignmentMode || task.assignmentMode || "all";
      task.assignmentFilterKind = input.assignmentFilterKind;
      task.assignmentThreshold = input.assignmentThreshold;
      task.assignedStudentIds = resolvedRecipients.studentIds.map((studentId) => new mongoose.Types.ObjectId(studentId));
    }

    task.updatedAt = new Date();
    await task.save();

    return { success: true, task: serializeTask(task) };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al actualizar la tarea";
    LOGGER.error({ error, taskId }, "Error updating task from action");
    return { success: false, error: message };
  }
}

export async function reorderUnitTasks(
  unitId: string,
  taskIds: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: "No autorizado" };
    }

    const validationResult = reorderSubjectTasksSchema.safeParse({ unitId, taskIds });
    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.issues[0]?.message || "Orden de tareas inválido",
      };
    }

    await connectDB();

    // (function continues)

    const currentUser = await User.findOne({ email: session.user.email }).lean();
    if (!currentUser) {
      return { success: false, error: "Usuario no encontrado" };
    }

    const unit = await Unit.findById(unitId);
    if (!unit) {
      return { success: false, error: "Unidad no encontrada" };
    }

    const course = await Course.findById(unit.courseId);
    if (!course) {
      return { success: false, error: "Curso no encontrado" };
    }

    const currentUserId = currentUser._id.toString();
    const isOwner = course.ownerId.toString() === currentUserId;
    const isTeacher = course.teachers.some((teacherId: mongoose.Types.ObjectId) => teacherId.toString() === currentUserId);

    if (!isOwner && !isTeacher) {
      return { success: false, error: "No tienes permiso para reordenar las tareas" };
    }

    const tasks = await Task.find({ _id: { $in: taskIds }, unitId }).select("_id").lean();
    if (tasks.length !== taskIds.length) {
      return { success: false, error: "Una o más tareas no pertenecen a la unidad" };
    }

    await Unit.findByIdAndUpdate(unitId, { taskIds });

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al reordenar las tareas";
    LOGGER.error({ error, unitId }, "Error reordering tasks from action");
    return { success: false, error: message };
  }
}

// Backwards compatibility alias
export const reorderSubjectTasks = reorderUnitTasks;

export async function deleteTask(taskId: string): Promise<TaskActionResult> {
  try {
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return { success: false, error: "ID de tarea inválido" };
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: "No autorizado" };
    }

    await connectDB();

    const currentUser = await User.findOne({ email: session.user.email }).lean();
    if (!currentUser) {
      return { success: false, error: "Usuario no encontrado" };
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return { success: false, error: "Tarea no encontrada" };
    }

    const course = await Course.findById(task.courseId);
    if (!course) {
      return { success: false, error: "Curso no encontrado" };
    }

    const currentUserId = currentUser._id.toString();
    const isOwner = course.ownerId.toString() === currentUserId;
    const isTeacher = course.teachers.some((teacherId: mongoose.Types.ObjectId) => teacherId.toString() === currentUserId);
    const isCreator = task.createdById.toString() === currentUserId;

    if (!isOwner && !isTeacher && !isCreator) {
      return { success: false, error: "No tienes permiso para eliminar esta tarea" };
    }

    await Task.findByIdAndDelete(taskId);
    if (task.unitId) {
      await Unit.findByIdAndUpdate(task.unitId, { $pull: { taskIds: new mongoose.Types.ObjectId(taskId) } });
    }

    LOGGER.info(
      {
        taskId,
        courseId: course._id.toString(),
        deletedBy: currentUserId,
      },
      "Task eliminada"
    );

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al eliminar la tarea";
    LOGGER.error({ error }, "Error deleting task from action");
    return { success: false, error: message };
  }
}

/**
 * Entrega una tarea subiendo archivos a R2 si es necesario
 */
export async function submitTask(formData: FormData): Promise<{ success: boolean; error?: string; submissionId?: string }> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: "No autorizado" };
    }

    const taskId = formData.get("taskId") as string;
    const content = formData.get("content") as string;
    const file = formData.get("file") as File | null;

    console.log("SubmitTask Action:", {
      taskId,
      hasContent: !!content,
      fileName: file?.name,
      fileSize: file?.size
    });

    if (!taskId || !mongoose.Types.ObjectId.isValid(taskId)) {
      return { success: false, error: "ID de tarea inválido" };
    }

    await connectDB();

    const currentUser = await User.findOne({ email: session.user.email }).lean();
    if (!currentUser) {
      return { success: false, error: "Usuario no encontrado" };
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return { success: false, error: "Tarea no encontrada" };
    }

    let fileUrls: string[] = [];

    if (file && file.size > 0) {
      try {
        console.log("Iniciando subida a R2...", { name: file.name, type: file.type, size: file.size });
        const buffer = Buffer.from(await file.arrayBuffer());
        const timestamp = Date.now();
        const safeFileName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
        const key = `submissions/${taskId}/${currentUser._id}-${timestamp}-${safeFileName}`;
        
        const uploadedUrl = await uploadToR2(buffer, key, file.type);
        console.log("Subida exitosa a R2:", uploadedUrl);
        fileUrls.push(uploadedUrl);
      } catch (uploadError: any) {
        console.error("ERROR DETALLADO R2:", {
          message: uploadError.message,
          code: uploadError.code,
          stack: uploadError.stack,
          name: uploadError.name
        });
        LOGGER.error({ uploadError, taskId, userId: currentUser._id }, "Error uploading file to R2");
        return { success: false, error: `Error de conexión con R2: ${uploadError.message}` };
      }
    }

    // Guardar o actualizar la entrega
    // El modelo Submission tiene un índice único por { taskId, studentId }
    const updateData: any = {
      content: content || "",
      submissionStatus: "submitted",
      submittedAt: new Date(),
    };

    if (fileUrls.length > 0) {
      updateData.$push = { files: { $each: fileUrls } };
    }

    const submission = await Submission.findOneAndUpdate(
      { taskId: new mongoose.Types.ObjectId(taskId), studentId: currentUser._id },
      updateData,
      { upsert: true, new: true }
    );

    LOGGER.info(
      {
        taskId,
        studentId: currentUser._id.toString(),
        submissionId: submission._id.toString(),
      },
      "Tarea entregada con éxito"
    );

    // Revalidar el curso para actualizar el tic verde en la vista general
    const courseId = task.courseId.toString();
    if (courseId) {
      revalidatePath(`/mycourses/${courseId}`);
    }

    return { 
      success: true, 
      submissionId: submission._id.toString() 
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al entregar la tarea";
    LOGGER.error({ error }, "Error submitting task from action");
    return { success: false, error: message };
  }
}

export async function deleteSubmission(taskId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: "No autorizado" };
    }

    if (!taskId || !mongoose.Types.ObjectId.isValid(taskId)) {
      return { success: false, error: "ID de tarea inválido" };
    }

    await connectDB();

    const currentUser = await User.findOne({ email: session.user.email }).lean();
    if (!currentUser) {
      return { success: false, error: "Usuario no encontrado" };
    }

    // Buscar y eliminar la entrega del estudiante para esta tarea
    const result = await Submission.findOneAndDelete({
      taskId: new mongoose.Types.ObjectId(taskId),
      studentId: currentUser._id
    });

    if (!result) {
      return { success: false, error: "No se encontró ninguna entrega para borrar" };
    }

    LOGGER.info(
      {
        taskId,
        studentId: currentUser._id.toString(),
      },
      "Entrega eliminada con éxito"
    );

    // Revalidar el curso para actualizar el tic verde en la vista general
    const task = await Task.findById(taskId).select("courseId");
    if (task?.courseId) {
      revalidatePath(`/mycourses/${task.courseId.toString()}`);
    }

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al eliminar la entrega";
    LOGGER.error({ error, taskId }, "Error deleting submission from action");
    return { success: false, error: message };
  }
}