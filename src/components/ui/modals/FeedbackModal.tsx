'use client';

import React, { useState, useEffect } from 'react';
import { ModalForm, ModalFormProps } from './ModalForm';
import { MessageSquare } from 'lucide-react';

interface FeedbackModalProps extends Omit<ModalFormProps, 'title' | 'children' | 'onConfirm' | 'confirmLabel'> {
    taskTitle: string;
    studentName: string;
    initialFeedback: string;
    onSubmit: (feedback: string) => Promise<boolean>;
    isLoading?: boolean;
}

export const FeedbackModal = ({
    taskTitle,
    studentName,
    initialFeedback,
    onSubmit,
    isLoading = false,
    ...formProps
}: FeedbackModalProps) => {
    const [feedback, setFeedback] = useState(initialFeedback);
    const [localLoading, setLocalLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setFeedback(initialFeedback);
        setError(null);
    }, [initialFeedback]);

    const handleConfirm = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalLoading(true);
        setError(null);

        try {
            const success = await onSubmit(feedback);
            if (!success) {
                setError('No se pudo guardar el feedback. Intenta de nuevo.');
            }
        } catch (err) {
            console.error('Error submitting feedback:', err);
            setError('Ocurrió un error al guardar el feedback.');
        } finally {
            setLocalLoading(false);
        }
    };

    return (
        <ModalForm
            {...formProps}
            title="Añadir Feedback"
            confirmLabel="Guardar Feedback"
            onConfirm={handleConfirm}
            isLoading={localLoading || isLoading}
            error={error}
            className="max-w-2xl"
        >
            <div className="space-y-4">
                {/* Información de contexto */}
                <div className="bg-base-200/50 rounded-lg p-4 border border-base-300">
                    <div className="flex items-start gap-3">
                        <MessageSquare size={18} className="text-primary flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-base-content">
                                {taskTitle}
                            </p>
                            <p className="text-xs text-base-content/60 mt-1">
                                Estudiante: <span className="font-medium">{studentName}</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Campo de Feedback */}
                <label className="form-control w-full">
                    <span className="label-text font-semibold mb-2 flex items-center gap-2">
                        <span>Comentario de Feedback</span>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                            Opcional
                        </span>
                    </span>
                    <textarea
                        className="textarea textarea-bordered focus:textarea-primary min-h-[150px] w-full resize-none"
                        placeholder="Escribe un comentario constructivo sobre el trabajo del estudiante. Esto será visible para el estudiante."
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        maxLength={1000}
                    />
                    <div className="label">
                        <span className="label-text-alt text-base-content/50">
                            {feedback.length}/1000 caracteres
                        </span>
                    </div>
                </label>


            </div>
        </ModalForm>
    );
};
