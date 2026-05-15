# 🚀 API Response System - Quick Reference

> Referencia rápida para usar el sistema de respuestas estandarizado

## Importar

```typescript
import {
  successResponse,
  createdResponse,
  validationErrorResponse,
  notFoundResponse,
  conflictResponse,
  internalErrorResponse
} from '@/lib/api';
```

## Respuestas Rápidas

### ✅ Éxito (GET, PATCH)
```typescript
return successResponse(data, "Mensaje");
```

### ✅ Creado (POST)
```typescript
return createdResponse(data, "Mensaje");
```

### ❌ Validación Fallida
```typescript
return validationErrorResponse({ field: ["Error"] });
```

### ❌ No Encontrado
```typescript
return notFoundResponse("Recurso");
```

### ❌ Conflicto (Ya Existe)
```typescript
return conflictResponse("El email ya está registrado");
```

### ❌ Error Interno
```typescript
return internalErrorResponse("Mensaje", error);
```

## Estructura de Respuestas

### Exitosa
```json
{
  "status": "success",
  "code": 201,
  "message": "Usuario registrado exitosamente",
  "data": { "id": "...", "email": "..." },
  "meta": { "timestamp": "...", "requestId": "..." }
}
```

### Error
```json
{
  "status": "error",
  "code": 400,
  "message": "Validación de datos fallida",
  "error": { "type": "VALIDATION_ERROR", "details": { "email": ["Requerido"] } },
  "meta": { "timestamp": "...", "requestId": "..." }
}
```

## Patrón Completo

```typescript
import { NextRequest, NextResponse } from 'next/server';
import {
  createdResponse,
  validationErrorResponse,
  internalErrorResponse
} from '@/lib/api';
import { connectDB } from '@/lib/database/database';
import { validateRequest } from '@/lib/validators/api-validation';
import { schema } from '@/lib/validators/validators';
import { Model } from '@/models/index';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Validar
    const result = await validateRequest(request, schema);
    if (!result.success) {
      return validationErrorResponse(result.errors);
    }

    // 2. Conectar
    await connectDB();

    // 3. Crear/Actualizar
    const item = await Model.create(result.data);

    // 4. Responder
    return createdResponse(item, "Creado exitosamente");

  } catch (error) {
    return internalErrorResponse("Error en operación", error);
  }
}
```

## HTTP Códigos

| Código | Función | Caso |
|--------|---------|------|
| 200 | `successResponse()` | GET, PATCH |
| 201 | `createdResponse()` | POST |
| 400 | `validationErrorResponse()` | Datos inválidos |
| 404 | `notFoundResponse()` | Recurso no existe |
| 409 | `conflictResponse()` | Email duplicado, etc |
| 500 | `internalErrorResponse()` | Error inesperado |

---

**Para documentación completa**: `.github/instructions/API_ROUTES.md`
