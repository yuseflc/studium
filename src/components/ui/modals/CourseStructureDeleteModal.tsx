'use client';

import React from 'react';
import { Modal } from './Modal';
import HoldConfirmButton from '../HoldConfirmButton';

interface CourseStructureDeleteModalProps {
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    kind: 'subject' | 'unit' | 'resource' | 'task' | string;
    isLoading?: boolean;
    error?: string | null;
}

export const CourseStructureDeleteModal = ({
    onClose,
    onConfirm,
    title,
    kind,
    isLoading,
    error,
}: CourseStructureDeleteModalProps) => {
    return (
        <Modal id="course-structure-delete-modal" onClose={onClose} isOpen={true} className="border border-error/20">
            <h3 className="font-bold text-lg text-error">
                Eliminar {kind === "subject" ? "materia" : kind === "unit" ? "unidad" : kind === "resource" ? "recurso" : "tarea"}
            </h3>
            <p className="py-4">
                Vas a eliminar <span className="font-semibold">{title}</span>. Esta acción no se puede deshacer.
            </p>
            {error && (
                <div className="alert alert-error mb-4 text-sm">
                    <span>{error}</span>
                </div>
            )}
            <div className="modal-action">
                <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={onClose}
                    disabled={isLoading}
                >
                    Cancelar
                </button>
                <HoldConfirmButton
                    className="btn btn-error text-white"
                    onConfirm={onConfirm}
                    disabled={isLoading}
                >
                    {isLoading ? "Eliminando..." : "Eliminar"}
                </HoldConfirmButton>
            </div>
        </Modal>
    );
};
