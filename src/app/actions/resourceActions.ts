/* Archivo: src\app\actions\resourceActions.ts
  Descripción: Acciones para subir, listar y eliminar recursos asociados a cursos. */

"use server";
// Server Action: operaciones sobre recursos (archivos/enlaces) del curso
// Maneja subida, asociación y permisos

// Server Actions: gestión de recursos del curso (subir, editar, eliminar)
import mongoose from "mongoose";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/config/auth.config";
import { LOGGER } from "@/config/logger";
import { connectDB } from "@/lib/database/database";
import { deleteFromR2, uploadToR2 } from "@/lib/r2";
import Course from "@/models/Course";
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
  unitId?: string;
  title: string;
  description?: string;
  content?: string;
  fileName?: string;
  type?: "link" | "file" | "text";
  url?: string;
}

export interface UpdateResourceActionInput {
  title?: string;
  type?: "link" | "file" | "text";
  url?: string;
  description?: string;
  content?: string;
  previousUrl?: string;
}

export interface ResourceActionResult {
  success: boolean;
  error?: string;
  resource?: {
    _id: string;
    unitId: string;
    courseId: string;
    createdBy?: string;
    title: string;
    type: "link" | "file" | "text";
    url?: string;
    description?: string;
    content?: string;
    createdAt: string;
    updatedAt?: string;
  };
}

function serializeResource(resource: {
  _id: mongoose.Types.ObjectId;
  unitId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  createdBy?: mongoose.Types.ObjectId;
  title: string;
  type: "link" | "file" | "text";
  url?: string;
  description?: string;
  content?: string;
  createdAt: Date;
  updatedAt: Date;
}): NonNullable<ResourceActionResult["resource"]> {
  return {
    _id: resource._id.toString(),
    unitId: resource.unitId.toString(),
    courseId: resource.courseId.toString(),
    createdBy: resource.createdBy?.toString(),
    title: resource.title,
    type: resource.type,
    url: resource.url,
    description: resource.description,
    content: resource.content,
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

    const course = await Course.findById(input.courseId);

    if (!course) {
      return { success: false, error: "Curso no encontrado" };
    }

    // Resolver la unidad: se da preferencia al unitId explícito si fue proporcionado
    let unit: { _id: mongoose.Types.ObjectId; courseId: mongoose.Types.ObjectId } | null = null;
    if (input.unitId) {
      unit = await Unit.findById(input.unitId);
      if (!unit) {
        return { success: false, error: "La unidad no existe" };
      }
      if (unit.courseId.toString() !== course._id.toString()) {
        return { success: false, error: "La unidad no pertenece al curso" };
      }
    } else {
      return { success: false, error: "Se requiere unitId" };
    }

    const currentUserId = currentUser._id.toString();
    const isOwner = course.ownerId.toString() === currentUserId;
    const isTeacher = course.teachers.some((teacherId: mongoose.Types.ObjectId) => teacherId.toString() === currentUserId);

    if (!isOwner && !isTeacher) {
      return { success: false, error: "No tienes permiso para crear recursos en este curso" };
    }


    const resourceType = input.type ?? (input.url ? "link" : "file");
    const validationResult = createResourceSchema.safeParse({
      unitId: unit._id.toString(),
      courseId: input.courseId,
      title: input.title,
      type: resourceType,
      url: input.url,
      description: normalizeDescription(input),
      content: input.content,
    });

    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.issues[0]?.message || "Datos de recurso inválidos",
      };
    }

    if (validationResult.data.type === "text" && !validationResult.data.content) {
      return {
        success: false,
        error: "Introduce el contenido del recurso",
      };
    }

    const resource = await Resource.create({
      unitId: unit._id,
      courseId: new mongoose.Types.ObjectId(input.courseId),
      createdBy: currentUser._id,
      title: validationResult.data.title,
      type: validationResult.data.type,
      url: validationResult.data.url,
      description: validationResult.data.description,
      content: validationResult.data.content,
    });

    await Unit.findByIdAndUpdate(unit._id, { $push: { resourceIds: resource._id } });

    LOGGER.info(
      {
        resourceId: resource._id.toString(),
        courseId: input.courseId,
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

    if (validationResult.data.type === "text" && !validationResult.data.content) {
      return {
        success: false,
        error: "Introduce el contenido del recurso",
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

    const previousUrl = input.previousUrl?.trim() || resource.url?.trim() || undefined;

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
    if (data.type === "text" && data.url === undefined) {
      resource.url = undefined;
    } else if (data.url !== undefined) {
      resource.url = data.url;
    }
    if (data.description !== undefined) {
      resource.description = data.description;
    }
    if (data.content !== undefined) {
      resource.content = data.content;
    }

    resource.updatedAt = new Date();
    await resource.save();

    if (previousUrl && previousUrl !== resource.url) {
      try {
        await deleteFromR2(previousUrl);
      } catch (attachmentError) {
        LOGGER.error(
          { resourceId, previousUrl, error: attachmentError },
          "Error deleting replaced resource attachment from R2"
        );
      }
    }

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

    if (resource.type === "file" && resource.url) {
      try {
        await deleteFromR2(resource.url);
      } catch (r2Error) {
        LOGGER.error({ resourceId, url: resource.url, error: r2Error }, "Error deleting resource file from R2");
      }
    }

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al eliminar el recurso";
    LOGGER.error({ error, resourceId }, "Error deleting resource from action");
    return { success: false, error: message };
  }
}

const UPLOAD_ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/csv",
  "application/rtf",
  "application/vnd.oasis.opendocument.text",
  "application/vnd.oasis.opendocument.spreadsheet",
  "application/vnd.oasis.opendocument.presentation",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "image/bmp",
  "image/tiff",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
  "audio/webm",
  "application/zip",
  "application/x-zip-compressed",
  "application/x-rar-compressed",
  "application/x-7z-compressed",
  "application/octet-stream",
]);

const UPLOAD_ALLOWED_EXTENSIONS = new Set([
  ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
  ".txt", ".csv", ".rtf", ".odt", ".ods", ".odp",
  ".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".bmp", ".tif", ".tiff",
  ".mp4", ".webm", ".mov",
  ".mp3", ".wav", ".ogg",
  ".zip", ".rar", ".7z",
]);

const MAX_UPLOAD_SIZE = 50 * 1024 * 1024;

function getUploadFileExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf(".");
  return lastDot < 0 ? "" : fileName.slice(lastDot).toLowerCase();
}

function isUploadFileTypeAllowed(file: File): boolean {
  const extension = getUploadFileExtension(file.name);
  const mime = (file.type || "").toLowerCase();
  if (mime && UPLOAD_ALLOWED_MIME_TYPES.has(mime)) return true;
  if (!mime || mime === "application/octet-stream") return UPLOAD_ALLOWED_EXTENSIONS.has(extension);
  return UPLOAD_ALLOWED_EXTENSIONS.has(extension);
}

export interface UploadFileResult {
  success: boolean;
  url?: string;
  fileName?: string;
  error?: string;
}

export async function uploadFile(formData: FormData): Promise<UploadFileResult> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: "No autorizado" };
    }

    const file = formData.get("file") as File | null;
    const courseId = formData.get("courseId") as string | null;
    const unitId = formData.get("unitId") as string | null;

    if (!file) return { success: false, error: "El archivo es requerido" };
    if (file.size === 0) return { success: false, error: "El archivo está vacío" };
    if (file.size > MAX_UPLOAD_SIZE) {
      return { success: false, error: `El archivo excede el límite de ${MAX_UPLOAD_SIZE / (1024 * 1024)}MB` };
    }
    if (!isUploadFileTypeAllowed(file)) {
      return { success: false, error: `Tipo de archivo no permitido: ${file.type || "sin MIME"} (${file.name})` };
    }
    if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
      return { success: false, error: "ID de curso inválido" };
    }
    if (!unitId || !mongoose.Types.ObjectId.isValid(unitId)) {
      return { success: false, error: "ID de unidad inválido" };
    }

    await connectDB();

    const course = await Course.findById(courseId);
    if (!course) return { success: false, error: "Curso no encontrado" };

    const unit = await Unit.findById(unitId);
    if (!unit) return { success: false, error: "Unidad no encontrada" };
    if (unit.courseId.toString() !== courseId) {
      return { success: false, error: "La unidad no pertenece al curso especificado" };
    }

    const currentUser = await User.findOne({ email: session.user.email }).lean();
    if (!currentUser) return { success: false, error: "Usuario no encontrado" };

    const userId = (currentUser as any)._id.toString();
    const isOwner = course.ownerId.toString() === userId;
    const isTeacher = course.teachers.some(
      (teacherId: mongoose.Types.ObjectId) => teacherId.toString() === userId
    );

    if (!isOwner && !isTeacher) {
      return { success: false, error: "No tienes permiso para subir archivos a este curso" };
    }

    const buffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_").substring(0, 100);
    const fileName = `resources/${courseId}/${unitId}/${timestamp}-${sanitizedFileName}`;

    const publicUrl = await uploadToR2(uint8Array, fileName, file.type || "application/octet-stream");

    LOGGER.info({ fileName, fileSize: file.size, courseId, unitId }, "Archivo subido a R2 exitosamente");

    return { success: true, url: publicUrl, fileName: file.name };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al subir el archivo";
    LOGGER.error({ error }, "Error en uploadFile action");
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
