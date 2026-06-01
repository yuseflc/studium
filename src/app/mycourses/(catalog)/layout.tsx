/* Archivo: src\app\mycourses\(catalog)\layout.tsx
  Descripción: Layout para las páginas del catálogo de cursos (barra superior y contenedor). */

import type { Metadata } from "next";
import Sidebar from "@/components/ui/navbars/CourseMenuSidebar";
import CourseNavbar from "@/components/ui/navbars/CourseNavbar";
export const metadata: Metadata = {
  title: "Studium UI | Menu",
  description: "Catálogo de cursos",
};

export default async function CoursesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full flex flex-col bg-base-100 h-screen">
      <div className="relative z-50">
        <CourseNavbar />
      </div>
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
