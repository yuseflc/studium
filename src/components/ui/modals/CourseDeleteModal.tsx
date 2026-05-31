/* Archivo: src\components\ui\modals\CourseDeleteModal.tsx
    Descripción: Modal para confirmar la eliminación completa de un curso. */

// Modal: CourseDeleteModal — confirmación de borrado definitivo del curso
'use client';

import React from 'react';
import { Modal } from './Modal';
import HoldConfirmButton from '../HoldConfirmButton';

interface CourseDeleteModalProps {
    onClose: () => void;
    onConfirm: () => void;
    deleteConfirmationText: string;
    setDeleteConfirmationText: (text: string) => void;
}

export const CourseDeleteModal = ({
    onClose,
    onConfirm,
    deleteConfirmationText,
    setDeleteConfirmationText,
}: CourseDeleteModalProps) => {
    return (
        <Modal id="course-delete-modal" onClose={onClose} isOpen={true} className="backdrop-blur-md">
            <h3 className="font-bold text-lg text-error">Eliminar curso</h3>
            <p className="py-4">
                Esta acción es irreversible. ¿Estás absolutamente seguro?
                Se perderá todo el contenido, tareas, calificaciones y datos de participantes.
            </p>
            <p className="text-sm font-semibold">Escribe "ELIMINAR" para confirmar:</p>
            <label htmlFor="course-delete-confirm" className="sr-only">Confirmar eliminación del curso</label>
            <input
                id="course-delete-confirm"
                type="text"
                className="input input-bordered w-full mt-2"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                aria-label="Escribe ELIMINAR para confirmar"
            />
            <div className="modal-action">
                <button
                    className="btn"
                    onClick={onClose}
                    type="button"
                >
                    Cancelar
                </button>
                <HoldConfirmButton
                    className="btn btn-error text-white"
                    onConfirm={onConfirm}
                    disabled={deleteConfirmationText !== "ELIMINAR"}
                >
                    Eliminar permanentemente
                </HoldConfirmButton>
            </div>
        </Modal>
    );
};
