import Link from "next/link";
import { CURSOS } from "@/seed/data";

export default function CourseCatalogPage() {
  return (
    <main className="p-8 bg-base-100 min-h-[calc(100vh-64px)]">
      <h1 className="text-4xl font-bold mb-6">Catálogo de cursos</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {CURSOS.map((c: any) => (
          <div key={c.id} className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h2 className="card-title text-base-content">{c.nombre}</h2>
              <p className="text-sm text-base-content/80">{c.descripcion}</p>
              <div className="card-actions justify-end">
                <Link href={`/course/${c.id}`} className="btn btn-primary">
                  Ver curso
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}