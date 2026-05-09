'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { IconEye, IconEyeOff } from '@tabler/icons-react';
// Componente SVG de Google optimizado para accesibilidad y bundle
function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...props}>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}
import Link from 'next/link'; // Mejora navegación

/**
 * Formulario de login para Studium
 * - Accesible y optimizado según Vercel React Best Practices
 * - Sin lógica inline, sin componentes anidados
 * - Comentarios explicativos en cada bloque
 */
export default function LoginForm() {
  // Estado para los campos del formulario y control de UI
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Hooks de navegación y sesión
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/mycourses';
  const { data: session, status } = useSession();

  // Redirección automática si el usuario ya está autenticado
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

  return (
    // Layout principal centrado y responsivo
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="card w-full max-w-md bg-base-100 shadow-2xl border border-base-300">
        <div className="card-body p-8">
          {/* Cabecera centrada */}
          <div className="flex flex-col items-center mb-6">
            <h2 className="card-title text-3xl font-bold italic">
              STUDIUM<span className="text-primary">.</span>
            </h2>
            <p className="text-base-content/50 font-semibold uppercase text-xs mt-2 tracking-widest">Sign In</p>
          </div>

          {/* Formulario de login */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Mensaje de error */}
            {error && (
              <div className="alert alert-error py-2 shadow-sm text-sm">
                <span>{error}</span>
              </div>
            )}

            {/* Campo Mail */}
            <div className="form-control w-full">
              <label className="label py-1 mb-1">
                <span className="label-text font-medium text-base-content/70">Mail</span>
              </label>
              <input
                name="email"
                type="email"
                autoComplete="email"
                placeholder="nombre@ejemplo.com"
                className="input input-bordered w-full focus:ring-0 focus:border-none transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Campo Contraseña */}
            <div className="form-control w-full">
              <label className="label py-0 mb-1">
                <span className="label-text font-medium text-base-content/70">Contraseña</span>
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="input input-bordered w-full pr-12 focus:ring-0 focus:border-none transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-primary transition-colors"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <IconEye size={20} /> : <IconEyeOff size={20} />}
                </button>
              </div>
              <div className="flex justify-end mt-1">
                <Link href="#" className="text-xs link link-primary no-underline hover:underline">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </div>

            {/* Botón de login */}
            <button
              type="submit"
              className={`btn btn-primary w-full shadow-lg shadow-primary/20 ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {!isLoading && 'Ingresar'}
            </button>

            {/* Separador visual */}
            <div className="divider text-xs text-base-content/40">O CONTINÚA CON</div>

            {/* Botón Google accesible y optimizado */}
            <button
              type="button"
              className="btn btn-outline w-full gap-3 font-medium border-base-content/10 hover:bg-base-200 transition-colors focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:outline-none"
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