import Link from "next/link";
import { CURSOS } from "@/seed/data";

export default function CourseCatalogPage() {
    return (
        <main className="p-8 bg-base-100 min-h-[calc(100vh-64px)] align-center">
            <h1 className="text-4xl font-bold mb-6">Catálogo de cursos</h1>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                {CURSOS.map((c: any) => (
                    <div key={c.id} className="card bg-base-100 shadow-sm border border-base-200">
                        <figure className="aspect-video overflow-hidden">
                            <img
                                src={c.imagen}
                                alt={c.nombre}
                                className="w-full h-full object-cover"
                            />
                        </figure>
                        <div className="card-body p-4">
                            <h2 className="card-title text-lg leading-tight">{c.nombre}</h2>
                            <p className="text-xs text-base-content/80 line-clamp-2">{c.descripcion}</p>
                            <div className="card-actions justify-end mt-2">
                                <Link href={`/mycourses/${c.id}`} className="btn btn-primary btn-sm">
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