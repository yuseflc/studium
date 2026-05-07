// Este page.tsx se emcarga de manejar las rutasde /mycourses/coure-(id) osea el dettalle de un curso

import { CURSOS } from "@/seed/data";

export default async function MyCoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const curso: any = CURSOS.find((c) => c.id === slug);

  // 404
  if (!curso) {
    return (
      <main className="p-8 bg-base-100 min-h-[calc(100vh-64px)]">
        <h1 className="text-3xl font-bold">Curso no encontrado</h1>
        <p className="text-base-content/80 mt-2">El curso que buscas no existe.</p>
      </main>
    );
  }

  return (
    <main className="p-8 bg-base-100 min-h-[calc(100vh-64px)]">
      <h1 className="text-4xl font-bold">{curso.nombre}</h1>
      <div className="mt-4 p-6 bg-base-200 rounded-box border border-base-300">
        <p className="text-base-content/80">{curso.descripcion ?? "Sin descripción."}</p>
      </div>
    </main>
  );
}