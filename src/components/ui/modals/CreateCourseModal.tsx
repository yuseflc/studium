'use client';

import React from 'react';
import { ModalForm, ModalFormProps } from './ModalForm';
import CoursePatternPicker from '@/components/ui/CoursePatternPicker';

interface CreateCourseModalUIProps extends Omit<ModalFormProps, 'title' | 'children' | 'onConfirm' | 'confirmLabel'> {
    titleValue: string;
    setTitleValue: (val: string) => void;
    descriptionValue: string;
    setDescriptionValue: (val: string) => void;
    // ID del patrón de portada seleccionado (ver coursePatterns.ts)
    coverImageValue: string;
    setCoverImageValue: (val: string) => void;
    onConfirm: (e: React.FormEvent) => void;
    success?: boolean;
    successMessage?: string;
    successAction?: {
        label: string;
        onClick: () => void;
        icon?: React.ReactNode;
    };
}

export const CreateCourseModalUI = ({
    titleValue,
    setTitleValue,
    descriptionValue,
    setDescriptionValue,
    coverImageValue,
    setCoverImageValue,
    onConfirm,
    ...props
}: CreateCourseModalUIProps) => {
    return (
        <ModalForm
            {...props}
            title="Crear curso"
            confirmLabel="Crear curso"
            onConfirm={onConfirm}
            className="max-w-3xl"
        >
            <div className="space-y-6">
                <label className="form-control w-full">
                    <span className="label-text font-medium mb-2 text-base dark:text-warning">Nombre de la clase</span>
                    <input
                        type="text"
                        name="title"
                        className="input input-bordered w-full input-md focus:border-warning focus:outline-none transition-all"
                        placeholder="Ej: Matemáticas Avanzadas"
                        value={titleValue}
                        onChange={(e) => setTitleValue(e.target.value)}
                        required
                    />
                </label>

                <label className="form-control w-full">
                    <span className="label-text font-medium mb-2 text-base dark:text-warning">Sección / Descripción</span>
                    <textarea
                        name="description"
                        className="textarea textarea-bordered h-32 w-full text-base focus:border-warning focus:outline-none transition-all resize-none"
                        placeholder="Breve descripción o sección"
                        value={descriptionValue}
                        onChange={(e) => setDescriptionValue(e.target.value)}
                        required
                    />
                </label>

                <CoursePatternPicker
                    selectedId={coverImageValue}
                    onChange={setCoverImageValue}
                />
            </div>
        </ModalForm>
    );
};
