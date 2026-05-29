'use client';

import React from 'react';
import { IconCheck, IconAlertCircle } from '@tabler/icons-react';
import { Modal, ModalProps } from './Modal';

export interface ModalFormProps extends Omit<ModalProps, 'children'> {
    title: string;
    children: React.ReactNode;
    confirmLabel?: string;
    onConfirm: (e: React.FormEvent) => void;
    isLoading?: boolean;
    error?: string | null;
    success?: boolean;
    successMessage?: string;
    successAction?: {
        label: string;
        onClick: () => void;
        icon?: React.ReactNode;
    };
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
    successAction,
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
                        {successAction && (
                            <button type="button" onClick={successAction.onClick} className="btn btn-primary gap-2">
                                {successAction.icon}
                                {successAction.label}
                            </button>
                        )}
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
