'use client';

import React from 'react';
import { Modal, ModalProps } from './Modal';
import { IconLoader } from '@tabler/icons-react';

interface JoinCourseModalUIProps extends Omit<ModalProps, 'children'> {
    code: string;
    setCode: (val: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    isLoading?: boolean;
    error?: string;
    success?: string;
}

export const JoinCourseModalUI = ({
    code,
    setCode,
    onSubmit,
    isLoading,
    error,
    success,
    ...props
}: JoinCourseModalUIProps) => {
    return (
        <Modal {...props} className="max-w-sm">
            <h3 className="font-bold text-2xl mb-2 text-center">Unirse a un curso</h3>
            <p className="text-base-content/60 text-center mb-6">
                Introduce el código de 6 caracteres que te proporcionó tu profesor.
            </p>

            <form onSubmit={onSubmit} className="space-y-4">
                <div className="form-control">
                    <input
                        type="text"
                        placeholder="CÓDIGO"
                        className={`input input-bordered input-lg text-center font-mono text-2xl tracking-[0.5em] uppercase transition-all ${
                            error ? 'input-error' : code.length === 6 ? 'input-success' : ''
                        }`}
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
                        disabled={isLoading || !!success}
                        autoFocus
                    />
                    {error && (
                        <label className="label">
                            <span className="label-text-alt text-error font-medium">{error}</span>
                        </label>
                    )}
                </div>

                {success && (
                    <div className="alert alert-success shadow-sm py-2">
                        <span className="text-sm font-medium">{success}</span>
                    </div>
                )}

                <button
                    type="submit"
                    className={`btn btn-primary btn-block gap-2 ${isLoading ? 'loading' : ''}`}
                    disabled={isLoading || code.length !== 6 || !!success}
                >
                    {isLoading ? (
                        <IconLoader className="animate-spin" size={20} />
                    ) : (
                        'Unirse al curso'
                    )}
                </button>
                
                <p className="text-[10px] text-center text-base-content/40 uppercase tracking-widest mt-4">
                    Studium &bull; Platform
                </p>
            </form>
        </Modal>
    );
};
