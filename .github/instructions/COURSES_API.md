# 📚 API Cursos - Documentación

> Referencia completa para usar los endpoints CRUD de cursos

## Endpoints Disponibles

### Listar Cursos
```
GET /api/courses
```

**Query Parameters:**
```
- ownerId?: string        // Filtrar por propietario
- status?: string         // draft, active, archived
- search?: string         // Buscar en título y descripción
- limit?: number          // Default: 20, Max: 100
- page?: number           // Default: 1
```

**Respuesta Exitosa (200):**
```json
{
  "status": "success",
  "code": 200,
  "message": "Cursos obtenidos exitosamente",
  "data": {
    "items": [
      {
        "_id": "...",
        "title": "Curso de React",
        "description": "...",
        "status": "active",
        "ownerId": "...",
        "enrollmentCount": 5,
        "createdAt": "2026-05-15T10:30:00Z"
      }
    ],
    "pagination": {
      "total": 10,
      "page": 1,
      "limit": 20,
      "pages": 1
    }
  }
}
```

---

### Crear Curso
```
POST /api/courses
```

**Headers Requeridos:**
```
Content-Type: application/json
Authorization: Bearer <token>  // O cookie de sesión (NextAuth)
```

**Nota:** La autenticación se obtiene automáticamente de la sesión NextAuth.
Para desarrollo/testing, puedes usar el header `x-user-id` (solo en modo desarrollo).

**Body:**
```json
{
  "title": "Curso de Node.js",
  "description": "Aprende Node.js desde cero",
  "status": "draft"  // opcional, default: "draft"
}
```

**Validación:**
- `title`: Requerido, 3-200 caracteres
- `description`: Opcional, máx 1000 caracteres
- `status`: Opcional, "draft" | "active" | "archived"

**Respuesta Exitosa (201):**
```json
{
  "status": "success",
  "code": 201,
  "message": "Curso creado exitosamente",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "title": "Curso de Node.js",
    "description": "Aprende Node.js desde cero",
    "status": "draft",
    "ownerId": "...",
    "createdAt": "2026-05-15T10:30:00Z"
  }
}
```

---

### Obtener Curso Específico
```
GET /api/courses/:id
```

**Parámetros:**
- `id`: ID del curso (MongoDB ObjectId)

**Respuesta Exitosa (200):**
```json
{
  "status": "success",
  "code": 200,
  "message": "Curso obtenido exitosamente",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "title": "Curso de Node.js",
    "description": "...",
    "status": "active",
    "owner": {
      "_id": "...",
      "email": "profesor@example.com",
      "firstName": "Juan"
    },
    "teachers": [],
    "enrolledStudents": [
      {
        "_id": "...",
        "email": "estudiante@example.com",
        "firstName": "Pedro"
      }
    ],
    "subjects": [],
    "enrollmentCount": 1,
    "createdAt": "2026-05-15T10:30:00Z",
    "updatedAt": "2026-05-15T10:30:00Z"
  }
}
```

---

### Actualizar Curso
```
PATCH /api/courses/:id
```

**Headers Requeridos:**
```
Content-Type: application/json
Authorization: Bearer <token>  // O cookie de sesión (NextAuth)
```

**Nota:** Solo el propietario o un profesor del curso pueden actualizar.
Validado automáticamente desde la sesión autenticada.

**Body (todos los campos opcionales):**
```json
{
  "title": "Nuevo título del curso",
  "description": "Nueva descripción",
  "status": "active"
}
```

**Respuesta Exitosa (200):**
```json
{
  "status": "success",
  "code": 200,
  "message": "Curso actualizado exitosamente",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "title": "Nuevo título del curso",
    "description": "Nueva descripción",
    "status": "active",
    "updatedAt": "2026-05-15T11:00:00Z"
  }
}
```

**Errores Comunes:**
- `403 Forbidden`: No eres propietario ni profesor del curso
- `404 Not Found`: El curso no existe

---

### Eliminar Curso
```
DELETE /api/courses/:id
```

**Headers Requeridos:**
```
Authorization: Bearer <token>  // O cookie de sesión (NextAuth)
```

**Nota:** Solo el propietario del curso puede eliminar.
Validado automáticamente desde la sesión autenticada.

**Respuesta Exitosa (200):**
```json
{
  "status": "success",
  "code": 200,
  "message": "Curso eliminado exitosamente",
  "data": null
}
```

**Errores Comunes:**
- `403 Forbidden`: Solo el propietario puede eliminar
- `404 Not Found`: El curso no existe

---

## Operaciones Específicas

### Matricular Estudiante
```
POST /api/courses/:id/enroll
```

**Headers Requeridos:**
```
Content-Type: application/json
Authorization: Bearer <token>  // O cookie de sesión (NextAuth)
```

**Body:**
```json
{
  "studentId": "507f1f77bcf86cd799439012"
}
```

**Respuesta Exitosa (200):**
```json
{
  "status": "success",
  "code": 200,
  "message": "Estudiante matriculado exitosamente",
  "data": {
    "courseId": "507f1f77bcf86cd799439011",
    "studentId": "507f1f77bcf86cd799439012",
    "enrollmentCount": 1
  }
}
```

**Errores Comunes:**
- `404 Not Found`: Curso o estudiante no existe
- `409 Conflict`: El estudiante ya está matriculado

---

### Añadir Profesor
```
POST /api/courses/:id/teachers
```

**Headers Requeridos:**
```
Content-Type: application/json
Authorization: Bearer <token>  // O cookie de sesión (NextAuth)
```

**Nota:** Solo el propietario del curso puede añadir profesores.
Validado automáticamente desde la sesión autenticada.

**Body:**
```json
{
  "teacherId": "507f1f77bcf86cd799439013"
}
```

**Respuesta Exitosa (200):**
```json
{
  "status": "success",
  "code": 200,
  "message": "Profesor añadido exitosamente",
  "data": {
    "courseId": "507f1f77bcf86cd799439011",
    "teacherId": "507f1f77bcf86cd799439013",
    "teachersCount": 1
  }
}
```

**Errores Comunes:**
- `403 Forbidden`: No eres el propietario
- `404 Not Found`: Curso o profesor no existe
- `409 Conflict`: Profesor ya está asignado o es el propietario

---

### Eliminar Profesor
```
DELETE /api/courses/:id/teachers?teacherId=<id>
```

**Headers Requeridos:**
```
Authorization: Bearer <token>  // O cookie de sesión (NextAuth)
```

**Nota:** Solo el propietario del curso puede eliminar profesores.
Validado automáticamente desde la sesión autenticada.

**Query Parameters:**
- `teacherId`: ID del profesor a eliminar

**Respuesta Exitosa (200):**
```json
{
  "status": "success",
  "code": 200,
  "message": "Profesor eliminado exitosamente",
  "data": {
    "courseId": "507f1f77bcf86cd799439011",
    "teacherId": "507f1f77bcf86cd799439013",
    "teachersCount": 0
  }
}
```

---

## Códigos HTTP

| Código | Significado | Endpoint(s) |
|--------|-------------|-----------|
| 200 | OK | GET, PATCH, POST (enroll/teachers) |
| 201 | Created | POST (crear curso) |
| 400 | Validación fallida | Todos |
| 403 | Acceso prohibido | PATCH, DELETE, POST (teachers) |
| 404 | No encontrado | GET, PATCH, DELETE, POST, DELETE |
| 409 | Conflicto (ya existe) | POST (enroll/teachers) |
| 500 | Error del servidor | Todos |

---

## Ejemplos cURL

### Crear un curso (con sesión autenticada)
```bash
# En producción con NextAuth
curl -X POST http://localhost:3000/api/courses \
  -H "Content-Type: application/json" \
  -b "sessionToken=..." \
  -d '{
    "title": "Curso de JavaScript",
    "description": "Aprende JavaScript moderno",
    "status": "active"
  }'

# En desarrollo con x-user-id (header temporal)
curl -X POST http://localhost:3000/api/courses \
  -H "Content-Type: application/json" \
  -H "x-user-id: 507f1f77bcf86cd799439011" \
  -d '{
    "title": "Curso de JavaScript",
    "description": "Aprende JavaScript moderno",
    "status": "active"
  }'
```

### Listar cursos
```bash
curl http://localhost:3000/api/courses?status=active&limit=10
```

### Obtener curso específico
```bash
curl http://localhost:3000/api/courses/507f1f77bcf86cd799439011
```

### Actualizar curso
```bash
curl -X PATCH http://localhost:3000/api/courses/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -H "x-user-id: 507f1f77bcf86cd799439011" \
  -d '{"status": "archived"}'
```

### Matricular estudiante
```bash
curl -X POST http://localhost:3000/api/courses/507f1f77bcf86cd799439011/enroll \
  -H "Content-Type: application/json" \
  -d '{"studentId": "507f1f77bcf86cd799439012"}'
```

### Añadir profesor
```bash
curl -X POST http://localhost:3000/api/courses/507f1f77bcf86cd799439011/teachers \
  -H "Content-Type: application/json" \
  -H "x-user-id: 507f1f77bcf86cd799439011" \
  -d '{"teacherId": "507f1f77bcf86cd799439013"}'
```

### Eliminar profesor
```bash
curl -X DELETE "http://localhost:3000/api/courses/507f1f77bcf86cd799439011/teachers?teacherId=507f1f77bcf86cd799439013" \
  -H "x-user-id: 507f1f77bcf86cd799439011"
```

---

## Estructura de Directorios de Rutas

```
src/app/api/courses/
├── route.ts                    # GET (listar), POST (crear)
└── [id]/
    ├── route.ts                # GET (detalles), PATCH, DELETE
    ├── enroll/
    │   └── route.ts            # POST (matricular estudiante)
    └── teachers/
        └── route.ts            # POST (añadir), DELETE (eliminar)
```

---

**Última actualización**: Mayo 2026  
**Versión**: 1.0.0
