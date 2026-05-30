import { getServerSession } from "next-auth/next";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen, Download, FileText, Link2, Sparkles } from "lucide-react";
import { authOptions } from "@/config/auth.config";
import { validateCourseAccess } from "@/app/actions/courseActions";
import { getCourseFullStructure } from "@/lib/api/course-helpers";

export const dynamic = "force-dynamic";

function getResourceTypeLabel(type: string) {
  if (type === "file") return "Archivo";
  if (type === "link") return "Enlace";
  return "Texto";
}

function getResourceTypeIcon(type: string) {
  if (type === "file") return <FileText size={18} aria-hidden="true" />;
  if (type === "link") return <Link2 size={18} aria-hidden="true" />;
  return <Sparkles size={18} aria-hidden="true" />;
}

export default async function CourseResourcesPage({ params }: { params: Promise<{ courseid: string }> }) {
  const { courseid } = await params;

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect("/auth/login");
  }

  const hasAccess = await validateCourseAccess(courseid);
  if (!hasAccess) {
    redirect("/mycourses");
  }

  const structure = await getCourseFullStructure(courseid);
  if (!structure) {
    notFound();
  }

  const resourcesByUnit = (structure.units || []).flatMap((unit: any) =>
    (unit.resources || []).map((resource: any) => ({
      ...resource,
      unitTitle: unit.title,
      unitId: unit._id,
    }))
  );

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-base-200/40">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link href={`/mycourses/${courseid}`} className="btn btn-ghost btn-sm gap-2">
            <ArrowLeft size={16} />
            Volver al curso
          </Link>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-base-content/40">
            <BookOpen size={14} />
            Biblioteca de recursos
          </div>
        </div>

        <section className="card border border-base-300 bg-base-100 shadow-xl">
          <div className="card-body gap-6 p-6 sm:p-8">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-base-content/50">Recursos del curso</p>
              <h1 className="text-3xl font-bold tracking-tight text-base-content sm:text-5xl">Vista general de materiales</h1>
              <p className="max-w-3xl text-base-content/70">
                Revisa todos los recursos del curso, entra a su vista previa y descarga los archivos cuando corresponda.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-base-content/40">Total</p>
                <p className="mt-2 text-3xl font-bold text-base-content">{resourcesByUnit.length}</p>
              </div>
              <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-base-content/40">Unidades</p>
                <p className="mt-2 text-3xl font-bold text-base-content">{(structure.units || []).length}</p>
              </div>
              <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-base-content/40">Descargables</p>
                <p className="mt-2 text-3xl font-bold text-base-content">{resourcesByUnit.filter((resource) => resource.type === "file").length}</p>
              </div>
            </div>

            <div className="flex justify-end">
              <Link href={`/mycourses/${courseid}/resources/new`} className="btn btn-primary gap-2">
                <Sparkles size={16} />
                Crear recurso
              </Link>
            </div>

            {resourcesByUnit.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-base-300 p-8 text-center text-base-content/60">
                Todavía no hay recursos en este curso.
              </div>
            ) : (
              <div className="space-y-6">
                {structure.units.map((unit: any) => {
                  const unitResources = unit.resources || [];
                  if (unitResources.length === 0) return null;

                  return (
                    <section key={unit._id} className="space-y-3">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-base-content/40">
                        <BookOpen size={14} />
                        {unit.title}
                      </div>
                      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {unitResources.map((resource: any) => (
                          <Link
                            key={resource._id}
                            href={`/mycourses/${courseid}/resources/${resource._id}`}
                            className="group rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
                          >
                            <div className="flex items-start gap-3">
                              <div className="rounded-xl bg-primary/10 p-2 text-primary">
                                {getResourceTypeIcon(resource.type)}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="badge badge-outline badge-sm">{getResourceTypeLabel(resource.type)}</span>
                                  <p className="truncate text-base font-semibold text-base-content">{resource.title}</p>
                                </div>
                                <p className="mt-1 line-clamp-2 text-sm text-base-content/60">
                                  {resource.description || "Sin descripción"}
                                </p>
                              </div>
                            </div>
                            <div className="mt-4 flex items-center justify-between text-xs text-base-content/50">
                              <span>{unit.title}</span>
                              {resource.type === "file" ? <Download size={14} /> : null}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
