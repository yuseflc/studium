/* Archivo: src\components\ui\modals\CourseTransferModal.tsx
    Descripción: Modal para transferir la propiedad de un curso a otro profesor. */

// Modal: CourseTransferModal — transferir propiedad del curso a otro usuario
'use client';

import React from 'react';
import { Modal } from './Modal';

interface CourseTransferModalProps {
    onClose: () => void;
    onConfirm: () => void;
    transferEmail: string;
    setTransferEmail: (email: string) => void;
}

export const CourseTransferModal = ({
    onClose,
    onConfirm,
    transferEmail,
    setTransferEmail,
}: CourseTransferModalProps) => {
    return (
        <Modal id="course-transfer-modal" onClose={onClose} isOpen={true} className="backdrop-blur-md">
            <h3 className="font-bold text-lg">Transferir propiedad</h3>
            <p className="py-2">Ingresa el email del nuevo propietario:</p>
            <input
                type="email"
                placeholder="email@ejemplo.com"
                value={transferEmail}
                onChange={(e) => setTransferEmail(e.target.value)}
                className="input input-bordered w-full mt-2"
            />
            <p className="text-sm text-base-content/60 mt-2">
                Esta acción es irreversible. El nuevo propietario recibirá una notificación.
            </p>
            <div className="modal-action">
                <button className="btn" onClick={onClose} type="button">
                    Cancelar
                </button>
                <button 
                    className="btn btn-primary" 
                    onClick={onConfirm} 
                    disabled={!transferEmail} 
                    type="button"
                >
                    Transferir
                </button>
            </div>
        </Modal>
    );
};
