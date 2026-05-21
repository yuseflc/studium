'use client';

import React from 'react';
import { IconX, IconCheck, IconAlertCircle } from '@tabler/icons-react';

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
        <Modal id={id} dialogRef={dialogRef} onClose={onClose} showClose={true} className={`bg-warning/5 border-warning/30 p-6 backdrop-blur-md ${className}`}>
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-2xl text-warning">
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
