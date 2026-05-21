/**
 * MongoDB Query Helpers para la estructura normalizada de cursos
 * Proporciona funciones para queries comunes contra Subject, Unit y Resource
 */

import mongoose from "mongoose";
import Subject from "@/models/Subject";
import Unit from "@/models/Unit";
import Resource from "@/models/Resource";
import Task from "@/models/Task";
import Course from "@/models/Course";
import { LOGGER } from "@/config/logger";

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

    // Obtener curso básico sin populate (más confiable)
    const course = await Course.findById(courseId).lean();

    if (!course) {
      LOGGER.warn({ courseId }, "Course not found");
      return null;
    }

    // Obtener subjectIds de forma segura
    const subjectIds = Array.isArray(course.subjectIds) ? course.subjectIds : [];

    if (subjectIds.length === 0) {
      LOGGER.info({ courseId }, "Course has no subjects");
      return {
        _id: course._id,
        title: course.title,
        description: course.description,
        ownerId: course.ownerId,
        status: course.status,
        subjects: [],
        enrollmentCount: (course.enrolledStudents as any[])?.length || 0,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
      };
    }

    // Obtener todas las materias directamente
    const allSubjects = await Subject.find({ _id: { $in: subjectIds } })
      .select("_id courseId title description order unitIds taskIds")
      .lean();

    // Para cada materia, obtener sus unidades pobladas con recursos
    const subjects = await Promise.all(
      allSubjects.map(async (subject: any) => {
        try {
          // Validar que subject.unitIds existe y es un array
          const unitIds = Array.isArray(subject.unitIds) ? subject.unitIds : [];

          if (unitIds.length === 0) {
            return {
              ...subject,
              units: [],
              unitIds: [],
            };
          }

          const units = await Unit.find({ _id: { $in: unitIds } })
            .populate({
              path: "resourceIds",
              select: "_id unitId title type url description createdAt updatedAt",
            })
            .sort({ order: 1 })
            .lean();

          // Fetch tasks associated with this subject
          const tasks = await Task.find({ subjectId: subject._id })
            .sort({ createdAt: -1 })
            .lean();

          return {
            ...subject,
            units: units || [], // Retornar units pobladas en lugar de unitIds
            unitIds: unitIds, // Mantener también los IDs
            tasks: tasks || [], // Incluir tareas
          };
        } catch (subjectError) {
          LOGGER.error({ courseId, subjectId: subject._id, error: subjectError }, "Error processing subject");
          return {
            ...subject,
            units: [],
            unitIds: subject.unitIds || [],
          };
        }
      })
    );

    return {
      _id: course._id,
      title: course.title,
      description: course.description,
      ownerId: course.ownerId,
      status: course.status,
      subjects: subjects,
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
 * Obtiene una materia con todas sus unidades y recursos
 * Estructura completa de una materia específica
 */
export async function getSubjectWithUnits(subjectId: string | mongoose.Types.ObjectId) {
  try {
    const subject = await Subject.findById(subjectId).populate({
      path: "unitIds",
      select: "_id title content order resourceIds",
    });

    if (!subject) return null;

    // Luego, poblar los recursos de cada unidad
    const units = subject.unitIds as any[];
    const unitsWithResources = await Promise.all(
      units.map(async (unit) => {
        const unitDoc = await Unit.findById(unit._id).populate({
          path: "resourceIds",
          select: "_id title type url description createdAt",
        });
        return unitDoc;
      })
    );

    return {
      ...subject.toObject(),
      unitIds: unitsWithResources,
    };
  } catch (error) {
    LOGGER.error({ subjectId, error }, "Error fetching subject with units");
    throw error;
  }
}

/**
 * Obtiene una unidad con todos sus recursos
 */
export async function getUnitWithResources(unitId: string | mongoose.Types.ObjectId) {
  try {
    const unit = await Unit.findById(unitId).populate({
      path: "resourceIds",
      select: "_id title type url description createdAt updatedAt",
    });

    return unit;
  } catch (error) {
    LOGGER.error({ unitId, error }, "Error fetching unit with resources");
    throw error;
  }
}

/**
 * Obtiene todas las materias de un curso ordenadas
 */
export async function getCourseSubjects(courseId: string | mongoose.Types.ObjectId) {
  try {
    const subjects = await Subject.find({ courseId })
      .sort({ order: 1 })
      .lean();

    return subjects;
  } catch (error) {
    LOGGER.error({ courseId, error }, "Error fetching course subjects");
    throw error;
  }
}

/**
 * Obtiene todas las unidades de una materia ordenadas
 */
export async function getSubjectUnits(subjectId: string | mongoose.Types.ObjectId) {
  try {
    const units = await Unit.find({ subjectId })
      .sort({ order: 1 })
      .lean();

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
    const subject = await Subject.create({
      courseId,
      ...data,
      order: data.order ?? 0,
    });

    return subject;
  } catch (error) {
    LOGGER.error({ courseId, error }, "Error creating subject");
    throw error;
  }
}

/**
 * Crea una nueva unidad en una materia
 */
export async function createUnit(
  subjectId: string | mongoose.Types.ObjectId,
  courseId: string | mongoose.Types.ObjectId,
  data: { title: string; content: string; order?: number }
) {
  try {
    const unit = await Unit.create({
      subjectId,
      courseId,
      ...data,
      order: data.order ?? 0,
    });

    // Agregar la unidad a la materia
    await Subject.findByIdAndUpdate(
      subjectId,
      { $push: { unitIds: unit._id } },
      { new: true }
    );

    return unit;
  } catch (error) {
    LOGGER.error({ subjectId, courseId, error }, "Error creating unit");
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
    const subject = await Subject.findById(subjectId);
    if (!subject) throw new Error("Subject not found");

    // Obtener todas las unidades de la materia
    const units = await Unit.find({ subjectId });
    const unitIds = units.map((u) => u._id);

    // Eliminar todos los recursos de esas unidades
    await Resource.deleteMany({ unitId: { $in: unitIds } });

    // Eliminar todas las unidades
    await Unit.deleteMany({ subjectId });

    // Eliminar la materia
    await Subject.findByIdAndDelete(subjectId);

    // Eliminar la materia del curso
    await Course.findByIdAndUpdate(
      subject.courseId,
      { $pull: { subjectIds: subjectId } },
      { new: true }
    );

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

    // Eliminar la unidad de la materia
    await Subject.findByIdAndUpdate(
      unit.subjectId,
      { $pull: { unitIds: unitId } },
      { new: true }
    );

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
