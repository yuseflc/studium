import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database/database';
import { Course, User } from '@/models/index';
import { logInfo } from '@/config/logger';
import { validateRequest, validationErrorResponse } from '@/lib/validators/api-validation';
import {
  successResponse,
  createdResponse,
  validationErrorResponse as validateErrorResponse,
  notFoundResponse,
  conflictResponse,
  internalErrorResponse,
  forbiddenResponse,
  unauthorizedResponse,
} from '@/lib/api/response-handler';
import { extractUserId } from '@/lib/api/auth-helpers';
import {
  createCourseSchema,
  updateCourseSchema,
  type CreateCourseInput,
  type UpdateCourseInput,
} from '@/lib/validators/validators';

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
async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get('ownerId');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
    const skip = (page - 1) * limit;

    // Construir filtro dinámicamente
    const filter: any = {};
    
    if (ownerId) {
      filter.ownerId = ownerId;
    }
    
    if (status && ['draft', 'active', 'archived'].includes(status)) {
      filter.status = status;
    }

    // Búsqueda de texto
    let query = Course.find(filter);
    
    if (search) {
      query = query.where('$text').equals({ $search: search });
    }

    // Contar total para paginación
    const total = await Course.countDocuments(filter);

    // Ejecutar query con paginación
    const courses = await query
      .select('-subjects') // Excluir contenido pesado en listados
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 })
      .lean();

    logInfo('Cursos obtenidos', {
      total,
      page,
      limit,
      count: courses.length,
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
      'Cursos obtenidos exitosamente'
    );

  } catch (error) {
    return internalErrorResponse('Error obteniendo los cursos', error);
  }
}

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
 * - 500: Error del servidor
 */
async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Validar datos
    const validationResult = await validateRequest<CreateCourseInput>(
      request,
      createCourseSchema,
      'createCourse'
    );

    if (!validationResult.success) {
      return validateErrorResponse(validationResult.errors);
    }

    const { title, description, status } = validationResult.data;

    // 2. Conectar BD
    await connectDB();

    // 3. Obtener userId desde sesión autenticada
    const userId = await extractUserId(request);
    
    if (!userId) {
      return unauthorizedResponse();
    }

    // 4. Verificar que el usuario existe
    const user = await User.findById(userId).lean();
    if (!user) {
      return notFoundResponse('Usuario');
    }

    // 5. Crear el curso
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
    });

    // 6. Retornar respuesta
    return createdResponse(
      {
        id: newCourse._id.toString(),
        title: newCourse.title,
        description: newCourse.description,
        status: newCourse.status,
        ownerId: newCourse.ownerId.toString(),
        createdAt: newCourse.createdAt,
      },
      'Curso creado exitosamente'
    );

  } catch (error) {
    return internalErrorResponse('Error creando el curso', error);
  }
}

export { GET, POST };
