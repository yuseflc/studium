'use client';

import React from 'react';
import { IconX } from '@tabler/icons-react';

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
 */
export const Modal = ({ id, dialogRef, onClose, children, className = "max-w-2xl", showClose = false }: ModalProps) => {
    return (
        <dialog id={id} ref={dialogRef} className="modal">
            <div className={`modal-box bg-base-100/80 text-base-content border border-base-200/60 shadow-2xl backdrop-blur-xl ${className}`}>
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
