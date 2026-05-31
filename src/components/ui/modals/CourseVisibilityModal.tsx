/* Archivo: src\components\ui\modals\CourseVisibilityModal.tsx
    Descripción: Modal para ajustar la visibilidad o publicación de un curso (público/privado). */

// Modal: CourseVisibilityModal — cambiar visibilidad/estado del curso (draft/active/archived)
'use client';

import React from 'react';
import { Modal } from './Modal';

interface CourseVisibilityModalProps {
    status: 'draft' | 'active' | 'archived' | string;
    onClose: () => void;
    onConfirm: () => void;
}

export const CourseVisibilityModal = ({
    status,
    onClose,
    onConfirm,
}: CourseVisibilityModalProps) => {
    return (
        <Modal id="course-visibility-modal" onClose={onClose} isOpen={true} className="backdrop-blur-md">
            <h3 className="font-bold text-lg">Cambiar visibilidad del curso</h3>
            <p className="py-4">
                ¿Estás seguro de que quieres {status === "active" ? "cambiar el curso a borrador" : "publicar el curso"}?
                {status === "active"
                    ? " Los estudiantes ya no podrán acceder al curso."
                    : " Los estudiantes podrán ver y acceder al contenido."}
            </p>
            <div className="modal-action">
                <button className="btn" onClick={onClose} type="button">
                    Cancelar
                </button>
                <button className="btn btn-primary" onClick={onConfirm} type="button">
                    {status === "active" ? "Cambiar a Borrador" : "Publicar curso"}
                </button>
            </div>
        </Modal>
    );
};
