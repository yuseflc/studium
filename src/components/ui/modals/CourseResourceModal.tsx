/* Archivo: src\components\ui\modals\CourseResourceModal.tsx
    Descripción: Modal para subir, editar o vincular recursos en un curso. */

// Modal: CourseResourceModal — crear/editar recursos del curso (link/file/text)
'use client';

import React, { useRef, useState } from 'react';
import { ModalForm, ModalFormProps } from './ModalForm';
import { useFileUpload } from '@/hooks/useFileUpload';
import { Upload, X } from 'lucide-react';

interface CourseResourceModalProps extends Omit<ModalFormProps, 'title' | 'children' | 'onConfirm' | 'confirmLabel'> {
    mode: 'create' | 'edit';
    titleValue: string;
    setTitleValue: (val: string) => void;
    resourceType: 'link' | 'file' | 'text';
    setResourceType: (val: 'link' | 'file' | 'text') => void;
    resourceUrl: string;
    setResourceUrl: (val: string) => void;
    descriptionValue: string;
    setDescriptionValue: (val: string) => void;
    courseId?: string;
    unitId?: string;
    onConfirm: (e: React.FormEvent) => void;
}

export const CourseResourceModal = ({
    mode,
    titleValue,
    setTitleValue,
    resourceType,
    setResourceType,
    resourceUrl,
    setResourceUrl,
    descriptionValue,
    setDescriptionValue,
    courseId,
    unitId,
    ...formProps
}: CourseResourceModalProps) => {
    // Referencia al input file oculto (utilizado cuando el usuario hace clic en la zona drag-drop)
    const fileInputRef = useRef<HTMLInputElement>(null);
    // Estado para visualizar efecto al arrastrar archivos sobre la zona
    const [dragActive, setDragActive] = useState(false);
    // Almacena el nombre del archivo cargado para mostrar confirmación
    const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

    /**
     * Hook useFileUpload SIEMPRE se inicializa (no puede haber inicialización condicional)
     * Se pasará courseId y unitId disponibles, el hook maneja internamente si están definidos
     * En modo edición, el hook recibe undefined pero no causa problemas
     */
    const fileUpload = useFileUpload({ courseId: courseId || '', unitId: unitId || '' });

    /**
     * Manejador para eventos de arrastre (dragenter, dragover, dragleave)
     * Activa/desactiva el estado visual de la zona drag-and-drop
     */
    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // Activar visual cuando el usuario arrastra sobre o entra en la zona
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            // Desactivar visual cuando sale de la zona
            setDragActive(false);
        }
    };

    /**
     * Manejador para el evento drop (cuando el usuario suelta un archivo)
     * Valida que sea un archivo y tipo 'file', luego inicia la carga
     */
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        // Solo procesar si hay courseId, unitId y es tipo archivo
        if (!courseId || !unitId || resourceType !== 'file') return;

        const files = e.dataTransfer.files;
        // Procesar solo el primer archivo
        if (files.length > 0) {
            handleFileUpload(files[0]);
        }
    };

    /**
     * Manejador para cuando se selecciona un archivo desde el selector de archivos
     * Se ejecuta cuando el usuario hace clic en la zona drag-drop
     */
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!courseId || !unitId) return;
        const files = e.currentTarget.files;
        if (files && files.length > 0) {
            handleFileUpload(files[0]);
        }
    };

    /**
     * Función principal de carga de archivo
     * 1. Sube el archivo a R2 usando el hook useFileUpload
     * 2. Si es exitoso, almacena la URL pública
     * 3. Auto-completa el título con el nombre del archivo
     */
    const handleFileUpload = async (file: File) => {
        if (!courseId || !unitId) {
            alert('Curso y unidad son requeridos para subir archivos');
            return;
        }

        // Enviar archivo a R2 y obtener URL pública
        const result = await fileUpload.upload(file);
        if (result.success && result.url) {
            // Guardar URL del archivo en R2
            setResourceUrl(result.url);
            // Guardar nombre para mostrar en la UI
            setUploadedFileName(result.fileName || file.name);
            // Conveniencia: si no hay título, usar nombre del archivo (sin extensión)
            if (!titleValue) {
                setTitleValue(file.name.replace(/\.[^.]+$/, ''));
            }
        }
    };

    /**
     * Limpia el archivo cargado para permitir al usuario seleccionar otro
     * Resetea la URL, el nombre, el progreso y el valor del input
     */
    const clearFileUpload = () => {
        setResourceUrl('');
        setUploadedFileName(null);
        // Resetear progreso y errores del hook
        fileUpload?.resetProgress();
        // Limpiar el input file para permitir reseleccionar el mismo archivo
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <ModalForm
            {...formProps}
            title={mode === 'edit' ? "Editar recurso" : "Crear recurso"}
            confirmLabel="Guardar recurso"
            className="max-w-3xl"
        >
            <label className="form-control w-full">
                <span className="label-text font-medium mb-2">Título</span>
                <input 
                    className="input input-bordered w-full" 
                    value={titleValue} 
                    onChange={(e) => setTitleValue(e.target.value)} 
                    placeholder="Ej: PDF del tema" 
                    required 
                />
            </label>

            <label className="form-control w-full">
                <span className="label-text font-medium mb-2">Tipo</span>
                <select 
                    className="select select-bordered w-full" 
                    value={resourceType} 
                    onChange={(e) => setResourceType(e.target.value as any)}
                >
                    <option value="file">Archivo</option>
                    <option value="link">Enlace</option>
                    <option value="text">Texto</option>
                </select>
            </label>

            {resourceType === 'file' && (
                <div className="form-control w-full">
                    <span className="label-text font-medium mb-2">Subir Archivo</span>
                    
                    {/* Zona drag-and-drop */}
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
                                <p className="text-xs text-base-content/60 mt-1">{uploadedFileName}</p>
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

                    {/* Mensaje de error */}
                    {fileUpload.error && (
                        <div className="alert alert-error mt-3">
                            <span className="text-sm">{fileUpload.error}</span>
                        </div>
                    )}

                    {/* Botón para limpiar */}
                    {resourceUrl && !fileUpload.isLoading && (
                        <button
                            type="button"
                            onClick={clearFileUpload}
                            className="btn btn-sm btn-outline mt-2 w-full"
                        >
                            <X className="w-4 h-4" />
                            Cambiar archivo
                        </button>
                    )}
                </div>
            )}

            {resourceType === 'link' && (
                <label className="form-control w-full">
                    <span className="label-text font-medium mb-2">URL</span>
                    <input 
                        className="input input-bordered w-full" 
                        value={resourceUrl} 
                        onChange={(e) => setResourceUrl(e.target.value)} 
                        placeholder="https://..." 
                        required 
                    />
                </label>
            )}

            <label className="form-control w-full">
                <span className="label-text font-medium mb-2">Descripción</span>
                <textarea 
                    className="textarea textarea-bordered h-24 w-full" 
                    value={descriptionValue} 
                    onChange={(e) => setDescriptionValue(e.target.value)} 
                    placeholder="Descripción opcional" 
                />
            </label>
        </ModalForm>
    );
};
