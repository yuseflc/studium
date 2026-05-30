'use server';

/**
 * participantActions.ts
 * Server Actions para gestión de participantes y calificaciones de cursos.
 *
 * Incluye:
 *  - deleteParticipant: Eliminar estudiante de un curso
 *  - getCourseSubmissions: Obtener tareas y entregas de un curso
 *  - saveStudentTaskGrade: Guardar/actualizar calificación de una entrega
 *
 * Seguridad: todas las acciones verifican sesión y permisos RBAC.
 */

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/config/auth.config';
import { connectDB } from '@/lib/database/database';
import { Course, Task, Submission } from '@/models/index';
import { LOGGER } from '@/config/logger';
import mongoose from 'mongoose';

// ─────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────

interface ActionResult {
  success: boolean;
  message: string;
}

interface CourseSubmissionsResult {
  success: boolean;
  tasks: SerializedTask[];
  submissions: SerializedSubmission[];
}

interface SerializedTask {
  _id: string;
  title: string;
  unitId: string;
  maxPoints: number;
}

interface SerializedSubmission {
  _id: string;
  taskId: string;
  studentId: string;
  grade?: number;
  feedback?: string;
  submissionStatus: string;
  gradedAt?: string;
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

/**
 * Verifica que el usuario sea profesor/propietario del curso.
 * Lanza error si no tiene permisos.
 */
async function assertTeacherAccess(
  courseId: string,
  userId: string
): Promise<{ isOwner: boolean; isTeacher: boolean }> {
  const course = await Course.findById(courseId).lean();
  if (!course) {
    throw new Error('Curso no encontrado');
  }

  const isOwner = String(course.ownerId) === userId;
  const isTeacher = (course.teachers ?? []).some(
    (t: any) => String(t) === userId
  );

  if (!isOwner && !isTeacher) {
    throw new Error('No tienes permisos para esta acción');
  }

  return { isOwner, isTeacher };
}

// ─────────────────────────────────────────────────────────────
// ACCIONES
// ─────────────────────────────────────────────────────────────

/**
 * Elimina un estudiante de un curso.
 * Solo propietarios y profesores pueden ejecutar.
 */
export async function deleteParticipant(
  courseId: string,
  studentId: string
): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, message: 'No autenticado' };
    }

    await connectDB();

    const course = await Course.findById(courseId).lean();
    if (!course) {
      return { success: false, message: 'Curso no encontrado' };
    }

    const isOwner = String(course.ownerId) === session.user.id;
    const isTeacher = (course.teachers ?? []).some(
      (t: any) => String(t) === session.user.id
    );

    if (!isOwner && !isTeacher) {
      return { success: false, message: 'No tienes permisos para esta acción' };
    }

    // Protecciones
    if (studentId === session.user.id) {
      return { success: false, message: 'No puedes eliminarte a ti mismo' };
    }

    if (studentId === String(course.ownerId)) {
      return { success: false, message: 'No puedes eliminar al propietario' };
    }

    const isTargetTeacher = (course.teachers ?? []).some(
      (t: any) => String(t) === studentId
    );
    if (isTargetTeacher) {
      return { success: false, message: 'No puedes eliminar a otros profesores' };
    }

    // Eliminar
    await Course.findByIdAndUpdate(
      courseId,
      { $pull: { enrolledStudents: studentId } },
      { new: true }
    );

    LOGGER.info(
      `[deleteParticipant] Usuario ${session.user.id} eliminó ${studentId} del curso ${courseId}`
    );

    return { success: true, message: 'Participante eliminado' };
  } catch (error) {
    LOGGER.error(`[deleteParticipant] Error: ${error}`);
    return { success: false, message: 'Error al eliminar participante' };
  }
}

/**
 * Obtiene todas las tareas y entregas de un curso.
 * Devuelve datos serializados para Client Components.
 */
export async function getCourseSubmissions(
  courseId: string
): Promise<CourseSubmissionsResult> {
  try {
    await connectDB();

    // Obtener tareas del curso
    const rawTasks = await Task.find({ courseId })
      .select('_id title unitId maxPoints')
      .lean();

    const taskIds = rawTasks.map((t) => t._id);

    // Obtener entregas
    const rawSubmissions = await Submission.find({
      taskId: { $in: taskIds },
    })
      .select('_id taskId studentId grade feedback submissionStatus gradedAt')
      .lean();

    // Serializar para cliente
    const tasks: SerializedTask[] = rawTasks.map((t: any) => ({
      _id: String(t._id),
      title: t.title,
      unitId: String(t.unitId),
      maxPoints: t.maxPoints,
    }));

    const submissions: SerializedSubmission[] = rawSubmissions.map((s) => ({
      _id: String(s._id),
      taskId: String(s.taskId),
      studentId: String(s.studentId),
      grade: s.grade,
      feedback: s.feedback,
      submissionStatus: s.submissionStatus,
      gradedAt: s.gradedAt ? String(s.gradedAt) : undefined,
    }));

    return { success: true, tasks, submissions };
  } catch (error) {
    LOGGER.error(`[getCourseSubmissions] Error: ${error}`);
    return { success: false, tasks: [], submissions: [] };
  }
}

/**
 * Guarda o actualiza la calificación de un estudiante para una tarea.
 * Usa upsert para crear o actualizar la entrega.
 *
 * @param taskId - ID de la tarea
 * @param studentId - ID del estudiante
 * @param grade - Calificación (0-10)
 * @param feedback - Comentario opcional
 */
export async function saveStudentTaskGrade(
  taskId: string,
  studentId: string,
  grade: number,
  feedback?: string
): Promise<ActionResult> {
  try {
    // [1] Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log('[saveStudentTaskGrade] No autenticado');
      return { success: false, message: 'No autenticado' };
    }
    console.log(`[saveStudentTaskGrade] Usuario: ${session.user.id}`);

    // [2] Validar IDs no vacíos y formato
    const sanitizedTaskId = (taskId || '').trim();
    const sanitizedStudentId = (studentId || '').trim();

    if (!sanitizedTaskId || !sanitizedStudentId) {
      console.error(
        `[saveStudentTaskGrade] IDs vacíos: taskId="${sanitizedTaskId}", studentId="${sanitizedStudentId}"`
      );
      return { success: false, message: 'IDs inválidos' };
    }

    // Validar que sean ObjectIds válidos de MongoDB
    if (!mongoose.Types.ObjectId.isValid(sanitizedTaskId)) {
      console.error(
        `[saveStudentTaskGrade] taskId no es ObjectId válido: ${sanitizedTaskId}`
      );
      return { success: false, message: 'ID de tarea inválido' };
    }

    if (!mongoose.Types.ObjectId.isValid(sanitizedStudentId)) {
      console.error(
        `[saveStudentTaskGrade] studentId no es ObjectId válido: ${sanitizedStudentId}`
      );
      return { success: false, message: 'ID de estudiante inválido' };
    }

    console.log(
      `[saveStudentTaskGrade] IDs válidos: taskId=${sanitizedTaskId}, studentId=${sanitizedStudentId}`
    );

    // [3] Validar calificación
    if (typeof grade !== 'number') {
      console.error(`[saveStudentTaskGrade] Grade no es número: ${typeof grade}`);
      return { success: false, message: 'Calificación inválida' };
    }

    if (isNaN(grade)) {
      console.error('[saveStudentTaskGrade] Grade es NaN');
      return { success: false, message: 'Calificación inválida' };
    }

    if (grade < 0 || grade > 10) {
      console.error(`[saveStudentTaskGrade] Grade fuera de rango: ${grade}`);
      return { success: false, message: 'Calificación debe estar entre 0 y 10' };
    }

    console.log(`[saveStudentTaskGrade] Grade válida: ${grade}`);

    await connectDB();

    // [4] Obtener tarea y verificar existencia
    const task = await Task.findById(sanitizedTaskId).select('courseId').lean();
    if (!task) {
      console.error(
        `[saveStudentTaskGrade] Tarea no encontrada: ${sanitizedTaskId}`
      );
      return { success: false, message: 'Tarea no encontrada' };
    }

    console.log(
      `[saveStudentTaskGrade] Tarea encontrada, courseId: ${task.courseId}`
    );

    // [5] Verificar permisos de profesor
    try {
      await assertTeacherAccess(String(task.courseId), session.user.id);
      console.log(
        `[saveStudentTaskGrade] Permisos verificados para usuario ${session.user.id}`
      );
    } catch (permError) {
      console.error(`[saveStudentTaskGrade] Permiso denegado: ${permError}`);
      return {
        success: false,
        message: 'No tienes permisos para calificar en este curso'
      };
    }

    // [6] Preparar datos para guardar
    const taskObjectId = new mongoose.Types.ObjectId(sanitizedTaskId);
    const studentObjectId = new mongoose.Types.ObjectId(sanitizedStudentId);
    const sanitizedFeedback = (feedback || '').trim();

    console.log(
      `[saveStudentTaskGrade] Guardando: taskId=${taskObjectId}, studentId=${studentObjectId}, grade=${grade}, feedback_len=${sanitizedFeedback.length}`
    );

    // [7] Upsert de la entrega
    const result = await Submission.findOneAndUpdate(
      { taskId: taskObjectId, studentId: studentObjectId },
      {
        $set: {
          grade,
          feedback: sanitizedFeedback,
          submissionStatus: 'submitted',
          gradedAt: new Date(),
          gradedById: session.user.id
        },
        $setOnInsert: {
          content: '[Calificado por el profesor sin entrega previa]'
        }
      },
      { upsert: true, new: true, runValidators: false }
    );

    if (!result) {
      console.error('[saveStudentTaskGrade] findOneAndUpdate retornó null');
      return { success: false, message: 'Error al guardar la calificación' };
    }

    console.log(
      `[saveStudentTaskGrade] ✓ Guardado correctamente: ${result._id}`
    );
    return { success: true, message: 'Calificación guardada correctamente' };
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : String(error);
    console.error(`[saveStudentTaskGrade] Error: ${errorMsg}`);
    if (error instanceof Error && error.stack) {
      console.error(`[saveStudentTaskGrade] Stack: ${error.stack}`);
    }
    return { success: false, message: 'Error al guardar la calificación' };
  }
}
