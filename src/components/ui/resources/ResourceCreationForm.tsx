"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, Check, FileText, Link2, ShieldCheck, Sparkles, Upload } from "lucide-react";
import { createResource, updateResource } from "@/app/actions/resourceActions";

interface ResourceCreationFormProps {
  mode?: "create" | "edit";
  courseId: string;
  courseTitle: string;
  courseDescription?: string;
  units: Array<{
    _id: string;
    title: string;
    content?: string;
    order: number;
  }>;
  initialUnitId?: string;
  resourceId?: string;
  backHref?: string;
  backLabel?: string;
  initialTitle?: string;
  initialDescription?: string;
  initialContent?: string;
  initialResourceMode?: ResourceMode;
  initialResourceUrl?: string;
}

type ResourceMode = "file" | "link" | "text";

export default function ResourceCreationForm({
  mode = "create",
  courseId,
  courseTitle,
  courseDescription,
  units,
  initialUnitId,
  resourceId,
  backHref,
  backLabel,
  initialTitle = "",
  initialDescription = "",
  initialContent = "",
  initialResourceMode = "file",
  initialResourceUrl = "",
}: ResourceCreationFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [content, setContent] = useState(initialContent);
  const [resourceUrl, setResourceUrl] = useState(initialResourceUrl);
  const [unitId, setUnitId] = useState(initialUnitId || units[0]?._id || "");
  const [resourceMode, setResourceMode] = useState<ResourceMode>(initialResourceMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [createdResourceId, setCreatedResourceId] = useState<string | null>(null);

  const selectedUnitTitle = useMemo(() => {
    return units.find((unit) => unit._id === unitId)?.title || "Selecciona una unidad";
  }, [unitId, units]);

  const isEditMode = mode === "edit";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Añade un título para el recurso.");
      return;
    }

    if (!unitId) {
      setError("Selecciona una unidad.");
      return;
    }

    if ((resourceMode === "file" || resourceMode === "link") && !resourceUrl.trim()) {
      setError(resourceMode === "file" ? "Indica la URL del archivo." : "Indica la URL del enlace.");
      return;
    }

    if (resourceMode === "text" && !content.trim()) {
      setError("Escribe el contenido del recurso.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditMode) {
        if (!resourceId) {
          setError("No se pudo identificar el recurso.");
          return;
        }

        const result = await updateResource(resourceId, {
          title: title.trim(),
          description: resourceMode === "text" ? description.trim() : description.trim() || undefined,
          content: resourceMode === "text" ? content.trim() : undefined,
          type: resourceMode,
          url: resourceMode === "text" ? undefined : resourceUrl.trim() || undefined,
        });

        if (!result.success || !result.resource) {
          setError(result.error || "No se pudo actualizar el recurso");
          return;
        }

        router.push(`/mycourses/${courseId}/resources/${resourceId}`);
        router.refresh();
        return;
      }

      const result = await createResource({
        courseId,
        unitId,
        title: title.trim(),
        description: description.trim() || undefined,
        content: resourceMode === "text" ? content.trim() : undefined,
        type: resourceMode,
        url: resourceUrl.trim() || undefined,
      });

      if (!result.success || !result.resource) {
        setError(result.error || "No se pudo crear el recurso");
        return;
      }

      setSuccess(true);
      setCreatedResourceId(result.resource._id);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "No se pudo crear el recurso");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRedirect = () => {
    if (!createdResourceId) return;
    router.push(`/mycourses/${courseId}/resources/${createdResourceId}`);
  };

  const pageTitle = isEditMode ? "Editar recurso" : "Crear recurso";
  const pageSubtitle = isEditMode ? "Ajusta el título, el tipo y el contenido del recurso." : "Prepara materiales de apoyo, archivos o enlaces con una vista clara y directa.";
  const actionLabel = isEditMode ? "Guardar cambios" : "Crear recurso";
  const topLabel = isEditMode ? "Edición de recurso" : "Creación de recurso";
  const headerTag = isEditMode ? "Editar recurso" : "Nuevo recurso";
  const backButtonHref = backHref || `/mycourses/${courseId}`;
  const backButtonLabel = backLabel || "Volver al curso";

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-base-200/40">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <button type="button" onClick={() => router.push(backButtonHref)} className="btn btn-ghost btn-sm gap-2">
            <ArrowLeft size={16} />
            {backButtonLabel}
          </button>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-base-content/40">
            <Upload size={14} />
            {topLabel}
          </div>
        </div>

        <section className="card border border-base-300 bg-base-100 shadow-xl">
          <div className="px-6 py-8 sm:px-8">
            <div className="space-y-5">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="badge badge-outline gap-1.5">
                    <BookOpen size={12} />
                    Profesor
                  </span>
                  <span className="badge badge-outline gap-1.5">
                    <ShieldCheck size={12} />
                    Recurso descargable o enlazado
                  </span>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-semibold uppercase tracking-[0.28em] text-base-content/50">{headerTag}</p>
                  <h1 className="w-full text-3xl font-bold tracking-tight text-base-content sm:text-5xl">
                    {pageTitle} en {courseTitle}
                  </h1>
                  <p className="w-full text-base-content/70">
                    {pageSubtitle}
                  </p>
                  {courseDescription ? <p className="w-full text-sm text-base-content/50">{courseDescription}</p> : null}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-3">
                <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-primary/10 p-2 text-primary">
                      <BookOpen size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-base-content/40">Curso</p>
                      <p className="text-sm font-semibold text-base-content">{courseTitle}</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-secondary/10 p-2 text-secondary-content">
                      <BookOpen size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-base-content/40">Unidad</p>
                      <p className="text-sm font-semibold text-base-content">{selectedUnitTitle}</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-success/10 p-2 text-success">
                      <Check size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-base-content/40">Estado</p>
                      <p className="text-sm font-semibold text-success">Listo para publicar</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-6 px-4 py-6 lg:px-8 lg:py-8">
            <section className="card border border-base-300 bg-base-100 shadow-sm">
              <div className="card-body gap-5 p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-base-content">Datos del recurso</h2>
                    <p className="text-sm text-base-content/60">Título, descripción y contenido del material.</p>
                  </div>
                </div>

                <div className="grid gap-4">
                  <label className="form-control gap-2">
                    <span className="label-text font-semibold text-base-content/80">Título del recurso</span>
                    <input
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      className="input input-bordered w-full border-base-300 bg-base-100"
                      placeholder="Ej: Guía del tema 1"
                      disabled={isSubmitting}
                      required
                    />
                  </label>

                  <label className="form-control gap-2">
                    <span className="label-text font-semibold text-base-content/80">
                      {resourceMode === "text" ? "Texto del recurso" : "Descripción"}
                    </span>
                    <textarea
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      className={`textarea textarea-bordered w-full border-base-300 bg-base-100 ${resourceMode === "text" ? "min-h-64" : "min-h-28"}`}
                      placeholder={resourceMode === "text" ? "Escribe aquí el contenido que verá el alumno..." : "Resumen breve del recurso"}
                      disabled={isSubmitting}
                      required={resourceMode === "text"}
                    />
                  </label>
                </div>
              </div>
            </section>

            <section className="card border border-base-300 bg-base-100 shadow-sm">
              <div className="card-body gap-5 p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-secondary/10 p-3 text-secondary-content">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-base-content">Tipo de recurso</h2>
                    <p className="text-sm text-base-content/60">Elige si será un archivo descargable, un enlace o un texto.</p>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <button
                    type="button"
                    onClick={() => setResourceMode("file")}
                    className={`rounded-2xl border p-4 text-left transition-all cursor-pointer hover:cursor-pointer ${resourceMode === "file" ? "border-primary bg-primary/5" : "border-base-300 bg-base-100 hover:border-primary/30"}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-primary/10 p-2 text-primary"><Upload size={18} /></div>
                      <div>
                        <p className="font-semibold text-base-content">Archivo descargable</p>
                        <p className="text-sm text-base-content/60">Muestra un botón de descarga en la vista previa.</p>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setResourceMode("link")}
                    className={`rounded-2xl border p-4 text-left transition-all cursor-pointer hover:cursor-pointer ${resourceMode === "link" ? "border-primary bg-primary/5" : "border-base-300 bg-base-100 hover:border-primary/30"}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-secondary/10 p-2 text-secondary-content"><Link2 size={18} /></div>
                      <div>
                        <p className="font-semibold text-base-content">Enlace externo</p>
                        <p className="text-sm text-base-content/60">Redirige a un sitio o documento alojado fuera.</p>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setResourceMode("text")}
                    className={`rounded-2xl border p-4 text-left transition-all cursor-pointer hover:cursor-pointer ${resourceMode === "text" ? "border-primary bg-primary/5" : "border-base-300 bg-base-100 hover:border-primary/30"}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-success/10 p-2 text-success"><FileText size={18} /></div>
                      <div>
                        <p className="font-semibold text-base-content">Texto</p>
                        <p className="text-sm text-base-content/60">Para apuntes, indicaciones o material breve.</p>
                      </div>
                    </div>
                  </button>
                </div>

                {resourceMode !== "text" ? (
                  <label className="form-control gap-2">
                    <span className="label-text font-semibold text-base-content/80">
                      {resourceMode === "file" ? "URL del archivo" : "URL del enlace"}
                    </span>
                    <input
                      value={resourceUrl}
                      onChange={(event) => setResourceUrl(event.target.value)}
                      className="input input-bordered w-full border-base-300 bg-base-100"
                      placeholder={resourceMode === "file" ? "https://.../archivo.pdf" : "https://..."}
                      disabled={isSubmitting}
                      required
                    />
                  </label>
                ) : null}

                {resourceMode === "text" ? (
                  <label className="form-control gap-2">
                    <span className="label-text font-semibold text-base-content/80">Contenido del recurso</span>
                    <textarea
                      value={content}
                      onChange={(event) => setContent(event.target.value)}
                      className="textarea textarea-bordered min-h-64 w-full border-base-300 bg-base-100"
                      placeholder="Escribe aquí el contenido que verá el alumno..."
                      disabled={isSubmitting}
                      required
                    />
                    <span className="text-sm text-base-content/60">
                      Este texto será el recurso que verá el alumno en la vista previa.
                    </span>
                  </label>
                ) : null}

                <label className="form-control gap-2">
                  <span className="label-text font-semibold text-base-content/80">Unidad</span>
                  <select
                    value={unitId}
                    onChange={(event) => setUnitId(event.target.value)}
                    className="select select-bordered w-full border-base-300 bg-base-100"
                    disabled={isSubmitting || isEditMode}
                    required
                  >
                    <option value="" disabled>Selecciona una unidad</option>
                    {units.map((unit) => (
                      <option key={unit._id} value={unit._id}>
                        {unit.title}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </section>

            {error ? (
              <div className="alert alert-error">
                <span>{error}</span>
              </div>
            ) : null}

            {success && !isEditMode ? (
              <div className="card border border-success/20 bg-success/5 shadow-sm">
                <div className="card-body gap-4 p-5 sm:p-6">
                  <div>
                    <h3 className="text-xl font-semibold text-base-content">Recurso creado correctamente</h3>
                    <p className="text-sm text-base-content/60">Puedes ir ahora a la vista previa del recurso o volver al curso.</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button type="button" className="btn btn-primary" onClick={handleRedirect}>
                      Ver recurso
                    </button>
                    <button type="button" className="btn btn-ghost" onClick={() => router.push(`/mycourses/${courseId}`)}>
                      Volver al curso
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                <button type="button" className="btn btn-ghost" onClick={() => router.push(backButtonHref)} disabled={isSubmitting}>
                  {backButtonLabel}
                </button>
                <button type="submit" className="btn btn-primary gap-2" disabled={isSubmitting}>
                  {isSubmitting ? <span className="loading loading-spinner loading-sm" /> : null}
                  {actionLabel}
                </button>
              </div>
            )}
          </form>
        </section>
      </div>
    </main>
  );
}
