/* Archivo: src\app\auth\login\page.tsx
  Descripción: Página de acceso (login) que incluye el formulario y enlaces auxiliares. */

import { Suspense } from 'react';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando...</div>}>
      <LoginForm />
    </Suspense>
  );
}