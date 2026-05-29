'use client';

import React from 'react';
import { Modal } from './Modal';

export interface ModalConfirmProps {
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
