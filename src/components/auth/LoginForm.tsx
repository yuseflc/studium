'use client';

import { useState } from 'react';
import { IconEye, IconEyeOff, IconBrandGoogle } from '@tabler/icons-react';
export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);


  return (
    <div className="h-screen bg-base-100 flex items-center justify-center px-4">
      <div className="card w-full max-w-sm bg-base-200 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-6 text-base-content">
            Iniciar Sesión
          </h2>

          <form className="space-y-4">
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
            <button type="submit" className="btn btn-primary w-full">
              Ingresar
            </button>

            {/* Botón Google */}
            <button type="button" className="btn btn-outline w-full gap-2">
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