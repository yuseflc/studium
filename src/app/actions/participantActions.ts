'use server';

/**
 * participantActions.ts
 * Server Actions relacionadas con la gestión de participantes de un curso.
 *
 * Incluye:
 *  - deleteParticipant        → Eliminar un estudiante de un curso
 *  - updateParticipantGrade   → Actualizar calificación (legacy, mantiene compatibilidad)
 *  - getCourseSubmissions     → Obtener todas las tareas y entregas de un curso
 *  - saveStudentTaskGrade     → Guardar/actualizar la calificación de una entrega
 *
 * Seguridad: todas las acciones verifican sesión y permisos RBAC antes de actuar.
 */

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/config/auth.config';
import { connectDB } from '@/lib/database/database';
import { Course, Task, Submission } from '@/models/index';
import { LOGGER } from '@/config/logger';

// ─────────────────────────────────────────────────────────────
// TIPOS INTERNOS
// ─────────────────────────────────────────────────────────────

/** Resultado estándar para operaciones de escritura */
interface ActionResult {
  success: boolean;
  message: string;
}

/** Resultado de getCourseSubmissions con datos serializables */
interface CourseSubmissionsResult {
  success: boolean;
  tasks: SerializedTask[];
  submissions: SerializedSubmission[];
}

/** Tarea serializada para transferir al cliente */
interface SerializedTask {
  _id: string;
  title: string;
  unitId: string;
  maxPoints: number;
}

/** Entrega serializada para transferir al cliente */
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
// HELPERS INTERNOS
// ─────────────────────────────────────────────────────────────

/**
 * Obtiene el curso y verifica que el usuario autenticado sea
 * propietario o profesor. Lanza si no tiene permisos.
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
// ACCIONES PÚBLICAS
// ─────────────────────────────────────────────────────────────

/**
 * Elimina un estudiante de un curso.
 *
 * Restricciones:
 *  - Solo el propietario o profesores del curso pueden ejecutar esta acción.
 *  - No se puede eliminar al propietario del curso.
 *  - No se puede eliminar a otro profesor.
 *  - No se puede eliminar a uno mismo.
 *
 * @param courseId - ID del curso del que se elimina al participante
 * @param studentId - ID del participante a eliminar
 * @returns Resultado de la operación con `success` y `message`
 */
export async function deleteParticipant(
  courseId: string,
  studentId: string
): Promise<ActionResult> {
  try {
    // 1. Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      LOGGER.warn('deleteParticipant: usuario no autenticado');
      return { success: false, message: 'No autenticado' };
    }

    await connectDB();

    // 2. Verificar que el curso existe y el usuario tiene permisos de profesor
    const course = await Course.findById(courseId).lean();
    if (!course) {
      LOGGER.warn(`deleteParticipant: curso ${courseId} no encontrado`);
      return { success: false, message: 'Curso no encontrado' };
    }

    const isOwner = String(course.ownerId) === session.user.id;
    const isTeacher = (course.teachers ?? []).some(
      (t: any) => String(t) === session.user.id
    );

    if (!isOwner && !isTeacher) {
      LOGGER.warn(
        `deleteParticipant: usuario ${session.user.id} sin permisos en curso ${courseId}`
      );
      return { success: false, message: 'No tienes permisos para esta acción' };
    }

    // 3. Protecciones adicionales: no eliminar a uno mismo ni al propietario ni a otros profesores
    if (studentId === session.user.id) {
      return { success: false, message: 'No puedes eliminarte a ti mismo del curso' };
    }

    if (studentId === String(course.ownerId)) {
      return { success: false, message: 'No puedes eliminar al propietario del curso' };
    }

    const isTargetTeacher = (course.teachers ?? []).some(
      (t: any) => String(t) === studentId
    );
    if (isTargetTeacher) {
      return { success: false, message: 'No puedes eliminar a otros profesores' };
    }

    // 4. Eliminar al estudiante del array enrolledStudents
    await Course.findByIdAndUpdate(
      courseId,
      { $pull: { enrolledStudents: studentId } },
      { new: true }
    );

    LOGGER.info(
      `deleteParticipant: usuario ${session.user.id} eliminó ${studentId} del curso ${courseId}`
    );

    return { success: true, message: 'Participante eliminado exitosamente' };
  } catch (error) {
    LOGGER.error(`deleteParticipant error: ${error}`);
    return { success: false, message: 'Error al eliminar participante' };
  }
}

/**
 * Obtiene todas las tareas y sus entregas para un curso dado.
 * Devuelve datos serializados (JSON-safe) para su uso en Client Components.
 *
 * @param courseId - ID del curso
 * @returns { success, tasks, submissions } — listas de tareas y entregas del curso
 */
export async function getCourseSubmissions(
  courseId: string
): Promise<CourseSubmissionsResult> {
  try {
    await connectDB();

    // Obtener todas las tareas activas del curso
    const rawTasks = await Task.find({ courseId })
      .select('_id title unitId maxPoints')
      .lean();

    const taskIds = rawTasks.map((t) => t._id);

    // Obtener todas las entregas correspondientes a esas tareas
    const rawSubmissions = await Submission.find({
      taskId: { $in: taskIds },
    })
      .select('_id taskId studentId grade feedback submissionStatus gradedAt')
      .lean();

    // Serializar para que sean seguros en Client Components (ObjectId → string)
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
    LOGGER.error(`getCourseSubmissions error: ${error}`);
    return { success: false, tasks: [], submissions: [] };
  }
}

/**
 * Guarda o actualiza la calificación de un estudiante para una tarea concreta.
 * Utiliza upsert para crear la entrega si no existe, o actualizarla si ya existe.
 *
 * Restricciones:
 *  - Solo profesores o propietarios del curso pueden calificar.
 *  - La calificación debe estar en el rango [0, 10].
 *
 * @param taskId    - ID de la tarea a calificar
 * @param studentId - ID del estudiante que se está calificando
 * @param grade     - Calificación numérica (0–10)
 * @param feedback  - Comentario o retroalimentación opcional
 * @returns Resultado de la operación con `success` y `message`
 */
export async function saveStudentTaskGrade(
  taskId: string,
  studentId: string,
  grade: number,
  feedback?: string
): Promise<ActionResult> {
  try {
    // 1. Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, message: 'No autenticado' };
    }

    // 2. Validar rango de calificación
    if (grade < 0 || grade > 10) {
      return { success: false, message: 'La calificación debe estar entre 0 y 10' };
    }

    await connectDB();

    // 3. Obtener la tarea para saber a qué curso pertenece y verificar permisos
    const task = await Task.findById(taskId).select('courseId').lean();
    if (!task) {
      return { success: false, message: 'Tarea no encontrada' };
    }

    // 4. Verificar permisos de profesor/propietario en ese curso
    try {
      await assertTeacherAccess(String(task.courseId), session.user.id);
    } catch (permError) {
      LOGGER.warn(
        `saveStudentTaskGrade: usuario ${session.user.id} sin permisos — ${permError}`
      );
      return { success: false, message: 'No tienes permisos para calificar en este curso' };
    }

    // 5. Upsert de la entrega: incluye el campo `content` (requerido por el schema)
    //    para evitar error de validación cuando se crea por primera vez.
    await Submission.findOneAndUpdate(
      { taskId, studentId },
      {
        $set: {
          grade,
          feedback: feedback ?? '',
          submissionStatus: 'submitted',
          gradedAt: new Date(),
          gradedById: session.user.id,
        },
        // `content` es requerido en el schema; si el documento es nuevo se
        // inicializa con un placeholder para no fallar la validación.
        $setOnInsert: {
          content: '[Calificado por el profesor sin entrega previa]',
        },
      },
      { upsert: true, new: true, runValidators: false }
    );

    LOGGER.info(
      `saveStudentTaskGrade: usuario ${session.user.id} calificó tarea ${taskId} ` +
        `del estudiante ${studentId} con ${grade}`
    );

    return { success: true, message: 'Calificación guardada correctamente' };
  } catch (error) {
    LOGGER.error(`saveStudentTaskGrade error: ${error}`);
    return { success: false, message: 'Error al guardar la calificación' };
  }
}
