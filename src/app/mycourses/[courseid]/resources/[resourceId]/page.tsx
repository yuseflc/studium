/* Archivo: src\app\mycourses\[courseid]\resources\[resourceId]\page.tsx
  Descripción: Página para ver o descargar un recurso asociado a un curso. */

import { connectDB } from '@/lib/database/database';
import Resource from '@/models/Resource';
import Course from '@/models/Course';
import Unit from '@/models/Unit';
import User from '@/models/User';
import { notFound } from 'next/navigation';
import { FileText, Download, ArrowLeft, CalendarDays, GraduationCap, Users, UserCircle2, ExternalLink, Link2 } from 'lucide-react';
import Link from 'next/link';
import mongoose from 'mongoose';

export const dynamic = "force-dynamic";

export default async function ResourceDetailPage({ 
  params 
}: { 
  params: Promise<{ courseid: string; resourceId: string }> 
}) {
  const { courseid, resourceId } = await params;
  const resourceObjectId = mongoose.Types.ObjectId.isValid(resourceId) ? new mongoose.Types.ObjectId(resourceId) : null;
  const courseObjectId = mongoose.Types.ObjectId.isValid(courseid) ? new mongoose.Types.ObjectId(courseid) : null;

  let resourceInfo: any = null;
  let courseInfo: any = null;
  let unitInfo: any = null;
  let uploaderName = "Profesor del curso";

  if (resourceObjectId && courseObjectId) {
    await connectDB();
    resourceInfo = await Resource.findById(resourceObjectId).lean();

    if (resourceInfo && resourceInfo.courseId.toString() !== courseid) {
      resourceInfo = null;
    }

    if (resourceInfo) {
      [courseInfo, unitInfo] = await Promise.all([
        Course.findById(resourceInfo.courseId).select("title description ownerId teachers").lean(),
        Unit.findById(resourceInfo.unitId).select("title order").lean(),
      ]);

      if (resourceInfo.createdBy) {
        const creator = await User.findById(resourceInfo.createdBy).select("firstName profile.lastName role").lean();
        if (creator) {
          uploaderName = `${creator.firstName}${creator.profile?.lastName ? ` ${creator.profile.lastName}` : ""}`;
        }
      } else if (courseInfo?.ownerId) {
        const owner = await User.findById(courseInfo.ownerId).select("firstName profile.lastName role").lean();
        if (owner) {
          uploaderName = `${owner.firstName}${owner.profile?.lastName ? ` ${owner.profile.lastName}` : ""}`;
        }
      }
    }
  }

  if (!resourceInfo) {
    // Demo fallback
    resourceInfo = {
      title: "Recurso de Demostración",
      description: "Este es un recurso de prueba. Contiene materiales de lectura adicionales para complementar las clases.",
      content: "Este es un texto de ejemplo que representa el contenido que el alumno leería en un recurso de tipo texto.",
      url: "/uploads/placeholder.pdf",
      type: "text",
      createdAt: new Date(),
      createdBy: null,
    };
    courseInfo = courseInfo || { title: "Curso de demostración" };
    unitInfo = unitInfo || { title: "Unidad de demostración" };
  }

  const isPdf = resourceInfo.url?.toLowerCase().endsWith('.pdf');
  const isImage = /\.(jpeg|jpg|gif|png|webp)$/i.test(resourceInfo.url || '');
  const isTextResource = resourceInfo.type === "text";
  const isLinkResource = resourceInfo.type === "link";
  const textContent = resourceInfo.content || resourceInfo.description || "";
  const uploadedLabel = new Date(resourceInfo.createdAt || Date.now()).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-base-200/50 p-4 sm:p-6 lg:p-12">
      <div className="mx-auto max-w-6xl">
        <Link 
          href={`/mycourses/${courseid}`} 
          className="btn btn-ghost btn-sm mb-6 flex items-center gap-2 w-fit text-base-content/70 hover:text-base-content"
        >
          <ArrowLeft size={16} />
          Volver al curso
        </Link>

        <div className="overflow-hidden rounded-[2rem] border border-base-300 bg-base-100 shadow-2xl">
          <div className="border-b border-base-300 bg-base-100 px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="hidden rounded-3xl bg-base-100/80 p-4 text-primary shadow-sm sm:flex">
                  <FileText size={42} />
                </div>
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="badge badge-accent badge-outline uppercase font-semibold">{resourceInfo.type}</span>
                    <span className="badge badge-outline gap-1.5">
                      <CalendarDays size={12} />
                      Subido el {uploadedLabel}
                    </span>
                  </div>
                  <h1 className="text-3xl font-black tracking-tight text-base-content sm:text-4xl lg:text-5xl">
                    {resourceInfo.title}
                  </h1>
                  <p className="max-w-3xl text-base leading-relaxed text-base-content/70 sm:text-lg">
                    {resourceInfo.description || "Este recurso no tiene una descripción adicional."}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:w-[32rem]">
                <div className="rounded-2xl border border-base-300 bg-base-100/90 p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-primary/10 p-2 text-primary">
                      <GraduationCap size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-base-content/40">Clase</p>
                      <p className="text-sm font-semibold text-base-content">{courseInfo?.title || `Curso ${courseid.slice(-6)}`}</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-base-300 bg-base-100/90 p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-secondary/10 p-2 text-secondary-content">
                      <FileText size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-base-content/40">Unidad</p>
                      <p className="text-sm font-semibold text-base-content">{unitInfo?.title || `Unidad ${String(resourceInfo.unitId).slice(-6)}`}</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-base-300 bg-base-100/90 p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-success/10 p-2 text-success">
                      <UserCircle2 size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-base-content/40">Profesor</p>
                      <p className="text-sm font-semibold text-base-content">{uploaderName}</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-base-300 bg-base-100/90 p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-base-200 p-2 text-base-content">
                      <Users size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-base-content/40">Tipo</p>
                      <p className="text-sm font-semibold text-base-content">{isTextResource ? "Texto con contenido" : "Archivo o enlace"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-8 px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
            {isTextResource ? (
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-base-content/40">
                  <FileText size={14} />
                  Contenido del recurso
                </div>
                <div className="rounded-[1.75rem] border border-base-300 bg-base-100 p-5 shadow-sm sm:p-6 lg:p-8">
                  <div className="prose prose-base-content max-w-none whitespace-pre-wrap text-base leading-relaxed text-base-content/85 sm:text-lg">
                    {textContent || "Sin contenido de texto para este recurso."}
                  </div>
                </div>
              </section>
            ) : isLinkResource ? (
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-base-content/40">
                  <Link2 size={14} />
                  Enlace externo
                </div>
                <div className="rounded-[1.75rem] border border-base-300 bg-base-200/30 p-2 shadow-sm">
                  <div className="flex flex-col gap-6 rounded-[1.4rem] border border-base-300 bg-base-100 p-5 sm:p-6 lg:p-8">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex items-center gap-4">
                        <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                          <ExternalLink size={28} />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-lg font-semibold text-base-content">{resourceInfo.title || 'Enlace del recurso'}</p>
                          <p className="text-sm text-base-content/60">Abre el enlace asociado a este recurso</p>
                        </div>
                      </div>

                      {resourceInfo.url ? (
                        <a 
                          href={resourceInfo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-primary flex items-center gap-2 self-start lg:self-auto"
                        >
                          <ExternalLink size={16} />
                          Visitar enlace
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>
              </section>
            ) : (
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-base-content/40">
                  <Download size={14} />
                  Archivo vinculado
                </div>
                <div className="rounded-[1.75rem] border border-base-300 bg-base-200/30 p-2 shadow-sm">
                  <div className="flex flex-col gap-6 rounded-[1.4rem] border border-base-300 bg-base-100 p-5 sm:p-6 lg:p-8">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex items-center gap-4">
                        <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                          <FileText size={28} />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-lg font-semibold text-base-content">{resourceInfo.url?.split('/').pop() || 'archivo'}</p>
                          <p className="text-sm text-base-content/60">Archivo de recurso del curso</p>
                        </div>
                      </div>

                      {resourceInfo.url ? (
                        <a 
                          href={resourceInfo.url} 
                          download
                          className="btn btn-primary flex items-center gap-2 self-start lg:self-auto"
                        >
                          <Download size={16} />
                          Descargar archivo
                        </a>
                      ) : null}
                    </div>

                    {resourceInfo.url && (
                      <div className="border-t border-base-300 pt-6">
                        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-base-content/50">
                          <FileText size={16} />
                          Previsualización
                        </h3>
                        {isPdf ? (
                          <div className="h-[500px] overflow-hidden rounded-2xl border border-base-300 bg-base-100">
                            <iframe 
                              src={`${resourceInfo.url}#toolbar=0`} 
                              className="h-full w-full"
                            />
                          </div>
                        ) : isImage ? (
                          <div className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 p-2">
                            <img 
                              src={resourceInfo.url} 
                              alt={resourceInfo.title}
                              className="max-h-[520px] w-full object-contain rounded-xl"
                            />
                          </div>
                        ) : (
                          <div className="rounded-2xl border border-dashed border-base-300 bg-base-200/40 px-5 py-10 text-center text-sm text-base-content/60">
                            La previsualización no está disponible para este tipo de archivo. Descárgalo para ver su contenido.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
