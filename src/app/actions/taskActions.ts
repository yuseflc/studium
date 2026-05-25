"use server";

import { getServerSession } from "next-auth/next";
import mongoose from "mongoose";
import { authOptions } from "@/config/auth.config";
import { LOGGER } from "@/config/logger";
import { connectDB } from "@/lib/database/database";
import Course from "@/models/Course";
import Subject from "@/models/Subject";
import Task from "@/models/Task";
import User from "@/models/User";
import {
  createTaskSchema,
  updateTaskSchema,
  reorderSubjectTasksSchema,
} from "@/lib/validators/validators";

export interface CreateTaskActionInput {
  courseId: string;
  subjectId: string;
  title: string;
  description: string;
  dueDate?: string;
  startDate?: string;
  type?: "assignment" | "quiz" | "forum" | "project";
  maxPoints?: number;
  allowLateSubmission?: boolean;
  active?: boolean;
}

export interface TaskActionResult {
  success: boolean;
  error?: string;
  task?: {
    _id: string;
    courseId: string;
    subjectId: string;
    title: string;
    description: string;
    type: "assignment" | "quiz" | "forum" | "project";
    maxPoints: number;
    startDate: string;
    dueDate?: string;
    allowLateSubmission: boolean;
    active: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

function serializeTask(task: any): NonNullable<TaskActionResult["task"]> {
  return {
    _id: task._id.toString(),
    courseId: task.courseId.toString(),
    subjectId: task.subjectId.toString(),
    title: task.title,
    description: task.description,
    type: task.type,
    maxPoints: task.maxPoints,
    startDate: task.startDate.toISOString(),
    dueDate: task.dueDate ? task.dueDate.toISOString() : undefined,
    allowLateSubmission: Boolean(task.allowLateSubmission),
    active: Boolean(task.active),
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

export async function createTask(input: CreateTaskActionInput): Promise<TaskActionResult> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: "No autorizado" };
    }

    const normalizedPayload = {
      ...input,
      startDate: input.startDate ?? new Date().toISOString(),
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

    const { courseId, subjectId, title, description, type, maxPoints, startDate, dueDate, allowLateSubmission, active } = validationResult.data;

    const [course, subject] = await Promise.all([
      Course.findById(courseId),
      Subject.findById(subjectId),
    ]);

    if (!course) {
      return { success: false, error: "Curso no encontrado" };
    }

    if (!subject) {
      return { success: false, error: "Materia no encontrada" };
    }

    if (subject.courseId.toString() !== course._id.toString()) {
      return { success: false, error: "La materia no pertenece al curso" };
    }

    const currentUserId = currentUser._id.toString();
    const isOwner = course.ownerId.toString() === currentUserId;
    const isTeacher = course.teachers.some((teacherId: mongoose.Types.ObjectId) => teacherId.toString() === currentUserId);

    if (!isOwner && !isTeacher) {
      return { success: false, error: "No tienes permiso para crear tareas en este curso" };
    }

    const task = await Task.create({
      courseId: new mongoose.Types.ObjectId(courseId),
      subjectId: new mongoose.Types.ObjectId(subjectId),
      createdById: new mongoose.Types.ObjectId(currentUser._id),
      title,
      description,
      type: type || "assignment",
      maxPoints: maxPoints ?? 100,
      startDate,
      dueDate: dueDate ?? undefined,
      allowLateSubmission: allowLateSubmission ?? false,
      active: active !== false,
      criteria: [],
    });

    await Subject.findByIdAndUpdate(subjectId, { $push: { taskIds: task._id } });

    LOGGER.info(
      {
        taskId: task._id.toString(),
        courseId,
        subjectId,
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

export async function updateTask(
  taskId: string,
  input: {
    title?: string;
    description?: string;
    type?: "assignment" | "quiz" | "forum" | "project";
    maxPoints?: number;
    startDate?: string;
    dueDate?: string;
    allowLateSubmission?: boolean;
    active?: boolean;
  }
): Promise<TaskActionResult> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: "No autorizado" };
    }

    const validationResult = updateTaskSchema.safeParse(input);
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
    if (data.title !== undefined) task.title = data.title;
    if (data.description !== undefined) task.description = data.description;
    if (data.type !== undefined) task.type = data.type;
    if (data.maxPoints !== undefined) task.maxPoints = data.maxPoints;
    if (data.startDate !== undefined) task.startDate = data.startDate;
    if (data.dueDate !== undefined) task.dueDate = data.dueDate;
    if (data.allowLateSubmission !== undefined) task.allowLateSubmission = data.allowLateSubmission;
    if (data.active !== undefined) task.active = data.active;

    task.updatedAt = new Date();
    await task.save();

    return { success: true, task: serializeTask(task) };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al actualizar la tarea";
    LOGGER.error({ error, taskId }, "Error updating task from action");
    return { success: false, error: message };
  }
}

export async function reorderSubjectTasks(
  subjectId: string,
  taskIds: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: "No autorizado" };
    }

    const validationResult = reorderSubjectTasksSchema.safeParse({ subjectId, taskIds });
    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.issues[0]?.message || "Orden de tareas inválido",
      };
    }

    await connectDB();

    const currentUser = await User.findOne({ email: session.user.email }).lean();
    if (!currentUser) {
      return { success: false, error: "Usuario no encontrado" };
    }

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return { success: false, error: "Materia no encontrada" };
    }

    const course = await Course.findById(subject.courseId);
    if (!course) {
      return { success: false, error: "Curso no encontrado" };
    }

    const currentUserId = currentUser._id.toString();
    const isOwner = course.ownerId.toString() === currentUserId;
    const isTeacher = course.teachers.some((teacherId: mongoose.Types.ObjectId) => teacherId.toString() === currentUserId);

    if (!isOwner && !isTeacher) {
      return { success: false, error: "No tienes permiso para reordenar las tareas" };
    }

    const tasks = await Task.find({ _id: { $in: taskIds }, subjectId }).select("_id").lean();
    if (tasks.length !== taskIds.length) {
      return { success: false, error: "Una o más tareas no pertenecen a la materia" };
    }

    await Subject.findByIdAndUpdate(subjectId, { taskIds });

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al reordenar las tareas";
    LOGGER.error({ error, subjectId }, "Error reordering tasks from action");
    return { success: false, error: message };
  }
}

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
    await Subject.findByIdAndUpdate(task.subjectId, { $pull: { taskIds: new mongoose.Types.ObjectId(taskId) } });

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