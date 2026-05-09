'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { IconEye, IconEyeOff, IconBrandGoogle } from '@tabler/icons-react';
import { useSession } from 'next-auth/react';

export default function LoginForm() {
  // HOOKS
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Router y callbackUrl para redirección después del login
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/mycourses';


  // Redirigir si ya hay una sesión activa
  const { data: session } = useSession();
  useEffect(() => {
    if (session) {
      router.push(callbackUrl);
    }
  }, [session, router, callbackUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        username: email,
        password: password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else if (result?.ok) {
        router.push(callbackUrl);
      }
    } catch (err) {
      setError('Error al iniciar sesión');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn('google', { redirect: true, callbackUrl });
    } catch (err) {
      setError('Error al iniciar sesión con Google');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="h-screen bg-base-100 flex items-center justify-center px-4">
      <div className="card w-full max-w-sm bg-base-200 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-6 text-base-content">
            Iniciar Sesión
          </h2>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Error Message */}
            {error && (
              <div className="alert alert-error">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-error-content">{error}</span>
                </div>
              </div>
            )}

            {/* Email */}
            <div className="form-control space-y-2">
              <label className="label">
                <span className="label-text text-base-content/70">Email</span>
              </label>
              <input
                type="email"
                placeholder="tu@ejemplo.com"
                className="input input-bordered h-12 w-full bg-base-100 border-base-300 text-base-content focus:outline-none focus:border-primary"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Contraseña */}
            <div className="form-control space-y-2">
              <label className="label">
                <span className="label-text text-base-content/70">Contraseña</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input input-bordered h-12 w-full bg-base-100 border-base-300 text-base-content pr-10 focus:outline-none focus:border-primary"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/60 hover:text-base-content cursor-pointer transition-colors"
                >
                  {showPassword ? (
                    <IconEye size={20} />
                  ) : (
                    <IconEyeOff size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* Olvidé contraseña */}
            <div className="flex justify-end">
              <a href="#" className="link link-primary text-sm">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {/* Botón login */}
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Cargando...' : 'Ingresar'}
            </button>

            {/* Botón Google */}
            <button
              type="button"
              className="btn btn-outline w-full gap-2"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <IconBrandGoogle size={20} />
              Ingresar con Google
            </button>
          </form>

          {/* Signup */}
          <div className="divider my-2"></div>
          <p className="text-center text-sm text-base-content/70">
            ¿No tienes cuenta?{' '}
            <a href="/signup" className="link link-primary">
              Regístrate
            </a>
          </p>
        </div>
      </div>
    </div>
  );
} 