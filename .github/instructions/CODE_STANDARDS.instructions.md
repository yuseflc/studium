---
description: Describe when these instructions should be loaded by the agent based on task context
# applyTo: 'Describe when these instructions should be loaded by the agent based on task context' # when provided, instructions will automatically be added to the request context when the pattern matches an attached file
---

<!-- Tip: Use /create-instructions in chat to generate content with agent assistance -->

# Estándares de Código - Studium TFG

Guía completa de requisitos mínimos y convenciones para escribir código en este proyecto.

---

## 📋 Tabla de Contenidos
1. [Logging](#logging)
2. [TypeScript y Tipos](#typescript-y-tipos)
3. [Next.js 16 - Convenciones](#nextjs-16---convenciones)
4. [Autenticación](#autenticación)
5. [Base de Datos (MongoDB)](#base-de-datos-mongodb)
6. [React - Server vs Client Components](#react---server-vs-client-components)
7. [Estilos y UI](#estilos-y-ui)
8. [Validación de Datos](#validación-de-datos)
9. [Commits y Versionado](#commits-y-versionado)
10. [Estructura de Carpetas](#estructura-de-carpetas)
11. [Skills y Herramientas](#skills-y-herramientas)
12. [Seguridad](#seguridad)
13. [Rendimiento](#rendimiento)

---

## 🔍 Logging

**REGLA DE ORO: Nunca usar `console.log()`, usar `LOGGER` en su lugar.**

### Importación
```typescript
import { LOGGER, logObject, logError, logDebug, logInfo } from "@/config/logger";
```

### Uso Correcto

```typescript
// ✅ CORRECTO - Para mensajes simples
LOGGER.info("Usuario autenticado");

// ✅ CORRECTO - Para loguear objetos
logObject("Datos del usuario", { id: "123", email: "test@example.com" });

// ✅ CORRECTO - Para errores
logError("Error al conectar a BD", error, { userId: "123" });

// ✅ CORRECTO - Para debug
logDebug("Estado del componente", { isLoading: true, error: null });

// ❌ INCORRECTO - No usar console.log
console.log("Usuario:", user);

// ❌ INCORRECTO - No usar console.error
console.error("Error:", error);
```

### Niveles de Log
- `LOGGER.debug()` - Información detallada para debugging
- `LOGGER.info()` - Información general
- `LOGGER.warn()` - Advertencias
- `LOGGER.error()` - Errores

### Configuración
- **Desarrollo**: Logs formateados con colores (pino-pretty)
- **Producción**: Logs en JSON
- Nivel configurable con env variable `LOG_LEVEL`

---

## 🔤 TypeScript y Tipos

**REGLA: Usar tipos explícitos siempre. Evitar `any`.**

### Interfaces y Types
```typescript
// ✅ CORRECTO - Definir interfaces para datos
interface IUser {
  _id: string;
  email: string;
  firstName: string;
  role: "student" | "teacher" | "admin";
}

// ✅ CORRECTO - Usar type para uniones
type UserRole = "student" | "teacher" | "admin";

// ✅ CORRECTO - Typed function parameters
function processUser(user: IUser, role: UserRole): void {
  // ...
}

// ❌ INCORRECTO - Evitar any
function processData(data: any) { // ❌ NO
  // ...
}
```

### Configuración TypeScript
- `strict: true` - Modo estricto habilitado
- `lib`: DOM e ES2017
- Path alias: `@/*` → `./src/*`

### Tipos Comunes en el Proyecto
```typescript
// Del modelo User
import { IUser } from "@/models/User";

// Del modelo Course
import Course from "@/models/Course";

// NextAuth
import { NextAuthOptions } from "next-auth";
import type { Session } from "next-auth";
```

---

## 🚀 Next.js 16 - Convenciones

**ADVERTENCIA:** Next.js 16 tiene breaking changes. Revisar `node_modules/next/dist/docs/` antes de escribir código.

### App Router
```typescript
// ✅ CORRECTO - Usar App Router (/src/app)
// src/app/mycourses/page.tsx
export default function MyCoursesPage() {
  return <div>My Courses</div>;
}

// ✅ CORRECTO - Layouts para compartir UI
// src/app/mycourses/layout.tsx
export default function Layout({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

// ✅ CORRECTO - Dynamic routes con [slug]
// src/app/course/[slug]/page.tsx
export default function CoursePage({ params }: { params: { slug: string } }) {
  return <div>Curso: {params.slug}</div>;
}
```

### Tipos en Next.js 16
```typescript
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// ✅ API Routes
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // ...
}
```

---

## 🔐 Autenticación

**Usar NextAuth.js v4.24.14 con Credentials Provider y Google OAuth**

### Archivo de Configuración
- Ubicación: `src/config/auth.config.ts`
- Providers: Credentials (base de datos) + Google
- Session: JWT con duración 30 días

### Server Components (Operaciones de BD)
```typescript
// ✅ CORRECTO - Server Component
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB, User } from "@/lib/database";

export default async function UserProfile() {
  // Sin 'use client' - es servidor por defecto
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return <div>No autenticado</div>;
  }

  await connectDB();
  const user = await User.findOne({ email: session.user.email });
  
  return <div>Hola, {user?.firstName}</div>;
}
```

### Client Components (Sin operaciones async)
```typescript
// ✅ CORRECTO - Client Component
'use client';

import { useSession } from "next-auth/react";

export default function UserGreeting() {
  const { data: session, status } = useSession();

  if (status === "loading") return <div>Cargando...</div>;
  if (!session) return <div>No autenticado</div>;

  return <div>Hola, {session.user?.name}</div>;
}
```

### Rutas Protegidas
```typescript
// Definidas en src/config/protectedRoutes.tsx
export const protectedRoutes = [
  "/account",
  "/mycourses",
  "/course",
];
```

---

## 💾 Base de Datos (MongoDB)

**REGLA: Usar Mongoose con MongoDB Atlas. Conectar con `connectDB()` antes de cualquier operación.**

### Importar Conexión y Modelos
```typescript
import { connectDB, User, Course, Task, Submission, Session } from "@/lib/database";
import { LOGGER } from "@/config/logger";

// ✅ CORRECTO - Conectar antes de operar
export async function GET() {
  try {
    await connectDB();
    
    const users = await User.find({}).lean();
    LOGGER.info("Usuarios obtenidos", { count: users.length });
    
    return NextResponse.json({ users });
  } catch (error) {
    logError("Error al obtener usuarios", error as Error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
```

### Operaciones Comunes

```typescript
// CREATE
const newUser = new User({ email, firstName, password });
await newUser.save();

// READ - Un documento
const user = await User.findOne({ email });
const userById = await User.findById(userId);

// READ - Múltiples
const users = await User.find({ role: "student" }).select("-password");

// READ - Lean (sin métodos, más rápido)
const users = await User.find({}).lean();

// UPDATE
await User.updateOne({ _id: userId }, { firstName: "NewName" });

// DELETE
await User.deleteOne({ _id: userId });
```

### Modelos Disponibles
- **User**: Usuarios del sistema
- **Course**: Cursos
- **Task**: Tareas/Actividades
- **Submission**: Entregas
- **Session**: Sesiones autenticadas

### Variables de Entorno
```
MONGODB_URI_PROD=mongodb+srv://...
MONGODB_URI_DEV=mongodb://localhost:27017/studium
LOG_LEVEL=info
```

---

## ⚛️ React - Server vs Client Components

### Server Components (Sin 'use client')
- ✅ Pueden acceder a BD
- ✅ Pueden usar getServerSession
- ✅ Pueden usar variables de entorno
- ❌ No pueden usar hooks (useState, useEffect)
- ❌ No pueden usar event listeners

```typescript
// ✅ CORRECTO
export default async function ServerComponent() {
  const data = await fetchData();
  return <div>{data}</div>;
}
```

### Client Components (Con 'use client')
- ✅ Pueden usar hooks (useState, useEffect)
- ✅ Pueden usar event listeners
- ✅ Pueden usar context
- ❌ No pueden acceder directamente a BD
- ❌ No pueden usar getServerSession

```typescript
// ✅ CORRECTO
'use client';

import { useState } from 'react';

export default function ClientComponent() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

### Pasar Datos de Servidor a Cliente
```typescript
// ✅ CORRECTO - Servidor obtiene datos, cliente los renderiza
export default async function Page() {
  const data = await fetchData();
  return <ClientComponent initialData={data} />;
}

'use client';
interface Props {
  initialData: any;
}
export default function ClientComponent({ initialData }: Props) {
  const [data, setData] = useState(initialData);
  // ...
}
```

---

## 🎨 Estilos y UI

### Framework de Estilos
- **Tailwind CSS v4** (PostCSS)
- **DaisyUI v5.5.19** - Componentes pre-estilizados
- **Lucide React** - Iconos vectoriales
- **Tabler Icons React** - Más iconos

### Utility para Clases
```typescript
import { cn } from "@/lib/utils";

// ✅ CORRECTO - Combinar clases evitando duplicados
<div className={cn(
  "px-4 py-2 rounded",
  isActive && "bg-blue-500",
  error && "border-red-500"
)}>
  Contenido
</div>
```

### Componentes Disponibles
Ubicados en `src/components/ui/`:
- `button.tsx`
- `card.tsx`
- `toggle.tsx`
- `toggle-group.tsx`
- `features.tsx`

### Componentes de Secciones
Ubicados en `src/components/sections/`:
- `Hero.tsx`
- `Features.tsx`
- `FeaturesCard.tsx`
- `Pricing.tsx`
- `Footer.tsx`

### Tema
- **ThemeProvider** en `src/components/providers/ThemeProvider.tsx`
- **ThemeSwitcher** en `src/components/ThemeSwitcher.tsx`
- Usa `theme-change` para cambio dinámico

```typescript
// ✅ CORRECTO - Usar componentes existentes
import { Button } from "@/components/ui/button";

<Button variant="primary" size="lg">
  Enviar
</Button>
```

---

## ✔️ Validación de Datos

**REGLA: Validar SIEMPRE los datos de entrada.**

### Validación en API Routes
```typescript
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, firstName } = body;

    // ✅ CORRECTO - Validar datos requeridos
    if (!email || !password || !firstName) {
      return NextResponse.json(
        { error: "Email, password y firstName son requeridos" },
        { status: 400 }
      );
    }

    // ✅ CORRECTO - Validar formato
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Email inválido" },
        { status: 400 }
      );
    }

    // ✅ CORRECTO - Validar longitud
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password debe tener al menos 8 caracteres" },
        { status: 400 }
      );
    }

    // ... continuar con lógica
  } catch (error) {
    logError("Error en POST", error as Error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
```

### Validación en Formularios
```typescript
'use client';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!email) newErrors.email = "Email es requerido";
    if (!password) newErrors.password = "Password es requerido";
    if (password.length < 8) newErrors.password = "Mínimo 8 caracteres";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    // ... enviar formulario
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      {errors.email && <span className="text-red-500">{errors.email}</span>}
    </form>
  );
}
```

---

## 📝 Commits y Versionado

**Convenciones de commits definidas en COMMITS.md**

### Prefijos Permitidos
1. **[Upgrade]** - Nuevas funcionalidades o mejoras significativas
   ```
   [Upgrade] Añadido sistema de autenticación JWT
   [Upgrade] Refactorización del módulo de pagos
   ```

2. **[Update]** - Ajustes menores y optimizaciones
   ```
   [Update] Ajustado estilo del header
   [Update] Reorganizados componentes en /ui
   ```

3. **[Fix]** - Corrección de errores
   ```
   [Fix] Solucionado error al cargar usuarios
   [Fix] Corregido fallo en validación del formulario
   ```

4. **[Docs]** - Documentación
   ```
   [Docs] Añadida guía de instalación
   [Docs] Actualizada documentación de API
   ```

### Buenas Prácticas
- Commits pequeños y atómicos
- Mensajes claros y descriptivos
- Revisar cambios antes de hacer commit

---

## 📁 Estructura de Carpetas

```
src/
├── app/                          # App Router (Next.js)
│   ├── globals.css              # Estilos globales
│   ├── layout.tsx               # Layout raíz
│   ├── (landing)/               # Grupo de rutas landing
│   ├── account/                 # Rutas protegidas
│   ├── auth/                    # Rutas de autenticación
│   ├── mycourses/               # Rutas de cursos
│   └── api/                     # API Routes
│
├── components/                   # Componentes React reutilizables
│   ├── auth/                    # Formularios de autenticación
│   ├── sections/                # Secciones de página
│   ├── ui/                      # Componentes base UI
│   ├── providers/               # Context providers
│   └── Navbars/                 # Componentes de navegación
│
├── config/                      # Configuraciones
│   ├── auth.config.ts          # NextAuth config
│   ├── logger.tsx              # Logger (Pino)
│   ├── fonts.tsx               # Fuentes importadas
│   └── protectedRoutes.tsx      # Rutas protegidas
│
├── lib/                         # Utilidades y funciones
│   ├── database.tsx            # Conexión MongoDB + exports
│   ├── mongooseUtils.ts        # Utilidades de Mongoose
│   └── utils.ts                # Funciones helper (cn, etc)
│
├── models/                      # Modelos Mongoose
│   ├── User.tsx
│   ├── Course.tsx
│   ├── Task.tsx
│   ├── Submission.tsx
│   ├── Session.tsx
│   └── index.ts                # Exports centralizados
│
├── providers/                   # Context providers
│   └── SessionProvider.tsx
│
└── seed/                        # Script para popular BD
    ├── data.tsx
    └── seedDatabase.tsx
```

### Reglas de Organización
1. **Componentes reutilizables** → `components/`
2. **Componentes de página específica** → `app/[route]/`
3. **Funciones helper** → `lib/`
4. **Modelos de datos** → `models/`
5. **Configuraciones** → `config/`

---

## 🛠️ Skills y Herramientas

### Cuándo Usar Skills

#### MongoDB Skill
**Cuándo**: Diseñar schemas, escribir queries, aggregation pipelines, optimizar performance

```typescript
// Skill triggers:
// - MongoDB, Mongoose, NoSQL
// - Aggregation pipeline
// - Document database
// - MongoDB Atlas

// ✅ Usar skill para: queries complejas, pipelines de agregación
```

#### Vercel React Best Practices
**Cuándo**: Optimizar componentes React, rendimiento, bundle size

```typescript
// Skill triggers:
// - React components, Next.js pages
// - Data fetching optimization
// - Bundle optimization
// - Performance improvements
```

#### Shadcn Skill
**Cuándo**: Trabajar con shadcn/ui components (si se implementa)

```typescript
// Este proyecto usa DaisyUI, no shadcn
// Pero si se cambia a shadcn, usar skill
```

### Uso de Skills en Prompt
```
"Usando la skill MongoDB, optimiza esta query..."
"Implementa este componente siguiendo las best practices de React de Vercel..."
```

---

## 🔒 Seguridad

### Contraseñas
```typescript
// ✅ CORRECTO - Usar bcrypt (ya integrado en User model)
const user = new User({ email, firstName, password });
await user.save(); // Se hashea automáticamente

// ✅ CORRECTO - Comparar con método del modelo
const isValid = await user.comparePassword(passwordInput);

// ❌ INCORRECTO - Almacenar en texto plano
const user = new User({ email, password: plainPassword });
```

### Validar Sesiones
```typescript
// ✅ CORRECTO - Validar sesión siempre
const session = await getServerSession(authOptions);
if (!session?.user?.email) {
  return new Response("Unauthorized", { status: 401 });
}
```

### No Exponer Datos Sensibles
```typescript
// ✅ CORRECTO - Excluir contraseña en queries
const user = await User.findOne({ email }).select("+password");

// ✅ CORRECTO - Usar select(-password) para excluir
const users = await User.find().select("-password");

// ❌ INCORRECTO - Retornar contraseña en API
return NextResponse.json({ user }); // Incluye password
```

### Variables de Entorno
```typescript
// ✅ CORRECTO - Usar variables de entorno
const dbUri = process.env.MONGODB_URI_PROD;
const secret = process.env.NEXTAUTH_SECRET;

// ❌ INCORRECTO - Hardcodear secretos
const secret = "my-secret-key";
```

---

## ⚡ Rendimiento

### Code Splitting y Lazy Loading
```typescript
// ✅ CORRECTO - Lazy load componentes pesados
import dynamic from "next/dynamic";

const HeavyComponent = dynamic(() => import("@/components/Heavy"), {
  loading: () => <div>Cargando...</div>,
});

export default function Page() {
  return <HeavyComponent />;
}
```

### Optimización de Imágenes
```typescript
// ✅ CORRECTO - Usar Image de Next.js
import Image from "next/image";

<Image
  src="/image.jpg"
  alt="Descripción"
  width={400}
  height={300}
  priority // Para imágenes above-the-fold
/>

// ❌ INCORRECTO - Usar img HTML
<img src="/image.jpg" alt="..." />
```

### Validar Datos con `.lean()`
```typescript
// ✅ CORRECTO - Sin métodos, más rápido
const users = await User.find().lean();

// Si necesitas métodos
const user = await User.findOne({ _id: userId });
```

### Evitar Queries N+1
```typescript
// ❌ INCORRECTO - Multiple queries en loop
const users = await User.find();
for (const user of users) {
  const courses = await Course.find({ owner: user._id });
}

// ✅ CORRECTO - Una sola query con populate
const users = await User.find().populate("enrolledCourses");
```

### Memoización en Componentes
```typescript
// ✅ CORRECTO - Memoizar componentes costosos
import { memo } from "react";

const MyCourseCard = memo(function MyCourseCard({ course }: Props) {
  return <div>{course.name}</div>;
});

export default MyCourseCard;
```

---

## 📋 Checklist Antes de Hacer Commit

- [ ] Usar `LOGGER` en lugar de `console.log`
- [ ] Todos los tipos están explícitamente definidos (no `any`)
- [ ] Base de datos: Llamar a `connectDB()` antes de operaciones
- [ ] Autenticación: Validar sesión cuando sea necesario
- [ ] Formularios: Validar datos de entrada
- [ ] Seguridad: No exponer contraseñas en respuestas
- [ ] Componentes: Decidir correctamente entre Server/Client
- [ ] Estilos: Usar `cn()` para combinar clases
- [ ] Testing: Probar flujos de error y éxito
- [ ] Commits: Usar prefijo correcto ([Upgrade], [Fix], etc)
- [ ] Documentación: Comentarios para lógica compleja

---

## 🚀 Comandos Útiles

```bash
# Desarrollo
bun run dev          # Iniciar servidor dev (port 3000)
bun run build        # Build para producción
bun run start        # Iniciar servidor producción

# Linting
bun run lint         # Verificar estilos
```

---

## 📖 Referencias

- **Next.js 16**: `node_modules/next/dist/docs/`
- **NextAuth**: https://next-auth.js.org/
- **Mongoose**: https://mongoosejs.com/
- **Tailwind**: https://tailwindcss.com/
- **DaisyUI**: https://daisyui.com/

---
