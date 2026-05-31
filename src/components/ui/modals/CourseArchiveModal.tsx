/* Archivo: src\components\ui\modals\CourseArchiveModal.tsx
    Descripción: Modal para archivar o restaurar un curso del estado activo. */

// Modal: CourseArchiveModal — confirmar y ejecutar archivado de un curso
'use client';

import React from 'react';
import { Modal } from './Modal';

interface CourseArchiveModalProps {
    onClose: () => void;
    onConfirm: () => void;
}

export const CourseArchiveModal = ({
    onClose,
    onConfirm,
}: CourseArchiveModalProps) => {
    return (
        <Modal id="course-archive-modal" onClose={onClose} isOpen={true} className="backdrop-blur-md">
            <h3 className="font-bold text-lg">Archivar curso</h3>
            <p className="py-4">
                ¿Estás seguro de que quieres archivar este curso? Los estudiantes ya no podrán acceder al contenido,
                pero podrás restaurarlo más tarde.
            </p>
            <div className="modal-action">
                <button className="btn" onClick={onClose} type="button">
                    Cancelar
                </button>
                <button className="btn btn-warning" onClick={onConfirm} type="button">
                    Archivar curso
                </button>
            </div>
        </Modal>
    );
};
