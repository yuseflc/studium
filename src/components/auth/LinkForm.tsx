'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { IconEye, IconEyeOff } from '@tabler/icons-react';
// Componente SVG de Google optimizado para accesibilidad y bundle

import Link from 'next/link'; // Navegación interna sin recargar la página


export default function LinkForm() {
  // Campos del formulario y estados de interacción
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Hooks de navegación y sesión
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/mycourses';
  // callbackUrl permite regresar al destino original luego de iniciar sesión.
  const { status } = useSession();

  // Redirecciona a la ruta de destino tras iniciar sesión o si ya está autenticado.
  useEffect(() => {
    if (status === 'authenticated') {
      router.push(callbackUrl);
    }
  }, [status, router, callbackUrl]);

  /**
   * Envía el formulario de login usando NextAuth
   * - Maneja errores y loading
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const result = await signIn('credentials', {
        username: email,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError('Credenciales incorrectas. Inténtalo de nuevo.');
      } else if (result?.ok) {
        router.push(callbackUrl);
      }
    } catch (err) {
      setError('Hubo un problema con la conexión.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Inicia sesión con Google
   */
  const handleGoogleSignIn = () => {
    setIsLoading(true);
    signIn('google', { callbackUrl });
  };

  // Renderiza el formulario de inicio de sesión completo con controles, estado y opciones sociales.
  return (
    // Layout principal centrado y responsive
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="card w-full max-w-sm bg-base-100 shadow-2xl border border-base-300 rounded-2xl">
        <div className="card-body p-5 space-y-2">
          {/* Cabecera centrada */}
          <div className="text-center space-y-1">
            <h2 className="text-3xl font-bold italic text-base-content tracking-tighter leading-tight">
              STUDIUM<span className="text-primary">.</span>
            </h2>
            <p className="text-base-content/50 font-semibold uppercase text-[10px] tracking-widest">Iniciar sesión</p>
          </div>

          {/* Formulario de login */}
          <form className="space-y-2" onSubmit={handleSubmit}>
            {/* Mensaje de error */}
            {error && (
              <div className="alert alert-error py-2 px-2 text-[11px] rounded-lg shadow-sm">
                <span>{error}</span>
              </div>
            )}


            {/* Campo Contraseña */}
            <div className="form-control space-y-2">
              <label className="label">
                <span className="label-text text-base-content/70">Validación</span>
                <span className="label-text text-base-content/70 p-6">No tiene cuenta de Studium</span>
              </label>
              <div className="relative">
  
              </div>
              <div className="flex justify-end mt-1">
                <Link href="#" className="text-[11px] link link-primary no-underline hover:underline">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </div>

           
            
          </form>

          {/* CTA de registro */}
          <div className="mt-8 text-center">
            <p className="text-sm text-base-content/60">
              ¿Eres nuevo aquí?{' '}
              <Link href="/auth/signup" className="link link-primary font-semibold no-underline hover:underline">
                Regístrate
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}