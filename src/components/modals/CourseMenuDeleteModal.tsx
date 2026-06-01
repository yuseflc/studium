/* Archivo: src\components\ui\modals\CourseMenuDeleteModal.tsx
    Descripción: Modal de confirmación para eliminar ítems del menú del curso. */

// Modal: CourseMenuDeleteModal — confirmación de borrado desde el menú del curso
'use client';

import React from 'react';
import { Modal } from './Modal';
import HoldConfirmButton from '../HoldConfirmButton';
import { IconTrash } from '@tabler/icons-react';

interface CourseMenuDeleteModalProps {
    onClose: () => void;
    onConfirm: () => void;
    courseTitle: string;
    isDeleting: boolean;
    error?: string | null;
}

export const CourseMenuDeleteModal = ({
    onClose,
    onConfirm,
    courseTitle,
    isDeleting,
    error,
}: CourseMenuDeleteModalProps) => {
    return (
        <Modal id="course-menu-delete-modal" onClose={onClose} isOpen={true} className="backdrop-blur-md border border-error/20 bg-base-100">
            <h3 className="font-bold text-lg text-error flex items-center gap-2 mb-2">
                <IconTrash size={22} /> Eliminar curso
            </h3>

            {error && (
                <div className="alert alert-error text-sm py-2 mb-4">
                    {error}
                </div>
            )}

            <p className="py-2">
                ¿Estás seguro de que quieres eliminar el curso <strong>"{courseTitle}"</strong> permanentemente? Se borrarán todos sus contenidos y tareas.
            </p>
            <p className="py-2 font-medium text-warning text-sm">
                Para confirmar, mantén pulsado el botón rojo durante 3 segundos.
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
                        holdText="Soltar para cancelar"
                    >
                        {isDeleting ? "Eliminando..." : "Eliminar curso"}
                    </HoldConfirmButton>
                </div>
            </div>
        </Modal>
    );
};
