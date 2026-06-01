/* Archivo: src\components\ui\modals\CourseTaskModal.tsx
    Descripción: Modal para crear o editar una tarea dentro del contexto del curso. */

// Modal: CourseTaskModal — crear/editar tareas específicas del curso
'use client';

import React from 'react';
import { ModalForm, ModalFormProps } from './ModalForm';

interface CourseTaskModalProps extends Omit<ModalFormProps, 'title' | 'children' | 'onConfirm' | 'confirmLabel'> {
    mode: 'create' | 'edit';
    taskType: 'assignment' | 'quiz' | 'forum' | 'project';
    titleValue: string;
    setTitleValue: (val: string) => void;
    descriptionValue: string;
    setDescriptionValue: (val: string) => void;
    maxPoints: string | number;
    setMaxPoints: (val: string) => void;
    dueDate: string;
    setDueDate: (val: string) => void;
    active: boolean;
    setActive: (val: boolean) => void;
    onConfirm: (e: React.FormEvent) => void;
}

export const CourseTaskModal = ({
    mode,
    taskType,
    titleValue,
    setTitleValue,
    descriptionValue,
    setDescriptionValue,
    maxPoints,
    setMaxPoints,
    dueDate,
    setDueDate,
    active,
    setActive,
    ...formProps
}: CourseTaskModalProps) => {
    const isQuiz = taskType === 'quiz';
    const title = mode === 'edit' 
        ? (isQuiz ? "Editar examen" : "Editar tarea") 
        : (isQuiz ? "Crear examen" : "Crear tarea");

    return (
        <ModalForm
            {...formProps}
            title={title}
            confirmLabel="Guardar"
            className="max-w-3xl"
        >
            <label className="form-control w-full">
                <span className="label-text font-medium mb-2">Título</span>
                <input 
                    className="input input-bordered w-full" 
                    value={titleValue} 
                    onChange={(e) => setTitleValue(e.target.value)} 
                    placeholder="Ej: Entrega tema 1" 
                    required 
                />
            </label>
            <label className="form-control w-full">
                <span className="label-text font-medium mb-2">Descripción</span>
                <textarea 
                    className="textarea textarea-bordered h-28 w-full" 
                    value={descriptionValue} 
                    onChange={(e) => setDescriptionValue(e.target.value)} 
                    placeholder="Explica la actividad" 
                    required 
                />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
                <label className="form-control w-full">
                    <span className="label-text font-medium mb-2">Tipo</span>
                    <select
                        className="select select-bordered w-full"
                        value={taskType}
                        disabled={true}
                    >
                        <option value="assignment">Tarea</option>
                        <option value="quiz">Examen</option>
                        <option value="forum">Foro</option>
                        <option value="project">Proyecto</option>
                    </select>
                </label>
                <label className="form-control w-full">
                    <span className="label-text font-medium mb-2">Puntos máximos</span>
                    <input 
                        className="input input-bordered w-full" 
                        type="number" 
                        min="0" 
                        value={maxPoints} 
                        onChange={(e) => setMaxPoints(e.target.value)} 
                    />
                </label>
            </div>
            <label className="form-control w-full">
                <span className="label-text font-medium mb-2">Fecha de entrega</span>
                <input 
                    className="input input-bordered w-full" 
                    type="datetime-local" 
                    value={dueDate} 
                    onChange={(e) => setDueDate(e.target.value)} 
                    required 
                />
            </label>
            <label className="label cursor-pointer justify-start gap-3">
                <input 
                    type="checkbox" 
                    className="toggle toggle-primary" 
                    checked={active} 
                    onChange={(e) => setActive(e.target.checked)} 
                />
                <span className="label-text font-medium">Activa</span>
            </label>
        </ModalForm>
    );
};
