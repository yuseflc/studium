'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { IconExclamationMark, IconEye, IconEyeOff } from '@tabler/icons-react';
// Componente SVG de Google optimizado para accesibilidad y bundle
function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...props}>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}
import Link from 'next/link'; // Navegación interna sin recargar la página


export default function LoginForm() {
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
        email,
        password: password,
        redirect: false,
      });
      if (result?.error) {
        setError(result.error ?? 'Usuario o contraseña incorrectos. Inténtalo de nuevo.');
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
              <div className="alert alert-error alert-soft py-2 px-2 text-s rounded-lg shadow-sm flex flex-col items-center gap-1 w-full">
                {/* <IconExclamationMark stroke={2} /> */}
                <span>{error}</span>
              </div>
            )}

            {/* Campo Email */}
            <div className="form-control space-y-2">
              <label htmlFor="login-email" className="label">
                <span className="label-text text-base-content/70">Email</span>
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="tu@ejemplo.com"
                className="input input-bordered h-10 w-full bg-base-100 border-base-300 text-base-content focus:outline-none focus:border-primary transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Campo Contraseña */}
            <div className="form-control space-y-2">
              <label className="label">
                <span className="label-text text-base-content/70">Contraseña</span>
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="input input-bordered h-10 w-full pr-12 bg-base-100 border-base-300 text-base-content focus:outline-none focus:border-primary transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-primary transition-colors"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <IconEye size={18} /> : <IconEyeOff size={18} />}
                </button>
              </div>
              <div className="flex justify-end mt-1">
                <Link href="/auth/forgot-password" className="text-[11px] link link-primary no-underline hover:underline">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </div>

            {/* Botón login */}
            <button
              type="submit"
              className="btn btn-primary btn-sm w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Cargando...' : 'Ingresar'}
            </button>

            {/* Separador visual */}
            <div className="divider text-[10px] text-base-content/40">O CONTINÚA CON</div>

            {/* Botón Google accesible y optimizado */}
            <button
              type="button"
              className="btn btn-outline btn-sm w-full gap-2 font-medium border-base-content/10 hover:bg-base-200 transition-colors focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:outline-none"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              aria-label="Iniciar sesión con Google"
            >
              <GoogleIcon style={{ marginRight: 4 }} />
              <span className="sr-only">Iniciar sesión con Google</span>
              <span aria-hidden="true" className="text-base-content">Google</span>
            </button>
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