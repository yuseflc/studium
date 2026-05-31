/* Archivo: src\app\actions\unitActions.ts
  Descripción: Acciones del lado del cliente/servidor para gestionar unidades (CRUD y helpers). */

"use server";
// Server Action: helpers para operaciones CRUD sobre unidades (Unit)
// Valida permisos y revalida paths cuando es necesario

// Server Action: operaciones CRUD y reordenación de unidades de curso (requiere DB)
import mongoose from "mongoose";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/config/auth.config";
import { LOGGER } from "@/config/logger";
import { connectDB } from "@/lib/database/database";
import Course from "@/models/Course";
// Subject model removed: units are linked directly to Course
import Unit from "@/models/Unit";
import Resource from "@/models/Resource";
import User from "@/models/User";
import {
  createUnitSchema,
  updateUnitSchema,
  reorderUnitsSchema,
} from "@/lib/validators/validators";

export interface CreateUnitActionInput {
  courseId: string;
  title: string;
  content: string;
  order?: number;
}

export interface UnitActionResult {
  success: boolean;
  error?: string;
  unit?: {
    _id: string;
    courseId: string;
    title: string;
    content: string;
    order: number;
    resourceIds: string[];
    createdAt: string;
    updatedAt: string;
  };
}

function serializeUnit(unit: {
  _id: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  order: number;
  resourceIds?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}): NonNullable<UnitActionResult["unit"]> {
  // Convertimos el documento de Mongoose en un objeto plano para que el cliente
  // reciba solo valores serializables y no dependa del modelo de base de datos.
  return {
    _id: unit._id.toString(),
    courseId: unit.courseId.toString(),
    title: unit.title,
    content: unit.content,
    order: unit.order,
    resourceIds: unit.resourceIds?.map((resourceId) => resourceId.toString()) || [],
    createdAt: unit.createdAt.toISOString(),
    updatedAt: unit.updatedAt.toISOString(),
  };
}

export async function createUnit(input: CreateUnitActionInput): Promise<UnitActionResult> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: "No autorizado" };
    }

    const validationResult = createUnitSchema.safeParse({
      courseId: input.courseId,
      title: input.title,
      content: input.content,
      order: input.order ?? 0,
    });

    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.issues[0]?.message || "Datos de unidad inválidos",
      };
    }

    await connectDB();

    const currentUser = await User.findOne({ email: session.user.email }).lean();
    if (!currentUser) {
      return { success: false, error: "Usuario no encontrado" };
    }

    const { courseId, title, content, order } = validationResult.data as CreateUnitActionInput;

    const course = await Course.findById(courseId);

    if (!course) {
      return { success: false, error: "Curso no encontrado" };
    }

    const currentUserId = currentUser._id.toString();
    const isOwner = course.ownerId.toString() === currentUserId;
    const isTeacher = course.teachers.some((teacherId: mongoose.Types.ObjectId) => teacherId.toString() === currentUserId);

    if (!isOwner && !isTeacher) {
      return { success: false, error: "No tienes permiso para crear unidades en este curso" };
    }

    // El orden se calcula a partir de la cantidad actual de unidades del curso.
    const nextOrder = typeof order === "number" ? order : (course.unitIds?.length ?? (await Unit.countDocuments({ courseId })));
    const unit = await Unit.create({
      courseId: new mongoose.Types.ObjectId(courseId),
      title,
      content,
      order: nextOrder,
      resourceIds: [],
    });

    // Añadir referencia de unidad en el curso
    await Course.findByIdAndUpdate(courseId, { $push: { unitIds: unit._id } });

    // No legacy subject linkage remains; units are canonical

    return { success: true, unit: serializeUnit(unit) };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al crear la unidad";
    LOGGER.error({ error, input }, "Error creating unit from action");
    return { success: false, error: message };
  }
}

export async function updateUnit(
  unitId: string,
  input: { title?: string; content?: string; order?: number }
): Promise<UnitActionResult> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: "No autorizado" };
    }

    const validationResult = updateUnitSchema.safeParse(input);
    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.issues[0]?.message || "Datos de unidad inválidos",
      };
    }

    if (!mongoose.Types.ObjectId.isValid(unitId)) {
      return { success: false, error: "ID de unidad inválido" };
    }

    await connectDB();

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
      return { success: false, error: "No tienes permiso para actualizar esta unidad" };
    }

    const data = validationResult.data;
    if (data.title !== undefined) {
      unit.title = data.title;
    }
    if (data.content !== undefined) {
      unit.content = data.content;
    }
    if (data.order !== undefined) {
      unit.order = data.order;
    }

    unit.updatedAt = new Date();
    await unit.save();

    return { success: true, unit: serializeUnit(unit) };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al actualizar la unidad";
    LOGGER.error({ error, unitId }, "Error updating unit from action");
    return { success: false, error: message };
  }
}

export async function deleteUnit(unitId: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!mongoose.Types.ObjectId.isValid(unitId)) {
      return { success: false, error: "ID de unidad inválido" };
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
      return { success: false, error: "No tienes permiso para eliminar esta unidad" };
    }

    // Al borrar una unidad también borramos sus recursos y la quitamos de la materia
    // para que no queden referencias colgantes en la estructura del curso.
    await Promise.all([
      Resource.deleteMany({ unitId: unit._id }),
      Unit.findByIdAndDelete(unitId),
      Course.findByIdAndUpdate(unit.courseId, { $pull: { unitIds: unit._id } }),
    ]);

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al eliminar la unidad";
    LOGGER.error({ error, unitId }, "Error deleting unit from action");
    return { success: false, error: message };
  }
}

export async function reorderUnits(
  courseId: string,
  unitIds: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: "No autorizado" };
    }

    const validationResult = reorderUnitsSchema.safeParse({ courseId, unitIds });
    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.issues[0]?.message || "Orden de unidades inválido",
      };
    }

    await connectDB();

    const currentUser = await User.findOne({ email: session.user.email }).lean();
    if (!currentUser) {
      return { success: false, error: "Usuario no encontrado" };
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return { success: false, error: "Curso no encontrado" };
    }

    const currentUserId = currentUser._id.toString();
    const isOwner = course.ownerId.toString() === currentUserId;
    const isTeacher = course.teachers.some((teacherId: mongoose.Types.ObjectId) => teacherId.toString() === currentUserId);

    if (!isOwner && !isTeacher) {
      return { success: false, error: "No tienes permiso para reordenar las unidades" };
    }

    // Verificamos que todos los IDs pertenezcan al curso antes de persistir el nuevo orden.
    const units = await Unit.find({ _id: { $in: unitIds }, courseId }).select("_id").lean();
    if (units.length !== unitIds.length) {
      return { success: false, error: "Una o más unidades no pertenecen al curso" };
    }

    await Promise.all([
      Course.findByIdAndUpdate(courseId, { unitIds }),
      ...unitIds.map((unitId, index) => Unit.findByIdAndUpdate(unitId, { order: index })),
    ]);

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al reordenar las unidades";
    LOGGER.error({ error, courseId }, "Error reordering units from action");
    return { success: false, error: message };
  }
}