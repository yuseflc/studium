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
  createResourceSchema,
  updateResourceSchema,
  reorderResourcesSchema,
} from "@/lib/validators/validators";

export interface CreateResourceActionInput {
  courseId: string;
  subjectId: string;
  unitId?: string;
  title: string;
  description?: string;
  fileName?: string;
  type?: "link" | "file" | "text";
  url?: string;
}

export interface UpdateResourceActionInput {
  title?: string;
  type?: "link" | "file" | "text";
  url?: string;
  description?: string;
}

export interface ResourceActionResult {
  success: boolean;
  error?: string;
  resource?: {
    _id: string;
    unitId: string;
    courseId: string;
    title: string;
    type: "link" | "file" | "text";
    url?: string;
    description?: string;
    createdAt: string;
    updatedAt?: string;
  };
}

function serializeResource(resource: {
  _id: mongoose.Types.ObjectId;
  unitId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  title: string;
  type: "link" | "file" | "text";
  url?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}): NonNullable<ResourceActionResult["resource"]> {
  return {
    _id: resource._id.toString(),
    unitId: resource.unitId.toString(),
    courseId: resource.courseId.toString(),
    title: resource.title,
    type: resource.type,
    url: resource.url,
    description: resource.description,
    createdAt: resource.createdAt.toISOString(),
    updatedAt: resource.updatedAt?.toISOString(),
  };
}

function normalizeDescription(input: CreateResourceActionInput): string | undefined {
  if (input.description) {
    return input.fileName ? `${input.description} - ${input.fileName}` : input.description;
  }

  if (input.fileName) {
    return `Archivo: ${input.fileName}`;
  }

  return undefined;
}

export async function createResource(input: CreateResourceActionInput): Promise<ResourceActionResult> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: "No autorizado" };
    }

    await connectDB();

    const currentUser = await User.findOne({ email: session.user.email }).lean();
    if (!currentUser) {
      return { success: false, error: "Usuario no encontrado" };
    }

    const [course, subject] = await Promise.all([
      Course.findById(input.courseId),
      Subject.findById(input.subjectId),
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
      return { success: false, error: "No tienes permiso para crear recursos en este curso" };
    }

    const candidateUnitId = input.unitId ?? subject.unitIds?.[0]?.toString();
    if (!candidateUnitId) {
      return { success: false, error: "La materia no tiene unidades disponibles" };
    }

    const unit = await Unit.findOne({ _id: candidateUnitId, subjectId: subject._id });
    if (!unit) {
      return { success: false, error: "La unidad no existe o no pertenece a la materia" };
    }

    const resourceType = input.type ?? (input.url ? "link" : "file");
    const validationResult = createResourceSchema.safeParse({
      unitId: unit._id.toString(),
      courseId: input.courseId,
      title: input.title,
      type: resourceType,
      url: input.url,
      description: normalizeDescription(input),
    });

    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.issues[0]?.message || "Datos de recurso inválidos",
      };
    }

    const resource = await Resource.create({
      unitId: unit._id,
      courseId: new mongoose.Types.ObjectId(input.courseId),
      title: validationResult.data.title,
      type: validationResult.data.type,
      url: validationResult.data.url,
      description: validationResult.data.description,
    });

    await Unit.findByIdAndUpdate(unit._id, { $push: { resourceIds: resource._id } });

    LOGGER.info(
      {
        resourceId: resource._id.toString(),
        courseId: input.courseId,
        subjectId: input.subjectId,
        unitId: unit._id.toString(),
        createdBy: currentUserId,
      },
      "Resource creado"
    );

    return { success: true, resource: serializeResource(resource) };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al crear el recurso";
    LOGGER.error({ error }, "Error creating resource from action");
    return { success: false, error: message };
  }
}

export async function updateResource(
  resourceId: string,
  input: UpdateResourceActionInput
): Promise<ResourceActionResult> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: "No autorizado" };
    }

    const validationResult = updateResourceSchema.safeParse(input);
    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.issues[0]?.message || "Datos de recurso inválidos",
      };
    }

    if (!mongoose.Types.ObjectId.isValid(resourceId)) {
      return { success: false, error: "ID de recurso inválido" };
    }

    await connectDB();

    const currentUser = await User.findOne({ email: session.user.email }).lean();
    if (!currentUser) {
      return { success: false, error: "Usuario no encontrado" };
    }

    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return { success: false, error: "Recurso no encontrado" };
    }

    const course = await Course.findById(resource.courseId);
    if (!course) {
      return { success: false, error: "Curso no encontrado" };
    }

    const currentUserId = currentUser._id.toString();
    const isOwner = course.ownerId.toString() === currentUserId;
    const isTeacher = course.teachers.some((teacherId: mongoose.Types.ObjectId) => teacherId.toString() === currentUserId);

    if (!isOwner && !isTeacher) {
      return { success: false, error: "No tienes permiso para actualizar este recurso" };
    }

    const data = validationResult.data;
    if (data.title !== undefined) {
      resource.title = data.title;
    }
    if (data.type !== undefined) {
      resource.type = data.type;
    }
    if (data.url !== undefined) {
      resource.url = data.url;
    }
    if (data.description !== undefined) {
      resource.description = data.description;
    }

    resource.updatedAt = new Date();
    await resource.save();

    return { success: true, resource: serializeResource(resource) };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al actualizar el recurso";
    LOGGER.error({ error, resourceId }, "Error updating resource from action");
    return { success: false, error: message };
  }
}

export async function deleteResource(resourceId: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!mongoose.Types.ObjectId.isValid(resourceId)) {
      return { success: false, error: "ID de recurso inválido" };
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

    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return { success: false, error: "Recurso no encontrado" };
    }

    const course = await Course.findById(resource.courseId);
    if (!course) {
      return { success: false, error: "Curso no encontrado" };
    }

    const currentUserId = currentUser._id.toString();
    const isOwner = course.ownerId.toString() === currentUserId;
    const isTeacher = course.teachers.some((teacherId: mongoose.Types.ObjectId) => teacherId.toString() === currentUserId);

    if (!isOwner && !isTeacher) {
      return { success: false, error: "No tienes permiso para eliminar este recurso" };
    }

    await Promise.all([
      Resource.findByIdAndDelete(resourceId),
      Unit.findByIdAndUpdate(resource.unitId, { $pull: { resourceIds: resource._id } }),
    ]);

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al eliminar el recurso";
    LOGGER.error({ error, resourceId }, "Error deleting resource from action");
    return { success: false, error: message };
  }
}

export async function reorderResources(
  unitId: string,
  resourceIds: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: "No autorizado" };
    }

    const validationResult = reorderResourcesSchema.safeParse({ unitId, resourceIds });
    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.issues[0]?.message || "Orden de recursos inválido",
      };
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
      return { success: false, error: "No tienes permiso para reordenar los recursos" };
    }

    const resources = await Resource.find({ _id: { $in: resourceIds }, unitId }).select("_id").lean();
    if (resources.length !== resourceIds.length) {
      return { success: false, error: "Uno o más recursos no pertenecen a la unidad" };
    }

    await Unit.findByIdAndUpdate(unitId, { resourceIds });

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al reordenar los recursos";
    LOGGER.error({ error, unitId }, "Error reordering resources from action");
    return { success: false, error: message };
  }
}
