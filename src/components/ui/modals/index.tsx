'use client';

import React from 'react';
import { IconX, IconCheck, IconAlertCircle, IconSearch, IconClipboardText } from '@tabler/icons-react';

export interface ModalProps {
    id?: string;
    dialogRef?: React.RefObject<HTMLDialogElement | null>;
    onClose: () => void;
    children: React.ReactNode;
    className?: string;
    showClose?: boolean;
}

/**
 * Modal base: Proporciona la estructura común, el fondo desenfocado y el cierre automático.
 * Usado en: Autoreferenciado en este archivo por los demás modales.
 */
export const Modal = ({ id, dialogRef, onClose, children, className = "max-w-2xl", showClose = false }: ModalProps) => {
    return (
        <dialog id={id} ref={dialogRef} className="modal">
            <div className={`modal-box border shadow-xl backdrop-blur-md ${className}`}>
                {showClose && (
                    <button
                        onClick={onClose}
                        className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 z-10"
                        type="button"
                    >
                        <IconX size={20} />
                    </button>
                )}
                {children}
            </div>
            <form method="dialog" className="modal-backdrop">
                <button onClick={onClose}>cerrar</button>
            </form>
        </dialog>
    );
};

interface ModalConfirmProps {
    id: string;
    title: string;
    description: React.ReactNode;
    confirmLabel: string;
    cancelLabel?: string;
    onConfirm: () => void;
    isLoading?: boolean;
    error?: string | null;
}

/**
 * Modal de Peligro: Utilizado para acciones destructivas como eliminar. Usa estilos rojos (error).
 * Usado en: src/components/ui/CourseMenuView.tsx
 */
export const ModalDanger = ({
    id,
    title,
    description,
    confirmLabel,
    cancelLabel = "Cancelar",
    onConfirm,
    isLoading = false,
    error = null,
}: ModalConfirmProps) => {
    const closeDialog = () => {
        if (!id) return;
        (document.getElementById(id) as HTMLDialogElement)?.close();
    };

    return (
        <Modal id={id} onClose={closeDialog} className="border-error/30 bg-error/5 backdrop-blur-md">
            <h3 className="font-bold text-lg text-error">{title}</h3>
            
            <div className="py-4">
                {description}
            </div>

            {error && (
                <div className="alert alert-error mb-4">
                    <span>{error}</span>
                </div>
            )}

            <div className="modal-action gap-2">
                <button
                    type="button"
                    onClick={closeDialog}
                    className="btn btn-ghost"
                    disabled={isLoading}
                >
                    {cancelLabel}
                </button>
                <button
                    type="button"
                    onClick={onConfirm}
                    className="btn btn-error"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <span className="loading loading-spinner loading-sm"></span>
                            Eliminando...
                        </>
                    ) : (
                        confirmLabel
                    )}
                </button>
            </div>
        </Modal>
    );
};

/**
 * Modal de Aviso: Utilizado para advertencias o confirmaciones importantes que no son destructivas. Usa estilos amarillos (warning).
 * Usado en: src/components/ui/CourseMenuView.tsx
 */
export const ModalAdvise = ({
    id,
    title,
    description,
    confirmLabel,
    cancelLabel = "Volver",
    onConfirm,
    isLoading = false,
    error = null,
}: ModalConfirmProps) => {
    const closeDialog = () => {
        if (!id) return;
        (document.getElementById(id) as HTMLDialogElement)?.close();
    };

    return (
        <Modal id={id} onClose={closeDialog} className="border-warning/30 bg-warning/5 backdrop-blur-md">
            <h3 className="font-bold text-lg text-warning">{title}</h3>
            
            <div className="py-4">
                {description}
            </div>

            {error && (
                <div className="alert alert-error mb-4">
                    <span>{error}</span>
                </div>
            )}

            <div className="modal-action gap-2">
                <button
                    type="button"
                    onClick={closeDialog}
                    className="btn btn-ghost"
                    disabled={isLoading}
                >
                    {cancelLabel}
                </button>
                <button
                    type="button"
                    onClick={onConfirm}
                    className="btn btn-warning"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <span className="loading loading-spinner loading-sm"></span>
                            Cancelando...
                        </>
                    ) : (
                        confirmLabel
                    )}
                </button>
            </div>
        </Modal>
    );
};

export interface ModalFormProps extends Omit<ModalProps, 'children'> {
    title: string;
    children: React.ReactNode;
    confirmLabel?: string;
    onConfirm: (e: React.FormEvent) => void;
    isLoading?: boolean;
    error?: string | null;
    success?: boolean;
    successMessage?: string;
}

/**
 * Modal de Formulario: Especializado para formularios complejos. Maneja estados de carga, éxito y errores de forma integrada.
 * Usado en: src/components/ui/CourseFAB.tsx, src/components/ui/CreateCourseModal.tsx, src/components/ui/CreateTaskModal.tsx
 */
export const ModalForm = ({
    id,
    dialogRef,
    title,
    onClose,
    children,
    confirmLabel = "Guardar",
    onConfirm,
    isLoading = false,
    error = null,
    success = false,
    successMessage = "¡Operación completada con éxito!",
    className = "max-w-2xl"
}: ModalFormProps) => {
    return (
        <Modal id={id} dialogRef={dialogRef} onClose={onClose} className={`bg-base-100 dark:bg-warning/5 border-base-200 dark:border-warning/30 p-6 backdrop-blur-md shadow-2xl ${className}`}>
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-2xl text-base-content dark:text-warning">
                    {success ? "¡Completado!" : title}
                </h3>
            </div>

            {success ? (
                <div className="space-y-6 py-4">
                    <div className="flex flex-col items-center gap-4">
                        <div className="rounded-full bg-success/20 p-4">
                            <IconCheck size={40} className="text-success" />
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-semibold">{successMessage}</p>
                        </div>
                    </div>
                    <div className="modal-action gap-2">
                        <button type="button" onClick={onClose} className="btn btn-ghost">
                            Cerrar
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    {error && (
                        <div className="alert alert-error mb-6">
                            <IconAlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}
                    <form onSubmit={(e) => { e.preventDefault(); onConfirm(e); }} className="space-y-4">
                        {children}
                        <div className="modal-action gap-2 pt-4">
                            <button type="button" onClick={onClose} className="btn btn-ghost" disabled={isLoading}>
                                Cancelar
                            </button>
                            <button type="submit" className="btn btn-primary min-w-[120px]" disabled={isLoading}>
                                {isLoading ? <span className="loading loading-spinner loading-sm"></span> : confirmLabel}
                            </button>
                        </div>
                    </form>
                </>
            )}
        </Modal>
    );
};

export interface ModalSearchProps {
    id: string;
    dialogRef: React.RefObject<HTMLDialogElement | null>;
    searchTerm: string;
    onSearchChange: (value: string) => void;
    filteredTasks: any[];
    onGoToTask: (id: string) => void;
    onClose: () => void;
}

/**
 * Modal de Búsqueda: Especializado para filtrar y navegar rápidamente a tareas o exámenes.
 * Optimizado para máxima legibilidad y contraste.
 */
export const ModalSearch = ({
    id,
    dialogRef,
    searchTerm,
    onSearchChange,
    filteredTasks,
    onGoToTask,
    onClose,
}: ModalSearchProps) => {
    return (
        <Modal 
            id={id} 
            dialogRef={dialogRef} 
            onClose={onClose} 
            className="max-w-xl bg-base-100lack dark:bg-base-200 border border-base-300 dark:border-black/10 p-6 shadow-2xl backdrop-blur-xl"
        >
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-extrabold text-2xl text-base-content dark:text-black flex items-center gap-3 tracking-tight">
                    <IconSearch size={28} className="text-primary dark:text-warning" />
                    Buscador de Tareas
                </h3>
            </div>

            <div className="form-control mb-6">
                <div className="relative group">
                    <IconSearch 
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/50 dark:text-warning/70 z-10" 
                        size={20} 
                    />
                    <input 
                        type="text"
                        placeholder="Buscar tarea o examen por título..."
                        className="input w-full pl-12 h-14 border-2 border-base-300 dark:border-white/10 bg-base-100 dark:bg-base-300 text-base-content dark:text-black placeholder:text-base-content/40 dark:placeholder:text-black/30 focus:border-primary dark:focus:border-warning focus:outline-none focus:ring-4 focus:ring-primary/10 dark:focus:ring-warning/10 transition-all font-semibold rounded-2xl shadow-sm"
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        autoFocus
                    />
                </div>
            </div>

            <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                <h4 className="font-black text-[11px] uppercase tracking-[0.15em] text-base-content/60 dark:text-warning/80 mb-3 flex items-center justify-between px-1">
                    <span>Resultados</span>
                    <span className="badge badge-md bg-primary/10 dark:bg-warning/20 border-none text-primary dark:text-warning font-bold">
                        {filteredTasks.length}
                    </span>
                </h4>
                
                {filteredTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-base-content/30 dark:text-white/20 bg-base-200/50 dark:bg-base-300/50 rounded-3xl border-2 border-dashed border-base-300 dark:border-black/5">
                        <IconSearch size={56} className="opacity-20 mb-4" />
                        <p className="text-base font-medium italic">
                            No se encontraron coincidencias
                        </p>
                    </div>
                ) : (
                    filteredTasks.map((task) => {
                        const taskId = String(task._id || task.id);
                        const title = task.title;
                        const description = task.description || "Tarea del curso";
                        
                        return (
                            <div
                                key={taskId}
                                onClick={() => onGoToTask(taskId)}
                                className="group flex items-center gap-4 p-4 rounded-2xl border border-base-300 dark:border-white/5 bg-base-100 dark:bg-base-300/50 hover:bg-base-200  hover:border-primary/30 dark:hover:border-warning/30 transition-all cursor-pointer shadow-sm hover:shadow-md"
                            >
                                <div className="p-3 rounded-xl bg-primary/10 dark:bg-warning/10 text-primary dark:text-warning shadow-inner flex-shrink-0 group-hover:scale-110 transition-transform">
                                    <IconClipboardText size={20} />
                                </div>

                                <div className="flex flex-col min-w-0 flex-1">
                                    <p className="font-bold text-[15px] text-base-content dark:text-white truncate leading-tight group-hover:text-primary dark:group-hover:text-warning transition-colors">
                                        {title}
                                    </p>
                                    <span className="text-xs font-medium text-base-content/60 dark:text-white/50 truncate mt-0.5">
                                        {description}
                                    </span>
                                </div>

                                <div className="ml-2 text-xs font-black uppercase tracking-widest text-primary dark:text-warning opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all">
                                    Ver
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <div className="modal-action border-t border-base-200 dark:border-white/5 pt-4 mt-6">
                <button 
                    type="button" 
                    className="btn btn-ghost btn-sm text-base-content/50 dark:text-white/40 hover:text-primary dark:hover:text-warning font-bold" 
                    onClick={onClose}
                >
                    Cerrar buscador
                </button>
            </div>
        </Modal>
    );
};
