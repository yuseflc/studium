import { CURSOS } from "@/seed/data";

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const curso: any = CURSOS.find((c) => c.id === slug);
  return (
    <main className="p-8 bg-base-100 min-h-[calc(100vh-64px)]">
      <h1 className="text-4xl font-bold text-base-content font-sans">
        Bienvenido al curso: {curso.nombre}
      </h1>
      <div className="mt-4 p-6 bg-base-200 rounded-box border border-base-300">
        <p className="text-base-content/80">
          Aquí puedes ver el contenido del curso y gestionar tus actividades académicas.
        </p>
      </div>
    </main>
  );
}
