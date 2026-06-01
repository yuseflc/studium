"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, Check, FileText, Link2, ShieldCheck, Sparkles, Upload, X, ChevronDown } from "lucide-react";
import { createResource, updateResource } from "@/app/actions/resourceActions";
import { useFileUpload } from "@/hooks/useFileUpload";

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
  const fileInputRef = useRef<HTMLInputElement>(null);
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
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(() => getFileNameFromUrl(initialResourceUrl));
  
  // Hook para carga de archivos a R2
  const fileUpload = useFileUpload({ courseId: courseId || '', unitId: unitId || '' });

  const selectedUnitTitle = useMemo(() => {
    return units.find((unit) => unit._id === unitId)?.title || "Selecciona una unidad";
  }, [unitId, units]);

  const isEditMode = mode === "edit";

  function getFileNameFromUrl(fileUrl: string): string | null {
    if (!fileUrl) return null;

    try {
      const parsedUrl = new URL(fileUrl);
      const fileName = parsedUrl.pathname.split("/").filter(Boolean).pop();
      return fileName ? decodeURIComponent(fileName) : null;
    } catch {
      const fileName = fileUrl.split("/").filter(Boolean).pop();
      return fileName ? decodeURIComponent(fileName) : null;
    }
  }

  // Manejador para eventos de arrastre
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Manejador para el evento drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (!courseId || !unitId || resourceMode !== 'file') return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  // Manejador para selección de archivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!courseId || !unitId) return;
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  // Función principal de carga de archivo
  const handleFileUpload = async (file: File) => {
    if (!courseId || !unitId) {
      setError('Curso y unidad son requeridos para subir archivos');
      return;
    }

    setError(null);
    const result = await fileUpload.upload(file);
    if (result.success && result.url) {
      setResourceUrl(result.url);
      setUploadedFileName(result.fileName || file.name);
      // Auto-llenar el título con el nombre del archivo si no hay título
      if (!title) {
        setTitle(file.name.replace(/\.[^.]+$/, ''));
      }
    } else {
      setError(result.error || 'Error al subir el archivo');
    }
  };

  // Limpiar archivo cargado
  const clearFileUpload = () => {
    setResourceUrl('');
    setUploadedFileName(null);
    fileUpload.resetProgress();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
          previousUrl: initialResourceUrl || undefined,
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
  const currentFileName = uploadedFileName || getFileNameFromUrl(resourceUrl);

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
                <div className={`dropdown w-full ${(isSubmitting || isEditMode) ? 'pointer-events-none opacity-50' : ''}`}>
                  <div tabIndex={(isSubmitting || isEditMode) ? -1 : 0} role={(isSubmitting || isEditMode) ? "presentation" : "button"} className={`rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm w-full text-left flex items-center justify-between ${!(isSubmitting || isEditMode) ? 'hover:border-primary/30 transition-colors cursor-pointer' : ''}`}>
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-secondary/10 p-2 text-secondary-content">
                        <BookOpen size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-base-content/40">Unidad</p>
                        <p className="text-sm font-semibold text-base-content">{selectedUnitTitle}</p>
                      </div>
                    </div>
                    {!(isSubmitting || isEditMode) && <ChevronDown size={16} className="text-base-content/40" />}
                  </div>
                  {!(isSubmitting || isEditMode) && (
                    <ul tabIndex={0} className="dropdown-content z-[10] menu p-2 shadow-xl bg-base-100 rounded-box w-full mt-2 border border-base-300 max-h-60 overflow-y-auto flex-nowrap">
                      {units.map((unit) => (
                        <li key={unit._id}>
                          <button 
                            type="button" 
                            onClick={(e) => {
                              e.preventDefault();
                              setUnitId(unit._id);
                              if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
                            }} 
                            className={unitId === unit._id ? "active font-bold" : ""}
                          >
                            {unit.title}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
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
                  <>
                    {resourceMode === "file" ? (
                      // Zona de carga de archivo con drag-and-drop
                      <div className="form-control gap-2">
                        <span className="label-text font-semibold text-base-content/80">Subir archivo</span>
                        
                        <div
                          onDragEnter={handleDrag}
                          onDragLeave={handleDrag}
                          onDragOver={handleDrag}
                          onDrop={handleDrop}
                          onClick={() => fileInputRef.current?.click()}
                          className={`
                            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
                            transition-colors duration-200
                            ${dragActive 
                              ? 'border-primary bg-primary/10' 
                              : 'border-base-300 bg-base-100 hover:border-primary/50'
                            }
                            ${fileUpload.isLoading ? 'opacity-60 cursor-not-allowed' : ''}
                          `}
                        >
                          <input
                            ref={fileInputRef}
                            type="file"
                            onChange={handleFileChange}
                            className="hidden"
                            disabled={fileUpload.isLoading}
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.jpeg,.png,.gif,.webp,.mp4,.webm,.mp3,.wav,.zip"
                          />
                          
                          {!resourceUrl ? (
                            <>
                              <Upload className="w-8 h-8 mx-auto mb-2 text-base-content/60" />
                              <p className="text-sm font-medium">
                                Arrastra un archivo aquí o haz clic para seleccionar
                              </p>
                              <p className="text-xs text-base-content/50 mt-1">
                                Máximo 50MB • Formatos: PDF, DOC, XLS, PPT, JPG, PNG, MP4, MP3, ZIP
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="text-sm font-medium text-success">✓ Archivo cargado</p>
                              <p className="text-xs text-base-content/60 mt-1">{currentFileName}</p>
                              {isEditMode ? (
                                <p className="mt-2 text-xs text-base-content/45">
                                  Si guardas cambios con otro archivo, el adjunto anterior se eliminará de R2.
                                </p>
                              ) : null}
                            </>
                          )}
                        </div>

                        {/* Barra de progreso */}
                        {fileUpload.isLoading && (
                          <div className="mt-3">
                            <div className="flex justify-between mb-1">
                              <span className="text-xs font-medium">Cargando...</span>
                              <span className="text-xs font-medium">{fileUpload.progress.percentage}%</span>
                            </div>
                            <progress
                              className="progress progress-primary w-full"
                              value={fileUpload.progress.percentage}
                              max="100"
                            />
                          </div>
                        )}

                        {/* Botón para cambiar archivo */}
                        {resourceUrl && !fileUpload.isLoading && (
                          <button
                            type="button"
                            onClick={clearFileUpload}
                            className="btn btn-sm btn-outline w-full mt-3"
                          >
                            <X className="w-4 h-4" />
                            {isEditMode ? "Quitar archivo actual" : "Cambiar archivo"}
                          </button>
                        )}
                      </div>
                    ) : (
                      // Campo de URL para enlaces
                      <label className="form-control gap-2">
                        <span className="label-text font-semibold text-base-content/80">URL del enlace</span>
                        <input
                          value={resourceUrl}
                          onChange={(event) => setResourceUrl(event.target.value)}
                          className="input input-bordered w-full border-base-300 bg-base-100"
                          placeholder="https://..."
                          disabled={isSubmitting}
                          required
                        />
                      </label>
                    )}
                  </>
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
