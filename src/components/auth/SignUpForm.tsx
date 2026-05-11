'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { IconEye, IconEyeOff } from '@tabler/icons-react';
import Link from 'next/link';

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...props}>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

export default function SignUpForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Hooks para navegación, estado de sesión y callback de redirección.
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/mycourses';
  // callbackUrl permite volver a la página de destino si viene de una ruta protegida.
  const { status } = useSession();

  // Redirige automáticamente si la sesión ya está activa.
  useEffect(() => {
    if (status === 'authenticated') router.push(callbackUrl);
  }, [status, router, callbackUrl]);

  // Envía los datos de registro al backend y luego inicia sesión con las credenciales.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error');
      const result = await signIn('credentials', { username: email, password, redirect: false });
      if (result?.ok) router.push(callbackUrl);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-25 card w-full max-w-sm bg-base-100 shadow-xl border border-base-300 rounded-2xl">
      <div className="card-body p-6 space-y-3">
        <div className="text-center space-y-1">
          <h2 className="text-3xl font-black italic text-base-content tracking-tighter leading-tight">
            STUDIUM<span className="text-primary">.</span>
          </h2>
          <p className="text-base-content/50 font-bold uppercase text-[10px] tracking-[0.2em]">Crea tu cuenta</p>
        </div>

        <form className="space-y-2" onSubmit={handleSubmit}>
          {error && <div className="alert alert-error py-2 px-2 text-[11px] rounded-lg"><span>{error}</span></div>}

          <div className="form-control space-y-2">
            <label htmlFor="signup-name" className="label">
              <span className="label-text text-base-content/70">Nombre completo</span>
            </label>
            <input
              id="signup-name"
              type="text"
              autoComplete="name"
              placeholder="Tu nombre"
              className="input input-bordered h-10 w-full bg-base-100 border-base-300 text-base-content focus:outline-none focus:border-primary transition-all"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-control space-y-2">
            <label htmlFor="signup-email" className="label">
              <span className="label-text text-base-content/70">Email</span>
            </label>
            <input
              id="signup-email"
              type="email"
              autoComplete="email"
              placeholder="tu@ejemplo.com"
              className="input input-bordered h-12 w-full bg-base-100 border-base-300 text-base-content focus:outline-none focus:border-primary transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-control space-y-2">
            <label htmlFor="signup-password" className="label">
              <span className="label-text text-base-content/70">Contraseña</span>
            </label>
            <div className="relative">
              <input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
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
          </div>

          <div className="form-control space-y-2">
            <label htmlFor="signup-password" className="label">
              <span className="label-text text-base-content/70">Repetir contraseña</span>
            </label>
            <div className="relative">
              <input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
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
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-sm w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Cargando...' : 'Registrarse'}
          </button>

          <div className="divider text-[10px] text-base-content/20 font-bold uppercase my-1">O</div>

          {/* Botón de login con Google */}
          <button type="button" className="btn btn-outline btn-sm w-full gap-2 border-base-300 font-bold text-xs" onClick={() => signIn('google', { callbackUrl })}>
            <GoogleIcon />
            <span className="text-base-content/80">Google</span>
          </button>
        </form>

        <div className="text-center pt-1">
          <p className="text-xs text-base-content/50">
            ¿Ya tienes cuenta? <Link href="/auth/login" className="text-primary font-bold hover:underline transition-all">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}