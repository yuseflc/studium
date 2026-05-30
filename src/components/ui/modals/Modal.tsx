'use client';

import React, { useEffect } from 'react';
import { IconX } from '@tabler/icons-react';

export interface ModalProps {
    id?: string;
    dialogRef?: React.RefObject<HTMLDialogElement | null>;
    onClose: () => void;
    children: React.ReactNode;
    className?: string;
    showClose?: boolean;
    isOpen?: boolean;
}

/**
 * Modal base: Proporciona la estructura común, el fondo desenfocado y el cierre automático.
 * [FIX] useEffect gestiona showModal()/close() para que el dialog nativo funcione correctamente.
 */
export const Modal = ({ id, dialogRef, onClose, children, className = "max-w-2xl", showClose = false, isOpen = false }: ModalProps) => {
    // [FIX] Controlar showModal()/close() basado en isOpen
    useEffect(() => {
        const dialog = dialogRef?.current;
        if (!dialog) return;
        
        if (isOpen) {
            // Abrir el dialog nativo
            if (!dialog.open) {
                dialog.showModal();
            }
        } else {
            // Cerrar el dialog nativo
            if (dialog.open) {
                dialog.close();
            }
        }
    }, [isOpen, dialogRef]);
    return (
        <dialog id={id} ref={dialogRef} className={`modal ${isOpen ? "modal-open" : ""}`}>
            <div className={`modal-box bg-base-100/60 text-base-content border border-base-200/60 shadow-2xl backdrop-blur-xl ${className}`}>
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
