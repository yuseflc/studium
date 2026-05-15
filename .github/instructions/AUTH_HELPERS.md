# 🔐 Autenticación en Rutas API

> Guía sobre cómo funciona la autenticación en los endpoints de cursos y otras rutas

## ¿Cómo Funciona?

Las rutas API obtienen el usuario autenticado usando `extractUserId()`, que:

1. **Producción**: Obtiene la sesión autenticada de NextAuth
   ```typescript
   const session = await getServerSession(authOptions);
   const userId = session?.user?.id;
   ```

2. **Desarrollo/Testing**: Fallback opcional al header `x-user-id`
   ```typescript
   // Solo si NODE_ENV === 'development'
   const userId = request.headers.get('x-user-id');
   ```

---

## Importar y Usar

### En una Ruta API

```typescript
import { extractUserId } from '@/lib/api/auth-helpers';
import { unauthorizedResponse } from '@/lib/api/response-handler';

async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Obtener usuario autenticado
    const userId = await extractUserId(request);
    
    // Requerido: validar que existe
    if (!userId) {
      return unauthorizedResponse();
    }
    
    // Usar userId en tu lógica...
    await connectDB();
    const user = await User.findById(userId);
    
    // ... resto de la ruta
  } catch (error) {
    return internalErrorResponse('Error', error);
  }
}
```

---

## Funciones Disponibles

### `getAuthSession()`
Obtiene la sesión completa de NextAuth.

```typescript
const session = await getAuthSession();
// { user: { id, email, name, ... }, expires: ... }
```

### `getAuthUserId()`
Obtiene solo el ID del usuario autenticado.

```typescript
const userId = await getAuthUserId();
// "507f1f77bcf86cd799439011" o null
```

### `extractUserId(request)`
**Recomendado**: Combina sesión + fallback a header (desarrollo).

```typescript
const userId = await extractUserId(request);
// ID del usuario o null
```

### `requireAuth()`
Lanza error 401 si no autenticado.

```typescript
try {
  const userId = await requireAuth();
  // userId garantizado, sino lanza unauthorizedResponse()
} catch (error) {
  return error; // NextResponse 401
}
```

### `requireAuthMiddleware(request)`
Combina `extractUserId()` + `requireAuth()`.

```typescript
const userId = await requireAuthMiddleware(request);
// ID del usuario o lanza unauthorizedResponse()
```

---

## En Producción

### ✅ Lo Correcto
```typescript
import { extractUserId } from '@/lib/api/auth-helpers';

async function POST(request: NextRequest): Promise<NextResponse> {
  const userId = await extractUserId(request);
  
  if (!userId) {
    return unauthorizedResponse();
  }
  
  // ... usar userId
}
```

**Resultado**: Usuario viene de sesión NextAuth autenticada.

---

## En Desarrollo/Testing

### Opción 1: Con x-user-id Header (más fácil)
```bash
curl -X POST http://localhost:3000/api/courses \
  -H "Content-Type: application/json" \
  -H "x-user-id: 507f1f77bcf86cd799439011" \
  -d '{"title": "Curso"}'
```

**Nota**: Solo funciona en `NODE_ENV=development`.

### Opción 2: Con Sesión Autenticada (realista)
```bash
# 1. Login en http://localhost:3000/api/auth/signin
# 2. Se crea cookie de sesión automáticamente
# 3. Los requests posteriores incluyen la cookie

curl -X POST http://localhost:3000/api/courses \
  -H "Content-Type: application/json" \
  -b "sessionToken=..." \
  -d '{"title": "Curso"}'
```

---

## Control de Acceso

Después de obtener `userId`, puedes verificar permisos:

```typescript
const userId = await extractUserId(request);

if (!userId) {
  return unauthorizedResponse();
}

await connectDB();
const course = await Course.findById(courseId);

// ✅ Solo propietario puede editar
if (course.ownerId.toString() !== userId) {
  return forbiddenResponse();
}

// ... editar curso
```

---

## Patrones Comunes

### Verificar que Usuario Existe
```typescript
const userId = await extractUserId(request);

if (!userId) {
  return unauthorizedResponse();
}

const user = await User.findById(userId).lean();

if (!user) {
  return notFoundResponse('Usuario');
}
```

### Verificar Permisos en Array
```typescript
// Usuario es propietario O profesor
const isOwner = course.ownerId.toString() === userId;
const isTeacher = course.teachers.some(
  (teacherId: mongoose.Types.ObjectId) => teacherId.toString() === userId
);

if (!isOwner && !isTeacher) {
  return forbiddenResponse();
}
```

### Logging con Usuario
```typescript
logInfo('Curso creado', {
  courseId: newCourse._id.toString(),
  userId,  // ID del usuario que lo creó
  title: newCourse.title,
});
```

---

## Migración de x-user-id

Si tienes código antiguo que usa headers:

### ❌ Antes
```typescript
const userId = request.headers.get('x-user-id');
```

### ✅ Después
```typescript
const userId = await extractUserId(request);
```

---

## Troubleshooting

### "userId es null"
**Causa**: Usuario no autenticado.

**Solución**:
1. En desarrollo: Añade header `x-user-id` al request
2. En producción: Asegúrate que NextAuth está correctamente configurado
3. Verifica que `session.user.id` existe en auth.config.ts

### "No puedo obtener la sesión"
**Causa**: NextAuth no está disponible o secreto no configurado.

**Solución**:
```bash
# Verifica NEXTAUTH_SECRET
echo $NEXTAUTH_SECRET

# Reinicia servidor
npm run dev
```

### "Siempre retorna 401"
**Causa**: `extractUserId()` nunca devuelve nada.

**Solución**:
1. Verifica que el usuario está logged in
2. En desarrollo, usa `x-user-id` header
3. Revisa los logs: `logInfo()` debería mostrar userId

---

## Seguridad

⚠️ **Importante**: Nunca confíes solo en headers personalizados en producción.

- ✅ NextAuth + sesión = **Seguro**
- ⚠️  Header personalizado = **Solo desarrollo**

El fallback a `x-user-id` se deshabilita automáticamente si:
- `process.env.NODE_ENV !== 'development'`
- No hay sesión autenticada

---

**Última actualización**: Mayo 2026  
**Versión**: 1.0.0
