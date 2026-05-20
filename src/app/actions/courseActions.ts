"use server";

import { connectDB } from "@/lib/database/database";
import Course from "@/models/Course";
import User from "@/models/User";
import { CURSOS } from "@/seed/data";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth.config";
import { ICourse } from "@/models/Course";

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
  subjectIds: string[];
  subjects?: SerializedSubject[];
  enrolledStudents: string[];
  createdAt: string;
  updatedAt: string;
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
    subjectIds: course.subjectIds?.map(s => s.toString()) || [],
    subjects: course.subjects?.map(serializeSubject) || [],
    enrolledStudents: course.enrolledStudents?.map(e => e.toString()) || [],
    createdAt: course.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: course.updatedAt?.toISOString() || new Date().toISOString(),
  };
}

export async function fetchCourses(): Promise<SerializedCourse[]> {
  try {
    await connectDB();
    const dbCourses = await Course.find({}).lean() as ICourse[];
    const allCourses = [...dbCourses, ...CURSOS];
    return allCourses.map(serializeCourse);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return [];
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
