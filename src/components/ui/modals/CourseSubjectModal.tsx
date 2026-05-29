'use client';

import React from 'react';
import { ModalForm, ModalFormProps } from './ModalForm';

interface CourseSubjectModalProps extends Omit<ModalFormProps, 'title' | 'children' | 'onConfirm' | 'confirmLabel'> {
    mode: 'create' | 'edit';
    titleValue: string;
    setTitleValue: (val: string) => void;
    descriptionValue: string;
    setDescriptionValue: (val: string) => void;
    onConfirm: (e: React.FormEvent) => void;
}

export const CourseSubjectModal = ({
    mode,
    titleValue,
    setTitleValue,
    descriptionValue,
    setDescriptionValue,
    ...formProps
}: CourseSubjectModalProps) => {
    return (
        <ModalForm
            {...formProps}
            title={mode === 'edit' ? "Editar materia" : "Crear materia"}
            confirmLabel="Guardar materia"
            className="max-w-3xl"
        >
            <label className="form-control w-full">
                <span className="label-text font-medium mb-2">Título</span>
                <input 
                    className="input input-bordered w-full" 
                    value={titleValue} 
                    onChange={(e) => setTitleValue(e.target.value)} 
                    placeholder="Ej: Matemáticas" 
                    required 
                />
            </label>
            <label className="form-control w-full">
                <span className="label-text font-medium mb-2">Descripción</span>
                <textarea 
                    className="textarea textarea-bordered h-28 w-full" 
                    value={descriptionValue} 
                    onChange={(e) => setDescriptionValue(e.target.value)} 
                    placeholder="Describe la materia" 
                />
            </label>
        </ModalForm>
    );
};
