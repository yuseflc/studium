# 📚 Guía de Rutas API - Buenas Prácticas

Esta guía te ayuda a crear y editar rutas API manteniendo consistencia, estructura y calidad en todo el proyecto.

---

## 🎯 Principios Fundamentales

### 1. **Respuestas Estandarizadas**
Todas las respuestas API deben seguir la estructura definida en `src/lib/api/types.ts`.

**Respuesta Exitosa:**
```json
{
  "status": "success",
  "code": 200,
  "message": "Descripción clara de lo que pasó",
  "data": { /* tus datos */ },
  "meta": {
    "timestamp": "2026-05-15T10:30:00Z",
    "requestId": "1715764200000-a1b2c3d4e"
  }
}
```

**Respuesta de Error:**
```json
{
  "status": "error",
  "code": 400,
  "message": "Descripción del error",
  "error": {
    "type": "VALIDATION_ERROR",
    "details": { "email": ["Email inválido"] }
  },
  "meta": {
    "timestamp": "2026-05-15T10:30:00Z",
    "requestId": "1715764200000-a1b2c3d4e"
  }
}
```

---

## 🛠️ Herramientas Disponibles

### Response Handlers (en `src/lib/api/response-handler.ts`)

```typescript
// Respuesta exitosa
successResponse(data, message, statusCode)

// Recurso creado (201)
createdResponse(data, message)

// Validación fallida
validationErrorResponse(errors)

// No encontrado
notFoundResponse(resourceName)

// Conflicto (ya existe)
conflictResponse(message, details)

// No autorizado
unauthorizedResponse()

// Prohibido
forbiddenResponse()

// Error interno
internalErrorResponse(message, error)

// Error de base de datos
databaseErrorResponse()
```

### Middleware y Utilidades (en `src/lib/api/middleware.ts`)

```typescript
// Manejar errores automáticamente
withErrorHandling(handler, method)

// Extraer token JWT
extractAuthToken(request)

// Validar JSON en request
isValidJson(request)

// Generar ID para request
generateRequestId()
```

---

## 📝 Estructura Estándar de una Ruta

### Template Básico

```typescript
import { NextRequest, NextResponse } from 'next/server';
import {
  successResponse,
  validationErrorResponse,
  notFoundResponse,
  internalErrorResponse
} from '@/lib/api/response-handler';
import { withErrorHandling } from '@/lib/api/middleware';
import { connectDB } from '@/lib/database/database';
import { logInfo, logError } from '@/config/logger';

// Validar request
import { validateRequest } from '@/lib/validators/api-validation';
import { yourSchema } from '@/lib/validators/validators';

/**
 * POST /api/your-route
 * Descripción clara de qué hace este endpoint
 * 
 * Body esperado:
 * ```
 * {
 *   field1: string
 *   field2: number
 * }
 * ```
 * 
 * Respuestas:
 * - 201: Recurso creado exitosamente
 * - 400: Validación fallida
 * - 500: Error del servidor
 */
async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // 1️⃣ VALIDAR DATOS DE ENTRADA
    const validationResult = await validateRequest(request, yourSchema);
    
    if (!validationResult.success) {
      return validationErrorResponse(validationResult.errors);
    }
    
    const { field1, field2 } = validationResult.data;

    // 2️⃣ CONECTAR A BASE DE DATOS
    await connectDB();

    // 3️⃣ LÓGICA DE NEGOCIO
    logInfo('Iniciando operación', { field1 });
    
    // Tus operaciones aquí...
    const result = await someOperation(field1, field2);

    // 4️⃣ RETORNAR RESPUESTA EXITOSA
    logInfo('Operación completada', { id: result._id });
    return createdResponse(
      {
        id: result._id.toString(),
        field1: result.field1,
        // No incluyas campos sensibles como contraseñas
      },
      'Recurso creado exitosamente'
    );

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
    return internalErrorResponse('Error procesando la solicitud', error);
  }
}

export { POST };
```

---

## ✅ Checklist antes de Crear/Editar una Ruta

- [ ] **Documentación**: Añadido comentario JSDoc con descripción, body esperado y respuestas
- [ ] **Validación**: Implementada validación del request con esquema
- [ ] **Respuestas Consistentes**: Usando funciones de `response-handler`
- [ ] **Error Handling**: Try-catch implementado, usando `internalErrorResponse` para errores inesperados
- [ ] **Logging**: `logInfo` y `logError` en puntos clave
- [ ] **Seguridad**: 
  - No devolvemos datos sensibles (contraseñas, tokens)
  - Validamos permisos si aplica
  - Sanitizamos inputs
- [ ] **Tipos**: TypeScript bien tipado, no usar `any`
- [ ] **Base de Datos**: 
  - `connectDB()` llamado
  - Métodos `.lean()` cuando no necesites guardar cambios
  - Manejo de campos virtuales si aplica

---

## 🔄 Patrones Comunes

### Operación GET (Obtener recurso)

```typescript
async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    await connectDB();

    // Obtener ID de los query params
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return validationErrorResponse({ id: ['ID requerido'] });
    }

    const resource = await Resource.findById(id).lean();

    if (!resource) {
      return notFoundResponse('Recurso');
    }

    return successResponse(resource, 'Recurso obtenido exitosamente');
  } catch (error) {
    return internalErrorResponse('Error obteniendo el recurso', error);
  }
}

export { GET };
```

### Operación DELETE (Eliminar recurso)

```typescript
async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return validationErrorResponse({ id: ['ID requerido'] });
    }

    const resource = await Resource.findByIdAndDelete(id);

    if (!resource) {
      return notFoundResponse('Recurso');
    }

    logInfo('Recurso eliminado', { id });
    return successResponse(null, 'Recurso eliminado exitosamente');
  } catch (error) {
    return internalErrorResponse('Error eliminando el recurso', error);
  }
}

export { DELETE };
```

### Operación PATCH (Actualizar recurso)

```typescript
async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const validationResult = await validateRequest(request, updateSchema);
    
    if (!validationResult.success) {
      return validationErrorResponse(validationResult.errors);
    }

    await connectDB();

    const { id, ...updateData } = validationResult.data;

    const resource = await Resource.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).lean();

    if (!resource) {
      return notFoundResponse('Recurso');
    }

    logInfo('Recurso actualizado', { id });
    return successResponse(resource, 'Recurso actualizado exitosamente');
  } catch (error) {
    return internalErrorResponse('Error actualizando el recurso', error);
  }
}

export { PATCH };
```

---

## 📊 Códigos HTTP Estándar

| Código | Cuándo Usar | Helper |
|--------|-----------|--------|
| **200** | Operación exitosa GET/PATCH | `successResponse()` |
| **201** | Recurso creado exitosamente | `createdResponse()` |
| **400** | Validación fallida, datos inválidos | `validationErrorResponse()` |
| **401** | Usuario no autenticado | `unauthorizedResponse()` |
| **403** | Usuario sin permisos | `forbiddenResponse()` |
| **404** | Recurso no encontrado | `notFoundResponse()` |
| **409** | Conflicto (ej: email duplicado) | `conflictResponse()` |
| **500** | Error interno del servidor | `internalErrorResponse()` |

---

## 🚀 Ejemplo Completo: Crear un Curso

```typescript
import { NextRequest, NextResponse } from 'next/server';
import {
  createdResponse,
  validationErrorResponse,
  conflictResponse,
  internalErrorResponse
} from '@/lib/api/response-handler';
import { connectDB } from '@/lib/database/database';
import { validateRequest } from '@/lib/validators/api-validation';
import { createCourseSchema } from '@/lib/validators/validators';
import { Course, User } from '@/models/index';
import { logInfo, logError } from '@/config/logger';

/**
 * POST /api/courses
 * Crea un nuevo curso
 * 
 * Body esperado:
 * ```
 * {
 *   title: string (requerido)
 *   description: string
 *   thumbnail: string (URL)
 *   creatorId: string (ID del usuario creador)
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
    // 1️⃣ Validar entrada
    const validationResult = await validateRequest(request, createCourseSchema);
    
    if (!validationResult.success) {
      return validationErrorResponse(validationResult.errors);
    }

    const { title, description, thumbnail, creatorId } = validationResult.data;

    // 2️⃣ Conectar BD
    await connectDB();

    // 3️⃣ Verificar que el usuario existe
    const creator = await User.findById(creatorId).lean();
    if (!creator) {
      return notFoundResponse('Usuario creador');
    }

    // 4️⃣ Crear curso
    const newCourse = new Course({
      title: title.trim(),
      description: description?.trim(),
      thumbnail,
      creator: creatorId,
      createdAt: new Date(),
      status: 'draft'
    });

    await newCourse.save();

    logInfo('Curso creado exitosamente', {
      courseId: newCourse._id.toString(),
      creator: creatorId
    });

    // 5️⃣ Retornar respuesta
    return createdResponse(
      {
        id: newCourse._id.toString(),
        title: newCourse.title,
        description: newCourse.description,
        status: newCourse.status
      },
      'Curso creado exitosamente'
    );

  } catch (error) {
    return internalErrorResponse('Error creando el curso', error);
  }
}

export { POST };
```

---

## 💡 Tips y Mejores Prácticas

### ✨ Siempre Sanitiza y Valida
```typescript
// ❌ Malo
const name = data.name;

// ✅ Bueno
const name = data.name.trim().toLowerCase();
```

### 🔐 Nunca Exposes Datos Sensibles
```typescript
// ❌ Malo
return successResponse(user); // Incluye password, refreshToken, etc

// ✅ Bueno
return successResponse({
  id: user._id.toString(),
  email: user.email,
  role: user.role
});
```

### 📝 Logea Operaciones Importantes
```typescript
logInfo('Usuario registrado', {
  userId: newUser._id.toString(),
  email: newUser.email
});
```

### 🛡️ Valida Datos de Entrada Siempre
```typescript
// Usa esquemas Zod definidos en src/lib/validators/validators.ts
const validationResult = await validateRequest(request, signupSchema);
if (!validationResult.success) {
  return validationErrorResponse(validationResult.errors);
}
```

### 📊 Usa .lean() Cuando No Necesites Guardar
```typescript
// Mejora performance para queries de lectura
const users = await User.find({}).lean();
```

---

## 🔗 Recursos Relacionados

- **Validadores**: [src/lib/validators/validators.ts](../../../src/lib/validators/validators.ts)
- **Response Handler**: [src/lib/api/response-handler.ts](../../../src/lib/api/response-handler.ts)
- **Types API**: [src/lib/api/types.ts](../../../src/lib/api/types.ts)
- **Logger**: [src/config/logger.tsx](../../../src/config/logger.tsx)

---

## ❓ Preguntas Frecuentes

### ¿Qué diferencia hay entre `successResponse()` y `createdResponse()`?
- `successResponse()`: Usa HTTP 200 (operaciones GET, PATCH)
- `createdResponse()`: Usa HTTP 201 (POST que crea recursos)

### ¿Cuándo usar `.lean()` en queries?
Siempre que sea una operación de lectura y no necesites métodos de instancia de Mongoose.

### ¿Cómo valido relaciones entre documentos?
Antes de crear/actualizar, verifica que el documento relacionado existe:
```typescript
const relatedDoc = await RelatedModel.findById(relatedId).lean();
if (!relatedDoc) return notFoundResponse('Recurso relacionado');
```

### ¿Puedo usar `try-catch` alrededor del `connectDB()`?
Sí, pero generalmente `connectDB()` ya maneja errores internamente. El `try-catch` exterior captura errores inesperados.

---

**Última actualización**: Mayo 2026
**Versión**: 1.0.0
