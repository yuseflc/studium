// src/app/not-found.tsx
// Página de error 404 - Se muestra cuando un usuario intenta acceder a una ruta que no existe

import Link from "next/link";
import Navbar from "@/components/navbars/Navbar";

/**
 * Componente NotFound
 * 
 * Se renderiza automáticamente cuando:
 * 1. Un usuario visita una URL que no existe en la aplicación
 * 2. Se llama a la función notFound() desde cualquier Server Component
 * 3. Next.js no encuentra una ruta coincidente en el enrutador
 * 
 * @returns {JSX.Element} Página de error 404 con navegación y opciones de recuperación
 */
export default function NotFound() {
  return (
    <>
      {/* 
        Navbar - Barra de navegación principal
        Se importa desde @/components/navbars/Navbar
        Mantiene la consistencia visual con el resto de la aplicación
        Permite al usuario navegar a otras secciones incluso en la página de error
      */}
      <Navbar />

      {/* 
        Contenedor principal del contenido 404
      */}
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 py-20">
        
        {/* 
          Caja central del contenido
        */}
        <div className="text-center max-w-2xl mx-auto space-y-8">
          
          {/* ========== SECCIÓN DEL NÚMERO 404 ========== */}
          <div className="space-y-2">
            {/* 
              Número 404 principal
            */}
            <h1 className="text-8xl md:text-9xl font-bold text-primary/20">
              404
            </h1>
            
            {/* 
              Línea decorativa debajo del 404
            */}
            <div className="h-1 w-20 bg-primary/30 mx-auto rounded-full" />
          </div>

          {/* ========== SECCIÓN DEL MENSAJE PRINCIPAL ========== */}
          <div className="space-y-4">
            {/* 
              Título del error
            */}
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              ¡Ups! No encontramos esta página
            </h2>
            
            {/* 
              Descripción del error
            */}
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              La página que buscas no existe o ha sido movida a otra ubicación.
              Pero no te preocupes, puedes seguir aprendiendo desde aquí.
            </p>
          </div>

          {/* ========== SECCIÓN DE BOTONES DE ACCIÓN ========== */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            {/* 
              Botón "Mis Cursos" - Principal
              Lleva al usuario a la sección de sus cursos
              - bg-primary: fondo color primario
            */}
            <Link
              href="/mycourses"
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Mis Cursos
            </Link>

            {/* 
              Botón "Volver al inicio" - Secundario
              Lleva al usuario al landing page principal
            */}
            <Link
              href="/"
              className="px-6 py-3 border border-border rounded-lg font-medium transition-colors"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}