/* Archivo: src\lib\api\course-helpers.ts
  Descripción: Helpers para operaciones de cursos (consulta, actualización, permisos). */

/**
 * MongoDB Query Helpers para la estructura normalizada de cursos
 * Proporciona funciones para queries comunes contra Unit y Resource
 */

import mongoose from "mongoose";
import Unit from "@/models/Unit";
import Resource from "@/models/Resource";
import Task from "@/models/Task";
import Course from "@/models/Course";
import Submission from "@/models/Submission";
import User from "@/models/User";
import { authOptions } from "@/config/auth.config";
import { getServerSession } from "next-auth/next";
// Subject model deprecated; use Units directly
import { LOGGER } from "@/config/logger";

function normalizeResource(resource: any) {
  return {
    _id: resource._id,
    unitId: resource.unitId,
    courseId: resource.courseId,
    title: resource.title,
    type: resource.type,
    url: resource.url,
    description: resource.description,
    content: resource.content,
    createdAt: resource.createdAt,
    updatedAt: resource.updatedAt,
  };
}

function normalizeUnit(unit: any) {
  return {
    ...unit,
    resources: Array.isArray(unit.resourceIds) ? unit.resourceIds.map((resource: any) => normalizeResource(resource)) : [],
    tasks: Array.isArray(unit.tasks) ? unit.tasks : [],
  };
}

/**
 * Obtiene un curso completo con todas sus materias, unidades y recursos
 * Retorna la estructura completa poblada para consumo en componentes
 */
export async function getCourseFullStructure(courseId: string | mongoose.Types.ObjectId) {
  try {
    // Validar que courseId es válido
    if (!courseId || !mongoose.Types.ObjectId.isValid(String(courseId))) {
      throw new Error(`Invalid courseId: ${courseId}`);
    }

    // Obtener sesión del usuario para saber cuáles tareas ha entregado
    const session = await getServerSession(authOptions);
    let currentUserSubmissionTaskIds: string[] = [];

    if (session?.user?.id) {
      try {
        const userId = typeof session.user.id === 'string' ? new mongoose.Types.ObjectId(session.user.id) : session.user.id;
        const submissions = await Submission.find({ studentId: userId })
          .select("taskId")
          .lean();
        currentUserSubmissionTaskIds = submissions.map((s: any) => s.taskId.toString());
      } catch (err) {
        LOGGER.error({ userId: session.user.id, err }, "Error fetching submissions for user");
      }
    } else if (session?.user?.email) {
      const user = await User.findOne({ email: session.user.email }).select("_id").lean();
      if (user) {
        const submissions = await Submission.find({ studentId: user._id })
          .select("taskId")
          .lean();
        currentUserSubmissionTaskIds = submissions.map((s: any) => s.taskId.toString());
      }
    }

    // Obtener curso básico sin populate (más confiable)
    const course = await Course.findById(courseId).lean();

    if (!course) {
      LOGGER.warn({ courseId }, "Course not found");
      return null;
    }

    // Obtener todas las unidades del curso
    const units = await Unit.find({ courseId: course._id })
      .populate({
        path: "resourceIds",
        select: "_id unitId title type url description content createdAt updatedAt",
      })
      .sort({ order: 1 })
      .lean();

    const unitIds = Array.isArray(units) ? units.map((u: any) => u._id) : [];

    // Determinar si el usuario es profesor/propietario para decidir qué tareas mostrar
    const userId = session?.user?.id;
    const isTeacherOrOwner = userId && (
      course.ownerId?.toString() === userId ||
      (Array.isArray(course.teachers) && course.teachers.some((t: any) => t.toString() === userId))
    );

    // Construir la query de tareas según el rol del usuario:
    // - Profesor/propietario: todas las tareas (incluye borradores)
    // - Estudiante: solo tareas activas donde assignmentMode="all" o el estudiante está en assignedStudentIds
    let taskQuery: Record<string, any>;
    if (isTeacherOrOwner) {
      taskQuery = { unitId: { $in: unitIds } };
    } else if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      taskQuery = {
        unitId: { $in: unitIds },
        active: true,
        $or: [
          { assignmentMode: 'all' },
          { assignmentMode: { $exists: false } },
          { assignedStudentIds: new mongoose.Types.ObjectId(userId) },
        ],
      };
    } else {
      taskQuery = { unitId: { $in: unitIds }, active: true, assignmentMode: 'all' };
    }

    // Obtener todas las tareas asociadas a estas unidades (nuevo modelo usa unitId)
    const rawTasks = await Task.find(taskQuery)
      .sort({ createdAt: -1 })
      .lean();

    // Inyectar el estado de entrega en cada tarea
    const tasks = (rawTasks || []).map((task: any) => {
      const taskId = String(task._id);
      return {
        ...task,
        isSubmitted: currentUserSubmissionTaskIds.includes(taskId),
      };
    });
    const tasksByUnit: Record<string, any[]> = {};
    (tasks || []).forEach((t: any) => {
      const key = String(t.unitId || "");
      tasksByUnit[key] = tasksByUnit[key] || [];
      tasksByUnit[key].push(t);
    });

    const normalizedUnits = (units || []).map((unit: any) => {
      const u = { ...unit };
      u.tasks = tasksByUnit[String(unit._id)] || [];
      return normalizeUnit(u);
    });

    return {
      _id: course._id,
      title: course.title,
      description: course.description,
      ownerId: course.ownerId,
      status: course.status,
      units: normalizedUnits,
      unitIds,
      enrollmentCount: (course.enrolledStudents as any[])?.length || 0,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    LOGGER.error(
      { courseId, errorMessage, errorStack: error instanceof Error ? error.stack : undefined },
      "Error fetching course full structure"
    );
    // Retornar null en lugar de lanzar error para que el frontend pueda manejar gracefully
    return null;
  }
}

/**
 * Obtiene una unidad con todos sus recursos
 */
export async function getUnitWithResources(unitId: string | mongoose.Types.ObjectId) {
  try {
    const unit = await Unit.findById(unitId).populate({
      path: "resourceIds",
      select: "_id title type url description content createdAt updatedAt",
    });

    return unit ? normalizeUnit(unit.toObject()) : unit;
  } catch (error) {
    LOGGER.error({ unitId, error }, "Error fetching unit with resources");
    throw error;
  }
}

/**
 * Obtiene todas las unidades de un curso ordenadas
 */
export async function getCourseSubjects(courseId: string | mongoose.Types.ObjectId) {
  try {
    const units = await Unit.find({ courseId }).sort({ order: 1 }).lean();
    return units;
  } catch (error) {
    LOGGER.error({ courseId, error }, "Error fetching course subjects");
    throw error;
  }
}

/**
 * Compat: devuelve unidades asociadas a la materia identificada por subjectId.
 */
export async function getSubjectUnits(subjectId: string | mongoose.Types.ObjectId) {
  try {
    // Deprecated: units are queried by course now. Keep compatibility by returning empty array.
    const units: any[] = [];
    return units;
  } catch (error) {
    LOGGER.error({ subjectId, error }, "Error fetching subject units");
    throw error;
  }
}

/**
 * Obtiene todos los recursos de una unidad
 */
export async function getUnitResources(unitId: string | mongoose.Types.ObjectId) {
  try {
    const resources = await Resource.find({ unitId })
      .sort({ createdAt: 1 })
      .lean();

    return resources;
  } catch (error) {
    LOGGER.error({ unitId, error }, "Error fetching unit resources");
    throw error;
  }
}

/**
 * Crea una nueva materia en un curso
 */
export async function createSubject(
  courseId: string | mongoose.Types.ObjectId,
  data: { title: string; description?: string; order?: number }
) {
  try {
    // Create a Unit instead to represent the subject (normalized model)
    const unit = await Unit.create({
      courseId,
      title: data.title,
      content: data.description || "",
      order: data.order ?? 0,
      resourceIds: [],
      taskIds: [],
    });

    // Ensure course.unitIds includes this unit
    await Course.findByIdAndUpdate(courseId, { $addToSet: { unitIds: unit._id } });

    return unit;
  } catch (error) {
    LOGGER.error({ courseId, error }, "Error creating subject");
    throw error;
  }
}

/**
 * Crea una nueva unidad en una materia
 */
export async function createUnit(
  courseId: string | mongoose.Types.ObjectId,
  data: { title: string; content: string; order?: number }
) {
  try {
    const unit = await Unit.create({
      courseId,
      ...data,
      order: data.order ?? 0,
    });

    // Agregar la unidad al curso (orden lógico mantenido en course.unitIds)
    await Course.findByIdAndUpdate(courseId, { $push: { unitIds: unit._id } }, { new: true });

    return unit;
  } catch (error) {
    LOGGER.error({ courseId, error }, "Error creating unit");
    throw error;
  }
}

/**
 * Crea un nuevo recurso en una unidad
 */
export async function createResource(
  unitId: string | mongoose.Types.ObjectId,
  courseId: string | mongoose.Types.ObjectId,
  data: { title: string; type: "link" | "file" | "text"; url?: string; description?: string }
) {
  try {
    const resource = await Resource.create({
      unitId,
      courseId,
      ...data,
    });

    // Agregar el recurso a la unidad
    await Unit.findByIdAndUpdate(
      unitId,
      { $push: { resourceIds: resource._id } },
      { new: true }
    );

    return resource;
  } catch (error) {
    LOGGER.error({ unitId, courseId, error }, "Error creating resource");
    throw error;
  }
}

/**
 * Elimina una materia y todas sus unidades y recursos asociados
 */
export async function deleteSubject(subjectId: string | mongoose.Types.ObjectId) {
  try {
    // Treat subjectId as unitId in the new normalized model
    const unit = await Unit.findById(subjectId);
    if (!unit) throw new Error("Unit not found");

    const unitIds = [unit._id];

    // Delete resources and tasks tied to the unit
    await Resource.deleteMany({ unitId: { $in: unitIds } });
    await Task.deleteMany({ unitId: { $in: unitIds } });

    // Delete the unit
    await Unit.findByIdAndDelete(unit._id);

    // Remove from course.unitIds
    await Course.findByIdAndUpdate(unit.courseId, { $pull: { unitIds: unit._id } }, { new: true });

    return { success: true };
  } catch (error) {
    LOGGER.error({ subjectId, error }, "Error deleting subject");
    throw error;
  }
}

/**
 * Elimina una unidad y todos sus recursos asociados
 */
export async function deleteUnit(unitId: string | mongoose.Types.ObjectId) {
  try {
    const unit = await Unit.findById(unitId);
    if (!unit) throw new Error("Unit not found");

    // Eliminar todos los recursos de la unidad
    await Resource.deleteMany({ unitId });

    // Eliminar la unidad
    await Unit.findByIdAndDelete(unitId);
    // Eliminar la unidad del curso
    await Course.findByIdAndUpdate(unit.courseId, { $pull: { unitIds: unitId } }, { new: true });

    return { success: true };
  } catch (error) {
    LOGGER.error({ unitId, error }, "Error deleting unit");
    throw error;
  }
}

/**
 * Elimina un recurso
 */
export async function deleteResource(resourceId: string | mongoose.Types.ObjectId) {
  try {
    const resource = await Resource.findById(resourceId);
    if (!resource) throw new Error("Resource not found");

    // Eliminar el recurso
    await Resource.findByIdAndDelete(resourceId);

    // Eliminar el recurso de la unidad
    await Unit.findByIdAndUpdate(
      resource.unitId,
      { $pull: { resourceIds: resourceId } },
      { new: true }
    );

    return { success: true };
  } catch (error) {
    LOGGER.error({ resourceId, error }, "Error deleting resource");
    throw error;
  }
}
