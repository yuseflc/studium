'use client';

import React from 'react';
import { Modal } from './Modal';
import { ModalConfirmProps } from './ModalDanger';

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
