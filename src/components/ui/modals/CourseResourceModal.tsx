'use client';

import React from 'react';
import { ModalForm, ModalFormProps } from './ModalForm';

interface CourseResourceModalProps extends Omit<ModalFormProps, 'title' | 'children' | 'onConfirm' | 'confirmLabel'> {
    mode: 'create' | 'edit';
    titleValue: string;
    setTitleValue: (val: string) => void;
    resourceType: 'link' | 'file' | 'text';
    setResourceType: (val: 'link' | 'file' | 'text') => void;
    resourceUrl: string;
    setResourceUrl: (val: string) => void;
    descriptionValue: string;
    setDescriptionValue: (val: string) => void;
    onConfirm: (e: React.FormEvent) => void;
}

export const CourseResourceModal = ({
    mode,
    titleValue,
    setTitleValue,
    resourceType,
    setResourceType,
    resourceUrl,
    setResourceUrl,
    descriptionValue,
    setDescriptionValue,
    ...formProps
}: CourseResourceModalProps) => {
    return (
        <ModalForm
            {...formProps}
            title={mode === 'edit' ? "Editar recurso" : "Crear recurso"}
            confirmLabel="Guardar recurso"
            className="max-w-3xl"
        >
            <label className="form-control w-full">
                <span className="label-text font-medium mb-2">Título</span>
                <input 
                    className="input input-bordered w-full" 
                    value={titleValue} 
                    onChange={(e) => setTitleValue(e.target.value)} 
                    placeholder="Ej: PDF del tema" 
                    required 
                />
            </label>
            <label className="form-control w-full">
                <span className="label-text font-medium mb-2">Tipo</span>
                <select 
                    className="select select-bordered w-full" 
                    value={resourceType} 
                    onChange={(e) => setResourceType(e.target.value as any)}
                >
                    <option value="file">Archivo</option>
                    <option value="link">Enlace</option>
                    <option value="text">Texto</option>
                </select>
            </label>
            {resourceType === "link" && (
                <label className="form-control w-full">
                    <span className="label-text font-medium mb-2">URL</span>
                    <input 
                        className="input input-bordered w-full" 
                        value={resourceUrl} 
                        onChange={(e) => setResourceUrl(e.target.value)} 
                        placeholder="https://..." 
                        required 
                    />
                </label>
            )}
            <label className="form-control w-full">
                <span className="label-text font-medium mb-2">Descripción</span>
                <textarea 
                    className="textarea textarea-bordered h-24 w-full" 
                    value={descriptionValue} 
                    onChange={(e) => setDescriptionValue(e.target.value)} 
                    placeholder="Descripción opcional" 
                />
            </label>
        </ModalForm>
    );
};
