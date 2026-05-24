"use server";

import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth.config";
import { LOGGER } from "@/config/logger";
import { connectDB } from "@/lib/database/database";
import Course from "@/models/Course";
import Subject from "@/models/Subject";
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
  subjectId: string;
  title: string;
  content: string;
  order?: number;
}

export interface UnitActionResult {
  success: boolean;
  error?: string;
  unit?: {
    _id: string;
    subjectId: string;
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
  subjectId: mongoose.Types.ObjectId;
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
    subjectId: unit.subjectId.toString(),
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
      subjectId: input.subjectId,
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

    const { subjectId, courseId, title, content, order } = validationResult.data;

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
      return { success: false, error: "No tienes permiso para crear unidades en este curso" };
    }

    // El orden se calcula a partir de la cantidad actual de unidades del tema.
    const nextOrder = typeof order === "number" ? order : (subject.unitIds?.length || 0);
    const unit = await Unit.create({
      subjectId: new mongoose.Types.ObjectId(subjectId),
      courseId: new mongoose.Types.ObjectId(courseId),
      title,
      content,
      order: nextOrder,
      resourceIds: [],
    });

    await Subject.findByIdAndUpdate(subjectId, { $push: { unitIds: unit._id } });

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
      Subject.findByIdAndUpdate(unit.subjectId, { $pull: { unitIds: unit._id } }),
    ]);

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al eliminar la unidad";
    LOGGER.error({ error, unitId }, "Error deleting unit from action");
    return { success: false, error: message };
  }
}

export async function reorderUnits(
  subjectId: string,
  unitIds: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: "No autorizado" };
    }

    const validationResult = reorderUnitsSchema.safeParse({ subjectId, unitIds });
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
      return { success: false, error: "No tienes permiso para reordenar las unidades" };
    }

    // Verificamos que todos los IDs pertenezcan a la misma materia antes de persistir
    // el nuevo orden para evitar incoherencias entre Subject y Unit.
    const units = await Unit.find({ _id: { $in: unitIds }, subjectId }).select("_id").lean();
    if (units.length !== unitIds.length) {
      return { success: false, error: "Una o más unidades no pertenecen a la materia" };
    }

    await Promise.all([
      Subject.findByIdAndUpdate(subjectId, { unitIds }),
      ...unitIds.map((unitId, index) => Unit.findByIdAndUpdate(unitId, { order: index })),
    ]);

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al reordenar las unidades";
    LOGGER.error({ error, subjectId }, "Error reordering units from action");
    return { success: false, error: message };
  }
}