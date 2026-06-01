/* Archivo: src\components\ui\modals\CourseUnitModal.tsx
    Descripción: Modal para crear o editar una unidad dentro de un curso. */

// Modal: CourseUnitModal — crear/editar unidades del curso (contenido y orden)
'use client';

import React from 'react';
import { ModalForm, ModalFormProps } from './ModalForm';

interface CourseUnitModalProps extends Omit<ModalFormProps, 'title' | 'children' | 'onConfirm' | 'confirmLabel'> {
    mode: 'create' | 'edit';
    titleValue: string;
    setTitleValue: (val: string) => void;
    contentValue: string;
    setContentValue: (val: string) => void;
    onConfirm: (e: React.FormEvent) => void;
}

export const CourseUnitModal = ({
    mode,
    titleValue,
    setTitleValue,
    contentValue,
    setContentValue,
    ...formProps
}: CourseUnitModalProps) => {
    return (
        <ModalForm
            {...formProps}
            title={mode === 'edit' ? "Editar unidad" : "Crear unidad"}
            confirmLabel="Guardar unidad"
            className="max-w-3xl"
        >
            <label className="form-control w-full">
                <span className="label-text font-medium mb-2">Título</span>
                <input 
                    className="input input-bordered w-full" 
                    value={titleValue} 
                    onChange={(e) => setTitleValue(e.target.value)} 
                    placeholder="Ej: Unidad 1" 
                    required 
                />
            </label>
            <label className="form-control w-full">
                <span className="label-text font-medium mb-2">Contenido</span>
                <textarea 
                    className="textarea textarea-bordered h-32 w-full" 
                    value={contentValue} 
                    onChange={(e) => setContentValue(e.target.value)} 
                    placeholder="Contenido de la unidad" 
                    required 
                />
            </label>
        </ModalForm>
    );
};
