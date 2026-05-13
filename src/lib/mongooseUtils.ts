/**
 * Funciones Utilitarias de MongoDB/Mongoose para Consultas Optimizadas
 * Use estas funciones para garantizar consultas eficientes a la base de datos con índices adecuados
 */

import User from '@/models/User';
import Course from '@/models/Course';
import Task from '@/models/Task';
import Submission from '@/models/Submission';
import mongoose from 'mongoose';

/**
 * CONSULTAS DE USUARIO
 */

/**
 * Obtener usuario por correo electrónico solo con campos esenciales
 * @param email Correo electrónico del usuario
 * @returns Documento de usuario sin contraseña
 */
export async function getUserByEmail(email: string) {
  return User.findOne({ email })
    .select('-password') // Excluye la contraseña
    .lean(); // Retorna objeto plano de JavaScript
}

/**
 * Obtener usuario por ID con cursos inscritos (populados)
 * @param userId ID del usuario
 * @returns Usuario con detalles de cursos
 */
export async function getUserWithCourses(userId: mongoose.Types.ObjectId | string) {
  return User.findById(userId)
    .select('-password') // Excluye la contraseña
    .populate('enrolledCourses', 'title description status') // Popula cursos inscritos
    .populate('createdCourses', 'title description status') // Popula cursos creados
    .lean(); // Retorna objeto plano de JavaScript
}

/**
 * Obtener estudiantes inscritos en un curso
 * @param courseId ID del curso
 * @returns Array de documentos de estudiantes
 */
export async function getStudentsByCourseLean(courseId: mongoose.Types.ObjectId | string) {
  return User.find({ enrolledCourses: courseId }) // Busca usuarios con el curso en sus cursos inscritos
    .select('firstName profile.lastName email') // Selecciona campos específicos
    .lean(); // Retorna objeto plano de JavaScript
}

/**
 * CONSULTAS DE CURSO
 */

/**
 * Buscar cursos por texto (título o descripción)
 * @param searchQuery Texto de búsqueda
 * @param limit Límite de resultados
 * @returns Array de cursos que coinciden
 */
export async function searchCourses(searchQuery: string, limit = 10) {
  return Course.find({ $text: { $search: searchQuery } }) // Búsqueda de texto completo
    .select('title description ownerId enrollmentCount') // Selecciona campos específicos
    .limit(limit) // Limita resultados
    .lean(); // Retorna objeto plano de JavaScript
}

/**
 * Obtener cursos por propietario con paginación
 * @param ownerId ID del profesor/administrador
 * @param page Número de página (base 0)
 * @param pageSize Resultados por página
 * @returns Cursos paginados
 */
export async function getCoursesByOwner(
  ownerId: mongoose.Types.ObjectId | string,
  page = 0,
  pageSize = 10
) {
  return Course.find({ ownerId, status: { $ne: 'archived' } }) // Busca cursos no archivados del propietario
    .select('title description status enrollmentCount') // Selecciona campos específicos
    .skip(page * pageSize) // Salta registros para paginación
    .limit(pageSize) // Limita resultados por página
    .sort({ createdAt: -1 }) // Ordena por fecha de creación descendente
    .lean(); // Retorna objeto plano de JavaScript
}

/**
 * Obtener curso con materias y contenido de primera unidad
 * @param courseId ID del curso
 * @returns Curso con materias populadas
 */
export async function getCourseWithSubjects(courseId: mongoose.Types.ObjectId | string) {
  return Course.findById(courseId)
    .select('title description subjects status ownerId') // Selecciona campos específicos
    .lean(); // Retorna objeto plano de JavaScript
}

/**
 * CONSULTAS DE TAREA
 */

/**
 * Obtener tareas de un curso con fechas de entrega
 * @param courseId ID del curso
 * @param includeInactive Incluir tareas inactivas (por defecto: false)
 * @returns Array de tareas
 */
export async function getTasksByCourse(
  courseId: mongoose.Types.ObjectId | string,
  includeInactive = false
) {
  const query = includeInactive
    ? { courseId } // Incluye todas las tareas
    : { courseId, active: true }; // Solo tareas activas

  return Task.find(query)
    .select('title type dueDate startDate maxPoints') // Selecciona campos específicos
    .sort({ dueDate: 1 }) // Ordena por fecha de entrega ascendente
    .lean(); // Retorna objeto plano de JavaScript
}

/**
 * Buscar tareas por texto
 * @param searchQuery Texto de búsqueda
 * @param limit Límite de resultados
 * @returns Array de tareas que coinciden
 */
export async function searchTasks(searchQuery: string, limit = 10) {
  return Task.find({ $text: { $search: searchQuery } }) // Búsqueda de texto completo
    .select('title type dueDate courseId') // Selecciona campos específicos
    .limit(limit) // Limita resultados
    .lean(); // Retorna objeto plano de JavaScript
}

/**
 * Obtener tareas próximas (aún no vencidas)
 * @param limit Límite de resultados
 * @returns Array de tareas próximas
 */
export async function getUpcomingTasks(limit = 10) {
  return Task.find({
    dueDate: { $gte: new Date() }, // Fecha de entrega mayor o igual a la actual
    active: true, // Solo tareas activas
  })
    .select('title dueDate courseId maxPoints') // Selecciona campos específicos
    .sort({ dueDate: 1 }) // Ordena por fecha de entrega ascendente
    .limit(limit) // Limita resultados
    .lean(); // Retorna objeto plano de JavaScript
}

/**
 * CONSULTAS DE ENTREGA
 */

/**
 * Obtener entregas de una tarea con paginación
 * @param taskId ID de la tarea
 * @param page Número de página (base 0)
 * @param pageSize Resultados por página
 * @returns Entregas paginadas
 */
export async function getSubmissionsByTask(
  taskId: mongoose.Types.ObjectId | string,
  page = 0,
  pageSize = 20
) {
  return Submission.find({ taskId }) // Busca entregas de la tarea
    .select('studentId submissionStatus submittedAt grade') // Selecciona campos específicos
    .skip(page * pageSize) // Salta registros para paginación
    .limit(pageSize) // Limita resultados por página
    .sort({ submittedAt: -1 }) // Ordena por fecha de entrega descendente
    .populate('studentId', 'firstName profile.lastName email') // Popula datos del estudiante
    .lean(); // Retorna objeto plano de JavaScript
}

/**
 * Obtener entrega de un estudiante para una tarea
 * @param taskId ID de la tarea
 * @param studentId ID del estudiante
 * @returns Documento de entrega o null
 */
export async function getStudentSubmission(
  taskId: mongoose.Types.ObjectId | string,
  studentId: mongoose.Types.ObjectId | string
) {
  return Submission.findOne({ taskId, studentId }) // Busca entrega específica
    .populate('taskId', 'title dueDate maxPoints') // Popula datos de la tarea
    .populate('gradedById', 'firstName profile.lastName') // Popula datos de quien calificó
    .lean(); // Retorna objeto plano de JavaScript
}

/**
 * Obtener entregas pendientes (no calificadas)
 * @param limit Límite de resultados
 * @returns Array de entregas pendientes
 */
export async function getPendingSubmissions(limit = 20) {
  return Submission.find({
    submissionStatus: { $in: ['pending', 'submitted'] }, // Estados: pendiente o entregado
    grade: { $exists: false }, // Sin calificación
  })
    .select('taskId studentId submittedAt submissionStatus') // Selecciona campos específicos
    .sort({ submittedAt: 1 }) // Ordena por fecha de entrega ascendente
    .limit(limit) // Limita resultados
    .populate('taskId', 'title') // Popula título de la tarea
    .populate('studentId', 'firstName') // Popula nombre del estudiante
    .lean(); // Retorna objeto plano de JavaScript
}

/**
 * CONSULTAS DE AGREGACIÓN
 */

/**
 * Obtener calificaciones de estudiantes para un curso
 * @param courseId ID del curso
 * @returns Resultados de agregación con calificaciones de estudiantes
 */
export async function getCourseGrades(courseId: mongoose.Types.ObjectId | string) {
  return Submission.aggregate([
    {
      $lookup: {
        from: 'tasks', // Colección de tareas
        localField: 'taskId', // Campo local
        foreignField: '_id', // Campo externo
        as: 'task', // Alias para el resultado
      },
    },
    {
      $match: {
        'task.courseId': new mongoose.Types.ObjectId(courseId.toString()), // Filtra por curso
        grade: { $exists: true }, // Solo entregas con calificación
      },
    },
    {
      $group: {
        _id: '$studentId', // Agrupa por estudiante
        avgGrade: { $avg: '$grade' }, // Promedio de calificaciones
        submissionCount: { $sum: 1 }, // Conteo de entregas
        totalPoints: { $sum: { $cond: [{ $eq: ['$grade', null] }, 0, '$grade'] } }, // Suma de puntos
      },
    },
    {
      $lookup: {
        from: 'users', // Colección de usuarios
        localField: '_id', // Campo local
        foreignField: '_id', // Campo externo
        as: 'student', // Alias para el resultado
      },
    },
    {
      $unwind: '$student', // Descompone el array
    },
    {
      $project: {
        _id: 0,
        studentId: '$_id', // Renombra campo
        name: {
          $trim: {
            input: {
              $concat: [
                { $ifNull: ['$student.firstName', ''] },
                ' ',
                { $ifNull: ['$student.profile.lastName', ''] },
              ],
            },
          },
        },
        avgGrade: { $round: ['$avgGrade', 2] }, // Redondea promedio a 2 decimales
        submissionCount: 1,
        totalPoints: 1,
      },
    },
    {
      $sort: { avgGrade: -1 }, // Ordena por promedio descendente
    },
  ]);
}

/**
 * Obtener estadísticas del curso (inscripciones, tareas, entregas)
 * @param courseId ID del curso
 * @returns Estadísticas del curso
 */
export async function getCourseStats(courseId: mongoose.Types.ObjectId | string) {
  const [courseData] = await Course.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(courseId.toString()) }, // Filtra por ID del curso
    },
    {
      $facet: {
        basic: [
          {
            $project: {
              title: 1,
              enrollmentCount: { $size: '$enrolledStudents' }, // Tamaño del array de estudiantes inscritos
            },
          },
        ],
        tasks: [
          {
            $lookup: {
              from: 'tasks', // Colección de tareas
              localField: '_id', // Campo local
              foreignField: 'courseId', // Campo externo
              as: 'tasks', // Alias para el resultado
            },
          },
          {
            $project: {
              taskCount: { $size: '$tasks' }, // Conteo total de tareas
              activeTasks: {
                $size: {
                  $filter: {
                    input: '$tasks',
                    as: 'task',
                    cond: { $eq: ['$$task.active', true] }, // Filtra tareas activas
                  },
                },
              },
            },
          },
        ],
        submissions: [
          {
            $lookup: {
              from: 'submissions', // Colección de entregas
              localField: '_id', // Campo local
              foreignField: 'taskId', // Campo externo
              as: 'submissions', // Alias para el resultado
            },
          },
          {
            $project: {
              totalSubmissions: { $size: '$submissions' }, // Conteo total de entregas
              gradedSubmissions: {
                $size: {
                  $filter: {
                    input: '$submissions',
                    as: 'submission',
                    cond: { $ne: ['$$submission.grade', null] }, // Filtra entregas calificadas
                  },
                },
              },
            },
          },
        ],
      },
    },
  ]);

  return courseData; // Retorna las estadísticas
}

/**
 * Obtener estadísticas de entregas de una tarea
 * @param taskId ID de la tarea
 * @returns Estadísticas de entregas para la tarea
 */
export async function getTaskSubmissionStats(taskId: mongoose.Types.ObjectId | string) {
  return Submission.aggregate([
    {
      $match: { taskId: new mongoose.Types.ObjectId(taskId.toString()) }, // Filtra por ID de tarea
    },
    {
      $group: {
        _id: null, // Agrupa todo
        total: { $sum: 1 }, // Total de entregas
        submitted: {
          $sum: { $cond: [{ $eq: ['$submissionStatus', 'submitted'] }, 1, 0] }, // Entregas enviadas
        },
        pending: {
          $sum: { $cond: [{ $eq: ['$submissionStatus', 'pending'] }, 1, 0] }, // Entregas pendientes
        },
        late: {
          $sum: { $cond: [{ $eq: ['$submissionStatus', 'late'] }, 1, 0] }, // Entregas tardías
        },
        graded: {
          $sum: { $cond: [{ $ne: ['$grade', null] }, 1, 0] }, // Entregas calificadas
        },
        avgGrade: { $avg: '$grade' }, // Promedio de calificaciones
      },
    },
  ]);
}