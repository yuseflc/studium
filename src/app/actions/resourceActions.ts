"use server";

import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import { authOptions } from "@/config/auth.config";
import { LOGGER } from "@/config/logger";
import { connectDB } from "@/lib/database/database";
import Course from "@/models/Course";
import Subject from "@/models/Subject";
import Unit from "@/models/Unit";
import Resource from "@/models/Resource";
import User from "@/models/User";
import { createResourceSchema } from "@/lib/validators/validators";

export interface CreateResourceActionInput {
  courseId: string;
  subjectId: string;
  title: string;
  description?: string;
  fileName?: string;
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
  };
}

function serializeResource(resource: any): NonNullable<ResourceActionResult["resource"]> {
  return {
    _id: resource._id.toString(),
    unitId: resource.unitId.toString(),
    courseId: resource.courseId.toString(),
    title: resource.title,
    type: resource.type,
    url: resource.url,
    description: resource.description,
    createdAt: resource.createdAt.toISOString(),
  };
}

export async function createResource(input: CreateResourceActionInput): Promise<ResourceActionResult> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: "No autorizado" };
    }

    const validationResult = createResourceSchema.safeParse({
      unitId: "000000000000000000000000",
      courseId: input.courseId,
      title: input.title,
      type: "file",
      description: input.description ? `${input.description}${input.fileName ? ` - ${input.fileName}` : ""}` : input.fileName,
    });

    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.issues[0]?.message || "Datos de recurso inválidos",
      };
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

    const unit = await Unit.findOne({ _id: { $in: Array.isArray(subject.unitIds) ? subject.unitIds : [] } }).sort({ order: 1 });
    if (!unit) {
      return { success: false, error: "El tema no tiene unidades disponibles" };
    }

    const resource = await Resource.create({
      unitId: unit._id,
      courseId: new mongoose.Types.ObjectId(input.courseId),
      title: validationResult.data.title,
      type: validationResult.data.type,
      description: validationResult.data.description,
    });

    await Unit.findByIdAndUpdate(unit._id, { $push: { resourceIds: resource._id } });

    LOGGER.info(
      {
        resourceId: resource._id.toString(),
        courseId: input.courseId,
        subjectId: input.subjectId,
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