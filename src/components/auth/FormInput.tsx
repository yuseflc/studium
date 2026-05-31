/* Archivo: src\components\auth\FormInput.tsx
  Descripción: Componente de input reutilizable con label, errores y estilos para formularios. */

"use client";
// Componente de formulario reutilizable (input) con soporte de errores visuales
import React from 'react';

interface FormInputProps {
  id: string;
  type?: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  disabled?: boolean;
  required?: boolean;
  autoComplete?: string;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  icon?: React.ReactNode;
  validatorHint?: string | React.ReactNode;
}

/**
 * Componente FormInput reutilizable con validación visual
 * Soporta errores específicos de campo y hints de validación
 */
export function FormInput({
  id,
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  autoComplete,
  pattern,
  minLength,
  maxLength,
  icon,
  validatorHint,
}: FormInputProps) {
  const hasError = Boolean(error);

  return (
    <div className="form-control">
      {/* Label */}
      <label htmlFor={id} className="label py-1">
        <span className="label-text text-base-content/70">{label}</span>
      </label>

      {/* Input con validador visual */}
      <label className={`input input-bordered flex items-center gap-3 h-10 w-full bg-base-100 text-base-content focus-within:outline-none transition-all ${
        hasError
          ? 'input-error border-error focus-within:border-error'
          : 'border-base-300 focus-within:border-primary'
      } validator peer`}>
        {icon && (
          <svg
            className="h-[1em] opacity-50"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            {icon}
          </svg>
        )}
        <input
          id={id}
          type={type}
          className="grow bg-transparent focus:outline-none"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          pattern={pattern}
          minLength={minLength}
          maxLength={maxLength}
        />
      </label>

      {/* Error message */}
      {error && (
        <span className="text-error text-xs font-medium mt-1 block">{error}</span>
      )}

      {/* Validator hint (oculto por defecto, visible solo con focus, no ocupa espacio inactivo) */}
      {validatorHint && !error && (
        <div className="hidden peer-focus-within:block mt-1">
          <p className="text-xs text-base-content/60 leading-tight">
            {validatorHint}
          </p>
        </div>
      )}
    </div>
  );
}
