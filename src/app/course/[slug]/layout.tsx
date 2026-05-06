import type { Metadata } from "next";
import CourseNavbar from "@/components/ui/Navbars/CourseNavbar";
import Navbar from "@/components/ui/Navbars/Navbar";
import { CURSOS } from "@/seed/data";
import { IconZoomQuestion } from "@tabler/icons-react";


export const metadata: Metadata = {
  title: "Studium UI | Curso",
  description: "Proyecto TFG equipo esquina",
};

export default async function CourseLayout({
  children, params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}>) {
  const { slug } = await params;

  if (!CURSOS.some((c) => c.id === slug)) {
    return (
      <main className="flex-1 h-full flex flex-col items-center justify-center bg-base-100">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="text-base-content/20 mb-4 animate-pulse">
            <IconZoomQuestion size={100} stroke={1.5} />
          </div>
          <h1 className="text-3xl font-bold text-center text-base-content font-sans">Curso no encontrado</h1>
          <p className="text-center text-base-content/80 mt-2 font-mono">El curso que estás buscando no existe o ha sido eliminado.</p>
          <a href="/courses" className="btn btn-primary mt-6">Volver al catálogo</a>
        </div>
      </main>
    );
  }
  return (
    <div className="min-h-full flex flex-col bg-base-100">
      <CourseNavbar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
