'use client';

import React from 'react';
import { IconX, IconCheck, IconAlertCircle } from '@tabler/icons-react';

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
            <div className={`modal-box bg-base-100 text-base-content border border-base-300 shadow-2xl ${className}`}>
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
            <form method="dialog" className="modal-backdrop backdrop-blur-sm">
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
        <Modal id={id} dialogRef={dialogRef} onClose={onClose} className={`p-6 ${className}`}>
            {/* Cabecera */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-base-200">
                <h3 className="font-bold text-xl text-base-content flex-1">
                    {success ? '¡Completado!' : title}
                </h3>
                <button
                    type="button"
                    onClick={onClose}
                    className="btn btn-sm btn-circle btn-ghost"
                    aria-label="Cerrar"
                >
                    <IconX size={18} />
                </button>
            </div>

            {success ? (
                <div className="space-y-6 py-4">
                    <div className="flex flex-col items-center gap-4">
                        <div className="rounded-full bg-success/15 p-4">
                            <IconCheck size={40} className="text-success" />
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-semibold text-base-content">{successMessage}</p>
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
                        <div className="modal-action gap-2 pt-2 border-t border-base-200">
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

