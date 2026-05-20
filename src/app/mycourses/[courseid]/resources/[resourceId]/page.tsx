import { connectDB } from '@/lib/database/database';
import Resource from '@/models/Resource';
import { notFound } from 'next/navigation';
import { FileText, Download, ArrowLeft, Eye } from 'lucide-react';
import Link from 'next/link';
import mongoose from 'mongoose';

export const dynamic = "force-dynamic";

export default async function ResourceDetailPage({ 
  params 
}: { 
  params: Promise<{ courseid: string; resourceId: string }> 
}) {
  const { courseid, resourceId } = await params;
  
  let resourceInfo: any = null;

  if (mongoose.Types.ObjectId.isValid(resourceId)) {
    await connectDB();
    resourceInfo = await Resource.findById(resourceId).lean();
  }

  if (!resourceInfo) {
    // Demo fallback
    resourceInfo = {
      title: "Recurso de Demostración",
      description: "Este es un recurso de prueba. Contiene materiales de lectura adicionales para complementar las clases.",
      url: "/uploads/placeholder.pdf",
      type: "file"
    };
  }

  const isPdf = resourceInfo.url?.toLowerCase().endsWith('.pdf');
  const isImage = /\.(jpeg|jpg|gif|png|webp)$/i.test(resourceInfo.url || '');

  return (
    <div className="min-h-screen bg-base-200/50 p-6 lg:p-12">
      <div className="max-w-4xl mx-auto">
        <Link 
          href={`/mycourses/${courseid}`} 
          className="btn btn-ghost btn-sm mb-6 flex items-center gap-2 w-fit text-base-content/70 hover:text-base-content"
        >
          <ArrowLeft size={16} />
          Volver al curso
        </Link>

        <div className="card bg-base-100 shadow-xl border border-base-300">
          <div className="card-body p-8 lg:p-12">
            <div className="flex items-start gap-6">
              <div className="p-4 rounded-2xl flex-shrink-0 bg-primary/10 text-primary hidden sm:flex">
                <FileText size={40} />
              </div>
              
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl lg:text-4xl font-bold text-base-content tracking-tight mb-4">
                  {resourceInfo.title}
                </h1>
                
                <div className="flex items-center gap-4 text-base-content/70 flex-wrap mb-6">
                  <span className="badge badge-accent badge-outline uppercase font-semibold">
                    {resourceInfo.type}
                  </span>
                  <span className="text-sm">
                    Añadido el: {new Date(resourceInfo.createdAt || Date.now()).toLocaleDateString()}
                  </span>
                </div>

                <div className="divider">Descripción</div>
                
                <p className="text-lg leading-relaxed text-base-content/80 mb-8">
                  {resourceInfo.description || "Sin descripción proporcionada para este recurso."}
                </p>

                {/* Visualizador de archivo / Descarga */}
                <div className="bg-base-200 p-6 rounded-2xl border border-base-300 flex flex-col items-center">
                  <div className="flex items-center gap-4 w-full justify-between flex-wrap gap-y-4">
                    <div className="flex items-center gap-3">
                      <FileText size={32} className="text-primary" />
                      <div className="min-w-0">
                        <p className="font-semibold truncate max-w-xs sm:max-w-md">{resourceInfo.url?.split('/').pop() || 'archivo'}</p>
                        <p className="text-xs text-base-content/60">Archivo de recurso del curso</p>
                      </div>
                    </div>
                    
                    <a 
                      href={resourceInfo.url} 
                      download
                      className="btn btn-primary flex items-center gap-2"
                    >
                      <Download size={16} />
                      Descargar archivo
                    </a>
                  </div>

                  {/* Previsualización si es posible */}
                  {resourceInfo.url && (
                    <div className="mt-8 w-full border-t border-base-300 pt-6">
                      <h3 className="font-semibold text-md mb-4 flex items-center gap-2 text-base-content/70">
                        <Eye size={18} />
                        Previsualización
                      </h3>
                      {isPdf ? (
                        <div className="w-full h-[500px] bg-base-100 rounded-xl overflow-hidden border border-base-300">
                          <iframe 
                            src={`${resourceInfo.url}#toolbar=0`} 
                            className="w-full h-full"
                          />
                        </div>
                      ) : isImage ? (
                        <div className="flex justify-center max-h-[400px] overflow-hidden rounded-xl border border-base-300 bg-base-100 p-2">
                          <img 
                            src={resourceInfo.url} 
                            alt={resourceInfo.title}
                            className="object-contain rounded-lg"
                          />
                        </div>
                      ) : (
                        <div className="text-center py-8 text-base-content/60 text-sm">
                          La previsualización no está disponible para este tipo de archivo. Descárgalo para ver su contenido.
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
