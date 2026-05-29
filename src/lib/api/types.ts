/**
 * Tipos estandarizados para respuestas de API
 */

import mongoose from "mongoose";
// Subject model deprecated; types use normalized unit structures instead
import { IUnit } from "@/models/Unit";
import { IResource } from "@/models/Resource";
import { ITask } from "@/models/Task";

/**
 * Estructura de una unidad poblada con recursos
 */
export interface IUnitWithResources extends Omit<IUnit, 'resourceIds'> {
  resources?: IResource[];
}

/**
 * Estructura de una materia poblada con unidades y tareas
 */
export interface ISubjectWithContent {
    _id: string;
    courseId: string;
    title: string;
    description?: string;
    order: number;
    units: IUnitWithResources[];
    tasks?: ITask[];
}

/**
 * Estructura genérica de curso que puede venir de DB o Seed
 * Flexible para soportar ambas fuentes de datos
 */
export interface CourseStructureGeneric {
    subjects?: any[];
    // Nueva estructura: unidades normalizadas
    units?: any[];
    unitIds?: any[];
  _id?: string | mongoose.Types.ObjectId;
  title?: string;
  description?: string;
  ownerId?: string | mongoose.Types.ObjectId;
  status?: string;
  enrollmentCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Estructura base de respuesta exitosa
 */
export interface ApiSuccessResponse<T = unknown> {
    status: 'success';
    code: number;
    message: string;
    data?: T;
    meta?: {
        timestamp: string;
        requestId?: string;
    };
}

/**
 * Estructura base de respuesta de error
 */
export interface ApiErrorResponse {
    status: 'error';
    code: number;
    message: string;
    error: {
        type: string;
        details?: Record<string, unknown>;
        stack?: string; // Solo en desarrollo
    };
    meta?: {
        timestamp: string;
        requestId?: string;
    };
}

/**
 * Estructura de respuesta paginada
 */
export interface PaginatedData<T> {
    items: T[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}

/**
 * Errores de validación detallados
 */
export interface ValidationErrorDetail {
    [field: string]: string[];
}

/**
 * Tipos de error conocidos
 */
export enum ErrorType {
    VALIDATION = 'VALIDATION_ERROR',
    NOT_FOUND = 'NOT_FOUND',
    UNAUTHORIZED = 'UNAUTHORIZED',
    FORBIDDEN = 'FORBIDDEN',
    CONFLICT = 'CONFLICT',
    INTERNAL = 'INTERNAL_ERROR',
    BAD_REQUEST = 'BAD_REQUEST',
    DATABASE = 'DATABASE_ERROR',
    EXTERNAL_SERVICE = 'EXTERNAL_SERVICE_ERROR'
}

/**
 * Códigos HTTP estándar
 */
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_ERROR: 500,
    SERVICE_UNAVAILABLE: 503
} as const;
