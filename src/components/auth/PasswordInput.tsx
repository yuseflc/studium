'use client';

import React from 'react';
import { IconEye, IconEyeOff } from '@tabler/icons-react';

interface PasswordInputProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  showPassword: boolean;
  onTogglePassword: () => void;
  error?: string | null;
  disabled?: boolean;
  required?: boolean;
  minLength?: number;
  icon?: React.ReactNode;
  validatorHint?: string | React.ReactNode;
}

/**
 * Componente PasswordInput con toggle show/hide
 * Incluye validación visual y hints
 */
export function PasswordInput({
  id,
  label,
  placeholder,
  value,
  onChange,
  showPassword,
  onTogglePassword,
  error,
  disabled = false,
  required = false,
  minLength = 6,
  icon,
  validatorHint,
}: PasswordInputProps) {
  const hasError = Boolean(error);

  return (
    <div className="form-control">
      {/* Label */}
      <label htmlFor={id} className="label py-1">
        <span className="label-text text-base-content/70">{label}</span>
      </label>

      {/* Input con validador visual y botón toggle */}
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
          type={showPassword ? 'text' : 'password'}
          className="grow bg-transparent focus:outline-none"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          required={required}
          autoComplete="new-password"
          minLength={minLength}
        />
        <button
          type="button"
          onClick={onTogglePassword}
          className="text-base-content/40 hover:text-primary transition-colors"
          aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          disabled={disabled}
        >
          {showPassword ? <IconEye size={18} /> : <IconEyeOff size={18} />}
        </button>
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
