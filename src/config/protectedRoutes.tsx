/* Archivo: src\config\protectedRoutes.tsx
    Descripción: Lista y utilidades para rutas protegidas; comprueba roles y permisos. */

// Rutas que requieren autenticación; usadas por middleware/protecciones
export const protectedRoutes = [
    "/account",
    "/mycourses",
    "/course",
    "/api/courses",
]