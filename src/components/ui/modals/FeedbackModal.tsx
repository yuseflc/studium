/* Archivo: src\components\ui\modals\FeedbackModal.tsx
    Descripción: Modal de feedback usado por profesorado para dejar comentarios visibles al alumno. */

"use client";
// Modal para ver/añadir feedback a una entrega; usable por profesor y visible para estudiante
import React, { useState, useEffect } from 'react';
import { ModalForm, ModalFormProps } from './ModalForm';
import { MessageSquare } from 'lucide-react';

interface FeedbackModalProps extends Omit<ModalFormProps, 'title' | 'children' | 'onConfirm' | 'confirmLabel'> {
    taskTitle: string;
    studentName: string;
    initialGrade: string;
    initialFeedback: string;
    onSubmit: (grade: string, feedback: string) => Promise<boolean>;
    isLoading?: boolean;
}

export const FeedbackModal = ({
    taskTitle,
    studentName,
    initialGrade,
    initialFeedback,
    onSubmit,
    isLoading = false,
    ...formProps
}: FeedbackModalProps) => {
    const [grade, setGrade] = useState(initialGrade);
    const [feedback, setFeedback] = useState(initialFeedback);
    const [localLoading, setLocalLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setGrade(initialGrade);
        setFeedback(initialFeedback);
        setError(null);
    }, [initialGrade, initialFeedback]);

    const handleGradeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value === '') { setGrade(''); return; }
        if (!/^\d*\.?\d{0,2}$/.test(value)) return;
        const num = parseFloat(value);
        if (!isNaN(num) && (num < 0 || num > 10)) return;
        setGrade(value);
    };

    const handleConfirm = async (e: React.FormEvent) => {
        e.preventDefault();
        if (grade !== '') {
            const num = parseFloat(grade);
            if (isNaN(num) || num < 0 || num > 10) {
                setError('La nota debe ser un número entre 0 y 10.');
                return;
            }
        }
        setLocalLoading(true);
        setError(null);
        try {
            const success = await onSubmit(grade, feedback);
            if (!success) setError('No se pudo guardar. Intenta de nuevo.');
        } catch {
            setError('Ocurrió un error al guardar.');
        } finally {
            setLocalLoading(false);
        }
    };

    const gradeNum = parseFloat(grade);
    const gradeColor = grade === '' ? '' : gradeNum >= 5 ? 'text-success' : 'text-error';

    return (
        <ModalForm
            {...formProps}
            title="Calificar al estudiante"
            confirmLabel="Guardar"
            onConfirm={handleConfirm}
            isLoading={localLoading || isLoading}
            error={error}
            className="max-w-2xl"
        >
            <div className="space-y-5">
                {/* Contexto */}
                <div className="bg-base-200/50 rounded-lg p-4 border border-base-300">
                    <div className="flex items-start gap-3">
                        <MessageSquare size={18} className="text-primary flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-base-content">{taskTitle}</p>
                            <p className="text-xs text-base-content/60 mt-1">
                                Estudiante: <span className="font-medium">{studentName}</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Nota */}
                <label className="form-control w-full">
                    <span className="label-text font-medium mb-2 text-base dark:text-warning">Nota</span>
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            inputMode="decimal"
                            placeholder="0 – 10"
                            value={grade}
                            onChange={handleGradeChange}
                            className={`input input-bordered w-28 text-center font-mono text-xl font-bold focus:border-warning focus:outline-none transition-all ${gradeColor}`}
                        />
                        <span className="text-base-content/40 text-sm">/ 10</span>
                    </div>
                    <span className="label-text-alt text-xs mt-1 text-base-content/50">
                        Número entre 0 y 10 con hasta 2 decimales. Deja vacío para no calificar.
                    </span>
                </label>

                {/* Feedback */}
                <label className="form-control w-full">
                    <span className="label-text font-medium mb-2 text-base dark:text-warning flex items-center gap-2">
                        Comentario de Feedback
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Opcional</span>
                    </span>
                    <textarea
                        className="textarea textarea-bordered min-h-[140px] w-full resize-none focus:border-warning focus:outline-none transition-all"
                        placeholder="Escribe un comentario constructivo sobre el trabajo del estudiante."
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        maxLength={1000}
                    />
                    <span className="label-text-alt text-xs mt-1 text-base-content/50">
                        {feedback.length}/1000 caracteres
                    </span>
                </label>
            </div>
        </ModalForm>
    );
};
