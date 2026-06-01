/* Archivo: src\components\ui\modals\ParticipantDeleteModal.tsx
   Descripción: Modal de confirmación para eliminar a un alumno del curso. */

'use client';

import React from 'react';
import { IconTrash } from '@tabler/icons-react';
import { Modal } from './Modal';
import HoldConfirmButton from '@/components/ui/HoldConfirmButton';

interface ParticipantDeleteModalProps {
    dialogRef: React.RefObject<HTMLDialogElement | null>;
    onClose: () => void;
    onConfirm: () => void;
    participantName: string;
    isDeleting: boolean;
    error?: string | null;
}

export const ParticipantDeleteModal = ({
    dialogRef,
    onClose,
    onConfirm,
    participantName,
    isDeleting,
    error,
}: ParticipantDeleteModalProps) => {
    return (
        <Modal id="participant-delete-modal" dialogRef={dialogRef} onClose={onClose} isOpen={true} className="backdrop-blur-md border border-error/20 bg-base-100">
            <h3 className="font-bold text-lg text-error flex items-center gap-2 mb-2">
                <IconTrash size={22} /> Eliminar alumno
            </h3>

            {error && (
                <div className="alert alert-error text-sm py-2 mb-4">
                    <span>{error}</span>
                </div>
            )}

            <p className="py-2">
                ¿Seguro que quieres eliminar al alumno <strong>"{participantName}"</strong> del curso?
            </p>
            <p className="py-2 font-medium text-warning text-sm">
                Si es así, mantén pulsado el botón rojo durante 3 segundos para confirmar.
            </p>

            <div className="modal-action mt-6 flex items-center justify-end gap-3">
                <button
                    className="btn btn-ghost"
                    onClick={onClose}
                    type="button"
                    disabled={isDeleting}
                >
                    Cancelar
                </button>
                <div className="w-56">
                    <HoldConfirmButton
                        className="btn btn-error text-white w-full"
                        onConfirm={onConfirm}
                        disabled={isDeleting}
                        holdText="Suelta para cancelar"
                    >
                        {isDeleting ? 'Eliminando...' : 'Eliminar alumno'}
                    </HoldConfirmButton>
                </div>
            </div>
        </Modal>
    );
};