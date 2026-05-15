import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database/database';
import Course from '@/models/Course';
import User from '@/models/User';
import { logInfo } from '@/config/logger';
import { validateRequest } from '@/lib/validators/api-validation';
import {
  successResponse,
  createdResponse,
  validationErrorResponse,
  notFoundResponse,
  internalErrorResponse,
  unauthorizedResponse,
} from '@/lib/api/response-handler';
import { extractUserId } from '@/lib/api/auth-helpers';
import {
  createCourseSchema,
  type CreateCourseInput,
} from '@/lib/validators/validators';
import { withErrorHandling } from '@/lib/api/middleware';

/** Estados válidos para un curso */
const VALID_COURSE_STATUSES = ['draft', 'active', 'archived'] as const;
type CourseStatus = typeof VALID_COURSE_STATUSES[number];

/**
 * Interfaz tipada para el filtro de cursos (evita `any`)
 */
interface CourseFilter {
  ownerId?: string;
  status?: CourseStatus;
  $text?: { $search: string };
}

/**
 * GET /api/courses
 * Obtiene la lista de cursos
 *
 * Query parameters:
 * - ownerId?: string - Filtrar por propietario
 * - status?: draft|active|archived - Filtrar por estado
 * - search?: string - Buscar en título y descripción
 * - limit?: number - Límite de resultados (default: 20, max: 100)
 * - page?: number - Número de página (default: 1)
 *
 * Respuestas:
 * - 200: Lista de cursos obtenida exitosamente
 * - 500: Error del servidor
 */
export const GET = withErrorHandling(
  async (request: NextRequest, requestId) => {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get('ownerId');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
    const skip = (page - 1) * limit;

    // Construir filtro tipado
    const filter: CourseFilter = {};

    if (ownerId) {
      filter.ownerId = ownerId;
    }

    if (status && (VALID_COURSE_STATUSES as readonly string[]).includes(status)) {
      filter.status = status as CourseStatus;
    }

    if (search) {
      filter.$text = { $search: search };
    }

    // Paralelizar count y data query (ambas usan el mismo filtro)
    const [total, courses] = await Promise.all([
      Course.countDocuments(filter),
      Course.find(filter)
        .select('-subjects')
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    logInfo('Cursos obtenidos', {
      total,
      page,
      limit,
      count: courses.length,
      requestId,
    });

    return successResponse(
      {
        items: courses,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
      'Cursos obtenidos exitosamente',
      200,
      requestId
    );
  },
  'GET /courses'
);

/**
 * POST /api/courses
 * Crea un nuevo curso
 *
 * Body esperado:
 * ```
 * {
 *   title: string (requerido, 3-200 caracteres)
 *   description?: string (máx 1000 caracteres)
 *   status?: "draft" | "active" | "archived" (default: "draft")
 * }
 * ```
 *
 * Respuestas:
 * - 201: Curso creado exitosamente
 * - 400: Validación fallida
 * - 401: No autenticado
 * - 404: Usuario no encontrado
 * - 500: Error del servidor
 */
export const POST = withErrorHandling(
  async (request: NextRequest, requestId) => {
    // Lanzar operaciones independientes en paralelo
    const dbPromise = connectDB();
    const [validationResult, userId] = await Promise.all([
      validateRequest<CreateCourseInput>(request, createCourseSchema, 'createCourse'),
      extractUserId(request),
    ]);

    if (!validationResult.success) {
      return validationErrorResponse(validationResult.errors, requestId);
    }

    if (!userId) {
      return unauthorizedResponse(requestId);
    }

    const { title, description, status } = validationResult.data;

    await dbPromise;

    // Verificar que el usuario existe
    const user = await User.findById(userId).lean();
    if (!user) {
      return notFoundResponse('Usuario', requestId);
    }

    // Crear el curso
    const newCourse = new Course({
      title,
      description,
      status,
      ownerId: userId,
      teachers: [],
      subjects: [],
      enrolledStudents: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await newCourse.save();

    logInfo('Curso creado exitosamente', {
      courseId: newCourse._id.toString(),
      ownerId: userId,
      title,
      requestId,
    });

    return createdResponse(
      {
        id: newCourse._id.toString(),
        title: newCourse.title,
        description: newCourse.description,
        status: newCourse.status,
        ownerId: newCourse.ownerId.toString(),
        createdAt: newCourse.createdAt,
      },
      'Curso creado exitosamente',
      requestId
    );
  },
  'POST /courses'
);
