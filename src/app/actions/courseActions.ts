/* Archivo: src\app\actions\courseActions.ts
  Descripción: Acciones para administrar cursos (crear, actualizar, obtener listado y detalles). */

"use server";
// Server Action: lógica de alto nivel para cursos (crear, unirse, invitar)
// Aísla llamadas a base de datos y revalidaciones de rutas

// Server Actions: operaciones sobre cursos (CRUD, invitaciones, inscripciones)
import { connectDB } from "@/lib/database/database";
import { revalidatePath } from "next/cache";
import Course from "@/models/Course";
// Subject model deprecated; use Unit model instead
import Unit from "@/models/Unit";
import Resource from "@/models/Resource";
import Task from "@/models/Task";
import Submission from "@/models/Submission";
import User from "@/models/User";
import { deleteFromR2 } from "@/lib/r2";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/config/auth.config";
import { ICourse, IInviteCode } from "@/models/Course";
import {
  createSubjectSchema,
  createCourseSchema,
  updateCourseSchema,
  updateSubjectSchema,
  reorderSubjectsSchema,
} from "@/lib/validators/validators";
import { getCourseFullStructure } from "@/lib/api/course-helpers";
import { LOGGER } from "@/config/logger";
import { emailSchema } from "@/lib/validators/validators";
import mongoose from "mongoose";

// Interfaces serializadas para pasar a Client Components
export interface SerializedResource {
  _id: string;
  title: string;
  type: string;
  url?: string;
  description?: string;
  content?: string;
}

export interface SerializedUnit {
  _id: string;
  title: string;
  content?: string;
  order: number;
  resources?: SerializedResource[];
}

export interface SerializedSubject {
  _id: string;
  courseId?: string;
  title: string;
  description?: string;
  order: number;
  taskIds?: string[];
  units?: SerializedUnit[];
}

export interface SerializedCourse {
  _id: string;
  title: string;
  description?: string;
  coverImage?: string; // ID del patrón de portada (ver coursePatterns.ts)
  ownerId: string;
  teachers: string[];
  status: "draft" | "active" | "archived";
  unitIds?: string[];
  units?: SerializedUnit[];
  enrolledStudents: string[];
  createdAt: string;
  updatedAt: string;
  /** Nombre completo del profesor propietario del curso (resuelto en SSR) */
  ownerName?: string;
  /** URL del avatar del profesor: foto de Google si tiene OAuth vinculado, Robohash si no */
  ownerAvatar?: string;
}

export interface CreateSubjectActionInput {
  courseId: string;
  title: string;
  description?: string;
  order?: number;
}

export interface SubjectActionResult {
  success: boolean;
  error?: string;
  subject?: {
    _id: string;
    courseId: string;
    title: string;
    description?: string;
    order: number;
    unitIds: string[];
    taskIds: string[];
    createdAt: string;
    updatedAt: string;
  };
}

export interface CourseActionResult {
  success: boolean;
  error?: string;
  course?: {
    _id: string;
    title: string;
    description?: string;
    status: "draft" | "active" | "archived";
    updatedAt: string;
  };
}

export interface InviteStudentActionResult {
  success: boolean;
  error?: string;
}

export interface TransferOwnershipActionResult {
  success: boolean;
  error?: string;
}

export interface GenerateInviteCodeResult {
  success: boolean;
  error?: string;
  code?: string;
}

export interface DeactivateInviteCodeResult {
  success: boolean;
  error?: string;
}

export interface JoinCourseByCodeResult {
  success: boolean;
  error?: string;
  courseTitle?: string;
}

export interface ListInviteCodesResult {
  success: boolean;
  error?: string;
  codes?: Array<{
    code: string;
    createdAt: string;
    lastUsedAt?: string;
    active: boolean;
  }>;
}

// Funciones para serializar objetos anidados
function serializeResource(resource: any): SerializedResource {
  return {
    _id: resource._id?.toString() || "",
    title: resource.title,
    type: resource.type,
    url: resource.url,
    description: resource.description,
    content: resource.content,
  };
}

function serializeUnit(unit: any): SerializedUnit {
  return {
    _id: unit._id?.toString() || "",
    title: unit.title,
    content: unit.content,
    order: unit.order,
    resources: unit.resources?.map(serializeResource) || [],
  };
}

function serializeSubject(subject: any): SerializedSubject {
  return {
    _id: subject._id?.toString() || "",
    courseId: subject.courseId?.toString?.() || subject.courseId || undefined,
    title: subject.title,
    description: subject.description,
    order: subject.order,
    taskIds: subject.taskIds?.map((id: string) => id.toString() || id) || [],
    units: subject.units?.map(serializeUnit) || [],
  };
}

// Función para serializar ICourse a SerializedCourse
function serializeCourse(course: ICourse): SerializedCourse {
  return {
    _id: course._id?.toString() || "",
    title: course.title,
    description: course.description,
    coverImage: course.coverImage,
    ownerId: course.ownerId?.toString() || "",
    teachers: course.teachers?.map(t => t.toString()) || [],
    status: course.status,
    unitIds: course.unitIds?.map(u => u.toString()) || [],
    units: course.units?.map(serializeUnit) || [],
    enrolledStudents: course.enrolledStudents?.map(e => e.toString()) || [],
    createdAt: course.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: course.updatedAt?.toISOString() || new Date().toISOString(),
  };
}

export async function fetchCourses(): Promise<SerializedCourse[]> {
  try {
    await connectDB();

    // Sacamos la ID del usuario antes
    const userId = await getCurrentUser();
    if (!userId) {
      return [];
    }

    // En la query a mongo, buscamos los cursos donde el usuario es owner, teacher o enrolled student
    const dbCourses = await Course.find({
      $or: [
        { ownerId: userId },
        { teachers: { $in: [userId] } },
        { enrolledStudents: { $in: [userId] } },
      ],
    }).lean() as ICourse[];

    // Batch-fetch de propietarios en una sola query para evitar N+1
    const uniqueOwnerIds = [
      ...new Set(
        dbCourses
          .map((c) => c.ownerId?.toString())
          .filter((id): id is string => Boolean(id))
      ),
    ];

    const owners = await User.find({ _id: { $in: uniqueOwnerIds } })
      .select("firstName profile.lastName thirdparty")
      .lean();

    // Mapa id → datos del propietario para acceso O(1)
    const ownerMap = new Map(
      owners.map((o) => [o._id.toString(), o])
    );

    return dbCourses.map((course) => {
      const serialized = serializeCourse(course);
      const owner = ownerMap.get(course.ownerId?.toString() || "");
      if (owner) {
        // Nombre completo: firstName + lastName (si existe)
        const fullName = [owner.firstName, (owner.profile as { lastName?: string } | undefined)?.lastName]
          .filter(Boolean)
          .join(" ");
        serialized.ownerName = fullName || owner.firstName;

        // Avatar: foto de Google si el usuario tiene OAuth vinculado, Robohash si no
        const googleAccount = (owner.thirdparty as Array<{ provider: string; profilePicture?: string }> | undefined)
          ?.find((tp) => tp.provider === "google");
        serialized.ownerAvatar =
          googleAccount?.profilePicture ??
          `https://robohash.org/${owner._id.toString()}?set=set5`;
      }
      return serialized;
    });
  } catch (error) {
    LOGGER.error({ error }, "Error fetching courses");
    return [];
  }
}

export async function updateCourse(
  courseId: string,
  input: { title?: string; description?: string; status?: "draft" | "active" | "archived"; coverImage?: string }
): Promise<CourseActionResult> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: "No autorizado" };
    }

    const validationResult = updateCourseSchema.safeParse(input);
    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.issues[0]?.message || "Datos de curso inválidos",
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
      return { success: false, error: "No tienes permiso para actualizar este curso" };
    }

    const data = validationResult.data;

    if (data.title !== undefined) {
      course.title = data.title;
    }
    if (data.description !== undefined) {
      course.description = data.description;
    }
    if (data.status !== undefined) {
      course.status = data.status;

      // Si el curso se cambia a "draft" o "archived", desactivar todos los códigos de invitación
      if (data.status === "draft" || data.status === "archived") {
        course.invitationCodes = course.invitationCodes.map((code: IInviteCode) => ({
          ...code,
          active: false,
        }));
      }
    }
    if (data.coverImage !== undefined) {
      course.coverImage = data.coverImage;
    }

    course.updatedAt = new Date();
    await course.save();

    return {
      success: true,
      course: {
        _id: course._id.toString(),
        title: course.title,
        description: course.description,
        status: course.status,
        updatedAt: course.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al actualizar el curso";
    LOGGER.error({ error, courseId }, "Error updating course from action");
    return { success: false, error: message };
  }
}

export async function inviteStudentByEmail(
  courseId: string,
  email: string
): Promise<InviteStudentActionResult> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: "No autorizado" };
    }

    const parsedEmail = emailSchema.safeParse(email);
    if (!parsedEmail.success) {
      return { success: false, error: parsedEmail.error.issues[0]?.message || "Email inválido" };
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
      return { success: false, error: "No tienes permiso para invitar participantes" };
    }

    const student = await User.findOne({ email: parsedEmail.data });
    if (!student) {
      return { success: false, error: "No existe un usuario con ese email" };
    }

    if (course.enrolledStudents.some((studentId: mongoose.Types.ObjectId) => studentId.toString() === student._id.toString())) {
      return { success: true };
    }

    await Promise.all([
      Course.findByIdAndUpdate(courseId, { $addToSet: { enrolledStudents: student._id } }),
      User.findByIdAndUpdate(student._id, { $addToSet: { enrolledCourses: course._id } }),
    ]);

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al invitar al estudiante";
    LOGGER.error({ error, courseId, email }, "Error inviting student from action");
    return { success: false, error: message };
  }
}

export async function transferCourseOwnership(
  courseId: string,
  newOwnerEmail: string
): Promise<TransferOwnershipActionResult> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: "No autorizado" };
    }

    const parsedEmail = emailSchema.safeParse(newOwnerEmail);
    if (!parsedEmail.success) {
      return { success: false, error: parsedEmail.error.issues[0]?.message || "Email inválido" };
    }

    await connectDB();

    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) {
      return { success: false, error: "Usuario no encontrado" };
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return { success: false, error: "Curso no encontrado" };
    }

    if (course.ownerId.toString() !== currentUser._id.toString()) {
      return { success: false, error: "Solo el propietario puede transferir el curso" };
    }

    const newOwner = await User.findOne({ email: parsedEmail.data });
    if (!newOwner) {
      return { success: false, error: "No existe un usuario con ese email" };
    }

    const previousOwnerId = course.ownerId;
    course.ownerId = newOwner._id;

    if (!course.teachers.some((teacherId: mongoose.Types.ObjectId) => teacherId.toString() === previousOwnerId.toString())) {
      course.teachers.push(previousOwnerId);
    }

    course.updatedAt = new Date();
    await course.save();

    await Promise.all([
      User.findByIdAndUpdate(previousOwnerId, { $pull: { createdCourses: course._id } }),
      User.findByIdAndUpdate(newOwner._id, { $addToSet: { createdCourses: course._id } }),
    ]);

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al transferir el curso";
    LOGGER.error({ error, courseId, newOwnerEmail }, "Error transferring course ownership from action");
    return { success: false, error: message };
  }
}

export async function getCurrentUser(): Promise<string | null> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return null;
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email }).lean();
    return user?._id?.toString() || null;
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
}

/**
 * Valida si el usuario actual tiene acceso a un curso específico.
 * El usuario tiene acceso si es propietario, profesor o estudiante inscrito.
 */
export async function validateCourseAccess(courseId: string): Promise<boolean> {
  try {
    await connectDB();
    
    // Obtener ID del usuario actual (operación barata primero)
    const userId = await getCurrentUser();
    if (!userId) {
      return false;
    }

    // Buscar curso en BD
    const course = await Course.findById(courseId).lean() as ICourse | null;
    
    if (!course) {
      return false;
    }

    // Verificar si el usuario es propietario, profesor o estudiante inscrito
    const userIdStr = userId.toString ? userId.toString() : userId;
    const ownerIdStr = course.ownerId?.toString ? course.ownerId.toString() : course.ownerId;
    
    if (userIdStr === ownerIdStr) {
      return true;
    }

    if (course.teachers?.some((teacherId: any) => {
      const teacherIdStr = teacherId?.toString ? teacherId.toString() : teacherId;
      return teacherIdStr === userIdStr;
    })) {
      return true;
    }

    if (course.enrolledStudents?.some((studentId: any) => {
      const studentIdStr = studentId?.toString ? studentId.toString() : studentId;
      return studentIdStr === userIdStr;
    })) {
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error validando acceso al curso:", error);
    return false;
  }
}

export async function deleteCourse(courseId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: "No autorizado" };
    }

    await connectDB();

    // Verificar que el usuario es el propietario
    const course = await Course.findById(courseId);
    if (!course) {
      return { success: false, error: "Curso no encontrado" };
    }

    const currentUser = await User.findOne({ email: session.user.email });
    if (course.ownerId.toString() !== currentUser._id.toString()) {
      return { success: false, error: "No tienes permiso para eliminar este curso" };
    }

    // Obtener tareas e IDs para borrar submissions
    const tasks = await Task.find({ courseId }, { _id: 1 }).lean();
    const taskIds = tasks.map((t) => t._id);

    // Obtener recursos y submissions para borrar sus archivos de R2
    const [resources, submissions] = await Promise.all([
      Resource.find({ courseId }, { type: 1, url: 1 }).lean(),
      Submission.find({ taskId: { $in: taskIds } }, { files: 1 }).lean(),
    ]);

    // Recopilar URLs de R2 a eliminar
    const r2Urls: string[] = [];
    for (const r of resources) {
      if (r.type === "file" && r.url) r2Urls.push(r.url);
    }
    for (const s of submissions) {
      if (s.files?.length) r2Urls.push(...s.files);
    }

    // Borrar archivos de R2 (errores individuales no deben bloquear el resto)
    await Promise.allSettled(r2Urls.map((url) => deleteFromR2(url)));

    // Borrar todos los documentos relacionados y el curso
    await Promise.all([
      Submission.deleteMany({ taskId: { $in: taskIds } }),
      Task.deleteMany({ courseId }),
      Resource.deleteMany({ courseId }),
      Unit.deleteMany({ courseId }),
      Course.findByIdAndDelete(courseId),
      User.updateOne({ _id: course.ownerId }, { $pull: { createdCourses: course._id } }),
      User.updateMany(
        { _id: { $in: course.enrolledStudents } },
        { $pull: { enrolledCourses: course._id } }
      ),
    ]);

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting course:", error);
    return { success: false, error: error.message || "Error al eliminar el curso" };
  }
}

export async function unenrollCourse(courseId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: "No autorizado" };
    }

    await connectDB();

    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) {
      return { success: false, error: "Usuario no encontrado" };
    }

    // Eliminar el usuario de enrolledStudents del curso
    const result = await Course.findByIdAndUpdate(
      courseId,
      { $pull: { enrolledStudents: currentUser._id } },
      { new: true }
    );

    if (!result) {
      return { success: false, error: "Curso no encontrado" };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error unenrolling course:", error);
    return { success: false, error: error.message || "Error al cancelar el registro" };
  }
}

export async function createSubject(input: CreateSubjectActionInput): Promise<SubjectActionResult> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: "No autorizado" };
    }

    const validationResult = createSubjectSchema.safeParse(input);
    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.issues[0]?.message || "Datos de materia inválidos",
      };
    }

    await connectDB();

    const currentUser = await User.findOne({ email: session.user.email }).lean();
    if (!currentUser) {
      return { success: false, error: "Usuario no encontrado" };
    }

    const { courseId, title, description, order } = validationResult.data;
    const course = await Course.findById(courseId);

    if (!course) {
      return { success: false, error: "Curso no encontrado" };
    }

    const currentUserId = currentUser._id.toString();
    const isOwner = course.ownerId.toString() === currentUserId;
    const isTeacher = course.teachers.some((teacherId: mongoose.Types.ObjectId) => teacherId.toString() === currentUserId);

    if (!isOwner && !isTeacher) {
      return { success: false, error: "No tienes permiso para crear materias en este curso" };
    }

    const nextOrder = typeof order === "number" ? order : (course.unitIds?.length || 0);
    const unit = await Unit.create({
      courseId: new mongoose.Types.ObjectId(courseId),
      title,
      content: description || "",
      order: nextOrder,
      resourceIds: [],
      taskIds: [],
    });

    await Course.findByIdAndUpdate(courseId, { $addToSet: { unitIds: unit._id } });

    return {
      success: true,
      subject: {
        _id: unit._id.toString(),
        courseId: unit.courseId.toString(),
        title: unit.title,
        description: unit.content,
        order: unit.order,
        unitIds: [unit._id.toString()],
        taskIds: unit.taskIds?.map((id: mongoose.Types.ObjectId) => id.toString()) || [],
        createdAt: unit.createdAt.toISOString(),
        updatedAt: unit.updatedAt.toISOString(),
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Error al crear la materia" };
  }
}

export async function updateSubject(
  subjectId: string,
  input: { title?: string; description?: string; order?: number }
): Promise<SubjectActionResult> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: "No autorizado" };
    }

    const validationResult = updateSubjectSchema.safeParse(input);
    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.issues[0]?.message || "Datos de materia inválidos",
      };
    }

    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
      return { success: false, error: "ID de materia inválido" };
    }

    await connectDB();

    const currentUser = await User.findOne({ email: session.user.email }).lean();
    if (!currentUser) {
      return { success: false, error: "Usuario no encontrado" };
    }

    // Try to update a Unit (subjects deprecated)
    const unit = await Unit.findById(subjectId);
    if (!unit) {
      return { success: false, error: "Unidad/Materia no encontrada" };
    }

    const course = await Course.findById(unit.courseId);
    if (!course) {
      return { success: false, error: "Curso no encontrado" };
    }

    const currentUserId = currentUser._id.toString();
    const isOwner = course.ownerId.toString() === currentUserId;
    const isTeacher = course.teachers.some((teacherId: mongoose.Types.ObjectId) => teacherId.toString() === currentUserId);

    if (!isOwner && !isTeacher) {
      return { success: false, error: "No tienes permiso para actualizar esta materia" };
    }

    const data = validationResult.data;
    if (data.title !== undefined) {
      unit.title = data.title;
    }
    if (data.description !== undefined) {
      unit.content = data.description;
    }
    if (data.order !== undefined) {
      unit.order = data.order;
    }

    unit.updatedAt = new Date();
    await unit.save();

    return {
      success: true,
      subject: {
        _id: unit._id.toString(),
        courseId: unit.courseId.toString(),
        title: unit.title,
        description: unit.content,
        order: unit.order,
        unitIds: [unit._id.toString()],
        taskIds: unit.taskIds?.map((id: mongoose.Types.ObjectId) => id.toString()) || [],
        createdAt: unit.createdAt.toISOString(),
        updatedAt: unit.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al actualizar la materia";
    LOGGER.error({ error, subjectId }, "Error updating subject from action");
    return { success: false, error: message };
  }
}

export async function deleteSubject(subjectId: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
      return { success: false, error: "ID de materia inválido" };
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

    // Treat subjectId as unitId and delete the unit
    const unit = await Unit.findById(subjectId);
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
      return { success: false, error: "No tienes permiso para eliminar esta materia" };
    }

    const unitId = unit._id;

    // Recopilar IDs de tareas y URLs de archivos para limpiar R2
    const [unitTasks, unitResources] = await Promise.all([
      Task.find({ unitId }, { _id: 1 }).lean(),
      Resource.find({ unitId }, { type: 1, url: 1 }).lean(),
    ]);
    const unitTaskIds = unitTasks.map((t) => t._id);
    const unitSubmissions = await Submission.find({ taskId: { $in: unitTaskIds } }, { files: 1 }).lean();

    const r2Urls: string[] = [];
    for (const r of unitResources) {
      if (r.type === "file" && r.url) r2Urls.push(r.url);
    }
    for (const s of unitSubmissions) {
      if (s.files?.length) r2Urls.push(...s.files);
    }
    await Promise.allSettled(r2Urls.map((url) => deleteFromR2(url)));

    await Promise.all([
      Submission.deleteMany({ taskId: { $in: unitTaskIds } }),
      Task.deleteMany({ unitId }),
      Resource.deleteMany({ unitId }),
      Unit.findByIdAndDelete(unitId),
      Course.findByIdAndUpdate(course._id, { $pull: { unitIds: unitId } }),
    ]);

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al eliminar la materia";
    LOGGER.error({ error, subjectId }, "Error deleting subject from action");
    return { success: false, error: message };
  }
}

export async function reorderSubjects(
  courseId: string,
  subjectIds: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: "No autorizado" };
    }

    const validationResult = reorderSubjectsSchema.safeParse({ courseId, subjectIds });
    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.issues[0]?.message || "Orden de materias inválido",
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
      return { success: false, error: "No tienes permiso para reordenar las materias" };
    }

    // Validate unitIds belong to course
    const units = await Unit.find({ _id: { $in: subjectIds }, courseId }).select("_id").lean();
    if (units.length !== subjectIds.length) {
      return { success: false, error: "Una o más unidades no pertenecen al curso" };
    }

    await Promise.all([
      Course.findByIdAndUpdate(courseId, { unitIds: subjectIds }),
      ...subjectIds.map((unitId, index) => Unit.findByIdAndUpdate(unitId, { order: index })),
    ]);

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al reordenar las materias";
    LOGGER.error({ error, courseId }, "Error reordering subjects from action");
    return { success: false, error: message };
  }
}

// Función helper para generar código alfanumérico único de 6 caracteres
function generateRandomCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Generar código de invitación para un curso
export async function generateInviteCode(
  courseId: string
): Promise<GenerateInviteCodeResult> {
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

    const course = await Course.findById(courseId);
    if (!course) {
      return { success: false, error: "Curso no encontrado" };
    }

    const currentUserId = currentUser._id.toString();
    const isOwner = course.ownerId.toString() === currentUserId;
    const isTeacher = course.teachers.some((teacherId: mongoose.Types.ObjectId) => teacherId.toString() === currentUserId);

    if (!isOwner && !isTeacher) {
      return { success: false, error: "No tienes permiso para generar códigos de invitación" };
    }

    // Generar código único que no exista ya en el curso
    let code: string;
    let attempts = 0;
    const maxAttempts = 100;
    
    do {
      code = generateRandomCode();
      attempts++;
    } while (
      course.invitationCodes.some((ic: IInviteCode) => ic.code === code) &&
      attempts < maxAttempts
    );

    if (attempts >= maxAttempts) {
      return { success: false, error: "No se pudo generar un código único" };
    }

    // FIFO rotation: si ya hay 10 códigos, elimina el más antiguo
    if (course.invitationCodes.length >= 10) {
      course.invitationCodes.shift(); // Elimina el primer elemento (más antiguo)
    }

    // Agregar nuevo código
    course.invitationCodes.push({
      code,
      createdAt: new Date(),
      active: true,
    });

    await course.save();

    LOGGER.info({ courseId, code }, "Invitation code generated");
    return { success: true, code };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al generar código de invitación";
    LOGGER.error({ error, courseId }, "Error generating invite code");
    return { success: false, error: message };
  }
}

// Desactivar código de invitación
export async function deactivateInviteCode(
  courseId: string,
  code: string
): Promise<DeactivateInviteCodeResult> {
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

    const course = await Course.findById(courseId);
    if (!course) {
      return { success: false, error: "Curso no encontrado" };
    }

    const currentUserId = currentUser._id.toString();
    const isOwner = course.ownerId.toString() === currentUserId;
    const isTeacher = course.teachers.some((teacherId: mongoose.Types.ObjectId) => teacherId.toString() === currentUserId);

    if (!isOwner && !isTeacher) {
      return { success: false, error: "No tienes permiso para desactivar códigos de invitación" };
    }

    const inviteCodeIndex = course.invitationCodes.findIndex((ic: IInviteCode) => ic.code === code);
    if (inviteCodeIndex === -1) {
      return { success: false, error: "Código de invitación no encontrado" };
    }

    course.invitationCodes[inviteCodeIndex].active = false;
    await course.save();

    LOGGER.info({ courseId, code }, "Invitation code deactivated");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al desactivar código de invitación";
    LOGGER.error({ error, courseId, code }, "Error deactivating invite code");
    return { success: false, error: message };
  }
}

// Unirse a un curso usando código de invitación
export async function joinCourseByCode(
  code: string
): Promise<JoinCourseByCodeResult> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: "No autorizado" };
    }

    await connectDB();

    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) {
      return { success: false, error: "Usuario no encontrado" };
    }

    // Buscar curso con ese código de invitación
    const course = await Course.findOne({
      "invitationCodes.code": code,
    });

    if (!course) {
      return { success: false, error: "Código de invitación no válido o inactivo" };
    }

    // Verificar que el código esté activo
    const inviteCodeIndex = course.invitationCodes.findIndex((ic: IInviteCode) => ic.code === code);
    if (inviteCodeIndex === -1 || !course.invitationCodes[inviteCodeIndex].active) {
      return { success: false, error: "Código de invitación no válido o inactivo" };
    }

    // Verificar que el curso esté en estado "active"
    if (course.status !== "active") {
      return { success: false, error: "La clase no está disponible. El profesor ha pausado o archivado el curso." };
    }

    // Verificar si el usuario ya está inscrito
    if (course.enrolledStudents.some((studentId: mongoose.Types.ObjectId) => studentId.toString() === currentUser._id.toString())) {
      return { success: true, courseTitle: course.title }; // Ya está inscrito, no es un error
    }

    // Actualizar lastUsedAt del código
    course.invitationCodes[inviteCodeIndex].lastUsedAt = new Date();

    // Actualizar bidireccional: Course + User
    await Promise.all([
      Course.findByIdAndUpdate(
        course._id,
        {
          $addToSet: { enrolledStudents: currentUser._id },
          "invitationCodes": course.invitationCodes, // Guardar los códigos actualizados
        }
      ),
      User.findByIdAndUpdate(
        currentUser._id,
        { $addToSet: { enrolledCourses: course._id } }
      ),
    ]);

    LOGGER.info({ courseId: course._id, userId: currentUser._id, code }, "User joined course with invitation code");
    
    // Revalidar la ruta /mycourses para que se actualice el caché
    revalidatePath("/mycourses");
    
    return { success: true, courseTitle: course.title };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al unirse al curso";
    LOGGER.error({ error, code }, "Error joining course by code");
    return { success: false, error: message };
  }
}

export interface CreateCourseResult {
  success: boolean;
  data?: {
    id: string;
    title: string;
    description?: string;
    status: string;
    ownerId: string;
  };
  error?: string;
}

export async function createCourse(input: {
  title: string;
  description?: string;
  coverImage?: string;
}): Promise<CreateCourseResult> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: "No autorizado" };
    }

    const validationResult = createCourseSchema.safeParse(input);
    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.issues[0]?.message || "Datos de curso inválidos",
      };
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email }).lean();
    if (!user) {
      return { success: false, error: "Usuario no encontrado" };
    }

    if ((user as any).role !== "teacher") {
      return { success: false, error: "Solo los profesores pueden crear cursos" };
    }

    const { title, description, status, coverImage } = validationResult.data;

    const newCourse = new Course({
      title,
      description,
      status,
      coverImage: coverImage ?? "circles-blue",
      ownerId: (user as any)._id,
      teachers: [],
      subjectIds: [],
      enrolledStudents: [],
    });

    await newCourse.save();

    LOGGER.info({ courseId: newCourse._id.toString(), title }, "Curso creado desde action");

    revalidatePath("/mycourses");

    return {
      success: true,
      data: {
        id: newCourse._id.toString(),
        title: newCourse.title,
        description: newCourse.description,
        status: newCourse.status,
        ownerId: newCourse.ownerId.toString(),
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al crear el curso";
    LOGGER.error({ error }, "Error creating course from action");
    return { success: false, error: message };
  }
}

export interface CourseStructureUnit {
  _id: string;
  title: string;
  resources?: Array<{ _id: string; title: string }>;
  tasks?: Array<{ _id: string; title: string; type?: string }>;
}

export interface GetCourseStructureResult {
  success: boolean;
  structure?: { units?: CourseStructureUnit[] } | null;
  error?: string;
}

export async function getCourseStructure(courseId: string): Promise<GetCourseStructureResult> {
  try {
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return { success: false, error: "ID de curso inválido" };
    }

    await connectDB();

    const raw = await getCourseFullStructure(courseId);
    if (!raw) {
      return { success: true, structure: null };
    }

    const structure = {
      units: ((raw as any).units || []).map((unit: any) => ({
        _id: unit._id?.toString() || "",
        title: unit.title || "",
        resources: (unit.resources || []).map((r: any) => ({
          _id: r._id?.toString() || "",
          title: r.title || "",
        })),
        tasks: (unit.tasks || []).map((t: any) => ({
          _id: t._id?.toString() || "",
          title: t.title || "",
          type: t.type,
        })),
      })),
    };

    return { success: true, structure };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al obtener la estructura del curso";
    LOGGER.error({ error, courseId }, "Error en getCourseStructure action");
    return { success: false, error: message };
  }
}

// Listar códigos de invitación de un curso
export async function listInviteCodes(
  courseId: string
): Promise<ListInviteCodesResult> {
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

    const course = await Course.findById(courseId).lean();
    if (!course) {
      return { success: false, error: "Curso no encontrado" };
    }

    const currentUserId = currentUser._id.toString();
    const isOwner = course.ownerId.toString() === currentUserId;
    const isTeacher = course.teachers.some((teacherId: any) => teacherId.toString() === currentUserId);

    if (!isOwner && !isTeacher) {
      return { success: false, error: "No tienes permiso para ver los códigos de invitación" };
    }

    const codes = course.invitationCodes.map((ic: IInviteCode) => ({
      code: ic.code,
      createdAt: ic.createdAt.toISOString(),
      lastUsedAt: ic.lastUsedAt?.toISOString(),
      active: ic.active,
    }));

    return { success: true, codes };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al listar códigos de invitación";
    LOGGER.error({ error, courseId }, "Error listing invite codes");
    return { success: false, error: message };
  }
}

/**
 * Obtiene los cursos disponibles para el usuario actual
 * (cursos donde el usuario es owner, teacher o enrolled student Y que están activos)
 */
export async function getAvailableCoursesForNavbar(): Promise<{
  success: boolean;
  data?: Array<{ _id: string; name: string; slug: string }>;
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: "No autorizado" };
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email }).lean();
    if (!user) {
      return { success: false, error: "Usuario no encontrado" };
    }

    const userId = user._id.toString();

    // Buscar cursos donde el usuario tiene acceso Y el curso está activo
    const courses = await Course.find({
      status: "active", // Solo cursos activos
      $or: [
        { ownerId: userId },
        { teachers: { $in: [userId] } },
        { enrolledStudents: { $in: [userId] } },
      ],
    })
      .select("title slug") // Solo seleccionamos título y slug
      .sort({ title: 1 }) // Orden alfabético
      .lean();

    LOGGER.info(`📚 Cursos disponibles para navbar: ${courses.length}`);

    return {
      success: true,
      data: courses.map(course => ({
        _id: course._id.toString(),
        name: course.title,
        slug: course.slug,
      })),
    };
  } catch (error) {
    LOGGER.error("❌ Error al obtener cursos para navbar:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}