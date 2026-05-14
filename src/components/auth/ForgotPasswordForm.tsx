'use client';

import { useState } from 'react';
import { IconMail, IconCheck, IconAlertCircle } from '@tabler/icons-react';
import Link from 'next/link';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);

  /**
   * Envía el correo para recuperar contraseña
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessageType('success');
        setMessage('¡Éxito! Revisa tu correo electrónico para restaurar tu contraseña.');
        setEmail('');
      } else {
        setMessageType('error');
        setMessage(data.message || 'No pudimos encontrar una cuenta con ese correo electrónico.');
      }
    } catch (err) {
      setMessageType('error');
      setMessage('Hubo un problema al enviar el enlace de recuperación. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Layout principal centrado y responsive
    <div className="mt-20 min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="card w-full max-w-sm bg-base-100 shadow-2xl border border-base-300 rounded-2xl">
        <div className="card-body p-5 space-y-2">
          {/* Cabecera centrada con logo */}
          <div className="text-center space-y-1">
            <h2 className="text-3xl font-bold italic text-base-content tracking-tighter leading-tight">
              STUDIUM<span className="text-primary">.</span>
            </h2>
            <p className="text-base-content/50 font-semibold uppercase text-[10px] tracking-widest">
              Recuperar contraseña
            </p>
          </div>

          {/* Título principal */}
          <div className="text-center space-y-2 mt-4">
            <h1 className="text-xl font-bold text-base-content">¿Has olvidado tu contraseña?</h1>
            <p className="text-sm text-base-content/60">
              Introduce tu correo electrónico y te enviaremos instrucciones para restablecerla.
            </p>
          </div>

          {/* Formulario de recuperación */}
          <form className="space-y-2 mt-4" onSubmit={handleSubmit}>
            {/* Mensaje de éxito o error */}
            {message && (
              <div
                className={`alert py-2 px-3 text-[12px] rounded-lg shadow-sm flex items-center gap-2 ${
                  messageType === 'success' ? 'alert-success' : 'alert-error'
                }`}
              >
                {messageType === 'success' ? (
                  <IconCheck size={16} className="flex-shrink-0" />
                ) : (
                  <IconAlertCircle size={16} className="flex-shrink-0" />
                )}
                <span>{message}</span>
              </div>
            )}

            {/* Campo Email con icono */}
            <div className="form-control space-y-2">
              <label htmlFor="forgot-email" className="label">
                <span className="label-text text-base-content/70">Correo electrónico</span>
              </label>
              <div className="relative">
                <input
                  id="forgot-email"
                  type="email"
                  autoComplete="email"
                  placeholder="tu@ejemplo.com"
                  className="input input-bordered h-10 w-full pl-10 pr-4 bg-base-100 border-base-300 text-base-content focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <IconMail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 pointer-events-none"
                />
              </div>
            </div>

            {/* Botón enviar enlace de recuperación */}
            <button
              type="submit"
              className="btn btn-primary btn-sm w-full mt-4"
              disabled={isLoading}
            >
              {isLoading ? 'Enviando...' : 'Enviar enlace de recuperación'}
            </button>
          </form>

          {/* Enlace de retorno a login */}
          <div className="text-center mt-6">
            <Link
              href="/auth/login"
              className="text-sm link link-primary no-underline hover:underline text-base-content/60 hover:text-primary transition-colors"
            >
              ← Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
