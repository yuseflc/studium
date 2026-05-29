"use server";

import { connectDB } from "@/lib/database/database";
import { revalidatePath } from "next/cache";
import Course from "@/models/Course";
// Subject model deprecated; use Unit model instead
import Unit from "@/models/Unit";
import Resource from "@/models/Resource";
import Task from "@/models/Task";
import User from "@/models/User";
import { CURSOS } from "@/seed/data";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/config/auth.config";
import { ICourse, IInviteCode } from "@/models/Course";
import {
  createSubjectSchema,
  updateCourseSchema,
  updateSubjectSchema,
  reorderSubjectsSchema,
} from "@/lib/validators/validators";
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
  ownerId: string;
  teachers: string[];
  status: "draft" | "active" | "archived";
  unitIds?: string[];
  units?: SerializedUnit[];
  enrolledStudents: string[];
  createdAt: string;
  updatedAt: string;
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
    
    // Sacamos la ID del usuario antes, 
    const userId = await getCurrentUser();
    if (!userId) {
      return CURSOS.map(serializeCourse);
    }

    // En la query a mongo, buscamos los cursos donde el usuario es owner, teacher o enrolled student
    const dbCourses = await Course.find({
      $or: [
        { ownerId: userId },
        { teachers: { $in: [userId] } },
        { enrolledStudents: { $in: [userId] } },
      ],
    }).lean() as ICourse[];

    // Combinamos los cursos de la base de datos con los cursos del seed, evitando duplicados por ID
    const allCourses = [...dbCourses, ...CURSOS];
    const courseMap = new Map<string, ICourse>();
    
    allCourses.forEach((course) => {
      const courseId = course._id?.toString() || "";
      if (courseId && !courseMap.has(courseId)) {
        courseMap.set(courseId, course);
      }
    });

    return Array.from(courseMap.values()).map(serializeCourse);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return [];
  }
}

export async function updateCourse(
  courseId: string,
  input: { title?: string; description?: string; status?: "draft" | "active" | "archived" }
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

    // Buscar curso en BD o datos de seed
    let course = await Course.findById(courseId).lean() as ICourse | null;
    
    if (!course) {
      // Fallback a datos de seed
      course = CURSOS.find(c => String(c._id) === courseId) || null;
      if (!course) {
        return false;
      }
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

    // Eliminar el curso
    await Course.findByIdAndDelete(courseId);
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
    await Promise.all([
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
